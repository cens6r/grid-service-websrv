import { Express as IExpressApplication } from 'express-serve-static-core';
import { Router, json as JsonParser } from 'express';
import { urlencoded as FormParser } from 'body-parser';
import { Server as BaseLineServer } from 'http';
import Ssl, { Server as BaseLineSslServer } from 'https';
import SslV2 from 'spdy';
import { readFileSync, existsSync as FileOrDirectoryExists } from 'fs';
import { __baseDirName, __sslDirName } from 'Assemblies/Directories';
import { IConfigurationOptions } from 'Assemblies/Setup/Interfaces/IConfigurationOptions';
import { Walkers } from 'Assemblies/Setup/Walkers';
import { IRoutingOptions } from 'Assemblies/Setup/Interfaces/IRoutingOptions';
import { ISiteRouteSetupOptions } from 'Assemblies/Setup/Interfaces/ISiteRouteSetupOptions';
import { IStartupOptions } from 'Assemblies/Setup/Interfaces/IStartupOptions';
import { IRoutingController } from 'Assemblies/Setup/Interfaces/IRoutingController';
import { RoutingControllerDelegate } from 'Assemblies/Setup/Interfaces/RoutingControllerDelegate';
import { Logger } from 'Assemblies/Util/LoggingUtility';

export class SystemSDK {
    private static BaseRoutesPath: string = 'Routes';

    public static SetBaseRoutesPath(path: string): void {
        SystemSDK.BaseRoutesPath = path;
    }

    public static ConfigureServer(options: IConfigurationOptions): void {
        try {
            options.Application.disable('case sensitive routing');
            options.Application.enable('trust proxy');
            options.Application.disable('x-powered-by');
            options.Application.disable('strict routing');
            options.Application.disable('etag');
            options.Application.use(JsonParser({ strict: false }));
            options.Application.use(FormParser({ extended: true }));
            SystemSDK.UseExpressRouter(options.Application, options.RoutingOpts);
            if (options.AllowRoutes) {
                SystemSDK.MapRoutesInternal(options.Application, options.RouteConfiguration);
            }
        } catch (e) {
            Logger.Error(`Error occurred when configuring a site! Stack: %s`, e.stack);
        }
    }

    public static MetadataBuilder(application: IExpressApplication, routeDirectory: string, siteName: string) {
        return <IConfigurationOptions>(<unknown>{
            Application: application,
            UseRouting: true,
            RouteConfiguration: {
                RouteStorePath: `${__baseDirName}/Bin/${SystemSDK.BaseRoutesPath}/${routeDirectory}`,
                LogRouteSetup: true,
                SiteName: siteName,
            },
            AllowRoutes: !!routeDirectory,
        });
    }

    public static StartServer(options: IStartupOptions): [BaseLineServer, BaseLineSslServer] {
        try {
            options.SslPort = options.SslPort || 443;
            options.InsecurePort = options.InsecurePort || 80;
            let baselineSslServer: BaseLineSslServer;
            let baseLineServer: BaseLineServer;
            if (options.UseSsl) {
                const certPath = options.UseSslDirectoryName
                    ? `${__sslDirName}/${options.CertificateFileName}`
                    : options.CertificateFileName;

                const keyPath = options.UseSslDirectoryName
                    ? `${__sslDirName}/${options.CertificateKeyFileName}`
                    : options.CertificateKeyFileName;

                const rootCaPath = options.UseSslDirectoryName
                    ? `${__sslDirName}/${options.RootCertificateFileName}`
                    : options.RootCertificateFileName;
                baselineSslServer = (options.UseSslV2 ? SslV2 : Ssl)
                    .createServer(
                        {
                            cert: readFileSync(certPath, 'ascii'),
                            key: readFileSync(keyPath, 'ascii'),
                            ca: [readFileSync(rootCaPath, 'ascii')],
                            passphrase: options.CertificateKeyPassword,
                        },
                        options.Application,
                    )
                    .listen(options.SslPort, options.SiteName, () =>
                        Logger.Info(`BaseLineSslServer '%s' started on port %d.`, options.SiteName, options.SslPort),
                    );
            }
            if (options.UseInsecure)
                baseLineServer = options.Application.listen(options.InsecurePort, options.SiteName, () =>
                    Logger.Info(`BaseLineServer '%s' started on port %d.`, options.SiteName, options.InsecurePort),
                );
            return [baseLineServer, baselineSslServer];
        } catch (err) {
            throw new Error(err);
        }
    }

    private static MapRoutesInternal(application?: IExpressApplication, options?: ISiteRouteSetupOptions): void {
        const directory = (options !== undefined ? options.RouteStorePath : __baseDirName + '/Routing') || __baseDirName + '/Routing';
        if (!FileOrDirectoryExists(directory)) {
            Logger.Warn(
                `The directory '%s' for the site '%s' was not found, make sure you configured your directory correctly.`,
                directory,
                options.SiteName,
            );
            return;
        }
        const files = Walkers.WalkDirectory(directory);
        let count = 0;
        files.forEach((file) => {
            let route = file.split('\\').join('/');
            route = route.replace(directory, '');
            if (route.match(/.+\.js/)) {
                route = route.replace('.js', '');
                route = route.split('_P-').join(':');
                route = route.split('\\').join('/');
                let isMiddleware = false;
                if (route === '/__all') isMiddleware = true;
                if (route === '/__pageIndex') route = '/';
                route = route.toLowerCase();
                let map: IRoutingController;

                try {
                    map = require(file);
                } catch (error) {
                    return Logger.Error(
                        "An error occurred when requiring the file '%s' for the site '%s'. Stack: %s",
                        file,
                        options.SiteName,
                        error.stack,
                    );
                }
                let callback: RoutingControllerDelegate;
                let requestMethod: string;
                if (map) {
                    if (map.Callback) callback = map.Callback;
                    else return;
                    if (map.RequestMethod) requestMethod = map.RequestMethod.toLowerCase();
                    else return;
                    count++;
                    try {
                        if (requestMethod === 'get' && !isMiddleware) {
                            if (options.LogRouteSetup)
                                Logger.Debug(
                                    `Mapping 'GET' '%s' for site '%s'`,
                                    (options.SiteName ? 'https://' + options.SiteName : '') + route,
                                    options.SiteName,
                                );
                            application.get(route, callback);
                        } else if (requestMethod === 'head' && !isMiddleware) {
                            if (options.LogRouteSetup)
                                Logger.Debug(
                                    `Mapping 'HEAD' '%s' for site '%s'`,
                                    (options.SiteName ? 'https://' + options.SiteName : '') + route,
                                    options.SiteName,
                                );
                            application.head(route, callback);
                        } else if (requestMethod === 'post' && !isMiddleware) {
                            if (options.LogRouteSetup)
                                Logger.Debug(
                                    `Mapping 'POST' '%s' for site '%s'`,
                                    (options.SiteName ? 'https://' + options.SiteName : '') + route,
                                    options.SiteName,
                                );
                            application.post(route, callback);
                        } else if (requestMethod === 'put' && !isMiddleware) {
                            if (options.LogRouteSetup)
                                Logger.Debug(
                                    `Mapping 'PUT' '%s' for site '%s'`,
                                    (options.SiteName ? 'https://' + options.SiteName : '') + route,
                                    options.SiteName,
                                );
                            application.put(route, callback);
                        } else if (requestMethod === 'delete' && !isMiddleware) {
                            if (options.LogRouteSetup)
                                Logger.Debug(
                                    `Mapping 'DELETE' '%s' for site '%s'`,
                                    (options.SiteName ? 'https://' + options.SiteName : '') + route,
                                    options.SiteName,
                                );
                            application.delete(route, callback);
                        } else if (requestMethod === 'connect' && !isMiddleware) {
                            if (options.LogRouteSetup)
                                Logger.Debug(
                                    `Mapping 'CONNECT' '%s' for site '%s'`,
                                    (options.SiteName ? 'https://' + options.SiteName : '') + route,
                                    options.SiteName,
                                );
                            application.connect(route, callback);
                        } else if (requestMethod === 'options' && !isMiddleware) {
                            if (options.LogRouteSetup)
                                Logger.Debug(
                                    `Mapping 'OPTIONS' '%s' for site '%s'`,
                                    (options.SiteName ? 'https://' + options.SiteName : '') + route,
                                    options.SiteName,
                                );
                            application.options(route, callback);
                        } else if (requestMethod === 'trace' && !isMiddleware) {
                            if (options.LogRouteSetup)
                                Logger.Debug(
                                    `Mapping 'TRACE' '%s' for site '%s'`,
                                    (options.SiteName ? 'https://' + options.SiteName : '') + route,
                                    options.SiteName,
                                );
                            application.trace(route, callback);
                        } else if (requestMethod === 'patch' && !isMiddleware) {
                            if (options.LogRouteSetup)
                                Logger.Debug(
                                    `Mapping 'PATCH' '%s' for site '%s'`,
                                    (options.SiteName ? 'https://' + options.SiteName : '') + route,
                                    options.SiteName,
                                );
                            application.patch(route, callback);
                        } else if (requestMethod === 'all' && !isMiddleware) {
                            if (options.LogRouteSetup)
                                Logger.Debug(
                                    `Mapping 'ALL' '%s' for site '%s'`,
                                    (options.SiteName ? 'https://' + options.SiteName : '') + route,
                                    options.SiteName,
                                );
                            application.all(route, callback);
                        } else {
                            if (isMiddleware) {
                                Logger.Debug(`Mapping 'ALL ROUTE CATCHER' for the site '%s'`, options.SiteName);
                                application.use(callback);
                                return;
                            }
                            return Logger.Error(
                                "Error requesting the route '%s'. The method '%s' is not supported.",
                                options.SiteName,
                                requestMethod.toUpperCase(),
                            );
                        }
                    } catch (error) {
                        return Logger.Error(
                            "An error occurred while mapping the route '%s' for the site '%s'. Stack: %s",
                            route,
                            options.SiteName,
                            error.stack,
                        );
                    }
                } else {
                    return Logger.Warn("The route '%s' for the site '%s' had no default export.", file, options.SiteName);
                }
            }
        });
        Logger.Info(`The site '%s' has %d route(s)`, options.SiteName, count);
    }

    private static UseExpressRouter(app: IExpressApplication, opts?: IRoutingOptions): void {
        app.use(Router(opts));
    }
}

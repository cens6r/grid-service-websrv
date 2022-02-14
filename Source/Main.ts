/** TODO: Consul Service discovery for the listener Urls for BEDEV2 **/

import { ImportHandler } from './ImportHandler';
ImportHandler();

import Application from 'express';
import { LoggingHandler } from './Assemblies/Middleware/Logger';
import { StandardInHandler } from './StandardInHandler';
import { SystemSDK } from 'Assemblies/Setup/Lib/SystemSDK';
import { __baseDirName } from 'Assemblies/Directories';
import { FileSystemHelper } from 'Assemblies/Caching/FileSystem/FileSystemHelper';
import { DotENV } from 'Assemblies/Util/DotENV';
import { Urls } from 'Assemblies/UrlMappings';

DotENV.GlobalConfigure();

const sharedSettings = {
    UseSsl: true,
    UseInsecure: true,
    InsecurePort: 80,
    SslPort: 443,
    UseSslDirectoryName: true,
    CertificateFileName: 'mfdlabs-all-authority-grid-service-websrv.crt',
    CertificateKeyFileName: 'mfdlabs-all-authority-grid-service-websrv.key',
    CertificateKeyPassword: 'MPaunCfrH4GhDhdZKFLFpUeya3K3UHWfrNsZWCsyg3JEYHdQHhLvHxGzJpUVcQ8e',
    RootCertificateFileName: 'mfdlabs-root-ca-client-products-v1.crt',
};

(async () => {
    FileSystemHelper.ClearAllFileSystemCacheRepositories();

    const AvatarApiServer = Application();
    const ClientSettingsServer = Application();
    const EphemeralCountersServer = Application();
    const VersionCompatibilityServer = Application();
    const LatencyMeasurementsServer = Application();

    AvatarApiServer.use(LoggingHandler);
    LatencyMeasurementsServer.use(LoggingHandler, (_, response) => response.send('robloxup'));

    SystemSDK.SetBaseRoutesPath('Routes');

    SystemSDK.ConfigureServer(SystemSDK.MetadataBuilder(AvatarApiServer, 'Avatar', Urls.Avatar));
    SystemSDK.ConfigureServer(SystemSDK.MetadataBuilder(ClientSettingsServer, 'ClientSettings', Urls.ClientSettings));
    SystemSDK.ConfigureServer(SystemSDK.MetadataBuilder(EphemeralCountersServer, 'EphemeralCounters', Urls.EphemeralCounters));
    SystemSDK.ConfigureServer(SystemSDK.MetadataBuilder(VersionCompatibilityServer, 'VersionCompatibility', Urls.VersionCompatibility));

    // Avatar API
    SystemSDK.StartServer({
        Application: AvatarApiServer,
        SiteName: Urls.Avatar,
        ...sharedSettings,
    });

    // Client Settings API
    SystemSDK.StartServer({
        Application: ClientSettingsServer,
        SiteName: Urls.ClientSettings,
        ...sharedSettings,
    });

    // Ephemeral Counters Service
    SystemSDK.StartServer({
        Application: VersionCompatibilityServer,
        SiteName: Urls.VersionCompatibility,
        ...sharedSettings,
    });

    // Latency Measurements Service, used by the grid deployer in order to determine if the local HTTP server is Alive and is the WebSrv (it could be IIS)
    SystemSDK.StartServer({
        Application: LatencyMeasurementsServer,
        SiteName: Urls.LatencyMeasurements,
        UseSsl: false,
        UseInsecure: true,
    });

    // Ephmeral Counters Service, reports Google Analytics data
    SystemSDK.StartServer({
        Application: EphemeralCountersServer,
        SiteName: Urls.EphemeralCounters,
        ...sharedSettings,
    });
})();

StandardInHandler();

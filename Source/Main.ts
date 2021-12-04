import { ImportHandler } from './ImportHandler';
ImportHandler();

import Application from 'express';
import { LoggingHandler } from './Assemblies/Middleware/Logger';
import { StandardInHandler } from './StandardInHandler';
import { SystemSDK } from 'Assemblies/Setup/Lib/SystemSDK';
import { __baseDirName } from 'Assemblies/Directories';
import { FileSystemHelper } from 'Assemblies/Caching/FileSystem/FileSystemHelper';
import { DotENV } from 'Assemblies/Util/DotENV';

DotENV.GlobalConfigure();

const sharedSettings = {
    UseSsl: true,
    UseInsecure: true,
    InsecurePort: 80,
    SslPort: 443,
    UseSslDirectoryName: true,
    CertificateFileName: 'ST4.crt',
    CertificateKeyPassword: 'ST4_RBXLABS',
    RootCertificateFileName: 'rootCA.crt',
    CertificateKeyFileName: 'ST4.key',
};

(async () => {
    FileSystemHelper.ClearAllFileSystemCacheRepositories();

    const AvatarApiServer = Application();
    const ClientSettingsApiServer = Application();
    const EphemeralCountersServiceServer = Application();
    const VersionCompatibilityServiceServer = Application();
    const LatencyMeasurementsInternalServiceServer = Application();

    EphemeralCountersServiceServer.use(LoggingHandler);
    VersionCompatibilityServiceServer.use(LoggingHandler);
    ClientSettingsApiServer.use(LoggingHandler);
    AvatarApiServer.use(LoggingHandler);
    LatencyMeasurementsInternalServiceServer.use(LoggingHandler, (_, response) => {
        response.send('robloxup');
    });

    SystemSDK.ConfigureServer(
        SystemSDK.MetadataBuilder(AvatarApiServer, __baseDirName + '/Bin/Routes/Avatar', 'avatar.sitetest4.robloxlabs.com'),
    );

    SystemSDK.ConfigureServer(
        SystemSDK.MetadataBuilder(
            ClientSettingsApiServer,
            __baseDirName + '/Bin/Routes/ClientSettings',
            'clientsettingscdn.sitetest4.robloxlabs.com',
        ),
    );

    SystemSDK.ConfigureServer(
        SystemSDK.MetadataBuilder(
            EphemeralCountersServiceServer,
            __baseDirName + '/Bin/Routes/EphemeralCounters',
            'ephemeralcounters.api.sitetest4.robloxlabs.com',
        ),
    );

    SystemSDK.ConfigureServer(
        SystemSDK.MetadataBuilder(
            VersionCompatibilityServiceServer,
            __baseDirName + '/Bin/Routes/VersionCompatibility',
            'versioncompatibility.api.sitetest4.robloxlabs.com',
        ),
    );

    SystemSDK.StartServer({
        Application: AvatarApiServer,
        SiteName: 'avatar.sitetest4.robloxlabs.com',
        ...sharedSettings,
    });

    SystemSDK.StartServer({
        Application: ClientSettingsApiServer,
        SiteName: 'clientsettingscdn.sitetest4.robloxlabs.com',
        ...sharedSettings,
    });

    SystemSDK.StartServer({
        Application: VersionCompatibilityServiceServer,
        SiteName: 'versioncompatibility.api.sitetest4.robloxlabs.com',
        ...sharedSettings,
    });

    SystemSDK.StartServer({
        Application: LatencyMeasurementsInternalServiceServer,
        SiteName: 'lms.simulpong.com',
        ...sharedSettings,
    });

    SystemSDK.StartServer({
        Application: EphemeralCountersServiceServer,
        SiteName: 'ephemeralcounters.api.sitetest4.robloxlabs.com',
        ...sharedSettings,
    });
})();

StandardInHandler();

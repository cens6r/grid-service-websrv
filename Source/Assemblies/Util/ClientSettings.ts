import { __baseDirName } from 'Assemblies/Directories';
import filestream from 'fs';

export enum FastVarType {
    'FVariable',
    'FLog',
    'DFLog',
    'SFLog',
    'FFlag',
    'DFFlag',
    'SFFlag',
    'FInt',
    'DFInt',
    'SFInt',
    'FString',
    'DFString',
    'SFString',
    'FPFilter',
    'FSettings',
    'UExperiment',
    'BTExperiment',
    'SExperiment',
    'All',
}

export class ClientSettings {
    public static GetSettings<SettingsType extends FastVarType>(
        settingsType: SettingsType,
        settingsGroup: string = 'Web',
    ): Record<string, unknown> | string[] | Error {
        let settings = JSON.parse(filestream.readFileSync(__baseDirName + '/Default/Roblox.Settings.json', 'ascii'));
        const fGroup = settings['FGroup'];
        if (settingsType || settingsType === 0 || settingsType === FastVarType.FFlag) {
            switch (settingsType as FastVarType) {
                case FastVarType.FVariable:
                    return fGroup[settingsGroup]['FVariable'];
                case FastVarType.FLog:
                    return fGroup[settingsGroup]['FLog'];
                case FastVarType.SFLog:
                    return fGroup[settingsGroup]['SFLog'];
                case FastVarType.DFLog:
                    return fGroup[settingsGroup]['DFLog'];
                case FastVarType.FFlag:
                    return fGroup[settingsGroup]['FFlag'];
                case FastVarType.DFFlag:
                    return fGroup[settingsGroup]['DFFlag'];
                case FastVarType.SFFlag:
                    return fGroup[settingsGroup]['SFFlag'];
                case FastVarType.FInt:
                    return fGroup[settingsGroup]['FInt'];
                case FastVarType.DFInt:
                    return fGroup[settingsGroup]['DFInt'];
                case FastVarType.SFInt:
                    return fGroup[settingsGroup]['SFInt'];
                case FastVarType.FString:
                    return fGroup[settingsGroup]['FString'];
                case FastVarType.DFString:
                    return fGroup[settingsGroup]['DFString'];
                case FastVarType.SFString:
                    return fGroup[settingsGroup]['SFString'];
                case FastVarType.FPFilter:
                    return fGroup[settingsGroup]['FPFilter'];
                case FastVarType.FSettings:
                    return settings['FSettings'];
                case FastVarType.UExperiment:
                    return fGroup[settingsGroup]['UExperiment'];
                case FastVarType.BTExperiment:
                    return fGroup[settingsGroup]['BTExperiment'];
                case FastVarType.SExperiment:
                    return fGroup[settingsGroup]['SExperiment'];
                case FastVarType.All:
                    return fGroup[settingsGroup];
                default:
                    return null;
            }
        }
    }
    public static GetFVariables(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.FVariable, ctx);
    }
    public static GetFLogs(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.FLog, ctx);
    }
    public static GetDFLogs(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.DFLog, ctx);
    }
    public static GetFFlags(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.FFlag, ctx);
    }
    public static GetDFFlags(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.DFFlag, ctx);
    }
    public static GetSFFlags(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.SFFlag, ctx);
    }
    public static GetFInts(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.FInt, ctx);
    }
    public static GetDFInts(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.DFInt, ctx);
    }
    public static GetSFInts(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.SFInt, ctx);
    }
    public static GetFStrings(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.FString, ctx);
    }
    public static GetDFStrings(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.DFString, ctx);
    }
    public static GetSFStrings(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.SFString, ctx);
    }
    public static GetFPFilters(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.FPFilter, ctx);
    }
    public static GetFSettings(): string[] {
        return <string[]>ClientSettings.GetSettings(FastVarType.FSettings);
    }
    public static GetUserExperiments(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.UExperiment, ctx);
    }
    public static GetBrowserTrackerExperiments(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.BTExperiment, ctx);
    }
    public static GetSharedExperiments(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.SExperiment, ctx);
    }
    public static GetSFLogs(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.SFLog, ctx);
    }

    public static GetAllSettings(ctx: string = 'Web') {
        return ClientSettings.GetSettings(FastVarType.All, ctx);
    }

    public static GetPlaceIdInPlaceFilter(key: string, placeId: number, ctx: string = 'Web') {
        const FPFilter = ClientSettings.GetFPFilters(ctx);
        // This should never go through unless files.api.sitetest4.robloxlabs.com/ClientSettingsFormatted dies.
        if (FPFilter === undefined) return false;

        const keyFilter = FPFilter[key] as Record<string, unknown>;
        if (keyFilter === undefined) return false;
        let isInFilter = false;
        (<number[]>keyFilter['Ids']).forEach((id) => {
            if (id === placeId) isInFilter = true;
        });
        return isInFilter;
    }
}

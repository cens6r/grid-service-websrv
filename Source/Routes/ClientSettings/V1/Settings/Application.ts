import { Request, Response, NextFunction } from 'express';
import { WebParsers } from 'Assemblies/Util/WebParsers';
import { ClientSettings } from 'Assemblies/Util/ClientSettings';
import { IRoutingController } from 'Assemblies/Setup/Interfaces/IRoutingController';

class GetClientSettingsByApplication implements IRoutingController {
    public RequestMethod = 'ALL';
    public Callback(request: Request, response: Response, _resumeFunction: NextFunction) {
        const group = WebParsers.SanitizeData(request.query.applicationName);
        const FSettings = ClientSettings.GetFSettings();

        if (!WebParsers.CheckIfValueIsIncludedInArray(group, FSettings))
            return response.status(200).send({ errors: [{ code: 1, message: 'The application name is invalid.' }] });

        const allGroupSettings = ClientSettings.GetAllSettings(group || 'Blank');

        if (!allGroupSettings) return response.status(503).send('The service is unavailable.');
        const parsedGroupMappedSettings = new Map<string, Object>(Object.entries(allGroupSettings));
        const outputGroupSettings: { [k: string]: unknown } = {};
        // TODO Push this section to a helper pls.
        parsedGroupMappedSettings.forEach((_value, key) => {
            if (key === 'FFlag') {
                const fflag = new Map<string, boolean>(Object.entries(allGroupSettings[key]));
                fflag.forEach((flagValue, flagName) => {
                    outputGroupSettings['FFlag' + flagName] = flagValue === true ? 'True' : 'False';
                });
            } else if (key === 'DFFlag') {
                const dfflag = new Map<string, boolean>(Object.entries(allGroupSettings[key]));
                dfflag.forEach((flagValue, flagName) => {
                    outputGroupSettings['DFFlag' + flagName] = flagValue === true ? 'True' : 'False';
                });
            } else if (key === 'SFFlag') {
                const sfflag = new Map<string, boolean>(Object.entries(allGroupSettings[key]));
                sfflag.forEach((flagValue, flagName) => {
                    outputGroupSettings['SFFlag' + flagName] = flagValue === true ? 'True' : 'False';
                });
            } else if (key === 'FLog') {
                const flog = new Map<string, number>(Object.entries(allGroupSettings[key]));
                flog.forEach((flagValue, flagName) => {
                    outputGroupSettings['FLog' + flagName] = flagValue.toString();
                });
            } else if (key === 'DFLog') {
                const dflog = new Map<string, number>(Object.entries(allGroupSettings[key]));
                dflog.forEach((flagValue, flagName) => {
                    outputGroupSettings['DFLog' + flagName] = flagValue.toString();
                });
            } else if (key === 'SFLog') {
                const sflog = new Map<string, number>(Object.entries(allGroupSettings[key]));
                sflog.forEach((flagValue, flagName) => {
                    outputGroupSettings['SFLog' + flagName] = flagValue.toString();
                });
            } else if (key === 'FInt') {
                const fint = new Map<string, number>(Object.entries(allGroupSettings[key]));
                fint.forEach((flagValue, flagName) => {
                    outputGroupSettings['FInt' + flagName] = flagValue.toString();
                });
            } else if (key === 'DFInt') {
                const dfint = new Map<string, number>(Object.entries(allGroupSettings[key]));
                dfint.forEach((flagValue, flagName) => {
                    outputGroupSettings['DFInt' + flagName] = flagValue.toString();
                });
            } else if (key === 'SFInt') {
                const sfint = new Map<string, number>(Object.entries(allGroupSettings[key]));
                sfint.forEach((flagValue, flagName) => {
                    outputGroupSettings['SFInt' + flagName] = flagValue.toString();
                });
            } else if (key === 'FString') {
                const fstring = new Map<string, string>(Object.entries(allGroupSettings[key]));
                fstring.forEach((flagValue, flagName) => {
                    outputGroupSettings['FString' + flagName] = flagValue;
                });
            } else if (key === 'DFString') {
                const dfstring = new Map<string, string>(Object.entries(allGroupSettings[key]));
                dfstring.forEach((flagValue, flagName) => {
                    outputGroupSettings['DFString' + flagName] = flagValue;
                });
            } else if (key === 'SFString') {
                const sfstring = new Map<string, string>(Object.entries(allGroupSettings[key]));
                sfstring.forEach((flagValue, flagName) => {
                    outputGroupSettings['SFString' + flagName] = flagValue;
                });
            } else if (key === 'FVariable') {
                const fvariable = new Map<string, unknown>(Object.entries(allGroupSettings[key]));
                fvariable.forEach((flagValue, flagName) => {
                    let value: unknown = flagValue;
                    if (typeof flagValue === 'boolean') value = flagValue ? 'True' : 'False';
                    if (typeof flagValue === 'number') value = (<number>flagValue).toString();
                    outputGroupSettings[flagName] = value;
                });
            } else if (key === 'FPFilter') {
                const fpfilter = new Map<string, { Value: unknown; Ids: number[]; Prefix: string }>(Object.entries(allGroupSettings[key]));
                fpfilter.forEach((flagValue, flagName) => {
                    const placeFilterFlagName = flagValue.Prefix + flagName + '_PlaceFilter';

                    if (typeof flagValue.Value === 'boolean') {
                        let placeFilterFlagValue = flagValue.Value ? 'True;' : 'False;';
                        let iterator = 0;
                        flagValue.Ids.forEach((placeId) => {
                            iterator++;
                            placeFilterFlagValue += placeId.toString() + (iterator !== flagValue.Ids.length ? ';' : '');
                        });
                        outputGroupSettings[placeFilterFlagName] = placeFilterFlagValue;
                    } else if (typeof flagValue.Value === 'number') {
                        let placeFilterFlagValue = flagValue.Value.toString() + ';';
                        let iterator = 0;
                        flagValue.Ids.forEach((placeId) => {
                            iterator++;
                            placeFilterFlagValue += placeId.toString() + (iterator !== flagValue.Ids.length ? ';' : '');
                        });
                        outputGroupSettings[placeFilterFlagName] = placeFilterFlagValue;
                    } else {
                        let placeFilterFlagValue = flagValue.Value + ';';
                        let iterator = 0;
                        flagValue.Ids.forEach((placeId) => {
                            iterator++;
                            placeFilterFlagValue += placeId.toString() + (iterator !== flagValue.Ids.length ? ';' : '');
                        });
                        outputGroupSettings[placeFilterFlagName] = placeFilterFlagValue;
                    }
                });
            } else {
                const flagValues = new Map<string, unknown>(Object.entries(allGroupSettings[key]));
                flagValues.forEach((flagValue, flagName) => {
                    let value: unknown = flagValue;
                    if (typeof flagValue === 'boolean') value = flagValue ? 'True' : 'False';
                    if (typeof flagValue === 'number') value = (<number>flagValue).toString();
                    outputGroupSettings[flagName] = value;
                });
            }
        });
        response.send({ applicationSettings: outputGroupSettings });
    }
}
export = new GetClientSettingsByApplication();

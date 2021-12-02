import { HttpRequestMethodEnum } from 'Assemblies/HttpServiceClient/Enumeration/HttpRequestMethodEnum';
import { HttpClient } from 'Assemblies/HttpServiceClient/HttpClient';
import { ClientRequest } from 'Assemblies/HttpServiceClient/Models/ClientRequest';
import { BaseURL } from 'Assemblies/Util/BaseUrl';
import { GlobalEnvironment } from 'Assemblies/Util/GlobalEnvironment';
import { NetUtil } from 'Assemblies/Util/NetworkingUtility';

export class GoogleAnalytics {
    private static _SharedOpts: ClientRequest = { Method: HttpRequestMethodEnum.POST };
    private static _Client: HttpClient = new HttpClient(this._SharedOpts);
    public static async TrackEventBlocking(category: string, action: string, label: string, value: number) {
        this._Client.UpdateConfiguration({
            ...this._SharedOpts,
            Url: BaseURL.ConstructServicePathFromHost('www.google-analytics.com', '/collect'),
            AdditionalHeaders: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            QueryString: {
                v: 1,
                tid: GlobalEnvironment.GoogleAnalyticsTrackerID,
                cid: NetUtil.GetLocalIP(),
                t: 'event',
                ec: category,
                ea: action,
                el: label,
                ev: Math.round(value),
            },
        });

        await this._Client.ExecuteAsync();
    }

    public static TrackEvent(category: string, action: string, label: string, value: number): void {
        this._Client.UpdateConfiguration({
            ...this._SharedOpts,
            Url: BaseURL.ConstructServicePathFromHost('www.google-analytics.com', '/collect'),
            AdditionalHeaders: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            QueryString: {
                v: 1,
                tid: GlobalEnvironment.GoogleAnalyticsTrackerID,
                cid: NetUtil.GetLocalIP(),
                t: 'event',
                ec: category,
                ea: action,
                el: label,
                ev: Math.round(value),
            },
        });

        // defer the request because we don't need to wait for the response
        this._Client.ExecuteAsync();
    }
}

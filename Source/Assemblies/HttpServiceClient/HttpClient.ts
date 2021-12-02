import { ClientRequest } from './Models/ClientRequest';
import { ClientResponse } from './Models/ClientResponse';
import { HttpRequestMethodEnum } from './Enumeration/HttpRequestMethodEnum';
import WebClient, { Method } from 'axios';
import SSL from 'https';
import { hostname as GetCurrentMachineName, networkInterfaces as GetNetworkInterfaces } from 'os';
import { Logger } from 'Assemblies/Util/LoggingUtility';

// TODO Have 2 variants of this, one with no callback and one with a callback?
export class HttpClient {
    private static LocalIP = HttpClient.GetLocalIP();
    private static MachineName = GetCurrentMachineName();
    public static GetLocalIP() {
        var netInterfaces = GetNetworkInterfaces();
        for (var devName in netInterfaces) {
            var netInterface = netInterfaces[devName];

            for (var i = 0; i < netInterface.length; i++) {
                var alias = netInterface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) return alias.address;
            }
        }
        return '0.0.0.0';
    }
    private request: ClientRequest;
    public constructor(request: ClientRequest) {
        this.request = request;
    }

    public UpdateConfiguration(request: ClientRequest) {
        if (this.request !== request) this.request = request;
    }

    public ClearConfiguration() {
        if (this.request !== null) this.request = null;
    }

    public async ClearCacheAsync(): Promise<void> {
        return new Promise((resumeFunction) => {
            return resumeFunction();
        });
    }

    /**
     * We only ever want this to resume, never error, or the client will receive a call stack
     * @returns {Promise<[Boolean, ClientResponse]>} Returns a task to be awaited.
     */
    public async ExecuteAsync<TResponse = any>(): Promise<[boolean, ClientResponse<TResponse>, Error]> {
        return new Promise<[boolean, ClientResponse, Error]>((resumeFunction) => {
            if (!this.request)
                return resumeFunction([false, null, new TypeError("The request was null, please update it via 'UpdateConfiguration'.")]);

            let parsedQs = new URLSearchParams(this.request.QueryString).toString();
            parsedQs = parsedQs.replace(/\?/g, '');
            const requestUrl = `${this.request.Url}?${parsedQs}`;
            let requestMethod: Method = 'GET';
            switch (this.request.Method) {
                case HttpRequestMethodEnum.GET:
                    requestMethod = 'GET';
                    break;
                case HttpRequestMethodEnum.POST:
                    requestMethod = 'POST';
                    break;
                case HttpRequestMethodEnum.DELETE:
                    requestMethod = 'DELETE';
                    break;
                case HttpRequestMethodEnum.HEAD:
                    requestMethod = 'HEAD';
                    break;
                case HttpRequestMethodEnum.OPTIONS:
                    requestMethod = 'OPTIONS';
                    break;
                case HttpRequestMethodEnum.PATCH:
                    requestMethod = 'PATCH';
                    break;
                case HttpRequestMethodEnum.PUT:
                    requestMethod = 'PUT';
                    break;
            }

            Logger.Log(`Performing ${requestMethod} request on the URL '${requestUrl}'`);

            WebClient.request({
                url: requestUrl,
                method: requestMethod,
                httpsAgent: new SSL.Agent({ rejectUnauthorized: false }),
                headers: {
                    ...this.request.AdditionalHeaders,
                    'User-Agent': `Roblox/ServiceClientInvokerTypescript ${process.version} (${HttpClient.MachineName}->${HttpClient.LocalIP})`,
                    'Roblox-Machine-Id': HttpClient.MachineName,
                    'Roblox-Machine-Ip': HttpClient.LocalIP,
                },
                data: this.request.Payload,
            })
                .then((response) => {
                    resumeFunction([
                        true,
                        {
                            Url: requestUrl,
                            Method: this.request.Method,
                            ResponsePayload: response.data,
                            Headers: response.headers,
                            StatusCode: response.status,
                            StatusMessage: response.statusText,
                        },
                        null,
                    ]);
                })
                .catch((err) => {
                    if (err.response) {
                        return resumeFunction([
                            false,
                            {
                                Url: requestUrl,
                                Method: this.request.Method,
                                ResponsePayload: err.response.data,
                                Headers: err.response.headers,
                                StatusCode: err.response.status,
                                StatusMessage: err.response.statusText,
                            },
                            err,
                        ]);
                    }
                    return resumeFunction([
                        false,
                        {
                            Url: requestUrl,
                            Method: this.request.Method,
                            ResponsePayload: null,
                            Headers: null,
                            StatusCode: 0,
                            StatusMessage: 'ConnectionError',
                        },
                        err,
                    ]);
                });
        });
    }
}

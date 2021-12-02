import { HttpRequestMethodEnum } from '../Enumeration/HttpRequestMethodEnum';
import { HttpHeaders } from './JSON/HttpHeaders';

export interface ClientResponse<TResponse = any> {
    Url: string;
    Method: HttpRequestMethodEnum;
    ResponsePayload: TResponse;
    Headers: HttpHeaders;
    StatusCode: number;
    StatusMessage: string;
}

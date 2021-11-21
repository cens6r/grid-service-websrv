import { HttpRequestMethodEnum } from '../Enumeration/HttpRequestMethodEnum';
import { HttpHeaders } from './JSON/HttpHeaders';

export interface ClientResponse<TResponse = any> {
	/*String*/ Url: string;
	/*HttpRequestMethodEnum*/ Method: HttpRequestMethodEnum;
	/*Nullable*/ ResponsePayload: TResponse;
	/*IHttpHeaders*/ Headers: HttpHeaders;
	/*Int32*/ StatusCode: number;
	/*String*/ StatusMessage: string;
}

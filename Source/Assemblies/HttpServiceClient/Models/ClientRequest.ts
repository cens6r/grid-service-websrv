import { HttpRequestMethodEnum } from '../Enumeration/HttpRequestMethodEnum';
import { HttpHeaders } from './JSON/HttpHeaders';
import { HttpQueries } from './JSON/HttpQueries';

export interface ClientRequest {
	/*String*/ Url?: string;
	/*int*/ Port?: number;
	/*HttpRequestMethodEnum*/ Method?: HttpRequestMethodEnum;
	/*String*/ Payload?: string;
	/*IHttpHeaders*/ AdditionalHeaders?: HttpHeaders;
	/*IHttpQueries*/ QueryString?: HttpQueries;
	/*String*/ FailedMessage?: string;
	/*Boolean*/ CheckResponseDataForOKStatus?: boolean;
}

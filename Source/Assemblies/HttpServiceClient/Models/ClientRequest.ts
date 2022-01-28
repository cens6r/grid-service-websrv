import { HttpRequestMethodEnum } from '../Enumeration/HttpRequestMethodEnum';
import { HttpHeaders } from './JSON/HttpHeaders';
import { HttpQueries } from './JSON/HttpQueries';

export interface ClientRequest {
    Url?: string;
    Method?: HttpRequestMethodEnum;
    Payload?: string;
    AdditionalHeaders?: HttpHeaders;
    QueryString?: HttpQueries;
    EnableLogging?: bool;
}

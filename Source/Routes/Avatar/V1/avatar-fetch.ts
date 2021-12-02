import { Request, Response, NextFunction } from 'express';
import { AvatarRequestProcessor } from 'Assemblies/Processors/AvatarRequestProcessor';
import { IRoutingController } from 'Assemblies/Setup/Interfaces/IRoutingController';

class AvatarFetch implements IRoutingController {
    public RequestMethod = 'ALL';
    public async Callback(request: Request, response: Response, _resumeFunction: NextFunction) {
        const cachedRequestProcessor = new AvatarRequestProcessor(response);
        var [UserID, UserName, placeID] = cachedRequestProcessor.ExtractDataFromQueryStringForGetAvatarFetchRequest(request);
        await cachedRequestProcessor.GetAvatarFetchResponseAsync(UserID, UserName, placeID);
    }
}

export = new AvatarFetch();

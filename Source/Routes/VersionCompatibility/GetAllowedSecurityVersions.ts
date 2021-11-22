import { IRoutingController } from 'Assemblies/Setup/Interfaces/IRoutingController';
import { NextFunction, Request, Response } from 'express';

class DefaultData implements IRoutingController {
    public RequestMethod = 'ALL';
    public Callback(_request: Request, response: Response, _resumeFunction: NextFunction) {
        return response.send([]);
    }
}

export = new DefaultData();
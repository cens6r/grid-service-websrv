import { GoogleAnalytics } from 'Assemblies/Analytics/GoogleAnalytics';
import { IRoutingController } from 'Assemblies/Setup/Interfaces/IRoutingController';
import { NextFunction, Request, Response } from 'express';

class BatchIncrementCounters implements IRoutingController {
    public RequestMethod = 'ALL';
    public Callback(request: Request, response: Response, _resumeFunction: NextFunction) {
        const requestData = new Map<string, any>(Object.entries(request.body));

        requestData.forEach((value, key) => {
            try {
                GoogleAnalytics.TrackEvent('RobloxEphemeralCounters', `IncrementCounter`, key, value);
            } catch {}
        });

        response.sendStatus(200);
    }
}

export = new BatchIncrementCounters();

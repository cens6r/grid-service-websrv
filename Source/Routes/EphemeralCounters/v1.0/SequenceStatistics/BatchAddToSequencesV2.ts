import { GoogleAnalytics } from 'Assemblies/Analytics/GoogleAnalytics';
import { IRoutingController } from 'Assemblies/Setup/Interfaces/IRoutingController';
import { NextFunction, Request, Response } from 'express';

class BatchAddToSequencesV2 implements IRoutingController {
    public RequestMethod = 'ALL';
    public Callback(request: Request, response: Response, _resumeFunction: NextFunction) {
        const requestData = request.body;

        requestData.forEach((data: { Key: string; Value: number }) => {
            try {
                GoogleAnalytics.TrackEvent('RobloxEphemeralStatistics', `IncrementStat`, data.Key, data.Value);
            } catch {}
        });

        response.sendStatus(200);
    }
}

export = new BatchAddToSequencesV2();

import { Logger } from 'Assemblies/Util/LoggingUtility';
import { RequestHandler } from 'express-serve-static-core';

export const LoggingHandler = ((request, _response, resumeFunction) => {
	Logger.Log(
		`%s REQUEST ON %s://%s%s FROM '%s' (%s)`,
		request.method.toUpperCase(),
		request.protocol,
		request.headers['host'] || request.hostname,
		request.url,
		request.headers['user-agent'] || 'No User Agent',
		request.ip,
	);

	resumeFunction();
}) as RequestHandler;

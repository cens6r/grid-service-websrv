import { Convert } from './Convert';
import { DotENV } from './DotENV';

export class GlobalEnvironment {
	public static get PersistLocalLogs(): bool {
		DotENV.GlobalConfigure();
		return Convert.ToBoolean(process.env.LOG_PERSIST, false);
	}
}

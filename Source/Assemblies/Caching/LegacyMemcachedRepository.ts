import { CachePolicy } from './Enumeration/CachePolicy';
export class LegacyMemcachedRepository {
	public constructor(cacheStoreName: string, policy: CachePolicy) {
		this._Name = cacheStoreName;
		this._MemcacheStore.clear();
		this.RegisterResetRoundRobin(policy);
	}

	public get Name() {
		return this._Name;
	}

	public get IsCacheClear() {
		return this._MemcacheStore.size === 0;
	}

	public KillReset() {
		if (this._CacheRefreshIntervalTimer) {
			this._CacheRefreshIntervalTimer.unref();
		}
	}

	public Clear() {
		this._MemcacheStore.clear();
	}

	public GetAllCachedValues() {
		return this._MemcacheStore;
	}

	public GetCachedValue(key: string): [bool, string] {
		if (this._DoNotCache) {
			return [false, null];
		}

		if (this._MemcacheStore.has(key)) {
			return [true, this._MemcacheStore.get(key)];
		}
		return [false, null];
	}

	public SetCachedValue(key: string, value: string): string {
		if (this._DoNotCache) {
			return null;
		}
		this._MemcacheStore.set(key, value);

		return value;
	}

	public SetCachedValueJson<T>(key: string, value: T): T {
		if (this._DoNotCache) {
			return null;
		}
		this._MemcacheStore.set(key, JSON.stringify(value));

		return value;
	}

	public SetCachedValueNumber(key: string, value: int): int {
		if (this._DoNotCache) {
			return null;
		}
		this._MemcacheStore.set(key, value.toString());

		return value;
	}

	public GetCachedValueJson<T>(key: string, returnTrueValueIfParseFail: bool = false): [bool, T] {
		if (this._DoNotCache) {
			return [false, null];
		}

		if (this._MemcacheStore.has(key)) {
			const cachedValue = this._MemcacheStore.get(key);
			try {
				return [true, <T>JSON.parse(cachedValue)];
			} catch {
				if (returnTrueValueIfParseFail) return [true, <T>(<unknown>cachedValue)];
				return [false, null];
			}
		}
		return [false, null];
	}

	public GetCachedValueNumber(key: string, returnTrueValueIfParseFail: bool = false): [bool, int] {
		if (this._DoNotCache) {
			return [false, null];
		}

		if (this._MemcacheStore.has(key)) {
			const cachedValue = this._MemcacheStore.get(key);
			const val = parseFloat(cachedValue);

			if (isNaN(val)) {
				if (returnTrueValueIfParseFail) return [true, <int>(<unknown>cachedValue)];
				return [false, null];
			}

			return [true, val];
		}
		return [false, null];
	}

	public GetCachedValueOrCacheNewValue(key: string, value: string): string {
		let [presentInCache, cachedValue] = this.GetCachedValue(key);

		if (presentInCache) return cachedValue;

		return this.SetCachedValue(key, value);
	}

	public GetCachedValueOrCacheNewValueJson<T>(key: string, value: T): T {
		let [presentInCache, cachedValue] = this.GetCachedValueJson<T>(key);

		if (presentInCache) return cachedValue;

		return this.SetCachedValueJson(key, value);
	}

	public GetCachedValueOrCacheNewValueNumber(key: string, value: int): int {
		let [presentInCache, cachedValue] = this.GetCachedValueNumber(key, true);

		if (presentInCache) return cachedValue;

		return this.SetCachedValueNumber(key, value);
	}

	public RemoveKey(key: string) {
		this._MemcacheStore.delete(key);
	}

	private static CalculateResetMsForStatePolicy(policy: CachePolicy) {
		let timeOut = null;

		switch (policy) {
			case CachePolicy.DoNotCache:
				timeOut = null;
				break;
			case CachePolicy.NoReset:
				timeOut = -1;
				break;
			case CachePolicy.StaleAfterFiveSeconds:
				timeOut = 5000;
				break;
			case CachePolicy.StaleAfterTenSeconds:
				timeOut = 10000;
				break;
			case CachePolicy.SateAfterThirtySeconds:
				timeOut = 30000;
				break;
			case CachePolicy.StaleAfterOneMinute:
				timeOut = 60000;
				break;
			case CachePolicy.StaleAfterTwoMinutes:
				timeOut = 120000;
				break;
			case CachePolicy.StaleAfterFiveMinutes:
				timeOut = 300000;
				break;
			case CachePolicy.StaleAfterTenMinutes:
				timeOut = 600000;
				break;
			case CachePolicy.StaleAfterFifteenMinutes:
				timeOut = 900000;
				break;
			case CachePolicy.StateAfterThirtyMinutes:
				timeOut = 1.8e6;
				break;
			case CachePolicy.StaleAfterOneHour:
				timeOut = 3.6e6;
				break;
		}
		return timeOut;
	}

	private RegisterResetRoundRobin(policy: CachePolicy) {
		if (!this._PersistentRoundRobinState.WasRegisteredForCacheReset) {
			const cacheRefreshInterval = LegacyMemcachedRepository.CalculateResetMsForStatePolicy(policy);
			this._DoNotCache = cacheRefreshInterval === null;
			this._PersistentRoundRobinState.WasRegisteredForCacheReset = true;
			if (cacheRefreshInterval !== null && cacheRefreshInterval !== -1)
				this._CacheRefreshIntervalTimer = setInterval(() => {
					if (this._MemcacheStore.size > 0) {
						this._MemcacheStore.clear();
					}
				}, cacheRefreshInterval);
		}
	}

	private readonly _MemcacheStore = new Map<string, string>();

	private readonly _PersistentRoundRobinState = {
		WasRegisteredForCacheReset: false,
	};

	private _DoNotCache: bool = false;

	private _Name: string;
	private _CacheRefreshIntervalTimer: NodeJS.Timer;
}

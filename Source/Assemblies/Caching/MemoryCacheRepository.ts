/**
 * FileName: MemoryCacheRepository.ts
 * Written by: Nikita Petko
 * Date: November 23, 2021
 * Description: A cache repository that uses the application memory as a cache.
 * Notes: Ripped from MFDLABS/Kairex-SeriesClient/src/lib/cache/memorycacherepo.cs
 */

import { Logger } from 'Assemblies/Util/LoggingUtility';
import { BaseCacheRepository } from './Base/BaseCacheRepository';
import { CachePolicy } from './Enumeration/CachePolicy';

/**
 * A cache repository that uses the application memory as a cache.
 */
export class MemoryCacheRepository extends BaseCacheRepository {
    /**
     * Constructs a new instance of the MemoryCacheRepository class.
     * @param {string} cacheStoreName The repository name.
     * @param {CachePolicy} policy The refresh policy.
     */
    public constructor(cacheStoreName: string, policy: CachePolicy) {
        super(cacheStoreName, policy);
        Logger.Debug("Register Memory Cache Repository '%s', with policy: %s", cacheStoreName, CachePolicy[policy]);
        this._MemoryCache.clear();
    }

    public get IsCacheClear() {
        return this._MemoryCache.size === 0;
    }

    public Clear() {
        Logger.Debug("Clear Memory Cache Repository '%s'", this._Name);
        this._MemoryCache.clear();
    }

    public GetAllCachedValues(): Map<string, string> {
        return this._MemoryCache;
    }

    public GetCachedValue(key: string): [bool, string] {
        Logger.Log("Get Memory Cache Value '%s'", key);

        if (super._DoNotCache) {
            Logger.Warn("Memory Cache Repository '%s' is disabled, not getting", this._Name);
            return [false, null];
        }

        if (this._MemoryCache.has(key)) {
            Logger.Info("Memory Cache Value '%s' found", key);
            return [true, this._MemoryCache.get(key)];
        }

        Logger.Warn("Memory Cache Value '%s' not found", key);

        return [false, null];
    }

    public SetCachedValue(key: string, value: string): string {
        Logger.Log("Set Memory Cache Value '%s'", key);

        if (super._DoNotCache) {
            Logger.Warn("Memory Cache Repository '%s' is disabled, not setting", this._Name);
            return null;
        }

        this._MemoryCache.set(key, value);

        return value;
    }

    public SetCachedValueJson<T>(key: string, value: T): T {
        Logger.Log("Set Memory Cache Value '%s' JSON", key);

        if (super._DoNotCache) {
            Logger.Warn("Memory Cache Repository '%s' is disabled, not setting", this._Name);
            return null;
        }
        this._MemoryCache.set(key, JSON.stringify(value));

        return value;
    }

    public SetCachedValueNumber(key: string, value: int): int {
        Logger.Log("Set Memory Cache Value '%s' Number", key);

        if (super._DoNotCache) {
            Logger.Warn("Memory Cache Repository '%s' is disabled, not setting", this._Name);
            return null;
        }
        this._MemoryCache.set(key, value.toString());

        return value;
    }

    public GetCachedValueJson<T>(key: string, returnTrueValueIfParseFail: bool = false): [bool, T] {
        Logger.Log("Get Memory Cache Value '%s' JSON", key);

        if (super._DoNotCache) {
            Logger.Warn("Memory Cache Repository '%s' is disabled, not getting", this._Name);
            return [false, null];
        }

        if (this._MemoryCache.has(key)) {
            Logger.Info("Memory Cache Value '%s' found", key);

            const cachedValue = this._MemoryCache.get(key);
            try {
                return [true, <T>JSON.parse(cachedValue)];
            } catch {
                Logger.Warn("Memory Cache Value '%s' JSON parse failed, returnTrueValueIfParseFailed: %s", key, returnTrueValueIfParseFail);

                if (returnTrueValueIfParseFail) return [true, <T>(<unknown>cachedValue)];
                return [false, null];
            }
        }

        Logger.Warn("Memory Cache Value '%s' not found", key);

        return [false, null];
    }

    public GetCachedValueNumber(key: string, returnTrueValueIfParseFail: bool = false): [bool, int] {
        Logger.Log("Get Memory Cache Value '%s' Number", key);

        if (super._DoNotCache) {
            Logger.Warn("Memory Cache Repository '%s' is disabled, not getting", this._Name);
            return [false, null];
        }

        if (this._MemoryCache.has(key)) {
            Logger.Info("Memory Cache Value '%s' found", key);

            const cachedValue = this._MemoryCache.get(key);
            const val = parseFloat(cachedValue);

            if (isNaN(val)) {
                Logger.Warn(
                    "Memory Cache Value '%s' Number parse failed, returnTrueValueIfParseFailed: %s",
                    key,
                    returnTrueValueIfParseFail,
                );

                if (returnTrueValueIfParseFail) return [true, <int>(<unknown>cachedValue)];
                return [false, null];
            }

            return [true, val];
        }

        Logger.Warn("Memory Cache Value '%s' not found", key);

        return [false, null];
    }

    public GetCachedValueOrCacheNewValue(key: string, value: string): string {
        Logger.Log("Get Or Create Memory Cache Value '%s'", key);

        let [presentInCache, cachedValue] = this.GetCachedValue(key);

        if (presentInCache) {
            Logger.Info("Memory Cache Value '%s' found, skip write.", key);
            return cachedValue;
        }

        Logger.Warn("Memory Cache Value '%s' not found, write.", key);

        return this.SetCachedValue(key, value);
    }

    public GetCachedValueOrCacheNewValueJson<T>(key: string, value: T): T {
        Logger.Log("Get Or Create Memory Cache Value '%s' JSON", key);

        let [presentInCache, cachedValue] = this.GetCachedValueJson<T>(key);

        if (presentInCache) {
            Logger.Info("Memory Cache Value '%s' JSON found, skip write.", key);
            return cachedValue;
        }

        Logger.Warn("Memory Cache Value '%s' JSON not found, write.", key);

        return this.SetCachedValueJson(key, value);
    }

    public GetCachedValueOrCacheNewValueNumber(key: string, value: int): int {
        Logger.Log("Get Or Create Memory Cache Value '%s' Number", key);

        let [presentInCache, cachedValue] = this.GetCachedValueNumber(key, true);

        if (presentInCache) {
            Logger.Warn("Memory Cache Value '%s' Number found, skip write.", key);
            return cachedValue;
        }

        Logger.Warn("Memory Cache Value '%s' Number not found, write.", key);

        return this.SetCachedValueNumber(key, value);
    }

    public RemoveKey(key: string) {
        Logger.Log("Remove Memory Cache Value '%s'", key);

        this._MemoryCache.delete(key);
    }

    protected OnResetTimer(repo: MemoryCacheRepository): void {
        if (repo._MemoryCache.size > 0) {
            Logger.Debug("Reset Memory Cache Repository '%s'", repo._Name);
            repo._MemoryCache.clear();
        }
    }

    private readonly _MemoryCache = new Map<string, string>();
}

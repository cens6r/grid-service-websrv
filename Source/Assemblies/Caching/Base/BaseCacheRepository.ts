/**
 * FileName: MemoryCacheRepository.ts
 * Written by: Nikita Petko
 * Date: November 23, 2021
 * Description: A cache repository that uses the application memory as a cache.
 * Notes: Ripped from MFDLABS/Kairex-SeriesClient/src/lib/cache/base/baserepo.cs
 */

import { CachePolicy } from '../Enumeration/CachePolicy';

export abstract class BaseCacheRepository {
    public constructor(name: string, cachePolicy: CachePolicy) {
        this._Name = name;
        this.RegisterResetTimer(cachePolicy);
    }

    /**
     * Kills the cache refresh timer.
     */
    public KillReset() {
        if (this._CacheRefreshIntervalTimer) {
            this._CacheRefreshIntervalTimer.unref();
        }
    }

    /**
     * The name of the cache.
     */
    public get Name(): string {
        return this._Name;
    }

    /**
     * Is the cache repository empty?
     */
    public abstract get IsCacheClear(): boolean;

    /**
     * Clears the cache.
     */
    public abstract Clear(): void;

    /**
     * Gets all the KV pairs in the cache.
     */
    public GetAllCachedValues(): Map<string, any> {
        return new Map();
    }

    /**
     * Attempts to get a literal string from the cache.
     * @param {string} key The key of the value to get.
     * @returns {[boolean, string]} A tuple containing a boolean indicating whether the value was found in the cache, and the value if it was found.
     */
    public abstract GetCachedValue(key: string): [bool, string];

    /**
     * Attempts to get a JSON style object from the cache.
     * @param {string} key The key of the object to get.
     * @returns {[boolean, T]} A tuple containing a boolean indicating whether the object was found in the cache, and the object if it was found.
     */
    public abstract GetCachedValueJson<T>(key: string, returnTrueValueIfParseFail?: bool): [bool, T];

    /**
     * Attempts to get a number from the cache.
     * @param {string} key The key of the value to get.
     * @returns {[boolean, number]} A tuple containing a boolean indicating whether the value was found in the cache, and the value if it was found.
     */
    public abstract GetCachedValueNumber(key: string, returnTrueValueIfParseFail?: bool): [bool, int];

    /**
     * Attempts to write a literal string to the cache.
     * @param {string} key The key of the value to set.
     * @param {string} value The value to set. Can be null.
     * @returns {string} The value that was set.
     */
    public abstract SetCachedValue(key: string, value: string): string;

    /**
     * Attempts to write a JSON style object to the cache.
     * @param {string} key The key of the object to set.
     * @param {T} value The value to set. Can be null.
     * @returns {T} The value that was set.
     */
    public abstract SetCachedValueJson<T>(key: string, value: T): T;

    /**
     * Attempts to write a number to the cache.
     * @param {string} key The key of the value to set.
     * @param {int} value The value to set. Can be NaN.
     * @returns {int} The value that was set.
     */
    public abstract SetCachedValueNumber(key: string, value: int): int;

    /**
     * Get or set a literal string in the cache.
     * @param {string} key The key of the value to get or set.
     * @param {string} value The value to set. Can be null.
     * @returns {string} The value that was set.
     */
    public abstract GetCachedValueOrCacheNewValue(key: string, value: string): string;

    /**
     * Get or set a JSON style object in the cache.
     * @param {string} key The key of the object to get or set.
     * @param {T} value The value to set. Can be null.
     * @returns {T} The value that was set.
     */
    public abstract GetCachedValueOrCacheNewValueJson<T>(key: string, value: T): T;

    /**
     * Get or set a number in the cache.
     * @param {string} key The key of the value to get or set.
     * @param {int} value The value to set. Can be NaN.
     * @returns {int} The value that was set.
     */
    public abstract GetCachedValueOrCacheNewValueNumber(key: string, value: int): int;

    /**
     * Remove a key from the cache.
     * @param {string} key The key to remove.
     */
    public abstract RemoveKey(key: string): void;

    /**
     * Calculate the reset time for the cache.
     * @param {CachePolicy} policy The reset policy.
     * @returns {number} The reset time in milliseconds.
     */
    public static CalculateResetMsForStatePolicy(policy: CachePolicy): number {
        let timeOut = null;

        switch (policy) {
            case CachePolicy.DoNotCache:
                timeOut = null;
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

    /**
     * Executes when the cache refresh interval timer is hit
     */
    protected abstract OnResetTimer(repo: BaseCacheRepository): void;

    private RegisterResetTimer(policy: CachePolicy): void {
        if (!this._PersistentState.WasRegisteredForCacheReset) {
            const cacheRefreshInterval = BaseCacheRepository.CalculateResetMsForStatePolicy(policy);
            this._DoNotCache = cacheRefreshInterval === null;
            this._PersistentState.WasRegisteredForCacheReset = true;
            if (cacheRefreshInterval !== null && cacheRefreshInterval !== -1)
                this._CacheRefreshIntervalTimer = setInterval(() => this.OnResetTimer(this), cacheRefreshInterval);
        }
    }

    private readonly _PersistentState = {
        WasRegisteredForCacheReset: false,
    };
    protected _DoNotCache: boolean;
    protected _Name: string;
    private _CacheRefreshIntervalTimer: NodeJS.Timer;
}

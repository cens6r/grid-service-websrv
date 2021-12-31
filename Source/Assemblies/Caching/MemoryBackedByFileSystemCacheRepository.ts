/**
 * FileName: MemoryBackedByFileSystemCacheRepository.ts
 * Written by: Nikita Petko
 * Date: November 23, 2021
 * Description: A cache repository that will attempt to fetch a value from a memory-style cache, and if it fails, will attempt to fetch it from a file-system-style cache.
 * Notes: Ripped from MFDLABS/Kairex-SeriesClient/src/lib/cache/membackedfscacherepo.cs
 */

import { Logger } from 'Assemblies/Util/LoggingUtility';
import { BaseCacheRepository } from './Base/BaseCacheRepository';
import { CachePolicy } from './Enumeration/CachePolicy';
import { FileSystemCacheRepository } from './FileSystemCacheRepository';
import { MemoryCacheRepository } from './MemoryCacheRepository';

/**
 * A cache repository that will attempt to fetch a value from a memory-style cache, and if it fails, will attempt to fetch it from a file-system-style cache.
 */
export class MemoryBackedByFileSystemCacheRepository extends BaseCacheRepository {
    /**
     * Constructs a new instance of the MemoryBackedByFileSystemCacheRepository class.
     * @param {string} repoName The name of the cache repository.
     * @param {CachePolicy} policy The reset policy of the cache repository.
     */
    public constructor(repoName: string, policy: CachePolicy) {
        super(repoName, policy);
        Logger.Debug("Register MemoryBackedByFileSystem Cache Repository '%s' with policy: %s", repoName, CachePolicy[policy]);
        this._MemoryCache = new MemoryCacheRepository(repoName, CachePolicy.NoReset);
        this._FileSystemCache = new FileSystemCacheRepository(repoName, CachePolicy.NoReset);
    }

    public get IsCacheClear() {
        return this._MemoryCache.IsCacheClear && this._FileSystemCache.IsCacheClear;
    }

    public Clear() {
        Logger.Debug(`Clearing ${this._Name}`);
        this._MemoryCache.Clear();
        this._FileSystemCache.Clear();
    }

    public GetCachedValueJson<T>(key: string): [bool, T] {
        Logger.Log(`Getting cached JSON value for ${key}`);

        const [wasMemcached, memCacheValue] = this._MemoryCache.GetCachedValueJson<T>(key);

        if (wasMemcached) {
            Logger.Info(`Found JSON value in memory cache for ${key}`);
            return [true, memCacheValue];
        }
        const [wasLocalCached, localCacheValue] = this._FileSystemCache.GetCachedValueJson<T>(key, true);

        if (wasLocalCached) {
            Logger.Info(`Found JSON value in file system cache for ${key}`);
            return [true, localCacheValue];
        }

        Logger.Warn(`No JSON value found for ${key}`);

        return [false, null];
    }

    public GetCachedValue(key: string): [bool, string] {
        Logger.Log(`Getting cached value for ${key}`);
        const [wasMemcached, memCacheValue] = this._MemoryCache.GetCachedValue(key);

        if (wasMemcached) {
            Logger.Info(`Found value in memory cache for ${key}`);
            return [true, memCacheValue];
        }
        const [wasLocalCached, localCacheValue] = this._FileSystemCache.GetCachedValue(key);

        if (wasLocalCached) {
            Logger.Info(`Found value in file system cache for ${key}`);
            return [true, localCacheValue];
        }

        Logger.Warn(`No value found for ${key}`);

        return [false, null];
    }

    public GetCachedValueNumber(key: string): [bool, int] {
        Logger.Log(`Getting number cached value for ${key}`);
        const [wasMemcached, memCacheValue] = this._MemoryCache.GetCachedValueNumber(key);

        if (wasMemcached) {
            Logger.Info(`Found number value in memory cache for ${key}`);
            return [true, memCacheValue];
        }
        const [wasLocalCached, localCacheValue] = this._FileSystemCache.GetCachedValueNumber(key);

        if (wasLocalCached) {
            Logger.Info(`Found number value in file system cache for ${key}`);
            return [true, localCacheValue];
        }

        Logger.Warn(`No number value found for ${key}`);

        return [false, null];
    }

    public SetCachedValueJson<T>(key: string, value: T): T {
        Logger.Log(`Setting cached JSON value for ${key}`);

        this._MemoryCache.SetCachedValueJson(key, value);

        return value;
    }

    public SetCachedValue(key: string, value: string): string {
        Logger.Log(`Setting cached value for ${key}`);

        this._MemoryCache.SetCachedValue(key, value);

        return value;
    }

    public SetCachedValueNumber(key: string, value: int): int {
        Logger.Log(`Setting cached number value for ${key}`);

        this._MemoryCache.SetCachedValueNumber(key, value);

        return value;
    }

    public GetCachedValueOrCacheNewValueJson<T>(key: string, value: T): T {
        Logger.Log(`Get or cache new JSON value for ${key}`);

        let [presentInCache, cachedValue] = this.GetCachedValueJson<T>(key);

        if (presentInCache) {
            Logger.Info(`Found JSON value in cache for ${key}, skipping creation.`);
            return cachedValue;
        }

        Logger.Warn(`No JSON value found for ${key}, creating.`);

        return this.SetCachedValueJson<T>(key, value);
    }

    public GetCachedValueOrCacheNewValue(key: string, value: string): string {
        Logger.Log(`Get or cache new value for ${key}`);
        let [presentInCache, cachedValue] = this.GetCachedValue(key);

        if (presentInCache) {
            Logger.Info(`Found value in cache for ${key}, skipping creation.`);
            return cachedValue;
        }

        Logger.Warn(`No value found for ${key}, creating.`);

        return this.SetCachedValue(key, value);
    }

    public GetCachedValueOrCacheNewValueNumber(key: string, value: int): int {
        Logger.Log(`Get or cache new number value for ${key}`);

        let [presentInCache, cachedValue] = this.GetCachedValueNumber(key);

        if (presentInCache) {
            Logger.Info(`Found number value in cache for ${key}, skipping creation.`);

            return cachedValue;
        }

        Logger.Warn(`No number value found for ${key}, creating.`);

        return this.SetCachedValueNumber(key, value);
    }

    public RemoveKey(key: string) {
        Logger.Log(`Removing key ${key}`);

        this._FileSystemCache.RemoveKey(key);
        this._MemoryCache.RemoveKey(key);
    }

    /**
     * Move all memory cache keys to the file system cache.
     */
    public MoveAllKeysToFileSystem() {
        Logger.Debug(`Moving all keys to file system cache for ${this._Name}`);
        this._MemoryCache.GetAllCachedValues().forEach((v, k) => {
            this._FileSystemCache.SetCachedValue(k, v);
        });

        this._MemoryCache.Clear();
    }

    // There's a dumb issue when calling an inherited method from a super method where the inherited method's `this` is undefined.
    // So just pass the super's `this` to the inherited method and for some reason it works.
    protected OnResetTimer(repo: MemoryBackedByFileSystemCacheRepository): void {
        if (repo._MemoryCache.GetAllCachedValues().size > 0) {
            Logger.Debug(`Transitioning items from MemoryCache(${this._Name}) to FileSystemCache(${this._Name})`);
            repo._FileSystemCache.Clear();
            repo.MoveAllKeysToFileSystem();
        }
    }

    private readonly _MemoryCache: BaseCacheRepository;
    private readonly _FileSystemCache: BaseCacheRepository;
}

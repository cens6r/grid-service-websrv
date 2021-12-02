/**
 * FileName: FileSystemCacheRepository.ts
 * Written by: Nikita Petko
 * Date: November 23, 2021
 * Description: A cache repository that uses the file system as a cache.
 * Notes: Ripped from MFDLABS/Kairex-SeriesClient/src/lib/cache/fscacherepo.cs
 */

import { Logger } from 'Assemblies/Util/LoggingUtility';
import { BaseCacheRepository } from './Base/BaseCacheRepository';
import { CachePolicy } from './Enumeration/CachePolicy';
import { FileSystemHelper } from './FileSystem/FileSystemHelper';

/**
 * A cache repository that uses the file system as a cache.
 */
export class FileSystemCacheRepository extends BaseCacheRepository {
    /**
     * Constructs a new instance of the FileSystemCacheRepository class.
     * @param {string} cacheStoreName The repository name.
     * @param {CachePolicy} policy The refresh policy.
     */
    public constructor(cacheStoreName: string, policy: CachePolicy) {
        super(cacheStoreName, policy);
        Logger.Debug("Register FileSystem Cache Repository '%s' with policy: %s", cacheStoreName, CachePolicy[policy]);
        FileSystemHelper.RegisterFileSystemCacheRepository(cacheStoreName);
    }

    public get IsCacheClear() {
        return FileSystemHelper.GetFileSystemCacheRepositorySize(this._Name) === 0;
    }

    public Clear() {
        Logger.Debug("Clear FileSystem Cache Repository '%s'", this._Name);
        FileSystemHelper.ClearFileSystemCacheRepository(this._Name);
    }

    public GetAllCachedValues(): Map<string, any> {
        return FileSystemHelper.GetAllCachedValues(this._Name);
    }

    public GetCachedValue(key: string): [bool, string] {
        Logger.Log("Get FileSystem Cache Value '%s'", key);

        if (super._DoNotCache) {
            Logger.Warn("FileSystem Cache Repository '%s' is disabled, not getting", this._Name);
            return [false, null];
        }

        const [hasKey, cachedValue] = FileSystemHelper.GetCachedValue(this._Name, key);

        if (hasKey) {
            Logger.Log("FileSystem Cache Value '%s' found", key);
            return [true, cachedValue];
        }

        Logger.Warn("FileSystem Cache Value '%s' not found", key);

        return [false, null];
    }

    public GetCachedValueJson<T>(key: string, returnTrueValueIfParseFail: bool = false): [bool, T] {
        Logger.Log("Get FileSystem Cache Value '%s' JSON", key);

        if (super._DoNotCache) {
            Logger.Warn("FileSystem Cache Repository '%s' is disabled, not getting", this._Name);
            return [false, null];
        }

        const [hasKey, cachedValue] = FileSystemHelper.GetCachedValue(this._Name, key);

        if (hasKey) {
            Logger.Log("FileSystem Cache Value '%s' JSON found", key);

            try {
                return [true, <T>JSON.parse(cachedValue)];
            } catch {
                Logger.Warn(
                    "FileSystem Cache Value '%s' JSON parse failed, returnTrueValueIfParseFailed: %s",
                    key,
                    returnTrueValueIfParseFail,
                );

                if (returnTrueValueIfParseFail) return [true, <T>(<unknown>cachedValue)];
                return [false, null];
            }
        }

        Logger.Warn("FileSystem Cache Value '%s' JSON not found", key);

        return [false, null];
    }

    public GetCachedValueNumber(key: string, returnTrueValueIfParseFail: bool = false): [bool, int] {
        Logger.Log("Get FileSystem Cache Value '%s' Number", key);

        if (super._DoNotCache) {
            Logger.Warn("FileSystem Cache Repository '%s' is disabled, not getting", this._Name);
            return [false, null];
        }

        const [hasKey, cachedValue] = FileSystemHelper.GetCachedValue(this._Name, key);

        if (hasKey) {
            Logger.Log("FileSystem Cache Value '%s' Number found", key);
            const val = parseFloat(cachedValue);

            if (isNaN(val)) {
                Logger.Warn(
                    "FileSystem Cache Value '%s' Number parse failed, returnTrueValueIfParseFailed: %s",
                    key,
                    returnTrueValueIfParseFail,
                );
                if (returnTrueValueIfParseFail) return [true, <int>(<unknown>cachedValue)];
                return [false, null];
            }

            return [true, val];
        }

        Logger.Warn("FileSystem Cache Value '%s' Number not found", key);

        return [false, null];
    }

    public SetCachedValue(key: string, value: string): string {
        Logger.Log("Set FileSystem Cache Value '%s'", key);

        if (super._DoNotCache) {
            Logger.Warn("FileSystem Cache Repository '%s' is disabled, not setting", this._Name);
            return null;
        }
        return FileSystemHelper.SetCachedValue(this._Name, key, value);
    }

    public SetCachedValueJson<T>(key: string, value: T): T {
        Logger.Log("Set FileSystem Cache Value '%s' JSON", key);
        if (super._DoNotCache) {
            Logger.Warn("FileSystem Cache Repository '%s' is disabled, not setting", this._Name);
            return null;
        }

        FileSystemHelper.SetCachedValue(this._Name, key, JSON.stringify(value));

        return value;
    }

    public SetCachedValueNumber(key: string, value: int): int {
        Logger.Log("Set FileSystem Cache Value '%s' Number", key);
        if (super._DoNotCache) {
            Logger.Warn("FileSystem Cache Repository '%s' is disabled, not setting", this._Name);
            return null;
        }

        FileSystemHelper.SetCachedValue(this._Name, key, value.toString());

        return value;
    }

    public GetCachedValueOrCacheNewValue(key: string, value: string): string {
        Logger.Log("Get Or Create FileSystem Cache Value '%s'", key);

        let [presentInCache, cachedValue] = this.GetCachedValue(key);

        if (presentInCache) {
            Logger.Log("FileSystem Cache Value '%s' found, skipping write", key);
            return cachedValue;
        }

        Logger.Log("FileSystem Cache Value '%s' not found, caching", key);

        return this.SetCachedValue(key, value);
    }

    public GetCachedValueOrCacheNewValueJson<T>(key: string, value: T): T {
        Logger.Log("Get Or Create FileSystem Cache Value '%s' JSON", key);

        let [presentInCache, cachedValue] = this.GetCachedValueJson<T>(key);

        if (presentInCache) {
            Logger.Log("FileSystem Cache Value '%s' JSON found, skipping write", key);
            return cachedValue;
        }

        Logger.Log("FileSystem Cache Value '%s' JSON not found, caching", key);

        return this.SetCachedValueJson(key, value);
    }

    public GetCachedValueOrCacheNewValueNumber(key: string, value: int): int {
        Logger.Log("Get Or Create FileSystem Cache Value '%s' Number", key);
        let [presentInCache, cachedValue] = this.GetCachedValueNumber(key, true);

        if (presentInCache) {
            Logger.Log("FileSystem Cache Value '%s' Number found, skipping write", key);
            return cachedValue;
        }

        Logger.Log("FileSystem Cache Value '%s' Number not found, caching", key);

        return this.SetCachedValueNumber(key, value);
    }

    public RemoveKey(key: string) {
        Logger.Log("Remove FileSystem Cache Value '%s'", key);
        FileSystemHelper.DeleteCachedValue(this._Name, key);
    }

    protected OnResetTimer(repo: FileSystemCacheRepository): void {
        Logger.Debug("Reset timer for FileSystem Cache Repository '%s'", repo._Name);
        const cacheStoreSize = FileSystemHelper.GetFileSystemCacheRepositorySize(repo._Name);
        if (cacheStoreSize > 0) {
            FileSystemHelper.ClearFileSystemCacheRepository(repo._Name);
        }
    }
}

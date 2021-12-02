/**
 * FileName: FileSystemHelper.ts
 * Written by: Nikita Petko
 * Date: December 1, 2021
 * Description: A helper class for the file system.
 * Notes: Ripped from MFDLABS/Kairex-SeriesClient/src/lib/cache/files/helper.cs
 */

import {
    existsSync as FileOrFolderExist,
    mkdirSync as CreateDirectory,
    rmSync as RemoveDirectory,
    readdirSync as ReadDirectory,
    readFileSync as ReadLocally,
    writeFileSync as WriteLocally,
    unlinkSync as DeleteLocally,
} from 'fs';

/**
 * A helper class for the file system.
 */
export class FileSystemHelper {
    /**
     * Registers a new cache repository on the system.
     * @param {string} storeName The name of the cache repository.
     */
    public static RegisterFileSystemCacheRepository(storeName: string) {
        const baseDir = FileSystemHelper.GetCacheDirectoryByOS();
        if (!FileOrFolderExist(baseDir)) CreateDirectory(baseDir, { recursive: true });
        const qualifiedCacheStoreLocation = baseDir + storeName;
        if (!FileOrFolderExist(qualifiedCacheStoreLocation)) CreateDirectory(qualifiedCacheStoreLocation, { recursive: true });
    }

    /**
     * Clears all the contents of the cache repository, recreating the folder.
     * @param {string} storeName The name of the cache repository.
     */
    public static ClearFileSystemCacheRepository(storeName: string): void {
        const baseDir = FileSystemHelper.GetCacheDirectoryByOS();
        if (!FileOrFolderExist(baseDir)) return FileSystemHelper.RegisterFileSystemCacheRepository(storeName);
        const qualifiedCacheStoreLocation = baseDir + storeName;
        if (!FileOrFolderExist(qualifiedCacheStoreLocation)) return FileSystemHelper.RegisterFileSystemCacheRepository(storeName);

        RemoveDirectory(qualifiedCacheStoreLocation, { recursive: true, force: true });
        CreateDirectory(qualifiedCacheStoreLocation, { recursive: true });
    }

    /**
     * Gets the total size of the cache repository.
     * @param {string} storeName The name of the cache repository.
     * @returns {int} The total size of the cache repository.
     */
    public static GetFileSystemCacheRepositorySize(storeName: string): int {
        const baseDir = FileSystemHelper.GetCacheDirectoryByOS();
        if (!FileOrFolderExist(baseDir)) {
            FileSystemHelper.RegisterFileSystemCacheRepository(storeName);
            return 0;
        }
        const qualifiedCacheStoreLocation = baseDir + storeName;
        if (!FileOrFolderExist(qualifiedCacheStoreLocation)) {
            FileSystemHelper.RegisterFileSystemCacheRepository(storeName);
            return 0;
        }

        return ReadDirectory(qualifiedCacheStoreLocation).length;
    }

    /**
     * Attempts to read a cached value from the local file system cache.
     * @param {string} cacheStore The name of the cache repository.
     * @param {string} key The key of the cached value.
     * @returns {[bool, string]} A tuple containing the success of the operation and the cached value.
     */
    public static GetCachedValue(cacheStore: string, key: string): [bool, string] {
        const baseDir = FileSystemHelper.GetCacheDirectoryByOS();
        if (!FileOrFolderExist(baseDir)) {
            FileSystemHelper.RegisterFileSystemCacheRepository(cacheStore);
            return [false, null];
        }
        const qualifiedCacheStoreLocation = baseDir + cacheStore;
        if (!FileOrFolderExist(qualifiedCacheStoreLocation)) {
            FileSystemHelper.RegisterFileSystemCacheRepository(cacheStore);
            return [false, null];
        }

        const keyName = key.split(':').join('-').split(' ').join('~') + '.rbx-CachedValue';

        try {
            return [true, ReadLocally(`${qualifiedCacheStoreLocation}/${keyName}`, { encoding: 'utf-8' })];
        } catch (e) {
            return [false, null];
        }
    }

    /**
     * Attempts to write the given string to the given file system cache repository.
     * @param {string} cacheStore The name of the cache repository.
     * @param {string} key The key of the cached value.
     * @param {string} value The value to cache.
     * @returns {string} The value that was cached.
     */
    public static SetCachedValue(cacheStore: string, key: string, value: string): string {
        const baseDir = FileSystemHelper.GetCacheDirectoryByOS();
        if (!FileOrFolderExist(baseDir)) {
            FileSystemHelper.RegisterFileSystemCacheRepository(cacheStore);
        }
        const qualifiedCacheStoreLocation = baseDir + cacheStore;
        if (!FileOrFolderExist(qualifiedCacheStoreLocation)) {
            FileSystemHelper.RegisterFileSystemCacheRepository(cacheStore);
        }

        const keyName = key.split(':').join('-').split(' ').join('~') + '.rbx-CachedValue';

        WriteLocally(`${qualifiedCacheStoreLocation}/${keyName}`, value, { encoding: 'utf-8' });
        return value;
    }

    /**
     * Attempts to delete a cached value from the local file system cache.
     * @param {string} cacheStore The name of the cache repository.
     * @param {string} key The key of the cached value.
     */
    public static DeleteCachedValue(cacheStore: string, key: string): void {
        const baseDir = FileSystemHelper.GetCacheDirectoryByOS();
        if (!FileOrFolderExist(baseDir)) {
            FileSystemHelper.RegisterFileSystemCacheRepository(cacheStore);
            return;
        }
        const qualifiedCacheStoreLocation = baseDir + cacheStore;
        if (!FileOrFolderExist(qualifiedCacheStoreLocation)) {
            FileSystemHelper.RegisterFileSystemCacheRepository(cacheStore);
            return;
        }

        const keyName = key.split(':').join('-').split(' ').join('~') + '.rbx-CachedValue';

        try {
            DeleteLocally(`${qualifiedCacheStoreLocation}/${keyName}`);
        } catch (e) {}
    }

    /**
     * Attempts to list all of the local cached values.
     * @param cacheStore The name of the cache repository.
     * @returns {Map<string, any>} A map of all of the cached values.
     */
    public static GetAllCachedValues(cacheStore: string): Map<string, any> {
        const baseDir = FileSystemHelper.GetCacheDirectoryByOS();
        if (!FileOrFolderExist(baseDir)) {
            FileSystemHelper.RegisterFileSystemCacheRepository(cacheStore);
            return new Map<string, any>();
        }
        const qualifiedCacheStoreLocation = baseDir + cacheStore;
        if (!FileOrFolderExist(qualifiedCacheStoreLocation)) {
            FileSystemHelper.RegisterFileSystemCacheRepository(cacheStore);
            return new Map<string, any>();
        }

        const map = new Map<string, any>();

        ReadDirectory(qualifiedCacheStoreLocation).forEach((entry) => {
            map[entry.split('-').join(':').split('~').join(' ').replace('.rbx-CachedValue', '')] = ReadLocally(
                qualifiedCacheStoreLocation + entry,
                {
                    encoding: 'utf-8',
                },
            );
        });

        return map;
    }

    /**
     * Attempts to delete all local file system cache repositories.
     */
    public static ClearAllFileSystemCacheRepositories(): void {
        const baseDir = FileSystemHelper.GetCacheDirectoryByOS();
        if (!FileOrFolderExist(baseDir)) {
            CreateDirectory(baseDir, { recursive: true });
            return;
        }

        RemoveDirectory(baseDir, { recursive: true, force: true });
        CreateDirectory(baseDir, { recursive: true });
    }

    private static GetCacheDirectoryByOS() {
        switch (process.platform) {
            case 'linux' || 'darwin':
                return '/var/cache/roblox/';
            case 'win32':
                return 'C:/Roblox/TempFiles/Persistence/';
        }
    }
}

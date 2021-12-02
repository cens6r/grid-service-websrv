/**
 * FileName: CachePolicy.ts
 * Written by: Nikita Petko
 * Date: December 1, 2021
 * Description: Represents the cache refresh policy.
 * Notes: Ripped from MFDLABS/Kairex-SeriesClient/src/lib/cache/enums/policy.cs
 */

/**
 * Represents the cache refresh policy.
 */
export enum CachePolicy {
    /**
     * The value is never cached.
     */
    DoNotCache,
    /**
     * The value is cached but doesn't expire automatically.
     */
    NoReset,
    /**
     * The value is cached and expires after five seconds.
     */
    StaleAfterFiveSeconds,
    /**
     * The value is cached and expires after ten seconds.
     */
    StaleAfterTenSeconds,
    /**
     * The value is cached and expires after thirty seconds.
     */
    SateAfterThirtySeconds,
    /**
     * The value is cached and expires after one minute.
     */
    StaleAfterOneMinute,
    /**
     * The value is cached and expires after two minutes.
     */
    StaleAfterTwoMinutes,
    /**
     * The value is cached and expires after five minutes.
     */
    StaleAfterFiveMinutes,
    /**
     * The value is cached and expires after ten minutes.
     */
    StaleAfterTenMinutes,
    /**
     * The value is cached and expires after fifteen minutes.
     */
    StaleAfterFifteenMinutes,
    /**
     * The value is cached and expires after thirty minutes.
     */
    StateAfterThirtyMinutes,
    /**
     * The value is cached and expires after one hour.
     */
    StaleAfterOneHour,
}

export const UNKNOWN_LABEL = "Unknown"

/**
 * The API reports a field as null when no recent scan backs it up — the provider
 * may have changed it, or stopped advertising entirely, and we have no current
 * reading. That is different from a real zero, and it must not be formatted into
 * one: RoundingFunction(null) returns 0, which would render an unknown price as
 * "$0 /Hour". Check before formatting.
 */
export const isKnown = (value: unknown): boolean => value !== null && value !== undefined

export function formatOrUnknown<T>(value: T | null | undefined, format: (value: T) => string | number): string | number {
    return isKnown(value) ? format(value as T) : UNKNOWN_LABEL
}

/** True when the offer carries no scan-backed data at all. */
export const isStaleRuntime = (runtime: any): boolean => !!runtime && runtime.data_fresh === false

/** "3 minutes ago"-style label for when we last actually saw the offer. */
export function lastSeenLabel(lastSeenAt: string | null | undefined): string {
    if (!lastSeenAt) return "never seen by a scan"
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / 1000))
    const units: [number, string][] = [
        [86400, "day"],
        [3600, "hour"],
        [60, "minute"],
    ]
    for (const [size, name] of units) {
        if (seconds >= size) {
            const count = Math.floor(seconds / size)
            return `last seen ${count} ${name}${count === 1 ? "" : "s"} ago`
        }
    }
    return "last seen moments ago"
}

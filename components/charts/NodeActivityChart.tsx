import React from "react"
import useSWR from "swr"
import { Card } from "@tremor/react"
import { RiBarChartFill } from "@remixicon/react"
import * as HoverCardPrimitives from "@radix-ui/react-hover-card"
import clsx from "clsx"
import { twMerge } from "tailwind-merge"
import { fetcher } from "@/fetcher"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

function cx(...args) {
    return twMerge(clsx(...args))
}

// The API returns 24h of samples at a 120s step. Bucketing them into 15 minute
// slots keeps the timeline readable (~96 blocks) while still resolving short jobs.
const BUCKET_SECONDS = 900
const SAMPLE_SECONDS = 120

// A bucket that mixes computing and idle samples gets its own state — collapsing
// it into "computing" would hide short idle gaps on a node that computes almost
// continuously, which is exactly the detail worth seeing.
const stateMeta = {
    computing: { label: "Computing", color: "bg-golemblue dark:bg-[#323cfa]" },
    partial: { label: "Partly computing", color: "bg-blue-400 dark:bg-blue-500" },
    idle: { label: "Idle", color: "bg-gray-300 dark:bg-gray-700" },
    nodata: { label: "No data", color: "bg-gray-100 dark:bg-gray-800" },
}

const formatTime = (seconds) => new Date(seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    if (!hours) return `${mins}m`
    return mins ? `${hours}h ${mins}m` : `${hours}h`
}

// Buckets are aligned to wall-clock 15 minute boundaries and span every sample
// returned, so nothing is dropped at either edge.
const buildBuckets = (values) => {
    const start = Math.floor(values[0][0] / BUCKET_SECONDS) * BUCKET_SECONDS
    const end = Math.ceil(values[values.length - 1][0] / BUCKET_SECONDS) * BUCKET_SECONDS
    const count = Math.max(1, Math.round((end - start) / BUCKET_SECONDS))

    const buckets = Array.from({ length: count }, (_, index) => ({
        start: start + index * BUCKET_SECONDS,
        end: start + (index + 1) * BUCKET_SECONDS,
        samples: 0,
        computingSamples: 0,
    }))

    values.forEach(([time, value]) => {
        const index = Math.floor((time - start) / BUCKET_SECONDS)
        if (index < 0 || index >= count) return
        buckets[index].samples += 1
        if (Number(value) > 0) buckets[index].computingSamples += 1
    })

    return buckets.map((bucket) => ({
        ...bucket,
        state: !bucket.samples
            ? "nodata"
            : bucket.computingSamples === bucket.samples
            ? "computing"
            : bucket.computingSamples > 0
            ? "partial"
            : "idle",
        computingMinutes: (bucket.computingSamples * SAMPLE_SECONDS) / 60,
        spanMinutes: (bucket.samples * SAMPLE_SECONDS) / 60,
    }))
}

const Block = ({ bucket }) => {
    const [open, setOpen] = React.useState(false)
    const meta = stateMeta[bucket.state]
    const range = `${formatTime(bucket.start)} – ${formatTime(bucket.end)}`

    return (
        <HoverCardPrimitives.Root open={open} onOpenChange={setOpen} openDelay={50} closeDelay={50}>
            <HoverCardPrimitives.Trigger onClick={() => setOpen(true)} asChild>
                <div
                    className={cx("h-full w-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px]", meta.color)}
                    aria-label={`${range}: ${meta.label}`}
                />
            </HoverCardPrimitives.Trigger>
            <HoverCardPrimitives.Portal>
                <HoverCardPrimitives.Content
                    sideOffset={10}
                    side="top"
                    align="center"
                    avoidCollisions
                    sticky
                    className={cx(
                        "group z-[60] relative min-w-44 max-w-64 rounded-tremor-default shadow-tremor-dropdown dark:shadow-dark-tremor-dropdown",
                        "text-tremor-content-strong dark:text-dark-tremor-content-strong",
                        "bg-tremor-background dark:bg-dark-tremor-background",
                        "border border-tremor-border dark:border-dark-tremor-border"
                    )}
                >
                    <div className="flex space-x-2 p-2">
                        <div className={cx("w-1 shrink-0 rounded", meta.color)} aria-hidden={true} />
                        <div>
                            <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                {meta.label}
                            </p>
                            {bucket.computingSamples > 0 ? (
                                <p className="mt-1 text-tremor-label text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
                                    {formatDuration(bucket.computingMinutes)} of {formatDuration(bucket.spanMinutes)} computing
                                </p>
                            ) : null}
                            <p className="mt-1 text-tremor-label text-tremor-content dark:text-dark-tremor-content">{range}</p>
                        </div>
                    </div>
                </HoverCardPrimitives.Content>
            </HoverCardPrimitives.Portal>
        </HoverCardPrimitives.Root>
    )
}

const Timeline = ({ buckets, className }) => (
    <div className={className}>
        <div className="flex h-10 items-center gap-px sm:gap-0.5">
            {buckets.map((bucket) => (
                <Block key={bucket.start} bucket={bucket} />
            ))}
        </div>
        <div className="mt-2 flex justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content">
            <span>{formatTime(buckets[0].start)}</span>
            <span>last {formatDuration((buckets.length * BUCKET_SECONDS) / 60)}</span>
            <span>{formatTime(buckets[buckets.length - 1].end)}</span>
        </div>
    </div>
)

const EmptyState = ({ message }) => (
    <div className="mt-6 flex h-40 items-center justify-center rounded-tremor-small border border-dashed border-tremor-border p-4 dark:border-dark-tremor-border">
        <div className="text-center">
            <RiBarChartFill
                className="mx-auto h-7 w-7 text-tremor-content-subtle dark:text-dark-tremor-content-subtle"
                aria-hidden={true}
            />
            <p className="mt-2 text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                No data to show
            </p>
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">{message}</p>
        </div>
    </div>
)

const NodeActivityChart = ({ nodeId }) => {
    const { data, error } = useSWR(`v1/provider/node/${nodeId}/activity`, fetcher, {
        refreshInterval: 30000,
    })

    if (error)
        return (
            <Card className="h-full">
                <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Node Activity</h3>
                <EmptyState message="There was an error fetching the data, please try again later" />
            </Card>
        )
    if (!data) return <Skeleton height={200} />

    const values = data?.data?.result?.[0]?.values ?? []

    if (!values.length)
        return (
            <Card className="h-full">
                <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Node Activity</h3>
                <EmptyState message="This node did not report any activity in the last 24 hours" />
            </Card>
        )

    const buckets = buildBuckets(values)
    const computingMinutes = buckets.reduce((total, bucket) => total + bucket.computingMinutes, 0)
    const reportedSamples = buckets.reduce((total, bucket) => total + bucket.samples, 0)
    const computingSamples = buckets.reduce((total, bucket) => total + bucket.computingSamples, 0)
    const computingShare = reportedSamples ? (computingSamples / reportedSamples) * 100 : 0
    const currentlyComputing = Number(values[values.length - 1][1]) > 0

    return (
        <Card className="h-full">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Node Activity</h3>
                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                        Computing vs idle over time
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        {formatDuration(computingMinutes)}
                    </p>
                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                        computing in 24h ({computingShare.toFixed(1)}% of reported time)
                    </p>
                </div>
            </div>

            <Timeline buckets={buckets} className="mt-6 hidden lg:block" />
            <Timeline buckets={buckets.slice(Math.floor(buckets.length / 2))} className="mt-6 hidden sm:block lg:hidden" />
            <Timeline buckets={buckets.slice(Math.max(0, buckets.length - 24))} className="mt-6 block sm:hidden" />

            <div className="mt-4 flex flex-wrap items-center gap-2">
                {["computing", "partial", "idle", "nodata"].map((state) => (
                    <span
                        key={state}
                        className="inline-flex items-center gap-x-2 rounded-tremor-small bg-tremor-background-subtle px-2 py-0.5 text-tremor-default text-tremor-content dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content-emphasis"
                        tabIndex={1}
                    >
                        <span
                            className={cx(
                                "h-2 w-2 rounded-tremor-full",
                                state === "nodata" && "border border-tremor-border dark:border-dark-tremor-border",
                                stateMeta[state].color
                            )}
                        />
                        {state === "computing" && currentlyComputing ? "Computing now" : stateMeta[state].label}
                    </span>
                ))}
            </div>
        </Card>
    )
}

export default NodeActivityChart

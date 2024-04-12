import { RiCheckboxCircleFill, RiBarChartFill } from "@remixicon/react"
import { Accordion, AccordionBody, AccordionHeader, Card, List, ListItem } from "@tremor/react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { RiCloseFill } from "@remixicon/react"
import StatusIndicator from "../StatusIndicator"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import HardwareBadge from "../HardwareBadge"
import NvidiaIcon from "../svg/NvidiaIcon"
import * as HoverCardPrimitives from "@radix-ui/react-hover-card"
import React from "react"

import clsx from "clsx"
import { twMerge } from "tailwind-merge"

export function cx(...args) {
    return twMerge(clsx(...args))
}

const Block = ({ color, status, date, tooltip, test }) => {
    const [open, setOpen] = React.useState(false)
    console.log(color, status, date, tooltip, test)
    const href = "#"
    return (
        <HoverCardPrimitives.Root open={open} onOpenChange={setOpen} openDelay={100} closeDelay={100}>
            <HoverCardPrimitives.Trigger onClick={() => setOpen(true)} asChild>
                <div className={cx("h-full w-full rounded-[1px] first:rounded-l-[4px] last:rounded-r-[4px]", color)} />
            </HoverCardPrimitives.Trigger>
            <HoverCardPrimitives.Portal>
                <HoverCardPrimitives.Content
                    sideOffset={10}
                    side="top"
                    align="center"
                    avoidCollisions
                    sticky
                    className={cx(
                        "group z-40 relative min-w-52 max-w-64 rounded-tremor-default shadow-tremor-dropdown dark:shadow-dark-tremor-dropdown",
                        "text-tremor-content-strong dark:text-dark-tremor-content-strong",
                        "bg-tremor-background dark:bg-dark-tremor-background",
                        "border border-tremor-border dark:border-dark-tremor-border"
                    )}
                >
                    <div className="flex space-x-2 p-2">
                        <div className={cx("w-1 shrink-0 rounded", color)} aria-hidden={true} />
                        <div>
                            <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                <a href={href} className="focus:outline-none">
                                    {/* Extend link to entire tooltip */}
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </a>
                            </p>
                            {status === "outage" ? (
                                <>
                                    {tooltip.map((item, index) => (
                                        <>
                                            <p className="mt-1 text-tremor-label text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
                                                {item.human_period}
                                                <br></br>
                                                {item.time_period}
                                            </p>
                                            <div
                                                className="my-2 h-px w-full bg-tremor-border dark:bg-dark-tremor-border"
                                                aria-hidden={true}
                                            />
                                        </>
                                    ))}
                                </>
                            ) : null}
                            <p className="mt-1 text-tremor-label text-tremor-content dark:text-dark-tremor-content">{date}</p>
                        </div>
                    </div>
                </HoverCardPrimitives.Content>
            </HoverCardPrimitives.Portal>
        </HoverCardPrimitives.Root>
    )
}

const Tracker = React.forwardRef(({ data = [], className, ...props }, forwardedRef) => {
    return (
        <div ref={forwardedRef} className={cx("flex h-10 items-center gap-px sm:gap-0.5", className)} {...props}>
            {data.map((props, index) => (
                <Block key={props.key ?? index} {...props} />
            ))}
        </div>
    )
})

const colorMapping = {
    online: "bg-emerald-500",
    offline: "bg-red-500",
    outage: "bg-yellow-500",
}

interface UptimeTracker {
    color: string
    date: string
    status: string
    downtimes: { human_period: string; time_period: string; date: string }[]
}

interface UptimeTrackerResponse {
    first_seen: string
    uptime_percentage: number
    downtime_periods: { human_period: string; time_period: string; date: string }[]
    current_status: string
    data: UptimeTracker[]
}

interface ProviderUptimeTrackerProps {
    nodeId: string
}

export const ProviderUptimeTrackerComponent: React.FC<ProviderUptimeTrackerProps> = ({
    nodeId,
    nodeName,
    cpu,
    gpu,
    cpuVendor,
    version,
    subnet,
}) => {
    const { data, error } = useSWR<UptimeTrackerResponse>(`v2/provider/uptime/${nodeId}`, fetcher, {
        refreshInterval: 60000,
    })

    if (error)
        return (
            <Card className="h-full py-1 flex justify-center items-center">
                <div className="mt-4 flex h-44 items-center justify-center rounded-tremor-small border border-dashed border-tremor-border p-4 dark:border-dark-tremor-border">
                    <div className="text-center">
                        <RiBarChartFill
                            className="mx-auto h-7 w-7 text-tremor-content-subtle dark:text-dark-tremor-content-subtle"
                            aria-hidden={true}
                        />
                        <p className="mt-2 text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                            No data to show
                        </p>
                        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                            There was an error fetching the data, please try again later
                        </p>
                    </div>
                </div>
            </Card>
        )
    if (!data) return <Skeleton className="h-full py-1" height={320} />

    const combinedData = data.data.map((item) => {
        return {
            color: item.color,
            status: item.status,
            tooltip: item.downtimes,
            date: item.date,
            color: colorMapping[item.status],
        }
    })

    return (
        <div className="grid h-full">
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-xl text-tremor-content-strong dark:text-dark-tremor-content-strong">
                            {nodeName}
                        </h3>
                        <div className="hidden md:flex">
                            <span className="text-tremor-default text-gray-500 break-words truncate ">Node ID: {nodeId}</span>
                        </div>
                        <div className="hidden md:flex">
                            <span className="text-tremor-default text-gray-500 break-words truncate ">Version: {version}</span>
                        </div>
                        <div className="hidden md:flex">
                            <span className="text-tremor-default text-gray-500 break-words truncate ">Subnet: {subnet}</span>
                        </div>
                    </div>
                    <StatusIndicator current_status={data.current_status} />
                </div>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-4 lg:gap-0">
                        {cpu && <HardwareBadge title="CPU" showCPUVendorIcon={true} cpuVendor={cpuVendor} value={cpu} />}
                        {gpu && (
                            <HardwareBadge
                                title="GPU"
                                value={gpu}
                                icon={<NvidiaIcon className="h-5 w-5 text-tremor-content dark:text-dark-tremor-content" />}
                            />
                        )}
                    </div>
                    <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong hidden md:block">
                        {data.uptime_percentage.toFixed(2)}% uptime
                    </p>
                </div>
                <Tracker data={combinedData} className="mt-3 w-full hidden lg:flex" />
                <Tracker data={combinedData.slice(30, 90)} className="mt-3 hidden w-full sm:flex lg:hidden" />
                <Tracker data={combinedData.slice(60, 90)} className="mt-3 flex w-full sm:hidden" />
                <div className="mt-6 flex flex-wrap items-center gap-2 hidden w-full lg:flex">
                    {Object.entries(colorMapping).map(([status, color]) => (
                        <span
                            key={status}
                            className="capitalize inline-flex items-center gap-x-2 rounded-tremor-small bg-tremor-background-subtle px-2 py-0.5 text-tremor-default text-tremor-content dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content-emphasis"
                            tabIndex={1}
                        >
                            <span className={`h-2 w-2 rounded-tremor-full ${color}`} />
                            {status}
                        </span>
                    ))}
                </div>
            </Card>
        </div>
    )
}

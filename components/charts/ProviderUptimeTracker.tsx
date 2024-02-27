import { RiCheckboxCircleFill, RiBarChartFill } from "@remixicon/react"
import { Accordion, AccordionBody, AccordionHeader, Card, List, ListItem, Tracker } from "@tremor/react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { RiCloseFill } from "@remixicon/react"
import StatusIndicator from "../StatusIndicator"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import HardwareBadge from "../HardwareBadge"
import NvidiaIcon from "../svg/NvidiaIcon"
const colorMapping = {
    online: "emerald-500",
    offline: "red-500",
}

interface UptimeTracker {
    color: string
    tooltip: string
    status: string
}

interface UptimeTrackerResponse {
    first_seen: string
    uptime_percentage: number
    downtime_periods: { timestamp: string; human_period: string }[]
    current_status: string
    data: UptimeTracker[]
}

interface ProviderUptimeTrackerProps {
    nodeId: string
}

export const ProviderUptimeTrackerComponent: React.FC<ProviderUptimeTrackerProps> = ({ nodeId, nodeName, cpu, gpu, cpuVendor }) => {
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
    if (!data) return <Skeleton className="h-full py-1" />

    const combinedData = data.data.map((item) => {
        return {
            ...item,
            color: colorMapping[item.status],
        }
    })

    const downtimeItems = data.downtime_periods.map((period) => (
        <ListItem key={period.timestamp}>
            <span>{period.timestamp}</span>
            <span>{period.human_period}</span>
        </ListItem>
    ))

    return (
        <div className="grid h-full">
            <Card>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-xl text-tremor-content-strong dark:text-dark-tremor-content-strong">
                            {nodeName}
                        </h3>
                        <div className="hidden md:flex">
                            <span className="text-tremor-default text-gray-500 break-words truncate ">{nodeId}</span>
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
                <Tracker data={combinedData} className="mt-4 hidden w-full lg:flex" />
                <div className="mt-6 flex flex-wrap items-center gap-2 hidden w-full lg:flex">
                    {Object.entries(colorMapping).map(([status, color]) => (
                        <span
                            key={status}
                            className="capitalize inline-flex items-center gap-x-2 rounded-tremor-small bg-tremor-background-subtle px-2 py-0.5 text-tremor-default text-tremor-content dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content-emphasis"
                            tabIndex={1}
                        >
                            <span className={`h-2 w-2 rounded-tremor-full bg-${color}`} />
                            {status}
                        </span>
                    ))}
                </div>
                <Accordion className="mt-6 rounded-tremor-small">
                    <AccordionHeader className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        <div className="font-inter">Downtime overview ({downtimeItems.length})</div>
                    </AccordionHeader>
                    <AccordionBody>
                        <List>{downtimeItems}</List>
                    </AccordionBody>
                </Accordion>
            </Card>
        </div>
    )
}

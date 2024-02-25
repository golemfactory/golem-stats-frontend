import { RiCheckboxCircleFill, RiBarChartFill } from "@remixicon/react"
import { Accordion, AccordionBody, AccordionHeader, Card, List, ListItem, Tracker } from "@tremor/react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { RiCloseFill } from "@remixicon/react"
import StatusIndicator from "../StatusIndicator"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
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

export const ProviderUptimeTrackerComponent: React.FC<ProviderUptimeTrackerProps> = ({ nodeId, nodeName, cpu, gpu }) => {
    const { data, error } = useSWR<UptimeTrackerResponse>(`v2/preovider/uptime/${nodeId}`, fetcher, {
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
    const reversedData = [...data.data].reverse() // Create a copy and reverse it

    const combinedData = reversedData.map((item) => {
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
                        {cpu && (
                            <span className="inline-flex items-center gap-x-2.5 rounded-tremor-full bg-tremor-background py-1 pl-2.5 pr-1 text-tremor-label text-tremor-content ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content dark:ring-dark-tremor-ring">
                                CPU
                                <span className="h-4 w-px bg-tremor-ring dark:bg-dark-tremor-ring" />
                                <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-emphasis">{cpu}</span>
                                <div
                                    className="-ml-1.5 flex h-5 w-5 items-center justify-center rounded-tremor-full text-tremor-content hover:bg-tremor-background-subtle hover:text-tremor-content-emphasis dark:text-dark-tremor-content dark:hover:bg-dark-tremor-background-subtle dark:hover:text-dark-tremor-content-emphasis"
                                    aria-label="AMD"
                                >
                                    <svg
                                        className="h-3 fill-red-500 w-3 shrink-0"
                                        xmlns="http://www.w3.org/2000/svg"
                                        x="0px"
                                        y="0px"
                                        width="100"
                                        height="100"
                                        viewBox="0 0 50 50"
                                    >
                                        <path d="M 5 4 C 4.596 4 4.2311719 4.2441875 4.0761719 4.6171875 C 3.9211719 4.9911875 4.0069688 5.4210313 4.2929688 5.7070312 L 14.292969 15.707031 C 14.479969 15.895031 14.735 16 15 16 L 34 16 L 34 35 C 34 35.265 34.104969 35.520031 34.292969 35.707031 L 44.292969 45.707031 C 44.483969 45.898031 44.74 46 45 46 C 45.129 46 45.258812 45.974828 45.382812 45.923828 C 45.755812 45.768828 46 45.404 46 45 L 46 5 C 46 4.448 45.552 4 45 4 L 5 4 z M 15.09375 19.003906 C 14.801344 18.975734 14.507469 19.077719 14.292969 19.292969 L 4.2929688 29.292969 C 4.1049688 29.479969 4 29.735 4 30 L 4 45 C 4 45.552 4.448 46 5 46 L 20 46 C 20.265 46 20.520031 45.895031 20.707031 45.707031 L 30.707031 35.707031 C 30.993031 35.421031 31.078828 34.991188 30.923828 34.617188 C 30.768828 34.244188 30.404 34 30 34 L 16 34 L 16 20 C 16 19.596 15.755813 19.231172 15.382812 19.076172 C 15.288812 19.037172 15.191219 19.013297 15.09375 19.003906 z"></path>
                                    </svg>
                                </div>
                            </span>
                        )}
                        {gpu && (
                            <span className="inline-flex items-center gap-x-2.5 rounded-tremor-full bg-tremor-background py-1 pl-2.5 pr-1 text-tremor-label text-tremor-content ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content dark:ring-dark-tremor-ring">
                                GPU
                                <span className="h-4 w-px bg-tremor-ring dark:bg-dark-tremor-ring" />
                                <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-emphasis">{gpu}</span>
                                <div
                                    className="-ml-1.5 flex h-5 w-5 items-center justify-center rounded-tremor-full text-tremor-content hover:bg-tremor-background-subtle hover:text-tremor-content-emphasis dark:text-dark-tremor-content dark:hover:bg-dark-tremor-background-subtle dark:hover:text-dark-tremor-content-emphasis"
                                    aria-label="GPU"
                                >
                                    <img src="/nvidia.webp" alt="Nvidia" className="shrink-0 pr-2" aria-hidden={true} />
                                </div>
                            </span>
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
                        Downtime overview ({downtimeItems.length})
                    </AccordionHeader>
                    <AccordionBody>
                        <List>{downtimeItems}</List>
                    </AccordionBody>
                </Accordion>
            </Card>
        </div>
    )
}

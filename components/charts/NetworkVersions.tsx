import React from "react"
import useSWR from "swr"
import { AreaChart, Card } from "@tremor/react"
import { fetcher } from "@/fetcher"
import Skeleton from "react-loading-skeleton"
import { useTimeFrame } from "@/components/TimeFrameContext"
import { TimeFrameTabs } from "@/components/TimeFrameTabs"

// Fixed CVD-validated hue order; a version keeps its slot (and color) as
// long as it stays in the top six. "Other" is the deliberately-gray tail.
const SERIES_COLORS = ["blue", "emerald", "violet", "amber", "cyan", "rose", "gray"]

export const NetworkVersionAdoption: React.FC = () => {
    const { timeFrame, setTimeFrame } = useTimeFrame()
    const { data } = useSWR("v2/network/versions/combined", fetcher, {
        refreshInterval: 60000,
    })
    const { data: yagnaReleases } = useSWR("v1/api/yagna/releases", fetcher, {})
    const latestYagnaVersion = yagnaReleases?.[0]

    const versions: string[] = data?.versions ?? []
    const points = data?.[timeFrame] ?? []

    const formatLabel = (epoch: number) => {
        const date = new Date(epoch * 1000)
        if (timeFrame === "24h") {
            return date.toLocaleTimeString(navigator.language, { hour: "2-digit", minute: "2-digit" })
        }
        return date.toLocaleString(navigator.language, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }

    const chartData = points.map((point: any) => ({
        ...point,
        date: formatLabel(point.date),
    }))

    const latest = points.length ? points[points.length - 1] : null
    const topVersion = versions.length ? versions.reduce((best, v) => ((latest?.[v] ?? 0) > (latest?.[best] ?? 0) ? v : best), versions[0]) : null

    return (
        <Card className="h-full px-6">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Network Version Adoption</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    The share of nodes running each Yagna version over time, based on nodes reporting telemetry. The six most-adopted
                    versions are shown individually; the rest are grouped as Other.
                </p>
            </div>
            <div className="border-t border-tremor-border p-6 dark:border-dark-tremor-border">
                <div className="grid md:flex md:items-start md:justify-between">
                    <ul role="list" className="order-2 mt-6 flex flex-wrap items-center gap-x-8 gap-y-8 md:order-1 md:mt-0">
                        <li className="flex items-center">
                            <div>
                                <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                                    Latest stable release
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    {latestYagnaVersion ? (
                                        <span className="text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric">
                                            {latestYagnaVersion.tag_name}
                                        </span>
                                    ) : (
                                        <Skeleton width={100} height={30} />
                                    )}
                                </div>
                            </div>
                        </li>
                        <li className="flex items-center">
                            <div>
                                <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                                    Most adopted
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    {topVersion && latest ? (
                                        <>
                                            <span className="text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric">
                                                {topVersion}
                                            </span>
                                            <span className="text-tremor-default font-medium text-tremor-brand dark:text-dark-tremor-brand-golemblue">
                                                {Math.round(latest[topVersion])}% of nodes
                                            </span>
                                        </>
                                    ) : (
                                        <Skeleton width={100} height={30} />
                                    )}
                                </div>
                            </div>
                        </li>
                    </ul>
                    <div className="order-1 md:order-2">
                        <TimeFrameTabs />
                    </div>
                </div>
            </div>
            <div className="flex justify-between">
                {chartData.length > 0 ? (
                    <AreaChart
                        className="h-72"
                        data={chartData}
                        index="date"
                        categories={versions}
                        colors={SERIES_COLORS}
                        stack={true}
                        maxValue={100}
                        valueFormatter={(value: number) => `${Math.round(value)}%`}
                        yAxisWidth={48}
                        showAnimation={true}
                    />
                ) : (
                    <span>Loading...</span>
                )}
            </div>
        </Card>
    )
}

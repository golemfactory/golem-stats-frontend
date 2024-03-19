import { useState, useEffect } from "react"
import { Card, SparkAreaChart } from "@tremor/react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { classNames } from "@/lib/classNames"

const OnlineStats = () => {
    const { data, error } = useSWR("v2/network/stats/online", fetcher)

    if (error) return <div>Failed to load</div>

    if (!data)
        return (
            <Card>
                <Skeleton height={20} />
                <Skeleton count={5} height={20} className="mt-2" />
            </Card>
        )

    const chartData = data.data.map((item) => ({
        date: new Date(item.date * 1000).toLocaleDateString("en-US"),
        Providers: item.providers,
    }))

    return (
        <Card>
            <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Providers</p>
            <div className="mt-1 flex items-baseline justify-between">
                <p
                    className={classNames(
                        data.stats.changeType === "positive" ? "text-emerald-700 dark:text-emerald-500" : "text-red-700 dark:text-red-500",
                        "text-tremor-title font-semibold"
                    )}
                >
                    {data.stats.value}
                </p>
                <p className="flex items-center space-x-1 text-tremor-default">
                    <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">{data.stats.change}</span>
                    <span
                        className={classNames(
                            data.stats.changeType === "positive"
                                ? "text-emerald-700 dark:text-emerald-500"
                                : "text-red-700 dark:text-red-500"
                        )}
                    >
                        ({data.stats.percentageChange})
                    </span>
                </p>
            </div>
            <SparkAreaChart
                data={chartData}
                index="date"
                categories={["Providers"]}
                showGradient={false}
                colors={data.stats.changeType === "positive" ? ["emerald"] : ["red"]}
                className="mt-4 h-10 w-full"
            />
        </Card>
    )
}

export default OnlineStats

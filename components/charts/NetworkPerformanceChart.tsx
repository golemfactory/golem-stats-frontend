import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, AreaChart } from "@tremor/react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const NetworkPerformanceChart = ({ nodeId }) => {
    const { data, isValidating } = useSWR(`stats/benchmark/network/${nodeId}`, (url) => fetcher(url, { useReputationApi: true }), {})

    const formatData = (apiData) => {
        if (!apiData || !apiData.data) return []

        return apiData.data.map((item) => ({
            date: new Date(item.timestamp * 1000).toISOString().substring(0, 16).replace("T", " "),
            "Download Mbit/s": item.score,
        }))
    }

    const formattedData = formatData(data)
    const latestScore = data?.data?.slice(-1)[0]?.score || 0
    const deviation = data?.deviation || 0
    const summary = data?.summary || ""

    return (
        <Card className="p-0 h-full">
            <div className="p-6">
                <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Download Speed (Mbps)</h3>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    This chart displays the results of a network benchmark, focusing on download speed measured in megabits per second
                    (Mbps).
                </p>
            </div>
            <div className="border-t border-tremor-border p-6 dark:border-dark-tremor-border">
                {isValidating ? (
                    <Skeleton height={250} />
                ) : (
                    <>
                        <div className="md:flex md:items-center md:justify-between">
                            <ul role="list" className="flex flex-wrap items-center gap-x-6 gap-y-4">
                                <li className="flex items-center space-x-2">
                                    <span className="h-3 w-3 shrink-0 rounded-sm bg-tremor-brand" aria-hidden />
                                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                                        Download Speed: <span className="font-semibold">{latestScore} Mbit/s</span>
                                    </p>
                                </li>
                            </ul>
                            <div className="flex justify-end">
                                <span className="mt-4 ml-4 flex-wrap inline-flex items-center gap-x-2.5 whitespace-nowrap rounded-tremor-small bg-tremor-background px-3 py-1 text-tremor-default text-tremor-content-emphasis shadow-tremor-input ring-1 ring-tremor-ring flex-wrap  dark:bg-dark-tremor-background dark:text-dark-tremor-content-emphasis dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring md:mt-0">
                                    Deviation:{" "}
                                    <span
                                        className={`font-semibold ${
                                            summary === "stable"
                                                ? "text-green-500"
                                                : summary === "unstable"
                                                ? "text-red-500"
                                                : "text-yellow-500"
                                        }`}
                                    >
                                        {deviation.toFixed(2)}%
                                    </span>
                                </span>
                            </div>
                        </div>

                        <AreaChart
                            data={formattedData}
                            index="date"
                            noDataText="No reputation data yet. Please check back later."
                            categories={["Download Mbit/s"]}
                            colors={["blue"]}
                            autoMinValue={true}
                            showLegend={false}
                            showGradient={false}
                            className="mt-10 h-72"
                            showAnimation={true}
                        />
                    </>
                )}
            </div>
        </Card>
    )
}

export default NetworkPerformanceChart

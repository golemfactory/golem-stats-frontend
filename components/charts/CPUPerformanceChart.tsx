import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { useNetwork } from "../NetworkContext"
import { Card, AreaChart } from "@tremor/react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const CPUPerformanceChart = ({ nodeId }) => {
    const { network } = useNetwork()
    const { data, isValidating } = useSWR(
        [`stats/benchmark/cpu/${nodeId}`, network.apiUrl],
        ([url, apiUrl]) => fetcher(url, apiUrl, { useReputationApi: true }), // Set `useReputationApi` as needed
        {}
    )

    const formatData = (apiData) => {
        const formattedData = []
        if (!apiData || !apiData.data) {
            // If .data key is missing, return an empty array to avoid errors
            return []
        }

        const formatTimestamp = (timestamp) => {
            const date = new Date(timestamp * 1000)
            return date.toISOString().substring(0, 16).replace("T", " ")
        }

        apiData.data.single.forEach((item) => {
            const multiThreadItem = apiData.data.multi.find((m) => Math.abs(m.timestamp - item.timestamp) < 1)
            if (multiThreadItem) {
                formattedData.push({
                    date: formatTimestamp(item.timestamp),
                    "Single Thread": item.score,
                    "Multi Thread": multiThreadItem.score,
                })
            }
        })

        return formattedData
    }

    const formattedData = formatData(data)
    const latestSingle = data?.data?.single.slice(-1)[0]?.score || 0
    const latestMulti = data?.data?.multi.slice(-1)[0]?.score || 0
    const singleDeviation = data?.singleDeviation || 0
    const multiDeviation = data?.multiDeviation || 0
    const summary = data?.summary || {}

    return (
        <Card className="p-0 h-full">
            <div className="p-6">
                <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">CPU Performance</h3>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    This chart presents the results of CPU benchmark tests, focusing on performance in single-threaded and multi-threaded
                    workloads.
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
                                    <span className="h-3 w-3 shrink-0 rounded-sm bg-tremor-brand" aria-hidden={true} />
                                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                                        Multi-threaded: <span className="font-semibold">{latestMulti}</span>
                                    </p>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="h-3 w-3 shrink-0 rounded-sm bg-red-500 " aria-hidden={true} />
                                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                                        Single-threaded: <span className="font-semibold">{latestSingle}</span>
                                    </p>
                                </li>
                            </ul>
                            <div className="flex justify-end">
                                <span className="mt-4 inline-flex items-center gap-x-2.5 whitespace-nowrap rounded-tremor-small bg-tremor-background px-3 py-1 text-tremor-default text-tremor-content-emphasis shadow-tremor-input ring-1 flex-wrap ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content-emphasis dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring md:mt-0">
                                    Deviation - Single:{" "}
                                    <span
                                        className={`font-semibold ${
                                            summary.single === "stable"
                                                ? "text-green-500"
                                                : summary.single === "varying"
                                                ? "text-yellow-500"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {singleDeviation.toFixed(2)}%
                                    </span>
                                </span>
                                <span className="mt-4 ml-4 inline-flex flex-wrap items-center gap-x-2.5 whitespace-nowrap rounded-tremor-small bg-tremor-background px-3 py-1 text-tremor-default text-tremor-content-emphasis shadow-tremor-input ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content-emphasis dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring md:mt-0">
                                    Deviation - Multi:{" "}
                                    <span
                                        className={`font-semibold ${
                                            summary.single === "stable"
                                                ? "text-green-500"
                                                : summary.single === "varying"
                                                ? "text-yellow-500"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {multiDeviation.toFixed(2)}%
                                    </span>
                                </span>
                            </div>
                        </div>
                        <AreaChart
                            data={formattedData}
                            index="date"
                            noDataText="No reputation data yet. Please check back later."
                            autoMinValue={true}
                            categories={["Multi Thread", "Single Thread"]}
                            colors={["blue", "red"]}
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

export default CPUPerformanceChart

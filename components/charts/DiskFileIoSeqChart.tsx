import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, AreaChart } from "@tremor/react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const DiskFileIoSeqChart = ({ nodeId }) => {
    const { data, isValidating } = useSWR(
        `stats/benchmark/disk/fileio_seq/${nodeId}`,
        (url) => fetcher(url, { useReputationApi: true }),
        {}
    )

    const formatData = (apiData) => {
        if (!apiData) return []

        return apiData.data.fileio_seqwr.map((writeItem) => {
            const readItem = apiData.data.fileio_seqrd.find((read) => Math.abs(read.timestamp - writeItem.timestamp) < 1)
            return {
                date: new Date(writeItem.timestamp * 1000).toISOString().substring(0, 16).replace("T", " "),
                "Write MB/s": writeItem.score,
                "Read MB/s": readItem?.score || 0,
            }
        })
    }

    const formattedData = formatData(data)
    const latestWrite = data?.data?.fileio_seqwr.slice(-1)[0]?.score || 0
    const latestRead = data?.data?.fileio_seqrd.slice(-1)[0]?.score || 0
    const writeDeviation = data?.writeDeviation || 0
    const readDeviation = data?.readDeviation || 0
    const summary = data?.summary || {}

    return (
        <Card className="p-0 h-full">
            <div className="p-6">
                <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    Sequential Disk Throughput (MB/s)
                </h3>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    This chart visualizes the results of disk benchmark tests, focusing on sequential file read and write speeds measured in
                    megabytes per second (MB/s).
                </p>
            </div>
            <div className="border-t border-tremor-border p-6 dark:border-dark-tremor-border">
                {isValidating || !formattedData.length ? (
                    <Skeleton height={250} />
                ) : (
                    <>
                        <div className="md:flex md:items-center md:justify-between">
                            <ul role="list" className="flex flex-wrap items-center gap-x-6 gap-y-4">
                                <li className="flex items-center space-x-2">
                                    <span className="h-3 w-3 shrink-0 rounded-sm bg-tremor-brand" aria-hidden />
                                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                                        Read MB/s: <span className="font-semibold">{latestRead}</span>
                                    </p>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="h-3 w-3 shrink-0 rounded-sm bg-red-500 " aria-hidden />
                                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                                        Write MB/s: <span className="font-semibold">{latestWrite}</span>
                                    </p>
                                </li>
                            </ul>
                            <div className="flex justify-end">
                                <span className="mt-4 inline-flex items-center gap-x-2.5 whitespace-nowrap rounded-tremor-small bg-tremor-background px-3 py-1 text-tremor-default text-tremor-content-emphasis shadow-tremor-input ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content-emphasis dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring md:mt-0">
                                    Deviation - Write:
                                    <span
                                        className={`font-semibold ${
                                            summary.fileio_seqwr === "stable"
                                                ? "text-green-500"
                                                : summary.fileio_seqwr === "varying"
                                                ? "text-yellow-500"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {writeDeviation.toFixed(2)}%
                                    </span>
                                </span>
                                <span className="mt-4 ml-4 inline-flex items-center gap-x-2.5 whitespace-nowrap rounded-tremor-small bg-tremor-background px-3 py-1 text-tremor-default text-tremor-content-emphasis shadow-tremor-input ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content-emphasis dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring md:mt-0">
                                    Deviation - Read:
                                    <span
                                        className={`font-semibold ${
                                            summary.fileio_seqrd === "stable"
                                                ? "text-green-500"
                                                : summary.fileio_seqrd === "varying"
                                                ? "text-yellow-500"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {readDeviation.toFixed(2)}%
                                    </span>
                                </span>
                            </div>
                        </div>
                        <AreaChart
                            data={formattedData}
                            index="date"
                            categories={["Read MB/s", "Write MB/s"]}
                            colors={["blue", "red"]}
                            showLegend={false}
                            showGradient={false}
                            className="mt-10 h-72"
                        />
                    </>
                )}
            </div>
        </Card>
    )
}

export default DiskFileIoSeqChart

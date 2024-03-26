import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, AreaChart } from "@tremor/react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

export const TxAnalysis: React.FC = () => {
    const { data, isValidating } = useSWR("v2/network/token/golemvschain", fetcher, {})

    const formatData = (apiData) =>
        apiData.map(({ date, on_golem, not_golem }) => ({
            date: new Date(date).toLocaleDateString(),
            "On Golem": on_golem,
            "Not on Golem": not_golem,
        }))

    const formattedData = data ? formatData(data) : []

    return (
        <Card className="h-full px-6">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Transaction Analysis</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    Overview of transactions processed on and off the Golem Network.
                </p>
            </div>
            <div className="flex justify-between mt-6">
                {!isValidating && formattedData.length > 0 ? (
                    <AreaChart
                        data={formattedData}
                        index="date"
                        categories={["On Golem", "Not on Golem"]}
                        colors={["green", "red"]}
                        showAnimation={true}
                    />
                ) : (
                    <Skeleton height={250} />
                )}
            </div>
        </Card>
    )
}

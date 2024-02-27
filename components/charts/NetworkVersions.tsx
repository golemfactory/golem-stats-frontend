import React, { useEffect, useState } from "react"
import useSWR from "swr"
import { BarChart, Card, Divider } from "@tremor/react"
import { fetcher } from "@/fetcher"
import Skeleton from "react-loading-skeleton"

export const NetworkVersionAdoption: React.FC = () => {
    const [chartData, setChartData] = useState([])
    const { data } = useSWR("v1/network/versions", fetcher, {
        refreshInterval: 10000,
    })
    const { data: latestYagnaVersion, error: latestYagnaVersionError } = useSWR(
        "https://api.github.com/repos/golemfactory/yagna/releases/latest",
        fetcher,
        {}
    )

    useEffect(() => {
        if (data) {
            const formattedData = data.map((obj: any) => ({
                version: obj.version,
                Providers: obj.count,
            }))
            setChartData(formattedData)
        }
    }, [data])

    const valueFormatter = (value: number) => {
        // Handle formatting here, e.g., converting large numbers
        return value.toString()
    }

    return (
        <Card>
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Network Version Adoptions</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    A breakdown of the different versions of the Yagna that providers and requestors are running.
                </p>
            </div>
            <Divider className="mt-4" />
            <div className="flex justify-between px-6">
                <div>
                    <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                        Latest official release
                    </p>
                    <div className="flex items-baseline space-x-2">
                        {latestYagnaVersion ? (
                            <span className="text-tremor-metric font-semibold dark:text-dark-tremor-content-metric">
                                {latestYagnaVersion.name}
                            </span>
                        ) : (
                            <Skeleton width={250} height={30} />
                        )}
                        <span className="text-tremor-default font-medium text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue"></span>
                    </div>
                </div>
            </div>
            <BarChart
                data={chartData}
                index="version"
                categories={["Providers"]}
                valueFormatter={valueFormatter}
                showLegend={true}
                showYAxis={true}
                yAxisWidth={45}
                showTooltip={true}
                showAnimation={true}
                // Assuming you find the maximum value for the Providers count and want to ensure the Y axis scales correctly:
                maxValue={Math.max(...chartData.map((obj) => obj.Providers), 0) + 50} // Adjust 50 or use another method as buffer or for scaling
            />
        </Card>
    )
}

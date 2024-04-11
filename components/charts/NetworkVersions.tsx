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

    const customTooltip = (props) => {
        const { payload, active } = props
        if (!active || !payload) return null
        console.log(payload)
        return (
            <div className="w-56 rounded-tremor-default border border-tremor-border dark:border-dark-tremor-border bg-tremor-background dark:bg-dark-tremor-background p-2 text-tremor-default shadow-tremor-dropdown">
                {payload.map((category, idx) => (
                    <div key={idx} className="flex flex-1 space-x-2.5">
                        {/* Conditional color coding for the indicator */}
                        <div className={`flex w-1 ${category.payload.rc ? "bg-yellow-500" : "bg-green-500"}`} />
                        <div className="space-y-1">
                            {/* Type line with color coding for the value only */}
                            <p className="font-medium text-tremor-content-emphasis dark:text-white ">
                                Type:{" "}
                                <span className={`font-medium ${category.payload.rc ? "text-yellow-500" : "text-green-500"}`}>
                                    {category.payload.rc ? "Test Version" : "Stable Version"}
                                </span>
                            </p>
                            {/* Version line with conditional color */}
                            <p className={`font-medium text-tremor-content-emphasis dark:text-dark-tremor-content `}>
                                Version: <span className="text-tremor-default dark:text-white">{category.payload.version}</span>
                            </p>
                            {/* Providers remains standard for readability */}
                            <p className="font-medium text-tremor-content-emphasis dark:text-dark-tremor-content">
                                Percentage: <span className="text-tremor-default dark:text-white">{category.payload.percentage}%</span>
                            </p>
                            <p className="font-medium text-tremor-content-emphasis dark:text-dark-tremor-content">
                                Providers: <span className="text-tremor-default dark:text-white">{category.value}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    useEffect(() => {
        if (data) {
            const formattedData = data.map((obj: any) => ({
                version: obj.version,
                Providers: obj.count,
                rc: obj.rc,
                percentage: obj.percentage,
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
                    <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                        Latest Stable Version
                    </h3>
                    <div className="flex items-baseline space-x-2">
                        {latestYagnaVersion ? (
                            <span className="text-tremor-metric font-semibold dark:text-dark-tremor-content-metric font-inter">
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
                customTooltip={customTooltip}
                showLegend={true}
                showYAxis={true}
                yAxisWidth={45}
                showTooltip={true}
                showAnimation={true}
                maxValue={Math.max(...chartData.map((obj) => obj.Providers), 0) + 0}
            />
        </Card>
    )
}

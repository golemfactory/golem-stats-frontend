import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, Tab, TabGroup, TabList, LineChart } from "@tremor/react"
import Skeleton from "react-loading-skeleton"
import { RoundingFunction } from "@/lib/RoundingFunction"

export const TxAverageValueAnalysis = () => {
    const [selectedTimeFrame, setSelectedTimeFrame] = useState("1y")
    const { data, error, isValidating } = useSWR("v2/network/transactions/average-value", fetcher, {})
    const [formattedData, setFormattedData] = useState([])

    useEffect(() => {
        if (data && selectedTimeFrame in data) {
            const newFormattedData = data[selectedTimeFrame].map(({ date, on_golem, not_golem }) => ({
                date: new Date(date).toLocaleDateString(),
                "On Golem": RoundingFunction(on_golem, 2),
                "Not on Golem": RoundingFunction(not_golem, 2),
            }))
            setFormattedData(newFormattedData)
        }
    }, [data, selectedTimeFrame])

    const timeFrames = ["7d", "14d", "1m", "3m", "6m", "1y", "All"]
    const latestOnGolem = formattedData[formattedData.length - 1]?.["On Golem"]
    const latestNotOnGolem = formattedData[formattedData.length - 1]?.["Not on Golem"]

    if (error) return <div>Failed to load data...</div>

    return (
        <Card className="h-full px-6">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Average Transaction Value</h1>
                <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                    This chart visualizes the average value of transactions on the Golem Network compared to those processed directly on the
                    Polygon blockchain. The size of each area represents the total GLM amount for each category on a given day.
                </p>
            </div>
            <div className="border-t border-tremor-border p-6 dark:border-dark-tremor-border">
                <div className="grid md:flex md:items-start md:justify-between">
                    <ul role="list" className="order-2 mt-6 flex flex-wrap items-center gap-x-8 gap-y-8 md:order-1 md:mt-0">
                        <li className="flex items-center">
                            <div>
                                <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                                    Today on Golem
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    <span className={`text-tremor-metric font-semibold `}>{latestOnGolem} </span>
                                    <span className="text-tremor-default font-medium text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue">
                                        GLM
                                    </span>
                                </div>
                            </div>
                        </li>
                        <li className="flex items-center ">
                            <div>
                                <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                                    Today outside Golem
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    <span className={`text-tremor-metric font-semibold `}>{latestNotOnGolem} </span>
                                    <span className="text-tremor-default font-medium text-red-500 dark:text-dark-tremor-brand-golemblue">
                                        GLM
                                    </span>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <div className="order-1 md:order-2">
                        <TabGroup
                            index={timeFrames.findIndex((frame) => frame === selectedTimeFrame)}
                            onIndexChange={(index) => setSelectedTimeFrame(timeFrames[index])}
                        >
                            <TabList variant="solid" className="flex flex-wrap justify-center md:justify-start w-full md:w-fit">
                                {timeFrames.map((frame) => (
                                    <Tab
                                        key={frame}
                                        className={`md:w-auto justify-center py-1 ${
                                            selectedTimeFrame === frame
                                                ? "ui-selected:text-tremor-content-strong ui-selected:dark:text-dark-tremor-content-strong"
                                                : ""
                                        }`}
                                    >
                                        {frame}
                                    </Tab>
                                ))}
                            </TabList>
                        </TabGroup>
                    </div>
                </div>
            </div>
            <div className="flex justify-between">
                {!isValidating && formattedData.length > 0 ? (
                    <LineChart
                        className=" h-72"
                        data={formattedData}
                        index="date"
                        categories={["On Golem", "Not on Golem"]}
                        colors={["green", "red"]}
                        yAxisWidth={30}
                        connectNulls={true}
                    />
                ) : (
                    <Skeleton height={250} />
                )}
            </div>
        </Card>
    )
}

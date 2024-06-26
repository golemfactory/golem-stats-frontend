import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, Tab, TabGroup, TabList, TabPanel, TabPanels, AreaChart } from "@tremor/react"
import { RoundingFunction } from "@/lib/RoundingFunction"

export const HistoricalComputingChart: React.FC = () => {
    const [selectedTimeFrame, setSelectedTimeFrame] = useState("All")
    const { data, error, isValidating } = useSWR("v2/network/historical/computing", fetcher, {})
    const [formattedData, setFormattedData] = useState([])

    useEffect(() => {
        if (data && selectedTimeFrame in data) {
            const newFormattedData = data[selectedTimeFrame].map(({ truncated_date, total }) => ({
                date: new Date(truncated_date).toLocaleDateString(),
                "Simultaneous providers computing": RoundingFunction(total, 2),
            }))
            setFormattedData(newFormattedData)
        }
    }, [data, selectedTimeFrame])

    const timeFrames = ["7d", "14d", "1m", "3m", "6m", "1y", "All"]
    const athValue = Math.max(
        ...timeFrames.map((frame) => {
            if (data && frame in data) {
                return Math.max(...data[frame].map((item) => item.total))
            }
            return 0
        })
    )

    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString() // 86400000 ms = 1 day
    let latestValue = 0
    if (formattedData.length > 0) {
        const yesterdaysData = formattedData.filter((d) => d.date === yesterday)
        latestValue = yesterdaysData.reduce((max, curr) => Math.max(max, curr["Simultaneous providers computing"]), 0)
    }

    if (error) return <div>Failed to load data...</div>

    return (
        <Card className="h-full px-6">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Historical Computing Chart</h1>
                <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                    This chart visualizes the historical number of simultaneous providers computing on the Golem Network. The size of each
                    area represents the total number of providers computing on a given day.
                </p>
            </div>
            <div className="border-t border-tremor-border p-6 dark:border-dark-tremor-border">
                <div className="grid md:flex md:items-start md:justify-between">
                    <ul role="list" className="order-2 mt-6 flex flex-wrap items-center gap-x-8 gap-y-8 md:order-1 md:mt-0">
                        <li className="flex items-center">
                            <div>
                                <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                                    Yesterday
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    <span className={`text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric `}>
                                        {latestValue}{" "}
                                    </span>
                                    <span className="text-tremor-default font-medium capitalize text-tremor-brand dark:text-dark-tremor-brand-golemblue">
                                        Providers
                                    </span>
                                </div>
                            </div>
                        </li>
                        <li className="flex items-center">
                            <div>
                                <h3 className="text-tremor-default font-medium text-red-500 dark:text-dark-tremor-content">
                                    All-time high
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    <span className={`text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric `}>
                                        {athValue}{" "}
                                    </span>
                                    <span className="text-tremor-default font-medium capitalize text-tremor-brand dark:text-dark-tremor-brand-golemblue">
                                        Providers
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
                                    <Tab key={frame}>{frame}</Tab>
                                ))}
                            </TabList>
                        </TabGroup>
                    </div>
                </div>
            </div>
            <div className="flex justify-between">
                {!isValidating && formattedData.length > 0 ? (
                    <AreaChart
                        className="h-72"
                        data={formattedData}
                        index="date"
                        autoMinValue={true}
                        categories={["Simultaneous providers computing"]}
                        yAxisWidth={30}
                        showAnimation={true}
                        autoMinValue={true}
                    />
                ) : (
                    <span>Loading...</span>
                )}
            </div>
        </Card>
    )
}

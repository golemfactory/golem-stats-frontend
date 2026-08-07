import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, Tab, TabGroup, TabList, AreaChart } from "@tremor/react"

export const HistoricalComputingChart: React.FC = () => {
    const [selectedTimeFrame, setSelectedTimeFrame] = useState("7d")
    const { data, error } = useSWR("v2/network/historical/computing/combined", fetcher, {
        refreshInterval: 60000,
    })
    const [formattedData, setFormattedData] = useState([])

    const timeFrames = ["24h", "7d"]

    const formatLabel = (isoDate: string, timeFrame: string) => {
        const date = new Date(isoDate)
        if (timeFrame === "24h") {
            return date.toLocaleTimeString(navigator.language, { hour: "2-digit", minute: "2-digit" })
        }
        return date.toLocaleString(navigator.language, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }

    useEffect(() => {
        if (data && selectedTimeFrame in data) {
            const newFormattedData = data[selectedTimeFrame].map(({ truncated_date, total }) => ({
                date: formatLabel(truncated_date, selectedTimeFrame),
                "Providers computing": total,
            }))
            setFormattedData(newFormattedData)
        }
    }, [data, selectedTimeFrame])

    const rightNow = data?.["24h"]?.length ? data["24h"][data["24h"].length - 1].total : 0
    const weeklyPeak = data?.["7d"]?.length ? Math.max(...data["7d"].map((item) => item.total)) : 0

    if (error) return <div>Failed to load data...</div>

    return (
        <Card className="h-full px-6">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Computing on the Network</h1>
                <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                    The number of providers simultaneously computing tasks for requestors on the Golem Network — the last 24 hours at
                    5-minute resolution and the last 7 days at hourly resolution.
                </p>
            </div>
            <div className="border-t border-tremor-border p-6 dark:border-dark-tremor-border">
                <div className="grid md:flex md:items-start md:justify-between">
                    <ul role="list" className="order-2 mt-6 flex flex-wrap items-center gap-x-8 gap-y-8 md:order-1 md:mt-0">
                        <li className="flex items-center">
                            <div>
                                <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                                    Right now
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric">
                                        {rightNow}{" "}
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
                                    7-day peak
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric">
                                        {weeklyPeak}{" "}
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
                {formattedData.length > 0 ? (
                    <AreaChart
                        className="h-72"
                        data={formattedData}
                        index="date"
                        autoMinValue={true}
                        categories={["Providers computing"]}
                        colors={["blue"]}
                        yAxisWidth={30}
                        showAnimation={true}
                    />
                ) : (
                    <span>Loading...</span>
                )}
            </div>
        </Card>
    )
}

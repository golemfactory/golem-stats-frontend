import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, Tab, TabGroup, TabList, AreaChart } from "@tremor/react"
import Skeleton from "react-loading-skeleton"

export const TxTypeCountAnalysis = () => {
    const [selectedTimeFrame, setSelectedTimeFrame] = useState("1y")
    const { data, error, isValidating } = useSWR("v2/network/transactions/daily-type-counts", fetcher, {})
    const [formattedData, setFormattedData] = useState([])

    useEffect(() => {
        if (data && selectedTimeFrame in data) {
            const newFormattedData = data[selectedTimeFrame].map(({ date, singleTransfer, batched }) => ({
                date: new Date(date).toLocaleDateString(),
                "Single Transfer": singleTransfer,
                Batched: batched,
            }))
            setFormattedData(newFormattedData)
        }
    }, [data, selectedTimeFrame])

    const timeFrames = ["7d", "14d", "1m", "3m", "6m", "1y", "All"]
    const latestSingleTransfer = formattedData[formattedData.length - 1]?.["Single Transfer"]
    const latestBatched = formattedData[formattedData.length - 1]?.["Batched"]

    if (error) return <div>Failed to load data...</div>

    return (
        <Card className="h-full px-6">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Golem Transactions Type</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    Breakdown of single vs batched transactions on the network. Batched transactions include multiple transfers in a single
                    transaction. Batching was introduced as a feature in the Golem Network v0.15.0 release.
                </p>
            </div>
            <div className="border-t border-tremor-border p-6 dark:border-dark-tremor-border">
                <div className="grid md:flex md:items-start md:justify-between">
                    <ul role="list" className="order-2 mt-6 flex flex-wrap items-center gap-x-8 gap-y-8 md:order-1 md:mt-0">
                        <li className="flex items-center">
                            <div>
                                <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                                    Single Transfer
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    <span className={`text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric `}>
                                        {latestSingleTransfer}{" "}
                                    </span>
                                    <span className="text-tremor-default font-medium capitalize text-cyan-500 dark:text-dark-tremor-brand-golemblue">
                                        transactions
                                    </span>
                                </div>
                            </div>
                        </li>
                        <li className="flex items-center ">
                            <div>
                                <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                                    Batched
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    <span className={`text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric `}>
                                        {latestBatched}{" "}
                                    </span>
                                    <span className="text-tremor-default font-medium capitalize text-red-500 dark:text-dark-tremor-brand-golemblue">
                                        transactions
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
            <div className="flex justify-between ">
                {!isValidating && formattedData.length > 0 ? (
                    <AreaChart
                        data={formattedData}
                        index="date"
                        categories={["Single Transfer", "Batched"]}
                        colors={["cyan", "red"]}
                        showAnimation={true}
                    />
                ) : (
                    <Skeleton height={250} />
                )}
            </div>
        </Card>
    )
}

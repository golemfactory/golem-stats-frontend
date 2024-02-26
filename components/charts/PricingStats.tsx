import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { useState } from "react"
import { AreaChart, Card, Tab, TabGroup, TabList, TabPanel, TabPanels, Select } from "@tremor/react"
import { RoundingFunction } from "@/lib/RoundingFunction"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const PricingStats = () => {
    const { data: metricData } = useSWR("v2/network/pricing/historical", fetcher, { refreshInterval: 60000 })
    const { data, error } = useSWR("v2/network/pricing/1h", fetcher, {
        refreshInterval: 10000,
    })
    const [selectedTimeFrame, setSelectedTimeFrame] = useState("7d")
    const [selectedMetric, setSelectedMetric] = useState("Median")
    const tabs = [{ name: "Median" }, { name: "Average" }]

    if (!metricData || !data)
        return (
            <Card>
                <div className="relative p-6">
                    <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Provider Pricing</h1>
                    <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                        The median and average pricing for CPU, Env, and Start based upon the list of providers who received a task in the
                        time frame selected.
                    </p>
                </div>
                <div>
                    <Skeleton height={50} />
                    <Skeleton height={500} />
                </div>
            </Card>
        )
    const timeFrames = Object.keys(metricData)
    const formatDate = (dateString, timeFrame) => {
        const date = new Date(dateString * 1000)
        let formatOptions = {}
        switch (timeFrame) {
            case "7d":
            case "1m":
                formatOptions = { month: "short", day: "numeric" }
                break
            case "6m":
            case "1y":
            case "All":
                formatOptions = { month: "short", day: "numeric", year: "numeric" }
                break
        }
        return date.toLocaleString("en-US", formatOptions)
    }
    const MetricCardSummary = ({ unit }) => {
        return (
            <div className="flex justify-between">
                <div>
                    <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">The past hour</p>
                    <div className="flex gap-4">
                        <div className="flex items-baseline space-x-2">
                            <span className="text-tremor-metric font-semibold">
                                {RoundingFunction(data[`cpu_${unit.toLowerCase()}`], 3)}
                            </span>
                            <span className="text-tremor-default font-medium text-golemblue">CPU/h</span>
                        </div>

                        <div className="flex items-baseline space-x-2">
                            <span className="text-tremor-metric font-semibold">
                                {RoundingFunction(data[`env_${unit.toLowerCase()}`], 3)}
                            </span>
                            <span className="text-tremor-default font-medium text-golemblue">Env/h</span>
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-tremor-metric font-semibold">
                                {RoundingFunction(data[`start_${unit.toLowerCase()}`], 3)}
                            </span>
                            <span className="text-tremor-default font-medium text-golemblue">Start Price</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    //     <span className="text-tremor-metric font-medium">
    //     Env: {RoundingFunction(data[`env_${unit.toLowerCase()}`], 3)}
    // </span>
    // <span className="text-tremor-metric font-medium">
    //     Start: {RoundingFunction(data[`start_${unit.toLowerCase()}`], 3)}
    // </span>
    return (
        <Card>
            <div className="relative p-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Provider Pricing</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    The median and average pricing for CPU, Env, and Start based upon the list of providers who received a task in the time
                    frame selected.
                </p>
            </div>

            <TabGroup>
                <TabList className="px-6">
                    {tabs.map((tab, index) => (
                        <Tab
                            key={index}
                            onClick={() => setSelectedMetric(tab.name)}
                            className="font-medium hover:border-tremor-content-subtle dark:hover:border-dark-tremor-content-subtle dark:hover:text-dark-tremor-content"
                        >
                            {tab.name}
                        </Tab>
                    ))}
                </TabList>
                <TabPanels>
                    {tabs.map((tab, index) => (
                        <TabPanel className="px-6 py-4">
                            <div className="grid md:flex md:items-start md:justify-between">
                                <MetricCardSummary unit={selectedMetric} />
                                <div className="order-1 md:order-2 pb-8  pt-4">
                                    <TabGroup>
                                        <TabList variant="solid" className="w-full md:w-fit">
                                            {timeFrames.map((frame) => (
                                                <Tab
                                                    key={frame}
                                                    onClick={() => setSelectedTimeFrame(frame)}
                                                    className="w-full justify-center py-1 ui-selected:text-tremor-content-strong ui-selected:dark:text-dark-tremor-content-strong md:w-fit md:justify-start"
                                                >
                                                    {frame}
                                                </Tab>
                                            ))}
                                        </TabList>
                                    </TabGroup>
                                </div>
                            </div>
                            <AreaChart
                                data={(metricData[selectedTimeFrame] || []).map((item) => {
                                    // Transforming the item
                                    const transformedItem = {
                                        ...item,
                                        date: formatDate(item.date, selectedTimeFrame),
                                        "CPU/h": selectedMetric === "Median" ? item.median_cpu : item.average_cpu,
                                        "Env/h": selectedMetric === "Median" ? item.median_env : item.average_env,
                                        "Start Price": selectedMetric === "Median" ? item.median_start : item.average_start,
                                    }

                                    return transformedItem
                                })}
                                index="date"
                                categories={["CPU/h", "Env/h", "Start Price"]}
                                colors={["blue-400", "golemblue", "golemmain"]}
                                showLegend={true}
                                showGradient={false}
                                showAnimation={true}
                                yAxisWidth={38}
                                valueFormatter={(number) => `${Intl.NumberFormat("us").format(number)}`}
                                className="h-72"
                            />
                        </TabPanel>
                    ))}
                </TabPanels>
            </TabGroup>
        </Card>
    )
}

export default PricingStats

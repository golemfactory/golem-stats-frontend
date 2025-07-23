import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { useState } from "react"
import { useNetwork } from "../NetworkContext"
import { AreaChart, Card, Tab, TabGroup, TabList, TabPanel, TabPanels, Select } from "@tremor/react"
import { RoundingFunction } from "@/lib/RoundingFunction"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { MultiSelect, MultiSelectItem, SearchSelect, SearchSelectItem, SelectItem } from "@tremor/react"

interface MetricCardSummaryProps {
    unit: string
}

interface TimeFrameFormatOptions {
    month: "short"
    day: "numeric"
    year?: "numeric"
}

interface PricingDataItem {
    date: number
    median_cpu: number
    average_cpu: number
    median_env: number
    average_env: number
    median_start: number
    average_start: number
}

function formatPriceValue(value: number): string {
    if (!value || isNaN(value)) return "0"
    if (Math.abs(value) >= 0.01) {
        return value.toFixed(2)
    } else if (Math.abs(value) >= 0.0001) {
        return value.toFixed(4).replace(/\.?0+$/, "")
    } else {
        // Show up to 8 decimals, trim trailing zeros
        return value.toFixed(8).replace(/\.?0+$/, "")
    }
}

const PricingStats = () => {
    const { network: networkContext } = useNetwork()
    const [network, setNetwork] = useState("mainnet")
    const { data: metricData } = useSWR(
        ["v2/network/pricing/historical", networkContext.apiUrl],
        ([url, apiUrl]) => fetcher(url, apiUrl),
        { refreshInterval: 60000 }
    )
    const { data, error } = useSWR(["v2/network/pricing/1h", networkContext.apiUrl], ([url, apiUrl]) => fetcher(url, apiUrl), {
        refreshInterval: 10000,
    })
    const [selectedTimeFrame, setSelectedTimeFrame] = useState("7d")
    const [selectedMetric, setSelectedMetric] = useState("Median")
    const tabs = [{ name: "Median" }, { name: "Average" }]

    const isValidNumber = (value: number) => {
        return typeof value === "number" && !isNaN(value)
    }
    // Initialize values to a default (e.g., null or 0)
    let cpuValue = null
    let envValue = null
    let startValue = null

    // Check if data is available before trying to access its properties
    if (data && data[network] && metricData) {
        const networkData = data[network]
        cpuValue = selectedMetric === "Median" ? networkData.cpu_median : networkData.cpu_average
        envValue = selectedMetric === "Median" ? networkData.env_median : networkData.env_average
        startValue = selectedMetric === "Median" ? networkData.start_median : networkData.start_average
    }

    if (!metricData || !data) {
        console.log("No data available", metricData, data)
        return (
            <Card>
                <div className="relative px-6 mb-6">
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
    }

    const timeFrames = metricData && metricData[network] ? Object.keys(metricData[network]) : []
    const formatDate = (dateString: number, timeFrame: string): string => {
        const date = new Date(dateString * 1000)
        let formatOptions: TimeFrameFormatOptions = {
            month: "short",
            day: "numeric",
        }

        if (["6m", "1y", "All"].includes(timeFrame)) {
            formatOptions.year = "numeric"
        }
        return date.toLocaleString("en-US", formatOptions)
    }

    const MetricCardSummary = ({ unit }: MetricCardSummaryProps) => {
        return (
            <div className="flex justify-between">
                <div>
                    <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">The past hour</h3>
                    <div className="flex gap-4">
                        <div className="flex items-baseline space-x-2">
                            <span className="text-tremor-metric font-semibold dark:text-dark-tremor-content-metric font-inter">
                                {isValidNumber(cpuValue) ? formatPriceValue(cpuValue) : "0"}
                            </span>
                            <span className="text-tremor-default font-medium text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue">
                                CPU/h
                            </span>
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-tremor-metric font-semibold dark:text-dark-tremor-content-metric font-inter">
                                {isValidNumber(envValue) ? formatPriceValue(envValue) : "0"}
                            </span>
                            <span className="text-tremor-default font-medium text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue">
                                Env/h
                            </span>
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-tremor-metric font-semibold dark:text-dark-tremor-content-metric font-inter">
                                {isValidNumber(startValue) ? formatPriceValue(startValue) : "0"}
                            </span>
                            <span className="text-tremor-default font-medium text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue">
                                Start Price
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-start p-6">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Provider Pricing</h1>
                    <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                        The median and average pricing for CPU, Env, and Start based upon the list of providers who received a task in the
                        time frame selected.
                    </p>
                </div>
                <div>
                    <Select value={network} onValueChange={setNetwork}>
                        <SelectItem value="mainnet">Mainnet</SelectItem>
                        <SelectItem value="testnet">Testnet</SelectItem>
                    </Select>
                </div>
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
                        <TabPanel key={index} className="px-6 py-4">
                            <div className="grid md:flex md:items-start md:justify-between">
                                <MetricCardSummary unit={selectedMetric} />
                                <div className="order-1 md:order-2 pb-8 pt-4">
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
                                data={
                                    metricData && metricData[network] && metricData[network][selectedTimeFrame]
                                        ? metricData[network][selectedTimeFrame].map((item: PricingDataItem) => ({
                                              ...item,
                                              date: formatDate(item.date, selectedTimeFrame),
                                              "CPU/h": selectedMetric === "Median" ? item.median_cpu : item.average_cpu,
                                              "Env/h": selectedMetric === "Median" ? item.median_env : item.average_env,
                                              "Start Price": selectedMetric === "Median" ? item.median_start : item.average_start,
                                          }))
                                        : []
                                }
                                autoMinValue={true}
                                index="date"
                                categories={["CPU/h", "Env/h", "Start Price"]}
                                colors={["blue-400", "golemblue", "golemmain"]}
                                showLegend={true}
                                showGradient={false}
                                showAnimation={true}
                                yAxisWidth={38}
                                valueFormatter={(number) =>
                                    Intl.NumberFormat("en-US", {
                                        minimumFractionDigits: 6,
                                        maximumFractionDigits: 8,
                                    }).format(number)
                                }
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

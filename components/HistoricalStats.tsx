import { useState } from "react"
import { AreaChart, Card, Tab, TabGroup, TabList, TabPanel, TabPanels, Select, SelectItem } from "@tremor/react"
import { GolemIcon } from "./svg/GolemIcon"

function getProviderType(name: string): string {
    if (name === "vm-nvidia") {
        return "GPU"
    } else if (name === "vm") {
        return "CPU"
    } else {
        return name
    }
}

const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null
    const categoryPayload = payload[0]

    if (!categoryPayload) return null

    // Adjust the category name according to your requirements
    const formatCategoryName = (name) => {
        if (name === "online") return "Providers online"
        return name.charAt(0).toUpperCase() + name.slice(1) // Capitalize the first letter
    }

    // Adjusted valueFormatter to handle TB for disk and memory
    const valueFormatter = (value, name) => {
        const formattedValue = Intl.NumberFormat("us").format(value)
        if (["disk", "memory"].includes(name)) {
            return `${formattedValue} TB` // Append 'TB' for disk and memory
        }
        return formattedValue // Use the value as-is for other metrics
    }

    return (
        <div className="w-52 rounded-tremor-default border border-tremor-border bg-tremor-background text-tremor-default shadow-tremor-dropdown dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:shadow-dark-tremor-dropdown">
            <div className="rounded-t-tremor-default border-b border-tremor-border bg-tremor-background-muted px-2.5 py-2 dark:border-dark-tremor-border dark:bg-dark-tremor-background">
                <p className="font-medium text-tremor-content dark:text-dark-tremor-content">{label}</p>
            </div>
            <div className="flex w-full items-center justify-between space-x-4 px-2.5 py-2">
                <div className="flex items-center space-x-2 truncate">
                    <span
                        className="h-2.5 w-2.5 shrink-0 rounded-tremor-full bg-tremor-brand dark:bg-dark-tremor-brand"
                        aria-hidden={true}
                    />
                    <p className="truncate text-tremor-content dark:text-dark-tremor-content">{formatCategoryName(categoryPayload.name)}</p>
                </div>
                <p className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {valueFormatter(categoryPayload.value, categoryPayload.name)}
                </p>
            </div>
        </div>
    )
}

const NetworkStats = ({ metricData }) => {
    const [selectedRuntime, setSelectedRuntime] = useState(Object.keys(metricData)[2])
    const [selectedTimeFrame, setSelectedTimeFrame] = useState("1y")
    const tabs = [
        { name: "Providers", metric: "online", unit: "Providers" },
        { name: "Cores", metric: "cores", unit: "Cores" },
        { name: "Memory", metric: "memory", unit: "Terabytes" },
        { name: "Disk", metric: "disk", unit: "Terabytes" },
        { name: "GPU", metric: "gpus", unit: "GPUs" }, // Added GPUs tab
    ]
    const timeFrames = Object.keys(metricData[selectedRuntime])
    const latest1dData = metricData[selectedRuntime]["1d"][metricData[selectedRuntime]["1d"].length - 1] || {}
    const formatDate = (dateString, timeFrame) => {
        const date = new Date(dateString * 1000)
        let formatOptions = {}

        switch (timeFrame) {
            case "1d":
                formatOptions = {
                    hour: "2-digit",
                    minute: "2-digit",
                }
                break
            case "7d":
                formatOptions = {
                    month: "short",
                    day: "numeric",
                }
                break
            case "1m":
            case "1y":
                formatOptions = {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }
                break
            case "All":
                formatOptions = {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }
                break
        }

        return date.toLocaleString(navigator.language, formatOptions)
    }
    const MetricCardSummary = ({ category, unit }) => {
        const latestDataPoint = latest1dData[category] || 0
        const total = `${Intl.NumberFormat("us").format(latestDataPoint)}`
        return (
            <div className="flex justify-between">
                <div>
                    <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">Right now</h3>
                    <div className="flex items-baseline space-x-2">
                        <span className="text-tremor-metric font-semibold dark:text-dark-tremor-content-metric font-inter">{total}</span>
                        <span className="text-tremor-default font-medium text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue">
                            {unit}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-start">
                <div className="px-6 mb-6">
                    <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Network Statistics</h1>
                    <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                        Overview of Golem Network's capacity per provider type, with real-time and trend data for providers online, cores,
                        memory, disk space and GPU's available.
                    </p>
                </div>
                <div className="px-6 mb-4">
                    <label htmlFor="runtime" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter">
                        Runtime
                    </label>
                    <Select value={selectedRuntime} onValueChange={setSelectedRuntime}>
                        {Object.keys(metricData)
                            .sort((a, b) => getProviderType(a).localeCompare(getProviderType(b)))
                            .map((runtime) => (
                                <SelectItem key={runtime} value={runtime}>
                                    {getProviderType(runtime)}
                                </SelectItem>
                            ))}
                    </Select>
                </div>
            </div>

            <TabGroup>
                <TabList className="px-6">
                    {tabs
                        .filter((tab) => selectedRuntime === "vm-nvidia" || tab.name !== "GPU")
                        .map((tab, index) => (
                            <Tab
                                key={index}
                                className="font-medium hover:border-tremor-content-subtle dark:hover:border-dark-tremor-content-subtle dark:hover:text-dark-tremor-content"
                            >
                                {tab.name}
                            </Tab>
                        ))}
                </TabList>

                <TabPanels>
                    {tabs.map((tab, index) => (
                        <TabPanel key={index}>
                            <div className="grid md:flex md:items-start md:justify-between px-6 py-4">
                                <MetricCardSummary category={tab.metric} unit={tab.unit} />
                                <div className="order-1 md:order-2 pb-8 pt-4">
                                    <TabGroup defaultIndex={3}>
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
                                data={metricData[selectedRuntime][selectedTimeFrame].map((item) => ({
                                    ...item,
                                    date: formatDate(item.date, selectedTimeFrame),
                                }))}
                                index="date"
                                categories={[tab.metric]}
                                showLegend={false}
                                showGradient={false}
                                showAnimation={true}
                                showTooltip={true}
                                customTooltip={customTooltip}
                                yAxisWidth={38}
                                valueFormatter={(number) => Intl.NumberFormat("us").format(number)}
                                className="h-72"
                            />
                        </TabPanel>
                    ))}
                </TabPanels>
            </TabGroup>
        </Card>
    )
}

export default NetworkStats

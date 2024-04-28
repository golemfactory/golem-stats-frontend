import { useState, useEffect } from "react"
import useSWR from "swr"
import { RiArrowRightSLine } from "@remixicon/react"
import { Card, DonutChart, List, ListItem, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { fetcher } from "@/fetcher"

function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
}

const currencyFormatter = (number) => {
    return "$" + Intl.NumberFormat("us").format(number).toString()
}

const ProviderUptimeDonut = () => {
    const { data, error } = useSWR("v2/network/online/donut", fetcher)
    const [networkSummary, setNetworkSummary] = useState([])

    useEffect(() => {
        if (data) {
            const prepareData = (networkData) => {
                const total = networkData.totalOnline
                return [
                    {
                        name: "80% and over",
                        amount: networkData["80_and_over"],
                        borderColor: "border-green-500",
                        share: ((networkData["80_and_over"] / total) * 100).toFixed(1) + "%",
                    },
                    {
                        name: "50 to 79%",
                        amount: networkData["50_to_79"],
                        borderColor: "border-yellow-500",
                        share: ((networkData["50_to_79"] / total) * 100).toFixed(1) + "%",
                    },
                    {
                        name: "30 to 49%",
                        amount: networkData["30_to_49"],
                        borderColor: "border-orange-500",
                        share: ((networkData["30_to_49"] / total) * 100).toFixed(1) + "%",
                    },
                    {
                        name: "Below 30%",
                        amount: networkData["below_30"],
                        borderColor: "border-red-500",
                        share: ((networkData["below_30"] / total) * 100).toFixed(1) + "%",
                    },
                ]
            }

            setNetworkSummary([
                {
                    name: "Mainnet",
                    data: prepareData(data.mainnet),
                    total: data.mainnet.totalOnline,
                },
                {
                    name: "Testnet",
                    data: prepareData(data.testnet),
                    total: data.testnet.totalOnline,
                },
            ])
        }
    }, [data])

    if (error) return <div>Failed to load</div>
    if (!data) return <div>Loading...</div>

    return (
        <>
            <Card className="h-full">
                <div className="px-6 mb-6">
                    <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Provider Uptime</h1>
                    <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                        The chart shows the total uptime percentage for only those providers who are currently online on the Golem Network,
                        calculated from the time they first joined the network.
                    </p>
                </div>
                <TabGroup>
                    <TabList className="px-6 pt-4">
                        {networkSummary.map((network) => (
                            <Tab key={network.name}>{network.name}</Tab>
                        ))}
                    </TabList>
                    <TabPanels className="mt-8">
                        {networkSummary.map((network) => (
                            <TabPanel key={network.name}>
                                <div className="px-6 pb-6">
                                    <DonutChart
                                        data={network.data}
                                        category="amount"
                                        index="name"
                                        label={""}
                                        showAnimation={true}
                                        valueFormatter={(val) => Intl.NumberFormat("us").format(val)}
                                        showTooltip={true}
                                        colors={["emerald", "yellow", "orange", "red"]}
                                    />
                                </div>
                                <List className="mt-2 border-t border-tremor-border dark:border-dark-tremor-border">
                                    {network.data.map((item) => (
                                        <ListItem
                                            key={item.name}
                                            className="group relative space-x-4 truncate !py-0 !pr-4 hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background-muted"
                                        >
                                            <div
                                                className={classNames(item.borderColor, "flex h-12 items-center truncate border-l-2 pl-4")}
                                            >
                                                <span className="truncate group-hover:text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis group-hover:dark:text-dark-tremor-content-strong">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1.5">
                                                <span className="font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                                    {Intl.NumberFormat("us").format(item.amount)}{" "}
                                                    <span className="font-normal text-tremor-content dark:text-dark-tremor-content">
                                                        ({item.share})
                                                    </span>
                                                </span>
                                                <RiArrowRightSLine
                                                    className="dark:text-darkt-tremor-content-subtle h-4 w-4 shrink-0 text-tremor-content-subtle group-hover:text-tremor-content group-hover:dark:text-dark-tremor-content"
                                                    aria-hidden={true}
                                                />
                                            </div>
                                        </ListItem>
                                    ))}
                                </List>
                            </TabPanel>
                        ))}
                    </TabPanels>
                </TabGroup>
            </Card>
        </>
    )
}

export default ProviderUptimeDonut

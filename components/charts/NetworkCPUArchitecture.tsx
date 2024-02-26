import React, { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, Divider, DonutChart, List, ListItem, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { fetcher } from "@/fetcher"

const valueFormatter = (number) => number.toString()

export const NetworkCPUArchitecture: React.FC = () => {
    const { data: apiData } = useSWR("v2/network/online", fetcher, {
        refreshInterval: 10000,
    })

    const [chartData, setChartData] = useState([
        { name: "x86_64", amount: 0, borderColor: "border-blue-500" },
        { name: "Aarch64", amount: 0, borderColor: "border-indigo-500" },
    ])

    useEffect(() => {
        if (apiData) {
            let x86_64 = 0
            let Aarch64 = 0

            apiData.forEach((obj: any) => {
                const firstRuntimeKey = Object.keys(obj.runtimes)[0]
                if (obj.runtimes[firstRuntimeKey].properties?.["golem.inf.cpu.architecture"]) {
                    const architecture = obj.runtimes[firstRuntimeKey].properties["golem.inf.cpu.architecture"]
                    if (architecture === "x86_64") {
                        x86_64++
                    } else if (architecture === "aarch64") {
                        Aarch64++
                    }
                }
            })

            setChartData([
                { name: "x86_64", amount: x86_64, borderColor: "border-blue-500" },
                { name: "Aarch64", amount: Aarch64, borderColor: "border-indigo-500" },
            ])
        }
    }, [apiData])

    return (
        <Card className="h-full">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Network CPU Architecture</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    A breakdown of the different CPU architectures that providers are running.
                </p>
            </div>
            <TabGroup>
                <TabList className="px-6">
                    <Tab>Architecture Distribution</Tab>
                </TabList>
                <TabPanels className="px-6 pb-6">
                    <TabPanel>
                        <DonutChart
                            className="mt-8"
                            data={chartData}
                            category="amount"
                            index="name"
                            showAnimation={true}
                            valueFormatter={valueFormatter}
                            showTooltip={true}
                        />
                        <List className="mt-2">
                            {chartData.map((item) => (
                                <ListItem key={item.name} className="space-x-4 truncate">
                                    <div className={`${item.borderColor} flex h-8 items-center truncate border-l-[2.5px] pl-4`}>
                                        <span className="truncate dark:text-dark-tremor-content-emphasis">{item.name}</span>
                                    </div>
                                    <span className="font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                        {valueFormatter(item.amount)}
                                    </span>
                                </ListItem>
                            ))}
                        </List>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </Card>
    )
}

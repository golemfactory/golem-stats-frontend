import React from "react"
import useSWR from "swr"
import { Card, Divider, DonutChart, List, ListItem } from "@tremor/react"
import { fetcher } from "@/fetcher"

const valueFormatter = (number) => number.toLocaleString()

const generateChartColor = (name) => {
    switch (name) {
        case "x86_64":
            return "#22c55d"
        default:
            return "#8b07cd"
    }
}

export const NetworkCpuArchitectureChart: React.FC = () => {
    const { data: apiResponse } = useSWR("v2/network/stats/cpuarchitecture", fetcher, {
        refreshInterval: 10000,
    })

    const chartData = Object.entries(apiResponse || {}).map(([name, amount]) => ({
        name,
        amount,
        color: generateChartColor(name),
    }))

    return (
        <Card className="h-full">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Network CPU Architecture</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    Distribution of CPU architectures across the network.
                </p>
            </div>
            <Divider />
            <DonutChart
                className="mt-8"
                data={chartData}
                category="amount"
                index="name"
                colors={["purple", "green"]}
                showAnimation={true}
                valueFormatter={valueFormatter}
                showTooltip={true}
            />
            <List className="mt-2 px-6">
                {chartData.map((item, index) => (
                    <ListItem key={index} className="space-x-4 truncate">
                        <div className="flex h-8 items-center truncate pl-4">
                            <span className="rounded-full w-3 h-3" style={{ backgroundColor: item.color }}></span>
                            <span className="truncate dark:text-dark-tremor-content-emphasis ml-2">{item.name}</span>
                        </div>
                        <span className="font-medium tabular-nums text-tremor-content-strong dark:text-dark-tremor-content-strong">
                            {valueFormatter(item.amount)}
                        </span>
                    </ListItem>
                ))}
            </List>
        </Card>
    )
}

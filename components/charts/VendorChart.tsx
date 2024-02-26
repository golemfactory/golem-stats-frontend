import React, { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, Divider, DonutChart, List, ListItem, Color } from "@tremor/react"
import { fetcher } from "@/fetcher"

const valueFormatter = (number) => number.toString()

export const NetworkCPUVendorDistribution: React.FC = () => {
    const { data: apiResponse } = useSWR("v2/network/online", fetcher, {
        refreshInterval: 10000,
    })

    const [chartData, setChartData] = useState([
        { name: "Intel", amount: 0, color: "#0000F9" as Color },
        { name: "AMD", amount: 0, color: "rgb(234, 53, 70)" as Color },
        { name: "Other", amount: 0, color: "#8b07cd" as Color },
    ])

    useEffect(() => {
        let intelCount = 0
        let amdCount = 0
        let thirdTypeCpu = 0

        apiResponse?.forEach((obj) => {
            const vendor = obj.runtimes?.vm?.properties["golem.inf.cpu.vendor"]
            if (vendor) {
                if (vendor === "GenuineIntel") {
                    intelCount++
                } else if (vendor === "AuthenticAMD") {
                    amdCount++
                } else {
                    thirdTypeCpu++
                }
            }
        })

        setChartData([
            { name: "Intel", amount: intelCount, color: "#0000F9" as Color },
            { name: "AMD", amount: amdCount, color: "rgb(234, 53, 70)" as Color },
            { name: "Other", amount: thirdTypeCpu, color: "#8b07cd" as Color },
        ])
    }, [apiResponse])

    return (
        <Card className="h-full">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Network CPU Vendor Distribution</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    Distribution of CPU vendors across the network.
                </p>
            </div>
            <Divider />
            <DonutChart
                className="mt-8"
                data={chartData.map((item) => ({ ...item, amount: item.amount }))}
                category="amount"
                index="name"
                colors={["blue", "red", "indigo"]}
                showAnimation={true}
                valueFormatter={valueFormatter}
                showTooltip={true}
            />
            <List className="mt-2 px-6">
                {chartData.map((item) => (
                    <ListItem key={item.name} className="space-x-4 truncate">
                        <div className={`flex h-8 items-center truncate pl-4`}>
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

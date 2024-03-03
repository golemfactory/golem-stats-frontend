import { useState, useEffect } from "react"
import useSWR from "swr"
import { AreaChart, Card } from "@tremor/react"
import { fetcher } from "@/fetcher"
import Skeleton from "react-loading-skeleton"

const NodeActivityChart = ({ nodeId }) => {
    const { data, error } = useSWR(`v1/provider/node/${nodeId}/activity`, fetcher, {
        refreshInterval: 10000,
    })
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        if (!data || error) return
        try {
            const formattedData = data.data.result[0].values.map(([time, value]) => ({
                date: new Date(time * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                Status: value > 0 ? 1 : 0,
            }))
            setChartData(formattedData)
        } catch (error) {
            console.error(error, data)
        }
    }, [data, error])

    const valueFormatter = (number) => (number > 0 ? "Computing" : "Idle")

    return (
        <Card className="h-full">
            <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Node Activity</h3>
            <AreaChart
                data={chartData}
                index="date"
                categories={["Status"]}
                showLegend={false}
                showGradient={true}
                showAnimation={true}
                valueFormatter={valueFormatter}
                showYAxis={true}
                className="mt-6 h-48"
            />
        </Card>
    )
}

export default NodeActivityChart

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, LineChart } from "@tremor/react"
import Skeleton from "react-loading-skeleton"

export const TxAverageValueAnalysis: React.FC = () => {
    const { data, isValidating } = useSWR("v2/network/transactions/average-value", fetcher)
    const [value, setValue] = useState(null)

    const chartData =
        data?.map(({ date, average_value }) => ({
            date: new Date(date).toLocaleDateString(),
            "Average Value": average_value,
        })) || []

    return (
        <Card className="h-full p-6">
            <div className="mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Average Transaction Value</h1>
                <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                    Daily average transaction values over time.
                </p>
            </div>
            {!isValidating && chartData.length > 0 ? (
                <LineChart
                    className="mt-4 h-72"
                    data={chartData}
                    index="date"
                    categories={["Average Value"]}
                    colors={["blue"]}
                    yAxisWidth={30}
                    onValueChange={setValue}
                    connectNulls={true}
                />
            ) : (
                <Skeleton height={250} />
            )}
        </Card>
    )
}

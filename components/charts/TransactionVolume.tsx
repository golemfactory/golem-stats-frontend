import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, AreaChart } from "@tremor/react"
import Skeleton from "react-loading-skeleton"

export const TxVolumeAnalysis: React.FC = () => {
    const { data, isValidating } = useSWR("v2/network/transactions/volume", fetcher)

    const formattedData =
        data?.map(({ date, total_transactions }) => ({
            date: new Date(date).toLocaleDateString(),
            "Total Transactions": total_transactions,
        })) || []

    return (
        <Card className="h-full px-6">
            <div class="px-8 mb-6">
                <h1 class="text-2xl mb-2 font-medium dark:text-gray-300">Daily Transaction Volume</h1>
                <p class="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    This chart visualizes the daily transaction volume on Polygon. It highlights the number of transactions processed each
                    day.
                </p>
            </div>

            <div className="flex justify-between mt-6">
                {!isValidating && formattedData.length > 0 ? (
                    <AreaChart
                        data={formattedData}
                        index="date"
                        categories={["Total Transactions"]}
                        colors={["blue"]}
                        showAnimation={true}
                    />
                ) : (
                    <Skeleton height={250} />
                )}
            </div>
        </Card>
    )
}

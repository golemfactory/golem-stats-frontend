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
            <div className="px-8 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Transaction Volume Analysis</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    Overview of total transactions volume.
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

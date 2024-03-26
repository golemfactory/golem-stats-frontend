import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, AreaChart } from "@tremor/react"
import Skeleton from "react-loading-skeleton"

export const TxTypeCountAnalysis: React.FC = () => {
    const { data, isValidating } = useSWR("v2/network/transactions/daily-type-counts", fetcher)

    const formattedData =
        data?.map(({ date, singleTransfer, batched }) => ({
            date: new Date(date).toLocaleDateString(),
            "Single Transfer": singleTransfer,
            Batched: batched,
        })) || []

    return (
        <Card className="h-full px-6">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Daily Transactions Type Counts</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    Analysis of single vs batched transactions.
                </p>
            </div>
            <div className="flex justify-between mt-6">
                {!isValidating && formattedData.length > 0 ? (
                    <AreaChart
                        data={formattedData}
                        index="date"
                        categories={["Single Transfer", "Batched"]}
                        colors={["cyan", "red"]}
                        showAnimation={true}
                    />
                ) : (
                    <Skeleton height={250} />
                )}
            </div>
        </Card>
    )
}

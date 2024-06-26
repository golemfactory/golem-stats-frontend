import { GlobeAltIcon } from "@heroicons/react/24/solid"
import { Card } from "@tremor/react"

export const HistoricalChart = ({ chartChild, title }: { chartChild: React.ReactNode; title: string }) => {
    return (
        <Card className="relative ">
            <div className="absolute bg-golemblue rounded-md p-3">
                <GlobeAltIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div className="ml-16 pb-6 sm:pb-7">
                <div className="relative">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">{title}</p>
                    <p className="text-sm font-medium text-green-500 truncate">Online and available for compute</p>
                    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
                    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300"></div>
                </div>
            </div>
            {chartChild}
        </Card>
    )
}

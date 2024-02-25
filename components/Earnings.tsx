import { Card } from "@tremor/react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { RoundingFunction } from "@/lib/RoundingFunction"
export const EarningsCard = ({ title, value, unit, timePeriods }) => {
    const isLoading = !timePeriods || timePeriods.length === 0

    return (
        <div className="grid grid-cols-1 gap-4 h-full ">
            <Card>
                <div className="flex justify-between">
                    <div>
                        <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">{title}</p>
                        <div className="flex items-baseline space-x-2">
                            {isLoading || value == null ? (
                                <Skeleton width={250} height={30} />
                            ) : (
                                <span className="text-tremor-metric font-semibold">{RoundingFunction(value, 5)}</span>
                            )}
                            <span className="text-tremor-default font-medium text-golemblue">{unit}</span>
                        </div>
                    </div>
                </div>
                <p className="items-space mt-6 flex justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                    <span>Overview</span>
                </p>
                <ul role="list" className="mt-2 space-y-2">
                    {timePeriods.map((earnings, index) => (
                        <li
                            key={`earnings-${index}`}
                            className="relative flex w-full items-center space-x-3 rounded-tremor-small bg-tremor-background-subtle/60 p-1 hover:bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle/60 hover:dark:bg-dark-tremor-background-subtle"
                        >
                            {isLoading || earnings.earnings == null ? (
                                <Skeleton height={20} className="w-full" />
                            ) : (
                                <p className="flex w-full py-1.5 px-1.5 items-center justify-between space-x-4 truncate text-tremor-default font-medium">
                                    <span className="truncate text-tremor-content dark:text-dark-tremor-content">{earnings.period}</span>
                                    <span className="pr-1.5 text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                        {RoundingFunction(earnings.earnings, 5)}
                                        <span className="text-golemblue"> GLM</span>
                                    </span>
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    )
}

export default EarningsCard

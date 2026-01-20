import { Card } from "@tremor/react"
import { GolemIcon } from "../svg/GolemIcon"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

export const StatCard = ({ title, value, unit, loading }: { title: string; value: number | undefined; unit: string; loading: boolean }) => {
    const isLoading = loading || value === undefined
    
    return (
        <Card className="relative bg-white dark:bg-gray-900 ">
            <dt>
                <div className="absolute bg-golemblue  p-3">
                    <GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                {isLoading ? (
                    <div className="ml-16">
                        <Skeleton width={160} />
                    </div>
                ) : (
                    <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                )}
            </dt>
            <dd className="ml-16 flex items-baseline ">
                {isLoading ? (
                    <div className="flex items-baseline">
                        <Skeleton width={100} />
                        <Skeleton width={30} className="ml-2" />
                    </div>
                ) : (
                    <>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">
                            {(() => {
                                const strValue = value.toString()
                                const decimalIndex = strValue.indexOf(".")
                                if (decimalIndex !== -1) {
                                    // Check if there are at least 5 digits after the decimal
                                    return strValue.length > decimalIndex + 2
                                        ? strValue.substring(0, decimalIndex + 3) // Include up to the 5th digit after the decimal
                                        : strValue // If fewer than 5 digits, return the whole number
                                }
                                return strValue // Return the number if it doesn't have a decimal point
                            })()}
                        </p>
                        <p className="ml-2 flex items-baseline text-sm font-semibold text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue">
                            {unit}
                        </p>
                    </>
                )}
            </dd>
        </Card>
    )
}

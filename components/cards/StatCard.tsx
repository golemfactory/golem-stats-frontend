import { GolemIcon } from "../svg/GolemIcon"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
export const StatCard = ({ title, value, unit, loading }: { title: string; value: number; unit: string; loading: boolean }) => {
    return (
        <div className="relative bg-white dark:bg-gray-800 pt-5 px-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
            <dt>
                <div className="absolute bg-golemblue rounded-md p-3">
                    <GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                {loading ? (
                    <div className="ml-16">
                        <Skeleton width={160} />{" "}
                    </div>
                ) : (
                    <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                )}
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                {loading ? (
                    <>
                        <Skeleton width={100} />
                    </>
                ) : (
                    <>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">
                            {(() => {
                                const strValue = value.toString()
                                const decimalIndex = strValue.indexOf(".")
                                if (decimalIndex !== -1) {
                                    // Check if there are at least 5 digits after the decimal
                                    return strValue.length > decimalIndex + 5
                                        ? strValue.substring(0, decimalIndex + 6) // Include up to the 5th digit after the decimal
                                        : strValue // If fewer than 5 digits, return the whole number
                                }
                                return strValue // Return the number if it doesn't have a decimal point
                            })()}
                        </p>

                        <p className="ml-2 flex items-baseline text-sm font-semibold text-golemblue dark:text-gray-400">{unit}</p>
                    </>
                )}
            </dd>
        </div>
    )
}

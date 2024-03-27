import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { RoundingFunction } from "@/lib/RoundingFunction"
import { Card } from "@tremor/react"
import Link from "next/link"
import PolygonScanIcon from "@/components/svg/Polygonsscan"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
const EarningsBlock = ({ walletAddress }) => {
    const { data: earningsData, error } = useSWR(walletAddress ? `v1/provider/node/${walletAddress}/earningsnew` : null, fetcher)

    const earningsPeriods = [
        { period: "Today", key: "24" },
        { period: "7 Days", key: "168" },
        { period: "30 Days", key: "720" },
        { period: "90 Days", key: "2160" },
    ]

    if (error) return <div>Error loading earnings</div>
    if (!earningsData) return <Skeleton className="h-full py-1" height={320} />

    return (
        <Card>
            <div className="flex justify-between">
                <div>
                    <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                        Operator Total Earnings
                    </h3>
                    <p className="flex items-baseline space-x-2 text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        <span className="text-tremor-metric font-semibold">
                            {RoundingFunction(earningsData["total"] !== undefined ? earningsData["total"] : 0)}
                        </span>

                        <span className="text-tremor-default font-medium text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue">
                            GLM
                        </span>
                    </p>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-center">
                        <Link
                            className="golembutton"
                            href={`https://polygonscan.com/address/${walletAddress}#tokentxns`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <PolygonScanIcon className="h-5 w-5 mr-2 -ml-2" />
                            Polygonscan
                        </Link>
                    </div>
                </div>
            </div>
            <p className="items-space mt-6 flex justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                <span>Overview</span>
            </p>
            <ul role="list" className="mt-2 space-y-2">
                {earningsPeriods.map(({ period, key }) => (
                    <li
                        key={key}
                        className="relative flex w-full items-center space-x-3 rounded-tremor-small bg-tremor-background-subtle/60 p-1 hover:bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle/60 hover:dark:bg-dark-tremor-background-subtle"
                    >
                        <div className="flex w-full py-1.5 px-1.5 items-center justify-between space-x-4 truncate text-tremor-default font-medium">
                            <span className="truncate text-tremor-content dark:text-dark-tremor-content">
                                <div className="focus:outline-none">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <h3>{period}</h3>
                                </div>
                            </span>
                            <div className="pr-1.5 text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                {RoundingFunction(earningsData[key], 8) || "0"}
                                <span className="text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue"> GLM</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    )
}

export default EarningsBlock

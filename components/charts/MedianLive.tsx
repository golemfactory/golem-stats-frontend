import { fetcher } from "@/fetcher"
import { RoundingFunction } from "@/lib/RoundingFunction"
import useSWR from "swr"
import { useNetwork } from "../NetworkContext"
import { GolemIcon } from "../svg/GolemIcon"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { Card } from "@tremor/react"
const PricingColumn = ({ title, value }: { title: string; value: number }) => {
    return (
        <Card className="relative col-span-12">
            <div className="absolute top-0 right-4 -mr-1 mt-3 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
            <div className="absolute top-0 right-4 -mr-1 mt-3 w-4 h-4 rounded-full bg-green-300"></div>
            <div className="absolute bg-golemblue p-3">
                <GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
            <dd className="ml-16 flex items-baseline ">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">{RoundingFunction(value)}</p>
                <p className="ml-2 flex items-baseline text-sm font-semibold text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue dark:text-gray-400">
                    GLM
                </p>
            </dd>
        </Card>
    )
}

const MedianLive = () => {
    const { network } = useNetwork()
    const { data, error } = useSWR(["v2/network/pricing/median/1h", network.apiUrl], ([url, apiUrl]) => fetcher(url, apiUrl), {
        refreshInterval: 10000,
    })

    return (
        <Card>
            <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
                Median Live Pricing
            </h3>
            <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                The median pricing for CPU, Env, and Start based upon the list of providers who received a task in the last hour.
            </p>
            <dl className="mt-2 grid grid-rows-4 grid-flow-col gap-4 grid-cols-12">
                {data ? (
                    <>
                        <PricingColumn title="CPU per hour" value={data.cpu_median} />
                        <PricingColumn title="Env per hour" value={data.env_median} />
                        <PricingColumn title="Start pricing" value={data.start_median} />
                    </>
                ) : (
                    <div className="w-full grid grid-cols-1">
                        <Skeleton height={100} className="w-full" />
                        <Skeleton height={100} />
                        <Skeleton height={100} />
                    </div>
                )}
            </dl>
        </Card>
    )
}

export default MedianLive

import Image from "next/image"
import { Inter } from "next/font/google"
import NetworkStats from "@/components/HistoricalStats"
import { NetworkActivity } from "@/components/charts/NetworkActivity"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import EarningsCard from "@/components/Earnings"
import TopSourcesCard from "@/components/cards/TopSourcesCard"
import Skeleton from "react-loading-skeleton"

export default function Index() {
    const { data: metricsData, error } = useSWR("v2/network/historical/stats", fetcher, {
        refreshInterval: 10000,
    })
    const { data: networkEarnings, error: networkEarningsError } = useSWR("v1/network/earnings/overview", fetcher, {
        refreshInterval: 10000,
    })
    const { data: overview, error: overviewError } = useSWR("v2/network/comparison", fetcher, {
        refreshInterval: 10000,
    })
    if (error) return <div>Failed to load</div>
    if (!metricsData) return <div>Loading...</div>
    const timePeriods = [
        { period: "6 Hours", earnings: networkEarnings?.network_earnings_6h?.total_earnings || null },
        { period: "24 Hours", earnings: networkEarnings?.network_earnings_24h?.total_earnings || null },
        { period: "7 Days", earnings: networkEarnings?.network_earnings_168h?.total_earnings || null },
        { period: "30 Days", earnings: networkEarnings?.network_earnings_720h?.total_earnings || null },
        { period: "90 Days", earnings: networkEarnings?.network_earnings_2160h?.total_earnings || null },
    ]
    return (
        <div className="grid gap-y-4">
            {/* New parent grid for NetworkActivity and NetworkStats */}
            <div className="grid grid-cols-12 gap-4">
                {/* NetworkStats will now appear first on mobile, but second on larger screens */}
                <div className="lg:col-span-5 col-span-12 lg:order-none order-1">
                    <NetworkStats metricData={metricsData} />
                </div>

                {/* NetworkActivity will now appear second on mobile, but first on larger screens */}
                <div className="lg:col-span-7 col-span-12 lg:order-none order-2">
                    <NetworkActivity />
                </div>
            </div>

            {/* Remaining components in the layout */}
            <div className="grid grid-cols-12 gap-4">
                <div className="lg:col-span-4 col-span-12">
                    <EarningsCard
                        title="Network Total Earnings"
                        value={networkEarnings?.network_total_earnings?.total_earnings || null}
                        unit="GLM"
                        timePeriods={timePeriods}
                    />
                </div>
                <div className="lg:col-span-8 col-span-12">{overview ? <TopSourcesCard data={overview} /> : <Skeleton height={500} />}</div>
            </div>
        </div>
    )
}

export async function getStaticProps({}) {
    return { props: {} }
}

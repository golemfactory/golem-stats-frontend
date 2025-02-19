import Image from "next/image"
import { Inter } from "next/font/google"
import NetworkStats from "@/components/HistoricalStats"
import { NetworkActivity } from "@/components/charts/NetworkActivity"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import EarningsCard from "@/components/Earnings"
import EC2vsGolemPricing from "@/components/cards/EC2ComparePricing"
import Skeleton from "react-loading-skeleton"
import ProviderUptimeDonut from "@/components/charts/NetworkProviderUptimeDonut"
import OnlineStats from "@/components/charts/OnlineStats"
import { NetworkVersionAdoption } from "@/components/charts/NetworkVersions"
import { NetworkCpuArchitectureChart } from "@/components/charts/NetworkCPUArchitecture"
import { NetworkCPUVendorDistribution } from "@/components/charts/VendorChart"
import { TxAnalysis } from "@/components/charts/PaymentsOnVsOffGolem"
import { TxVolumeAnalysis } from "@/components/charts/TransactionVolume"
import { TxTypeCountAnalysis } from "@/components/charts/TxSingleVSBatched"
import { TxAverageValueAnalysis } from "@/components/charts/TxAverageValue"
import { StatCard } from "@/components/cards/StatCard"
import { HistoricalComputingChart } from "@/components/charts/HistoricalComputing"

export default function Index() {
    const { data: metricsData, error } = useSWR("v2/network/historical/stats", fetcher, {
        refreshInterval: 1000,
    })
    const { data: networkEarnings, error: networkEarningsError } = useSWR("v1/network/earnings/overviewnew", fetcher, {
        refreshInterval: 10000,
    })
    const { data: overview, error: overviewError } = useSWR("v2/network/comparison", fetcher, {
        refreshInterval: 10000,
    })

    const timePeriods = networkEarnings ? [
        { period: "6 Hours", earnings: networkEarnings.network_earnings_6h.total_earnings },
        { period: "24 Hours", earnings: networkEarnings.network_earnings_24h.total_earnings },
        { period: "7 Days", earnings: networkEarnings.network_earnings_168h.total_earnings },
        { period: "30 Days", earnings: networkEarnings.network_earnings_720h.total_earnings },
        { period: "90 Days", earnings: networkEarnings.network_earnings_2160h.total_earnings },
    ] : [
        { period: "6 Hours", earnings: undefined },
        { period: "24 Hours", earnings: undefined },
        { period: "7 Days", earnings: undefined },
        { period: "30 Days", earnings: undefined },
        { period: "90 Days", earnings: undefined },
    ]
    return (
        <div className="grid gap-y-4">
            {/* <div className="grid grid-cols-4">
                <OnlineStats />
            </div> */}
            {/* New parent grid for NetworkActivity and NetworkStats */}
            <div className="grid grid-cols-12 gap-4 ">
                <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid gap-4 col-span-12">
                    <StatCard
                        title="Network earnings (6h)"
                        value={timePeriods[0].earnings}
                        unit="GLM"
                        loading={!networkEarnings}
                    />
                    <StatCard
                        title="Network earnings (24h)"
                        value={timePeriods[1].earnings}
                        unit="GLM"
                        loading={!networkEarnings}
                    />
                    <StatCard
                        title="Network earnings (7d)"
                        value={timePeriods[2].earnings}
                        unit="GLM"
                        loading={!networkEarnings}
                    />
                    <StatCard
                        title="Network total earnings"
                        value={networkEarnings?.network_total_earnings?.total_earnings}
                        unit="GLM"
                        loading={!networkEarnings}
                    />
                </div>
                <div className="lg:col-span-12 col-span-12">
                    {metricsData ? <NetworkStats metricData={metricsData} /> : <Skeleton height={580} />}
                </div>
                <div className="lg:col-span-12 col-span-12 ">
                    <NetworkActivity />
                </div>
                <div className="col-span-12">
                    <NetworkVersionAdoption />
                </div>
                {/* <div className="lg:col-span-6 col-span-12">
                    <NetworkCpuArchitectureChart />
                </div> */}
                {/* <div className="lg:col-span-6 col-span-12">
                    <NetworkCPUVendorDistribution />
                </div> */}
                <div className="lg:col-span-12 col-span-12">
                    <HistoricalComputingChart />
                </div>
                {/* <div className="lg:col-span-4 col-span-12">
                    {networkEarnings ? (
                        <EarningsCard
                            title="Network Total Earnings"
                            value={networkEarnings?.network_total_earnings?.total_earnings || null}
                            unit="GLM"
                            timePeriods={timePeriods}
                        />
                    ) : (
                        <Skeleton height={500} />
                    )}
                </div> */}
                {/* <div className="col-span-12">
                    <TxAnalysis />
                </div>
                <div className="col-span-12">
                    <TxVolumeAnalysis />
                </div>
                <div className="col-span-12">
                    <TxTypeCountAnalysis />
                </div>
                <div className="col-span-12">
                    <TxAverageValueAnalysis />
                </div> */}
            </div>

            {/* Remaining components in the layout */}
            {/* <div className="grid grid-cols-12 gap-4">
                <div className="lg:col-span-12 col-span-12">
                    {overview ? <EC2vsGolemPricing data={overview} /> : <Skeleton height={500} />}
                </div>
            </div> */}
        </div>
    )
}

export async function getStaticProps({}) {
    return { props: {} }
}

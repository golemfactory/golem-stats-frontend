import Image from "next/image"
import { Inter } from "next/font/google"
import NetworkStats from "@/components/HistoricalStats"
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
import Banner from "@/components/Banner"
import { useMemo } from "react"

// Flat columnar payload ({field: [values]}) to a list of row objects.
// Arrays pass through untouched so the old row format keeps working too.
function columnsToRowList(data: any) {
    if (!data || Array.isArray(data)) return data
    const fields = Object.keys(data)
    if (!fields.length) return []
    const n = data[fields[0]]?.length ?? 0
    return Array.from({ length: n }, (_, i) =>
        Object.fromEntries(fields.map((f) => [f, data[f][i]]))
    )
}

// The compressed endpoint is columnar: {runtime: {timeframe: {field: [values]}}}.
// Charts expect rows: {runtime: {timeframe: [{date, online, ...}]}}. Arrays are
// passed through untouched so the old row format keeps working too.
function columnarToRows(data: any) {
    if (!data) return data
    const out: any = {}
    for (const [runtime, frames] of Object.entries<any>(data)) {
        out[runtime] = {}
        for (const [frame, cols] of Object.entries<any>(frames)) {
            if (Array.isArray(cols)) {
                out[runtime][frame] = cols
                continue
            }
            const fields = Object.keys(cols)
            const n = cols.date?.length ?? 0
            out[runtime][frame] = Array.from({ length: n }, (_, i) =>
                Object.fromEntries(fields.map((f) => [f, cols[f][i]]))
            )
        }
    }
    return out
}

export default function Index() {
    const { data: rawMetricsData, error } = useSWR("v2/network/historical/stats/combined", fetcher, {
        refreshInterval: 15000,
    })
    const metricsData = useMemo(() => columnarToRows(rawMetricsData), [rawMetricsData])
    const { data: networkEarnings, error: networkEarningsError } = useSWR("v1/network/earnings/overviewnew", fetcher, {
        refreshInterval: 60000,
    })
    const { data: rawOverview, error: overviewError } = useSWR("v2/network/comparison/compressed", fetcher, {
        refreshInterval: 60000,
    })
    const overview = useMemo(() => columnsToRowList(rawOverview), [rawOverview])

    const timePeriods = networkEarnings
        ? [
              { period: "6 Hours", earnings: networkEarnings.network_earnings_6h.total_earnings },
              { period: "24 Hours", earnings: networkEarnings.network_earnings_24h.total_earnings },
              { period: "7 Days", earnings: networkEarnings.network_earnings_168h.total_earnings },
              { period: "30 Days", earnings: networkEarnings.network_earnings_720h.total_earnings },
              { period: "90 Days", earnings: networkEarnings.network_earnings_2160h.total_earnings },
          ]
        : [
              { period: "6 Hours", earnings: undefined },
              { period: "24 Hours", earnings: undefined },
              { period: "7 Days", earnings: undefined },
              { period: "30 Days", earnings: undefined },
              { period: "90 Days", earnings: undefined },
          ]
    return (
        <div className="grid gap-y-4">
            {/* <Banner title="We're performing live upgrade of our metrics system. The stats page might be degraded." /> */}
            {/* <div className="grid grid-cols-4">
                <OnlineStats />
            </div> */}
            <div className="grid grid-cols-12 gap-4 ">
                <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid gap-4 col-span-12">
                    <StatCard title="Network earnings (6h)" value={timePeriods[0].earnings} unit="GLM" loading={!networkEarnings} />
                    <StatCard title="Network earnings (24h)" value={timePeriods[1].earnings} unit="GLM" loading={!networkEarnings} />
                    <StatCard title="Network earnings (7d)" value={timePeriods[2].earnings} unit="GLM" loading={!networkEarnings} />
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

import { useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import useSWR from "swr";
import { StatCard } from "@/components/cards/StatCard";
import { SaladHistoricalComputingChart } from "@/components/charts/SaladHistoricalComputing";
import { SaladNetworkActivity } from "@/components/charts/SaladNetworkActivity";
import SaladNetworkStats from "@/components/SaladNetworkStats";
import { fetcher } from "@/fetcher";

interface EarningsData {
  network_earnings_6h?: { total_earnings: number };
  network_earnings_24h?: { total_earnings: number };
  network_earnings_168h?: { total_earnings: number };
  network_earnings_720h?: { total_earnings: number };
  network_earnings_2160h?: { total_earnings: number };
  network_total_earnings?: { total_earnings: number };
}

export default function SaladPage() {
  const { data: metricsData } = useSWR(
    "v2/partner/salad/network/historical/stats",
    fetcher,
    { refreshInterval: 1000 }
  );

  const { data: networkEarnings } = useSWR<EarningsData>(
    "v2/partner/salad/network/earnings/overview",
    fetcher,
    { refreshInterval: 10000 }
  );

  const earnings = useMemo(
    () => ({
      sixHour: networkEarnings?.network_earnings_6h?.total_earnings,
      twentyFourHour: networkEarnings?.network_earnings_24h?.total_earnings,
      sevenDay: networkEarnings?.network_earnings_168h?.total_earnings,
      total: networkEarnings?.network_total_earnings?.total_earnings,
    }),
    [networkEarnings]
  );

  const isLoading = !networkEarnings;

  return (
    <div className="grid gap-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid gap-4 col-span-12">
          <StatCard
            title="Network earnings (6h)"
            value={earnings.sixHour}
            unit="GLM"
            loading={isLoading}
            variant="salad"
          />
          <StatCard
            title="Network earnings (24h)"
            value={earnings.twentyFourHour}
            unit="GLM"
            loading={isLoading}
            variant="salad"
          />
          <StatCard
            title="Network earnings (7d)"
            value={earnings.sevenDay}
            unit="GLM"
            loading={isLoading}
            variant="salad"
          />
          <StatCard
            title="Network total earnings"
            value={earnings.total}
            unit="GLM"
            loading={isLoading}
            variant="salad"
          />
        </div>
        <div className="lg:col-span-12 col-span-12">
          {metricsData ? (
            <SaladNetworkStats metricData={metricsData} />
          ) : (
            <Skeleton height={580} />
          )}
        </div>
        <div className="lg:col-span-12 col-span-12">
          <SaladNetworkActivity />
        </div>
        <div className="lg:col-span-12 col-span-12">
          <SaladHistoricalComputingChart />
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  return { props: {} };
}

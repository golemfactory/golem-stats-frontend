// components/NetworkStats.tsx
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { StatCard } from "./cards/StatCard";

type EarningsData = {
  total_earnings: string;
};

type AvgEarningsData = {
  average_earnings: string;
};

import { fetcher } from "@/fetcher";

import { RoundingFunction } from "@/lib/RoundingFunction";
import EarningsCard from "./Earnings";

const NetworkStats: React.FC = () => {
  const { data: data6h, isLoading: data1Loading } = useSWR<EarningsData>(
    "v1/network/earnings/6",
    fetcher,
    {
      refreshInterval: 10000,
    }
  );
  const { data: data24h, isLoading: data24Loading } = useSWR<EarningsData>(
    "v1/network/earnings/24",
    fetcher,
    {
      refreshInterval: 10000,
    }
  );
  const { data: data90d, isLoading: data90dLoading } = useSWR<EarningsData>(
    "v1/network/earnings/90d",
    fetcher,
    {
      refreshInterval: 10000,
    }
  );
  const { data: avgEarningsData, isLoading: avgEarningsDataLoading } =
    useSWR<AvgEarningsData>("v1/network/provider/average/earnings", fetcher, {
      refreshInterval: 10000,
    });

  const [earnings6h, setEarnings6h] = useState(0);
  const [earnings24h, setEarnings24h] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageearnings, setAverageEarnings] = useState(0);

  useEffect(() => {
    if (data6h) {
      setEarnings6h(Number(data6h.total_earnings));
    }

    if (data24h) {
      setEarnings24h(Number(data24h.total_earnings));
    }

    if (data90d) {
      setTotalEarnings(RoundingFunction(parseFloat(data90d.total_earnings)));
    }

    if (avgEarningsData) {
      setAverageEarnings(Number(avgEarningsData.average_earnings));
    }
  }, [data6h, data24h, data90d, avgEarningsData]);

  return (
    <div>
      <h1 className="text-2xl  font-medium dark:text-gray-300">
        Network Statistics
      </h1>
      <EarningsCard
        title="Earnings"
        value={totalEarnings}
        unit="GLM"
        today={earnings6h}
        sevenDays={earnings24h}
        thirtyDays={earnings}
        ninetyDays={0}
    </div>
  );
};

export default NetworkStats;

import {
  AreaChart,
  Card,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@tremor/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import useSWR from "swr";
import { fetcher } from "@/fetcher";
import "react-loading-skeleton/dist/skeleton.css";

interface UtilizationData {
  data: {
    result: Array<{
      values: [number, string][];
    }>;
  };
}

interface ChartDataPoint {
  date: string;
  "Providers computing": number;
}

export const SaladNetworkActivity: React.FC = () => {
  const { data, isLoading } = useSWR<UtilizationData>(
    "v2/partner/salad/network/utilization",
    fetcher,
    { refreshInterval: 1000 }
  );

  const previousValueRef = useRef<number | null>(null);
  const [colorClass, setColorClass] = useState(
    "dark:text-dark-tremor-content-metric"
  );

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data?.data?.result?.[0]?.values) return [];
    return data.data.result[0].values.map(([x, y]) => ({
      date: new Date(x * 1000).toLocaleTimeString(navigator.language, {
        hour: "2-digit",
        minute: "2-digit",
      }),
      "Providers computing": Number(y),
    }));
  }, [data]);

  const currentValue =
    chartData.length > 0
      ? chartData[chartData.length - 1]["Providers computing"]
      : 0;

  // Handle color flash effect when value changes
  useEffect(() => {
    if (
      previousValueRef.current !== null &&
      currentValue !== previousValueRef.current
    ) {
      const newColor =
        currentValue > previousValueRef.current
          ? "text-green-500"
          : "text-red-500";
      setColorClass(newColor);
      const timeout = setTimeout(
        () => setColorClass("dark:text-dark-tremor-content-metric"),
        1000
      );
      return () => clearTimeout(timeout);
    }
    previousValueRef.current = currentValue;
  }, [currentValue]);

  return (
    <Card className="h-full px-6">
      <div className="px-6 mb-6">
        <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">
          Salad Network Activity
        </h1>
        <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
          Real-time tracking of Salad providers on the Golem Network who are
          currently engaged in computing tasks for requestors.
        </p>
      </div>
      <div className="px-6">
        <div className="flex justify-between mt-6">
          <div>
            <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
              Right now
            </h3>
            <div className="flex items-baseline space-x-2">
              <span
                className={`text-tremor-metric font-semibold font-inter ${colorClass}`}
              >
                {isLoading ? <Skeleton width={40} height={30} /> : currentValue}
              </span>
              <span className="text-tremor-default font-medium text-saladGreen">
                Providers
              </span>
            </div>
          </div>
        </div>

        {chartData.length > 0 && (
          <AreaChart
            data={chartData}
            index="date"
            className="stroke-saladGreen"
            autoMinValue
            categories={["Providers computing"]}
            colors={["saladGreen"]}
            yAxisWidth={30}
            showAnimation
          />
        )}
      </div>
    </Card>
  );
};

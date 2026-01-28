import {
  BarChart,
  Card,
  type CustomTooltipProps,
  Divider,
} from "@tremor/react";
import { useCallback, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import useSWR from "swr";
import { fetcher } from "@/fetcher";

interface VersionData {
  version: string;
  count: number;
  rc: boolean;
  percentage: number;
}

interface ChartDataPoint {
  version: string;
  Providers: number;
  rc: boolean;
  percentage: number;
}

export const SaladNetworkVersionAdoption: React.FC = () => {
  const { data } = useSWR<VersionData[]>(
    "v2/partner/salad/network/versions",
    fetcher,
    {
      refreshInterval: 10000,
    }
  );

  const { data: latestYagnaVersion } = useSWR<{ name: string }>(
    "https://api.github.com/repos/golemfactory/yagna/releases/latest",
    fetcher
  );

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data) return [];
    return data.map((obj) => ({
      version: obj.version,
      Providers: obj.count,
      rc: obj.rc,
      percentage: obj.percentage,
    }));
  }, [data]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map((obj) => obj.Providers));
  }, [chartData]);

  const customTooltip = useCallback(
    ({ payload, active }: CustomTooltipProps) => {
      if (!active || !payload?.length) return null;

      return (
        <div className="w-56 rounded-tremor-default border border-tremor-border dark:border-dark-tremor-border bg-tremor-background dark:bg-dark-tremor-background p-2 text-tremor-default shadow-tremor-dropdown">
          {payload.map((category) => {
            const data = category.payload as ChartDataPoint;
            return (
              <div key={data.version} className="flex flex-1 space-x-2.5">
                <div
                  className={`flex w-1 ${
                    data.rc ? "bg-yellow-500" : "bg-green-500"
                  }`}
                />
                <div className="space-y-1">
                  <p className="font-medium text-tremor-content-emphasis dark:text-white">
                    Type:{" "}
                    <span
                      className={`font-medium ${
                        data.rc ? "text-yellow-500" : "text-green-500"
                      }`}
                    >
                      {data.rc ? "Test Version" : "Stable Version"}
                    </span>
                  </p>
                  <p className="font-medium text-tremor-content-emphasis dark:text-dark-tremor-content">
                    Version:{" "}
                    <span className="text-tremor-default dark:text-white">
                      {data.version}
                    </span>
                  </p>
                  <p className="font-medium text-tremor-content-emphasis dark:text-dark-tremor-content">
                    Percentage:{" "}
                    <span className="text-tremor-default dark:text-white">
                      {data.percentage}%
                    </span>
                  </p>
                  <p className="font-medium text-tremor-content-emphasis dark:text-dark-tremor-content">
                    Providers:{" "}
                    <span className="text-tremor-default dark:text-white">
                      {data.Providers}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      );
    },
    []
  );

  const valueFormatter = useCallback((value: number) => value.toString(), []);

  return (
    <Card>
      <div className="px-6 mb-6">
        <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">
          Salad Network Version Adoptions
        </h1>
        <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
          A breakdown of the different versions of Yagna that Salad providers
          are running.
        </p>
      </div>
      <Divider className="mt-4" />
      <div className="flex justify-between px-6">
        <div>
          <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
            Latest Stable Version
          </h3>
          <div className="flex items-baseline space-x-2">
            {latestYagnaVersion ? (
              <span className="text-tremor-metric font-semibold dark:text-dark-tremor-content-metric font-inter">
                {latestYagnaVersion.name}
              </span>
            ) : (
              <Skeleton width={250} height={30} />
            )}
          </div>
        </div>
      </div>
      <BarChart
        data={chartData}
        index="version"
        categories={["Providers"]}
        valueFormatter={valueFormatter}
        customTooltip={customTooltip}
        showLegend
        showYAxis
        yAxisWidth={45}
        showTooltip
        showAnimation
        maxValue={maxValue}
      />
    </Card>
  );
};

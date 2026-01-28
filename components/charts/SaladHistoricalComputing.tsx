import { AreaChart, Card } from "@tremor/react";
import { useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/fetcher";
import { RoundingFunction } from "@/lib/RoundingFunction";

interface ComputingDataPoint {
  date: string;
  total: number;
}

interface FormattedDataPoint {
  date: string;
  "Simultaneous providers computing": number;
}

export const SaladHistoricalComputingChart: React.FC = () => {
  const { data, error, isLoading } = useSWR<ComputingDataPoint[]>(
    "v2/partner/salad/network/historical/computing",
    fetcher
  );

  const formattedData = useMemo<FormattedDataPoint[]>(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(({ date, total }) => ({
      date: new Date(date).toLocaleDateString(),
      "Simultaneous providers computing": RoundingFunction(total, 2),
    }));
  }, [data]);

  const athValue = useMemo(() => {
    if (!data || !Array.isArray(data)) return 0;
    return Math.max(...data.map((item) => item.total), 0);
  }, [data]);

  const latestValue = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return 0;
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    const yesterdaysData = formattedData.filter((d) => d.date === yesterday);
    return yesterdaysData.reduce(
      (max, curr) => Math.max(max, curr["Simultaneous providers computing"]),
      0
    );
  }, [data, formattedData]);

  if (error) return <div>Failed to load data...</div>;

  return (
    <Card className="h-full px-6">
      <div className="px-6 mb-6">
        <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">
          Salad Historical Computing Chart
        </h1>
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          This chart visualizes the historical number of simultaneous Salad
          providers computing on the Golem Network. The size of each area
          represents the total number of providers computing on a given day.
        </p>
      </div>
      <div className="border-t border-tremor-border p-6 dark:border-dark-tremor-border">
        <div className="flex items-start justify-between">
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-8">
            <li className="flex items-center">
              <div>
                <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                  Yesterday
                </h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric">
                    {latestValue}
                  </span>
                  <span className="text-tremor-default font-medium capitalize text-saladGreen">
                    Providers
                  </span>
                </div>
              </div>
            </li>
            <li className="flex items-center">
              <div>
                <h3 className="text-tremor-default font-medium text-red-500 dark:text-dark-tremor-content">
                  All-time high
                </h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric">
                    {athValue}
                  </span>
                  <span className="text-tremor-default font-medium capitalize text-saladGreen">
                    Providers
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex justify-between">
        {isLoading || formattedData.length === 0 ? (
          <span>Loading...</span>
        ) : (
          <AreaChart
            className="h-72 stroke-saladGreen"
            data={formattedData}
            index="date"
            autoMinValue
            categories={["Simultaneous providers computing"]}
            colors={["saladGreen"]}
            yAxisWidth={30}
            showAnimation
          />
        )}
      </div>
    </Card>
  );
};

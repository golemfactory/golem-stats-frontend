import { AreaChart, Card, Tab, TabGroup, TabList } from "@tremor/react";
import { useMemo, useState } from "react";

function getProviderType(name: string) {
  return (
    {
      "vm-nvidia": "GPU Provider",
      vm: "CPU Provider",
      automatic: "AI Provider",
    }[name] || name
  );
}

const customTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  const categoryPayload = payload[0];

  if (!categoryPayload) return null;

  const formatCategoryName = (name: string) => {
    if (name === "online") return "Providers online";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const valueFormatter = (value: number, name: string) => {
    const formattedValue = Intl.NumberFormat("us").format(value);
    if (["disk", "memory"].includes(name)) {
      return `${formattedValue} TB`;
    }
    return formattedValue;
  };

  return (
    <div className="w-52 rounded-tremor-default border border-tremor-border bg-tremor-background text-tremor-default shadow-tremor-dropdown dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:shadow-dark-tremor-dropdown">
      <div className="rounded-t-tremor-default border-b border-tremor-border bg-tremor-background-muted px-2.5 py-2 dark:border-dark-tremor-border dark:bg-dark-tremor-background">
        <p className="font-medium text-tremor-content dark:text-dark-tremor-content">
          {label}
        </p>
      </div>
      <div className="flex w-full items-center justify-between space-x-4 px-2.5 py-2">
        <div className="flex items-center space-x-2 truncate">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-tremor-full bg-saladGreen"
            aria-hidden={true}
          />
          <p className="truncate text-tremor-content dark:text-dark-tremor-content">
            {formatCategoryName(categoryPayload.name)}
          </p>
        </div>
        <p className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {valueFormatter(categoryPayload.value, categoryPayload.name)}
        </p>
      </div>
    </div>
  );
};

const formatDate = (dateString: number, timeFrame: string) => {
  const date = new Date(dateString * 1000);
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    "1d": { hour: "2-digit", minute: "2-digit" },
    "7d": { month: "short", day: "numeric" },
    "1m": { month: "short", day: "numeric", year: "numeric" },
    "1y": { month: "short", day: "numeric", year: "numeric" },
    All: { year: "numeric", month: "short", day: "numeric" },
  };
  const options = optionsMap[timeFrame] || {};
  return date.toLocaleString(navigator.language, options);
};

interface MetricCardSummaryProps {
  metricData: any;
  metric: string;
  selectedRuntime: string;
  unit: string;
}

const MetricCardSummary = ({
  metricData,
  metric,
  selectedRuntime,
  unit,
}: MetricCardSummaryProps) => {
  const dailyData = metricData[selectedRuntime]?.["1d"] || [];
  const latestDataPoint = dailyData[dailyData.length - 1] || {};
  const value = `${Intl.NumberFormat("us").format(
    latestDataPoint[metric] || 0
  )}`;
  return (
    <div className="flex justify-between">
      <div>
        <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
          Right now
        </h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-tremor-metric font-semibold font-inter dark:text-dark-tremor-content-metric">
            {value}
          </span>
          <span className="text-tremor-default font-medium capitalize text-saladGreen">
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

interface NetworkStatChartProps {
  name: string;
  metricData: any;
  metric: string;
  unit: string;
  selectedRuntime: string;
  selectedTimeFrame: string;
  onTimeFrameChange: (frame: string) => void;
  description: string;
}

const NetworkStatChart = ({
  name,
  metricData,
  metric,
  unit,
  selectedRuntime,
  selectedTimeFrame,
  onTimeFrameChange,
  description,
}: NetworkStatChartProps) => {
  if (!metricData[selectedRuntime]) {
    return null;
  }
  const timeFrames = Object.keys(metricData[selectedRuntime]);
  return (
    <Card>
      <div className="flex relative flex-col md:flex-row justify-between items-start border-b border-tremor-border dark:border-dark-tremor-border">
        <div className="px-6 mb-6">
          <h1 className="relative text-2xl mb-2 font-medium dark:text-gray-300">
            {name}
          </h1>
          <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
            {description}
          </p>
          <span className="mt-3 inline-flex items-center gap-x-2.5 rounded-tremor-full bg-tremor-background py-1 pl-2.5 pr-1 text-tremor-label text-tremor-content ring-1 ring-inset ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content dark:ring-dark-tremor-ring">
            Runtime
            <span className="h-4 w-px bg-tremor-ring dark:bg-dark-tremor-ring" />
            <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-emphasis">
              {getProviderType(selectedRuntime)}
            </span>
          </span>
        </div>
      </div>
      <div className="grid md:flex md:items-start md:justify-between px-6 pt-4">
        <MetricCardSummary
          metricData={metricData}
          metric={metric}
          selectedRuntime={selectedRuntime}
          unit={unit}
        />
        <div className="order-1 md:order-2">
          <TabGroup
            index={timeFrames.findIndex((frame) => frame === selectedTimeFrame)}
            onIndexChange={(index) => onTimeFrameChange(timeFrames[index])}
          >
            <TabList variant="solid" className="w-full md:w-fit">
              {timeFrames.map((frame) => (
                <Tab
                  key={frame}
                  className={`w-full justify-center py-1 ${
                    selectedTimeFrame === frame
                      ? "ui-selected:text-tremor-content-strong ui-selected:dark:text-dark-tremor-content-strong"
                      : ""
                  } md:w-fit md:justify-start`}
                >
                  {frame}
                </Tab>
              ))}
            </TabList>
          </TabGroup>
        </div>
      </div>

      <div className="chart-container">
        <AreaChart
          data={metricData[selectedRuntime][selectedTimeFrame].map(
            (item: any) => ({
              ...item,
              date: formatDate(item.date, selectedTimeFrame),
            })
          )}
          index="date"
          autoMinValue={true}
          categories={[metric]}
          colors={["saladGreen"]}
          customTooltip={customTooltip}
          className="h-72 stroke-saladGreen"
          showAnimation={true}
        />
      </div>
    </Card>
  );
};

interface SaladNetworkStatsProps {
  metricData: any;
}

interface TabConfig {
  name: string;
  metric: string;
  unit: string;
  description: string;
}

const SaladNetworkStats = ({ metricData }: SaladNetworkStatsProps) => {
  // Always use vm-nvidia for Salad providers
  const selectedRuntime = "vm-nvidia";
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("1y");

  const handleTimeFrameChange = (frame: string) => {
    setSelectedTimeFrame(frame);
  };

  const tabs = useMemo<TabConfig[]>(() => {
    const baseTabs: TabConfig[] = [
      {
        name: "Connected Providers",
        metric: "online",
        unit: "Providers",
        description:
          "The number of Salad providers currently available on the network.",
      },
      {
        name: "Compute Power",
        metric: "cores",
        unit: "Cores",
        description:
          "The total number of CPU cores offered by online Salad providers.",
      },
      {
        name: "Total Memory",
        metric: "memory",
        unit: "TB",
        description:
          "The combined amount of memory available from online Salad providers.",
      },
    ];

    // Check for GPU data
    if (metricData[selectedRuntime]) {
      const hasGPUData = ["1d", "7d", "1m", "1y", "All"].some((timeframe) =>
        metricData[selectedRuntime][timeframe]?.some(
          (entry: { gpus: number }) => entry.gpus > 0
        )
      );

      if (hasGPUData) {
        return [
          baseTabs[0],
          {
            name: "Available GPUs",
            metric: "gpus",
            unit: "GPUs",
            description:
              "The number of GPUs offered by online Salad providers.",
          },
          ...baseTabs.slice(1),
        ];
      }
    }

    return baseTabs;
  }, [metricData]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
        {tabs.map((tab) => (
          <NetworkStatChart
            name={tab.name}
            key={tab.metric}
            metricData={metricData}
            metric={tab.metric}
            unit={tab.unit}
            selectedRuntime={selectedRuntime}
            selectedTimeFrame={selectedTimeFrame}
            onTimeFrameChange={handleTimeFrameChange}
            description={tab.description}
          />
        ))}
      </div>
    </div>
  );
};

export default SaladNetworkStats;

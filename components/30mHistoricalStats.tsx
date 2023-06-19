import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";

import useSWR from "swr";
import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { HistoricalChart } from "./charts/Historical";
import { convertGBtoTB } from "@/lib/ConvertGBtoTB";

type ApiResponse = {
  date: number;
  online: number;
  cores: number;
  memory: number;
  disk: number;
};

import { fetcher } from "@/fetcher";
import { RoundingFunction } from "@/lib/RoundingFunction";

const Historical30mStats = () => {
  const { data, error } = useSWR<ApiResponse[]>(
    "v1/network/historical/stats/30m",
    fetcher,
    {
      refreshInterval: 10000,
    }
  );
  const [online, setOnline] = useState<any[]>([]);
  const [cores, setCores] = useState<any[]>([]);
  const [memory, setMemory] = useState<any[]>([]);
  const [disk, setDisk] = useState<any[]>([]);
  const [lastStatsObject, setLastStatsObject] = useState<ApiResponse | null>(
    null
  );

  useEffect(() => {
    if (data && !error) {
      const onlineData = data.map((obj) => [obj.date, obj.online]);
      const coresData = data.map((obj) => [obj.date, obj.cores]);
      const memoryData = data.map((obj) => [obj.date, obj.memory / 1024]);
      const diskData = data.map((obj) => [obj.date, obj.disk / 1024]);

      setOnline(onlineData);
      setCores(coresData);
      setMemory(memoryData);
      setDisk(diskData);
      setLastStatsObject(data[data.length - 1]);
    }
  }, [data, error]);

  const chartOptions: ApexOptions = {
    chart: {
      id: "area-datetime",
      type: "area",
      zoom: {
        autoScaleYaxis: true,
      },
      animations: {
        enabled: false,
        easing: "linear",
        dynamicAnimation: {
          speed: 1000,
        },
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: true,
        format: "dd MMMM HH:mm:ss",
        formatter: undefined,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#0000ff"],
    markers: {
      size: 0,
    },

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.1,
        inverseColors: false,
        opacityFrom: 0,
        opacityTo: 0,
        stops: [0, 99],
      },
    },
    yaxis: {
      title: {
        rotate: -90,
        offsetX: 0,
        offsetY: 0,
        style: {
          color: undefined,
          fontSize: "12px",
          fontWeight: 600,
          cssClass: "apexcharts-yaxis-title",
        },
      },
      labels: {
        formatter: (value: number) => `${RoundingFunction(value, 2)}`,
      },
    },
    xaxis: {
      type: "datetime",
      title: {
        text: "UTC Time",
        offsetX: 0,
        offsetY: 0,
        style: {
          color: undefined,
          fontSize: "12px",
          fontWeight: 600,
          cssClass: "apexcharts-yaxis-title",
        },
      },
      labels: {
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
          hour: "HH:mm:ss",
        },
      },
    },
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
      <HistoricalChart
        title={lastStatsObject?.online + " Providers"}
        chartChild={
          <ApexChart
            width="100%"
            height="250"
            type="area"
            options={chartOptions}
            series={[{ data: online, name: "Providers online" }]}
          />
        }
      />

      <HistoricalChart
        title={lastStatsObject?.cores + " Cores"}
        chartChild={
          <ApexChart
            width="100%"
            height="250"
            type="area"
            options={chartOptions}
            series={[{ data: cores, name: "Cores available" }]}
          />
        }
      />

      <HistoricalChart
        title={convertGBtoTB(lastStatsObject?.memory) + " TB Memory"}
        chartChild={
          <ApexChart
            width="100%"
            height="250"
            type="area"
            options={chartOptions}
            series={[{ data: memory, name: "Memory available" }]}
          />
        }
      />

      <HistoricalChart
        title={convertGBtoTB(lastStatsObject?.disk) + " TB Disk"}
        chartChild={
          <ApexChart
            width="100%"
            height="250"
            type="area"
            options={chartOptions}
            series={[{ data: disk, name: "Disk available" }]}
          />
        }
      />
    </div>
  );
};

export default Historical30mStats;

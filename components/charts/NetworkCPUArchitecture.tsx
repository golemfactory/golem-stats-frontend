import React, { useEffect, useState } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { fetcher } from "@/fetcher";
import { ApexOptions } from "apexcharts";

const DynamicApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export const NetworkCPUArchitecture: React.FC = () => {
  const { data: apiData } = useSWR("v1/network/online", fetcher, {
    refreshInterval: 10000,
  });
  const [data, setData] = useState<number[]>([0, 0]);

  useEffect(() => {
    const sortAPIData = () => {
      let x86_64 = 0;
      let Aarch64 = 0;

      apiData.forEach((obj: any) => {
        if (obj.data["golem.inf.cpu.architecture"]) {
          if (obj.data["golem.inf.cpu.architecture"] === "x86_64") {
            x86_64++;
          } else if (obj.data["golem.inf.cpu.architecture"] === "aarch64") {
            Aarch64++;
          }
        }
      });

      setData([x86_64, Aarch64]);
    };

    if (apiData) {
      sortAPIData();
    }
  }, [apiData]);

  const chartOptions: ApexOptions = {
    chart: {
      id: "vendor-donut",
      type: "donut",
      zoom: {
        autoScaleYaxis: true,
      },
    },
    labels: ["x86_64", "Aarch64"],
    tooltip: {
      enabled: true,
      x: {
        show: true,
        format: "HH:mm:ss",
        formatter: undefined,
      },
    },
    dataLabels: {
      enabled: true,
    },
    colors: ["#0000F9", "#8E6BE1"],
    markers: {
      size: 0,
    },
    stroke: {
      show: false,
      width: 0,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 90, 100],
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 h-full pt-5 px-4 sm:px-6 shadow rounded-lg overflow-hidden">
      <div className="relative">
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300"></div>
        <h3 className="text-2xl mb-2 font-medium dark:text-gray-300">
          Network CPU Architecture
        </h3>
        <span className="dark:text-gray-400">
          x86_64: <b className="mr-1">{data[0]}</b> Aarch64: <b>{data[1]}</b>
        </span>
        <DynamicApexChart
          className="py-3"
          width="100%"
          height="250"
          type="donut"
          options={chartOptions}
          series={data}
        />
      </div>
    </div>
  );
};

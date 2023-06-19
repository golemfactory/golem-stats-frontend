import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";

import { ApexOptions } from "apexcharts";
import { fetcher } from "@/fetcher";
import { RoundingFunction } from "@/lib/RoundingFunction";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

export const NetworkCPUVendorDistribution: React.FC = () => {
  const [data, setData] = useState<number[]>([]);
  const [intelCount, setIntelCount] = useState(0);
  const [amdCount, setAmdCount] = useState(0);
  const [thirdTypeCpu, setThirdTypeCpu] = useState(0);

  const { data: apiResponse } = useSWR("v1/network/online", fetcher, {
    refreshInterval: 10000,
  });

  useEffect(() => {
    if (apiResponse) {
      setIntelCount(0);
      setAmdCount(0);
      setThirdTypeCpu(0);

      apiResponse.forEach((obj: any) => {
        const vendor = obj.data["golem.inf.cpu.vendor"];

        if (vendor === "GenuineIntel") {
          setIntelCount((prevCount) => prevCount + 1);
        } else if (vendor === "AuthenticAMD") {
          setAmdCount((prevCount) => prevCount + 1);
        } else {
          if (!vendor === undefined) {
            setThirdTypeCpu((prevCount) => prevCount + 1);
          }
        }
      });

      setData([intelCount, amdCount, thirdTypeCpu]);
    }
  }, [apiResponse, intelCount, amdCount, thirdTypeCpu]);

  const chartOptions: ApexOptions = {
    chart: {
      id: "Vendor-donut",
      type: "donut",
      zoom: {
        autoScaleYaxis: true,
      },
    },
    labels: ["Intel", "AMD", "Other"],
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
    colors: ["#0000F9", "rgb(234, 53, 70)", "#8b07cd"],
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
    <div className="bg-white dark:bg-gray-800 pt-5 px-4 sm:px-6 shadow rounded-lg overflow-hidden">
      <div className="relative">
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping" />
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300" />
        <h3 className="text-2xl mb-2 font-medium dark:text-gray-300">
          Network CPU Vendor Distribution
        </h3>
        <span className="dark:text-gray-400">
          AMD: <b className="mr-1">{amdCount}</b> Intel: {intelCount}
          <b className="mr-1"></b> Other: <b>{thirdTypeCpu}</b>
        </span>
        <ApexCharts
          className="py-6"
          width="100%"
          height="250"
          series={data}
          type="donut"
          options={chartOptions}
        />
      </div>
    </div>
  );
};

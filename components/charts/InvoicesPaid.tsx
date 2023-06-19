import React, { useEffect, useState } from "react";
import { RoundingFunction } from "@/lib/RoundingFunction";
import { fetcher } from "@/fetcher";
import { ApexOptions } from "apexcharts";
import useSWR from "swr";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const InvoicesPaid: React.FC = () => {
  const [chartOptions, setChartOptions] = useState<ApexOptions>({
    colors: [],
    chart: {
      type: "radialBar",
    },
    labels: ["Invoices Paid"],
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 0,
          size: "70%",
          background: "#272fd1",
        },
        track: {
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            opacity: 0.15,
          },
        },
        dataLabels: {
          name: {
            offsetY: -10,
            color: "#fff",
            fontSize: "13px",
          },
          value: {
            color: "#fff",
            fontSize: "30px",
            show: true,
          },
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
  });
  const [series, setSeries] = useState<number[]>([]);

  const { data, error } = useSWR("v1/network/market/invoice/paid/1h", fetcher, {
    refreshInterval: 10000,
  });

  useEffect(() => {
    if (data && !error) {
      console.log(data.percentage_paid);
      setSeries([RoundingFunction(data.percentage_paid)]);

      setChartOptions((prev) => ({
        ...prev,
        colors: [
          data.percentage_paid >= 0 && data.percentage_paid <= 25
            ? "#de0417"
            : data.percentage_paid >= 25.01 && data.percentage_paid <= 60
            ? "#fcc603"
            : data.percentage_paid >= 60.01 && data.percentage_paid <= 101
            ? "#04cc11"
            : "#04cc11",
        ],
      }));
    }
  }, [data, error]);

  return (
    <div className="bg-white dark:bg-gray-800 pt-5 px-4 sm:px-6 shadow rounded-lg w-full h-full">
      <div className="relative">
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300"></div>
        <h3 className="text-2xl mb-2 font-medium dark:text-gray-300">
          Invoices Paid (1h)
        </h3>
        <span className="dark:text-gray-400">
          Find more details{" "}
          <a
            target="_blank"
            href="https://app.gitbook.com/@golem-network/s/stats-api/v1-api-endpoints/network-specific#paid-invoices-last-hour"
            rel="noreferrer"
            className="underline"
          >
            here
          </a>
        </span>
        <ApexChart
          width="100%"
          className="py-10 "
          height="250"
          type="radialBar"
          options={chartOptions}
          series={series}
        />
      </div>
    </div>
  );
};

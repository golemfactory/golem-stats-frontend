import { useEffect, useState } from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { RoundingFunction } from "@/lib/RoundingFunction";
import { fetcher } from "@/fetcher";
import { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const InvoicesAccepted: React.FC = () => {
  const [chartOptions, setChartOptions] = useState<ApexOptions>({
    colors: [],
    labels: ["Invoices Accepted"],
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

  const { data, error } = useSWR(
    "v1/network/market/provider/invoice/accepted/1h",
    fetcher,
    {
      refreshInterval: 10000,
    }
  );

  useEffect(() => {
    if (data) {
      const apiResponse = data;
      const percentage = RoundingFunction(
        apiResponse.percentage_invoice_accepted
      );
      let color = "";

      if (percentage >= 0 && percentage <= 25) {
        color = "#de0417";
      } else if (percentage > 25 && percentage <= 60) {
        color = "#fcc603";
      } else if (percentage > 60 && percentage <= 101) {
        color = "#04cc11";
      }

      setChartOptions((options) => ({
        ...options,
        colors: [color],
      }));

      setSeries([percentage]);
    }
  }, [data]);

  return (
    <div className="bg-white dark:bg-gray-800 pt-5 px-4 sm:px-6 shadow rounded-lg w-full h-full">
      <div className="relative">
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300"></div>
        <h3 className="text-2xl mb-2 font-medium dark:text-gray-300">
          Invoices Accepted (1h)
        </h3>
        <span className="dark:text-gray-400">
          Find more details{" "}
          <a
            target="_blank"
            href="https://app.gitbook.com/@golem-network/s/stats-api/v1-api-endpoints/network-specific#providers-invoices-accepted-percentage-last-hour"
            rel="noopener noreferrer"
            className="underline"
          >
            here
          </a>
        </span>
        {data && !error && (
          <ApexChart
            width="100%"
            className="py-10"
            height="250"
            type="radialBar"
            options={chartOptions}
            series={series}
          />
        )}
      </div>
    </div>
  );
};

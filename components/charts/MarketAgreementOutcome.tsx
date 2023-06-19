import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { RoundingFunction } from "@/lib/RoundingFunction";
import { fetcher } from "@/fetcher";
import { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const MarketAgreementOutcome = () => {
  const { data, error } = useSWR(
    "v1/network/market/agreement/termination/reasons",
    fetcher,
    {
      refreshInterval: 10000,
    }
  );
  const [series, setSeries] = useState([] as number[]);

  useEffect(() => {
    if (data) {
      setSeries([
        data.market_agreements_success,
        data.market_agreements_cancelled,
        data.market_agreements_expired,
        data.market_agreements_requestorUnreachable,
        data.market_agreements_debitnoteDeadline,
      ]);
      console.log(series);
    } else if (error) {
      console.log(error);
    }
  }, [data]);

  const chartOptions: ApexOptions = {
    chart: {
      id: "donut",
      type: "donut",
      foreColor: "#373d3f",
    },
    labels: [
      "Success",
      "Cancelled by Requestor",
      "Task Expired",
      "Requestor Unreachable",
      "Debitnote Deadline",
    ],
    dataLabels: {
      enabled: true,
    },
    theme: {
      palette: "palette8", // upto palette10
    },
    stroke: {
      show: false,
      width: 0,
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 pt-5 px-4 sm:px-6 shadow rounded-lg h-full">
      <div className="relative">
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300"></div>
        <h3 className="text-2xl mb-2 font-medium dark:text-gray-300">
          Market Agreement Outcome (1h)
        </h3>
        <span className="text-gray-500 dark:text-gray-400">
          Find more details
          <a
            target="_blank"
            href="https://docs.stats.golem.network/v1-api-endpoints/network-specific#market-agreement-termination-reasons"
            rel="noreferrer"
          >
            <span className="text-golemblue dark:text-gray-300"> here</span>
          </a>
        </span>
      </div>
      <ApexChart
        type="donut"
        className="py-6"
        width="100%"
        height="250"
        options={chartOptions}
        series={series}
      />
    </div>
  );
};

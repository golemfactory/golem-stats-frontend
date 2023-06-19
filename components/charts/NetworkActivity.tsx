import { useState, useEffect } from "react";
import { fetcher } from "@/fetcher";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { GlobeAltIcon } from "@heroicons/react/24/solid";

// Import the Globe Icon and use dynamic import for ApexChart.
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
type SeriesType = {
  name: string;
  data: Array<{ x: number; y: number }>;
};

export const NetworkActivity: React.FC = () => {
  const [series, setSeries] = useState<SeriesType[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const { data } = useSWR("v1/network/utilization", fetcher, {
    refreshInterval: 10000,
  });

  const chartOptions: ApexOptions = {
    chart: {
      id: "area-datetime",
      type: "area",
      foreColor: "#373d3f",
      zoom: {
        autoScaleYaxis: true,
      },
    },
    tooltip: {
      theme: "light",
      enabled: true,
      x: {
        show: true,
        format: "HH:mm:ss",
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
    stroke: {
      width: 4.5,
    },
    yaxis: {
      title: {
        text: "Providers computing",
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
    xaxis: {
      type: "datetime",
      labels: {
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
          hour: "HH:mm:ss",
        },
      },
      title: {
        text: "UTC Time",
        offsetX: 0,
        offsetY: 5,
        style: {
          color: undefined,
          fontSize: "12px",
          fontWeight: 600,
          cssClass: "apexcharts-yaxis-title",
        },
      },
    },
  };

  useEffect(() => {
    if (data) {
      const apiResponse = data;
      const fetchedData = apiResponse.data.result[0].values;
      const computing: Array<{ x: number; y: number }> = [];
      for (const i in fetchedData) {
        const time = fetchedData[i][0] * 1000;
        const value = Number(fetchedData[i][1]); // make sure to convert the fetched value to a number
        computing.push({ x: time, y: value });
      }

      const lastElement = computing[computing.length - 1];

      setSeries([
        {
          data: computing,
          name: "Providers computing a task",
        },
      ]);
      setLoaded(true);
    }
  }, [data]);

  return (
    <div className="bg-white dark:bg-gray-800 pt-5 px-4 sm:px-6 shadow rounded-lg overflow-hidden ">
      <div className="relative">
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
        <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300"></div>
        <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">
          Network Activity
        </h1>
        <div className="d-flex align-items-center">
          <dt>
            <div className="absolute bg-golemblue rounded-md p-3">
              <GlobeAltIcon
                className="h-6 w-6 text-white "
                aria-hidden="true"
              />
            </div>
          </dt>
          <dd className="ml-16 pb-6 sm:pb-7">
            <div className="relative">
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">
                {loaded && series.length && series[0].data.length
                  ? series[0].data[series[0].data.length - 1].y
                  : "-"}{" "}
                Providers
              </p>
              <p className="text-sm font-medium text-green-500 truncate">
                Computing right now
              </p>
            </div>
          </dd>
        </div>
      </div>

      {loaded && (
        <ApexChart
          width="100%"
          height="350"
          type="area"
          options={chartOptions}
          series={series}
        />
      )}
    </div>
  );
};

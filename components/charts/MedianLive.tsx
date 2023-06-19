import { fetcher } from "@/fetcher";
import { RoundingFunction } from "@/lib/RoundingFunction";
import useSWR from "swr";
import { GolemIcon } from "../svg/GolemIcon";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
const PricingColumn = ({ title, value }: { title: string; value: number }) => {
  return (
    <div className="relative bg-white dark:bg-gray-800 pt-5 px-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden col-span-12">
      <div className="absolute top-0 right-4 -mr-1 mt-3 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
      <div className="absolute top-0 right-4 -mr-1 mt-3 w-4 h-4 rounded-full bg-green-300"></div>
      <div className="absolute bg-golemblue rounded-md p-3">
        <GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />
      </div>
      <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
        {title}
      </p>
      <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">
          {RoundingFunction(value)}
        </p>
        <p className="ml-2 flex items-baseline text-sm font-semibold text-golemblue dark:text-gray-400">
          GLM
        </p>
      </dd>
    </div>
  );
};

const MedianLive = () => {
  const { data, error } = useSWR("v1/network/pricing/median", fetcher, {
    refreshInterval: 10000,
  });

  return (
    <div>
      <h1 className="text-2xl col-span-12 font-medium dark:text-gray-300">
        Live Median Pricing
      </h1>
      <dl className="mt-2 grid grid-rows-4 grid-flow-col gap-4 grid-cols-12">
        {data ? (
          <>
            <PricingColumn title="CPU per hour" value={data.cpuhour} />
            <PricingColumn title="Env per hour" value={data.perhour} />
            <PricingColumn title="Start pricing" value={data.start} />
          </>
        ) : (
          <>
            <Skeleton height={100} />
            <Skeleton height={100} />
            <Skeleton height={100} />
          </>
        )}
      </dl>
    </div>
  );
};

export default MedianLive;

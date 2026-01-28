import { Card } from "@tremor/react";
import Skeleton from "react-loading-skeleton";
import { GolemIcon } from "../svg/GolemIcon";
import "react-loading-skeleton/dist/skeleton.css";

export const StatCard = ({
  title,
  value,
  unit,
  loading,
  variant = "golem",
}: {
  title: string;
  value: number | undefined;
  unit: string;
  loading: boolean;
  variant?: "golem" | "salad";
}) => {
  const isLoading = loading || value === undefined;

  const unitTextClass =
    variant === "golem"
      ? "text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue"
      : "text-saladGreen dark:text-dark-saladGreen";
  const glmIconBgClass = variant === "salad" ? "bg-saladGreen" : "bg-golemblue";

  return (
    <Card className="relative bg-white dark:bg-gray-900 ">
      <dt>
        <div className={`absolute ${glmIconBgClass} p-3`}>
          <GolemIcon
            className="h-6 w-6 text-white"
            aria-hidden="true"
            variant={variant}
          />
        </div>
        {isLoading ? (
          <div className="ml-16">
            <Skeleton width={160} />
          </div>
        ) : (
          <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {title}
          </p>
        )}
      </dt>
      <dd className="ml-16 flex items-baseline ">
        {isLoading ? (
          <div className="flex items-baseline">
            <Skeleton width={100} />
            <Skeleton width={30} className="ml-2" />
          </div>
        ) : (
          <>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">
              {(() => {
                const strValue = value.toString();
                const decimalIndex = strValue.indexOf(".");
                if (decimalIndex !== -1) {
                  // Check if there are at least 5 digits after the decimal
                  return strValue.length > decimalIndex + 2
                    ? strValue.substring(0, decimalIndex + 3) // Include up to the 5th digit after the decimal
                    : strValue; // If fewer than 5 digits, return the whole number
                }
                return strValue; // Return the number if it doesn't have a decimal point
              })()}
            </p>
            <p
              className={`ml-2 flex items-baseline text-sm font-semibold ${unitTextClass}`}
            >
              {unit}
            </p>
          </>
        )}
      </dd>
    </Card>
  );
};

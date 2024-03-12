import { RoundingFunction } from "@/lib/RoundingFunction"
const priceHashMapOrDefault = (provider, usage) => {
    const runtime = provider.runtimes.vm || provider.runtimes.wasmtime
    return PriceHashmap(runtime.properties, usage)
}

import { PriceHashmap } from "@/lib/PriceHashmap"

import IntelIcon from "./svg/IntelIcon"
import AMDIcon from "./svg/AMDIcon"
import HardwareBadge from "./HardwareBadge"
import ReputationIndicator from "./ReputationIndicator"
import UptimeDots from "./UptimeDots"
import { Tooltip as ReactTooltip } from "react-tooltip"
import { RiArrowDownLine, RiArrowUpLine } from "@remixicon/react"
import Link from "next/link"
import { GolemIcon } from "./svg/GolemIcon"

const VmRuntimeView = ({ provider }) => {
    const IconComponent = provider.runtimes.vm?.properties?.["golem.inf.cpu.vendor"] === "GenuineIntel" ? IntelIcon : AMDIcon
    const additionalClasses = provider.runtimes.vm?.properties?.["golem.inf.cpu.vendor"] === "AuthenticAMD" ? "fill-red-500" : ""

    return (
        <Link
            href={{
                pathname: "/network/provider/[node_id]",
                query: { node_id: provider.node_id },
            }}
            key={provider.id}
            className="lg:col-span-5 col-span-12 grid grid-cols-12 gap-4 items-center bg-white dark:bg-transparent dark:hover:bg-gray-800 py-4 px-4 hover:bg-tremor-background-graygolem hover:cursor-pointer dark:border-dark-tremor-border dark:border"
        >
            <div className="lg:col-span-2 col-span-4 flex items-center gap-2">
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-golemblue  p-3 relative">
                        {
                            // Check if the provider is offline
                            !provider.online ? (
                                <div>
                                    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-gray-500"></div>
                                </div>
                            ) : provider.computing_now ? (
                                // Check if the provider is online and computing
                                <div>
                                    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-yellow-500 animate-ping"></div>
                                    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-yellow-500"></div>
                                </div>
                            ) : (
                                // Provider is online but not computing
                                <div>
                                    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-green-300 animate-ping"></div>
                                    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-green-300"></div>
                                </div>
                            )
                        }
                        <GolemIcon className={`h-6 w-6 text-white ${provider.online ? "opacity-100" : "opacity-50"}`} aria-hidden="true" />
                    </div>
                </div>
                <div className="ml-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-inter ">
                        {provider.runtimes.vm?.properties?.["golem.node.id.name"]}
                    </p>
                    <p className="text-sm  text-gray-400 dark:text-white ">
                        {provider.runtimes.vm?.properties?.["golem.node.debug.subnet"]}
                    </p>
                    <p className="text-sm  text-gray-400 dark:text-white">{provider.version}</p>
                </div>
            </div>
            <div className="lg:col-span-4 md:col-span-6 col-span-12 flex items-center gap-2">
                <div className="grid grid-cols-1 gap-2">
                    <div className="flex-container">
                        <HardwareBadge
                            title="CPU"
                            icon={<IconComponent className={`h-4 w-4 ${additionalClasses}`} />}
                            value={provider.runtimes.vm?.properties?.["golem.inf.cpu.brand"] || "Unknown"}
                        />
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2 col-span-4 flex items-center gap-2">
                <div>
                    <p
                        data-tooltip-id={`price-hourly${provider.node_id}`}
                        className="text-sm font-medium dark:text-dark-tremor-content-metric"
                    >
                        ${RoundingFunction(provider.runtimes.vm?.hourly_price_usd, 6)} /Hour
                        <ReactTooltip
                            id={`price-hourly${provider.node_id}`}
                            place="bottom"
                            content={`Calculated using the formula: Assuming 100% usage on ${
                                provider.runtimes.vm?.properties?.["golem.inf.cpu.threads"]
                            } CPU threads at a rate of ${priceHashMapOrDefault(
                                provider,
                                "golem.usage.cpu_sec"
                            )} GLM per thread, plus an environment rate of ${priceHashMapOrDefault(
                                provider,
                                "golem.usage.duration_sec"
                            )} GLM per hour, and a start price of ${
                                provider.runtimes.vm?.properties?.["golem.com.pricing.model.linear.coeffs"]?.slice(-1)[0]
                            } GLM. These costs are then converted to USD based on the current GLM price.`}
                            className="break-words max-w-64 z-50"
                        />
                    </p>
                    {provider.runtimes?.vm?.times_cheaper && (
                        <p
                            data-tooltip-id={`price-comparison-tooltip${provider.node_id}`}
                            className="text-sm text-green-500 dark:text-gray-400"
                        >
                            -{RoundingFunction(provider.runtimes.vm?.times_cheaper)}%{" "}
                            <RiArrowDownLine className="inline-block h-4 w-4 text-green-500" />
                            <ReactTooltip
                                id={`price-comparison-tooltip${provider.node_id}`}
                                place="bottom"
                                content={`Based on available data, this provider's pricing is approximately ${RoundingFunction(
                                    provider.runtimes.vm?.times_cheaper
                                )}% cheaper than an AWS instance of similar specifications.`}
                                className="break-words max-w-64 z-50"
                            />
                        </p>
                    )}
                    {provider.runtimes?.vm?.times_more_expensive && (
                        <p
                            data-tooltip-id={`price-comparison-tooltip${provider.node_id}`}
                            className="text-sm text-red-500 dark:text-gray-400"
                        >
                            +{RoundingFunction(provider.runtimes.vm?.times_more_expensive)}%
                            <RiArrowUpLine className="inline-block h-4 w-4 text-red-500" />
                            <ReactTooltip
                                id={`price-comparison-tooltip${provider.node_id}`}
                                place="bottom"
                                content={`Based on available data, this provider's pricing is approximately ${RoundingFunction(
                                    provider.runtimes.vm?.times_more_expensive
                                )}% higher than an AWS instance of similar specifications.`}
                                className="break-words max-w-64 z-50"
                            />
                        </p>
                    )}
                </div>
            </div>
            <div className="lg:col-span-2 col-span-4 lg:flex hidden items-center gap-2">
                <ReputationIndicator taskReputation={provider.reputation.taskReputation} />
            </div>
            <div className="lg:col-span-2 col-span-4 flex items-center gap-2">
                <UptimeDots uptime={provider.uptime} />
            </div>
        </Link>
    )
}

export default VmRuntimeView

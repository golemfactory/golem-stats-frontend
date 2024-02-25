// @ts-nocheck
import { PriceHashmap } from "@/lib/PriceHashmap"
import useSWR, { SWRResponse } from "swr"
import { fetcher } from "@/fetcher"
import { RoundingFunction } from "@/lib/RoundingFunction"
import { GolemIcon } from "./svg/GolemIcon"
import { useState } from "react"
import { CpuChipIcon, CircleStackIcon, Square3Stack3DIcon } from "@heroicons/react/24/solid"
import { useRouter } from "next/router"
import { useMemo, useCallback } from "react"
import moment from "moment-timezone"
import { TextInput, Select, SelectItem, Card } from "@tremor/react"
import UptimeDots from "./UptimeDots"
import { Tooltip as ReactTooltip } from "react-tooltip"
import {
    RiArrowDownCircleLine,
    RiArrowDownLine,
    RiArrowUpCircleLine,
    RiArrowUpLine,
    RiCloseCircleLine,
    RiQuestionLine,
    RiShieldCheckLine,
} from "@remixicon/react"
import ReputationIndicator from "./ReputationIndicator"
import Link from "next/link"
import HardwareBadge from "./HardwareBadge"
import NvidiaIcon from "./svg/NvidiaIcon"
import IntelIcon from "./svg/IntelIcon"
import AMDIcon from "./svg/AMDIcon"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const ITEMS_PER_PAGE = 30

const displayPages = (currentPage: number, lastPage: number) => {
    const pages = []
    if (currentPage <= 3 || lastPage <= 5) {
        for (let i = 1; i <= Math.min(5, lastPage); i++) {
            pages.push(i)
        }
    } else if (currentPage >= lastPage - 2) {
        for (let i = lastPage - 4; i <= lastPage; i++) {
            pages.push(i)
        }
    } else {
        pages.push(currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2)
    }
    return pages
}

const useProviderPagination = (data) => {
    const [page, setPage] = useState(1)

    const sortedData = useMemo(() => {
        if (!data) return []

        return [...data].sort((a, b) => {
            // Check for the presence of provider.runtimes["vm-nvidia"] and give top priority
            const aHasNvidia = a.runtimes?.["vm-nvidia"] !== undefined
            const bHasNvidia = b.runtimes?.["vm-nvidia"] !== undefined

            if (aHasNvidia && !bHasNvidia) return -1
            if (bHasNvidia && !aHasNvidia) return 1

            // Then handle null values in taskReputation by pushing them to the bottom
            if (a.taskReputation === null) return 1
            if (b.taskReputation === null) return -1

            // Finally, sort in descending order by taskReputation
            return b.taskReputation - a.taskReputation
        })
    }, [data])

    const paginatedData = useMemo(() => {
        return sortedData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    }, [sortedData, page])

    const lastPage = Math.ceil(sortedData.length / ITEMS_PER_PAGE)

    return { page, data: paginatedData, lastPage, setPage }
}

const priceHashMapOrDefault = (provider, usage) => {
    const runtime = provider.runtimes.vm || provider.runtimes.wasmtime
    return PriceHashmap(runtime.properties, usage)
}

export const isUpdateNeeded = (updatedAt) => {
    const timeZone = "Europe/Copenhagen"

    // Get the current date/time in Europe/Copenhagen timezone
    const nowInCopenhagen = moment.tz(timeZone)

    // Parse updatedAt as a Moment object in the Europe/Copenhagen timezone
    const updatedAtMoment = moment.tz(updatedAt, timeZone)

    const twoHours = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

    return nowInCopenhagen.diff(updatedAtMoment) > twoHours
}

export const ProviderList = ({ endpoint, initialData, enableShowingOfflineNodes = false }) => {
    const { data: rawData, error } = useSWR(endpoint, fetcher, { refreshInterval: 10000, initialData })

    const [filters, setFilters] = useState({ showOffline: false })

    const handleFilterChange = useCallback((key, value) => {
        if (key === "showOffline") {
            value = value === "True"
        } else if (value === "") {
            value = null // Allow clearing of filter values
        }
        setFilters((prevFilters) => ({ ...prevFilters, [key]: value }))
        setPage(1)
    }, [])
    const handleNameSearchChange = (value, filterKey) => {
        handleFilterChange(filterKey, value)
    }

    const filterProvider = useCallback((provider, filters) => {
        if (!filters.showOffline && !provider.online) {
            return false
        }
        return Object.entries(filters).every(([filterKey, filterValue]) => {
            if (filterValue === null) return true // Ignore empty filters

            const properties = provider?.runtimes?.vm?.properties || {}
            let valueToCheck

            switch (filterKey) {
                case "golem.node.id.name":
                    valueToCheck = properties["golem.node.id.name"]
                    return valueToCheck?.toString().toLowerCase().includes(filterValue.toLowerCase())
                case "golem.inf.cpu.threads":
                    valueToCheck = properties["golem.inf.cpu.threads"]
                    return valueToCheck === parseInt(filterValue)
                case "golem.inf.mem.gib":
                case "golem.inf.storage.gib":
                    valueToCheck = parseFloat(properties[filterKey])
                    const tolerance = 0.5 // define your tolerance level
                    return Math.abs(valueToCheck - parseFloat(filterValue)) <= tolerance
                case "network":
                    // Assuming filterValue is either "Mainnet" or "Testnet"
                    const isMainnet = properties["golem.com.payment.platform.erc20-mainnet-glm.address"] !== undefined
                    return (filterValue === "Mainnet" && isMainnet) || (filterValue === "Testnet" && !isMainnet)
                case "showOffline":
                    // Show both online and offline providers
                    return true
                default:
                    valueToCheck = provider[filterKey]
                    if (typeof filterValue === "boolean") {
                        return filterValue === valueToCheck
                    }
                    return valueToCheck?.toString().toLowerCase().includes(filterValue.toLowerCase())
            }
        })
    }, [])

    const filteredData = useMemo(() => {
        return rawData
            ? rawData.filter((provider) => {
                  // First, apply the existing filter condition
                  const isProviderFiltered = filterProvider(provider, filters)

                  // Then, check for the presence of either provider.runtimes.vm or provider.runtimes["vm-nvidia"]
                  const hasRequiredRuntime = provider.runtimes && (provider.runtimes.vm || provider.runtimes["vm-nvidia"])

                  // Include the provider only if both conditions are met
                  return isProviderFiltered && hasRequiredRuntime
              })
            : []
    }, [rawData, filters, filterProvider])

    const { page, data: paginatedData, lastPage, setPage } = useProviderPagination(filteredData)
    const handleNext = () => setPage(page < lastPage ? page + 1 : lastPage)
    const handlePrevious = () => setPage(page > 1 ? page - 1 : 1)
    const visiblePages = displayPages(page, lastPage)

    return (
        <div className="flex flex-col ">
            <Card className="pb-9">
                <h2 className="text-xl mb-2 font-medium  dark:text-gray-300">Filters</h2>
                <div className="flex flex-wrap gap-4 ">
                    <div>
                        <label htmlFor="providerName" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Node Name
                        </label>
                        <div className="mt-2">
                            <TextInput
                                type="text"
                                name="providerName"
                                id="providerName"
                                onValueChange={(value) => handleNameSearchChange(value, "golem.node.id.name")}
                                placeholder="Search by Name"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="cores" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Cores
                        </label>
                        <div className="mt-2">
                            <TextInput
                                type="number"
                                name="cores"
                                id="cores"
                                onValueChange={(value) => handleNameSearchChange(value, "golem.inf.cpu.threads")}
                                placeholder="Number of Cores"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="memory" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Memory <span className="text-xs font-light text-gray-600 dark:text-gray-400">(±0.5 GB tolerance)</span>
                        </label>

                        <div className="mt-2">
                            <TextInput
                                type="number"
                                name="memory"
                                id="memory"
                                onValueChange={(value) => handleNameSearchChange(value, "golem.inf.mem.gib")}
                                placeholder="Memory in GB"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="disk" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Disk <span className="text-xs font-light text-gray-600 dark:text-gray-400">(±0.5 GB tolerance)</span>
                        </label>

                        <div className="mt-2">
                            <TextInput
                                type="number"
                                name="disk"
                                id="disk"
                                onValueChange={(value) => handleNameSearchChange(value, "golem.inf.storage.gib")}
                                placeholder="Disk in GB"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="network" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Network
                        </label>
                        <Select
                            defaultValue="Mainnet"
                            id="network"
                            name="network"
                            className="z-50 mt-2"
                            onValueChange={(value) => handleNameSearchChange(value, "network")}
                        >
                            <SelectItem value="Mainnet">Mainnet</SelectItem>
                            <SelectItem value="Testnet">Testnet</SelectItem>
                        </Select>
                    </div>
                    {enableShowingOfflineNodes && (
                        <div>
                            <label htmlFor="network" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                Show offline nodes
                            </label>
                            <Select id="showOffline" name="showOffline" onValueChange={(value) => handleFilterChange("showOffline", value)}>
                                <SelectItem value="False">Hide Offline</SelectItem>
                                <SelectItem value="True">Show Offline</SelectItem>
                            </Select>
                        </div>
                    )}
                </div>
            </Card>
            <Card>
                <div className="grid grid-cols-12 gap-4 px-4 bg-golemblue text-white py-4 my-4 font-medium">
                    <div className="lg:col-span-2 md:col-span-4 col-span-12 inline-flex items-center">
                        <p>Provider</p>
                        <RiQuestionLine data-tooltip-id="provider-tooltip" className="h-4 w-4 ml-1" />
                        <ReactTooltip
                            id="provider-tooltip"
                            place="bottom"
                            content="The name of the provider, the subnet it is running on, and the version of the provider."
                            className="break-words max-w-64 z-50"
                        />
                    </div>
                    <div className="lg:col-span-4 md:col-span-4 col-span-12 inline-flex items-center">
                        <p>Hardware</p>
                        <RiQuestionLine data-tooltip-id="hardware-tooltip" className="h-4 w-4 ml-1" />
                        <ReactTooltip
                            id="hardware-tooltip"
                            place="bottom"
                            content="GPU support is currently in beta testing. CPU is supported by default."
                            className="break-words max-w-64 z-50"
                        />
                    </div>
                    <div className="lg:col-span-2 md:col-span-4 col-span-12 inline-flex items-center">
                        <p>Price</p>
                        <RiQuestionLine data-tooltip-id="price-tooltip" className="h-4 w-4 ml-1" />
                        <ReactTooltip
                            id="price-tooltip"
                            place="bottom"
                            content="The price of the provider per hour assuming 100% utilization.


                            The percentage indicates how much cheaper or more expensive the provider is compared to an AWS instance of similar specs. Green indicates cheaper, red indicates more expensive."
                            className="break-words max-w-64 z-50"
                        />
                    </div>
                    <div className="lg:col-span-2 md:col-span-4 col-span-12 inline-flex items-center">
                        <p>Reputation</p>
                        <RiQuestionLine data-tooltip-id="reputation-tooltip" className="h-4 w-4 ml-1" />
                        <ReactTooltip
                            id="reputation-tooltip"
                            place="bottom"
                            content="The reputation of the provider based on the success ratio of the tasks it has completed. A value of 1.0 indicates a perfect reputation."
                            className="break-words max-w-64 z-50"
                        />
                    </div>
                    <div className="lg:col-span-2 md:col-span-4 col-span-12 inline-flex items-center">
                        <p>Uptime</p>
                        <RiQuestionLine data-tooltip-id="uptime-tooltip" className="h-4 w-4 ml-1" />
                        <ReactTooltip
                            id="uptime-tooltip"
                            place="bottom"
                            content="The uptime of the provider since it was first seen on the network."
                            className="break-words max-w-64 z-50"
                        />
                    </div>
                </div>
                <div className="grid lg:grid-cols-5 gap-4 h-full grid-cols-12">
                    {!rawData
                        ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                              <div className="lg:col-span-5 col-span-12">
                                  <Skeleton key={index} height={100} />
                              </div>
                          ))
                        : paginatedData?.map((provider) => {
                              const cpuVendor = provider.runtimes.vm?.properties["golem.inf.cpu.vendor"]
                              let IconComponent
                              let additionalClasses = ""

                              switch (cpuVendor) {
                                  case "GenuineIntel":
                                      IconComponent = IntelIcon // Your Intel icon component
                                      break
                                  case "AuthenticAMD":
                                      IconComponent = AMDIcon // Your AMD icon component
                                      additionalClasses = "fill-red-500" // Apply specific class for AMD
                                      break
                                  default:
                                      IconComponent = DefaultIcon // A default icon component, if you have one
                              }

                              return (
                                  <Link
                                      href={{
                                          pathname: "/network/provider/[node_id]",
                                          query: { node_id: provider.node_id },
                                      }}
                                      key={provider.id}
                                      className="lg:col-span-5 col-span-12 grid grid-cols-12 gap-4 items-center bg-golembackground py-4 px-4 hover:bg-gray-200 hover:cursor-pointer"
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
                                                  <GolemIcon
                                                      className={`h-6 w-6 text-white ${provider.online ? "opacity-100" : "opacity-50"}`}
                                                      aria-hidden="true"
                                                  />
                                              </div>
                                          </div>
                                          <div className="ml-1">
                                              <p className="text-sm font-medium text-gray-900 dark:text-white ">
                                                  {provider.runtimes.vm?.properties["golem.node.id.name"]}
                                              </p>
                                              <p className="text-sm  text-gray-400 dark:text-white ">
                                                  {provider.runtimes.vm?.properties["golem.node.debug.subnet"]}
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
                                                      value={provider.runtimes.vm?.properties["golem.inf.cpu.brand"]}
                                                  />
                                              </div>
                                              {provider.runtimes["vm-nvidia"]?.properties && (
                                                  <div className="flex-container">
                                                      <HardwareBadge
                                                          title="GPU"
                                                          icon={<NvidiaIcon className="h-5 w-5 flex-shrink-0" />}
                                                          value={
                                                              provider.runtimes["vm-nvidia"].properties[
                                                                  "golem.!exp.gap-35.v1.inf.gpu.model"
                                                              ]
                                                          }
                                                      />
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                      <div className="lg:col-span-2 col-span-4 flex items-center gap-2">
                                          <div>
                                              <p data-tooltip-id={`price-hourly${provider.node_id}`} className="text-sm font-medium">
                                                  ${RoundingFunction(provider.runtimes.vm?.hourly_price_usd)} /Hour
                                                  <ReactTooltip
                                                      id={`price-hourly${provider.node_id}`}
                                                      place="bottom"
                                                      content={`Calculated using the formula: Assuming 100% usage on ${
                                                          provider.runtimes.vm?.properties["golem.inf.cpu.threads"]
                                                      } CPU threads at a rate of ${priceHashMapOrDefault(
                                                          provider,
                                                          "golem.usage.cpu_sec"
                                                      )} GLM per thread, plus an environment rate of ${priceHashMapOrDefault(
                                                          provider,
                                                          "golem.usage.duration_sec"
                                                      )} GLM per hour, and a start price of ${
                                                          provider.runtimes.vm?.properties["golem.com.pricing.model.linear.coeffs"]?.slice(
                                                              -1
                                                          )[0]
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
                                          <ReputationIndicator taskReputation={provider.taskReputation} />
                                      </div>
                                      <div className="lg:col-span-2 col-span-4 flex items-center gap-2">
                                          <UptimeDots uptime={provider.uptime} />
                                      </div>
                                  </Link>
                              )
                          })}
                </div>

                <div className="flex justify-center mt-4 py-4 gap-2 flex-wrap">
                    <button
                        onClick={handlePrevious}
                        disabled={page === 1}
                        className={`px-5 py-2 ${
                            page === 1
                                ? "text-gray-400 bg-gray-200 dark:bg-golemblue/20 cursor-not-allowed border border-gray-200"
                                : "text-white bg-golemblue hover:bg-white transition duration-300 hover:text-golemblue border border-golemblue "
                        }`}
                    >
                        Previous
                    </button>
                    {visiblePages.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => setPage(pageNumber)}
                            className={`px-5 py-2  ${
                                page === pageNumber
                                    ? "text-golemblue bg-white border border-golemblue"
                                    : "text-white bg-golemblue hover:bg-white transition duration-300 hover:text-golemblue border border-golemblue "
                            }`}
                        >
                            {pageNumber}
                        </button>
                    ))}
                    <button
                        onClick={handleNext}
                        disabled={page === lastPage}
                        className={`px-5 py-2  ${
                            page === lastPage
                                ? "text-gray-400 bg-gray-200 dark:bg-golemblue/20 cursor-not-allowed border border-gray-200"
                                : "text-white bg-golemblue hover:bg-white transition duration-300 hover:text-golemblue border border-golemblue "
                        }`}
                    >
                        Next
                    </button>
                </div>
            </Card>
        </div>
    )
}

// @ts-nocheck
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { useState } from "react"
import { useMemo, useCallback } from "react"
import moment from "moment-timezone"
import { TextInput, Select, SelectItem, Card } from "@tremor/react"
import { Tooltip as ReactTooltip } from "react-tooltip"
import { RiQuestionLine } from "@remixicon/react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import VmRuntimeView from "./VmRuntimeView"
import VmNvidiaRuntimeView from "./VmNvidiaRuntimeView"

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

const useProviderPagination = (data, sortBy) => {
    const [page, setPage] = useState(1)

    const sortedData = useMemo(() => {
        if (!data) return []

        const sorted = [...data].sort((a, b) => {
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

        if (sortBy) {
            switch (sortBy) {
                case "price":
                    return sorted.sort((a, b) => a.runtimes.vm?.hourly_price_usd - b.runtimes.vm?.hourly_price_usd)
                case "reputation":
                    return sorted.sort((a, b) => b.taskReputation - a.taskReputation)
                case "uptime":
                    return sorted.sort((a, b) => b.uptime - a.uptime)
                default:
                    return sorted
            }
        }
        return sorted
    }, [data, sortBy])

    const paginatedData = useMemo(() => {
        return sortedData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    }, [sortedData, page])

    const lastPage = Math.ceil(sortedData.length / ITEMS_PER_PAGE)

    return { page, data: paginatedData, lastPage, setPage }
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
    const { data: rawData, error } = useSWR(endpoint, fetcher, { refreshInterval: 60000, initialData })

    const [filters, setFilters] = useState({ showOffline: false, runtime: "all" })

    const handleFilterChange = useCallback((key, value) => {
        if (key === "showOffline") {
            value = value === "True"
        } else if (["sortBy", "runtime"].includes(key)) {
        } else if (value === "") {
            value = null
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
        if (filters.runtime !== "all" && !provider.runtimes?.[filters.runtime]) {
            return false
        }
        if (filters.sortBy) {
            return true
        }

        return Object.entries(filters).every(([filterKey, filterValue]) => {
            if (filterValue === null) return true

            const properties = provider?.runtimes?.vm?.properties || {}
            let valueToCheck

            switch (filterKey) {
                case "nodeIdOrName":
                    return (
                        provider.node_id.toString().toLowerCase().includes(filterValue.toLowerCase()) ||
                        properties["golem.node.id.name"]?.toLowerCase().includes(filterValue.toLowerCase())
                    )
                case "taskReputation":
                    valueToCheck = provider.taskReputation
                    return valueToCheck >= parseFloat(filterValue)
                case "uptime":
                    valueToCheck = provider.uptime
                    return valueToCheck >= parseFloat(filterValue)
                case "runtimes.vm.hourly_price_usd":
                    valueToCheck = provider.runtimes?.[filters.runtime]?.hourly_price_usd ?? provider.runtimes?.vm?.hourly_price_usd
                    return valueToCheck <= parseFloat(filterValue)
                case "golem.inf.cpu.threads":
                    valueToCheck = properties["golem.inf.cpu.threads"]
                    return valueToCheck === parseInt(filterValue)
                case "golem.inf.mem.gib":
                case "golem.inf.storage.gib":
                    valueToCheck = parseFloat(properties[filterKey])
                    const tolerance = 0.5
                    return Math.abs(valueToCheck - parseFloat(filterValue)) <= tolerance
                case "network":
                    const isMainnet = properties["golem.com.payment.platform.erc20-mainnet-glm.address"] !== undefined
                    return (filterValue === "Mainnet" && isMainnet) || (filterValue === "Testnet" && !isMainnet)
                case "showOffline":
                    return true
                default:
                    return true
            }
        })
    }, [])

    const filteredData = useMemo(() => {
        return rawData
            ? rawData.filter((provider) => {
                  const isProviderFiltered = filterProvider(provider, filters)

                  const hasRequiredRuntime = provider.runtimes && (filters.runtime === "all" || provider.runtimes[filters.runtime])

                  return isProviderFiltered && hasRequiredRuntime
              })
            : []
    }, [rawData, filters, filterProvider])

    const { page, data: paginatedData, lastPage, setPage } = useProviderPagination(filteredData, filters.sortBy)

    const handleNext = () => setPage(page < lastPage ? page + 1 : lastPage)
    const handlePrevious = () => setPage(page > 1 ? page - 1 : 1)
    const visiblePages = displayPages(page, lastPage)

    return (
        <div className="flex flex-col ">
            <Card className="pb-9">
                <h2 className="text-xl mb-2 font-medium  dark:text-gray-300">Filters</h2>
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-wrap gap-4 ">
                        <div>
                            <label
                                htmlFor="providerNameOrId"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                            >
                                Node Name or ID
                            </label>
                            <div className="mt-2">
                                <TextInput
                                    type="text"
                                    name="providerNameOrId"
                                    id="providerNameOrId"
                                    onValueChange={(value) => handleNameSearchChange(value, "nodeIdOrName")}
                                    placeholder="Search by Name or ID"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="cores" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter">
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
                            <label
                                htmlFor="memory"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                            >
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
                            <label htmlFor="disk" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter">
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
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label
                                htmlFor="reputation"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                            >
                                Reputation
                            </label>
                            <div className="mt-2">
                                <TextInput
                                    type="number"
                                    name="reputation"
                                    id="reputation"
                                    onValueChange={(value) => handleNameSearchChange(value, "taskReputation")}
                                    placeholder="Minimum reputation"
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="uptime"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                            >
                                Uptime
                            </label>
                            <div className="mt-2">
                                <TextInput
                                    type="number"
                                    name="uptime"
                                    id="uptime"
                                    onValueChange={(value) => handleNameSearchChange(value, "uptime")}
                                    placeholder="Minimum uptime percentage"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter">
                                Price ($/Hour)
                            </label>
                            <div className="mt-2">
                                <TextInput
                                    type="number"
                                    name="price"
                                    id="price"
                                    onValueChange={(value) => handleNameSearchChange(value, "runtimes.vm.hourly_price_usd")}
                                    placeholder="Maximum price per hour"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="network"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                            >
                                Network
                            </label>
                            <Select
                                defaultValue="Mainnet"
                                id="network"
                                name="network"
                                className="z-40 mt-2"
                                onValueChange={(value) => handleNameSearchChange(value, "network")}
                            >
                                <SelectItem value="Mainnet">Mainnet</SelectItem>
                                <SelectItem value="Testnet">Testnet</SelectItem>
                            </Select>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label
                                htmlFor="runtime"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                            >
                                Runtime
                            </label>
                            <Select
                                id="runtime"
                                name="runtime"
                                defaultValue="all"
                                className="z-40 mt-2"
                                onValueChange={(value) => handleFilterChange("runtime", value)}
                            >
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="vm">VM</SelectItem>
                                <SelectItem value="vm-nvidia">VM Nvidia</SelectItem>
                            </Select>
                        </div>
                    </div>

                    {enableShowingOfflineNodes && (
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <label
                                    htmlFor="network"
                                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                                >
                                    Show offline nodes
                                </label>
                                <Select
                                    id="showOffline"
                                    name="showOffline"
                                    className="z-40 mt-2"
                                    onValueChange={(value) => handleFilterChange("showOffline", value)}
                                >
                                    <SelectItem value="False">False</SelectItem>
                                    <SelectItem value="True">True</SelectItem>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            <Card>
                <div className="grid grid-cols-12 gap-4 px-4 bg-golemblue text-white py-4 my-4 font-medium">
                    <div className="lg:col-span-2 md:col-span-4 col-span-12 inline-flex items-center">
                        <p className="font-inter">Provider</p>
                        <RiQuestionLine data-tooltip-id="provider-tooltip" className="h-4 w-4 ml-1" />
                        <ReactTooltip
                            id="provider-tooltip"
                            place="bottom"
                            content="The name of the provider, the subnet it is running on, and the version of the provider."
                            className="break-words max-w-64 z-50"
                        />
                    </div>
                    <div className="lg:col-span-4 md:col-span-4 col-span-12 inline-flex items-center">
                        <p className="font-inter">Hardware</p>
                        <RiQuestionLine data-tooltip-id="hardware-tooltip" className="h-4 w-4 ml-1" />
                        <ReactTooltip
                            id="hardware-tooltip"
                            place="bottom"
                            content="GPU support is currently in beta testing. CPU is supported by default."
                            className="break-words max-w-64 z-50"
                        />
                    </div>
                    <div className="lg:col-span-2 md:col-span-4 col-span-12 inline-flex items-center">
                        <p className="font-inter">Price</p>
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
                        <p className="font-inter">Reputation Score</p>
                        <RiQuestionLine data-tooltip-id="reputation-tooltip" className="h-4 w-4 ml-1" />
                        <ReactTooltip
                            id="reputation-tooltip"
                            place="bottom"
                            content="The reputation score assesses if tasks were completed successfully or not while the provider was under evaluation by the reputation system. A score of 1.0 indicates a 100% success rate in task completion during this period, while a score of 0.0 is the lowest possible, reflecting complete failure in task completion. If the score is marked as N/A, it likely means that the provider hasn't been tested, possibly due to the high costs associated with conducting the test."
                            className="break-words max-w-64 z-50"
                        />
                    </div>
                    <div className="lg:col-span-2 md:col-span-4 col-span-12 inline-flex items-center">
                        <p className="font-inter">Uptime</p>
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
                              <div key={index} className="lg:col-span-5 col-span-12">
                                  <Skeleton height={100} />
                              </div>
                          ))
                        : paginatedData?.map((provider) => {
                              if (filters.runtime === "vm-nvidia" || (filters.runtime === "all" && provider.runtimes["vm-nvidia"])) {
                                  return <VmNvidiaRuntimeView provider={provider} key={provider.node_id} />
                              } else if (filters.runtime === "vm" || (filters.runtime === "all" && provider.runtimes["vm"])) {
                                  return <VmRuntimeView provider={provider} key={provider.node_id} />
                              } else {
                                  return null
                              }
                          })}
                </div>

                <div className="flex justify-center mt-4 py-4 gap-2 flex-wrap">
                    <button
                        onClick={handlePrevious}
                        disabled={page === 1}
                        className={`px-5 py-2 ${
                            page === 1
                                ? "text-gray-400 bg-gray-200 dark:bg-golemblue/20 cursor-not-allowed border border-gray-200"
                                : "text-white bg-golemblue hover:bg-white transition duration-300 hover:text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue border border-golemblue "
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
                                    ? "text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue bg-white border border-golemblue"
                                    : "text-white bg-golemblue hover:bg-white transition duration-300 hover:text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue border border-golemblue "
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
                                : "text-white bg-golemblue hover:bg-white transition duration-300 hover:text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue border border-golemblue "
                        }`}
                    >
                        Next
                    </button>
                </div>
            </Card>
        </div>
    )
}

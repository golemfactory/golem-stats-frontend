// @ts-nocheck
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { useState } from "react"
import { useMemo, useCallback } from "react"
import moment from "moment-timezone"
import { TextInput, Select, SelectItem, Card } from "@tremor/react"
import { Tooltip as ReactTooltip } from "react-tooltip"
import { RiFilterLine, RiQuestionLine, RiTeamLine } from "@remixicon/react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import VmRuntimeView from "./VmRuntimeView"
import VmNvidiaRuntimeView from "./VmNvidiaRuntimeView"
import { Accordion, AccordionBody, AccordionHeader, AccordionList } from "@tremor/react"
import HardwareFilterModal from "./HardwareFilterModal"
import FilterDialog from "./FilterDialog"
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
            if (a.reputation.taskReputation === null) return 1
            if (b.reputation.taskReputation === null) return -1

            // Finally, sort in descending order by taskReputation
            return b.reputation.taskReputation - a.reputation.taskReputation
        })

        if (sortBy) {
            switch (sortBy) {
                case "price":
                    return sorted.sort((a, b) => a.runtimes.vm?.hourly_price_usd - b.runtimes.vm?.hourly_price_usd)
                case "reputation":
                    return sorted.sort((a, b) => b.reputation.taskReputation - a.reputation.taskReputation)
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

    const filterProvider = useCallback((provider, filters) => {
        if (!filters.showOffline && !provider.online) {
            return false
        }
        if (filters.runtime !== "all" && !provider.runtimes?.[filters.runtime]) {
            return false
        }

        if (filters.hardware && filters.hardware.length) {
            const hardwareMatched = filters.hardware.some((hardware) => {
                const hasHardwareInVm = provider.runtimes?.vm?.properties["golem.inf.cpu.brand"] === hardware
                const hasHardwareInVmNvidia =
                    provider.runtimes?.["vm-nvidia"]?.properties["golem.!exp.gap-35.v1.inf.gpu.model"] === hardware
                return hasHardwareInVm || hasHardwareInVmNvidia
            })
            if (!hardwareMatched) return false
        }

        return Object.entries(filters).every(([filterKey, filterValue]) => {
            if (filterKey === "hardware") return true // Skip hardware as it's already handled
            if (filterValue === null) return true
            const properties = provider?.runtimes?.vm?.properties || {}
            let valueToCheck

            switch (filterKey) {
                case "nodeName":
                    return properties["golem.node.id.name"]?.toLowerCase().includes(filterValue.toLowerCase())
                case "providerId":
                    return provider.node_id.toString().toLowerCase().includes(filterValue.toLowerCase())
                case "price":
                    valueToCheck =
                        filters.runtime === "all"
                            ? Math.min(
                                  provider.runtimes?.vm?.hourly_price_usd ?? Infinity,
                                  provider.runtimes?.["vm-nvidia"]?.hourly_price_usd ?? Infinity
                              )
                            : provider.runtimes?.[filters.runtime]?.hourly_price_usd
                    return valueToCheck !== Infinity ? valueToCheck <= parseFloat(filterValue) : false

                case "taskReputation":
                    valueToCheck = provider.reputation.taskReputation
                    return valueToCheck !== null ? valueToCheck >= parseFloat(filterValue) : false
                case "uptime":
                    valueToCheck = provider.uptime
                    return valueToCheck !== null ? valueToCheck >= parseFloat(filterValue) : false
                case "runtimes.vm.hourly_price_usd":
                    valueToCheck = provider.runtimes?.[filters.runtime]?.hourly_price_usd ?? provider.runtimes?.vm?.hourly_price_usd
                    return valueToCheck ? valueToCheck <= parseFloat(filterValue) : false
                case "golem.inf.cpu.threads":
                    valueToCheck = properties["golem.inf.cpu.threads"]
                    return valueToCheck ? valueToCheck === parseInt(filterValue) : false
                case "golem.inf.mem.gib":
                case "golem.inf.storage.gib":
                    valueToCheck = parseFloat(properties[filterKey])
                    const tolerance = 0.5
                    return valueToCheck ? Math.abs(valueToCheck - parseFloat(filterValue)) <= tolerance : false
                case "network":
                    const isMainnet = properties["golem.com.payment.platform.erc20-mainnet-glm.address"] !== undefined
                    return (filterValue === "Mainnet" && isMainnet) || (filterValue === "Testnet" && !isMainnet)
                case "walletAddress":
                    return provider.wallet.toLowerCase().includes(filterValue.toLowerCase())
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
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

    return (
        <div className="flex flex-col ">
            <div>
                <div className="fixed z-[99999] bottom-5 right-5">
                    <div className="flex justify-center">
                        <button className="golembutton group" onClick={() => setIsFilterDialogOpen(true)}>
                            <div className="button-content px-2 group-hover:gap-x-2">
                                <RiFilterLine className="icon h-5 w-5 -ml-2" />
                                <span className="text">Filter</span>
                            </div>
                        </button>
                    </div>
                </div>
                {/* Existing components */}
                <FilterDialog
                    isOpen={isFilterDialogOpen}
                    onClose={() => setIsFilterDialogOpen(false)}
                    filters={filters}
                    setFilters={setFilters}
                    data={rawData}
                />
            </div>
            <div>
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
                            content="This shows the hourly price for the provider at full utilization. Hover over the price for a detailed explanation. The percentage reflects cost comparison to an AWS instance with similar specs: green means cheaper, red means more expensive. Note: No comparison data for GPU providers is available yet."
                            className="break-words max-w-64 z-50"
                        />
                    </div>
                    <div className="lg:col-span-2 md:col-span-4 col-span-12 inline-flex items-center">
                        <p className="font-inter">Reputation Score</p>
                        <RiQuestionLine data-tooltip-id="reputation-tooltip" className="h-4 w-4 ml-1" />
                        <ReactTooltip
                            id="reputation-tooltip"
                            place="bottom"
                            content="The reputation score measures how well a provider completes tasks when being checked by the reputation system. A score of 100% means the provider did all tasks successfully during this time. A score of 0% shows that the provider didn't complete any tasks successfully. If the score is 'N/A', it usually means the provider hasn't been checked yet, which might be because it's too expensive to do the test."
                            className="break-words max-w-64 z-50"
                        />
                    </div>
                    <div className="lg:col-span-2 md:col-span-4 col-span-12 inline-flex items-center">
                        <p className="font-inter">Uptime</p>
                        <RiQuestionLine data-tooltip-id="uptime-tooltip" className="h-4 w-4 ml-1" />
                        <ReactTooltip
                            id="uptime-tooltip"
                            place="bottom"
                            content="This shows the provider's total uptime percentage since it was first seen on the network, with ten squares representing the complete time frame. Green squares indicate uptime, while gray squares indicate downtime."
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
                                ? "text-gray-400 bg-gray-200 dark:bg-dark-tremor-background-muted dark:text-gray-600 dark:border-dark-tremor-border cursor-not-allowed border border-gray-200"
                                : "text-white bg-golemblue hover:bg-white transition duration-300 hover:text-tremor-brand-golemblue dark:text-white border dark:bg-dark-tremor-background-muted dark:border-dark-tremor-border border-golemblue "
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
                                    ? "text-gray-400 bg-gray-200 dark:bg-dark-tremor-background-muted dark:text-white dark:border-dark-tremor-border cursor-not-allowed border border-gray-200"
                                    : "text-white bg-golemblue hover:bg-white transition duration-300 hover:text-tremor-brand-golemblue dark:text-gray-600 border dark:bg-dark-tremor-background dark:border-dark-tremor-border border-golemblue "
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
                                ? "text-gray-400 bg-gray-200 dark:bg-dark-tremor-background-muted dark:text-gray-600 dark:border-dark-tremor-border cursor-not-allowed border border-gray-200"
                                : "text-white bg-golemblue hover:bg-white transition duration-300 hover:text-tremor-brand-golemblue dark:text-white border dark:bg-dark-tremor-background-muted dark:border-dark-tremor-border border-golemblue "
                        }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}

// @ts-nocheck
import { PriceHashmap } from "@/lib/PriceHashmap"
import useSWR, { SWRResponse } from "swr"
import { fetcher } from "@/fetcher"
import { RoundingFunction } from "@/lib/RoundingFunction"
import { GolemIcon } from "./svg/GolemIcon"
import { useState } from "react"
import { CpuChipIcon, CircleStackIcon, Square3Stack3DIcon } from "@heroicons/react/24/solid"
import { useRouter } from "next/router"
import { useMemo, useEffect, useCallback } from "react"

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
        return [...data].sort((a, b) => Number(b.online) - Number(a.online) || b.earnings_total - a.earnings_total)
    }, [data])

    const paginatedData = useMemo(() => {
        return sortedData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    }, [sortedData, page])

    const lastPage = Math.ceil(sortedData.length / ITEMS_PER_PAGE)

    return { page, data: paginatedData, lastPage, setPage }
}

export const isUpdateNeeded = (updatedAt) => {
    const updatedAtDate = new Date(updatedAt)
    const now = new Date()
    const twoHours = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    return now - updatedAtDate > twoHours
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
    const handleNameSearchChange = (event, filterKey) => {
        const value = event.target.value
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

    const filteredData = useMemo(
        () => (rawData ? rawData.filter((provider) => filterProvider(provider, filters)) : []),
        [rawData, filters, filterProvider]
    )

    const priceHashMapOrDefault = (provider, usage) => {
        const runtime = provider.runtimes.vm || provider.runtimes.wasmtime
        return PriceHashmap(runtime.properties, usage)
    }

    const { page, data: paginatedData, lastPage, setPage } = useProviderPagination(filteredData)
    const router = useRouter()
    const handleNext = () => setPage(page < lastPage ? page + 1 : lastPage)
    const handlePrevious = () => setPage(page > 1 ? page - 1 : 1)
    const visiblePages = displayPages(page, lastPage)
    if (error) return <div className="text-black dark:text-white">Error loading data.</div>
    if (!rawData) return <div className="text-black dark:text-white">Loading...</div>

    return (
        <div className="flex flex-col">
            <h2 className="text-xl mb-2 font-medium  dark:text-gray-300">Filters</h2>
            <div className="flex flex-wrap gap-4 mb-2">
                <div>
                    <label htmlFor="providerName" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                        Node Name
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="providerName"
                            id="providerName"
                            onChange={(event) => handleNameSearchChange(event, "golem.node.id.name")}
                            className="shadow-sm p-2 w-full block sm:text-sm dark:bg-gray-700 dark:text-gray-400 rounded-md"
                            placeholder="Search by Name"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="cores" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                        Cores
                    </label>
                    <div className="mt-2">
                        <input
                            type="number"
                            name="cores"
                            id="cores"
                            onChange={(event) => handleNameSearchChange(event, "golem.inf.cpu.threads")}
                            className="shadow-sm p-2 w-full block sm:text-sm dark:bg-gray-700 dark:text-gray-400 rounded-md"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="memory" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                        Memory <span className="text-xs font-light text-gray-600 dark:text-gray-400">(±0.5 GB tolerance)</span>
                    </label>

                    <div className="mt-2">
                        <input
                            type="number"
                            name="memory"
                            id="memory"
                            onChange={(event) => handleNameSearchChange(event, "golem.inf.mem.gib")}
                            className="shadow-sm p-2 w-full block sm:text-sm dark:bg-gray-700 dark:text-gray-400 rounded-md"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="disk" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                        Disk <span className="text-xs font-light text-gray-600 dark:text-gray-400">(±0.5 GB tolerance)</span>
                    </label>

                    <div className="mt-2">
                        <input
                            type="number"
                            name="disk"
                            id="disk"
                            onChange={(event) => handleNameSearchChange(event, "golem.inf.storage.gib")}
                            className="shadow-sm p-2 w-full block sm:text-sm dark:bg-gray-700 dark:text-gray-400 rounded-md"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="network" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                        Network
                    </label>
                    <select
                        id="network"
                        name="network"
                        className="mt-2 block dark:bg-gray-700 dark:text-gray-400 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        onChange={(event) => handleNameSearchChange(event, "network")}
                    >
                        <option>Mainnet</option>
                        <option>Testnet</option>
                    </select>
                </div>
                {enableShowingOfflineNodes && (
                    <div>
                        <label htmlFor="network" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                            Show offline nodes
                        </label>
                        <select
                            id="showOffline"
                            name="showOffline"
                            className="mt-2 block dark:bg-gray-700 dark:text-gray-400 rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(event) => handleFilterChange("showOffline", event.target.value)}
                        >
                            <option value="False">Hide Offline</option>
                            <option value="True">Show Offline</option>
                        </select>
                    </div>
                )}
            </div>

            <table className="divide-y-12 divide-gray-900 border-separate rowspacing w-full inline-block lg:table md:table xl:table col-span-12">
                <thead>
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider rounded-l-lg"
                        >
                            Provider
                        </th>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Cores
                        </th>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Memory
                        </th>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Disk
                        </th>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Total Earnings
                        </th>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">
                            CPU/h
                        </th>
                        <th scope="col" className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider">
                            Env/h
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-5 text-left text-xs font-medium text-white uppercase tracking-wider rounded-r-lg whitespace-nowrap"
                        >
                            Start price
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-gray-50 dark:bg-gray-800 divide-y-12 divide-gray-900">
                    {paginatedData?.map((provider) => (
                        <tr
                            onClick={() => {
                                router.push(`/network/provider/${provider.node_id}`)
                            }}
                            key={provider.node_id}
                            className="hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer my-12 golemtr shadow-sm"
                        >
                            <td className="px-6 py-4 rounded-l-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-12 bg-golemblue rounded-md p-3 relative">
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

                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 golemtext dark:text-gray-300">
                                            {provider.runtimes.vm?.properties["golem.node.id.name"]}
                                        </div>

                                        <div className="text-sm text-gray-500 golemtext">
                                            {provider.runtimes.vm?.properties["golem.node.debug.subnet"]}
                                        </div>
                                        {provider.online ? (
                                            provider.runtimes.vm?.properties["golem.com.payment.platform.erc20-mainnet-glm.address"] ||
                                            provider.runtimes.vm?.properties["golem.com.payment.platform.erc20-polygon-glm.address"] ||
                                            provider.runtimes.vm?.properties["golem.com.payment.platform.erc20next-mainnet-glm.address"] ||
                                            provider.runtimes.vm?.properties["golem.com.payment.platform.erc20next-polygon-glm.address"] ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-golemblue golembadge text-white golemtext">
                                                    Mainnet
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full golembadge bg-yellow-500 text-white golemtext">
                                                    Testnet
                                                </span>
                                            )
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500 golembadge text-white golemtext">
                                                Offline
                                            </span>
                                        )}

                                        <span className="px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full golembadge bg-golemblue text-white golemtext">
                                            v{provider.version}
                                        </span>
                                        {isUpdateNeeded(provider.runtimes.vm?.updated_at) && (
                                            <span className="px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500 golembadge text-white golemtext">
                                                1 Issue
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="bg-golemblue rounded-md p-3">
                                        <CpuChipIcon className="h-4 w-4 text-white" aria-hidden="true" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 golemtext dark:text-gray-300">
                                            {provider.runtimes.vm?.properties["golem.inf.cpu.threads"]}
                                        </div>
                                        <div className="text-sm text-gray-500 golemtext">Cores</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <dt className="flex flex-row items-center">
                                    <div className="bg-golemblue rounded-md p-3">
                                        <Square3Stack3DIcon className="h-4 w-4 text-white" aria-hidden="true" />
                                    </div>
                                    <p className="ml-2 text-sm font-medium text-gray-900 golemtext dark:text-gray-300">
                                        {RoundingFunction(provider.runtimes.vm?.properties["golem.inf.mem.gib"], 2)} GB
                                    </p>
                                </dt>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <dt className="flex flex-row items-center">
                                    <div className="bg-golemblue rounded-md p-3">
                                        <CircleStackIcon className="h-4 w-4 text-white" aria-hidden="true" />
                                    </div>
                                    <p className="ml-2 text-sm font-medium text-gray-900 golemtext dark:text-gray-300">
                                        {RoundingFunction(provider.runtimes.vm?.properties["golem.inf.storage.gib"], 2)} GB
                                    </p>
                                </dt>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a className="font-semibold text-gray-900 text-sm golemtext dark:text-gray-300">
                                    {RoundingFunction(provider.earnings_total, 2)}{" "}
                                    <span className="text-golemblue golemgradient dark:text-gray-400">GLM</span>
                                </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a className="font-semibold text-gray-900 text-sm golemtext dark:text-gray-300">
                                    {priceHashMapOrDefault(provider, "golem.usage.cpu_sec")}{" "}
                                    <span className="text-golemblue golemgradient dark:text-gray-400">GLM</span>
                                </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a className="font-semibold text-gray-900 text-sm golemtext dark:text-gray-300">
                                    {priceHashMapOrDefault(provider, "golem.usage.duration_sec")}{" "}
                                    <span className="text-golemblue golemgradient dark:text-gray-400">GLM</span>
                                </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium rounded-r-lg">
                                <a className="font-semibold text-gray-900 text-sm golemtext dark:text-gray-300">
                                    {
                                        (
                                            provider.runtimes.vm?.properties["golem.com.pricing.model.linear.coeffs"] ||
                                            provider.runtimes.wasmtime.properties["golem.com.pricing.model.linear.coeffs"]
                                        ).slice(-1)[0]
                                    }{" "}
                                    <span className="text-golemblue golemgradient dark:text-gray-400">GLM</span>
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-4 gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={page === 1}
                    className={`px-5 py-2 rounded-md ${
                        page === 1 ? "text-gray-400 bg-gray-200 dark:bg-golemblue/20 cursor-not-allowed" : "text-white bg-golemblue"
                    }`}
                >
                    Previous
                </button>
                {visiblePages.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`px-5 py-2 rounded-md ${
                            page === pageNumber ? "text-white bg-golemblue" : "text-white bg-golemblue/60 hover:bg-golemblue"
                        }`}
                    >
                        {pageNumber}
                    </button>
                ))}
                <button
                    onClick={handleNext}
                    disabled={page === lastPage}
                    className={`px-5 py-2 rounded-md ${
                        page === lastPage ? "text-gray-400 bg-gray-200 dark:bg-golemblue/20 cursor-not-allowed" : "text-white bg-golemblue"
                    }`}
                >
                    Next
                </button>
            </div>
        </div>
    )
}

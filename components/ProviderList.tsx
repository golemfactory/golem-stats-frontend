// @ts-nocheck
import { PriceHashmap } from "@/lib/PriceHashmap"
import useSWR, { SWRResponse } from "swr"
import { fetcher } from "@/fetcher"
import { RoundingFunction } from "@/lib/RoundingFunction"
import { GolemIcon } from "./svg/GolemIcon"
import { useState } from "react"
import { CpuChipIcon, CircleStackIcon, Square3Stack3DIcon } from "@heroicons/react/24/solid"
import { useRouter } from "next/router"
import { useMemo, useEffect } from "react"

const ITEMS_PER_PAGE = 30

const FilterRow = ({ allKeys, onApply, data }) => {
    const [key, setKey] = useState("")
    const [operator, setOperator] = useState("")
    const [value, setValue] = useState("")

    const canApply = key && operator && value !== ""

    const handleApply = () => {
        if (canApply) {
            onApply({ key, operator, value })
        }
    }

    const allValuesByKey = useMemo(() => {
        const values = new Map()

        allKeys.forEach((k) => {
            data.forEach((provider) => {
                if (provider[k] !== undefined) {
                    const currentValueInMap = values.get(k) || new Set()
                    currentValueInMap.add(provider[k])
                    values.set(k, currentValueInMap)
                }
            })
        })

        return values
    }, [data, allKeys])

    const allValuesForKey = useMemo(() => {
        const sortedValues = Array.from(allValuesByKey.get(key) || [])
        return sortedValues.sort((a, b) => {
            if (typeof a === "number" && typeof b === "number") {
                return a - b
            } else {
                return String(a).localeCompare(String(b))
            }
        })
    }, [key, allValuesByKey])

    useEffect(() => {
        setOperator("")
        setValue("")
    }, [key])

    const isKeyBoolean = useMemo(() => {
        return allValuesForKey.length === 2 && allValuesForKey.includes(true) && allValuesForKey.includes(false)
    }, [key, allValuesForKey])

    const isKeyNumeric = useMemo(() => {
        return allValuesForKey.every((v) => !isNaN(v))
    }, [key, allValuesForKey])

    return (
        <>
            <h2 className="text-2xl font-semibold dark:text-gray-300">Advanced filtering</h2>
            <div className="grid grid-cols-4 gap-2">
                <select className="form-select" value={key} onChange={(e) => setKey(e.target.value)}>
                    <option value="">Select a key</option>
                    {Array.from(allKeys).map((k) => (
                        <option key={k} value={k}>
                            {k}
                        </option>
                    ))}
                </select>

                <select className="form-select" value={operator} onChange={(e) => setOperator(e.target.value)}>
                    <option value="">Select an operator</option>
                    <option value="eq">Equal (==)</option>
                    {isKeyNumeric && !isKeyBoolean && (
                        <>
                            <option value="lt">Less than (&lt;)</option>
                            <option value="gt">Greater than (&gt;)</option>
                        </>
                    )}
                    {!isKeyBoolean && (
                        <>
                            <option value="regex">Regex</option>
                            <option value="any">Any</option>
                        </>
                    )}
                </select>

                {operator === "lt" || operator === "gt" ? (
                    <input type="number" step="any" className="form-select" value={value} onChange={(e) => setValue(e.target.value)} />
                ) : (
                    <select className="form-select" value={value} onChange={(e) => setValue(e.target.value)}>
                        <option value="">Select a value</option>
                        {allValuesForKey.map((v) => (
                            <option key={`${v}`} value={v}>
                                {v === true ? "true" : v === false ? "false" : v}
                            </option>
                        ))}
                    </select>
                )}

                <button
                    className="disabled:opacity-50 disabled:cursor-not-allowed
               bg-golemblue hover:bg-golemblue/80 text-white font-bold py-2 px-4 rounded 
              
              "
                    onClick={handleApply}
                    disabled={!canApply}
                >
                    Add New Filter
                </button>
            </div>
        </>
    )
}

function useProviderPagination(data) {
    const [page, setPage] = useState(1)
    const sortedData = data.sort((a, b) => b.earnings_total - a.earnings_total)
    const paginatedData = sortedData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    const lastPage = Math.ceil(sortedData.length / ITEMS_PER_PAGE)

    return { page, data: paginatedData, lastPage, setPage }
}
const createFilterFunc = (operator, value) => {
    const stringValue = `${value}`

    if (operator === "regex") {
        value = new RegExp(value, "u")
    } else if (operator !== "any" && !isNaN(value)) {
        value = parseFloat(value)
    } else if (stringValue.toLowerCase() === "true" || stringValue.toLowerCase() === "false") {
        value = stringValue.toLowerCase() === "true"
    }

    const ops = {
        eq: (dataValue) => {
            if (typeof dataValue === "string" || typeof value === "string") {
                return `${dataValue}`.toLowerCase() === stringValue.toLowerCase()
            } else {
                return dataValue == value
            }
        },
        lt: (dataValue) => dataValue !== undefined && dataValue < value,
        gt: (dataValue) => dataValue !== undefined && dataValue > value,
        regex: (dataValue) => dataValue !== undefined && value.test(`${dataValue}`),
        any: () => true,
    }

    return ops[operator]
}

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

const Filters = ({ allKeys, onFilter, data }) => {
    const [filters, setFilters] = useState([])

    const handleApply = (filter) => {
        const { key, operator, value } = filter
        const filterFunc =
            operator === "eq" && typeof value === "boolean" ? (dataValue) => dataValue === value : createFilterFunc(operator, value)

        setFilters((currentFilters) => {
            const updatedFilters = [...currentFilters, { key, operator: operator, value: value, filterFunc }]
            onFilter(updatedFilters.map(({ key, filterFunc }) => ({ key, filterFunc })))
            return updatedFilters
        })
    }

    const handleRemove = (index) => {
        setFilters((currentFilters) => {
            const updatedFilters = currentFilters.filter((_, i) => i !== index)
            onFilter(updatedFilters.map(({ key, filterFunc }) => ({ key, filterFunc })))
            return updatedFilters
        })
    }

    return (
        <div className="grid grid-cols-1 gap-y-2">
            <FilterRow allKeys={allKeys} onApply={handleApply} data={data} />

            <div className="filters mt-4">
                {filters && <h2 className="text-xl font-medium mb-4 dark:text-gray-300">Applied filters </h2>}
                {filters.map((filter, index) => (
                    <div key={index} className="flex items-center gap-x-4 mb-4">
                        <span className="font-semibold dark:text-gray-300">{filter.key}</span>
                        <span className="font-medium text-golemblue dark:text-white">{filter.operator}</span>
                        <span className="font-semibold dark:text-gray-300">{filter.value}</span>
                        <button
                            onClick={() => handleRemove(index)}
                            className="bg-red-600/10 dark:bg-gray-600 dark:hover:text-gray-100 dark:hover:bg-gray-600/80 dark:text-gray-300 hover:bg-red-600 hover:text-white px-3 py-2 rounded-md"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const ProviderList = ({ endpoint, initialData }) => {
    const { data, error } = useSWR(endpoint, fetcher, {
        refreshInterval: 10000,
        initialData: initialData,
    })

    const [filters, setFilters] = useState([])

    const filteredData = useMemo(() => {
        if (!data) return []
        return data.filter((provider) => {
            if (provider.online === false) return false
            const dataKeys = Object.keys(provider)

            return filters.every(({ key, filterFunc }) => {
                if (!dataKeys.includes(key)) return false
                return filterFunc(provider[key])
            })
        })
    }, [data, filters])

    const { page, data: paginatedData, lastPage, setPage } = useProviderPagination(filteredData)
    const router = useRouter()
    const handleNext = () => setPage(page < lastPage ? page + 1 : lastPage)
    const handlePrevious = () => setPage(page > 1 ? page - 1 : 1)
    const visiblePages = displayPages(page, lastPage)

    const allKeys = new Set()
    data?.forEach((provider) => {
        Object.keys(provider).forEach((key) => allKeys.add(key))
    })

    const handleFilter = (newFilters) => {
        setFilters(newFilters)
    }

    return (
        <div className="flex flex-col">
            <Filters allKeys={allKeys} onFilter={handleFilter} data={data} />

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
                                        {provider.computing_now ? (
                                            <div>
                                                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-yellow-500 animate-ping"></div>
                                                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-yellow-500"></div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-green-300 golemping animate-ping"></div>
                                                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-3 h-3 rounded-full bg-green-300 golemping"></div>
                                            </div>
                                        )}
                                        <GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 golemtext dark:text-gray-300">
                                            {provider["golem.node.id.name"]}
                                        </div>
                                        <div className="text-sm text-gray-500 golemtext">{provider["golem.node.debug.subnet"]}</div>
                                        {provider["golem.com.payment.platform.erc20-mainnet-glm.address"] ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-golemblue golembadge text-white golemtext">
                                                Mainnet
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full golembadge bg-yellow-500 text-white golemtext">
                                                Testnet
                                            </span>
                                        )}

                                        <span className="px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full golembadge bg-golemblue text-white golemtext">
                                            v{provider.version}
                                        </span>
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
                                            {provider["golem.inf.cpu.threads"]}
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
                                        {RoundingFunction(provider["golem.inf.mem.gib"], 2)} GB
                                    </p>
                                </dt>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <dt className="flex flex-row items-center">
                                    <div className="bg-golemblue rounded-md p-3">
                                        <CircleStackIcon className="h-4 w-4 text-white" aria-hidden="true" />
                                    </div>
                                    <p className="ml-2 text-sm font-medium text-gray-900 golemtext dark:text-gray-300">
                                        {RoundingFunction(provider["golem.inf.storage.gib"], 2)} GB
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
                                    {PriceHashmap(provider, "golem.usage.cpu_sec")}{" "}
                                    <span className="text-golemblue golemgradient dark:text-gray-400">GLM</span>
                                </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a className="font-semibold text-gray-900 text-sm golemtext dark:text-gray-300">
                                    {PriceHashmap(provider, "golem.usage.duration_sec")}{" "}
                                    <span className="text-golemblue golemgradient dark:text-gray-400">GLM</span>
                                </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium rounded-r-lg">
                                <a className="font-semibold text-gray-900 text-sm golemtext dark:text-gray-300">
                                    {
                                        provider["golem.com.pricing.model.linear.coeffs"][
                                            provider["golem.com.pricing.model.linear.coeffs"].length - 1
                                        ]
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

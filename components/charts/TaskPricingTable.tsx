import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, Select, SelectItem, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, DateRangePicker } from "@tremor/react"
import { RoundingFunction } from "@/lib/RoundingFunction"
import Link from "next/link"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

export default function TaskPricingTable() {
    const [selectedDateRange, setSelectedDateRange] = useState({ from: undefined, to: undefined })
    const [selectedNetwork, setSelectedNetwork] = useState("mainnet")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const itemsPerPage = 10

    const { data, error } = useSWR(
        `v2/network/pricing/dump?network=${selectedNetwork}&from=${selectedDateRange.from?.toISOString()}&to=${selectedDateRange.to?.toISOString()}&page=${page}&per_page=${itemsPerPage}`,
        fetcher,
        { refreshInterval: 10000 }
    )

    useEffect(() => {
        if (data) {
            setTotalPages(data.total_pages)
        }
    }, [data])

    const handlePrev = () => setPage((current) => Math.max(current - 1, 1))
    const handleNext = () => setPage((current) => Math.min(current + 1, totalPages))

    const VISIBLE_PAGES = 5
    const visiblePages = [...Array(VISIBLE_PAGES)]
        .map((_, index) => {
            const pageNumber = Math.min(Math.max(page + index - Math.floor(VISIBLE_PAGES / 2), 1), totalPages)
            return pageNumber
        })
        .filter((pageNumber, index, self) => self.indexOf(pageNumber) === index)

    if (error) {
        return (
            <Card>
                <div
                    className="
                    text-tremor-content
                    dark:text-dark-tremor-content
                "
                >
                    Error loading data
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-start p-6">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Historical Pricing Data</h1>
                    <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                        The table displays a list of providers who the most recently received tasks on the network and their pricing.
                    </p>
                </div>
                <div>
                    <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <SelectItem value="mainnet">Mainnet</SelectItem>
                        <SelectItem value="testnet">Testnet</SelectItem>
                    </Select>
                </div>
            </div>

            <Table className="mt-4">
                <TableHead>
                    <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                        <TableHeaderCell className="text-dark-tremor-content-strong">Provider Name</TableHeaderCell>
                        <TableHeaderCell className="text-dark-tremor-content-strong">Cores</TableHeaderCell>
                        <TableHeaderCell className="text-dark-tremor-content-strong">Memory</TableHeaderCell>
                        <TableHeaderCell className="text-dark-tremor-content-strong">Disk</TableHeaderCell>
                        <TableHeaderCell className="text-right text-dark-tremor-content-strong">CPU/h</TableHeaderCell>
                        <TableHeaderCell className="text-right text-dark-tremor-content-strong">Env/h</TableHeaderCell>
                        <TableHeaderCell className="text-right text-dark-tremor-content-strong">Start price</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data
                        ? data.results.map((item, index) => (
                              <TableRow key={index} className="even:bg-tremor-background-muted even:dark:bg-dark-tremor-background-muted">
                                  <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                      <Link href={`/network/provider/${item.providerId}`}>{item.providerName}</Link>
                                  </TableCell>
                                  <TableCell>{item.cores}</TableCell>
                                  <TableCell>{RoundingFunction(item.memory)} GB</TableCell>
                                  <TableCell>{RoundingFunction(item.disk)} GB</TableCell>
                                  <TableCell className="text-right">{RoundingFunction(item.cpuh, 4)}</TableCell>
                                  <TableCell className="text-right">{RoundingFunction(item.envh, 4)}</TableCell>
                                  <TableCell className="text-right">{RoundingFunction(item.start, 4)}</TableCell>
                              </TableRow>
                          ))
                        : [...Array(itemsPerPage)].map((_, rowIndex) => (
                              <TableRow key={rowIndex}>
                                  {[...Array(7)].map(
                                      (
                                          _,
                                          colIndex // Assuming there are 7 columns as per your headers
                                      ) => (
                                          <TableCell key={colIndex}>
                                              <Skeleton  />
                                          </TableCell>
                                      )
                                  )}
                              </TableRow>
                          ))}
                </TableBody>
            </Table>
            <div className="border-t border-tremor-border dark:border-dark-tremor-border" />
            <div className="flex justify-center mt-2 py-4 gap-2 flex-wrap">
                <button
                    onClick={handlePrev}
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
                        className={`px-5 py-2 ${
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
                    disabled={page === totalPages}
                    className={`px-5 py-2 ${
                        page === totalPages
                            ? "text-gray-400 bg-gray-200 dark:bg-dark-tremor-background-muted dark:text-gray-600 dark:border-dark-tremor-border cursor-not-allowed border border-gray-200"
                            : "text-white bg-golemblue hover:bg-white transition duration-300 hover:text-tremor-brand-golemblue dark:text-white border dark:bg-dark-tremor-background-muted dark:border-dark-tremor-border border-golemblue "
                    }`}
                >
                    Next
                </button>
            </div>
        </Card>
    )
}

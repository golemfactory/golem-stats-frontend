import { Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@tremor/react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { useState, useMemo } from "react"
import { useNetwork } from "./NetworkContext"
import { RoundingFunction } from "@/lib/RoundingFunction"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
function classNames(...classes) {
    return classes.filter(Boolean).join(" ")
}

const Title = ({ nodeId, reputationScore }) => {
    const { network } = useNetwork()
    const { data: blacklistData, error: blacklistError } = useSWR(
        [`v2/providers/check_blacklist?node_id=${nodeId}`, network.apiUrl],
        ([url, apiUrl]) => fetcher(url, apiUrl, { useReputationApi: true })
    )

    const isBlacklistedProvider = blacklistData?.is_blacklisted_provider ? "Yes" : "No"
    const isBlacklistedWallet = blacklistData?.is_blacklisted_wallet ? "Yes" : "No"

    const renderSkeletons = () => (
        <div className="p-6">
            <Skeleton count={1} height={30} />
            <Skeleton count={1} height={20} />
            <div className="flex mt-2">
                <Skeleton count={1} height={30} width={150} />
                <Skeleton count={1} height={30} width={150} className="ml-4" />
            </div>
        </div>
    )

    if (blacklistError || !blacklistData) {
        return renderSkeletons()
    }

    return (
        <div className="p-6">
            <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Reputation Tests</h3>
            <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                This table displays the results of reputation tests for this provider conducted on the network.
            </p>

            <div className="flex mt-2 gap-x-4  flex-wrap">
                <span className="mt-4 inline-flex items-center gap-x-2.5 whitespace-nowrap rounded-tremor-small bg-tremor-background px-3 py-1 text-tremor-default text-tremor-content-emphasis shadow-tremor-input ring-1 flex-wrap ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content-emphasis dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring md:mt-0">
                    Success Rate
                    <span
                        className={`font-semibold ${
                            reputationScore <= 40 ? "text-red-500" : reputationScore <= 75 ? "text-yellow-500" : "text-green-500"
                        }`}
                    >
                        {reputationScore !== null && reputationScore !== undefined ? `${reputationScore.toFixed(2)} %` : "N/A"}
                    </span>
                </span>
                <span className="mt-4 inline-flex items-center gap-x-2.5 whitespace-nowrap rounded-tremor-small bg-tremor-background px-3 py-1 text-tremor-default text-tremor-content-emphasis shadow-tremor-input ring-1 flex-wrap ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content-emphasis dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring md:mt-0">
                    Blacklisted Provider:{" "}
                    <span className={`font-semibold ${isBlacklistedProvider === "Yes" ? "text-red-500" : "text-green-500"}`}>
                        {isBlacklistedProvider}
                    </span>
                </span>
                <span className="mt-4 inline-flex flex-wrap items-center gap-x-2.5 whitespace-nowrap rounded-tremor-small bg-tremor-background px-3 py-1 text-tremor-default text-tremor-content-emphasis shadow-tremor-input ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content-emphasis dark:shadow-dark-tremor-input dark:ring-dark-tremor-ring md:mt-0">
                    Blacklisted Operator:{" "}
                    <span className={`font-semibold ${isBlacklistedWallet === "Yes" ? "text-red-500" : "text-green-500"}`}>
                        {isBlacklistedWallet}
                    </span>
                </span>
            </div>
        </div>
    )
}

const TaskParticipationTable = ({ nodeId }) => {
    const { network } = useNetwork()
    const { data, error } = useSWR(
        [`stats/provider/${nodeId}/details`, network.apiUrl],
        ([url, apiUrl]) => fetcher(url, apiUrl, { useReputationApi: true })
    )

    const [page, setPage] = useState(1)
    const itemsPerPage = 10

    const totalPages = useMemo(() => Math.ceil(data?.task_participation?.length / itemsPerPage), [data])

    const paginatedData = useMemo(
        () =>
            data?.task_participation
                ?.filter(
                    (item) =>
                        item.completion_status !== "Accepted offer, but the task was not started. Reason unknown." &&
                        item.error_message !== "Provider already benchmarked."
                )
                .sort((a, b) => b.task_started_at - a.task_started_at) // Changed sorting to use task_started_at
                .slice((page - 1) * itemsPerPage, page * itemsPerPage),
        [data, page]
    )

    const handlePrev = () => setPage((current) => Math.max(current - 1, 1))
    const handleNext = () => setPage((current) => Math.min(current + 1, totalPages))

    const VISIBLE_PAGES = 5

    const visiblePages = useMemo(() => {
        let range = []
        let startPage = Math.max(1, page - Math.floor(VISIBLE_PAGES / 2))
        const endPage = Math.min(startPage + VISIBLE_PAGES - 1, totalPages)
        startPage = Math.max(1, endPage - VISIBLE_PAGES + 1)
        for (let i = startPage; i <= endPage; i++) {
            range.push(i)
        }
        return range
    }, [page, totalPages])

    if (error) {
        console.log(error)
        return (
            <Card className="p-0 h-full">
                <Title nodeId={nodeId} />
                <div className="border-t border-tremor-border  dark:border-dark-tremor-border" />
                <div className="p-6">
                    <p className="text-tremor-content dark:text-dark-tremor-content">Failed to load data</p>
                </div>
            </Card>
        )
    }
    if (!data) {
        return (
            <Card className="p-0 h-full">
                <Title nodeId={nodeId} />
                <div className="border-t border-tremor-border  dark:border-dark-tremor-border" />
                <div className="p-6">
                    <Skeleton count={itemsPerPage} height={50} />
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-0 h-full">
            <Title reputationScore={data.success_rate} />
            <div className="border-t border-tremor-border  dark:border-dark-tremor-border" />
            <Table className="p-6">
                <TableHead>
                    <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                        <TableHeaderCell className="text-white dark:text-dark-tremor-content-strong">Task ID</TableHeaderCell>
                        <TableHeaderCell className="text-white dark:text-dark-tremor-content-strong">Date</TableHeaderCell>

                        <TableHeaderCell className="text-white dark:text-dark-tremor-content-strong">Status</TableHeaderCell>
                        <TableHeaderCell className="text-right text-white dark:text-dark-tremor-content-strong">Error</TableHeaderCell>
                        <TableHeaderCell className="text-right text-white dark:text-dark-tremor-content-strong">Cost</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(paginatedData || []).length > 0 ? (
                        (paginatedData || []).map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.task_id}</TableCell>
                                <TableCell>{new Date(item.task_started_at * 1000).toLocaleString()}</TableCell>
                                <TableCell>
                                    <span
                                        className={classNames(
                                            "inline-flex items-center rounded-tremor-small px-2 py-0.5 text-tremor-label font-medium ring-1 ring-inset",
                                            item.completion_status.includes(" but the task was not started")
                                                ? "bg-orange-100 text-orange-800 ring-orange-600/10 dark:bg-orange-500/20 dark:text-orange-500 dark:ring-orange-400/20"
                                                : item.completion_status === "Failed" || item.completion_status === "Offer Rejected"
                                                ? "bg-red-100 text-red-800 ring-red-600/10 dark:bg-red-500/20 dark:text-red-500 dark:ring-red-400/20"
                                                : "bg-emerald-100 text-emerald-800 ring-emerald-600/10 dark:bg-emerald-500/20 dark:text-emerald-500 dark:ring-emerald-400/20"
                                        )}
                                    >
                                        {item.completion_status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">{item.error_message || "-"}</TableCell>
                                <TableCell className="text-right">{RoundingFunction(item.cost, 5) || "-"} GLM</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">
                                We don't have any data from the reputation system yet. The reputation system will automatically start
                                running tasks on your provider if it's not blacklisted.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="border-t border-tremor-border  dark:border-dark-tremor-border" />
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
                    disabled={page === totalPages}
                    className={`px-5 py-2  ${
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

export default TaskParticipationTable

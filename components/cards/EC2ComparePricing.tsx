import React, { useState } from "react"
import { Card, Dialog, DialogPanel, TextInput, BarList, Divider } from "@tremor/react"
import { RiArrowRightUpLine, RiSearchLine } from "@remixicon/react"
import AWSIcon from "../svg/AWSIcon"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

function EC2vsGolemPricing({ data }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    if (!data) return <p>Loading...</p>

    /**
     * Formats the value as a percentage with additional context.
     * For positive values, it indicates a cost reduction.
     * For negative values, it indicates a cost increase.
     * Zero values are treated as no change.
     */
    const valueFormatter = (value) => {
        if (value === 0) {
            return "No change"
        } else if (value > 0) {
            return `${value.toFixed(2)}% Cheaper`
        } else {
            // Convert negative value to positive for display
            return `${Math.abs(value).toFixed(2)}% More Expensive`
        }
    }

    const formattedAndFilteredData = data
        .filter((item) => item.golem_percentage_cheaper != null)
        .filter((item) => !searchQuery || item.ec2_instance_name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((item) => ({
            ...item,
            id: item.ec2_instance_name,
            name: item.ec2_instance_name,
            href: "network/provider/" + item.golem_node_id,
            value: item.golem_percentage_cheaper,
            color: item.golem_percentage_cheaper > 0 ? "emerald" : "rose",
            icon: AWSIcon,
        }))
        .sort((a, b) => b.value - a.value)

    const calculateAverage = () => {
        const filteredData = data.filter((item) => item.golem_percentage_cheaper != null)
        const total = filteredData.reduce((acc, item) => acc + item.golem_percentage_cheaper, 0)
        return filteredData.length > 0 ? total / filteredData.length : 0
    }

    const averageGolemCheaper = calculateAverage()
    const comparisonText = averageGolemCheaper > 0 ? "cheaper on Golem" : "more expensive on Golem"

    return (
        <>
            <Card>
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Amazon Price Comparison</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    The comparison highlights the cost savings of using the Golem Network over Amazon's cloud services, with specific
                    savings per instance type presented.
                </p>
                <Divider className="mt-4" />
                <div className="flex justify-between">
                    <div>
                        <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                            Potential savings
                        </p>
                        <div className="flex items-baseline space-x-2">
                            {data && data ? (
                                <span className="text-tremor-metric font-semibold dark:text-dark-tremor-content-metric">
                                    {Math.max(...data.map((item) => item.golem_percentage_cheaper)).toFixed(2)}%
                                </span>
                            ) : (
                                <Skeleton width={250} height={30} />
                            )}
                            <span className="text-tremor-default font-medium text-golemblue">using Golem Network</span>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-tremor-default flex items-center justify-between text-tremor-content dark:text-dark-tremor-content">
                    <span>EC2 Instance Type</span>
                    <span>Price on Golem</span>
                </p>

                <BarList data={formattedAndFilteredData.slice(0, 7)} valueFormatter={valueFormatter} showAnimation={true} />

                <div className="absolute inset-x-0 bottom-0 flex justify-center rounded-b-tremor-default bg-gradient-to-t from-tremor-background to-transparent py-7 dark:from-dark-tremor-background">
                    <button
                        className="flex items-center justify-center gap-x-1.5 rounded-tremor-full border border-tremor-border bg-tremor-background px-2.5 py-1.5 text-tremor-label font-medium text-tremor-content-strong shadow-tremor-input hover:bg-tremor-background-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-content-strong dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted"
                        onClick={() => setModalOpen(true)}
                    >
                        Show more
                        <RiArrowRightUpLine className="-mr-px h-4 w-4 shrink-0" aria-hidden={true} />
                    </button>
                </div>
            </Card>
            <Dialog
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setSearchQuery("")
                }}
                static={true}
                className="z-[100]"
            >
                <DialogPanel className="p-0">
                    <div className="px-6 pb-4 pt-6">
                        <TextInput
                            icon={RiSearchLine}
                            placeholder="Search EC2 instance..."
                            className="rounded-tremor-small"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                EC2 Instance Type
                            </p>
                            <span className="text-tremor-label font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
                                Price on Golem
                            </span>
                        </div>
                    </div>
                    <div className="h-96 overflow-y-scroll px-6">
                        {formattedAndFilteredData.length ? (
                            <BarList data={formattedAndFilteredData} valueFormatter={valueFormatter} />
                        ) : (
                            <p className="flex h-full items-center justify-center text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                We couldn't find any comparison data for the search query.
                            </p>
                        )}
                    </div>
                    <div className="mt-4 border-t border-tremor-border bg-tremor-background-muted p-6 dark:border-dark-tremor-border dark:bg-dark-tremor-background">
                        <button
                            className="flex w-full items-center justify-center rounded-tremor-small border border-tremor-border bg-tremor-background py-2 text-tremor-default font-medium text-tremor-content-strong shadow-tremor-input hover:bg-tremor-background-muted dark:border-dark-tremor-border dark:bg-dark-tremor-background dark:text-dark-tremor-content-strong dark:shadow-dark-tremor-input hover:dark:bg-dark-tremor-background-muted"
                            onClick={() => {
                                setModalOpen(false)
                                setSearchQuery("")
                            }}
                        >
                            Go back
                        </button>
                    </div>
                </DialogPanel>
            </Dialog>
        </>
    )
}

export default EC2vsGolemPricing

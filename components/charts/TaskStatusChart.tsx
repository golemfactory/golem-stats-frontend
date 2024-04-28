import useSWR from "swr"
import { useEffect, useState } from "react"
import { Card, Tracker } from "@tremor/react"
import { RiCheckboxCircleFill, RiMapPin2Fill, RiCloudFill, RiTimeFill, RiFileListLine } from "@remixicon/react"
import { fetcher } from "@/fetcher"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { Tooltip as ReactTooltip } from "react-tooltip"
const TaskStatusChart = ({ nodeId }) => {
    const { data, error } = useSWR(`http://api.localhost/stats/tasks/${nodeId}`, fetcher)
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        if (data && !error) {
            const formattedData = data.tasks.map((task) => ({
                tooltip: `${new Date(task.date).toLocaleString()} - Task ${task.successful ? "completed successfully" : "failed"}`,
                status: task.successful ? "Operational" : "Downtime",
            }))
            setChartData(formattedData.reverse())
        }
    }, [data, error])

    const colorMapping = {
        Operational: "emerald-500",
        Downtime: "red-500",
    }

    const combinedData = chartData.map((item) => ({
        ...item,
        color: colorMapping[item.status],
    }))

    if (!data) return <Skeleton height={200} />

    return (
        <Card>
            <div className="flex justify-between">
                <div className="flex space-x-3">
                    <span
                        className={`w-1 shrink-0 rounded ${
                            data.successRatio < 50 ? "bg-red-500" : data.successRatio < 85 ? "bg-yellow-500" : "bg-emerald-500"
                        }`}
                        aria-hidden={true}
                    />

                    <div>
                        <div className="flex items-center space-x-1.5">
                            <RiCheckboxCircleFill className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden={true} />
                            <span
                                className={`text-tremor-default font-medium ${
                                    data.successRatio < 50
                                        ? "text-red-500"
                                        : data.successRatio < 85
                                        ? "text-yellow-500"
                                        : "text-emerald-500"
                                }`}
                                data-tooltip-id="operational-status-tooltip"
                            >
                                {data.successRatio < 50
                                    ? "High Failure Rate"
                                    : data.successRatio < 85
                                    ? "Variable Success"
                                    : "Highly Reliable"}
                            </span>
                            <ReactTooltip
                                id="operational-status-tooltip"
                                place="bottom"
                                content="Highly Reliable: 85% or higher success rate, indicating a high rate of successful task computation. Variable Success: 50% to 85% success rate, showing some inconsistency in task completion. High Failure Rate: Below 50% success rate, pointing to frequent failures in computing tasks."
                                className="break-words max-w-64 z-50"
                            />
                        </div>
                        <h3 className="mt-2 text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                            Reputation Auditor Results
                        </h3>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span
                                tabIndex="1"
                                className="inline-flex items-center gap-1.5 rounded-tremor-small bg-tremor-background-subtle px-2.5 py-1 text-tremor-label font-medium text-tremor-content dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content"
                            >
                                <RiFileListLine className="-ml-0.5 h-4 w-4 shrink-0" aria-hidden={true} />
                                Tasks
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-start">
                    <span className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        {data.successRatio}% Success Rate
                    </span>
                </div>
            </div>
            <Tracker data={combinedData} className="mt-6" />
        </Card>
    )
}

export default TaskStatusChart

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import useSWR from "swr"
import { RoundingFunction } from "@/lib/RoundingFunction"
import { fetcher } from "@/fetcher"

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

enum DisplayOptions {
    Top10 = 10,
    Top30 = 30,
    Top50 = 50,
}

export const TasksRequestedChart = () => {
    const [displayCount, setDisplayCount] = useState(DisplayOptions.Top10)
    const { data: apiResponse } = useSWR("v1/requestors", fetcher, {
        refreshInterval: 10000,
    })

    const series = [
        {
            data: apiResponse?.slice(0, displayCount).map((obj: { tasks_requested: number }, i: number) => ({
                x: `Requestor ${i + 1}`,
                y: RoundingFunction(obj.tasks_requested, 0),
            })),
            name: "Tasks Requested",
        },
    ]

    const chartOptions = {
        chart: { id: "bar", type: "bar" as "bar", foreColor: "#373d3f", zoom: { autoScaleYaxis: true } },
        tooltip: {
            theme: "light",
            enabled: true,
            x: { show: true, format: "HH:mm:ss", formatter: undefined },
            shared: true,
            intersect: false,
        },
        plotOptions: { bar: { borderRadius: 5, horizontal: true } },
        colors: ["#0c3be8"],
        dataLabels: { enabled: true },
        xaxis: { categories: [] },
        yaxis: {},
    }

    const updateDisplayCount = (option: DisplayOptions) => setDisplayCount(option)

    const buttonOptions = [
        { label: "Top 10", value: DisplayOptions.Top10 },
        { label: "Top 30", value: DisplayOptions.Top30 },
        { label: "Top 50", value: DisplayOptions.Top50 },
    ]

    const ButtonGroup = () => (
        <>
            {buttonOptions.map((option, index) => (
                <button
                    key={option.value}
                    className={`
                    focus:outline-none bg-golemblue text-white px-3 py-2 rounded-md hover:bg-golemblue/80`}
                    onClick={() => updateDisplayCount(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </>
    )

    return (
        <div className="bg-white dark:bg-gray-800 pt-5 mb-2 px-4 sm:px-6 shadow rounded-lg overflow-hidden min-h-screen">
            <div className="relative">
                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300"></div>
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Amount of tasks requested by requestors</h1>

                <div className="mb-4 flex gap-2">
                    <ButtonGroup />
                </div>
            </div>
            <ApexChart width="100%" height={"100%"} options={chartOptions} series={series} type="bar" />
        </div>
    )
}

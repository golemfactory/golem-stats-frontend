// @ts-nocheck

import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import useSWR from "swr"
import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"
import { fetcher } from "@/fetcher"

const DynamicApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
})

type Series = { data: number[][]; name: string }

const NodeActivityChart = ({ nodeId }: { nodeId: string }) => {
    const { data, error } = useSWR(`v1/provider/node/${nodeId}/activity`, fetcher, {
        refreshInterval: 10000,
    })
    const [series, setSeries] = useState<Series[]>([])

    useEffect(() => {
        if (data && !error) {
            try {
                const values = data.data.result[0].values
                const computing = values.map(([time, value]: [number, string]) => [time * 1000, parseInt(value, 10)])
                setSeries([{ data: computing, name: "Status" }])
            } catch (error) {
                console.error(error, data)
            }
        }
    }, [data, error])

    const chartOptions: ApexOptions = {
        chart: {
            id: "area-datetime",
            type: "area",
            zoom: {
                autoScaleYaxis: true,
            },
        },
        tooltip: {
            enabled: true,
            x: {
                show: true,
                format: "HH:mm:ss",
                formatter: undefined,
            },
        },
        dataLabels: {
            enabled: false,
        },
        colors: ["#0000ff"],
        markers: {
            size: 0,
        },

        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 0.1,
                inverseColors: false,
                opacityFrom: 0,
                opacityTo: 0,
                stops: [0, 99],
            },
        },
        yaxis: {
            title: {
                text: "Node Status",
                rotate: -90,
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: undefined,
                    fontSize: "12px",
                    fontWeight: 600,
                    cssClass: "apexcharts-yaxis-title",
                },
            },
            min: 0,
            max: 1,
            tickAmount: 1,
            labels: {
                formatter: (value: number) => (value === 1 ? "Computing" : "Idle"),
            },
        },

        xaxis: {
            type: "datetime",
            title: {
                text: "UTC Time",
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: undefined,
                    fontSize: "12px",
                    fontWeight: 600,
                    cssClass: "apexcharts-yaxis-title",
                },
            },
            labels: {
                datetimeFormatter: {
                    year: "yyyy",
                    month: "MMM 'yy",
                    day: "dd MMM",
                    hour: "HH:mm:ss",
                },
            },
        },
    }

    return (
        <section aria-labelledby="applicant-information-title">
            <h2 id="Hardware" className="text-lg font-medium text-gray-900">
                Activities
            </h2>
            <div className="bg-white dark:bg-gray-800 mt-2 pt-5 px-4 sm:py-6 sm:px-6 shadow rounded-lg">
                <h1 className="text-xl font-medium dark:text-gray-300">Task Activity</h1>
                <DynamicApexChart width="100%" height="250" type="area" options={chartOptions} series={series} />
            </div>
        </section>
    )
}

export default NodeActivityChart

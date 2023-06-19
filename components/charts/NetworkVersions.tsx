import { fetcher } from "@/fetcher"

import React, { useEffect, useState } from "react"
import { ApexOptions } from "apexcharts"
import dynamic from "next/dynamic"
import useSWR from "swr"

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

export const NetworkVersionAdoption: React.FC = () => {
    const [loaded, setLoaded] = useState<boolean>(false)
    const [series, setSeries] = useState<{ data: any[]; name: string }[]>([
        {
            data: [],
            name: "Providers",
        },
    ])

    const { data, error } = useSWR("v1/network/versions", fetcher, {
        refreshInterval: 10000,
    })

    const chartOptions: ApexOptions = {
        chart: {
            type: "bar",
            height: 350,
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
            },
        },
        tooltip: {
            enabled: true,
            shared: true,
            intersect: false,
        },
        yaxis: {
            title: {
                text: "Providers",
                rotate: -90,
                offsetX: 0,
                offsetY: 0,
                style: {
                    fontSize: "12px",
                    fontWeight: 600,
                    cssClass: "apexcharts-yaxis-title",
                },
            },
        },
        xaxis: {
            title: {
                text: "Yagna Version",
                offsetX: 0,
                offsetY: 0,
                style: {
                    fontSize: "12px",
                    fontWeight: 600,
                    cssClass: "apexcharts-yaxis-title",
                },
            },
        },
        colors: ["#0000ff"],
        dataLabels: {
            enabled: false,
        },
    }

    useEffect(() => {
        if (data) {
            const newSeries = [
                {
                    ...series[0],
                    data: data.map((obj: any) => ({ x: obj.version, y: obj.count })),
                },
            ]
            setSeries(newSeries)
            setLoaded(true)
        }
    }, [data])

    return (
        <div className="bg-white dark:bg-gray-800 pt-5 px-4 sm:px-6 shadow rounded-lg overflow-hidden">
            <div className="relative">
                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300"></div>
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Network Version Adoption</h1>

                {loaded && <ApexChart width="100%" height={350} type="bar" options={chartOptions} series={series} />}
            </div>
        </div>
    )
}

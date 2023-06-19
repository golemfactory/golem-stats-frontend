import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import useSWR from "swr"
import { ApexOptions } from "apexcharts"
import { fetcher } from "@/fetcher"
import { RoundingFunction } from "@/lib/RoundingFunction"

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false })

interface HistoricalPriceProps {
    endpoint: string
    allDataPoints: boolean
    title: string
    palette: string[]
    paragraph?: string
}

export const HistoricalPriceChart: React.FC<HistoricalPriceProps> = ({ endpoint, allDataPoints, title, palette, paragraph }) => {
    const [series, setSeries] = useState<any[]>([])
    const [options, setOptions] = useState<ApexOptions>({
        chart: {
            id: "area-datetime",
            type: "area",
            zoom: {
                autoScaleYaxis: true,
            },
            animations: {
                enabled: false,
                easing: "linear",
                dynamicAnimation: {
                    speed: 1000,
                },
            },
        },
        tooltip: {
            enabled: true,
            x: {
                show: true,
                formatter: undefined,
            },
        },
        dataLabels: {
            enabled: false,
        },
        colors: palette,
        markers: {
            size: 0,
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 0.1,
                inverseColors: false,
                opacityFrom: 0.2,
                opacityTo: 0,
                stops: [0, 90, 100],
            },
        },
        yaxis: {
            title: {
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
            labels: {
                formatter: function (value) {
                    return RoundingFunction(value, 6) + " GLM"
                },
            },
        },
        xaxis: {
            type: "datetime",
            title: {
                offsetX: -25,
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
        annotations: {
            xaxis: [],
        },
    })

    const { data: apiResponse } = useSWR(endpoint, fetcher)
    const { data: releaseData, error: releaseDataError } = useSWR("v1/api/yagna/releases", fetcher)

    useEffect(() => {
        if (releaseData) {
            const annotations = releaseData.map((release: any) => {
                return {
                    x: new Date(release.published_at).getTime(),
                    strokeDashArray: 0,
                    borderColor: "#3F51B5",
                    label: {
                        borderColor: "#3F51B5",
                        style: {
                            color: "#fff",
                            background: "#3F51B5",
                        },
                        text: `${release.tag_name} Released`,
                    },
                }
            })

            setOptions((prevState) => ({
                ...prevState,
                annotations: {
                    xaxis: annotations,
                },
            }))
        }
    }, [releaseData])

    useEffect(() => {
        if (apiResponse) {
            const start: any[] = []
            const cpuh: any[] = []
            const perh: any[] = []
            const items = allDataPoints ? apiResponse : apiResponse.slice(-7)

            items.forEach((obj: any) => {
                const dateInMilliseconds = new Date(obj.date).getTime()
                start.push([dateInMilliseconds, RoundingFunction(obj.start, 3)])
                cpuh.push([dateInMilliseconds, RoundingFunction(obj.cpuh, 3)])
                perh.push([dateInMilliseconds, RoundingFunction(obj.perh, 3)])
            })

            setSeries([
                { data: start.filter((d) => d[1] < 10), name: "Start" },
                { data: cpuh.filter((d) => d[1] < 10), name: "CPU/h" },
                { data: perh.filter((d) => d[1] < 10), name: "Per/h" },
            ])
        }
    }, [apiResponse])

    return (
        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl">
            <h1 className="text-2xl font-medium dark:text-gray-300 mb-2">{title}</h1>

            <div className="mt-4">
                <ApexCharts width="100%" height="350" type="area" options={options} series={series} />
            </div>
        </div>
    )
}

export default HistoricalPriceChart

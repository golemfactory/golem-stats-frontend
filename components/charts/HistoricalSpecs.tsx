// @ts-nocheck
import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { fetcher } from "@/fetcher"
import { RoundingFunction } from "@/lib/RoundingFunction"
import { ApexOptions } from "apexcharts"
import useSWR from "swr"

const DynamicApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
})

type Props = {
    endpoint: string
    title: string
    colors: string[]
    yaxisLabel: string
}

const processData = (apiResponse: any[], yaxisLabel: string) => {
    const result: any[] = []

    apiResponse.forEach((obj) => {
        let value

        if (yaxisLabel === "Providers") {
            value = obj.online
        } else if (yaxisLabel.toLowerCase() === "cores" || yaxisLabel.toLowerCase() === "online") {
            value = obj[yaxisLabel.toLowerCase()]
        } else {
            value = obj[yaxisLabel.toLowerCase()] / 1024
        }

        result.push([obj.date, RoundingFunction(value, 0)])
    })
    console.log(result)

    return [
        {
            data: result,
            name: `${yaxisLabel}`,
        },
    ]
}

export const HistoricalSpecs: React.FC<Props> = ({ endpoint, title, colors, yaxisLabel }) => {
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
        colors: colors,
        markers: {
            size: 0,
        },
        annotations: {
            xaxis: [],
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
                    return value + " "
                },
            },
        },
        colors: ["#0000ff"],
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
    })

    const [series, setSeries] = useState<any[]>([])
    const { data: apiResponse } = useSWR<any[]>(endpoint, fetcher, {
        refreshInterval: 10000,
    })
    const { data: releaseData, error: releaseDataError } = useSWR("v1/api/yagna/releases", fetcher, {
        refreshInterval: 10000,
    })

    useEffect(() => {
        apiResponse && setSeries(processData(apiResponse, yaxisLabel))
    }, [apiResponse, yaxisLabel])

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

    return (
        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-xl">
            <h1 className="text-2xl font-medium dark:text-gray-300 mb-2">{title}</h1>

            <div className="mt-4">
                <DynamicApexChart width="100%" height="350" series={series} options={options} type="area" />
            </div>
        </div>
    )
}

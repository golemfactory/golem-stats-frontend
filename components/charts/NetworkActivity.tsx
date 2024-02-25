import { useState, useEffect } from "react"
import { fetcher } from "@/fetcher"
import useSWR from "swr"
import { GlobeAltIcon } from "@heroicons/react/24/solid"
import { AreaChart, Card } from "@tremor/react"

export const NetworkActivity: React.FC = () => {
    const [data, setData] = useState([])
    const [loaded, setLoaded] = useState<boolean>(false)

    const response = useSWR("v1/network/utilization", fetcher, {
        refreshInterval: 10000,
    })

    const extractChartData = (apiData) => {
        if (!apiData || !apiData.data || !apiData.data.result || !apiData.data.result[0]) return []
        return apiData.data.result[0].values.map(([x, y]) => ({
            date:
                new Date(x * 1000).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true, timeZone: "UTC" }) +
                " UTC",
            "Providers computing": Number(y),
        }))
    }

    useEffect(() => {
        if (response.data) {
            setData(extractChartData(response.data))
            setLoaded(true)
        }
    }, [response.data])

    return (
        <Card className="h-full">
            <div className="relative">
                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300 animate-ping"></div>
                <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 rounded-full bg-green-300"></div>
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Network Activity</h1>
                <div className="d-flex align-items-center">
                    <dt>
                        <div className="absolute bg-golemblue  p-3">
                            <GlobeAltIcon className="h-6 w-6 text-white " aria-hidden="true" />
                        </div>
                    </dt>
                    <dd className="ml-16 pb-6 sm:pb-7">
                        <div className="relative">
                            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">
                                {loaded && data.length ? data[data.length - 1]["Providers computing"] : "-"} Providers
                            </p>
                            <p className="text-sm font-medium text-green-500 truncate">Computing right now</p>
                        </div>
                    </dd>
                </div>
            </div>

            {loaded && <AreaChart data={data} index="date" categories={["Providers computing"]} colors={["blue"]} yAxisWidth={30} />}
        </Card>
    )
}

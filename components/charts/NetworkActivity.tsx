import { useState, useEffect } from "react"
import { fetcher } from "@/fetcher"
import useSWR from "swr"
import { GlobeAltIcon } from "@heroicons/react/24/solid"
import { Card, Tab, TabGroup, TabList, TabPanel, TabPanels, AreaChart } from "@tremor/react"

import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
export const NetworkActivity: React.FC = () => {
    const [data, setData] = useState([])
    const [loaded, setLoaded] = useState<boolean>(false)
    const [colorClass, setColorClass] = useState("dark:text-dark-tremor-content-metric")

    const response = useSWR("v1/network/utilization", fetcher, {
        refreshInterval: 1000,
    })

    const extractChartData = (apiData: any) => {
        if (!apiData || !apiData.data || !apiData.data.result || !apiData.data.result[0]) return []
        return apiData.data.result[0].values.map(([x, y]: [number, string]) => ({
            date: new Date(x * 1000).toLocaleTimeString(navigator.language, {
                hour: "2-digit",
                minute: "2-digit",
            }),
            "Providers computing": Number(y),
        }))
    }

    useEffect(() => {
        if (response.data) {
            const newData = extractChartData(response.data)
            if (data.length > 0 && newData.length > 0) {
                const latestValue = newData[newData.length - 1]["Providers computing"]
                const previousValue = data[data.length - 1]["Providers computing"]
                setColorClass("dark:text-dark-tremor-content-metric") // Reset to default first
                if (latestValue > previousValue) {
                    setColorClass("text-green-500")
                } else if (latestValue < previousValue) {
                    setColorClass("text-red-500")
                }
                setTimeout(() => setColorClass("dark:text-dark-tremor-content-metric"), 1000) // Revert after 1 sec
            }
            setData(newData)
            setLoaded(true)
        }
    }, [response.data])

    return (
        <Card className="h-full px-6">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Network Activity</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    Real-time tracking of providers on the Golem Network who are currently engaged in computing tasks for requestors.
                </p>
            </div>
            <TabGroup className="px-6">
                <TabList className="mt-4">
                    <Tab>Providers Computing</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <div className="flex justify-between mt-6">
                            <div>
                                <h3 className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                                    Right now
                                </h3>
                                <div className="flex items-baseline space-x-2">
                                    <span className={`text-tremor-metric font-semibold font-inter ${colorClass}`}>
                                        {loaded ? (data.length > 0 ? data[data.length - 1]["Providers computing"] : 0) : <Skeleton width={40} height={30} />}
                                    </span>
                                    <span className="text-tremor-default font-medium text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue">
                                        Providers
                                    </span>
                                </div>
                            </div>
                        </div>

                        {loaded && (
                            <AreaChart
                                data={data}
                                index="date"
                                autoMinValue={true}
                                categories={["Providers computing"]}
                                colors={["blue"]}
                                yAxisWidth={30}
                                showAnimation={true}
                            />
                        )}
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </Card>
    )
}

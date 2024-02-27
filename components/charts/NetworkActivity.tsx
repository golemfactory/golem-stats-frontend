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
                                    <span className="text-tremor-metric font-semibold dark:text-dark-tremor-content-metric font-inter">
                                        {loaded ? data[data.length - 1]["Providers computing"] : <Skeleton width={40} height={30} />}
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

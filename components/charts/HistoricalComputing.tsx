import { useState, useEffect } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { Card, Tab, TabGroup, TabList, TabPanel, TabPanels, AreaChart } from "@tremor/react"

type Props = {
    endpoint: string
    title: string
    colors: string[]
}

export const HistoricalComputingChart: React.FC<Props> = ({ endpoint, title, colors }) => {
    const [data, setData] = useState([])
    const { data: apiResponse } = useSWR(endpoint, fetcher, {
        refreshInterval: 10000,
    })

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    useEffect(() => {
        if (apiResponse) {
            const formattedData = apiResponse.map(({ total, date }) => ({
                date: formatDate(date),
                "Simultaneous providers computing": total,
            }))
            setData(formattedData)
        }
    }, [apiResponse])

    return (
        <Card className="h-full px-6">
            <div className="px-6 mb-6">
                <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">{title}</h1>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    A historical view of the maximum number of providers computing simultaneously at a given day.
                </p>
            </div>
            <TabGroup className="px-6">
                <TabList className="mt-4">
                    <Tab>Chart View</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <AreaChart data={data} index="date" categories={["Simultaneous providers computing"]} yAxisWidth={30} />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </Card>
    )
}

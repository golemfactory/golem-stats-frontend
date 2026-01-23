import { useEffect, useState } from "react"
import useSWR from "swr"
import { BarChart, Card, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react"
import { fetcher } from "@/fetcher"
import { useNetwork } from "../NetworkContext"

const displayOptions = {
    Top10: 10,
    Top30: 30,
    Top50: 50,
}

export const TasksRequestedChart: React.FC = () => {
    const { network } = useNetwork()
    const { data: apiResponse } = useSWR(["v1/requestors", network.apiUrl], ([url, apiUrl]) => fetcher(url, apiUrl), {
        refreshInterval: 10000,
    })
    const [selectedCount, setSelectedCount] = useState(displayOptions.Top10)
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        if (apiResponse) {
            const newData = apiResponse.slice(0, selectedCount).map((obj: any, index: number) => ({
                requestor: `Requestor ${index + 1}`,
                Tasks: obj.tasks_requested,
            }))
            setChartData(newData)
        }
    }, [apiResponse, selectedCount])

    const displayOptionsArray = [
        { label: "Top 10", value: displayOptions.Top10 },
        { label: "Top 30", value: displayOptions.Top30 },
        { label: "Top 50", value: displayOptions.Top50 },
    ]

    return (
        <Card>
            <TabGroup>
                <TabList>
                    {displayOptionsArray.map((option) => (
                        <Tab key={option.value} onClick={() => setSelectedCount(option.value)}>
                            {option.label}
                        </Tab>
                    ))}
                </TabList>
                <TabPanels>
                    {displayOptionsArray.map((option, index) => (
                        <TabPanel key={index}>
                            {option.value === selectedCount && (
                                <BarChart
                                    data={chartData}
                                    index="requestor"
                                    categories={["Tasks"]}
                                    valueFormatter={(value: number) => value.toString()}
                                    showLegend={true}
                                    showYAxis={true}
                                    yAxisWidth={45}
                                    showTooltip={true}
                                    showAnimation={true}
                                    maxValue={Math.max(...chartData.map((obj) => obj.Tasks), 0) + 10}
                                />
                            )}
                        </TabPanel>
                    ))}
                </TabPanels>
            </TabGroup>
        </Card>
    )
}

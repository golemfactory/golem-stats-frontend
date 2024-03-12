import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import {
    Card,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Tab,
    TabGroup,
    TabList,
} from "@tremor/react"
import { RoundingFunction } from "@/lib/RoundingFunction"
import Link from "next/link"
export default function TaskPricingTable() {
    const { data, error } = useSWR("v2/network/pricing/dump", fetcher, { refreshInterval: 10000 })
    const [selectedTimeFrame, setSelectedTimeFrame] = useState("1d")
    const [selectedNetwork, setSelectedNetwork] = useState("mainnet")

    const timeFrames = ["1d", "7d", "1m", "1y", "All"]

    if (error)
        return (
            <Card>
                <div>Error loading data</div>
            </Card>
        )
    if (!data)
        return (
            <Card>
                <div>Loading...</div>
            </Card>
        )

    const dataForNetwork = data[selectedNetwork][selectedTimeFrame] || []

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-start p-6">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Historical Pricing Data</h1>
                    <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                        The table displays a list of providers for a given timeframe who received a task and their pricing.
                    </p>
                </div>
                <div>
                    <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                        <SelectItem value="mainnet">Mainnet</SelectItem>
                        <SelectItem value="testnet">Testnet</SelectItem>
                    </Select>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start p-6">
                <div>
                    <TabGroup>
                        <TabList variant="solid" className="w-full md:w-fit">
                            {timeFrames.map((frame) => (
                                <Tab
                                    key={frame}
                                    onClick={() => setSelectedTimeFrame(frame)}
                                    className="w-full justify-center py-1 ui-selected:text-tremor-content-strong ui-selected:dark:text-dark-tremor-content-strong md:w-fit md:justify-start"
                                >
                                    {frame}
                                </Tab>
                            ))}
                        </TabList>
                    </TabGroup>
                </div>
            </div>
            <Table className="mt-8">
                <TableHead>
                    <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                        <TableHeaderCell className="text-dark-tremor-content-strong">Provider Name</TableHeaderCell>

                        <TableHeaderCell className="text-dark-tremor-content-strong">Cores</TableHeaderCell>
                        <TableHeaderCell className="text-dark-tremor-content-strong">Memory</TableHeaderCell>
                        <TableHeaderCell className="text-dark-tremor-content-strong">Disk</TableHeaderCell>
                        <TableHeaderCell className="text-right text-dark-tremor-content-strong">CPU/h</TableHeaderCell>
                        <TableHeaderCell className="text-right text-dark-tremor-content-strong">Env/h</TableHeaderCell>
                        <TableHeaderCell className="text-right text-dark-tremor-content-strong">Start price</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {dataForNetwork.map((item, index) => (
                        <TableRow key={index} className="even:bg-tremor-background-muted even:dark:bg-dark-tremor-background-muted">
                            <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                <Link href={`/network/provider/${item.providerId}`}>{item.providerName}</Link>
                            </TableCell>
                            <TableCell>{item.cores}</TableCell>
                            <TableCell>{RoundingFunction(item.memory)} GB</TableCell>
                            <TableCell>{RoundingFunction(item.disk)} GB</TableCell>
                            <TableCell className="text-right">{RoundingFunction(item.cpuh, 4)}</TableCell>
                            <TableCell className="text-right">{RoundingFunction(item.envh, 4)}</TableCell>
                            <TableCell className="text-right">{RoundingFunction(item.start, 4)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    )
}

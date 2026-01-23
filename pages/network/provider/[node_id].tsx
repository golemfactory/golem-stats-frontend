import NodeActivityChart from "@/components/charts/NodeActivityChart"
import { GolemIcon } from "@/components/svg/GolemIcon"
import { fetcher } from "@/fetcher"
import { PriceHashmap } from "@/lib/PriceHashmap"
import { RoundingFunction } from "@/lib/RoundingFunction"
import { CircleStackIcon, CpuChipIcon, Square3Stack3DIcon } from "@heroicons/react/24/solid"
import { useRouter } from "next/router"
import useSWR from "swr"
import { useState } from "react"
import { useNetwork } from "@/components/NetworkContext"
import { SEO } from "@/components/SEO"
import { useSession } from "next-auth/react"
import { HealthCheckModal, OpenHealthCheckModalButton } from "@/components/ProviderHealthCheck"
import { isUpdateNeeded } from "@/components/ProviderList"
import { ProviderUptimeTrackerComponent } from "@/components/charts/ProviderUptimeTracker"
import { Button, Card, Divider } from "@tremor/react"
import { RiSearch2Line, RiTeamLine } from "@remixicon/react"
import Link from "next/link"
import HardwareBadge from "@/components/HardwareBadge"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import TaskStatusChart from "@/components/charts/TaskStatusChart"
import EarningsBlock from "@/components/cards/EarningsBlock"
import CPUPerformanceChart from "@/components/charts/CPUPerformanceChart"
import MemorySeqChart from "@/components/charts/MemorySeqChart"
import MemoryRandMultiChart from "@/components/charts/MemoryRandMultiChart"
import DiskFileIoSeqChart from "@/components/charts/DiskFileIoSeqChart"
import DiskFileIoRandChart from "@/components/charts/DiskFileIoRandChart"
import NetworkPerformanceChart from "@/components/charts/NetworkPerformanceChart"
import TaskParticipationTable from "@/components/TaskParticipationTable"
import GpuPerformanceChart from "@/components/charts/GPUPerformanceChart"
import { hotjar } from "react-hotjar"
import NvidiaIcon from "@/components/svg/NvidiaIcon"
import IntelIcon from "@/components/svg/IntelIcon"
import AMDIcon from "@/components/svg/AMDIcon"

function priceHashMapOrDefault(runtime: any, usage: Usage): any {
    if (!runtime) return "N/A"
    if (usage === "start") {
        const coeffs = runtime.properties["golem.com.pricing.model.linear.coeffs"]
        return coeffs ? coeffs[coeffs.length - 1] : "N/A"
    }
    return PriceHashmap(runtime.properties, usage)
}

function renderRuntimeSection(runtime: any) {
    if (!runtime) return null

    const cpuPrice = priceHashMapOrDefault(runtime, "golem.usage.cpu_sec")
    const envPrice = priceHashMapOrDefault(runtime, "golem.usage.duration_sec")
    const startPrice = priceHashMapOrDefault(runtime, "start")
    const cpuVendor = runtime.properties["golem.inf.cpu.vendor"]
    const CpuIconComponent = cpuVendor === "GenuineIntel" ? IntelIcon : cpuVendor === "AuthenticAMD" ? AMDIcon : CpuChipIcon

    return (
        <Card className="mt-4 h-full">
            <h4 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong mb-2">
                <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">{runtime.runtime}</h3>
            </h4>
            <Divider>Hardware</Divider>
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center mt-2">
                <HardwareBadge
                    title="CPU"
                    value={runtime.properties["golem.inf.cpu.threads"]}
                    icon={<CpuChipIcon className="h-4 w-4 shrink-0" aria-hidden={true} />}
                />
                <HardwareBadge
                    title="Memory"
                    value={RoundingFunction(runtime.properties["golem.inf.mem.gib"], 2)}
                    icon={<Square3Stack3DIcon className="h-4 w-4 shrink-0" aria-hidden={true} />}
                />
                <HardwareBadge
                    title="Disk"
                    value={RoundingFunction(runtime.properties["golem.inf.storage.gib"], 2)}
                    icon={<CircleStackIcon className="h-4 w-4 shrink-0" aria-hidden={true} />}
                />
                {runtime.properties["golem.!exp.gap-35.v1.inf.gpu.model"] && (
                    <HardwareBadge
                        title="GPU"
                        value={runtime.properties["golem.!exp.gap-35.v1.inf.gpu.model"]}
                        icon={<NvidiaIcon className="h-4 w-4 shrink-0" />}
                    />
                )}
            </div>
            <Divider className="mt-4">Pricing</Divider>
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center mt-2">
                <span className="inline-flex items-center gap-x-2.5 rounded-tremor-full bg-tremor-background py-1 pl-2.5 pr-3 text-tremor-label text-tremor-content ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content dark:ring-dark-tremor-ring">
                    CPU/h
                    <span className="h-4 w-px bg-tremor-ring dark:bg-dark-tremor-ring" />
                    <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-emphasis mr-1.5">{cpuPrice}</span>
                    <span className="-ml-1.5 text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue flex h-5 w-5 items-center justify-center rounded-tremor-full hover:bg-tremor-background-subtle hover:text-tremor-content-emphasis dark:text-dark-tremor-content dark:hover:bg-dark-tremor-background-subtle dark:hover:text-dark-tremor-content-emphasis">
                        GLM
                    </span>
                </span>
                <span className="inline-flex items-center gap-x-2.5 rounded-tremor-full bg-tremor-background py-1 pl-2.5 pr-3 text-tremor-label text-tremor-content ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content dark:ring-dark-tremor-ring">
                    Env/h
                    <span className="h-4 w-px bg-tremor-ring dark:bg-dark-tremor-ring" />
                    <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-emphasis mr-1.5">{envPrice}</span>
                    <span className="-ml-1.5 text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue flex h-5 w-5 items-center justify-center rounded-tremor-full hover:bg-tremor-background-subtle hover:text-tremor-content-emphasis dark:text-dark-tremor-content dark:hover:bg-dark-tremor-background-subtle dark:hover:text-dark-tremor-content-emphasis">
                        GLM
                    </span>
                </span>
                <span className="inline-flex items-center gap-x-2.5 rounded-tremor-full bg-tremor-background py-1 pl-2.5 pr-3 text-tremor-label text-tremor-content ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content dark:ring-dark-tremor-ring">
                    Start
                    <span className="h-4 w-px bg-tremor-ring dark:bg-dark-tremor-ring" />
                    <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-emphasis mr-1.5">
                        {startPrice}
                    </span>
                    <span className="-ml-1.5 text-tremor-brand-golemblue dark:text-dark-tremor-brand-golemblue flex h-5 w-5 items-center justify-center rounded-tremor-full hover:bg-tremor-background-subtle hover:text-tremor-content-emphasis dark:text-dark-tremor-content dark:hover:bg-dark-tremor-background-subtle dark:hover:text-dark-tremor-content-emphasis">
                        GLM
                    </span>
                </span>
            </div>
        </Card>
    )
}

export const ProviderDetailed = ({ initialData, initialIncome }: { initialData: object; initialIncome: object }) => {
    const router = useRouter()
    let node_id = router.query.node_id as string

    if (!node_id) {
        return <div>Provider not found</div>
    }

    node_id = node_id.toLowerCase()
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)
    const { network } = useNetwork()

    const { data: nodeData = initialData, error: nodeError } = useSWR(
        typeof window !== "undefined" && node_id ? [`v2/provider/node/${node_id}`, network.apiUrl] : null,
        ([url, apiUrl]) => fetcher(url, apiUrl),
        {
            initialData: initialData,
            refreshInterval: 10000,
        }
    )

    type Provider = {
        runtimes: {
            vm?: any
            wasmtime?: any
            automatic?: any
            "vm-nvidia"?: any
        }
    }

    type Usage = "golem.usage.cpu_sec" | "golem.usage.duration_sec"

    const handleOperatorClick = () => {
        hotjar.event("operator_button_clicked")
    }

    if (!nodeData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Skeleton height={40} width={200} />
            </div>
        )
    }

    return (
        <div className="min-h-full z-10 relative">
            <div className="fixed z-20 bottom-[70px] right-5">
                <div className="flex justify-center">
                    <Link
                        onClick={handleOperatorClick}
                        href={`/network/providers/operator/${nodeData[0].wallet}`}
                        className="golembutton group"
                    >
                        <div className="button-content px-2 group-hover:gap-x-2">
                            <RiTeamLine className="icon h-5 w-5 -ml-2" />
                            <span className="text">Operator</span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="fixed z-20 bottom-5 right-5">
                <OpenHealthCheckModalButton setOpen={setOpen} />

                <HealthCheckModal open={open} setOpen={setOpen} node_id={node_id} online={nodeData[0].online} />
            </div>
            <div className="grid grid-cols-12 gap-4 mb-4">
                <div className="lg:col-span-8 col-span-12 min-h-full">
                    <ProviderUptimeTrackerComponent
                        nodeId={node_id}
                        cpuVendor={
                            nodeData[0].runtimes.vm?.properties["golem.inf.cpu.vendor"] ||
                            nodeData[0].runtimes["vm-nvidia"]?.properties["golem.inf.cpu.vendor"] ||
                            nodeData[0].runtimes.wasmtime?.properties["golem.inf.cpu.vendor"] ||
                            nodeData[0].runtimes.automatic?.properties["golem.inf.cpu.vendor"]
                        }
                        nodeName={
                            nodeData[0].runtimes.vm?.properties["golem.node.id.name"] ||
                            nodeData[0].runtimes["vm-nvidia"]?.properties["golem.node.id.name"] ||
                            nodeData[0].runtimes.wasmtime?.properties["golem.node.id.name"] ||
                            nodeData[0].runtimes.automatic?.properties["golem.node.id.name"]
                        }
                        cpu={
                            (nodeData[0].runtimes.vm?.properties["golem.inf.cpu.brand"] ||
                                nodeData[0].runtimes["vm-nvidia"]?.properties["golem.inf.cpu.brand"] ||
                                nodeData[0].runtimes.wasmtime?.properties["golem.inf.cpu.brand"] ||
                                nodeData[0].runtimes.automatic?.properties["golem.inf.cpu.brand"]) ??
                            "Unknown CPU"
                        }
                        gpu={nodeData[0].runtimes["vm-nvidia"]?.properties?.["golem.!exp.gap-35.v1.inf.gpu.model"] ?? null}
                        version={nodeData[0].version}
                        subnet={
                            nodeData[0].runtimes.vm?.properties["golem.node.debug.subnet"] ||
                            nodeData[0].runtimes["vm-nvidia"]?.properties["golem.node.debug.subnet"] ||
                            nodeData[0].runtimes.wasmtime?.properties["golem.node.debug.subnet"] ||
                            nodeData[0].runtimes.automatic?.properties["golem.node.debug.subnet"]
                        }
                    />
                </div>

                <div className="grid grid-cols-1 col-span-12 lg:col-span-4 gap-4 h-full ">
                    <EarningsBlock walletAddress={nodeData[0].wallet} />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mt-6">
                <div className="lg:col-span-12 col-span-12">
                    <NodeActivityChart nodeId={node_id} />
                </div>
            </div>
            <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong mt-4">Runtime Settings</h3>
            <div className="grid grid-cols-12 gap-4">
                {Object.values(nodeData[0].runtimes).map((runtime: any) => (
                    <div className="lg:col-span-4 md:col-span-6 col-span-12 ">{renderRuntimeSection(runtime)}</div>
                ))}
            </div>
            <div className="grid grid-cols-12 gap-4 ">
                <h3 className="col-span-12 mt-8 font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    Reputation Benchmark Data
                </h3>
                <div className="lg:col-span-6 col-span-12">
                    <CPUPerformanceChart nodeId={node_id} />
                </div>
                <div className="lg:col-span-6 col-span-12">
                    <MemorySeqChart nodeId={node_id} />
                </div>
                <div className="lg:col-span-6 col-span-12">
                    <MemoryRandMultiChart nodeId={node_id} />
                </div>
                <div className="lg:col-span-6 col-span-12">
                    <DiskFileIoSeqChart nodeId={node_id} />
                </div>
                <div className="lg:col-span-6 col-span-12">
                    <DiskFileIoRandChart nodeId={node_id} />
                </div>
                <div className="lg:col-span-6 col-span-12">
                    <NetworkPerformanceChart nodeId={node_id} />
                </div>
                {nodeData[0].runtimes["vm-nvidia"]?.properties?.["golem.!exp.gap-35.v1.inf.gpu.model"] && (
                    <div className="lg:col-span-12 col-span-12">
                        <GpuPerformanceChart nodeId={node_id} />
                    </div>
                )}
                <div className="col-span-12">
                    <TaskParticipationTable nodeId={node_id} />
                </div>
                {/* <div className="lg:col-span-6 col-span-12">
                    <TaskStatusChart nodeId={node_id} />
                </div> */}
            </div>
            <SEO
                title={`${nodeData[0].runtimes.vm?.properties["golem.node.id.name"]} | Golem Network Stats`}
                description={`Detailed Golem Network statistics for provider with name ${nodeData[0].runtimes.vm?.properties["golem.node.id.name"]}`}
                url={`https://stats.golem.network/network/provider/${node_id}`}
            />
        </div>
    )
}

export default ProviderDetailed

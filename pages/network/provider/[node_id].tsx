import NodeActivityChart from "@/components/charts/NodeActivityChart"
import { GolemIcon } from "@/components/svg/GolemIcon"
import { fetcher } from "@/fetcher"
import { PriceHashmap } from "@/lib/PriceHashmap"
import { RoundingFunction } from "@/lib/RoundingFunction"
import { CircleStackIcon, CpuChipIcon, Square3Stack3DIcon } from "@heroicons/react/24/solid"
import { useRouter } from "next/router"
import useSWR from "swr"
import { useState } from "react"
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
import HardwareBadge from "@/components/HardwareBadge"
import { CpuChipIcon, Square3Stack3DIcon, CircleStackIcon } from "@heroicons/react/24/solid"
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

    const { data: nodeData = initialData, error: nodeError } = useSWR(node_id ? `v2/provider/node/${node_id}` : null, fetcher, {
        initialData: initialData,
        refreshInterval: 10000,
    })

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

export async function getStaticProps({ params }: { params: { node_id: string } }) {
    try {
        const initialData = await fetcher(`v2/provider/node/${params.node_id.toLowerCase()}`)

        return { props: { initialData }, revalidate: 2880 }
    } catch (error) {
        console.error(error)
        return {
            props: {
                initialData: [
                    {
                        earnings_total: 0.0,
                        node_id: "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                        online: true,
                        version: "0.14.0",
                        updated_at: "2023-12-21T13:58:43.215982+01:00",
                        created_at: "2023-03-10T14:14:56.079641+01:00",
                        runtimes: {
                            wasmtime: {
                                monthly_price_glm: null,
                                updated_at: "2023-12-21 12:58:39.477879+00:00",
                                properties: {
                                    id: "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    wallet: "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.scheme": "payu",
                                    "golem.inf.mem.gib": 8.0,
                                    "golem.node.id.name": "fractal_02_0.h",
                                    "golem.runtime.name": "wasmtime",
                                    "golem.inf.cpu.cores": 8,
                                    "golem.inf.cpu.threads": 1,
                                    "golem.inf.storage.gib": 20.0,
                                    "golem.runtime.version": "0.2.1",
                                    "golem.com.usage.vector": ["golem.usage.cpu_sec", "golem.usage.duration_sec"],
                                    "golem.com.pricing.model": "linear",
                                    "golem.node.debug.subnet": "public",
                                    "golem.node.net.is-public": false,
                                    "golem.inf.cpu.architecture": "x86_64",
                                    "golem.srv.caps.multi-activity": true,
                                    "golem.srv.caps.payload-manifest": false,
                                    "golem.activity.caps.transfer.protocol": ["gftp", "https", "http"],
                                    "golem.com.pricing.model.linear.coeffs": [0.000222, 0.0002, 0.1],
                                    "golem.com.scheme.payu.payment-timeout-sec?": 120,
                                    "golem.com.payment.debit-notes.accept-timeout?": 240,
                                    "golem.com.scheme.payu.debit-note.interval-sec?": 120,
                                    "golem.com.payment.platform.erc20-goerli-tglm.address": "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.payment.platform.erc20-mumbai-tglm.address": "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.payment.platform.erc20-holesky-tglm.address": "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.payment.platform.erc20next-goerli-tglm.address":
                                        "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.payment.platform.erc20next-mumbai-tglm.address":
                                        "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.payment.platform.erc20next-holesky-tglm.address":
                                        "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                },
                            },
                            vm: {
                                monthly_price_glm: 5292.6184,
                                updated_at: "2023-12-21 12:58:43.147853+00:00",
                                properties: {
                                    id: "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    wallet: "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.scheme": "payu",
                                    "golem.inf.mem.gib": 8.0,
                                    "golem.node.id.name": "unknown-node",
                                    "golem.runtime.name": "vm",
                                    "golem.inf.cpu.brand": "Intel(R) Core(TM) i7-9700 CPU @ 3.00GHz",
                                    "golem.inf.cpu.cores": 8,
                                    "golem.inf.cpu.model": "Stepping 13 Family 6 Model 302",
                                    "golem.inf.cpu.vendor": "GenuineIntel",
                                    "golem.inf.cpu.threads": 1,
                                    "golem.inf.storage.gib": 20.0,
                                    "golem.runtime.version": "0.3.0",
                                    "golem.com.usage.vector": ["golem.usage.cpu_sec", "golem.usage.duration_sec"],
                                    "golem.com.pricing.model": "linear",
                                    "golem.node.debug.subnet": "public",
                                    "golem.node.net.is-public": false,
                                    "golem.inf.cpu.architecture": "x86_64",
                                    "golem.inf.cpu.capabilities": [
                                        "sse3",
                                        "pclmulqdq",
                                        "dtes64",
                                        "monitor",
                                        "dscpl",
                                        "vmx",
                                        "smx",
                                        "eist",
                                        "tm2",
                                        "ssse3",
                                        "fma",
                                        "cmpxchg16b",
                                        "pdcm",
                                        "pcid",
                                        "sse41",
                                        "sse42",
                                        "x2apic",
                                        "movbe",
                                        "popcnt",
                                        "tsc_deadline",
                                        "aesni",
                                        "xsave",
                                        "osxsave",
                                        "avx",
                                        "f16c",
                                        "rdrand",
                                        "fpu",
                                        "vme",
                                        "de",
                                        "pse",
                                        "tsc",
                                        "msr",
                                        "pae",
                                        "mce",
                                        "cx8",
                                        "apic",
                                        "sep",
                                        "mtrr",
                                        "pge",
                                        "mca",
                                        "cmov",
                                        "pat",
                                        "pse36",
                                        "clfsh",
                                        "ds",
                                        "acpi",
                                        "mmx",
                                        "fxsr",
                                        "sse",
                                        "sse2",
                                        "ss",
                                        "htt",
                                        "tm",
                                        "pbe",
                                        "fsgsbase",
                                        "adjust_msr",
                                        "bmi1",
                                        "hle",
                                        "avx2",
                                        "smep",
                                        "bmi2",
                                        "rep_movsb_stosb",
                                        "invpcid",
                                        "rtm",
                                        "deprecate_fpu_cs_ds",
                                        "mpx",
                                        "rdseed",
                                        "adx",
                                        "smap",
                                        "clflushopt",
                                        "processor_trace",
                                        "sgx",
                                        "sgx_lc",
                                    ],
                                    "golem.runtime.capabilities": ["inet", "vpn", "manifest-support", "start-entrypoint"],
                                    "golem.srv.caps.multi-activity": true,
                                    "golem.srv.caps.payload-manifest": true,
                                    "golem.activity.caps.transfer.protocol": ["http", "https", "gftp"],
                                    "golem.com.pricing.model.linear.coeffs": [0.000222, 0.0002, 0.1],
                                    "golem.com.scheme.payu.payment-timeout-sec?": 120,
                                    "golem.com.payment.debit-notes.accept-timeout?": 240,
                                    "golem.com.scheme.payu.debit-note.interval-sec?": 120,
                                    "golem.com.payment.platform.erc20-goerli-tglm.address": "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.payment.platform.erc20-mumbai-tglm.address": "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.payment.platform.erc20-holesky-tglm.address": "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.payment.platform.erc20next-goerli-tglm.address":
                                        "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.payment.platform.erc20next-mumbai-tglm.address":
                                        "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                    "golem.com.payment.platform.erc20next-holesky-tglm.address":
                                        "0x7ad8ce2f95f69be197d136e308303d2395e68379",
                                },
                            },
                        },
                        computing_now: false,
                    },
                ],
                income: {
                    "24": "0",
                    "168": "0",
                    "720": "0",
                    "2160": "0",
                },
            },
            revalidate: 2880,
        }
    }
}

export async function getStaticPaths() {
    const nodes: any = await fetcher("v2/network/online") // endpoint to get all node_ids
    const paths = nodes.map((node: any) => ({
        params: { node_id: node.node_id.toString().toLowerCase() },
    }))
    return { paths, fallback: true }
}

export default ProviderDetailed

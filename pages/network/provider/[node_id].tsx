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
import { RiSearch2Line } from "@remixicon/react"
import PolygonScanIcon from "@/components/svg/Polygonsscan"
import Link from "next/link"
import HardwareBadge from "@/components/HardwareBadge"

const data = [
    {
        name: "Total Earnings",
        stat: "156.384",
        activities: [
            {
                type: "Today",
                share: "25.5%",
                zone: "0.01238",
                href: "#",
            },
            {
                type: "7 Days",
                share: "35.3%",
                zone: "2.384",
                href: "#",
            },
            {
                type: "30 Days",
                share: "14.2%",
                zone: "5.283",
                href: "#",
            },
            {
                type: "90 Days",
                share: "25.0%",
                zone: "100.328",
                href: "#",
            },
        ],
    },
]

const useIncome = (node_id: string | undefined, initialIncome: object) => {
    const { data, error } = useSWR(node_id ? `v1/provider/node/${node_id.toLowerCase()}/earnings` : null, fetcher, {
        initialData: initialIncome,
        refreshInterval: 10000,
    })

    const formattedIncome: { [key: string]: number } = {}

    if (data) {
        const keys = Object.keys(data)

        keys.forEach((key) => {
            formattedIncome[key] = RoundingFunction(parseFloat(data[key]), 10)
        })
    }

    return { income: formattedIncome, error }
}

const EarningsBlock = ({ date, earnings }: { date: string; earnings: string }) => {
    return (
        <li className="relative flex w-full items-center space-x-3 rounded-tremor-small bg-tremor-background-subtle/60 p-1 hover:bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle/60 hover:dark:bg-dark-tremor-background-subtle">
            <div className="flex w-full py-1.5 px-1.5 items-center justify-between space-x-4 truncate text-tremor-default font-medium">
                <span className="truncate text-tremor-content dark:text-dark-tremor-content">
                    <div className="focus:outline-none">
                        {/* Extend link to entire card */}
                        <span className="absolute inset-0" aria-hidden={true} />
                        {date}
                    </div>
                </span>
                <div className="pr-1.5 text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {earnings}
                    <span className="text-golemblue"> GLM</span>
                </div>
            </div>
        </li>
    )
}

export const ProviderDetailed = ({ initialData, initialIncome }: { initialData: object; initialIncome: object }) => {
    const router = useRouter()
    let { node_id } = router.query
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)

    // if node_id is an array, use the first value
    if (Array.isArray(node_id)) {
        node_id = node_id[0].toLowerCase()
    }

    const { data: nodeData = initialData, error: nodeError } = useSWR(
        node_id ? `v2/provider/node/${node_id.toLowerCase()}` : null,
        fetcher,
        {
            initialData: initialData,
            refreshInterval: 10000,
        }
    )

    const { income: updatedIncome, error: incomeError } = useIncome(node_id, initialIncome)

    if (nodeError || incomeError) return <div>Failed to load</div>
    if (!nodeData || !updatedIncome) return <div>Loading...</div>

    type Provider = {
        runtimes: {
            vm?: any
            wasmtime?: any
        }
    }

    type Usage = "golem.usage.cpu_sec" | "golem.usage.duration_sec"

    // Assuming PriceHashmap returns a specific type, replace 'any' with that type
    function priceHashMapOrDefault(provider: Provider, usage: Usage): any {
        const runtime = provider.runtimes.vm || provider.runtimes.wasmtime
        return PriceHashmap(runtime.properties, usage)
    }

    return (
        <div className="min-h-full z-10 relative">
            <div className="fixed z-20 bottom-5 right-5">
                <OpenHealthCheckModalButton setOpen={setOpen} />
            </div>
            <div className="grid grid-cols-12 gap-4 mb-4">
                <div className="lg:col-span-8 col-span-12 min-h-full">
                    <ProviderUptimeTrackerComponent
                        nodeId={node_id}
                        nodeName={nodeData[0].runtimes.vm?.properties["golem.node.id.name"]}
                        cpu={nodeData[0].runtimes.vm?.properties["golem.inf.cpu.brand"]}
                        gpu={nodeData[0].runtimes["vm-nvidia"]?.properties?.["golem.!exp.gap-35.v1.inf.gpu.model"] ?? null}
                    />
                </div>

                <div className="grid grid-cols-1 col-span-12 lg:col-span-4 gap-4 h-full ">
                    <Card>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
                                    Total Earnings
                                </p>
                                <p className="flex items-baseline space-x-2 text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                    <span className="text-tremor-metric font-semibold">{RoundingFunction(nodeData[0].earnings_total)}</span>
                                    <span className="text-tremor-default font-medium text-golemblue">GLM</span>
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-center">
                                    <Link
                                        className="golembutton"
                                        href={`https://polygonscan.com/address/${nodeData[0].wallet}#tokentxns`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <PolygonScanIcon className="h-5 w-5 mr-2 -ml-2" />
                                        Polygonscan
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <p className="items-space mt-6 flex justify-between text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                            <span>Overview</span>
                        </p>
                        <ul role="list" className="mt-2 space-y-2">
                            <EarningsBlock date="Today" earnings={RoundingFunction(updatedIncome["24"])} />
                            <EarningsBlock date="7 Days" earnings={RoundingFunction(updatedIncome["168"])} />
                            <EarningsBlock date="30 Days" earnings={RoundingFunction(updatedIncome["720"])} />
                            <EarningsBlock date="90 Days" earnings={RoundingFunction(updatedIncome["2160"])} />
                        </ul>
                    </Card>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
                <Card className="lg:col-span-4 col-span-12 flex flex-col">
                    <h3 className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">Provider Settings</h3>
                    <div className="flex-1">
                        <Divider>Hardware</Divider>
                        <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center mt-2">
                            <HardwareBadge
                                title="CPU"
                                value={nodeData[0].runtimes.vm?.properties["golem.inf.cpu.threads"]}
                                icon={<CpuChipIcon className="h-4 w-4 shrink-0" aria-hidden={true} />}
                            />

                            <HardwareBadge
                                title="Memory"
                                value={RoundingFunction(nodeData[0].runtimes.vm?.properties["golem.inf.mem.gib"], 2)}
                                icon={<Square3Stack3DIcon className="h-4 w-4 shrink-0" aria-hidden={true} />}
                            />

                            <HardwareBadge
                                title="Disk"
                                value={RoundingFunction(nodeData[0].runtimes.vm?.properties["golem.inf.storage.gib"], 2)}
                                icon={<CircleStackIcon className="h-4 w-4 shrink-0" aria-hidden={true} />}
                            />
                        </div>
                    </div>{" "}
                    <div className="flex-1">
                        <Divider>Pricing</Divider>
                        <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center mt-2">
                            <span className="inline-flex items-center gap-x-2.5 rounded-tremor-full bg-tremor-background py-1 pl-2.5 pr-3 text-tremor-label text-tremor-content ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content dark:ring-dark-tremor-ring">
                                CPU/h
                                <span className="h-4 w-px bg-tremor-ring dark:bg-dark-tremor-ring" />
                                <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-emphasis mr-1.5">
                                    {priceHashMapOrDefault(nodeData[0], "golem.usage.cpu_sec")}
                                </span>
                                <span className="-ml-1.5 text-golemblue flex h-5 w-5 items-center justify-center rounded-tremor-full hover:bg-tremor-background-subtle hover:text-tremor-content-emphasis dark:text-dark-tremor-content dark:hover:bg-dark-tremor-background-subtle dark:hover:text-dark-tremor-content-emphasis">
                                    {" "}
                                    GLM
                                </span>
                            </span>
                            <span className="inline-flex items-center gap-x-2.5 rounded-tremor-full bg-tremor-background py-1 pl-2.5 pr-3 text-tremor-label text-tremor-content ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content dark:ring-dark-tremor-ring">
                                Env/h
                                <span className="h-4 w-px bg-tremor-ring dark:bg-dark-tremor-ring" />
                                <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-emphasis mr-1.5">
                                    {priceHashMapOrDefault(nodeData[0], "golem.usage.duration_sec")}
                                </span>
                                <span className="-ml-1.5 text-golemblue flex h-5 w-5 items-center justify-center rounded-tremor-full hover:bg-tremor-background-subtle hover:text-tremor-content-emphasis dark:text-dark-tremor-content dark:hover:bg-dark-tremor-background-subtle dark:hover:text-dark-tremor-content-emphasis">
                                    {" "}
                                    GLM
                                </span>
                            </span>
                            <span className="inline-flex items-center gap-x-2.5 rounded-tremor-full bg-tremor-background py-1 pl-2.5 pr-3 text-tremor-label text-tremor-content ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content dark:ring-dark-tremor-ring">
                                Start
                                <span className="h-4 w-px bg-tremor-ring dark:bg-dark-tremor-ring" />
                                <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-emphasis mr-1.5">
                                    {
                                        nodeData[0].runtimes.vm?.properties["golem.com.pricing.model.linear.coeffs"][
                                            nodeData[0].runtimes.vm?.properties["golem.com.pricing.model.linear.coeffs"].length - 1
                                        ]
                                    }
                                </span>
                                <span className="-ml-1.5 text-golemblue flex h-5 w-5 items-center justify-center rounded-tremor-full hover:bg-tremor-background-subtle hover:text-tremor-content-emphasis dark:text-dark-tremor-content dark:hover:bg-dark-tremor-background-subtle dark:hover:text-dark-tremor-content-emphasis">
                                    {" "}
                                    GLM
                                </span>
                            </span>
                        </div>
                    </div>
                </Card>
                <div className="lg:col-span-8 col-span-12">
                    <NodeActivityChart nodeId={nodeData[0].node_id.toLowerCase()} />
                </div>
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

        const income = await fetcher(`v1/provider/node/${params.node_id.toLowerCase()}/earnings`)

        return { props: { initialData, income }, revalidate: 2880 }
    } catch (error) {
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
                                    "golem.node.id.name": "fractal_02_0.h",
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
    const nodes: any = await fetcher("v1/network/online") // endpoint to get all node_ids
    const paths = nodes.map((node: any) => ({
        params: { node_id: node.node_id.toString().toLowerCase() },
    }))
    return { paths, fallback: true }
}

export default ProviderDetailed

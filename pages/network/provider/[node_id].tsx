import NodeActivityChart from "@/components/charts/NodeActivityChart"
import { GolemIcon } from "@/components/svg/GolemIcon"
import { fetcher } from "@/fetcher"
import { PriceHashmap } from "@/lib/PriceHashmap"
import { RoundingFunction } from "@/lib/RoundingFunction"
import { CircleStackIcon, CpuChipIcon, Square3Stack3DIcon } from "@heroicons/react/24/solid"
import { useRouter } from "next/router"
import useSWR from "swr"
import { SEO } from "@/components/SEO"

const useIncome = (node_id: string | undefined, initialIncome: object) => {
    const { data, error } = useSWR(node_id ? `v1/provider/node/${node_id}/earnings` : null, fetcher, {
        initialData: initialIncome,
        refreshInterval: 10000,
    })

    const formattedIncome: { [key: string]: number } = {}

    if (data) {
        const keys = Object.keys(data)

        console.log(keys)

        keys.forEach((key) => {
            formattedIncome[key] = RoundingFunction(parseFloat(data[key]), 2)
        })
    }

    return { income: formattedIncome, error }
}

const EarningSection = ({ icon, title, value, unit }: { icon: React.ReactNode; title: string; value: number; unit: string }) => (
    <div className="relative bg-white dark:bg-gray-800 pt-5 px-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
        <dt>
            <div className="absolute bg-golemblue rounded-md p-3">{icon}</div>
            <p className="ml-16 text-sm font-medium text-gray-500 truncate dark:text-gray-400">{title}</p>
        </dt>
        <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">{value}</p>
            <p className="ml-2 flex items-baseline text-sm font-semibold text-golemblue dark:text-gray-400">{unit}</p>
        </dd>
    </div>
)

export const ProviderDetailed = ({ initialData, initialIncome }: { initialData: object; initialIncome: object }) => {
    const router = useRouter()
    let { node_id } = router.query

    // if node_id is an array, use the first value
    if (Array.isArray(node_id)) {
        node_id = node_id[0]
    }

    const { data: nodeData = initialData, error: nodeError } = useSWR(node_id ? `v1/provider/node/${node_id}` : null, fetcher, {
        initialData: initialData,
        refreshInterval: 10000,
    })

    const { income: updatedIncome, error: incomeError } = useIncome(node_id, initialIncome)

    if (nodeError || incomeError) return <div>Failed to load</div>
    if (!nodeData || !updatedIncome) return <div>Loading...</div>

    return (
        <div className="min-h-full z-10 relative">
            <SEO
                title={`${nodeData[0].data["golem.node.id.name"]} | Golem Network Stats`}
                description={`Detailed Golem Network statistics for provider with name ${nodeData[0].data["golem.node.id.name"]}`}
                url={`https://stats.golem.network/network/provider/${node_id}`}
            />
            <main className="pb-10">
                <div className="mt-2 grid grid-cols-1 gap-6  lg:grid-flow-col-dense lg:grid-cols-3">
                    <div className="bg-white dark:bg-gray-800 col-span-12 rounded-lg px-6 overflow-auto py-4 md:flex md:items-center md:justify-between md:space-x-5">
                        <div className="grid grid-cols-1 gap-y-1">
                            <div className="lg:flex lg:flex-row lg:items-center md:gap-y-2 lg:gap-y-4 grid">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-300 pr-2">
                                    {nodeData[0].data["golem.node.id.name"]}
                                </h1>
                                <div className="flex flex-wrap gap-2 mt-2 lg:mt-0 ">
                                    <div>
                                        {nodeData[0].online ? (
                                            <span className="px-2 lg:ml-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500 text-white">
                                                Online
                                            </span>
                                        ) : (
                                            <span className="px-2 lg:ml-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500 text-white">
                                                Offline
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        {nodeData[0].data["golem.com.payment.platform.erc20-mainnet-glm.address"] ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-golemblue text-white">
                                                Mainnet
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500 text-white">
                                                Testnet
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="px-2  inline-flex text-xs leading-5 font-semibold rounded-full bg-golemblue text-white">
                                            v{nodeData[0].version}
                                        </span>
                                    </div>
                                    <div>
                                        {nodeData[0].computing_now ? (
                                            <span className="px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500 text-white">
                                                Computing
                                            </span>
                                        ) : (
                                            <span className="px-2 ml-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-golemblue text-white">
                                                Waiting for task
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm font-medium truncate text-gray-500 mt-2 ">{nodeData[0].node_id}</p>
                            {nodeData[0].data["golem.inf.cpu.brand"] ? (
                                <p className="text-sm font-medium truncate text-gray-500 mt-2 ">
                                    {nodeData[0].data["golem.inf.cpu.brand"]}
                                </p>
                            ) : null}
                        </div>

                        <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
                            <button
                                onClick={() => {
                                    router.push(`/network/providers/operator/${nodeData[0].data["wallet"]}`)
                                }}
                                className="inline-flex items-center justify-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-2xl text-white bg-golemblue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                            >
                                Node by Operator
                            </button>
                            <button
                                aria-label="Show Polygon Wallet"
                                onClick={() => {
                                    if (nodeData[0].data["golem.com.payment.platform.erc20-mainnet-glm.address"]) {
                                        window.open(
                                            `https://mumbai.polygonscan.com/address/${nodeData[0].data["wallet"]}#tokentxns`,
                                            "_blank"
                                        )
                                    } else {
                                        window.open(`https://polygonscan.com/address/${nodeData[0].data["wallet"]}#tokentxns`, "_blank")
                                    }
                                }}
                                type="button"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-2xl text-white bg-golemblue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                            >
                                Polygon
                            </button>

                            <button
                                aria-label="Show Etherscan Wallet"
                                onClick={() => {
                                    if (nodeData[0].data["golem.com.payment.platform.erc20-mainnet-glm.address"]) {
                                        window.open(`https://goerli.etherscan.io/address/${nodeData[0].data["wallet"]}`, "_blank")
                                    } else {
                                        window.open(`https://etherscan.io/address/${nodeData[0].data["wallet"]}`, "_blank")
                                    }
                                }}
                                type="button"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-2xl text-white bg-golemblue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                            >
                                Etherscan
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-flow-col-dense  lg:grid-cols-12">
                    <section aria-labelledby="Node Hardware" className="lg:col-span-6 col-span-12">
                        <h2 id="Node Hardware" className="text-lg font-medium text-gray-900 dark:text-white">
                            Hardware
                        </h2>
                        <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="relative bg-white dark:bg-gray-800 pt-5 px-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
                                <dt>
                                    <div className="absolute bg-golemblue rounded-md p-3">
                                        <CpuChipIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-sm font-medium text-gray-500 truncate dark:text-gray-400">CPU</p>
                                </dt>
                                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">
                                        {RoundingFunction(nodeData[0].data["golem.inf.cpu.threads"], 2)}
                                    </p>
                                    <p className="text-golemblue ml-2 flex items-baseline text-sm font-semibold dark:text-gray-400">
                                        Cores
                                    </p>
                                </dd>
                            </div>
                            <div className="relative bg-white dark:bg-gray-800 pt-5 px-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
                                <dt>
                                    <div className="absolute bg-golemblue rounded-md p-3">
                                        <Square3Stack3DIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-sm font-medium text-gray-500 truncate dark:text-gray-400">RAM</p>
                                </dt>
                                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">
                                        {RoundingFunction(nodeData[0].data["golem.inf.mem.gib"], 2)}
                                    </p>
                                    <p className="text-golemblue ml-2 flex items-baseline text-sm font-semibold dark:text-gray-400">GB</p>
                                </dd>
                            </div>
                            <div className="relative bg-white dark:bg-gray-800 pt-5 px-4 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
                                <dt>
                                    <div className="absolute bg-golemblue rounded-md p-3">
                                        <CircleStackIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-sm font-medium text-gray-500 truncate dark:text-gray-400">Disk</p>
                                </dt>
                                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                                    <p className="text-2xl font-semibold text-gray-900 dark:text-gray-300">
                                        {RoundingFunction(nodeData[0].data["golem.inf.storage.gib"], 2)}
                                    </p>
                                    <p className="text-golemblue ml-2 flex items-baseline text-sm font-semibold dark:text-gray-400">GB</p>
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="Node Pricing" className="lg:col-start-1 lg:col-span-6 col-span-12">
                        <h2 id="Node Pricing" className="text-xl font-medium text-gray-900 dark:text-white">
                            Pricing
                        </h2>

                        <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <EarningSection
                                icon={<GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />}
                                title={"CPU/h"}
                                value={PriceHashmap(nodeData[0].data, "golem.usage.cpu_sec")}
                                unit="GLM"
                            />
                            <EarningSection
                                icon={<GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />}
                                title={"Env/h"}
                                value={PriceHashmap(nodeData[0].data, "golem.usage.duration_sec")}
                                unit="GLM"
                            />
                            <EarningSection
                                icon={<GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />}
                                title={"Start"}
                                value={
                                    nodeData[0].data["golem.com.pricing.model.linear.coeffs"][
                                        nodeData[0].data["golem.com.pricing.model.linear.coeffs"].length - 1
                                    ]
                                }
                                unit="GLM"
                            />
                        </dl>
                    </section>

                    <section aria-labelledby="Node Earnings" className="lg:col-start-1 lg:col-span-12 col-span-12">
                        <h2 id="Node Earnings" className="text-xl font-medium text-gray-900 dark:text-white">
                            Earnings
                        </h2>

                        <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
                            {["24", "168", "720", "2160"].map((key) => (
                                <EarningSection
                                    key={key}
                                    icon={<GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />}
                                    title={(key === "24" && "Earnings (24h) ") || `Earnings (${Number(key) / 24}d)`}
                                    value={updatedIncome[key]}
                                    unit="GLM"
                                />
                            ))}
                        </dl>
                    </section>

                    <div className="lg:col-start-1 lg:col-span-12 col-span-12">
                        <NodeActivityChart nodeId={nodeData[0].node_id} />
                    </div>
                </div>
            </main>
        </div>
    )
}

export async function getStaticProps({ params }: { params: { node_id: string } }) {
    try {
        const initialData = await fetcher(`v1/provider/node/${params.node_id}`)

        const income = await fetcher(`v1/provider/node/${params.node_id}/earnings`)

        return { props: { initialData, income }, revalidate: 2880 }
    } catch (error) {
        return {
            props: {
                initialData: [
                    {
                        earnings_total: 145.09000000000114,
                        node_id: "0xdeadbeef",
                        data: {
                            id: "0xdeadbeef",
                            wallet: "0xdeadbeef",
                            "golem.com.scheme": "payu",
                            "golem.inf.mem.gib": 200.0,
                            "golem.node.id.name": "Golem Provider",
                            "golem.runtime.name": "vm",
                            "golem.inf.cpu.brand": "Intel(R) Xeon(R) CPU E5-2630 v4 @ 2.20GHz",
                            "golem.inf.cpu.cores": 10,
                            "golem.inf.cpu.model": "Stepping 1 Family 6 Model 143",
                            "golem.inf.cpu.vendor": "GenuineIntel",
                            "golem.inf.cpu.threads": 20,
                            "golem.inf.storage.gib": 300.0,
                            "golem.runtime.version": "0.3.0",
                            "golem.com.usage.vector": ["golem.usage.cpu_sec", "golem.usage.duration_sec"],
                            "golem.com.pricing.model": "linear",
                            "golem.node.debug.subnet": "public",
                            "golem.node.net.is-public": true,
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
                                "dca",
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
                                "rdtm",
                                "deprecate_fpu_cs_ds",
                                "rdta",
                                "rdseed",
                                "adx",
                                "smap",
                                "processor_trace",
                            ],
                            "golem.runtime.capabilities": ["inet", "vpn", "manifest-support", "start-entrypoint"],
                            "golem.srv.caps.multi-activity": true,
                            "golem.srv.caps.payload-manifest": true,
                            "golem.activity.caps.transfer.protocol": ["http", "https", "gftp"],
                            "golem.com.pricing.model.linear.coeffs": [5.555552778e-6, 0.0, 0.0],
                            "golem.com.scheme.payu.payment-timeout-sec?": 120,
                            "golem.com.payment.debit-notes.accept-timeout?": 240,
                            "golem.com.scheme.payu.debit-note.interval-sec?": 120,
                            "golem.com.payment.platform.erc20-mainnet-glm.address": "0x1ceedf872c95aad95980ca9357b20cb74bc0464b",
                            "golem.com.payment.platform.erc20-polygon-glm.address": "0x1ceedf872c95aad95980ca9357b20cb74bc0464b",
                            "golem.com.payment.platform.zksync-mainnet-glm.address": "0x1ceedf872c95aad95980ca9357b20cb74bc0464b",
                        },
                        online: true,
                        version: "0.12.0",
                        updated_at: "2023-06-19T15:15:19.357045+02:00",
                        created_at: "2021-10-28T00:17:55.097326+02:00",
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
        params: { node_id: node.node_id.toString() },
    }))

    return { paths, fallback: "blocking" }
}

export default ProviderDetailed

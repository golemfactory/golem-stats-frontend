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
            <SEO
                title={`${nodeData[0].runtimes.vm?.properties["golem.node.id.name"]} | Golem Network Stats`}
                description={`Detailed Golem Network statistics for provider with name ${nodeData[0].runtimes.vm?.properties["golem.node.id.name"]}`}
                url={`https://stats.golem.network/network/provider/${node_id}`}
            />
            <main className="pb-10">
                <div className="mt-2 grid grid-cols-1 gap-6  lg:grid-flow-col-dense lg:grid-cols-3">
                    <div className="bg-white dark:bg-gray-800 col-span-12 rounded-lg px-6 overflow-auto py-4 md:flex md:items-center md:justify-between md:space-x-5">
                        <div className="grid grid-cols-1 gap-y-1">
                            <div className="lg:flex lg:flex-row lg:items-center md:gap-y-2 lg:gap-y-4 grid">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-300 pr-2">
                                    {nodeData[0].runtimes.vm?.properties["golem.node.id.name"]}
                                </h1>

                                <HealthCheckModal open={open} setOpen={setOpen} node_id={node_id} online={nodeData[0].online} />
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
                                        {nodeData[0].runtimes.vm?.properties["golem.com.payment.platform.erc20-mainnet-glm.address"] ? (
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
                                    {nodeData[0].runtimes.vm?.is_overpriced ? (
                                        <div>
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500 text-white">
                                                Overpriced
                                            </span>
                                        </div>
                                    ) : nodeData[0].runtimes.vm?.cheaper_than ? (
                                        <div>
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500 text-white">
                                                Great Price
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <p className="text-sm font-medium truncate text-gray-500 mt-2 ">{nodeData[0].node_id}</p>
                            {nodeData[0].runtimes.vm?.properties["golem.inf.cpu.brand"] ? (
                                <p className="text-sm font-medium truncate text-gray-500 mt-2 ">
                                    {nodeData[0].runtimes.vm?.properties["golem.inf.cpu.brand"]}
                                </p>
                            ) : null}
                            {nodeData[0].runtimes.vm?.is_overpriced ? (
                                <p className="text-sm font-medium truncate text-gray-500 mt-2 ">
                                    Comparing this node against an AWS {nodeData[0].runtimes.vm?.overpriced_compared_to.name} instance with{" "}
                                    {nodeData[0].runtimes.vm?.overpriced_compared_to.vcpu} cores and{" "}
                                    {nodeData[0].runtimes.vm?.overpriced_compared_to.memory} GB memory shows that
                                    <br></br>
                                    this provider is most likely overpriced. We suggest configuring a pricing setting of: CPU/h 0 GLM, Env/h{" "}
                                    {nodeData[0].runtimes.vm?.suggest_env_per_hour_price} GLM, Start 0 GLM. <br></br>which equals the
                                    Monthly USD price (${nodeData[0].runtimes.vm?.overpriced_compared_to.price_usd * 730}) of the{" "}
                                    {nodeData[0].runtimes.vm?.overpriced_compared_to.name} instance
                                    <br></br>
                                    <br></br>This nodes monthly USD cost is ${nodeData[0].runtimes.vm?.monthly_price_usd} which is roughly{" "}
                                    {RoundingFunction(nodeData[0].runtimes.vm?.times_more_expensive)} times more expensive compared to AWS
                                </p>
                            ) : nodeData[0].runtimes.vm?.cheaper_than ? (
                                <p className="text-sm font-medium truncate text-green-500 mt-2">
                                    Comparing this node against an AWS {nodeData[0].runtimes.vm?.cheaper_than.name} instance with{" "}
                                    {nodeData[0].runtimes.vm?.cheaper_than.vcpu} cores and {nodeData[0].runtimes.vm?.cheaper_than.memory} GB
                                    memory shows that
                                    <br></br>
                                    this provider is more cost-effective. The Monthly USD price of the AWS{" "}
                                    {nodeData[0].runtimes.vm?.cheaper_than.name} instance is $(
                                    {nodeData[0].runtimes.vm?.cheaper_than.price_usd * 730}).<br></br>
                                    <br></br>This node's monthly USD cost is ${nodeData[0].runtimes.vm?.monthly_price_usd}, which is roughly{" "}
                                    {RoundingFunction(nodeData[0].runtimes.vm?.times_cheaper)} times cheaper compared to AWS.
                                </p>
                            ) : null}
                        </div>

                        <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
                            <button
                                onClick={() => {
                                    router.push(`/network/providers/operator/${nodeData[0].runtimes.vm?.properties["wallet"]}`)
                                }}
                                className="inline-flex items-center justify-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-2xl text-white bg-golemblue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                            >
                                Node by Operator
                            </button>
                            <button
                                aria-label="Show Polygon Wallet"
                                onClick={() => {
                                    if (nodeData[0].runtimes.vm?.properties["golem.com.payment.platform.erc20-mainnet-glm.address"]) {
                                        window.open(
                                            `https://polygonscan.com/address/${nodeData[0].runtimes.vm?.properties["wallet"]}#tokentxns`,
                                            "_blank"
                                        )
                                    } else {
                                        window.open(
                                            `https://mumbai.polygonscan.com/address/${nodeData[0].runtimes.vm?.properties["wallet"]}#tokentxns`,
                                            "_blank"
                                        )
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
                                    if (nodeData[0].runtimes.vm?.properties["golem.com.payment.platform.erc20-mainnet-glm.address"]) {
                                        window.open(
                                            `https://etherscan.io/address/${nodeData[0].runtimes.vm?.properties["wallet"]}`,
                                            "_blank"
                                        )
                                    } else {
                                        window.open(
                                            `https://goerli.etherscan.io/address/${nodeData[0].runtimes.vm?.properties["wallet"]}`,
                                            "_blank"
                                        )
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
                                        {RoundingFunction(nodeData[0].runtimes.vm?.properties["golem.inf.cpu.threads"], 2)}
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
                                        {RoundingFunction(nodeData[0].runtimes.vm?.properties["golem.inf.mem.gib"], 2)}
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
                                        {RoundingFunction(nodeData[0].runtimes.vm?.properties["golem.inf.storage.gib"], 2)}
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
                                value={priceHashMapOrDefault(nodeData[0], "golem.usage.cpu_sec")}
                                unit="GLM"
                            />
                            <EarningSection
                                icon={<GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />}
                                title={"Env/h"}
                                value={priceHashMapOrDefault(nodeData[0], "golem.usage.duration_sec")}
                                unit="GLM"
                            />
                            <EarningSection
                                icon={<GolemIcon className="h-6 w-6 text-white" aria-hidden="true" />}
                                title={"Start"}
                                value={
                                    nodeData[0].runtimes.vm?.properties["golem.com.pricing.model.linear.coeffs"][
                                        nodeData[0].runtimes.vm?.properties["golem.com.pricing.model.linear.coeffs"].length - 1
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
                        <NodeActivityChart nodeId={nodeData[0].node_id.toLowerCase()} />
                    </div>
                </div>
            </main>
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

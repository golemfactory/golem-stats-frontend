import { useState } from "react"
import { useRouter } from "next/router"
import useSWR from "swr"
import { fetcher } from "@/fetcher"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { SEO } from "@/components/SEO"
import { Card, TextInput } from "@tremor/react"
const NodeLookup = () => {
    const [nodeId, setNodeId] = useState("")
    const router = useRouter()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const findNode = async () => {
        setLoading(true)
        setError("")
        await new Promise((r) => setTimeout(r, 800))
        try {
            const response = await fetcher(`v2/provider/node/${nodeId.toLowerCase()}`)
            if (response.length === 0) {
                setError("Node not found")
                setLoading(false)
                return
            } else {
                router.push(`/network/provider/${nodeId.toLowerCase()}`)
                setLoading(false)
            }
        } catch (error) {
            setError("Node not found")
            setLoading(false)
            return
        }
    }

    return (
        <>
            <SEO
                title="Node Lookup | Golem Network"
                description="Search for a node by yagna ID."
                url="https://stats.golem.network/network/providers/lookup/node"
            />
            <h1 className="text-2xl mb-2 font-medium mt-6 dark:text-gray-300">
                Node Lookup <span className="text-sm font-medium text-gray-400">{router.query.id}</span>
            </h1>
            <Card className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 overflow-hidden">
                <div className="col-span-12">
                    <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Search Node</h1>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        findNode()
                    }}
                    className="col-span-12"
                >
                    <label htmlFor="name" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Yagna ID
                    </label>
                    <div className="flex gap-4">
                        <TextInput name="name" id="name" value={nodeId} onValueChange={(id) => setNodeId(id)} placeholder="0x..." />
                        <button
                            type="submit"
                            disabled={nodeId.length != 42}
                            className={`
                                ${nodeId.length != 42 && "opacity-50 cursor-not-allowed"}
                            golembutton`}
                        >
                            {loading ? <LoadingSpinner className="w-6 text-center flex justify-center" /> : "Search"}
                        </button>
                    </div>
                </form>
                <div className="col-span-12">{error && <div className="text-red-500">{error}</div>}</div>
            </Card>
        </>
    )
}

export default NodeLookup
export async function getStaticProps({}) {
    return { props: {} }
}

import { useState } from "react"
import { useRouter } from "next/router"
import { Select, SelectItem, TextInput, Card, Divider } from "@tremor/react"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { SEO } from "@/components/SEO"
import { fetcher } from "@/fetcher"

const Lookup = () => {
    const [lookupType, setLookupType] = useState("node")
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        const endpoint = lookupType === "node" ? `v2/provider/node/${input.toLowerCase()}` : `v1/provider/wallet/${input.toLowerCase()}`

        try {
            const response = await fetcher(endpoint)
            if (response.length === 0) {
                setError(`${lookupType === "node" ? "Node" : "Operator"} not found`)
            } else {
                router.push(
                    lookupType === "node"
                        ? `/network/provider/${input.toLowerCase()}`
                        : `/network/providers/operator/${input.toLowerCase()}`
                )
            }
        } catch {
            setError(`${lookupType === "node" ? "Node" : "Operator"} not found`)
        }
        setLoading(false)
    }

    return (
        <>
            <SEO
                title="Lookup | Golem Network"
                description="Search for a node or operator."
                url="https://stats.golem.network/network/providers/lookup"
            />

            <Card>
                <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
                    Node and Operator Lookup
                </h3>
                <p className="text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                    Search for a node or operator by yagna ID or wallet address.<br></br> To search for a node, select "Node" and enter the
                    yagna ID which can be acquired via the command <strong>"yagna id show" </strong>.<br></br> To search for an operator,
                    select "Operator" and enter the wallet address.
                </p>
                <Divider />
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 items-center">
                    <div>
                        <label htmlFor="lookupType" className="block text-lg font-medium text-gray-700 dark:text-gray-200">
                            Choose Lookup Type
                        </label>
                        <Select id="lookupType" name="lookupType" value={lookupType} onValueChange={setLookupType}>
                            <SelectItem value="node">Node</SelectItem>
                            <SelectItem value="operator">Operator</SelectItem>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="inputId" className="block text-lg font-medium text-gray-700 dark:text-gray-200">
                            {lookupType === "node" ? "Node ID" : "Wallet Address"}
                        </label>
                        <TextInput
                            name="input"
                            id="inputId"
                            value={input}
                            onValueChange={setInput}
                            placeholder="Enter node ID or wallet address (0x...)"
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={input.length !== 42 || !lookupType} className="golembutton disabled:opacity-50  ">
                            Search
                        </button>
                        {error && <p className="mt-2 text-red-500">{error}</p>}
                    </div>
                </form>
            </Card>
        </>
    )
}

export default Lookup

export async function getStaticProps() {
    return { props: {} }
}

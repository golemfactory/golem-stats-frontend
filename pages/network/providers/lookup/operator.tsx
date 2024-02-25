import { useState } from "react"
import { useRouter } from "next/router"
import { fetcher } from "@/fetcher"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { SEO } from "@/components/SEO"
import { Card, TextInput } from "@tremor/react"
const OperatorLookup = () => {
    const [wallet, setWallet] = useState("")
    const router = useRouter()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const findOperator = async () => {
        setLoading(true)
        setError("")
        await new Promise((r) => setTimeout(r, 800))
        try {
            const response = await fetcher(`v1/provider/wallet/${wallet.toLowerCase()}`)

            if (response.length === 0) {
                setError("Operator not found")
                setLoading(false)
                return
            } else {
                router.push(`/network/providers/operator/${wallet.toLowerCase()}`)
                setLoading(false)
            }
        } catch (error) {
            setError("Operator not found")
            setLoading(false)
            return
        }
    }

    return (
        <>
            <SEO
                title="Operator Lookup | Golem Network"
                description="Search for an operator by wallet address."
                url="https://stats.golem.network/network/providers/lookup/operator"
            />
            <h1 className="text-2xl mb-2 font-medium mt-6 dark:text-gray-300">Node Lookup</h1>
            <Card className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 overflow-hidden">
                <div className="col-span-12">
                    <h1 className="text-2xl mb-2 font-medium dark:text-gray-300">Search Operator</h1>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        findOperator()
                    }}
                    className="col-span-12"
                >
                    <label htmlFor="name" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Wallet Address
                    </label>
                    <div className="flex gap-x-4">
                        <TextInput
                            name="name"
                            id="name"
                            value={wallet}
                            onValueChange={(address) => setWallet(address)}
                            placeholder="0x..."
                        />
                        <button
                            type="submit"
                            disabled={wallet.length != 42}
                            className={`
                                ${wallet.length != 42 && "opacity-50 cursor-not-allowed"}
                                golembutton`}
                        >
                            {loading ? <LoadingSpinner className="h-6 text-center flex justify-center" /> : "Search"}
                        </button>
                    </div>
                </form>
                <div className="col-span-12">{error && <div className="text-red-500">{error}</div>}</div>
            </Card>
        </>
    )
}

export default OperatorLookup

export async function getStaticProps({}) {
    return { props: {} }
}

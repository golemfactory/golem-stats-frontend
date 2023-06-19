import { useState } from "react"
import { useRouter } from "next/router"
import { fetcher } from "@/fetcher"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { SEO } from "@/components/SEO"
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
            const response = await fetcher(`provider/wallet/${wallet}`)

            if (response.length === 0) {
                setError("Operator not found")
                setLoading(false)
                return
            } else {
                router.push(`/network/providers/operator/${wallet}`)
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
            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 bg-white dark:bg-gray-800 px-4 py-6 mb-6 sm:px-6 shadow rounded-lg overflow-hidden">
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
                    <div className="flex">
                        <input
                            name="name"
                            id="name"
                            value={wallet}
                            onChange={(e) => setWallet(e.target.value)}
                            placeholder="0x..."
                            className="shadow-sm p-2 w-full block sm:text-sm dark:bg-gray-700 dark:text-gray-400 rounded-md"
                        />
                        <button
                            type="submit"
                            disabled={wallet.length != 42}
                            className={`
                                ${wallet.length != 42 && "opacity-50 cursor-not-allowed"}
                            ml-2 w-32 bg-golemblue hover:bg-golemblue/80 text-white font-bold py-2 px-4 rounded flex justify-center items-center`}
                        >
                            {loading ? <LoadingSpinner className="h-6 text-center flex justify-center" /> : "Search"}
                        </button>
                    </div>
                </form>
                <div className="col-span-12">{error && <div className="text-red-500">{error}</div>}</div>
            </div>
        </>
    )
}

export default OperatorLookup

export async function getStaticProps({}) {
    return { props: {} }
}

import { ProviderList } from "@/components/ProviderList"
import { SEO } from "@/components/SEO"
import { GetServerSideProps, NextPage } from "next"
import { fetcher } from "@/fetcher"

interface NodeOperatorProps {
    wallet_id: string
    initialData: any
}

export async function getStaticProps({ params }: { params: { wallet_id: string } }) {
    try {
        const initialData = await fetcher(`v2/provider/wallet/${params.wallet_id}`)
        return { props: { wallet_id: params.wallet_id, initialData: initialData }, revalidate: 14400 }
    } catch (e) {
        return { props: { wallet_id: params.wallet_id, initialData: {} }, revalidate: 14400 }
    }
}

export async function getStaticPaths() {
    const nodes: any = await fetcher("v1/network/online") // endpoint to get all wallet_ids
    const paths = nodes.map((node: any) => ({
        params: { wallet_id: node.data["wallet"].toString() },
    }))

    return { paths, fallback: "blocking" }
}

const NodeOperator: NextPage<NodeOperatorProps> = ({ wallet_id, initialData }) => {
    return (
        <>
            <SEO
                title={`Node Operator ${wallet_id} | Golem Network`}
                description={`Golem Network nodes operated by wallet ${wallet_id}`}
                url={`https://stats.golem.network/network/providers/operator/${wallet_id}`}
            />
            <h1 className="text-2xl  font-medium dark:text-gray-300">Nodes operated by wallet</h1>
            <span className="text-gray-500 dark:text-gray-400 mb-6 block">{wallet_id}</span>
            <ProviderList initialData={initialData} endpoint={`v2/provider/wallet/${wallet_id}`} />
        </>
    )
}

export default NodeOperator

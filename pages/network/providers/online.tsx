import { ProviderList } from "@/components/ProviderList"
import { SEO } from "@/components/SEO"
import { fetcher } from "@/fetcher"

export async function getStaticProps({ params }: { params: { wallet_id: string } }) {
    const initialData = await fetcher(`v2/network/online/flatmap`)

    return { props: { initialData: initialData }, revalidate: 14400 }
}

export default function OnlineNodes({ initialData }: { initialData: any }) {
    return (
        <>
            <SEO
                title={`Online Nodes | Golem Network`}
                description={`  Nodes online on the Golem Network right now`}
                url={`https://stats.golem.network/network/providers/online`}
            />
            <ProviderList initialData={initialData} endpoint={"v2/network/online/flatmap"} />
        </>
    )
}

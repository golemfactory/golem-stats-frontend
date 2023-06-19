import { TasksRequestedChart } from "@/components/charts/TasksRequestedChart"
import { SEO } from "@/components/SEO"
export default function Home() {
    return (
        <>
            <TasksRequestedChart />
            <SEO
                title="Requestor Analytics | Golem Network"
                description="Golem Network Requestor Analytics"
                url="https://stats.golem.network/network/requestor"
            />
        </>
    )
}

export async function getStaticProps({}) {
    return { props: {} }
}

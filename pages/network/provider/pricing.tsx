import MedianLive from "@/components/charts/MedianLive"
import HistoricalPriceChart from "@/components/charts/HistoricalPrice"
import { useState } from "react"
import { SEO } from "@/components/SEO"
import PricingStats from "@/components/charts/PricingStats"
export default function Home() {
    const [showAnnotations, setShowAnnotations] = useState(false)

    const hideshowAnnotation = () => {
        setShowAnnotations(!showAnnotations)
        const elem = document.getElementsByClassName("apexcharts-xaxis-annotations")
        if (showAnnotations) {
            Array.from(elem).forEach((element: any) => (element.style.visibility = "hidden"))
        } else {
            Array.from(elem).forEach((element: any) => (element.style.visibility = "visible"))
        }
    }
    return (
        <div className="mt-8 grid grid-cols-1 gap-6 ">
            <SEO
                title="Provider Pricing Analytics | Golem Network"
                description="Golem Network Pricing Analytics"
                url="https://stats.golem.network/network/provider/pricing"
            />

            <PricingStats />
        </div>
    )
}

export async function getStaticProps({}) {
    return { props: {} }
}

import { HistoricalComputingChart } from "@/components/charts/HistoricalComputing"
import HistoricalPriceChart from "@/components/charts/HistoricalPrice"
import { HistoricalSpecs } from "@/components/charts/HistoricalSpecs"
import { NetworkVersionAdoption } from "@/components/charts/NetworkVersions"
import { useState } from "react"
import { SEO } from "@/components/SEO"
export default function Home() {
    const hideshowAnnotation = () => {
        setShowAnnotations(!showAnnotations)
        const elem = document.getElementsByClassName("apexcharts-xaxis-annotations")

        if (showAnnotations) {
            Array.from(elem).forEach((element: any) => (element.style.visibility = "hidden"))
        } else {
            Array.from(elem).forEach((element: any) => (element.style.visibility = "visible"))
        }
    }

    const [showAnnotations, setShowAnnotations] = useState(false)
    return (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <SEO
                title="Historical Network Data | Golem Network"
                description="View historical network data for the Golem Network"
                url="https://stats.golem.network/network/historical"
            />
            <div className="lg:col-span-12 -mb-4 -mt-4 col-span-12 ">
                <div className="col-span-12 ">
                    <HistoricalComputingChart
                        endpoint="v1/network/historical/provider/computing"
                        title="Providers computing simultaneously"
                        colors="#0230FF"
                    />
                </div>
            </div>
        </div>
    )
}

export async function getStaticProps({}) {
    return { props: {} }
}

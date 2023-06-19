import MedianLive from "@/components/charts/MedianLive"
import HistoricalPriceChart from "@/components/charts/HistoricalPrice"
import { useState } from "react"
import { SEO } from "@/components/SEO"
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
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <SEO
                title="Provider Pricing Analytics | Golem Network"
                description="Golem Network Pricing Analytics"
                url="https://stats.golem.network/network/provider/pricing"
            />
            <div className="lg:col-span-12 -mb-4 -mt-4">
                <h1 className="text-2xl font-medium dark:text-gray-300">Pricing Analytics</h1>
                {/* <div className="my-2">
                    {showAnnotations ? (
                        <button
                            aria-label="Enable or Disable Annotations"
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-2xl text-white bg-golemblue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                            onClick={hideshowAnnotation}
                        >
                            Hide Release Labels
                        </button>
                    ) : (
                        <button
                            aria-label="Enable or Disable Annotations"
                            type="button"
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-2xl text-white bg-golemblue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                            onClick={hideshowAnnotation}
                        >
                            Show Release Labels
                        </button>
                    )}
                </div> */}
            </div>
            <div className="lg:col-span-6">
                <HistoricalPriceChart
                    endpoint="v1/network/historical/pricing/median"
                    title="Median Pricing"
                    palette={["#FFED29", "#FF5289", "#00096B"]}
                    allDataPoints={false}
                    paragraph="The past week"
                />
            </div>
            <div className="lg:col-span-6">
                <MedianLive />
            </div>
        </div>
    )
}

export async function getStaticProps({}) {
    return { props: {} }
}

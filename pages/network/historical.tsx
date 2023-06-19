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
                <h1 className="text-2xl font-medium dark:text-gray-300">Historical Statistics</h1>
                <div className="my-2">
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
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 col-span-12 gap-4">
                <HistoricalSpecs
                    endpoint="v1/network/historical/stats"
                    title="Providers Online"
                    colors={["#3F51B5"]}
                    yaxisLabel="Providers"
                />
                <HistoricalSpecs endpoint="v1/network/historical/stats" title="Amount of Cores" colors={["#3F51B5"]} yaxisLabel="Cores" />
                <HistoricalSpecs endpoint="v1/network/historical/stats" title="TB of Memory" colors={["#3F51B5"]} yaxisLabel="Memory" />
                <HistoricalSpecs endpoint="v1/network/historical/stats" title="TB of Disk" colors={["#3F51B5"]} yaxisLabel="Disk" />
            </div>
            <div className="col-span-12 lg:col-span-6 md:col-span-6">
                <HistoricalPriceChart
                    endpoint="v1/network/historical/pricing/median"
                    title="Provider Median Pricing"
                    palette={["#FFED29", "#FF5289", "#00096B"]}
                    allDataPoints={true}
                />
            </div>
            <div className="col-span-12 lg:col-span-6 md:col-span-6">
                <HistoricalPriceChart
                    endpoint="v1/network/historical/pricing/average"
                    title="Provider Average Pricing"
                    palette={["#FFED29", "#FF5289", "#00096B"]}
                    allDataPoints={true}
                />
            </div>
            <div className="col-span-12 ">
                <HistoricalComputingChart
                    endpoint="v1/network/historical/provider/computing"
                    title="Providers computing simultaneously"
                    colors="#0230FF"
                />
            </div>
            <div className="col-span-12">
                <NetworkVersionAdoption />
            </div>
        </div>
    )
}

export async function getStaticProps({}) {
    return { props: {} }
}

import { InvoicesAccepted } from "@/components/charts/InvoicesAccepted"
import { InvoicesPaid } from "@/components/charts/InvoicesPaid"
import { MarketAgreementOutcome } from "@/components/charts/MarketAgreementOutcome"
import { NetworkActivity } from "@/components/charts/NetworkActivity"
import { NetworkCPUArchitecture } from "@/components/charts/NetworkCPUArchitecture"
import { NetworkVersionAdoption } from "@/components/charts/NetworkVersions"
import { NetworkCPUVendorDistribution } from "@/components/charts/VendorChart"
import { SEO } from "@/components/SEO"
export default function Home() {
    return (
        <>
            <SEO
                title="Live Network Data | Golem Network"
                description="Golem Network Live Network Data"
                url="https://stats.golem.network/network/live"
            />
            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="lg:col-span-12 -mb-4 -mt-4">
                    <h1 className="text-2xl font-medium dark:text-gray-300">Live Network Data</h1>
                </div>

                <div className="lg:col-span-6">
                    <NetworkVersionAdoption />
                </div>
                <div className="lg:col-span-6">
                    <MarketAgreementOutcome />
                </div>
                <div className="lg:col-span-6">
                    <NetworkCPUArchitecture />
                </div>
                <div className="lg:col-span-6">
                    <NetworkCPUVendorDistribution />
                </div>
                {/* <div className="lg:col-span-6">
                    <InvoicesPaid />
                </div>
                <div className="lg:col-span-6">
                    <InvoicesAccepted />
                </div> */}
                <div className="lg:col-span-12">
                    <NetworkActivity />
                </div>
            </div>
        </>
    )
}

export async function getStaticProps({}) {
    return { props: {} }
}

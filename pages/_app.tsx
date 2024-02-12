import "@/styles/globals.css"
import { SessionProvider } from "next-auth/react"
import NextNProgress from "nextjs-progressbar"
import { Navbar } from "@/components/Navbar"
import Banner from "@/components/Banner"
import type { AppProps } from "next/app"
import AnalyticsBanner from "@/components/analytics/Banner"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { GoogleAnalytics } from "nextjs-google-analytics"

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    const clientrouter = useRouter()
    const [previousConsent, setPreviousConsent] = useState(false)
    const [askedForConsent, setAskedForConsent] = useState(true)

    useEffect(() => {
        const isAnalyticsEnabled = localStorage.getItem("GolemStatsAnalyticsConsent")

        if (isAnalyticsEnabled === null) {
            setAskedForConsent(false)
        }

        if (isAnalyticsEnabled === "true") {
            setPreviousConsent(true)
            const handleRouteChange = () => posthog.capture("$pageview")
            clientrouter.events.on("routeChangeComplete", handleRouteChange)
            

            return () => {
                clientrouter.events.off("routeChangeComplete", handleRouteChange)
            }
        } else {
            setPreviousConsent(false)
        }
    }, [])
    return (
        <>
            {!askedForConsent ? (
                <>
                    <AnalyticsBanner posthog={posthog} setPreviousConsent={setPreviousConsent} setAskedForConsent={setAskedForConsent} />
                </>
            ) : null}
            <PostHogProvider apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}>
                <GoogleAnalytics trackPageViews gaMeasurementId="GTM-5WPVB2J" />
                <SessionProvider session={session} refetchInterval={5 * 58}>
                    <NextNProgress color="#ffffff" />
                    <Navbar />
                    <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-10 mt-5 ">
                        <Component {...pageProps} />

                        {/* <Banner title="We are currently updating our infrastructure responsible for collecting metrics. This can cause instability on the stats page." /> */}
                    </div>
                </SessionProvider>
            </PostHogProvider>
        </>
    )
}

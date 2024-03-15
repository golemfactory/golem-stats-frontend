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

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        autocapture: false,
        loaded: (posthog) => {
            if (process.env.NODE_ENV === "development") posthog.debug()
        },
    })
}

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

                        <Banner title="Stats page maintenance at 11:00 CET; stats will be unavailable for up to 6 hours. Network remains operational." />
                    </div>
                </SessionProvider>
            </PostHogProvider>
        </>
    )
}

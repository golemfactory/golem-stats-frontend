import "@/styles/globals.css"
import { SessionProvider } from "next-auth/react"
import NextNProgress from "nextjs-progressbar"
import { Navbar } from "@/components/Navbar"
import Banner from "@/components/Banner"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { GoogleAnalytics } from "nextjs-google-analytics"

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
        autocapture: true,
        loaded: (posthog) => {
            if (process.env.NODE_ENV === "development") posthog.debug()
        },
    })
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    const clientrouter = useRouter()

    return (
        <>
            <PostHogProvider apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}>
                <GoogleAnalytics trackPageViews gaMeasurementId="GTM-5WPVB2J" />
                <SessionProvider session={session} refetchInterval={5 * 58}>
                    <NextNProgress color="#ffffff" />
                    <Navbar />
                    <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-10 mt-5 ">
                        <Component {...pageProps} />
                    </div>
                </SessionProvider>
            </PostHogProvider>
        </>
    )
}

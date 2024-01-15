import { Navbar } from "@/components/Navbar"
import "@/styles/globals.css"
import type { AppProps } from "next/app"
import NextNProgress from "nextjs-progressbar"
import Script from "next/script"
import { GoogleAnalytics } from "nextjs-google-analytics"
import Banner from "@/components/Banner"
import { SessionProvider } from "next-auth/react"

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <>
            <SessionProvider session={session}>
                <Navbar />
                <NextNProgress color="#ffffff" />
                <GoogleAnalytics trackPageViews gaMeasurementId="GTM-5WPVB2J" />

                <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-10 mt-5 ">
                    <Component {...pageProps} />

                    {/* <Banner title="We are currently updating our infrastructure responsible for collecting metrics. This can cause instability on the stats page." /> */}
                </div>
            </SessionProvider>
        </>
    )
}

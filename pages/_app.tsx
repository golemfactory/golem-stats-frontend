import { Navbar } from "@/components/Navbar"
import "@/styles/globals.css"
import type { AppProps } from "next/app"
import NextNProgress from "nextjs-progressbar"
import Script from "next/script"
import { GoogleAnalytics } from "nextjs-google-analytics"

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Navbar />
            <NextNProgress color="#ffffff" />
            <GoogleAnalytics trackPageViews gaMeasurementId="GTM-5WPVB2J" />

            <div className="mx-auto px-4 sm:px-6 lg:px-8 pb-10 mt-5 ">
                <Component {...pageProps} />
            </div>
        </>
    )
}

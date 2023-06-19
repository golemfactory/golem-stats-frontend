import Image from "next/image"
import { Inter } from "next/font/google"
import NetworkStats from "@/components/NetworkStats"
import Historical30mStats from "@/components/30mHistoricalStats"
import { NetworkActivity } from "@/components/charts/NetworkActivity"

export default function Index() {
    return (
        <div className="grid gap-y-4">

            <NetworkStats />
            <Historical30mStats />

            <NetworkActivity />
        </div>
    )
}

export async function getStaticProps({}) {
    return { props: {} }
}

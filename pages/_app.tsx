import "@/styles/globals.css"
import { SessionProvider } from "next-auth/react"
import NextNProgress from "nextjs-progressbar"
import { Navbar } from "@/components/Navbar"
import Banner from "@/components/Banner"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"
import { hotjar } from "react-hotjar"
import { useEffect } from "react"
import { Inter, Roboto_Mono } from "next/font/google"

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
})

const robotoMono = Roboto_Mono({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-roboto-mono",
})

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    useEffect(() => {
        hotjar.initialize(5016081, 6)
    }, [])

    return (
        // <div className={`${robotoMono.variable} ${inter.variable}`}>
        <div>
            <SessionProvider session={session} refetchInterval={5 * 58}>
                <NextNProgress color="#ffffff" />
                <Navbar />
                <div
                    className={`mx-auto px-4 sm:px-6 lg:px-8 pb-10  pt-5 `}
                    style={{
                        backgroundImage: `url('https://s3-alpha-sig.figma.com/img/2f86/eea7/2d86b0806d45143329fc351cc6f1b908?Expires=1710720000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=FysGzGf8Dz~3ja~3j6BtaKQN2j~3rG9Bb6eKKxNbW07VcJoHUOM~ifTaPQqqQlNgQmrEmwlt6-sFcy45CITu0pgzLrq4Bg~OMcJY5gjCXeC48cNIB54YP-Y1DbK~ZZEm11qcCi9L40gfDfQ500BMXw~vjCnz4DHrQ-N-yLFdjHctC7ycwxuZHPeMec-VdVuuUn2nf9YVBU96KhB6YBE2L4MT3N4r-BmVhscTINLO8xBJvtKWN7CyiKlANNABvNWoYWJKwWstllVWKfzRMJhUU1NQR4hKUTA3a~FfCnovqxXbaXY8fQpEmJnJszAhpCMluYH02V3YNBezA5~lsTH12w__')`,
                        backgroundSize: "cover", // or 'contain' depending on your need
                        backgroundPosition: "center center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    <Component {...pageProps} />
                </div>
            </SessionProvider>
        </div>
    )
}

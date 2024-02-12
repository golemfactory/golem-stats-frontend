import { useEffect } from "react"
const AnalyticsBanner = ({ setPreviousConsent, setAskedForConsent, posthog }) => {
    useEffect(() => {
        if (localStorage.getItem("GolemStatsAnalyticsConsent") === "true") {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
                capture_pageview: false, // Disable automatic pageview capture, as we capture manually
                autocapture: false,
                loaded: (posthog) => {
                    if (process.env.NODE_ENV === "development") posthog.debug()
                },
            })
        }
    }, [setAskedForConsent, setPreviousConsent])

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-golemblue text-white z-50 border-t border-gray-700">
            <div className="mx-auto max-w-7xl px-6 gap-8 py-3 items-center lg:flex lg:px-8">
                <div>
                    Golem Stats uses cookies to improve the user experience. Cookies are optional but its recommended and helps us improve
                    the experience
                </div>
                <div className="flex gap-4 mt-4 lg:mt-0">
                    <button
                        className="text-white hover:text-white/90"
                        onClick={() => {
                            localStorage.setItem("GolemStatsAnalyticsConsent", "false")
                            setPreviousConsent(false)
                            setAskedForConsent(true)
                            posthog.opt_out_capturing()
                        }}
                    >
                        Decline
                    </button>
                    <button
                        className="rounded-sm border border-white bg-primary px-4 py-1 text-white hover:bg-white/10"
                        onClick={() => {
                            localStorage.setItem("GolemStatsAnalyticsConsent", "true")
                            setPreviousConsent(true)
                            setAskedForConsent(true)

                            posthog.opt_in_capturing()
                        }}
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsBanner

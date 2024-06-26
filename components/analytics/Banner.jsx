const AnalyticsBanner = ({ setPreviousConsent, setAskedForConsent, posthog }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-golemmain text-white z-50 border-t border-gray-700">
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

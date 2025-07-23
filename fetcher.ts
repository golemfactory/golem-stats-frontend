// Unified fetcher function that can handle both APIs
export const fetcher = async (url: string, networkApiUrl?: string, options?: { useReputationApi?: boolean }) => {
    // Determine the base URL based on the options provided
    const baseUrl = options?.useReputationApi
        ? process.env.NEXT_PUBLIC_REPUTATION_API_URL
        : networkApiUrl || process.env.NEXT_PUBLIC_API_URL

    // Construct the full URL
    const fullUrl = url.startsWith("http://") || url.startsWith("https://") ? url : baseUrl + url

    // Fetch the URL and return the JSON response
    const response = await fetch(fullUrl)
    if (!response.ok) {
        console.error(`API call failed: ${response.status} ${response.statusText} for ${fullUrl}`)
        return null
    }
    return response.json()
}

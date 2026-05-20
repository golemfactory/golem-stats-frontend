export const fetcher = async (url: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    const fullUrl = url.startsWith("http://") || url.startsWith("https://") ? url : baseUrl + url

    const response = await fetch(fullUrl)
    return response.json()
}

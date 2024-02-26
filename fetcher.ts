export const fetcher = (url: string) => {
    const fullUrl = url.startsWith("http://") || url.startsWith("https://") ? url : process.env.NEXT_PUBLIC_API_URL + url
    return fetch(fullUrl).then((res) => res.json())
}

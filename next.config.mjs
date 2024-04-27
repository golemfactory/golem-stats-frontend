import withMarkdoc from "@markdoc/next.js"
import withSearch from "./markdoc/search.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    pageExtensions: ["js", "jsx", "md", "ts", "tsx", "mdx"],
    experimental: {
        scrollRestoration: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
}

// if (!process.env.VERCEL) {
//   nextConfig.output = 'export'
//   nextConfig.images = {
//     unoptimized: true,
//   }
// }

export default withSearch(withMarkdoc({ schemaPath: "./markdoc" })(nextConfig))

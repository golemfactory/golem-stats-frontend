import { createLoader } from "simple-functional-loader"
import * as url from "url"


const __filename = url.fileURLToPath(import.meta.url)
import fetch from "node-fetch"
export default function (nextConfig = {}) {
    return Object.assign({}, nextConfig, {
        webpack(config, options) {
            config.module.rules.push({
                test: __filename,
                use: [
                    createLoader(function () {
                        return new Promise((resolve, reject) => {
                            fetch(`${process.env.NEXT_PUBLIC_API_URL}v2/search-list`)
                                .then((response) => response.json())
                                .then(({ wallets, providers }) => {
                                    const data = [
                                        ...wallets.map((wallet) => ({
                                            id: wallet,
                                            type: "wallet",
                                        })),
                                        ...providers.map((provider) => ({
                                            id: provider.id,
                                            name: provider.provider_name,
                                            type: "provider",
                                        })),
                                    ]

                                    resolve(`
                                        import FlexSearch from 'flexsearch'

                                        const index = new FlexSearch.Document({
                                            tokenize: 'full',
                                            document: {
                                                id: 'id',
                                                index: ['name', 'id'],
                                                store: ['name', 'id', 'type'],
                                            },
                                            context: {
                                                resolution: 9,
                                                depth: 2,
                                                bidirectional: true,
                                            },
                                        })

                                        const data = ${JSON.stringify(data)}

                                        data.forEach((item) => {
                                            index.add(item)
                                        })

                                        export function search(query, options = {}) {
                                            let result = sectionIndex.search(query, {
                                              ...options,
                                              enrich: true,
                                            })
                                            console.log(result)
                                            if (result.length === 0) {
                                              return []
                                            }
                                            return result[0].result.map((item) => ({
                                                ...item,
                                                type: item.type,
                                            }))
                                          }
                                    `)
                                })
                                .catch((error) => {
                                    console.error("Error fetching search data:", error)
                                    resolve(`
                                        export function search() {
                                            return []
                                        }
                                    `)
                                })
                        })
                    }),
                ],
            })

            if (typeof nextConfig.webpack === "function") {
                return nextConfig.webpack(config, options)
            }

            return config
        },
    })
}

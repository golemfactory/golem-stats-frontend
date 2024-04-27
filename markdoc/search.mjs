import { createLoader } from "simple-functional-loader"
import * as url from "url"
import fetch from "node-fetch"

const __filename = url.fileURLToPath(import.meta.url)

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
                                    // Combining wallets and providers into a single data array
                                    const data = [
                                        ...wallets.map((wallet) => ({
                                            provider_name: null,
                                            url: `/network/providers/operator/${wallet}`,
                                            type: "wallet",
                                            id: wallet,
                                        })),
                                        ...providers.map((provider) => ({
                                            provider_name: provider.provider_name,
                                            url: `/network/provider/${provider.id}`,
                                            type: "provider",
                                            id: provider.id,
                                        })),
                                    ]

                                    resolve(`
                                        import FlexSearch from 'flexsearch'

                                        let sectionIndex = new FlexSearch.Document({
                                          tokenize: 'full',
                                            cache: true,
                                          document: {
                                            id: 'id',
                                            index: ['provider_name', 'type', 'id'],
                                            store: ['provider_name', 'type', 'id'],
                                          },
                                          context: {
                                            resolution: 9,
                                            depth: 2,
                                            bidirectional: true
                                          }
                                        })

                                        let indexData = ${JSON.stringify(data)}
                                        

                                        for (let { 
                                            provider_name, 
                                            url, 
                                            type, 
                                            id
                                         } of indexData) {
                                            sectionIndex.add({
                                                id,
                                                type,
                                                provider_name
                                            })
                                        }
                                        console.log('Search index loaded', sectionIndex)

                                        export function search(query, options = {}) {
                                          let result = sectionIndex.search(query, {
                                            ...options,
                                            enrich: true,
                                          })
                                          if (result.length === 0) {
                                            return []
                                          }
                                          return result[0].result.map((item) => ({
                                             type: item.type,
                                                provider_name: item.provider_name,
                                                id: item.id,

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

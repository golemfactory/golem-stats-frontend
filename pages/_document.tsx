import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <title key="title">Golem Network Stats</title>
                <link rel="shortcut icon" href="/favicon.ico" />

                <meta
                    name="keywords"
                    content="Golem, Golem Network, blockchain, decentralized cloud, cryptocurrency, crypto, glm, GLM"
                    key={"keyword"}
                />
                <meta
                    name="description"
                    content="Golem Network Stats is a stats page and network explorer for the Golem Network. View live network data, historical data and more."
                    key={"description"}
                />
                <meta name="image" key={"preview_img"} content="/preview-img.jpg" />
                <meta itemProp="name" key={"name"} content="Golem Network Stats" />
                <meta
                    itemProp="description"
                    content="Golem Network Stats is a stats page and network explorer for the Golem Network. View live network data, historical data and more."
                    key={"item_description"}
                />
                <meta key={"item_image"} itemProp="image" content="/preview-img.jpg" />
                <meta key={"twitter_card"} name="twitter:card" content="summary_large_image" />
                <meta key={"twitter_title"} name="twitter:title" content="Golem Network Stats" />
                <meta
                    key={"twitter_description"}
                    name="twitter:description"
                    content="Golem Network Stats is a stats page and network explorer for the Golem Network. View live network data, historical data and more."
                />
                <meta key={"twitter_site"} name="twitter:site" content="@golemproject" />
                <meta key={"twitter_creator"} name="twitter:creator" content="@golemproject" />
                <meta key={"twitter_image"} name="twitter:image:src" content="/preview-img.jpg" />
                <meta key={"og_title"} name="og:title" content="Golem Network Stats" />
                <meta
                    key={"og_description"}
                    name="og:description"
                    content="Golem Network Stats is a stats page and network explorer for the Golem Network. View live network data, historical data and more."
                />
                <meta key={"og_image"} name="og:image" content="/preview-img.jpg" />
                <meta key={"og_image_width"} property="og:image:width" content="1920" />
                <meta key={"og_image_height"} property="og:image:height" content="1080" />
                <meta key={"og_url"} name="og:url" content="https://stats.golem.network" />
                <meta key={"og_site_name"} name="og:site_name" content="Golem Network Stats" />
                <meta key={"og_type"} name="og:type" content="website" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}

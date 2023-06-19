import Head from "next/head"

export const SEO = ({ title, description, url }: { title: string; description: string; url: string }) => {
    return (
        <Head>
            <title key="title">{title}</title>
            <meta name="description" key={"description"} content={description} />
            <meta key={"og_title"} property="og:title" content={title} />
            <meta key={"og_description"} property="og:description" content={description} />
            <meta key={"og_url"} property="og:url" content={url} />
            <meta key={"og_type"} property="og:type" content="website" />
            <meta key={"og_site_name"} property="og:site_name" content="Golem Network Stats" />

            <meta key={"twitter_image_alt"} name="twitter:image:alt" content={description} />
            <meta key={"twitter_title"} name="twitter:title" content={title} />
            <meta key={"twitter_description"} name="twitter:description" content={description} />
        </Head>
    )
}

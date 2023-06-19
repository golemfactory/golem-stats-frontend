/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || "https://stats.golem.network",
    generateRobotsTxt: true, // (optional)
}

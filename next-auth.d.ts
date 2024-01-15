import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's postal address. */
            accessToken: string
            walletAddress: string
        } & DefaultSession["user"]
    }
}

declare module "@metamask/jazzicon" {
    // Define a default export for the module (adjust as needed)
    export default function jazzicon(diameter: number, seed: number): HTMLElement
}

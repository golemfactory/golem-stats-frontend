import NextAuth, { Session, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import { jwtDecode } from "jwt-decode"

import CredentialsProvider from "next-auth/providers/credentials"

async function refreshAuthorization(refreshToken) {
    const url = process.env.NEXT_PUBLIC_API_URL + "auth/refresh"

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        headers: {
            "Content-Type": "application/json",
        },
    })

    if (!response.ok) {
        const errorData = await response.text()
        throw new Error("Failed to refresh the API access token: " + errorData)
    }

    const data = await response.json()
    if (data.id) {
        return data
    } else {
        throw new Error("Failed to refresh the authorization information using the refresh token")
    }
}

async function callAuthorize(walletAddress, web3NonceSignature) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/user/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            walletAddress: walletAddress,
            web3NonceSignature: web3NonceSignature,
        }),
    })

    const data = await res.json()
    if (data.id) {
        return data
    } else {
        throw new Error("User authorization failed, no user information returned")
    }
}

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                walletAddress: {
                    label: "Address",
                    type: "text",
                    placeholder: "0x...",
                },
                signedNonce: {
                    label: "Nonce signature",
                    type: "text",
                    placeholder: "0x...",
                },
            },
            /**
             * STEP 1: Authorize the user against the API backend
             */
            async authorize(credentials) {
                try {
                    if (credentials) {
                        const user = await callAuthorize(credentials.walletAddress, credentials.signedNonce)
                        return user
                    }
                    return null
                } catch (err) {
                    console.error("Error while authorizing user with API", err)
                    return null
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        /**
         * STEP 2: Prepare the JWT token contents based on the user information provided from authorize
         *
         * IMPORTANT: The arguments user, account, profile and isNewUser are only passed the first time this callback
         * is called on a new session, after the user signs in. In subsequent calls, only token will be available.
         */
        async jwt({ token, user }) {
            if (user) {
                // We want to pass our API Access Token, to be the one used in the session
                token = { ...user }
            }

            const accessToken = jwtDecode(token.accessToken)

            if (accessToken) {
                if (accessToken.exp < Date.now() / 1000) {
                    const freshUser = await refreshAuthorization(token.refreshToken)
                    token = { ...freshUser }
                }
            }

            return token
        },

        /**
         * STEP 3: Populate session object with the information which was returned from jwt (token)
         */
        session({ session, token }) {
            if (token) {
                session.user = { ...token }
            }
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/",
        signOut: "/",
        error: "/",
        newUser: "/",
    },
})

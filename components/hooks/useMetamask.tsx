import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { signIn, signOut, useSession } from "next-auth/react"

interface IAuthUser {
    createdAt: string
    id: string
    updatedAt: string
    walletAddress: string
    web3Nonce: string
}

async function findUserByWalletAddress(walletAddress: string): Promise<IAuthUser | null> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/user/find?walletAddress=${walletAddress}`)

    if (response.status === 404) {
        return null
    } else {
        const result = await response.json()
        return result
    }
}

async function createUserOnBackend(walletAddress: string): Promise<IAuthUser | null> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/user/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
    })

    const responseData = await response.json()

    if (responseData.id) {
        return responseData
    } else {
        return null
    }
}

function getNonceFromUser(user: IAuthUser): string {
    return user.web3Nonce
}

async function fetchOrCreateUser(walletAddress: string) {
    const existing = await findUserByWalletAddress(walletAddress)
    if (existing) {
        return existing
    }

    const fresh = await createUserOnBackend(walletAddress)
    return fresh
}

import { MetaMaskInpageProvider } from "@metamask/providers"

// Extend the Window interface
declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider
    }
}

// Your function that uses window.ethereum
async function requestSignature(nonce: string, walletAddress: string): Promise<string> {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed")
    }
    const response = await window.ethereum.request({
        method: "personal_sign",
        params: [nonce, walletAddress],
    })

    if (typeof response !== "string") {
        throw new Error("Expected a string response")
    }

    return response
}

export const useMetamask = () => {
    const { data: session, status } = useSession()

    const [isConnected, setIsConnected] = useState(false)
    const [walletAddress, setWalletAddress] = useState("")
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)

    const reportError = (message: string) => {
        setError(true)
        setErrorMessage(message)
    }

    const updateAccountState = async (...args: unknown[]) => {
        // Assuming the first argument is the accounts array
        const accounts = args[0] as string[]
        if (!Array.isArray(accounts)) {
            // Handle the case where accounts is not an array
            return
        }

        if (session) {
            if (accounts.length > 0) {
                setIsConnected(true)
                setWalletAddress(session.user.walletAddress)
            } else {
                await signOut({ callbackUrl: "/", redirect: true })
            }
        } else {
            setIsConnected(false)
            setWalletAddress("")
        }
    }

    const handleMetamaskEvents = async () => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", updateAccountState)
            const accounts = await window.ethereum.request<string[]>({
                method: "eth_accounts",
            })
            await updateAccountState(accounts)
        }
    }

    const connectWallet = async () => {
        if (!window.ethereum) {
            console.warn("You don't have a Web3 provider installed, we can't proceed")
            return
        }

        if (isMetaMaskInstalled) {
            // Reset state in case user previously had an error and tries to connect again
            setError(false)
            setErrorMessage("")

            const accounts = await window.ethereum.request<string[]>({
                method: "eth_requestAccounts",
            })

            if (!accounts || accounts.length === 0) {
                console.warn("No accounts found. User might have denied the connection request.")
                // Handle the situation appropriately, maybe set an error state or message
                return
            }

            // Check if the first account is a valid string
            if (typeof accounts[0] !== "string") {
                console.warn("The first account in the metamask array is not a valid string.")
                // Handle this error case
                return
            }

            const EIP55Address = ethers.getAddress(accounts[0])
            // Authorization flow starts
            try {
                const user = await fetchOrCreateUser(EIP55Address)
                if (user) {
                    const nonce = getNonceFromUser(user)
                    const signature = await requestSignature(nonce, EIP55Address)

                    try {
                        await signIn("credentials", {
                            walletAddress: EIP55Address,
                            signedNonce: signature,
                            redirect: false,
                        })
                        setIsConnected(true)
                        setWalletAddress(EIP55Address)
                    } catch (err) {
                        console.error("Failed to sign in", err)
                        reportError("Failed to sign in. Please try again later or ping us on Discord.")
                        return
                    }
                } else {
                    reportError("Failed to fetch or create the user from backend. Please try again later or ping us on Discord.")
                    console.error("Failed to fetch or create the user from backend")
                }
            } catch (err) {
                // This is the issue!
                reportError("Failed to fetch or create the user from backend. Please try again later or ping us on Discord.")
                console.error("Failed to authorize the user with the backend", err)
                return
            }
        } else {
            console.warn("You don't have metamask installed installed, we can't proceed")
            setIsMetaMaskInstalled(true)
        }
    }

    useEffect(() => {
        if (window.ethereum) {
            setIsMetaMaskInstalled(true)
        }
        if (status !== "loading") {
            handleMetamaskEvents().catch((err) => {
                console.error("Issue while handling MetaMask events", err)
                reportError("Issue while handling MetaMask events. Please try again later or ping us on Discord.")
            })
        }
    }, [session])

    return {
        connected: isConnected,
        account: walletAddress,
        connectWallet,
        error,
        errorMessage,
        isMetaMaskInstalled,
    }
}

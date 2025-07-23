"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"

interface Network {
  name: string
  apiUrl: string
}

interface NetworkContextType {
  network: Network
  setNetwork: (network: Network) => void
  networks: Network[]
}

const networks: Network[] = [
    { name: "Old marketplace", apiUrl: process.env.NEXT_PUBLIC_OLD_MARKETPLACE_URL || "" },
    { name: "New marketplace", apiUrl: process.env.NEXT_PUBLIC_NEW_MARKETPLACE_URL || "" },
]

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [network, setNetworkState] = useState<Network>(networks[0])

  useEffect(() => {
    const storedNetwork = localStorage.getItem("selectedNetwork")
    if (storedNetwork) {
      try {
        const parsedNetwork: Network = JSON.parse(storedNetwork)
        if (networks.some((n) => n.name === parsedNetwork.name)) {
          setNetworkState(parsedNetwork)
        }
      } catch (error) {
        console.error("Error parsing stored network:", error)
        localStorage.removeItem("selectedNetwork")
      }
    }
  }, [])

  const setNetwork = (newNetwork: Network) => {
    setNetworkState(newNetwork)
    try {
      localStorage.setItem("selectedNetwork", JSON.stringify(newNetwork))
    } catch (error) {
      console.error("Error saving network to localStorage:", error)
    }
  }

  return (
    <NetworkContext.Provider value={{ network, setNetwork, networks }}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider")
  }
  return context
}
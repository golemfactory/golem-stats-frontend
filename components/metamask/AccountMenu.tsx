import { ConnectMetamaskButton } from "./ConnectMetamaskButton"
import { MetamaskDropDown } from "./MetaMaskDropdown"
import { useMetamask } from "../hooks/useMetamask"
import { useSession } from "next-auth/react"
import { MetaMaskModal } from "./MetaMaskModal"
import { useEffect, useState } from "react"

export const AccountMenu = ({ mobile, onAccountClick }: { mobile: boolean; onAccountClick?: () => void }) => {
    const { connected, account, connectWallet, error, errorMessage, isMetaMaskInstalled } = useMetamask()

    const { data: session } = useSession()

    const [showMetaMaskModal, setShowMetaMaskModal] = useState(false)

    useEffect(() => {
        if (error) {
            setShowMetaMaskModal(true)
        }
    }, [error])

    const onClick = async () => {
        if (isMetaMaskInstalled) {
            await connectWallet()
        } else {
            setShowMetaMaskModal(true)
        }
    }

    return (
        <>
            {connected && session ? (
                <MetamaskDropDown mobile={mobile} onAccountClick={onAccountClick} walletAddress={account} />
            ) : (
                <ConnectMetamaskButton mobile={mobile} onClick={onClick} />
            )}

            <MetaMaskModal open={showMetaMaskModal} onClose={() => setShowMetaMaskModal(false)} errorMessage={errorMessage} />
        </>
    )
}

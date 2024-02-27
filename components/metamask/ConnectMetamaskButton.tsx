import { MetamaskIcon } from "./MetaMaskIcon"
import { FC } from "react"

export const ConnectMetamaskButton: FC<{
    onClick: () => void
    mobile?: boolean
}> = ({ onClick, mobile = false }) => {
    return (
        <div
            className={`
                ${mobile ? "justify-center" : ""}
                items-center flex gap-2 border rounded-md p-2 cursor-pointer
                bg-tremor-background-default border-tremor-border-default text-tremor-content-default
                hover:bg-tremor-background-subtle dark:bg-dark-tremor-background-default 
                dark:border-dark-tremor-border dark:text-dark-tremor-content-default 
                dark:hover:bg-dark-tremor-background-subtle
            `}
            onClick={onClick}
        >
            <MetamaskIcon className="inline-block fill-tremor-brand-default dark:fill-dark-tremor-brand-default" />
            <span className="inline-block font-medium">Connect with MetaMask</span>
        </div>
    )
}

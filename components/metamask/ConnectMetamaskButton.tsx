import { MetamaskIcon } from "./MetaMaskIcon"
import { FC } from "react"

const clickableParentClasses = "items-center flex gap-2 border border-primary rounded-md hover:bg-gray-50 p-2 cursor-pointer"
const clickableParentTextClasses = "inline-block text-primary font-medium"

export const ConnectMetamaskButton: FC<{
    onClick: () => void
    mobile?: boolean
}> = ({ onClick, mobile = false }) => {
    return (
        <>
            <div
                className={`${clickableParentClasses}
            ${mobile ? "justify-center" : ""}
            `}
                onClick={onClick}
            >
                <MetamaskIcon className={" inline-block fill-primary"} />
                <span className={clickableParentTextClasses}>Connect with MetaMask</span>
            </div>
        </>
    )
}

import { Menu } from "@headlessui/react"
import { MetamaskIcon } from "./MetaMaskIcon"
import { useRouter } from "next/router"

const clickableParentClasses = "items-center flex gap-2 border border-primary rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 p-2 cursor-pointer"
const clickableParentTextClasses = "inline-block text-primary font-medium"

export const MetamaskDropDown = ({
    walletAddress,
    mobile = false,
    onAccountClick,
}: {
    walletAddress: string
    mobile?: boolean
    onAccountClick?: () => void
}) => {
    console.log("walletAddress", walletAddress)
    const shortenedAddress = walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)
    const router = useRouter()
    return (
        <Menu as="div" className="relative  text-left">
            <div>
                <Menu.Button
                    className={`inline-flex dark:text-white w-full ${clickableParentClasses} ${clickableParentTextClasses}
                ${mobile ? "justify-center text-center" : ""}
                `}
                >
                    <MetamaskIcon className={" inline-block fill-primary"} />
                    {shortenedAddress}
                    {/* commented out for when dropdown should be there
                    <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" /> */}
                </Menu.Button>
            </div>

            {/* <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>{({ active }) => <DropdownOption href="/user/account" active={active} text="Account" />}</Menu.Item>
                    </div>
                </Menu.Items>
            </Transition> */}
        </Menu>
    )
}

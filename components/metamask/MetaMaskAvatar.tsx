import React from "react"

import { getMetamaskAvatar } from "./getmetamaskAvatar"

/**
 */
/**
 * `MetaMaskAvatarProps` has a required `address` property of type `string` and an optional `size` property
 * of type `number`.
 * @property {string} address - The address of the account to get the avatar for. Expecting a string of length 42 that represents Ethereum address
 * @property {number} size - The size of the avatar in pixels.
 * @property {string} className - A string that will be added to the className of the wrapper component. Allows custom styling using: https://emotion.sh/docs/styled#styling-any-component
 */
export type MetaMaskAvatarProps = {
    address: string
    size?: number
    className?: string
}

import Image from "next/image"

export const MetaMaskAvatar: React.FunctionComponent<MetaMaskAvatarProps> = ({ size = 24, address, className }) => {
    if (!address || address.length !== 42) {
        return null
    }
    const avatar = getMetamaskAvatar({
        address,
        size,
    })

    return <Image className="rounded-full inline-block" alt="avatar" src={avatar} width={size} height={size} />
}

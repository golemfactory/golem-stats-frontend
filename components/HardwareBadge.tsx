import React from "react"
import IntelIcon from "./svg/IntelIcon"
import AMDIcon from "./svg/AMDIcon"
import { CpuChipIcon } from "@heroicons/react/24/solid"

interface HardwareBadgeProps {
    title: string
    value: string | number
    icon?: React.ReactNode
    showCPUVendorIcon?: boolean
    cpuVendor?: string
}

const HardwareBadge: React.FC<HardwareBadgeProps> = ({ title, value, icon, showCPUVendorIcon = false, cpuVendor }) => {
    if (showCPUVendorIcon) {

        switch (cpuVendor) {
            case "GenuineIntel":
                icon = <IntelIcon className="h-4 w-4" />
                break
            case "AuthenticAMD":
                icon = <AMDIcon className="h-4 w-4 fill-red-500" />
                break
            default:
                icon = <CpuChipIcon className="h-4 w-4" />
        }
    }

    return (
        <span className="inline-flex items-center gap-x-2.5 rounded-tremor-full bg-tremor-background py-1 pl-2.5 pr-1 text-tremor-label text-tremor-content ring-1 ring-tremor-ring dark:bg-dark-tremor-background dark:text-dark-tremor-content dark:ring-dark-tremor-ring">
            {title}
            <span className="h-4 w-px bg-tremor-ring dark:bg-dark-tremor-ring" />
            <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-emphasis">{value}</span>
            <div className="-ml-1 flex h-5 w-5 items-center justify-center rounded-tremor-full text-tremor-content  dark:text-dark-tremor-content">
                {icon}
            </div>
        </span>
    )
}

export default HardwareBadge

import React from "react"

// Define the props interface
interface StatusIndicatorProps {
    current_status: string
}

// Define the component
const StatusIndicator: React.FC<StatusIndicatorProps> = ({ current_status }) => {
    return current_status === "online" ? (
        <span
            tabIndex={1}
            className="capitalize inline-flex items-center gap-2 rounded-tremor-full px-3 py-1 text-tremor-default text-tremor-content-emphasis ring-1 ring-inset ring-tremor-ring dark:text-dark-tremor-content-emphasis dark:ring-dark-tremor-ring"
        >
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full  bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 bg-emerald-500"></span>
            </span>
            Online
        </span>
    ) : (
        <span
            tabIndex={1}
            className="capitalize inline-flex items-center gap-2 rounded-tremor-full px-3 py-1 text-tremor-default text-tremor-content-emphasis ring-1 ring-inset ring-tremor-ring dark:text-dark-tremor-content-emphasis dark:ring-dark-tremor-ring"
        >
            <span className="-ml-0.5 h-2 w-2 rounded-tremor-full bg-red-500 capitalize" aria-hidden={true} />
            {current_status}
        </span>
    )
}

export default StatusIndicator

import React from "react"
import { Tooltip as ReactTooltip } from "react-tooltip"

type ReputationIndicatorProps = {
    taskReputation?: number | null
}

const ReputationIndicator: React.FC<ReputationIndicatorProps> = ({ taskReputation }) => {
    let color: string
    let displayValue: string
    let showTooltip = false

    console.log(taskReputation)

    if (taskReputation === null || taskReputation === undefined) {
        displayValue = "N/A"
        color = "black" // Default color for N/A
        showTooltip = true
    } else {
        displayValue = taskReputation.toFixed(2)
        if (taskReputation >= 0.8) {
            color = "text-green-500"
        } else if (taskReputation >= 0.5) {
            color = "text-yellow-500"
        } else {
            color = "text-red-500"
        }
    }

    return (
        <>
            <p className={`text-sm font-medium ${color}`} data-tooltip-id={showTooltip ? "reputationTooltip" : undefined}>
                {displayValue}
            </p>
            {showTooltip && (
                <ReactTooltip
                    id="reputationTooltip"
                    place="bottom"
                    className="break-words max-w-xs z-50"
                    content="The reputation measurement is only available on providers whose pricing aligns with market standards, considering a margin of up to 20% above these rates. This is a protection mechanism to avoid malicious providers from gaming the system."
                />
            )}
        </>
    )
}

export default ReputationIndicator

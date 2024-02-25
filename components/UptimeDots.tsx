import React from "react"

interface UptimeDotsProps {
    uptime: number // Uptime in percentage, e.g., 99.38
}

const UptimeDots: React.FC<UptimeDotsProps> = ({ uptime }) => {
    // Calculate the number of active dots based on the uptime percentage
    const activeDots = Math.round((uptime / 100) * 10)
    const dots = Array.from({ length: 10 }, (_, i) => i < activeDots)

    return (
        <div>
            {/* Uptime label and percentage */}
            <div className="flex items-center mb-2">
                <span className="text-sm font-medium">
                    {uptime.toFixed(2)}%<span className="text-xs font-normal text-gray-500 lg:hidden"> Uptime</span>
                </span>
            </div>
            {/* Dots representing uptime */}
            <div className="flex justify-start items-center">
                {dots.map((isActive, index) => (
                    <span key={index} className={`h-3 w-3 mx-0.5 ${isActive ? "bg-green-500" : "bg-gray-300"}`}></span>
                ))}
            </div>
        </div>
    )
}

export default UptimeDots

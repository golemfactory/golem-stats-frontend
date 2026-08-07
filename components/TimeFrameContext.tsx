import { createContext, useContext, useState, ReactNode } from "react"

// One shared 24h/7d selection for every normalized time-series chart:
// switching the timeframe on any chart switches all of them.
export const TIME_FRAMES = ["24h", "7d"] as const
export type TimeFrame = (typeof TIME_FRAMES)[number]

const TimeFrameContext = createContext<{
    timeFrame: TimeFrame
    setTimeFrame: (frame: TimeFrame) => void
}>({ timeFrame: "7d", setTimeFrame: () => {} })

export const TimeFrameProvider = ({ children }: { children: ReactNode }) => {
    const [timeFrame, setTimeFrame] = useState<TimeFrame>("7d")
    return <TimeFrameContext.Provider value={{ timeFrame, setTimeFrame }}>{children}</TimeFrameContext.Provider>
}

export const useTimeFrame = () => useContext(TimeFrameContext)

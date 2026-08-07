import { Tab, TabGroup, TabList } from "@tremor/react"
import { TIME_FRAMES, useTimeFrame } from "@/components/TimeFrameContext"

// The one timeframe selector every normalized chart renders. Bound to the
// shared context, so all charts switch together.
export const TimeFrameTabs = () => {
    const { timeFrame, setTimeFrame } = useTimeFrame()
    return (
        <TabGroup
            index={TIME_FRAMES.findIndex((frame) => frame === timeFrame)}
            onIndexChange={(index) => setTimeFrame(TIME_FRAMES[index])}
        >
            <TabList variant="solid" className="flex flex-wrap justify-center md:justify-start w-full md:w-fit">
                {TIME_FRAMES.map((frame) => (
                    <Tab key={frame}>{frame}</Tab>
                ))}
            </TabList>
        </TabGroup>
    )
}

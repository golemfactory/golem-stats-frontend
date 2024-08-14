import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Dialog, DialogPanel, TextInput, BarList, Button } from "@tremor/react"
import { RiSearchLine } from "@remixicon/react"
import HardwareBadge from "./HardwareBadge"
import NvidiaIcon from "./svg/NvidiaIcon"
import { hotjar } from "react-hotjar" // Add this import

function HardwareFilterModal({ data, filters, setFilters, runtime }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedHardware, setSelectedHardware] = useState(
        filters.hardware ? (Array.isArray(filters.hardware) ? filters.hardware : [filters.hardware]) : []
    )

    const hardwareInfoList = useMemo(() => {
        let hardwareMap = new Map()

        data.forEach((provider) => {
            if (runtime !== "vm-nvidia" && provider.runtimes?.vm?.properties["golem.inf.cpu.brand"]) {
                const model = provider.runtimes.vm.properties["golem.inf.cpu.brand"]
                hardwareMap.set(model, (hardwareMap.get(model) || 0) + 1)
            }
            if (runtime !== "vm" && provider.runtimes?.["vm-nvidia"]?.properties["golem.!exp.gap-35.v1.inf.gpu.model"]) {
                const model = provider.runtimes["vm-nvidia"].properties["golem.!exp.gap-35.v1.inf.gpu.model"]
                hardwareMap.set(model, (hardwareMap.get(model) || 0) + 1)
            }
        })

        return Array.from(hardwareMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    }, [data, runtime])
    const trackEvent = useCallback((eventName, eventData = {}) => {
        const eventString = Object.entries(eventData).reduce((acc, [key, value]) => {
            return `${acc}_${key}:${value}`
        }, eventName)
        hotjar.event(eventString)
    }, [])
    const filteredAndFormattedData = useMemo(() => {
        return hardwareInfoList.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [hardwareInfoList, searchQuery])

    const handleSelectHardware = useCallback(
        (model) => {
            const newSelectedHardware = selectedHardware.includes(model)
                ? selectedHardware.filter((h) => h !== model)
                : [...selectedHardware, model]
            setSelectedHardware(newSelectedHardware)
            setFilters((prev) => ({ ...prev, hardware: newSelectedHardware }))

            // Track the hardware selection/deselection
            trackEvent("hardware_selection", {
                model,
                action: selectedHardware.includes(model) ? "deselected" : "selected",
            })
        },
        [selectedHardware, setFilters, trackEvent]
    )

    useEffect(() => {
        if (modalOpen) {
            trackEvent("hardware_modal_opened")
        } else {
            trackEvent("hardware_modal_closed")
        }
    }, [modalOpen, trackEvent])

    // Track search queries
    useEffect(() => {
        if (searchQuery) {
            trackEvent("hardware_search", { query: searchQuery })
        }
    }, [searchQuery, trackEvent])

    const getMaxValue = () => {
        return Math.max(...hardwareInfoList.map((item) => item.value))
    }

    const calculateWidth = (value) => {
        return (value / getMaxValue()) * 100
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-4">
                <button
                    className="golembutton-noflex"
                    onClick={() => {
                        setModalOpen(true)
                        trackEvent("hardware_modal_button_clicked")
                    }}
                >
                    Select Hardware
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedHardware.map((hardware) => {
                        const matchingProvider = data.find(
                            (provider) =>
                                provider.runtimes?.vm?.properties["golem.inf.cpu.brand"] === hardware ||
                                provider.runtimes?.["vm-nvidia"]?.properties["golem.!exp.gap-35.v1.inf.gpu.model"] === hardware
                        )
                        const isGPU =
                            matchingProvider.runtimes?.["vm-nvidia"]?.properties["golem.!exp.gap-35.v1.inf.gpu.model"] === hardware
                        const cpuVendor = isGPU ? "Nvidia" : matchingProvider.runtimes?.vm?.properties["golem.inf.cpu.vendor"]
                        return (
                            <HardwareBadge
                                key={hardware}
                                title={isGPU ? "GPU" : "CPU"}
                                showCPUVendorIcon={true}
                                value={hardware}
                                cpuVendor={cpuVendor}
                                onClose={() => handleSelectHardware(hardware)}
                            />
                        )
                    })}
                </div>
            </div>
            <Dialog
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setSearchQuery("")
                    trackEvent("hardware_modal_closed")
                }}
                static={true}
                className="z-[100]"
            >
                <DialogPanel className="p-0">
                    <div className="px-6 pb-4 pt-6">
                        <TextInput
                            icon={RiSearchLine}
                            placeholder="Search for hardware"
                            className="rounded-tremor-small"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                        <div className="flex justify-between items-center pt-4">
                            <p className="text-tremor-default px-2 font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                Model
                            </p>
                            <span className="text-tremor-label px-2 font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
                                Count
                            </span>
                        </div>
                    </div>
                    <div className="h-96 overflow-y-scroll px-6">
                        {filteredAndFormattedData.length ? (
                            filteredAndFormattedData.map((item) => {
                                const matchingProvider = data.find(
                                    (provider) =>
                                        provider.runtimes?.vm?.properties["golem.inf.cpu.brand"] === item.name ||
                                        provider.runtimes?.["vm-nvidia"]?.properties["golem.!exp.gap-35.v1.inf.gpu.model"] === item.name
                                )
                                const isGPU =
                                    matchingProvider.runtimes?.["vm-nvidia"]?.properties["golem.!exp.gap-35.v1.inf.gpu.model"] === item.name
                                const cpuVendor = isGPU ? "Nvidia" : matchingProvider.runtimes?.vm?.properties["golem.inf.cpu.vendor"]

                                return (
                                    <div
                                        key={item.name}
                                        className={`flex cursor-pointer justify-between items-center mt-2 py-2 px-2 ${
                                            selectedHardware.includes(item.name) ? "border border-golemblue" : ""
                                        }`}
                                        onClick={() => handleSelectHardware(item.name)}
                                    >
                                        <span className="relative flex-grow text-left">
                                            <div className="absolute top-0 left-0 h-full bg-white dark:bg-dark-tremor-background-subtle"></div>
                                            <span className="relative z-10 text-[#404B63] dark:text-dark-tremor-content">
                                                <HardwareBadge
                                                    title={isGPU ? "GPU" : "CPU"}
                                                    value={item.name}
                                                    showCPUVendorIcon={true}
                                                    cpuVendor={cpuVendor}
                                                />
                                            </span>
                                        </span>
                                        <span className="relative z-10 ml-4 px-2 flex-grow text-right text-golemblue dark:text-white">
                                            {item.value}
                                        </span>
                                    </div>
                                )
                            })
                        ) : (
                            <p className="py-4 text-center text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                No items found.
                            </p>
                        )}
                    </div>
                </DialogPanel>
            </Dialog>
        </>
    )
}

export default HardwareFilterModal

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Dialog, DialogPanel, TextInput, Button, Select, SelectItem, Divider } from "@tremor/react"
import { RiSearchLine } from "@remixicon/react"
import HardwareBadge from "./HardwareBadge"
import NvidiaIcon from "./svg/NvidiaIcon"

function HardwareFilterModal({ data, filters, setFilters, runtime }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [listData, setListData] = useState([])
    const [selectedHardware, setSelectedHardware] = useState(
        filters.hardware ? (Array.isArray(filters.hardware) ? filters.hardware : [filters.hardware]) : []
    )

    const filterListData = useCallback(() => {
        let filteredData = []

        data.forEach((provider) => {
            if (runtime !== "vm-nvidia" && provider.runtimes?.vm?.properties["golem.inf.cpu.brand"]) {
                filteredData.push(provider.runtimes.vm.properties["golem.inf.cpu.brand"])
            }
            if (runtime !== "vm" && provider.runtimes?.["vm-nvidia"]?.properties["golem.!exp.gap-35.v1.inf.gpu.model"]) {
                filteredData.push(provider.runtimes["vm-nvidia"].properties["golem.!exp.gap-35.v1.inf.gpu.model"])
            }
        })

        return [...new Set(filteredData)].sort()
    }, [data, runtime])

    useEffect(() => {
        setListData(filterListData)
    }, [filterListData])

    const filteredData = useMemo(
        () => listData.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase())),
        [listData, searchQuery]
    )

    const handleSelectHardware = (item) => {
        const newSelectedHardware = selectedHardware.includes(item)
            ? selectedHardware.filter((h) => h !== item)
            : [...selectedHardware, item]
        setSelectedHardware(newSelectedHardware)
        setFilters((prev) => ({ ...prev, hardware: newSelectedHardware }))
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="golembutton" onClick={() => setModalOpen(true)}>
                    Select Hardware
                </button>
                {selectedHardware.map((hardware) =>
                    data.some((provider) => provider.runtimes?.vm?.properties["golem.inf.cpu.brand"] === hardware) ? (
                        <HardwareBadge key={hardware} title="CPU" value={hardware} onClose={() => handleSelectHardware(hardware)} />
                    ) : (
                        <HardwareBadge
                            key={hardware}
                            title="GPU"
                            value={hardware}
                            icon={<NvidiaIcon className="h-5 w-5 text-tremor-content dark:text-dark-tremor-content" />}
                            onClose={() => handleSelectHardware(hardware)}
                        />
                    )
                )}
            </div>
            <Dialog
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setSearchQuery("")
                }}
                static={true}
                className="z-[100]"
            >
                <DialogPanel className="p-0">
                    <div className="px-6 pb-4 pt-6">
                        <TextInput
                            icon={RiSearchLine}
                            placeholder="Search..."
                            className="rounded-tremor-small"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                    </div>
                    <div className="h-96 overflow-y-scroll px-6 flex gap-2 flex-wrap">
                        {filteredData.length ? (
                            filteredData.map((item) => (
                                <Button
                                    key={item}
                                    onClick={() => handleSelectHardware(item)}
                                    className={`w-full text-left ${
                                        selectedHardware.includes(item)
                                            ? "bg-tremor-brand hover:bg-tremor-brand"
                                            : "bg-golembackground text-tremor-content hover:bg-tremor-brand hover:text-white"
                                    }`}
                                >
                                    {item}
                                </Button>
                            ))
                        ) : (
                            <p className="flex h-full items-center justify-center text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong">
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

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Dialog, DialogPanel, TextInput, BarList } from "@tremor/react"
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

    const valueFormatter = (value, item) => `${item.name} - ${value}`

    const formattedAndFilteredData = useMemo(() => {
        return data
            .flatMap((provider) => {
                let hardwareInfo = []
                if (runtime !== "vm-nvidia" && provider.runtimes?.vm?.properties["golem.inf.cpu.brand"]) {
                    hardwareInfo.push({
                        model: provider.runtimes.vm.properties["golem.inf.cpu.brand"],
                        type: "CPU",
                    })
                }
                if (runtime !== "vm" && provider.runtimes?.["vm-nvidia"]?.properties["golem.!exp.gap-35.v1.inf.gpu.model"]) {
                    hardwareInfo.push({
                        model: provider.runtimes["vm-nvidia"].properties["golem.!exp.gap-35.v1.inf.gpu.model"],
                        type: "GPU",
                    })
                }
                console.log(hardwareInfo)
                return hardwareInfo
            })
            .filter((item) => !searchQuery || item.model.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item, index) => ({
                id: index.toString(), // Assuming `model` is not unique; otherwise, use `model`
                name: item.model,
                value: item.type,
                color: item.type === "CPU" ? "emerald" : "rose",
            }))
    }, [data, searchQuery, runtime])

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="golembutton-noflex" onClick={() => setModalOpen(true)}>
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
                            placeholder="Search EC2 instance..."
                            className="rounded-tremor-small"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                        <div className="flex items-center justify-between pt-4">
                            <p className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                Model
                            </p>
                            <span className="text-tremor-label font-medium uppercase text-tremor-content dark:text-dark-tremor-content">
                                Type
                            </span>
                        </div>
                    </div>
                    <div className="h-96 overflow-y-scroll px-6 flex gap-2 flex-wrap">
                        {formattedAndFilteredData.length ? (
                            <BarList data={formattedAndFilteredData} valueFormatter={valueFormatter} />
                        ) : (
                            <p>No items found.</p>
                        )}
                    </div>
                </DialogPanel>
            </Dialog>
        </>
    )
}

export default HardwareFilterModal

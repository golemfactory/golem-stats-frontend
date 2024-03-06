import { Dialog, DialogPanel, TextInput, Divider, Select, SelectItem } from "@tremor/react"
import { RadioGroup } from "@headlessui/react"
import { RiCloseLine, RiCheckboxCircleFill } from "@remixicon/react"
import { useState, useCallback, useEffect, useMemo } from "react"
import HardwareFilterModal from "./HardwareFilterModal"

function FilterDialog({ isOpen, onClose, filters, setFilters, data, showOfflineStatusButton = false }) {
    const [selectedRuntime, setSelectedRuntime] = useState(filters.runtime)
    const [presets, setPresets] = useState([])
    const [activePreset, setActivePreset] = useState()

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedPresets = JSON.parse(localStorage.getItem("filterPresets")) || []
            setPresets(storedPresets)
        }
    }, [])

    useEffect(() => {
        setActivePreset(presets.find((p) => p.name === filters.presetName) || presets[0])
    }, [presets, filters.presetName])

    useEffect(() => {
        if (activePreset) {
            setFilters(activePreset)
            setSelectedRuntime(activePreset.runtime)
        }
    }, [activePreset, setFilters])

    const handleFilterChange = useCallback(
        (key, value) => {
            let val = typeof value === "string" ? value : value?.target?.value ?? ""
            if (key === "showOffline") {
                val = val === "True"
            } else if (val === "") {
                val = null
            }
            setFilters((prevFilters) => ({ ...prevFilters, [key]: val }))
        },
        [setFilters]
    )

    useEffect(() => {
        handleFilterChange("runtime", selectedRuntime)
    }, [selectedRuntime, handleFilterChange])

    const applyPreset = useCallback((preset) => {
        setActivePreset(preset)
    }, [])

    const updatePreset = useCallback(() => {
        const updatedPresets = presets.map((preset) => (preset.name === activePreset.name ? { ...activePreset, ...filters } : preset))
        setPresets(updatedPresets)
        localStorage.setItem("filterPresets", JSON.stringify(updatedPresets))
    }, [activePreset, filters, presets])

    const createPreset = useCallback(() => {
        const presetName = prompt("Enter new preset name:")
        if (presetName) {
            const newPresets = [...presets, { ...filters, name: presetName }]
            setPresets(newPresets)
            localStorage.setItem("filterPresets", JSON.stringify(newPresets))
            setActivePreset(newPresets[newPresets.length - 1])
        }
    }, [filters, presets])

    const nodeName = useMemo(() => filters.nodeName ?? "", [filters.nodeName])
    const cores = useMemo(() => filters["golem.inf.cpu.threads"] ?? "", [filters])
    const memory = useMemo(() => filters["golem.inf.mem.gib"] ?? "", [filters])
    const disk = useMemo(() => filters["golem.inf.storage.gib"] ?? "", [filters])
    const showOffline = useMemo(() => (filters.showOffline ? "True" : "False"), [filters.showOffline])
    const runtime = useMemo(() => filters.runtime ?? "", [filters.runtime])
    const price = useMemo(() => filters.price ?? "", [filters.price])

    const removeActivePreset = useCallback(() => {
        const newPresets = presets.filter((preset) => preset !== activePreset)
        setPresets(newPresets)
        localStorage.setItem("filterPresets", JSON.stringify(newPresets))
        if (newPresets.length === 0) {
            setFilters({ runtime: "all" }) // Reset filters to default if all presets are deleted
        } else {
            setActivePreset(newPresets[0])
        }
    }, [activePreset, presets, setFilters])

    return (
        <Dialog open={isOpen} onClose={onClose} className="z-[100]">
            <DialogPanel className="overflow-visible p-0 sm:max-w-6xl">
                <div className="absolute right-0 top-0 pr-3 pt-3">
                    <button
                        type="button"
                        className="rounded-tremor-small p-2 text-tremor-content-subtle hover:bg-tremor-background-subtle hover:text-tremor-content"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <RiCloseLine className="h-5 w-5" aria-hidden={true} />
                    </button>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-80 md:border-r md:border-tremor-border md:dark:border-dark-tremor-border">
                        <div className="p-6">
                            <h3 className="font-medium text-tremor-content-strong text-tremor-title">Filter providers</h3>
                            <p className="text-tremor-content">Filter nodes by name, provider ID, or wallet address.</p>
                            <Divider>Presets</Divider>

                            <div className="gap-2 flex flex-wrap">
                                {presets.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        value={idx}
                                        onClick={() => applyPreset(presets[idx])}
                                        className={`inline-flex items-center gap-2.5 rounded-tremor-default px-2.5 py-1.5 font-medium ${
                                            activePreset === presets[idx]
                                                ? "bg-golemblue text-white"
                                                : "bg-tremor-background-subtle text-tremor-content-strong dark:bg-dark-tremor-background-subtle dark:text-dark-tremor-content-strong"
                                        }`}
                                    >
                                        {preset.name}

                                        <RiCloseLine className="h-5 w-5 ml-2" onClick={removeActivePreset} />
                                    </button>
                                ))}
                            </div>
                            {/* Delete active preset */}

                            {/* Reset filters */}
                            <Divider></Divider>
                            <div className="grid grid-cols-1 gap-4">
                                {activePreset && (
                                    <button type="button" className="golembutton-noflex w-full" onClick={updatePreset}>
                                        Update preset
                                    </button>
                                )}
                                <button onClick={createPreset} className="golembutton-noflex w-full">
                                    Create New Preset
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 space-y-6 p-6 md:px-6  md:pt-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="nodeName"
                                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                                >
                                    Node Name
                                </label>
                                <TextInput
                                    name="nodeName"
                                    type="text"
                                    placeholder="random-lurker"
                                    onChange={(e) => handleFilterChange("nodeName", e)}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="providerId"
                                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                                >
                                    Provider ID
                                </label>
                                <TextInput
                                    name="providerId"
                                    type="text"
                                    placeholder="0x.."
                                    onChange={(e) => handleFilterChange("providerId", e)}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="walletAddress"
                                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                                >
                                    Wallet Address
                                </label>
                                <TextInput
                                    name="walletAddress"
                                    type="text"
                                    placeholder="0x.."
                                    onChange={(e) => handleFilterChange("walletAddress", e)}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="network"
                                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                                >
                                    Network
                                </label>
                                <Select
                                    defaultValue="Mainnet"
                                    id="network"
                                    name="network"
                                    className="z-40"
                                    onValueChange={(e) => handleFilterChange("network", e)}
                                >
                                    <SelectItem value="Mainnet">Mainnet</SelectItem>
                                    <SelectItem value="Testnet">Testnet</SelectItem>
                                </Select>
                            </div>
                        </div>

                        <Divider>Price</Divider>
                        <div className="grid grid-cols-1">
                            <div>
                                <label
                                    htmlFor="maxPrice"
                                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                                >
                                    Min Price
                                </label>
                                <TextInput
                                    type="number"
                                    placeholder="Max $ per hour"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange("price", e)}
                                />
                            </div>
                        </div>

                        <RadioGroup name="runtime" value={runtime} onChange={setSelectedRuntime} className="space-y-4">
                            <Divider>Runtime</Divider>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <RadioGroup.Option
                                    value="vm"
                                    className={({ active }) =>
                                        `relative flex cursor-pointer rounded-tremor-default border ${
                                            active
                                                ? "border-tremor-brand-subtle ring-2 ring-tremor-brand-muted dark:border-dark-tremor-brand-subtle dark:ring-dark-tremor-brand-muted"
                                                : "border-tremor-border dark:border-dark-tremor-border"
                                        } bg-tremor-background p-4 transition dark:bg-dark-tremor-background`
                                    }
                                >
                                    {({ checked }) => (
                                        <>
                                            <div className="flex w-full flex-col">
                                                <RadioGroup.Label
                                                    as="span"
                                                    className="block text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                                                >
                                                    CPU
                                                </RadioGroup.Label>
                                            </div>
                                            <RiCheckboxCircleFill
                                                className={`${
                                                    !checked ? "invisible" : ""
                                                } h-5 w-5 shrink-0 text-tremor-brand dark:text-dark-tremor-brand`}
                                                aria-hidden="true"
                                            />
                                        </>
                                    )}
                                </RadioGroup.Option>
                                <RadioGroup.Option
                                    value="vm-nvidia"
                                    className={({ active }) =>
                                        `relative flex cursor-pointer rounded-tremor-default border ${
                                            active
                                                ? "border-tremor-brand-subtle ring-2 ring-tremor-brand-muted dark:border-dark-tremor-brand-subtle dark:ring-dark-tremor-brand-muted"
                                                : "border-tremor-border dark:border-dark-tremor-border"
                                        } bg-tremor-background p-4 transition dark:bg-dark-tremor-background`
                                    }
                                >
                                    {({ checked }) => (
                                        <>
                                            <div className="flex w-full flex-col">
                                                <RadioGroup.Label
                                                    as="span"
                                                    className="block text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                                                >
                                                    GPU
                                                </RadioGroup.Label>
                                            </div>
                                            <RiCheckboxCircleFill
                                                className={`${
                                                    !checked ? "invisible" : ""
                                                } h-5 w-5 shrink-0 text-tremor-brand dark:text-dark-tremor-brand`}
                                                aria-hidden="true"
                                            />
                                        </>
                                    )}
                                </RadioGroup.Option>
                                <RadioGroup.Option
                                    value="all"
                                    className={({ active }) =>
                                        `relative flex cursor-pointer rounded-tremor-default border ${
                                            active
                                                ? "border-tremor-brand-subtle ring-2 ring-tremor-brand-muted dark:border-dark-tremor-brand-subtle dark:ring-dark-tremor-brand-muted"
                                                : "border-tremor-border dark:border-dark-tremor-border"
                                        } bg-tremor-background p-4 transition dark:bg-dark-tremor-background`
                                    }
                                >
                                    {({ checked }) => (
                                        <>
                                            <div className="flex w-full flex-col">
                                                <RadioGroup.Label
                                                    as="span"
                                                    className="block text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                                                >
                                                    Both
                                                </RadioGroup.Label>
                                            </div>
                                            <RiCheckboxCircleFill
                                                className={`${
                                                    !checked ? "invisible" : ""
                                                } h-5 w-5 shrink-0 text-tremor-brand dark:text-dark-tremor-brand`}
                                                aria-hidden="true"
                                            />
                                        </>
                                    )}
                                </RadioGroup.Option>
                            </div>
                        </RadioGroup>
                        <Divider>Specs</Divider>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label
                                    htmlFor="cores"
                                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                                >
                                    Cores
                                </label>
                                <TextInput
                                    type="number"
                                    placeholder="Number of Cores"
                                    value={cores}
                                    onChange={(e) => handleFilterChange("golem.inf.cpu.threads", e)}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="memory"
                                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                                >
                                    Memory <span className="text-xs font-light text-gray-600 dark:text-gray-400">(±0.5 GB tolerance)</span>
                                </label>
                                <TextInput
                                    type="number"
                                    placeholder="Memory in GB"
                                    value={memory}
                                    onChange={(e) => handleFilterChange("golem.inf.mem.gib", e)}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="disk"
                                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-white font-inter"
                                >
                                    Disk <span className="text-xs font-light text-gray-600 dark:text-gray-400">(±0.5 GB tolerance)</span>
                                </label>
                                <TextInput
                                    type="number"
                                    placeholder="Disk in GB"
                                    value={disk}
                                    onChange={(e) => handleFilterChange("golem.inf.storage.gib", e)}
                                />
                            </div>
                        </div>

                        <Divider>Hardware</Divider>
                        <HardwareFilterModal data={data} filters={filters} setFilters={setFilters} />
                        {showOfflineStatusButton && (
                            <Select value={showOffline} onChange={(e) => handleFilterChange("showOffline", e)}>
                                <SelectItem value="False">Hide Offline</SelectItem>
                                <SelectItem value="True">Show Offline</SelectItem>
                            </Select>
                        )}
                    </div>
                </div>
            </DialogPanel>
        </Dialog>
    )
}

export default FilterDialog

"use client"

import { Popover, Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { Fragment } from "react"
import { useNetwork } from "./NetworkContext"

export const NetworkSelector = () => {
  const { network, setNetwork, networks } = useNetwork()

  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center gap-x-1 font-semibold leading-6 text-white font-inter">
        <span>{network.name}</span>
        <ChevronDownIcon className="h-5 w-5 flex-none text-white" aria-hidden="true" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute -right-4 top-full z-10 mt-3 w-48 overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-2">
            {networks.map((net) => (
              <button
                key={net.name}
                onClick={() => setNetwork(net)}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-golembackground dark:hover:bg-gray-700/80"
              >
                {net.name}
              </button>
            ))}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}
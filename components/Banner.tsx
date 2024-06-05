import { useState } from "react"
import { XMarkIcon, MegaphoneIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

const Banner = ({ title }: { title: string }) => {
    const [showBanner, setShowBanner] = useState(true)

    if (!showBanner) {
        return null
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-50">
            <div className="bg-golemmain">
                <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex w-0 flex-1 items-center">
                            <span className="flex rounded-lg  p-2">
                                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                            </span>
                            <p className="ml-3 font-medium truncate text-white">{title}</p>
                        </div>

                        <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                            <button
                                type="button"
                                className="p-2 -mr-1 hover:bg-gray-700 focus:ring-2 focus:ring-white focus:outline-none rounded-md sm:-mr-2"
                                onClick={() => setShowBanner(false)}
                            >
                                <span className="sr-only">Dismiss</span>
                                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Banner

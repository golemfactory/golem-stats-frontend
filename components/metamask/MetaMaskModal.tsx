import { MetamaskIcon } from "./MetaMaskIcon"
import { Fragment, useRef } from "react"
import { Dialog, Transition } from "@headlessui/react"
import Link from "next/link"

export const MetaMaskModal = ({ errorMessage, open, onClose }: { errorMessage: string; open: boolean; onClose: () => void }) => {
    const cancelButtonRef = useRef(null)

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-sm bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full  sm:mx-0 sm:h-10 sm:w-10">
                                        <MetamaskIcon aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-red-500">
                                            Error connecting with MetaMask
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {errorMessage ? (
                                                    errorMessage
                                                ) : (
                                                    <>
                                                        It appears that you don&apos;t have MetaMask installed. Please install it to
                                                        continue. You can download metamask from here:{" "}
                                                        <Link
                                                            className="text-blue-500 underline"
                                                            href="https://metamask.io/"
                                                            target="_blank"
                                                        >
                                                            https://metamask.io/
                                                        </Link>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-sm bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm  hover:bg-primary/80 sm:mt-0 sm:w-auto"
                                        onClick={() => onClose()}
                                        ref={cancelButtonRef}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

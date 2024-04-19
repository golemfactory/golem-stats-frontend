import { Fragment, useRef, useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { LightBulbIcon } from "@heroicons/react/24/outline"

const Feedback = () => {
    const [open, setOpen] = useState(false)
    const cancelButtonRef = useRef(null)
    const [feedback, setFeedback] = useState("")

    useEffect(() => {
        const displayModal = localStorage.getItem("displayModalFeedback")
        if (displayModal === null || displayModal === "true") {
            setOpen(true)
        }
    }, [])

    const handleClose = () => {
        localStorage.setItem("displayModalFeedback", "false")
        setOpen(false)
    }

    const sendFeedback = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}v1/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ feedback }),
            })
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
            localStorage.setItem("displayModalFeedback", "false")

            setOpen(false)
        } catch (error) {
            console.error("Failed to send feedback:", error)
        }
    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
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
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
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
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                                <div className="bg-white dark:bg-slate-900 px-4 py-10 sm:px-6 sm:pb-4 ">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <LightBulbIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title
                                                as="h3"
                                                className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white"
                                            >
                                                We're redesigning the stats page
                                            </Dialog.Title>
                                            <div className="mt-4">
                                                <p className="text-sm text-gray-500">
                                                    {" "}
                                                    The stats page is about to get a complete refresh, and we're looking to make it the
                                                    perfect service for <b>YOU</b>.<br></br> <br></br> We want to hear your honest and
                                                    unfiltered feedback. Don't hold back! Think out loud and let us know what you love, what
                                                    you hate, what you're missing, or any other thoughts you have.<br></br>
                                                    <br></br> We're open to all suggestions, critiques, and ideas. This is your chance to
                                                    shape the future of the stats page, so speak your mind freely.{" "}
                                                </p>

                                                <textarea
                                                    className="mt-4 w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-800"
                                                    placeholder="Your feedback..."
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-4 sm:flex sm:flex-row-reverse gap-2 sm:px-6">
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-golemblue px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-golemblue/80 sm:mt-0 sm:w-auto"
                                        onClick={() => sendFeedback()}
                                        ref={cancelButtonRef}
                                    >
                                        Send feedback
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                        onClick={handleClose}
                                    >
                                        Don't show me this again
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

export default Feedback

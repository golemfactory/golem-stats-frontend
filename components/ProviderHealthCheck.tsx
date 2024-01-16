import { Fragment, useRef, useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { HeartIcon } from "@heroicons/react/24/outline"
import { useSession } from "next-auth/react"
import useSWR from "swr"
import { AccountMenu } from "./metamask/AccountMenu"

type HealthCheckModalProps = {
    open: boolean
    setOpen: (open: boolean) => void
    node_id: string | undefined
    online: boolean
}
type OpenModalButtonProps = {
    setOpen: (open: boolean) => void
}
const StatusIndicator = ({ status }: { status: string }) => {
    let statusColor = "text-gray-500" // Default color

    switch (status) {
        case "The Healthcheck has been scheduled to queue. We will start in a moment.":
        case "Scanning the market for your provider...":
        case "We found your provider. The task is now starting...":
            statusColor = "text-yellow-500"
            break
        case "Task completely successfully. The provider appears to be working as intended.":
            statusColor = "text-green-500"
            break
        case "The task failed to compute.":
            statusColor = "text-red-500"
            break
        case "Internal server error during healthcheck. Please reach out to us on Discord.":
            statusColor = "text-red-500"
            break
        case "We were unable to reach your provider, please make sure you're not already computing a task.":
            statusColor = "text-red-500"
            break
        default:
            if (status.startsWith("Error running task")) {
                statusColor = "text-red-500"
            }
            break
    }

    return <div className={`${statusColor} text-center font-semibold text-sm`}>{status}</div>
}

export const OpenHealthCheckModalButton: React.FC<OpenModalButtonProps> = ({ setOpen }) => {
    return (
        <button
            type="button"
            className="inline-flex items-center justify-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-2xl text-white bg-golemblue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
            onClick={() => setOpen(true)}
        >
            Healthcheck provider <HeartIcon className="h-6 w-6 ml-1 text-green-600" aria-hidden="true" />
        </button>
    )
}

type FetcherArgs = [url: string, taskId: string | number, accessToken: string]

const fetcher = async (args: FetcherArgs) => {
    const [url, taskId, accessToken] = args

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ taskId }),
    })

    if (!response.ok) {
        throw new Error("Network response was not ok")
    }
    return response.json()
}

export const HealthCheckModal: React.FC<HealthCheckModalProps> = ({ open, setOpen, node_id, online }) => {
    const cancelButtonRef = useRef(null)
    const { data: session } = useSession()
    const [taskId, setTaskId] = useState(null)
    const [isChecking, setIsChecking] = useState(false)
    const [showNoPermission, setShowNoPermission] = useState(false)
    const { data: statusData, error: statusError } = useSWR(
        taskId ? [process.env.NEXT_PUBLIC_API_URL + "v2/healthcheck/frontend/status", taskId, session?.user.accessToken] : null,
        fetcher,
        { refreshInterval: 2000 }
    )

    if (statusError) {
        console.error("Error fetching status:", statusError.message)
    }

    const requestHealthcheck = async () => {
        if (!session) {
            return
        }
        setIsChecking(true)

        try {
            setShowNoPermission(false)
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "v2/healthcheck/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({ node_id: node_id }),
            })

            if (!response.ok) {
                if (response.status === 403) {
                    setShowNoPermission(true)
                }
                const errorData = await response.json()
                throw new Error(`API error: ${errorData.message}`)
            }

            const data = await response.json()
            setTaskId(data.taskId) // Set the taskId state with the received taskId
        } catch (error) {
            if (error instanceof Error) {
                console.error("Fetch error:", error.message)
            } else {
                // You can handle non-Error objects here, if needed
                console.error("An unexpected error occurred")
            }
            setIsChecking(false)
        }
    }

    useEffect(() => {
        if (
            statusData &&
            (statusData.status === "Task completely successfully. The provider appears to be working as intended." ||
                statusData.status.startsWith("Error running task") ||
                statusData.status.startsWith("The task failed") ||
                statusData.status.startsWith("Internal server error during healthcheck. Please reach out to us on Discord.") ||
                statusData.status.startsWith(
                    "We were unable to reach your provider, please make sure you're not already computing a task."
                ))
        ) {
            setIsChecking(false)
        }
    }, [statusData])

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
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:pt-24">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                                <div>
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <HeartIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white">
                                            Healthcheck Provider
                                        </Dialog.Title>
                                        <div className="mt-6 text-left">
                                            <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
                                                Understanding Your Provider's Status
                                            </h3>
                                            <p className="text-md text-gray-500">
                                                If you have any uncertainties regarding the functionality of your provider, the Stats page
                                                offers a convenient solution. Here, you can schedule a task specifically designed to assess
                                                and confirm the operational status of your provider,
                                            </p>

                                            <h3 className="text-lg font-semibold text-gray-700 mt-4 dark:text-white">
                                                Healthcheck Authentication
                                            </h3>
                                            <p className="text-md text-gray-500">
                                                To initiate a healthcheck, authenticate using MetaMask. Ensure that the wallet address in
                                                your MetaMask account matches the address associated with your provider. This step is
                                                required for scheduling a healthcheck.
                                            </p>

                                            <h3 className="text-lg font-semibold text-gray-700 mt-4 dark:text-white">
                                                Important Information About Healthchecks
                                            </h3>
                                            <p className="text-md text-gray-500">
                                                It is important to note that healthchecks, while provided as a free service for monitoring
                                                the health of your provider,{" "}
                                                <span className="text-red-500 font-semibold">
                                                    do not offer compensation in the form of GLM tokens for completing these tasks.
                                                </span>
                                            </p>
                                            <div className="py-8">
                                                <AccountMenu mobile={true} />
                                            </div>
                                            {showNoPermission ? (
                                                <p className="text-center text-red-500 font-semibold">
                                                    You don't have permission to healthcheck this provider!
                                                </p>
                                            ) : null}
                                            {statusData ? <StatusIndicator status={statusData.status} /> : null}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md disabled:opacity-50 disabled:hover:bg-golemblue bg-golemblue px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                                        onClick={() => requestHealthcheck()}
                                        disabled={isChecking || !session || !online}
                                    >
                                        {!session
                                            ? "Connect with MetaMask to benchmark"
                                            : !online
                                            ? "Node must be online to healthcheck"
                                            : "Start Healthcheck"}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0 dark:ring-gray-700 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                                        onClick={() => setOpen(false)}
                                        ref={cancelButtonRef}
                                    >
                                        Cancel
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

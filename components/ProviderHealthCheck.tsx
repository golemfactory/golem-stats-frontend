import { Fragment, useRef, useState, useEffect } from "react"
import { HeartIcon } from "@heroicons/react/24/outline"
import { useSession } from "next-auth/react"
import useSWR from "swr"
import { AccountMenu } from "./metamask/AccountMenu"
import { Dialog, DialogPanel } from "@tremor/react"
import { RiCloseCircleLine, RiHeartPulseLine } from "@remixicon/react"
import PolygonScanIcon from "./svg/Polygonsscan"

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
        <div className="flex justify-center">
            <button className="golembutton group" onClick={() => setOpen(true)}>
                <div className="button-content px-2 group-hover:gap-x-2">
                    <RiHeartPulseLine className="icon h-5 w-5 -ml-2" />
                    <span className="text">Healthcheck</span>
                </div>
            </button>
        </div>
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
        <Dialog open={open} onClose={() => setOpen(false)} static={true} className="z-10">
            <DialogPanel className="overflow-visible p-0 sm:max-w-2xl">
                <div className="flex flex-col p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-tremor-title font-medium text-tremor-content-strong dark:text-dark-tremor-content-metric">
                            Healthcheck Provider
                        </h3>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close"
                            className="rounded-tremor-small p-2 text-tremor-content-subtle hover:bg-tremor-background-subtle hover:text-tremor-content dark:hover:bg-dark-tremor-background-subtle dark:hover:text-dark-tremor-content dark:text-dark-tremor-content-subtle"
                        >
                            <RiCloseCircleLine className="h-5 w-5" aria-hidden={true} />
                        </button>
                    </div>
                    <div className="mt-6">
                        <p className="text-tremor-default text-tremor-content">
                            If you have any uncertainties regarding the functionality of your provider, the Stats page offers a solution.
                        </p>
                        <p className="mt-4 text-tremor-default text-tremor-content">
                            To initiate a healthcheck, authenticate using MetaMask. Ensure that the wallet address in your MetaMask account
                            matches the address associated with your provider.
                        </p>
                        <p className="mt-4 text-tremor-default text-red-500">
                            It is important to note that healthchecks do not offer compensation in the form of GLM tokens for completing
                            these tasks.
                        </p>
                    </div>
                    <div className="py-8">
                        <AccountMenu mobile={true} />
                    </div>
                    {showNoPermission && (
                        <p className="text-center text-tremor-content-emphasis font-semibold dark:text-dark-tremor-content">
                            You don't have permission to healthcheck this provider!
                        </p>
                    )}
                    {statusData && <StatusIndicator status={statusData.status} />}
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            className="golembutton disabled:opacity-50"
                            onClick={requestHealthcheck}
                            disabled={isChecking || !session || !online}
                        >
                            {!online ? "Node must be online to healthcheck" : "Start Healthcheck"}
                        </button>
                        <button
                            type="button"
                            className="whitespace-nowrap rounded-tremor-small px-3 py-2 text-center text-tremor-default font-medium text-tremor-content-strong hover:bg-tremor-background-subtle dark:hover:bg-dark-tremor-background-subtle hover:text-tremor-content dark:hover:text-dark-tremor-content dark:text-dark-tremor-content-strong"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </DialogPanel>
        </Dialog>
    )
}

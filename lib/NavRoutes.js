import { BanknotesIcon, ChartPieIcon, ClockIcon, CursorArrowRaysIcon, FingerPrintIcon } from "@heroicons/react/24/outline"
import { RectangleGroupIcon } from "@heroicons/react/20/solid"

export const network = [
    {
        name: "Overview",
        description: "Dashboard over the current status of the Golem Network",
        href: "/",
        icon: ChartPieIcon,
    },
]
export const provider = [
    {
        name: "Online Providers",
        description: "See and filter through the list of online providers on the Golem Network",
        href: "/network/providers/online",
        icon: ChartPieIcon,
    },
    {
        name: "Lookup Provider or Operator",
        description: "Lookup a specific provider or operator by their wallet address",
        href: "/network/providers/lookup",
        icon: CursorArrowRaysIcon,
    },
    {
        name: "Pricing Analytics",
        description: "Explore the pricing analytics of the providers.",
        href: "/network/provider/pricing",
        icon: BanknotesIcon,
    },
]
export const providerCTA = [
    {
        name: "Become a provider",
        href: "https://docs.golem.network/docs/providers/provider-installation",
        icon: RectangleGroupIcon,
    },
    {
        name: "Provider troubleshooting",
        href: "https://docs.golem.network/docs/troubleshooting/provider",
        icon: RectangleGroupIcon,
    },
]

export const NetworkCTA = [
    {
        name: "Main Website",
        href: "https://golem.network",
        icon: RectangleGroupIcon,
    },
    {
        name: "Golem Portal",
        href: "https://portal.golem.network",
        icon: RectangleGroupIcon,
    },
]

import {
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
} from "@heroicons/react/24/outline";
import { RectangleGroupIcon } from "@heroicons/react/20/solid";

export const network = [
  {
    name: "Overview",
    description: "Dashboard over the current status of the Golem Network",
    href: "/",
    icon: ChartPieIcon,
  },
  {
    name: "Live Graphs",
    description: "Graphs containing more detailed analytics",
    href: "/network/live",
    icon: CursorArrowRaysIcon,
  },
  {
    name: "Historical Statistics",
    description: "Historical statistics for the Golem Network",
    href: "/network/historical",
    icon: FingerPrintIcon,
  },
];
export const provider = [
  {
    name: "Online Providers",
    description:
      "See and filter through the list of online providers on the Golem Network",
    href: "/network/providers/online",
    icon: ChartPieIcon,
  },
  {
    name: "Node Lookup",
    description: "Lookup a specific node on the network",
    href: "/network/providers/lookup/node/",
    icon: CursorArrowRaysIcon,
  },
  {
    name: "Nodes By Operator",
    description:
      "Get direct insights to all providers connected to a specific wallet.",
    href: "/network/providers/lookup/operator/",
    icon: FingerPrintIcon,
  },
  {
    name: "Pricing Analytics",
    description: "Explore the pricing analytics of the providers.",
    href: "/network/provider/pricing",
    icon: FingerPrintIcon,
  },
];
export const providerCTA = [
  {
    name: "Become a provider",
    href: "https://handbook.golem.network/provider-tutorials/provider-tutorial",
    icon: RectangleGroupIcon,
  },
  {
    name: "Provider troubleshooting",
    href: "https://handbook.golem.network/troubleshooting/provider-troubleshooting",
    icon: RectangleGroupIcon,
  },
];

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
];

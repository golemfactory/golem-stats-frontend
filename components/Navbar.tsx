import { Fragment, useState } from "react";
import { Dialog, Disclosure, Popover, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { ElementType } from "react";
import { useRouter } from "next/router";
import { NetworkCTA, provider, network, providerCTA } from "@/lib/NavRoutes";
import DarkModeToggle from "./DarkModeToggle";

const NavItem = ({
  item,
  asComponent,
}: {
  item: {
    name: string;
    description: string;
    href: string;
    icon: any;
  };
  asComponent: ElementType;
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(item.href);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-50 dark:hover:bg-gray-700/80 hover:cursor-pointer"
    >
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-golemblue group-hover:bg-golemblue/80">
        <item.icon
          className="h-6 w-6 text-white group-hover:text-white"
          aria-hidden="true"
        />
      </div>
      <div className="flex-auto">
        <Popover.Button
          as={asComponent}
          className="block font-semibold text-gray-900 dark:text-white"
        >
          {item.name}
          <span className="absolute inset-0" />
        </Popover.Button>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {item.description}
        </p>
      </div>
    </div>
  );
};

const CTA = ({
  item,
}: {
  item: {
    name: string;
    href: string;
    icon: any;
  };
}) => (
  <Link
    href={item.href}
    target="_blank"
    className="flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700/80 dark:bg-gray-800 dark:text-gray-400 dark:border-top"
  >
    <item.icon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
    {item.name}
  </Link>
);

const PopoverGroup = ({ children }: { children: React.ReactNode }) => (
  <Popover.Group className="hidden lg:flex lg:gap-x-12">
    <Popover className="relative">{children}</Popover>
  </Popover.Group>
);

const PopoverArea = ({
  title,
  items,
  CTAs,
}: {
  title: string;
  items: Array<{
    name: string;
    description: string;
    href: string;
    icon: any;
  }>;
  CTAs: Array<{
    name: string;
    href: string;
    icon: any;
  }>;
}) => (
  <>
    <Popover.Button className="flex items-center gap-x-1  font-semibold leading-6 text-white">
      {title}
      <ChevronDownIcon
        className="h-5 w-5 flex-none text-white"
        aria-hidden="true"
      />
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
      <Popover.Panel className="absolute -left-48 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg ">
        <div className="p-4">
          {items.map((item) => (
            <NavItem key={item.name} item={item} asComponent={"div"} />
          ))}
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-900/5 bg-gray-50 dark:divide-gray-700 dark:bg-gray-800">
          {CTAs.map((item) => (
            <CTA key={item.name} item={item} />
          ))}
        </div>
      </Popover.Panel>
    </Transition>
  </>
);

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative isolate bg-golemblue text-white z-50">
      <nav
        className="mx-auto items-center grid grid-cols-4 lg:flex p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1 col-span-3">
          <Link href="/" className="text-xl font-medium -m-1.5 p-1.5">
            Golem Network Stats
          </Link>
        </div>
        <div className="flex lg:hidden justify-end">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 "
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6 text-white" aria-hidden="true" />
          </button>
        </div>
        <div className="flex gap-x-8">
          <PopoverGroup>
            <PopoverArea title="Network" items={network} CTAs={NetworkCTA} />
          </PopoverGroup>
          <PopoverGroup>
            <PopoverArea title="Provider" items={provider} CTAs={providerCTA} />
          </PopoverGroup>
          <Link
            href="/network/requestor"
            className="hidden lg:block  font-semibold leading-6 text-white"
          >
            Requestor
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <DarkModeToggle />
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white dark:bg-gray-800 dark:text-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-medium -m-1.5 p-1.5">
              Golem Network Stats
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon
                className="h-6 w-6 text-white fill-white"
                aria-hidden="true"
              />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10 ">
              <div className="space-y-2 py-6 grid gap-y-4 mt-4">
                <Disclosure as="div" className="-mx-3 grid gap-y-4 ">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 mb-2 pl-3 pr-3.5 text-lg font-semibold leading-7 hover:bg-gray-50 dark:hover:bg-gray-700/80">
                        Network
                        <ChevronDownIcon
                          className={`h-5 w-5 flex-none ${
                            open ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2">
                        {network.map((item) => (
                          <Disclosure.Button
                            key={item.name}
                            as="a"
                            href={item.href}
                            className="block rounded-lg py-2 pl-6 pr-3 font-semibold leading-7 hover:bg-gray-50 dark:hover:bg-gray-700/80"
                          >
                            {item.name}
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                      <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-lg font-semibold leading-7 hover:bg-gray-50 dark:hover:bg-gray-700/80">
                        Provider
                        <ChevronDownIcon
                          className={`h-5 w-5 flex-none ${
                            open ? "rotate-180" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="mt-2 space-y-2">
                        {provider.map((item) => (
                          <Disclosure.Button
                            key={item.name}
                            as="a"
                            href={item.href}
                            className="block rounded-lg py-2 pl-6 pr-3 font-semibold leading-7 hover:bg-gray-50 dark:hover:bg-gray-700/80"
                          >
                            {item.name}
                          </Disclosure.Button>
                        ))}
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
                <Link
                  href="/network/requestor"
                  className="-mx-3 block rounded-lg px-3 py-2 text-lg font-semibold leading-7 hover:bg-gray-50 dark:hover:bg-gray-700/80"
                >
                  Requestor
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
};

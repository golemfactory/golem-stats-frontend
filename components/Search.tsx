import { useEffect, useState, Fragment, useRef, useId } from "react"
import { Dialog, Transition } from "@headlessui/react"
import Highlighter from "react-highlight-words"
import { useRouter } from "next/router"
function SearchIcon(props) {
    return (
        <svg aria-hidden="true" viewBox="0 0 20 20" {...props}>
            <path d="M16.293 17.707a1 1 0 0 0 1.414-1.414l-1.414 1.414ZM9 14a5 5 0 0 1-5-5H2a7 7 0 0 0 7 7v-2ZM4 9a5 5 0 0 1 5-5V2a7 7 0 0 0-7 7h2Zm5-5a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7v2Zm8.707 12.293-3.757-3.757-1.414 1.414 3.757 3.757 1.414-1.414ZM14 9a4.98 4.98 0 0 1-1.464 3.536l1.414 1.414A6.98 6.98 0 0 0 16 9h-2Zm-1.464 3.536A4.98 4.98 0 0 1 9 14v2a6.98 6.98 0 0 0 4.95-2.05l-1.414-1.414Z" />
        </svg>
    )
}

function LoadingIcon(props) {
    let id = useId()

    return (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
            <circle cx="10" cy="10" r="5.5" strokeLinejoin="round" />
            <path stroke={`url(#${id})`} strokeLinecap="round" strokeLinejoin="round" d="M15.5 10a5.5 5.5 0 1 0-5.5 5.5" />
            <defs>
                <linearGradient id={id} x1="13" x2="9.5" y1="9" y2="15" gradientUnits="userSpaceOnUse">
                    <stop stopColor="currentColor" />
                    <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    )
}

function SearchResult({ result, autocomplete, collection, query, type }) {
    let id = useId()
    let router = useRouter()

    const handleResultClick = (result) => {
        if (type === "wallet") {
            router.push(`/network/providers/operator/${result.address}`)
        } else if (type === "provider") {
            router.push(`/network/provider/${result.id}`)
        }
    }
    console.log(result)
    return (
        <li
            className="group-result group block cursor-default hover:bg-gray-100"
            aria-labelledby={`${id}-hierarchy ${id}-title`}
            role="listitem"
            {...autocomplete.getItemProps({
                item: result,
                source: collection.source,
            })}
            onClick={() => handleResultClick(result)}
        >
            <div
                id={`${id}-title`}
                aria-hidden="true"
                className="relative rounded-lg py-2 pl-3 text-sm text-slate-700 hover:cursor-pointer group-aria-selected:bg-slate-100 group-aria-selected:text-primary dark:text-white/70 dark:group-aria-selected:bg-slate-700/30 dark:group-aria-selected:text-white/50"
            >
                <div className="grid items-center gap-x-2 break-words md:grid-cols-3">
                    <div className="flex items-center gap-x-2 break-words md:col-span-2">
                        <div className="md:truncate">
                            {/* <HighlightQuery text={result.title} query={query} /> */}
                            <div
                                id={`${id}-hierarchy`}
                                aria-hidden="true"
                                className="mt-0.5 text-xs text-slate-800 dark:text-slate-400 md:truncate md:whitespace-nowrap "
                            >
                                <span className="break-words">
                                    {type === "wallet" ? (
                                        <>
                                            <p className="font-medium text-sm">{result.address}</p>
                                            <span className="text-slate-400">{result.provider_count} Providers under this operator</span>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-medium text-sm">{result.provider_name}</p>
                                            <span className="text-slate-400">{result.id}</span>
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mr-4 mt-4 flex items-center md:ml-auto md:mt-0">
                        <span className="px-2 text-xs font-medium capitalize text-primary dark:text-white">↗</span>
                    </div>
                </div>
            </div>
        </li>
    )
}

function SearchResults({ autocomplete, query, wallets, providers }) {
    return (
        <>
            <section className="border-t border-slate-200 bg-white  py-3 empty:hidden dark:border-slate-400/10 dark:bg-slate-800">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Providers</h3>
                <ul role="list" {...autocomplete.getListProps()}>
                    {providers.map((result) => (
                        <SearchResult
                            key={result.id}
                            result={result}
                            autocomplete={autocomplete}
                            collection={{ items: providers }}
                            query={query}
                            type="provider"
                        />
                    ))}
                </ul>
            </section>
            <section className="border-t border-slate-200 bg-white py-3 empty:hidden dark:border-slate-400/10 dark:bg-slate-800">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Operators</h3>
                <ul role="list" {...autocomplete.getListProps()}>
                    {wallets.map((result) => (
                        <SearchResult
                            key={result.wallet}
                            result={result}
                            autocomplete={autocomplete}
                            collection={{ items: wallets }}
                            query={query}
                            type="wallet"
                        />
                    ))}
                </ul>
            </section>
        </>
    )
}

export default function SearchComponent(fullWidth = false) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState({ wallets: [], providers: [] })
    const inputRef = useRef(null)
    const panelRef = useRef(null)
    const formRef = useRef(null)
    let [modifierKey, setModifierKey] = useState()

    useEffect(() => {
        setModifierKey(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? "⌘" : "Ctrl ")
    }, [])

    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }

    useEffect(() => {
        if (query) {
            fetch(`http://api.localhost/v2/search-list?query=${encodeURIComponent(query)}`)
                .then((response) => {
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
                    return response.json()
                })
                .then((data) => {
                    setResults({
                        wallets: data.wallets.slice(0, 3),
                        providers: data.providers.slice(0, 3),
                    })
                })
                .catch((error) => {
                    console.error("Failed to fetch data:", error)
                    // Handle the error, e.g., show an error message to the user
                })
        } else {
            setResults({ wallets: [], providers: [] })
        }
    }, [query])

    return (
        <>
            <button
                onClick={openModal}
                className={`
        group flex h-6  items-center justify-center w-auto md:h-auto md:flex-none md:rounded md:py-1.5 md:pl-4 md:pr-3.5 md:text-sm md:ring-1 md:hover:ring-primaryhover dark:md:ring-inset ring-slate-800 hover:ring-white/50`}
            >
                <SearchIcon className="h-4 w-4 flex-none fill-white/70  " />
                <span className="sr-only md:not-sr-only md:ml-2 text-white/70">Search</span>
                {modifierKey && (
                    <kbd className="ml-16 hidden gap-x-2 text-xs  font-medium text-lightgray  dark:text-white/70 md:flex">
                        <kbd className="rounded border  px-2 py-0.5 font-sans border-slate-800 ">{modifierKey}</kbd>
                        <kbd className="rounded border  px-2 py-0.5 font-sans border-slate-800">K</kbd>
                    </kbd>
                )}
            </button>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden  bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div>
                                        <form ref={formRef}>
                                            <div className="group relative flex h-12">
                                                <SearchIcon className="pointer-events-none absolute left-4 top-0 h-full w-5 fill-slate-400 dark:fill-white/70" />
                                                <input
                                                    ref={inputRef}
                                                    className="flex-auto appearance-none bg-transparent pl-12 text-slate-900 outline-none placeholder:text-slate-400 focus:w-full focus:flex-none dark:text-white sm:text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
                                                    type="text"
                                                    value={query}
                                                    onChange={(e) => setQuery(e.target.value)}
                                                    placeholder="Find something..."
                                                />
                                                {query && (
                                                    <div className="absolute inset-y-0 right-3 flex items-center">
                                                        <LoadingIcon className="h-6 w-6 animate-spin stroke-slate-200 text-slate-400 dark:stroke-slate-700 dark:text-slate-800" />
                                                    </div>
                                                )}
                                            </div>
                                            <div ref={panelRef}>
                                                <SearchResults
                                                    autocomplete={{
                                                        getListProps: () => ({}),
                                                        getItemProps: () => ({}),
                                                    }}
                                                    query={query}
                                                    wallets={results.wallets}
                                                    providers={results.providers}
                                                />
                                            </div>
                                        </form>
                                        <div className="flex items-center border-t border-slate-200 px-4 py-4 text-sm font-semibold text-gray-400 dark:border-slate-400/10">
                                            <div className="flex flex-col gap-y-2 font-semibold text-slate-800 dark:text-white/70">
                                                Keyboard Controls
                                            </div>
                                            <div className=" ml-auto flex items-center gap-x-2">
                                                <div className=" flex items-center gap-x-1">
                                                    <div className="rounded-md   bg-lightbluedarker px-2 py-1 text-gray-500 dark:bg-darkcontent dark:text-white">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            version="1.1"
                                                            className="h-4 w-4 opacity-50 dark:fill-white dark:text-white dark:opacity-100"
                                                        >
                                                            <g id="🔍-System-Icons" stroke="none" strokeWidth="1" fillRule="evenodd">
                                                                <g id="ic_fluent_arrow_enter_24_regular" fillRule="nonzero">
                                                                    <path
                                                                        d="M21.25,4 C21.6642136,4 22,4.33578644 22,4.75 L22,4.75 L22,11.25 C22,13.3210678 20.3210678,15 18.25,15 L18.25,15 L4.58583574,15 L8.30516583,18.7196699 C8.57143239,18.9859365 8.59563844,19.4026002 8.37778398,19.6962117 L8.30516583,19.7803301 C8.03889927,20.0465966 7.62223558,20.0708027 7.32862409,19.8529482 L7.24450566,19.7803301 L2.24450566,14.7803301 C1.97823909,14.5140635 1.95403304,14.0973998 2.1718875,13.8037883 L2.24450566,13.7196699 L7.24450566,8.71966991 C7.53739888,8.4267767 8.01227261,8.4267767 8.30516583,8.71966991 C8.57143239,8.98593648 8.59563844,9.40260016 8.37778398,9.69621165 L8.30516583,9.78033009 L4.58583574,13.5 L18.25,13.5 C19.440864,13.5 20.4156449,12.5748384 20.4948092,11.4040488 L20.5,11.25 L20.5,4.75 C20.5,4.33578644 20.8357864,4 21.25,4 Z"
                                                                        id="🎨-Color"
                                                                    ></path>
                                                                </g>
                                                            </g>
                                                        </svg>
                                                    </div>
                                                    <span className="ml-1.5 font-semibold text-slate-800 dark:text-white/70">Select</span>
                                                </div>
                                                <div className=" flex items-center gap-x-1 ">
                                                    <div className="rounded-md   bg-lightbluedarker px-2 py-1 text-gray-500 dark:bg-darkcontent dark:text-white">
                                                        {modifierKey}
                                                    </div>
                                                    <div className="rounded-md   bg-lightbluedarker px-2 py-1 text-gray-500 dark:bg-darkcontent dark:text-white">
                                                        K
                                                    </div>
                                                    <span className="ml-1.5 font-semibold text-slate-800 dark:text-white/70">Quit</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

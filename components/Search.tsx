import { useEffect, useState, Fragment, useRef, useId } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { useRouter } from "next/router"
import { ArrowSmallUpIcon, ArrowSmallDownIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { hotjar } from "react-hotjar"

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
    return (
        <svg aria-hidden="true" viewBox="0 0 20 20" {...props}>
            <path d="M16.293 17.707a1 1 0 0 0 1.414-1.414l-1.414 1.414ZM9 14a5 5 0 0 1-5-5H2a7 7 0 0 0 7 7v-2ZM4 9a5 5 0 0 1 5-5V2a7 7 0 0 0-7 7h2Zm5-5a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7v2Zm8.707 12.293-3.757-3.757-1.414 1.414 3.757 3.757 1.414-1.414ZM14 9a4.98 4.98 0 0 1-1.464 3.536l1.414 1.414A6.98 6.98 0 0 0 16 9h-2Zm-1.464 3.536A4.98 4.98 0 0 1 9 14v2a6.98 6.98 0 0 0 4.95-2.05l-1.414-1.414Z" />
        </svg>
    )
}

const LoadingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
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

interface SearchResultType {
    id?: string
    address?: string
    provider_name?: string
    provider_count?: number
    wallet?: string
}

interface SearchResultProps {
    result: SearchResultType
    autocomplete: any
    collection: { source?: any; items: SearchResultType[] }
    query: string
    type: "provider" | "wallet"
    isSelected: boolean
    onResultClick: (result: SearchResultType) => void
}

const SearchResult: React.FC<SearchResultProps> = ({ result, autocomplete, collection, query, type, isSelected, onResultClick }) => {
    let id = useId()
    let router = useRouter()

    return (
        <li
            className={`group-result group block cursor-default ${
                isSelected
                    ? "bg-gray-100"
                    : "hover:bg-gray-100 dark:hover:bg-dark-tremor-background-muted dark:group-aria-selected:bg-dark-tremor-background-muted "
            }`}
            aria-labelledby={`${id}-hierarchy ${id}-title`}
            role="option"
            aria-selected={isSelected}
            {...autocomplete.getItemProps({
                item: result,
                source: collection.source,
            })}
            onClick={() => onResultClick(result)}
        >
            <div
                id={`${id}-title`}
                aria-hidden="true"
                className="relative  py-2 pl-3 text-sm text-slate-700 hover:cursor-pointer group-aria-selected:bg-slate-100 group-aria-selected:text-primary dark:text-white/70 dark:group-aria-selected:bg-dark-tremor-background-muted dark:group-aria-selected:
                
                text-white/50"
            >
                <div className="grid items-center gap-x-2 break-words md:grid-cols-3">
                    <div className="flex items-center gap-x-2 break-words md:col-span-2">
                        <div className="md:truncate">
                            <div
                                id={`${id}-hierarchy`}
                                aria-hidden="true"
                                className="mt-0.5 text-xs text-slate-800 dark:text-slate-400 md:truncate md:whitespace-nowrap "
                            >
                                <span className="break-words">
                                    {type === "wallet" ? (
                                        <>
                                            <p className="font-medium text-sm dark:text-white">{result.address}</p>
                                            <span className="text-slate-400 dark:text-dark-tremor-background-graygolem">
                                                {result.provider_count} Provider(s) under this operator
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <p className="font-medium text-sm dark:text-white">{result.provider_name}</p>
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

interface SearchResultsProps {
    autocomplete: any
    query: string
    wallets: SearchResultType[]
    providers: SearchResultType[]
    selectedIndex: number
    onResultClick: (result: SearchResultType) => void
}

const SearchResults: React.FC<SearchResultsProps> = ({ autocomplete, query, wallets, providers, selectedIndex, onResultClick }) => {
    return (
        <>
            <section className="border-t border-slate-200 bg-white py-3 empty:hidden dark:border-slate-400/10 dark:bg-dark-tremor-background">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Providers</h3>
                {providers.length === 0 && query && (
                    <div className="text-center">
                        <p className="text-sm text-center text-red-400 ">No online provider(s) was found</p>
                        <Link className="text-sm text-center hover:underline text-gray-400 " href={`/network/provider/${query}`}>
                            To view provider information for <b>{query}</b>, click here
                        </Link>
                    </div>
                )}
                <ul role="listbox" {...autocomplete.getListProps()}>
                    {providers.map((result, index) => (
                        <SearchResult
                            key={result.id}
                            result={result}
                            autocomplete={autocomplete}
                            collection={{ items: providers }}
                            query={query}
                            type="provider"
                            isSelected={selectedIndex === index}
                            onResultClick={onResultClick}
                        />
                    ))}
                </ul>
            </section>
            <section className="border-t border-slate-200 bg-white py-3 empty:hidden dark:border-slate-400/10 dark:bg-dark-tremor-background">
                <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Operators</h3>
                {wallets.length === 0 && query && (
                    <div className="text-center">
                        <p className="text-sm text-center text-red-400 ">No online operator(s) was found</p>
                        <Link className="text-sm text-center hover:underline text-gray-400 " href={`/network/providers/operator/${query}`}>
                            To view operator information for <b>{query}</b>, click here
                        </Link>
                    </div>
                )}

                <ul role="listbox" {...autocomplete.getListProps()}>
                    {wallets.map((result, index) => (
                        <SearchResult
                            key={result.wallet}
                            result={result}
                            autocomplete={autocomplete}
                            collection={{ items: wallets }}
                            query={query}
                            type="wallet"
                            isSelected={selectedIndex === providers.length + index}
                            onResultClick={onResultClick}
                        />
                    ))}
                </ul>
            </section>
        </>
    )
}

interface SearchComponentProps {
    fullWidth?: boolean
}

export default function SearchComponent({ fullWidth = false }: SearchComponentProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState({ wallets: [], providers: [] })
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)
    const panelRef = useRef(null)
    const formRef = useRef(null)
    let [modifierKey, setModifierKey] = useState<string>()
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "k") {
                event.preventDefault()
                setIsOpen((prevIsOpen) => {
                    hotjar.event(!prevIsOpen ? "search_modal_opened" : "search_modal_closed")
                    return !prevIsOpen
                })
            }
        }

        document.addEventListener("keydown", handleKeyDown as EventListener)

        return () => {
            document.removeEventListener("keydown", handleKeyDown as EventListener)
        }
    }, [])

    useEffect(() => {
        setModifierKey(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? "⌘" : "Ctrl ")
    }, [])

    function closeModal() {
        setIsOpen(false)
        hotjar.event("search_modal_closed")
    }

    function openModal() {
        setIsOpen(true)
        hotjar.event("search_modal_opened")
    }

    useEffect(() => {
        if (query) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}v2/search-list?query=${encodeURIComponent(query)}`)
                .then((response) => {
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
                    return response.json()
                })
                .then((data) => {
                    setResults({
                        wallets: data.wallets.slice(0, 3),
                        providers: data.providers.slice(0, 3),
                    })
                    setSelectedIndex(0)
                    // Track successful search
                    hotjar.event(`search_performed: ${query}`)
                })
                .catch((error) => {
                    console.error("Failed to fetch data:", error)
                    // Track failed search
                    hotjar.event(`search_failed: ${query}`)
                })
        } else {
            setResults({ wallets: [], providers: [] })
            setSelectedIndex(0)
        }
    }, [query])

    const handleKeyDown = (event: React.KeyboardEvent) => {
        const totalResults = results.providers.length + results.wallets.length

        if (event.key === "ArrowUp") {
            event.preventDefault()
            setSelectedIndex((prevIndex) => (prevIndex - 1 + totalResults) % totalResults)
            hotjar.event("search_result_navigation_up")
        } else if (event.key === "ArrowDown") {
            event.preventDefault()
            setSelectedIndex((prevIndex) => (prevIndex + 1) % totalResults)
            hotjar.event("search_result_navigation_down")
        } else if (event.key === "Enter") {
            event.preventDefault()
            const selectedResult = [...results.providers, ...results.wallets][selectedIndex]
            if (selectedResult) {
                handleResultClick(selectedResult)
                hotjar.event("search_result_selected")
            }
        }
    }

    const handleResultClick = (result: SearchResultType) => {
        if (result.address) {
            router.push(`/network/providers/operator/${result.address}`)
            hotjar.event("operator_result_clicked")
        } else if (result.id) {
            router.push(`/network/provider/${result.id}`)
            hotjar.event("provider_result_clicked")
        }
        closeModal()
    }

    return (
        <>
            <button
                onClick={() => {
                    openModal()
                    hotjar.event("search_button_clicked")
                }}
                className={`
        group flex items-center justify-center w-auto h-auto flex-none rounded py-1.5 pl-4 pr-3.5 text-sm ring-1 hover:ring-primaryhover dark:ring-inset ring-slate-700 hover:ring-white/50`}
            >
                <SearchIcon className="h-4 w-4 flex-none fill-white/70  " />
                <span className=" not-sr-only ml-2 text-white/70">Find Provider</span>
                {modifierKey && (
                    <kbd className="ml-10  gap-x-2 text-xs  font-medium text-lightgray  dark:text-white/70 flex">
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden bg-white dark:bg-dark-tremor-background p-6 text-left align-middle shadow-xl transition-all">
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
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Find a Provider or Operator"
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
                                                    selectedIndex={selectedIndex}
                                                    onResultClick={handleResultClick}
                                                />
                                            </div>
                                        </form>
                                        <div className="flex items-center border-t border-slate-200 px-4 py-4 text-sm font-semibold text-gray-400 dark:border-slate-400/20">
                                            <div className="flex flex-col gap-y-2 font-semibold text-slate-800 dark:text-white/70">
                                                Keyboard Controls
                                            </div>
                                            <div className=" ml-auto flex items-center gap-x-2">
                                                <div className=" flex items-center gap-x-1">
                                                    <div className="rounded-md   bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle px-2 py-1 text-gray-500 dark:bg-darkcontent dark:text-white">
                                                        <ArrowSmallUpIcon className="h-4 w-4" />
                                                    </div>
                                                    <div className="rounded-md   bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle px-2 py-1 text-gray-500 dark:bg-darkcontent dark:text-white">
                                                        <ArrowSmallDownIcon className="h-4 w-4" />
                                                    </div>
                                                    <span className="ml-1.5 font-semibold text-slate-800 dark:text-white/70">Move</span>
                                                </div>
                                                <div className=" flex items-center gap-x-1 ">
                                                    <div className="rounded-md   bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle px-2 py-1 text-gray-500 dark:bg-darkcontent dark:text-white">
                                                        {modifierKey}
                                                    </div>
                                                    <div className="rounded-md   bg-tremor-background-subtle dark:bg-dark-tremor-background-subtle px-2 py-1 text-gray-500 dark:bg-darkcontent dark:text-white">
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

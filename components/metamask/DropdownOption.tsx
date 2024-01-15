import Link from "next/link"

export const DropdownOption = ({ href, text, active }: { href: string; text: string; active: boolean }) => {
    return (
        <Link
            href={href}
            className={`block px-4 py-2 text-sm
            ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"}
        `}
        >
            {text}
        </Link>
    )
}

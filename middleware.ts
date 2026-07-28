import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Maintenance switch.
//
// While this file is on main, every route serves public/maintenance/not_available.html
// with a 503, so search engines treat it as a temporary outage rather than reindexing
// the site as an empty page. Revert this commit to bring the stats site back.
export async function middleware(request: NextRequest) {
    const page = await fetch(new URL("/maintenance/not_available.html", request.url))

    return new NextResponse(page.body, {
        status: 503,
        headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-store, no-cache, must-revalidate",
            "retry-after": "300",
        },
    })
}

export const config = {
    // Everything except the maintenance page itself and the assets it needs.
    matcher: ["/((?!maintenance/|_next/static|_next/image|favicon.ico).*)"],
}

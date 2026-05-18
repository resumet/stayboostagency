import { NextResponse, type NextRequest } from "next/server"

import { createSupabaseProxyClient } from "@/lib/supabase/proxy"

const publicPaths = ["/login", "/auth/callback"]
const pendingPath = "/pending-approval"

function isPublicPath(pathname: string) {
  return publicPaths.some((path) => pathname === path || pathname.startsWith(path))
}

function isAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  )
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (isAssetPath(pathname)) {
    return NextResponse.next()
  }

  const { supabase, response } = createSupabaseProxyClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (isPublicPath(pathname)) {
      return response
    }

    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approval_status")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.approval_status === "approved") {
    if (pathname === "/login" || pathname === pendingPath) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      url.search = ""
      return NextResponse.redirect(url)
    }

    if (
      pathname.startsWith("/admin") &&
      profile.role !== "admin"
    ) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      url.search = ""
      return NextResponse.redirect(url)
    }

    return response
  }

  if (isPublicPath(pathname) || pathname === pendingPath) {
    return response
  }

  const url = request.nextUrl.clone()
  url.pathname = pendingPath
  url.searchParams.set("status", profile?.approval_status ?? "pending")
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardList,
  Menu,
  Package,
  Settings,
  ShieldCheck,
} from "lucide-react"

import { signOut } from "@/actions/auth-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { appName } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Profile } from "@/types/database.types"

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: BarChart3 },
  { href: "/products", label: "상품 관리", icon: Package },
  { href: "/hotels", label: "호텔 관리", icon: Building2 },
  { href: "/work", label: "업무 관리", icon: ClipboardList },
  { href: "/settings", label: "설정", icon: Settings },
]

function initials(profile: Profile) {
  return (profile.full_name || profile.email).slice(0, 2).toUpperCase()
}

function NavLinks({ role }: { role: Profile["role"] }) {
  const pathname = usePathname()
  const items =
    role === "admin"
      ? [
          ...navItems.slice(0, 4),
          {
            href: "/admin/login-requests",
            label: "로그인 요청",
            icon: ShieldCheck,
          },
          navItems[4],
        ]
      : navItems

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active && "bg-muted text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppShell({
  profile,
  children,
}: {
  profile: Profile
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card/40 lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BriefcaseBusiness className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{appName}</p>
            <p className="text-xs text-muted-foreground">호텔 마케팅 운영</p>
          </div>
        </div>
        <Separator />
        <div className="flex-1 px-3 py-4">
          <NavLinks role={profile.role} />
        </div>
        <div className="border-t p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback>{initials(profile)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {profile.full_name || "사용자"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {profile.email}
              </p>
            </div>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" className="w-full">
              로그아웃
            </Button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CalendarDays className="size-4" />
          {appName}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="메뉴 열기">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>{appName}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <NavLinks role={profile.role} />
            </div>
            <form action={signOut} className="mt-6">
              <Button type="submit" variant="outline" className="w-full">
                로그아웃
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

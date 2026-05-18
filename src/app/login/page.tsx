import { redirect } from "next/navigation"
import { LogIn } from "lucide-react"

import { signInWithGoogle } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { appName } from "@/lib/constants"
import { getCurrentProfile } from "@/lib/auth"

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const current = await getCurrentProfile()
  const params = await searchParams

  if (current?.profile.approval_status === "approved") {
    redirect("/dashboard")
  }

  if (current) {
    redirect(`/pending-approval?status=${current.profile.approval_status}`)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{appName}</CardTitle>
          <CardDescription>
            Google 계정으로 로그인해 호텔 마케팅 운영 업무를 관리하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              로그인 처리 중 오류가 발생했습니다. Supabase 환경변수와 Google
              OAuth 설정을 확인하세요.
            </div>
          ) : null}
          <form action={signInWithGoogle}>
            <Button type="submit" className="w-full">
              <LogIn className="size-4" />
              Google로 로그인
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

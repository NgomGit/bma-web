import { redirect } from "next/navigation";
import { isSignedIn } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  if (await isSignedIn()) redirect("/admin");
  const { suite } = await searchParams;
  return <div className="wrap py-16">
    <LoginForm next={suite ?? "/admin"} />
  </div>;
}

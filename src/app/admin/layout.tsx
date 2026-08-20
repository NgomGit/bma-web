export const metadata = { title: "Back-office", robots: { index: false, follow: false } };

/** Coquille minimale — la garde d'authentification vit dans (dashboard)/layout.tsx
 *  pour que /admin/login reste accessible sans session. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "100svh", background: "var(--bg)" }}>{children}</div>;
}

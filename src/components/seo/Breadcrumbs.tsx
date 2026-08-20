import Link from "next/link";

/** Fil d'Ariane visible — c'est ce qui rend le balisage BreadcrumbList légitime */
export function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-[12.5px] mb-5" style={{ color: "var(--ink-3)" }}>
      <ol className="flex flex-wrap items-center gap-1.5 list-none p-0 m-0">
        {trail.map((t, i) => (
          <li key={t.path} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {i === trail.length - 1 ? (
              <span style={{ color: "var(--ink-2)" }}>{t.name}</span>
            ) : (
              <Link href={t.path} className="hover:underline" style={{ color: "var(--brand)" }}>
                {t.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

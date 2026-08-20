import Link from "next/link";
import { VehicleList } from "@/components/admin/VehicleList";
import { getVehicles } from "@/lib/store";

export const dynamic = "force-dynamic";

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="p-5" style={{ background: "var(--surf)" }}>
      <b className="block text-[30px] font-bold tracking-[-.04em] tnum" style={{ color: "var(--brand)" }}>{n}</b>
      <span className="block mt-1 text-[12px]" style={{ color: "var(--ink-2)" }}>{label}</span>
    </div>
  );
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ enregistre?: string; supprime?: string }>;
}) {
  const [vehicles, sp] = await Promise.all([getVehicles(), searchParams]);
  const featured = vehicles.filter((v) => v.featured).length;
  const noPhoto = vehicles.filter((v) => !v.photos?.length).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-medium tracking-[.2em] uppercase" style={{ color: "var(--brand)" }}>
            Parc automobile
          </span>
          <h1 className="text-[28px] tracking-[-.035em] mt-1">
            {vehicles.length} véhicule{vehicles.length > 1 ? "s" : ""}
          </h1>
        </div>
        <Link href="/admin/vehicules/nouveau" className="btn btn--primary btn--sm">+ Ajouter un véhicule</Link>
      </div>

      {sp.enregistre && (
        <p className="rounded-[10px] px-4 py-3 mb-5 text-[13.5px]"
           style={{ background: "rgba(47,187,116,.1)", color: "#2FBB74" }}>
          Enregistré. Le site public est déjà à jour.
        </p>
      )}
      {sp.supprime && (
        <p className="rounded-[10px] px-4 py-3 mb-5 text-[13.5px]"
           style={{ background: "rgba(229,72,77,.08)", color: "#E5484D" }}>
          Véhicule supprimé.
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-[var(--r2)] overflow-hidden border mb-7"
           style={{ background: "var(--line)", borderColor: "var(--line)" }}>
        <Stat n={featured} label="mis en avant" />
        <Stat n={noPhoto} label="sans photo" />
      </div>

      {noPhoto > 0 && (
        <p className="rounded-[10px] border px-4 py-3 mb-6 text-[13px]"
           style={{ borderColor: "var(--line-2)", background: "var(--surf-2)", color: "var(--ink-2)" }}>
          <b style={{ color: "var(--ink)", fontWeight: 500 }}>{noPhoto} véhicule{noPhoto > 1 ? "s" : ""} sans photo.</b>{" "}
          La silhouette vectorielle prend le relais, mais une vraie photo change tout sur ce segment de prix.
        </p>
      )}

      <VehicleList vehicles={vehicles} />
    </>
  );
}

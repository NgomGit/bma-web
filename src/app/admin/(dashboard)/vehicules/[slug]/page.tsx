import Link from "next/link";
import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { getVehicle } from "@/lib/store";
import { deleteVehicle } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getVehicle(slug);
  if (!vehicle) notFound();

  return (
    <>
      <Link href="/admin" className="text-[13px]" style={{ color: "var(--brand)" }}>← Retour au parc</Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mt-3 mb-7">
        <div>
          <span className="text-[11px] font-medium tracking-[.2em] uppercase" style={{ color: "var(--brand)" }}>
            {vehicle.brand}
          </span>
          <h1 className="text-[28px] tracking-[-.035em] mt-1">{vehicle.model}</h1>
        </div>
        <div className="flex gap-2.5">
          <Link href={`/vehicules/${vehicle.slug}`} target="_blank" className="btn btn--ghost btn--sm">
            Voir la fiche ↗
          </Link>
          <form action={deleteVehicle}>
            <input type="hidden" name="slug" value={vehicle.slug} />
            <button type="submit" className="btn btn--sm"
                    style={{ border: "1px solid #E5484D", color: "#E5484D" }}>
              Supprimer
            </button>
          </form>
        </div>
      </div>
      <VehicleForm vehicle={vehicle} />
    </>
  );
}

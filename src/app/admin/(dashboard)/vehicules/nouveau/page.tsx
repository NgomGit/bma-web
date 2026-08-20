import Link from "next/link";
import { VehicleForm } from "@/components/admin/VehicleForm";

export const dynamic = "force-dynamic";

export default function NewVehiclePage() {
  return (
    <>
      <Link href="/admin" className="text-[13px]" style={{ color: "var(--brand)" }}>← Retour au parc</Link>
      <h1 className="text-[28px] tracking-[-.035em] mt-3 mb-7">Nouveau véhicule</h1>
      <VehicleForm />
    </>
  );
}

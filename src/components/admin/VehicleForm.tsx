"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveVehicle, uploadPhoto, type FormState } from "@/app/admin/actions";
import { Silhouette } from "@/components/vehicle/VehicleVisual";
import type { BodyType, Vehicle } from "@/data/vehicles";

const BODIES: { value: BodyType; label: string }[] = [
  { value: "suv", label: "SUV & 4×4" },
  { value: "pickup", label: "Pick-up" },
  { value: "berline", label: "Berline" },
  { value: "crossover", label: "Crossover" },
];

function Field({
  label, name, defaultValue, placeholder, type = "text", required, hint, ...rest
}: {
  label: string; name: string; defaultValue?: string | number; placeholder?: string;
  type?: string; required?: boolean; hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium tracking-[.1em] uppercase mb-1.5" style={{ color: "var(--ink-3)" }}>
        {label} {required && <em className="not-italic" style={{ color: "var(--brand)" }}>*</em>}
      </span>
      <input
        name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required}
        className="w-full rounded-[10px] border px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:border-[var(--brand)]"
        style={{ background: "var(--surf-2)", borderColor: "var(--line-2)", color: "var(--ink)" }}
        {...rest}
      />
      {hint && <span className="block text-[11px] mt-1" style={{ color: "var(--ink-3)" }}>{hint}</span>}
    </label>
  );
}

function Area({ label, name, defaultValue, rows = 5, hint }: {
  label: string; name: string; defaultValue?: string; rows?: number; hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium tracking-[.1em] uppercase mb-1.5" style={{ color: "var(--ink-3)" }}>
        {label}
      </span>
      <textarea
        name={name} rows={rows} defaultValue={defaultValue}
        className="w-full rounded-[10px] border px-3.5 py-2.5 text-[14px] leading-[1.6] outline-none transition-colors focus:border-[var(--brand)] resize-y"
        style={{ background: "var(--surf-2)", borderColor: "var(--line-2)", color: "var(--ink)" }}
      />
      {hint && <span className="block text-[11px] mt-1" style={{ color: "var(--ink-3)" }}>{hint}</span>}
    </label>
  );
}

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn--primary" style={{ opacity: pending ? 0.6 : 1 }}>
      {pending ? "Enregistrement…" : children}
    </button>
  );
}

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const [state, action] = useActionState<FormState, FormData>(saveVehicle, {});
  const [body, setBody] = useState<BodyType>(vehicle?.body ?? "suv");
  const isNew = !vehicle;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <form action={action} className="grid gap-6">
        {vehicle && <input type="hidden" name="slug" value={vehicle.slug} />}

        {state.error && (
          <p className="rounded-[10px] border px-4 py-3 text-[13.5px]"
             style={{ borderColor: "#E5484D", background: "rgba(229,72,77,.08)", color: "#E5484D" }}>
            {state.error}
          </p>
        )}

        <fieldset className="card p-5 grid gap-4 hover:!translate-y-0 hover:!shadow-[var(--sh-s)]">
          <legend className="px-2 text-[11px] font-medium tracking-[.16em] uppercase" style={{ color: "var(--brand)" }}>
            Identité
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Marque" name="brand" required defaultValue={vehicle?.brand} placeholder="Toyota" />
            <Field label="Modèle" name="model" required defaultValue={vehicle?.model} placeholder="Land Cruiser Prado TXL" />
            <Field label="Année" name="year" type="number" required min={1980} max={2100} defaultValue={vehicle?.year ?? new Date().getFullYear()} />
            <label className="block">
              <span className="block text-[11px] font-medium tracking-[.1em] uppercase mb-1.5" style={{ color: "var(--ink-3)" }}>
                Carrosserie
              </span>
              <select
                name="body" value={body} onChange={(e) => setBody(e.target.value as BodyType)}
                className="w-full rounded-[10px] border px-3.5 py-2.5 text-[14px] outline-none focus:border-[var(--brand)]"
                style={{ background: "var(--surf-2)", borderColor: "var(--line-2)", color: "var(--ink)" }}
              >
                {BODIES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </label>
          </div>
          {vehicle && (
            <p className="text-[11.5px]" style={{ color: "var(--ink-3)" }}>
              Adresse publique : <code>/vehicules/{vehicle.slug}</code> — figée pour ne pas casser les liens déjà partagés.
            </p>
          )}
        </fieldset>

        <fieldset className="card p-5 grid gap-4 hover:!translate-y-0 hover:!shadow-[var(--sh-s)]">
          <legend className="px-2 text-[11px] font-medium tracking-[.16em] uppercase" style={{ color: "var(--brand)" }}>
            Fiche technique
          </legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Kilométrage" name="mileage" defaultValue={vehicle?.mileage} placeholder="86 000 km" />
            <Field label="Boîte" name="gearbox" defaultValue={vehicle?.gearbox} placeholder="Automatique" />
            <Field label="Carburant" name="fuel" defaultValue={vehicle?.fuel} placeholder="Diesel" />
            <Field label="Motorisation" name="engine" defaultValue={vehicle?.engine} placeholder="2.8 D-4D" />
            <Field label="Puissance" name="power" defaultValue={vehicle?.power} placeholder="177 ch" />
            <Field label="Places" name="seats" type="number" min={2} max={9} defaultValue={vehicle?.seats ?? 5} />
            <Field label="Couleur" name="color" defaultValue={vehicle?.color} placeholder="Noir métallisé" />
            <Field label="Transmission" name="drivetrain" defaultValue={vehicle?.drivetrain} placeholder="4×4 permanent" />
            <Field label="Type de caisse" name="bodywork" defaultValue={vehicle?.bodywork} placeholder="SUV 5 portes" />
          </div>
        </fieldset>

        <fieldset className="card p-5 grid gap-4 hover:!translate-y-0 hover:!shadow-[var(--sh-s)]">
          <legend className="px-2 text-[11px] font-medium tracking-[.16em] uppercase" style={{ color: "var(--brand)" }}>
            Provenance
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Provenance" name="origin" defaultValue={vehicle?.origin} placeholder="Importé du Japon" />
            <Field
              label="Prix en FCFA"
              name="price"
              type="number"
              defaultValue={vehicle?.price ? String(vehicle.price) : ""}
              placeholder="28500000"
              hint="Chiffres uniquement, sans espaces. Laisser vide affiche « Prix sur demande »."
            />
          </div>
          <label className="flex items-center gap-3 text-[14px] cursor-pointer">
            <input type="checkbox" name="featured" defaultChecked={vehicle?.featured} className="w-4 h-4 accent-[var(--brand)]" />
            Mettre en avant — apparaît dans le carrousel d&apos;accueil et le rail « Sélection »
          </label>
        </fieldset>

        <fieldset className="card p-5 grid gap-4 hover:!translate-y-0 hover:!shadow-[var(--sh-s)]">
          <legend className="px-2 text-[11px] font-medium tracking-[.16em] uppercase" style={{ color: "var(--brand)" }}>
            Contenu
          </legend>
          <Area label="Équipements" name="equipment" rows={8} hint="Un équipement par ligne."
                defaultValue={vehicle?.equipment.join("\n")} />
          <Area label="Le mot de BMA" name="note" rows={4}
                hint="Votre commentaire personnel sur ce véhicule — c'est ce qui crée la confiance."
                defaultValue={vehicle?.note} />
          <Area label="Teintes proposées" name="swatches" rows={4}
                hint="Un code couleur par ligne (ex. #8AD6FF). Laisser vide pour les teintes par défaut."
                defaultValue={vehicle?.swatches.join("\n")} />
          <Area label="Photos" name="photos" rows={4}
                hint="Un chemin par ligne. Utilisez le bloc « Photos » à droite pour les téléverser."
                defaultValue={vehicle?.photos?.join("\n")} />
        </fieldset>

        <div className="flex flex-wrap gap-3 items-center">
          <Submit>{isNew ? "Créer le véhicule" : "Enregistrer les modifications"}</Submit>
          <Link href="/admin" className="btn btn--ghost">Annuler</Link>
        </div>
      </form>

      <aside className="grid gap-4 lg:sticky lg:top-24">
        {/* L'aperçu doit montrer ce que le visiteur verra : la photo de
            couverture dès qu'il y en a une, la silhouette sinon. Il affichait
            toujours la silhouette, ce qui laissait croire que les photos
            n'étaient pas prises en compte. */}
        <div className="card overflow-hidden hover:!translate-y-0 hover:!shadow-[var(--sh-s)]">
          <div className="stage relative aspect-[16/10] grid place-items-center p-4">
            {vehicle?.photos?.length ? (
              <Image
                src={vehicle.photos[0]}
                alt={`Couverture de ${vehicle.brand} ${vehicle.model}`}
                fill
                sizes="360px"
                className="object-cover z-[2]"
              />
            ) : (
              <Silhouette body={body} className="w-full relative z-[2]" />
            )}
          </div>
          <p className="p-4 text-[12px]" style={{ color: "var(--ink-3)" }}>
            {vehicle?.photos?.length
              ? `Photo de couverture — la première des ${vehicle.photos.length}. Réordonnez ci-dessous pour la changer.`
              : "Aperçu de la silhouette. Elle s'affiche tant qu'aucune photo n'est ajoutée."}
          </p>
        </div>

        {vehicle ? <PhotoBox vehicle={vehicle} /> : (
          <p className="card p-4 text-[12.5px] hover:!translate-y-0" style={{ color: "var(--ink-3)" }}>
            Créez d&apos;abord le véhicule : les photos pourront ensuite être téléversées ici.
          </p>
        )}
      </aside>
    </div>
  );
}

function PhotoBox({ vehicle }: { vehicle: Vehicle }) {
  const [state, action] = useActionState<FormState, FormData>(uploadPhoto, {});
  return (
    <div className="card p-4 grid gap-3 hover:!translate-y-0 hover:!shadow-[var(--sh-s)]">
      <h3 className="text-[11px] font-medium tracking-[.16em] uppercase" style={{ color: "var(--brand)" }}>Photos</h3>

      {vehicle.photos?.length ? (
        <div className="grid grid-cols-3 gap-2">
          {vehicle.photos.map((p) => (
            <span key={p} className="relative block aspect-square rounded-lg overflow-hidden border" style={{ borderColor: "var(--line)" }}>
              <Image src={p} alt="" fill sizes="100px" className="object-cover" />
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[12.5px]" style={{ color: "var(--ink-3)" }}>Aucune photo. La silhouette est utilisée.</p>
      )}

      <form action={action} className="grid gap-2">
        <input type="hidden" name="slug" value={vehicle.slug} />
        <input
          type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif"
          className="text-[12.5px] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand)] file:px-3.5 file:py-2 file:text-white file:text-[12px] file:cursor-pointer"
        />
        <button type="submit" className="btn btn--ghost btn--sm justify-self-start" style={{ minHeight: 40 }}>
          Téléverser
        </button>
        {state.error && <span className="text-[12px]" style={{ color: "#E5484D" }}>{state.error}</span>}
        {state.ok && <span className="text-[12px]" style={{ color: "#2FBB74" }}>Ajoutée — pensez à enregistrer.</span>}
      </form>
      <p className="text-[11px]" style={{ color: "var(--ink-3)" }}>
        JPG, PNG, WebP ou AVIF · 8 Mo max · format 16/9 recommandé.
      </p>
    </div>
  );
}

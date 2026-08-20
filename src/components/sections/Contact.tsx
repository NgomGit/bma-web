import { Seal } from "@/components/brand/Seal";
import { Reveal } from "@/components/ui/Reveal";
import { Clock, Phone, Pin, WhatsApp } from "@/components/ui/icons";
import { site, waGeneral } from "@/lib/site";

const Line = ({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) => (
  <div className="flex gap-4 py-4.5 border-t first:border-t-0" style={{ borderColor: "var(--line)", paddingBlock: 18 }}>
    <span
      className="w-11 h-11 rounded-[14px] shrink-0 grid place-items-center border text-[18px]"
      style={{ background: "var(--surf-3)", borderColor: "var(--line)", color: "var(--brand)" }}
    >
      {icon}
    </span>
    <span>
      <span className="block text-[10px] tracking-[.16em] uppercase" style={{ color: "var(--ink-3)" }}>{label}</span>
      <b className="block mt-1 text-[16px] font-medium">{value}</b>
      <p className="text-[13px] mt-0.5" style={{ color: "var(--ink-2)" }}>{note}</p>
    </span>
  </div>
);

export function Contact() {
  return (
    <section className="section pt-0" id="contact">
      <div className="wrap">
        <Reveal className="mb-9">
          <span className="kicker">05 — Contact</span>
          <h2 className="h2 mt-4">Passez au showroom,<br />ou appelez</h2>
          <p className="lead mt-3.5">
            Ouvert six jours sur sept. Un appel avant votre visite nous permet de préparer le véhicule qui vous
            intéresse.
          </p>
        </Reveal>

        <div className="grid gap-4.5 lg:grid-cols-[1.05fr_.95fr]" style={{ gap: 22 }}>
          <Reveal className="rounded-[var(--r4)] border p-7 md:p-9" >
            <div style={{ background: "var(--surf)", boxShadow: "var(--sh-m)", borderRadius: "var(--r4)", padding: 30 }}>
              <Line icon={<Phone />} label="Téléphone" value={site.phoneDisplay} note="Du lundi au samedi, 8h30 – 19h30" />
              <Line icon={<WhatsApp />} label="WhatsApp" value={site.phoneDisplay} note="Photos, questions, demandes d'import" />
              <Line icon={<Pin />} label="Showroom" value={`${site.address.city}, ${site.address.countryName}`} note={site.address.street} />
              <Line icon={<Clock />} label="Horaires" value={site.hours} note={site.hoursNote} />
              <div className="grid grid-cols-2 gap-2.5 mt-6">
                <a href={`tel:${site.phone}`} className="btn btn--primary"><Phone /> Appeler</a>
                <a href={waGeneral()} target="_blank" rel="noopener" className="btn btn--wa"><WhatsApp /> WhatsApp</a>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div
              className="stage grid place-items-center content-center text-center rounded-[var(--r4)] border h-full"
              style={{ borderColor: "var(--line)", boxShadow: "var(--sh-m)", padding: "44px 26px" }}
            >
              <Seal className="w-[158px] mb-6" />
              <h3 className="text-[19px] mb-3 tracking-[-.025em]">Maison établie à Dakar</h3>
              <p className="text-[13.5px] max-w-[340px]" style={{ color: "var(--ink-2)" }}>
                Vente de véhicules et commande depuis l&apos;étranger. Chaque dossier est suivi par la même personne, du
                premier appel à la remise des clés.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

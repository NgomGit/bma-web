import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow, Clock, Phone, Pin, WhatsApp } from "@/components/ui/icons";
import { site, waGeneral } from "@/lib/site";

/**
 * Contact — la localisation d'abord, en photo.
 *
 * Un concessionnaire se visite. Le visiteur qui arrive ici a déjà vu les
 * voitures : sa question n'est plus « quoi » mais « où » et « à quoi ça
 * ressemble quand j'arrive ». Sur une route de sable à Cambérène, sans numéro
 * de rue, reconnaître le bâtiment bleu vaut mieux qu'une ligne d'adresse.
 *
 * Photo, adresse et itinéraire vivent donc dans une seule carte, dans cet
 * ordre : voilà l'endroit, voilà comment y aller. Les séparer en trois blocs
 * obligerait à recomposer mentalement ce qui est une seule information.
 */
export function Contact() {
  return (
    <section className="section pt-0" id="contact">
      <div className="wrap">
        <Reveal className="mb-9">
          <span className="kicker">04 — Nous trouver</span>
          <h2 className="h2 mt-4">
            Passez au showroom,
            <br />
            ou appelez
          </h2>
          <p className="lead mt-3.5">
            Ouvert six jours sur sept. Un appel avant votre visite nous permet de préparer le véhicule
            qui vous intéresse.
          </p>
        </Reveal>

        {/* -------------------------------------------- le lieu, en un bloc */}
        <Reveal className="mb-[18px]">
          <div
            className="rounded-[var(--r4)] border overflow-hidden grid lg:grid-cols-[1.32fr_1fr]"
            style={{ background: "var(--surf)", borderColor: "var(--line)", boxShadow: "var(--sh-m)" }}
          >
            {/* La photo est côte à côte sur grand écran : en bandeau pleine
                largeur, son ratio 21:9 faisait 560 px de haut et repoussait
                l'adresse — l'essentiel — sous la ligne de flottaison. */}
            <div className="relative min-h-[210px] sm:min-h-[280px] lg:min-h-[318px]">
              <Image
                src="/showroom.jpg"
                alt="Le showroom Baye Mor Automobile à Cambérène, Dakar : bâtiment à façade bleue portant l'enseigne BMA, véhicules alignés devant l'entrée"
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-2/5 pointer-events-none"
                style={{ background: "linear-gradient(180deg, transparent, rgba(3,10,22,.8))" }}
                aria-hidden
              />
              <span
                className="absolute left-4 bottom-4 sm:left-5 sm:bottom-5 flex items-center gap-2 text-[12.5px] font-medium"
                style={{ color: "#fff", textShadow: "0 1px 12px rgba(0,0,0,.5)" }}
              >
                <span className="w-3.5 h-3.5" aria-hidden>
                  <Pin />
                </span>
                Notre showroom · {site.address.city}
              </span>
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-center">
              <span className="block text-[10px] tracking-[.16em] uppercase" style={{ color: "var(--ink-3)" }}>
                Adresse
              </span>
              <p className="text-[17px] font-medium mt-1.5 mb-0 leading-snug">{site.address.street}</p>
              <p className="text-[14px] mt-0.5 mb-0" style={{ color: "var(--ink-2)" }}>
                {site.address.city}, {site.address.countryName}
              </p>

              <p
                className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] mt-3.5 mb-0"
                style={{ color: "var(--ink-2)" }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} aria-hidden>
                    <Clock />
                  </span>
                  {site.hours}
                </span>
                <span aria-hidden style={{ color: "var(--line-2)" }}>
                  ·
                </span>
                <a
                  href={site.maps}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1"
                  style={{ color: "var(--brand)" }}
                >
                  <Star /> {site.rating.score} sur Google ({site.rating.count} avis)
                </a>
              </p>

              <div className="grid gap-2.5 sm:grid-cols-2 mt-6">
                <a href={site.directions} target="_blank" rel="noopener" className="btn btn--primary">
                  <Route /> Itinéraire
                </a>
                <a href={site.maps} target="_blank" rel="noopener" className="btn btn--ghost">
                  Voir sur Maps <Arrow className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ---------------------------------------------------- nous joindre */}
        <div className="grid gap-[18px] md:grid-cols-2">
          <Reveal>
            <a href={`tel:${site.phone}`} className="card flex items-center gap-4 p-6 h-full" style={{ background: "var(--surf)" }}>
              <span
                className="w-12 h-12 rounded-[15px] shrink-0 grid place-items-center border text-[19px]"
                style={{ background: "var(--surf-3)", borderColor: "var(--line)", color: "var(--brand)" }}
                aria-hidden
              >
                <Phone />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] tracking-[.16em] uppercase" style={{ color: "var(--ink-3)" }}>
                  Téléphone
                </span>
                <b className="block text-[17px] font-medium mt-1 tnum">{site.phoneDisplay}</b>
                <span className="block text-[13px] mt-0.5" style={{ color: "var(--ink-2)" }}>
                  Du lundi au samedi
                </span>
              </span>
            </a>
          </Reveal>

          <Reveal>
            <a
              href={waGeneral()}
              target="_blank"
              rel="noopener"
              className="card flex items-center gap-4 p-6 h-full"
              style={{ background: "var(--surf)" }}
            >
              <span
                className="w-12 h-12 rounded-[15px] shrink-0 grid place-items-center border text-[19px]"
                style={{ background: "rgba(37,211,102,.14)", borderColor: "rgba(37,211,102,.32)", color: "#25d366" }}
                aria-hidden
              >
                <WhatsApp />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] tracking-[.16em] uppercase" style={{ color: "var(--ink-3)" }}>
                  WhatsApp
                </span>
                <b className="block text-[17px] font-medium mt-1 tnum">{site.phoneDisplay}</b>
                <span className="block text-[13px] mt-0.5" style={{ color: "var(--ink-2)" }}>
                  Photos, questions, demandes d&apos;import
                </span>
              </span>
            </a>
          </Reveal>
        </div>

        <p className="text-[13px] mt-5" style={{ color: "var(--ink-3)" }}>
          {site.hoursNote}.
        </p>
      </div>
    </section>
  );
}

function Route() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 11l18-8-8 18-2-8-8-2z" />
    </svg>
  );
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden>
      <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z" />
    </svg>
  );
}

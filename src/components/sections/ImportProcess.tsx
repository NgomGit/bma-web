"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { Phone, WhatsApp } from "@/components/ui/icons";
import { site, waImport } from "@/lib/site";

const STEPS = [
  { n: 1, t: "Vous décrivez", d: "Marque, modèle, année, boîte, budget. Un appel ou un message WhatsApp suffit." },
  { n: 2, t: "Nous cherchons", d: "Vous recevez les véhicules trouvés avec photos, kilométrage réel et historique complet." },
  { n: 3, t: "Vous validez", d: "Vous choisissez. Acompte et montant final fixés ensemble, sans surprise en cours de route." },
  { n: 4, t: "Nous livrons", d: "Transport, dédouanement, immatriculation. Vous récupérez le véhicule prêt à rouler." },
];

/** Parcours d'import — la ligne de liaison se remplit à l'entrée à l'écran */
export function ImportProcess() {
  return (
    <section className="section border-y" id="import" style={{ background: "var(--bg-2)", borderColor: "var(--line)" }}>
      <div className="wrap">
        <Reveal className="mb-9">
          <span className="kicker">03 — Sur commande</span>
          <h2 className="h2 mt-4">
            Importé pour vous,
            <br />
            du choix aux plaques
          </h2>
          <p className="lead mt-3.5">
            Vous décrivez le véhicule. Nous le trouvons à l&apos;étranger, vous envoyons photos et rapport avant achat,
            puis gérons transport, dédouanement et immatriculation jusqu&apos;à Dakar.
          </p>
        </Reveal>

        <div className="relative grid gap-3.5 lg:grid-cols-4 lg:gap-4.5">
          <div className="hidden lg:block absolute left-[6%] right-[6%] top-[38px] h-px" style={{ background: "var(--line)" }} />
          <motion.div
            className="hidden lg:block absolute left-[6%] top-[38px] h-px origin-left"
            style={{ background: "var(--brand)", width: "88%" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.19, 0.72, 0.3, 1] }}
          />
          {STEPS.map((s, i) => (
            <motion.article
              key={s.n}
              className="card relative p-6 px-5.5"
              style={{ padding: "26px 22px" }}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.75, delay: i * 0.09, ease: [0.19, 0.72, 0.3, 1] }}
            >
              <span
                className="w-[38px] h-[38px] rounded-full grid place-items-center font-bold text-[14px] mb-4 text-white"
                style={{ background: "var(--brand)", boxShadow: "var(--glow)" }}
              >
                {s.n}
              </span>
              <h3 className="text-[17px] mb-2.5 tracking-[-.025em]">{s.t}</h3>
              <p className="text-[13.5px]" style={{ color: "var(--ink-2)" }}>{s.d}</p>
            </motion.article>
          ))}
        </div>

        <Reveal className="mt-8 flex flex-wrap gap-3">
          <a href={waImport()} target="_blank" rel="noopener" className="btn btn--wa">
            <WhatsApp /> Décrire mon véhicule
          </a>
          <a href={`tel:${site.phone}`} className="btn btn--ghost">
            <Phone /> En parler au téléphone
          </a>
        </Reveal>
      </div>
    </section>
  );
}

import { Hero } from "@/components/sections/Hero";
import { Selection } from "@/components/sections/Selection";
import { Fleet } from "@/components/sections/Fleet";
import { ImportProcess } from "@/components/sections/ImportProcess";
import { Numbers } from "@/components/sections/Numbers";
import { Guarantees } from "@/components/sections/Guarantees";
import { Reviews } from "@/components/sections/Reviews";
import { Faq } from "@/components/sections/Faq";
import { faqItems } from "@/data/faq";
import { Contact } from "@/components/sections/Contact";
import { site } from "@/lib/site";

/** Données structurées : concessionnaire + FAQ — lisibles par Google */
function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AutoDealer",
        "@id": `${site.url}#dealer`,
        name: `${site.name} — ${site.legalName}`,
        url: site.url,
        telephone: site.phone,
        priceRange: "$$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          addressLocality: site.address.city,
          addressCountry: site.address.country,
        },
        openingHours: "Mo-Sa 08:30-19:30",
        areaServed: "Sénégal",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function Home() {
  return (
    <>
      <JsonLd />
      <Hero />
      <Selection />
      <Fleet />
      <ImportProcess />
      <Numbers />
      <Guarantees />
      <Reviews />
      <Faq />
      <Contact />
    </>
  );
}

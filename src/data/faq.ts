export interface FaqItem { q: string; a: string }

export const faqItems: FaqItem[] = [
  { q: "Pourquoi les prix ne sont-ils pas affichés ?",
    a: "Parce qu'un prix juste dépend de l'état réel du véhicule, de son kilométrage, de son historique et de votre mode de paiement. Nous préférons donner un chiffre honnête de vive voix plutôt qu'un prix d'appel en ligne. Un appel suffit pour l'obtenir." },
  { q: "Puis-je essayer le véhicule avant d'acheter ?",
    a: "Oui, systématiquement. Vous pouvez aussi venir avec votre mécanicien et lui laisser le temps d'inspecter le véhicule sur place." },
  { q: "Combien de temps prend une commande depuis l'étranger ?",
    a: "Comptez en moyenne 45 jours entre la validation de la commande et la remise des clés à Dakar, dédouanement inclus. Le délai exact dépend du pays d'origine et du modèle recherché." },
  { q: "Les papiers sont-ils inclus ?",
    a: "Oui. Carte grise, quitus fiscal et dédouanement sont traités avant la remise du véhicule. Vous repartez avec un dossier complet à votre nom." },
  { q: "Livrez-vous en dehors de Dakar ?",
    a: "Oui, dans tout le Sénégal. Les modalités et le délai sont convenus au moment de la vente." },
  { q: "Reprenez-vous mon ancien véhicule ?",
    a: "C'est possible selon le modèle et son état. Envoyez-nous des photos sur WhatsApp, nous vous disons rapidement ce que nous pouvons en faire." },
];

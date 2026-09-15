import type { Locale } from "./config";

/**
 * UI strings: every piece of interface text that is not editorial content.
 * Editorial content (titles, biographies, article bodies) lives in
 * `src/content/` and is edited through Keystatic; these strings are part of
 * the template's chrome and are edited here.
 *
 * `en` defines the shape; every other locale must provide the same keys, which
 * the `UIStrings` type enforces.
 */
const en = {
  nav: {
    home: "Home",
    artworks: "Artworks",
    artists: "Artists",
    events: "Exhibitions",
    news: "News",
    about: "About",
  },
  menu: {
    open: "Menu",
    close: "Close",
    showreel: "A glimpse inside",
    opensInNewTab: "(opens in a new tab)",
  },
  home: {
    artists: "Artists",
    latestNews: "Latest news",
    readAllNews: "Read all news",
  },
  artists: {
    title: "Artists",
    description:
      "Discover the artists and estates represented by the gallery and explore their practices.",
    tabArtists: "Artists",
    tabEstates: "Estates",
    viewCv: "View CV",
    featuredWorks: "Featured works",
  },
  artworks: {
    title: "Artworks",
    description:
      "Browse the gallery's catalogue of contemporary paintings, sculptures and works on paper.",
    gridView: "Grid view",
    viewingRoom: "Viewing room",
    privateCollection: "Private collection",
    sold: "Sold",
    notForSale: "Not for sale",
    inquire: "Inquire",
    framed: "framed:",
    height: "h",
    width: "w",
    noteTitle: "Note",
    noteText:
      "This artwork is an original piece and has been personally signed by the artist.",
    shippingTitle: "Shipping and packaging",
    shippingText:
      "We ship worldwide with tracking on every order. International shipments may be subject to customs duties or import fees; contact us for details.",
    related: "Related",
    viewArtist: "View artist",
  },
  viewingRoom: {
    title: "Viewing room",
    description:
      "Experience the catalogue in an immersive viewing room and browse the collection in a single scroll.",
  },
  privateCollection: {
    title: "Private collection",
    description:
      "Works held in the gallery's private collection that are not for sale.",
    preloaderFirst: "private",
    preloaderSecond: "collection",
  },
  events: {
    title: "Exhibitions & workshops",
    description:
      "Current, upcoming and past exhibitions, and the workshops the gallery runs.",
    current: "Current",
    upcoming: "Upcoming",
    past: "Past",
    workshops: "Workshops",
    when: "When",
    location: "Location",
    admission: "Admission",
    openingHours: "Opening hours",
  },
  workshop: {
    fullName: "Full name",
    fullNamePlaceholder: "Enter your full name",
    email: "Email address",
    emailPlaceholder: "Enter your email address",
    preferredDate: "Preferred date",
    submit: "Notify me",
    submitting: "Submitting…",
    nameTooShort: "Name must be at least 2 characters",
    invalidEmail: "Invalid email address",
    dateRequired: "Preferred date is required",
    success: "Registration submitted successfully!",
    error: "Failed to submit the form",
  },
  news: {
    title: "News",
    description:
      "Announcements, exhibition openings and stories from the gallery.",
    readMore: "Read more",
  },
  newsletter: {
    heading: "Join our mailing list",
    placeholder: "Share your email with us",
    button: "Subscribe",
    loading: "Loading…",
    invalidEmail: "Invalid email address",
    success: "Successfully subscribed!",
    error: "Failed to submit email",
    terms:
      "By signing up you agree to the Terms of Use and Privacy Policy and to receive electronic communications from the gallery.",
  },
  about: {
    title: "About",
  },
  footer: {
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    craftedBy: "Crafted by",
  },
  notFound: {
    title: "Page not found",
    firstLine: "This is a dead end, but don't worry, art is never truly lost.",
    secondLine: "Let's find our way back to the masterpieces.",
    goBack: "Go back",
  },
};

export type UIStrings = typeof en;

const fr: UIStrings = {
  nav: {
    home: "Accueil",
    artworks: "Œuvres",
    artists: "Artistes",
    events: "Expositions",
    news: "Nouvelles",
    about: "À propos",
  },
  menu: {
    open: "Menu",
    close: "Fermer",
    showreel: "Un aperçu de l'intérieur",
    opensInNewTab: "(s'ouvre dans un nouvel onglet)",
  },
  home: {
    artists: "Artistes",
    latestNews: "Dernières nouvelles",
    readAllNews: "Lire toutes les nouvelles",
  },
  artists: {
    title: "Artistes",
    description:
      "Découvrez les artistes et les successions représentés par la galerie et explorez leurs pratiques.",
    tabArtists: "Artistes",
    tabEstates: "Successions",
    viewCv: "Voir le CV",
    featuredWorks: "Œuvres présentées",
  },
  artworks: {
    title: "Œuvres",
    description:
      "Parcourez le catalogue de peintures, sculptures et œuvres sur papier contemporaines de la galerie.",
    gridView: "Vue en grille",
    viewingRoom: "Salle d'exposition",
    privateCollection: "Collection privée",
    sold: "Vendu",
    notForSale: "Pas à vendre",
    inquire: "Demander",
    framed: "encadré :",
    height: "h",
    width: "l",
    noteTitle: "Remarque",
    noteText:
      "Cette œuvre est un original et a été personnellement signée par l'artiste.",
    shippingTitle: "Expédition et emballage",
    shippingText:
      "Nous expédions dans le monde entier avec un suivi pour chaque commande. Les envois internationaux peuvent être soumis à des droits de douane ou des frais d'importation ; contactez-nous pour plus de détails.",
    related: "Œuvres liées",
    viewArtist: "Voir l'artiste",
  },
  viewingRoom: {
    title: "Salle d'exposition",
    description:
      "Découvrez le catalogue dans une salle d'exposition immersive et parcourez la collection en un seul défilement.",
  },
  privateCollection: {
    title: "Collection privée",
    description:
      "Œuvres conservées dans la collection privée de la galerie et qui ne sont pas à vendre.",
    preloaderFirst: "collection",
    preloaderSecond: "privée",
  },
  events: {
    title: "Expositions & ateliers",
    description:
      "Expositions actuelles, à venir et passées, ainsi que les ateliers organisés par la galerie.",
    current: "Actuellement",
    upcoming: "À venir",
    past: "Passées",
    workshops: "Ateliers",
    when: "Quand",
    location: "Lieu",
    admission: "Entrée",
    openingHours: "Horaires d'ouverture",
  },
  workshop: {
    fullName: "Nom complet",
    fullNamePlaceholder: "Entrez votre nom complet",
    email: "Adresse e-mail",
    emailPlaceholder: "Entrez votre adresse e-mail",
    preferredDate: "Date souhaitée",
    submit: "Me prévenir",
    submitting: "Envoi en cours…",
    nameTooShort: "Le nom doit contenir au moins 2 caractères",
    invalidEmail: "Adresse e-mail invalide",
    dateRequired: "La date souhaitée est requise",
    success: "Inscription envoyée avec succès !",
    error: "Échec de l'envoi du formulaire",
  },
  news: {
    title: "Nouvelles",
    description: "Annonces, vernissages et récits de la galerie.",
    readMore: "Lire la suite",
  },
  newsletter: {
    heading: "Rejoignez notre liste de diffusion",
    placeholder: "Partagez votre e-mail avec nous",
    button: "S'abonner",
    loading: "Chargement…",
    invalidEmail: "Adresse e-mail invalide",
    success: "Inscription réussie !",
    error: "Échec de l'envoi de l'e-mail",
    terms:
      "En vous inscrivant, vous acceptez les Conditions d'utilisation et la Politique de confidentialité et consentez à recevoir des communications électroniques de la galerie.",
  },
  about: {
    title: "À propos",
  },
  footer: {
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialité",
    craftedBy: "Réalisé par",
  },
  notFound: {
    title: "Page introuvable",
    firstLine:
      "Ceci est une impasse, mais ne vous inquiétez pas, l'art n'est jamais vraiment perdu.",
    secondLine: "Retrouvons notre chemin vers les chefs-d'œuvre.",
    goBack: "Retour",
  },
};

const de: UIStrings = {
  nav: {
    home: "Startseite",
    artworks: "Kunstwerke",
    artists: "Künstler",
    events: "Ausstellungen",
    news: "Nachrichten",
    about: "Über uns",
  },
  menu: {
    open: "Menü",
    close: "Schließen",
    showreel: "Ein Blick hinein",
    opensInNewTab: "(öffnet in neuem Tab)",
  },
  home: {
    artists: "Künstler",
    latestNews: "Neueste Nachrichten",
    readAllNews: "Alle Nachrichten lesen",
  },
  artists: {
    title: "Künstler",
    description:
      "Entdecken Sie die von der Galerie vertretenen Künstler und Nachlässe und erkunden Sie ihre Praxis.",
    tabArtists: "Künstler",
    tabEstates: "Nachlässe",
    viewCv: "Lebenslauf ansehen",
    featuredWorks: "Ausgewählte Arbeiten",
  },
  artworks: {
    title: "Kunstwerke",
    description:
      "Durchstöbern Sie den Katalog zeitgenössischer Gemälde, Skulpturen und Arbeiten auf Papier der Galerie.",
    gridView: "Rasteransicht",
    viewingRoom: "Ausstellungsraum",
    privateCollection: "Private Sammlung",
    sold: "Verkauft",
    notForSale: "Unverkäuflich",
    inquire: "Anfragen",
    framed: "gerahmt:",
    height: "H",
    width: "B",
    noteTitle: "Hinweis",
    noteText:
      "Dieses Kunstwerk ist ein Originalstück und wurde persönlich vom Künstler signiert.",
    shippingTitle: "Versand und Verpackung",
    shippingText:
      "Wir versenden weltweit mit Sendungsverfolgung für jede Bestellung. Internationale Sendungen können Zollgebühren oder Einfuhrabgaben unterliegen; kontaktieren Sie uns für Details.",
    related: "Verwandte Werke",
    viewArtist: "Künstler ansehen",
  },
  viewingRoom: {
    title: "Ausstellungsraum",
    description:
      "Erleben Sie den Katalog in einem immersiven Ausstellungsraum und durchblättern Sie die Sammlung in einem einzigen Scroll.",
  },
  privateCollection: {
    title: "Private Sammlung",
    description:
      "Werke aus der privaten Sammlung der Galerie, die nicht zum Verkauf stehen.",
    preloaderFirst: "private",
    preloaderSecond: "sammlung",
  },
  events: {
    title: "Ausstellungen & Workshops",
    description:
      "Aktuelle, kommende und vergangene Ausstellungen sowie die Workshops der Galerie.",
    current: "Aktuell",
    upcoming: "Bevorstehend",
    past: "Vergangen",
    workshops: "Workshops",
    when: "Wann",
    location: "Ort",
    admission: "Eintritt",
    openingHours: "Öffnungszeiten",
  },
  workshop: {
    fullName: "Vollständiger Name",
    fullNamePlaceholder: "Geben Sie Ihren vollständigen Namen ein",
    email: "E-Mail-Adresse",
    emailPlaceholder: "Geben Sie Ihre E-Mail-Adresse ein",
    preferredDate: "Wunschtermin",
    submit: "Benachrichtigen",
    submitting: "Wird gesendet…",
    nameTooShort: "Der Name muss mindestens 2 Zeichen lang sein",
    invalidEmail: "Ungültige E-Mail-Adresse",
    dateRequired: "Ein Wunschtermin ist erforderlich",
    success: "Anmeldung erfolgreich gesendet!",
    error: "Das Formular konnte nicht gesendet werden",
  },
  news: {
    title: "Nachrichten",
    description: "Ankündigungen, Vernissagen und Geschichten aus der Galerie.",
    readMore: "Mehr lesen",
  },
  newsletter: {
    heading: "Treten Sie unserer Mailingliste bei",
    placeholder: "Teilen Sie Ihre E-Mail-Adresse mit uns",
    button: "Abonnieren",
    loading: "Wird geladen…",
    invalidEmail: "Ungültige E-Mail-Adresse",
    success: "Erfolgreich abonniert!",
    error: "E-Mail konnte nicht gesendet werden",
    terms:
      "Mit der Anmeldung stimmen Sie den Nutzungsbedingungen und der Datenschutzrichtlinie zu und erhalten elektronische Mitteilungen der Galerie.",
  },
  about: {
    title: "Über uns",
  },
  footer: {
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutzrichtlinie",
    craftedBy: "Gestaltet von",
  },
  notFound: {
    title: "Seite nicht gefunden",
    firstLine:
      "Dies ist eine Sackgasse, aber keine Sorge, Kunst geht niemals wirklich verloren.",
    secondLine: "Finden wir den Weg zurück zu den Meisterwerken.",
    goBack: "Zurück",
  },
};

export const ui: Record<Locale, UIStrings> = { en, fr, de };

/** Get the UI strings for a locale. */
export function useUI(locale: Locale): UIStrings {
  return ui[locale];
}

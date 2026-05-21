import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Globe2 } from "lucide-react";

const originalText = new WeakMap();
const translatedText = new WeakMap();
const TRANSLATED_ATTRIBUTES = ["placeholder", "aria-label", "title"];

const translations = {
  "Workforce Connect": "Workforce Connect",
  "Informal Workforce Connect": "Informal Workforce Connect",
  "Joined by 5,098+ local users": "Rejoint par plus de 5 098 utilisateurs locaux",
  "Find Trusted Pros.": "Trouvez des pros fiables.",
  "Grow Your Business.": "Developpez votre activite.",
  "Search for trusted local services and offer your own skills from one simple account.": "Recherchez des services locaux fiables et proposez vos competences avec un seul compte.",
  "Search services": "Rechercher des services",
  "Offer a service": "Proposer un service",
  "Active Pros": "Pros actifs",
  "Jobs Completed": "Travaux termines",
  "User Rating": "Note utilisateur",
  "Avg. Matching": "Delai moyen",
  "How it works": "Comment ca marche",
  "Simple steps to professional success.": "Des etapes simples vers la reussite professionnelle.",
  "Post a job": "Publier un travail",
  "Describe what you need, from plumbing to tailoring. Set your budget and timeline in minutes.": "Decrivez votre besoin, de la plomberie a la couture. Fixez votre budget et votre delai en quelques minutes.",
  "Match with pros": "Trouvez des pros",
  "Our system connects you with verified local talent matching your specific needs.": "Notre systeme vous connecte a des talents locaux verifies selon vos besoins.",
  "Get it done": "Faites realiser le travail",
  "Hire your favorite pro, track progress, and pay securely through the platform only when the job is finished.": "Engagez votre pro prefere, suivez l'avancement et payez seulement quand le travail est termine.",
  "Project Completed": "Projet termine",
  "Payment Released": "Paiement libere",
  "Verified Talent": "Talents verifies",
  "Every professional on our platform undergoes a rigorous verification process to ensure quality and trust.": "Chaque professionnel de notre plateforme passe par une verification rigoureuse pour garantir qualite et confiance.",
  "View all pros": "Voir tous les pros",
  "Certified Electrician": "Electricien certifie",
  "Master Plumber": "Plombier expert",
  "Fashion Designer & Tailor": "Styliste et tailleur",
  "Available Now": "Disponible maintenant",
  "Ready to grow?": "Pret a grandir ?",
  "Whether you're looking for quality work or looking to offer your skills, Workforce Connect is the place for you.": "Que vous cherchiez un service de qualite ou que vous vouliez proposer vos competences, Workforce Connect est fait pour vous.",
  "Home": "Accueil",
  "Inbox": "Messages",
  "Jobs": "Travaux",
  "My Jobs": "Mes travaux",
  "Profile": "Profil",

  "Create your account": "Creez votre compte",
  "One user account lets you search for services and offer your own skills.": "Un seul compte utilisateur vous permet de rechercher des services et de proposer vos competences.",
  "Create a free account before entering Workforce Connect.": "Creez un compte gratuit avant d'entrer dans Workforce Connect.",
  "Full Name": "Nom complet",
  "Email Address": "Adresse e-mail",
  "Create Password": "Creer un mot de passe",
  "Continue": "Continuer",
  "Already have an account?": "Vous avez deja un compte ?",
  "Log In": "Connexion",
  "Logout": "Deconnexion",
  "Terms of Service": "Conditions d'utilisation",
  "Privacy Policy": "Politique de confidentialite",
  "Support": "Assistance",
  "Safe & Verified Platform": "Plateforme sure et verifiee",
  "Helping local users find services and offer their skills since 2024.": "Nous aidons les utilisateurs locaux a trouver des services et a proposer leurs competences depuis 2024.",
  "Your gateway to reliable work": "Votre passerelle vers un travail fiable",
  "Password": "Mot de passe",
  "Forgot password?": "Mot de passe oublie ?",
  "Remember me": "Se souvenir de moi",
  "OR CONTINUE WITH": "OU CONTINUER AVEC",
  "Google": "Google",
  "WhatsApp": "WhatsApp",
  "New here?": "Nouveau ici ?",
  "Create an account": "Creer un compte",

  "Bastos, Yaounde": "Bastos, Yaounde",
  "All": "Tous",
  "Plumber": "Plombier",
  "Tailor": "Tailleur",
  "Mechanic": "Mecanicien",
  "Painter": "Peintre",
  "Carpenter": "Menuisier",
  "Show only Available Now": "Afficher seulement les disponibles",
  "Post a job request": "Publier une demande",
  "Broadcast your job to nearby available service providers.": "Diffusez votre travail aux prestataires disponibles pres de vous.",
  "Moussa the Plumber": "Moussa le plombier",
  "Master Plumbing & Leak Repair": "Plomberie et reparation de fuites",
  "Custom Tailoring & Fashion": "Couture sur mesure et mode",
  "Electrical Systems & Repair": "Systemes electriques et reparation",
  "View Profile": "Voir le profil",

  "Hello, Moussa": "Bonjour, Moussa",
  "Ready to manage your services?": "Pret a gerer vos services ?",
  "I am available for work": "Je suis disponible",
  "People can now book your services instantly": "Les gens peuvent maintenant reserver vos services instantanement",
  "JOBS DONE": "TRAVAUX FAITS",
  "AVG RATING": "NOTE MOYENNE",
  "Top 5% User": "Top 5 % des utilisateurs",
  "BASTOS LEADERBOARD": "CLASSEMENT BASTOS",
  "Only 4 jobs to reach #1": "Plus que 4 travaux pour etre numero 1",
  "EARNINGS THIS WEEK": "GAINS CETTE SEMAINE",
  "Withdraw": "Retirer",
  "Your Portfolio": "Votre portfolio",
  "Add New": "Ajouter",

  "Add to Portfolio": "Ajouter au portfolio",
  "Create Portfolio Post": "Creer une publication portfolio",
  "What are you posting?": "Que publiez-vous ?",
  "Handwork": "Travail manuel",
  "Job Update": "Actualite de travail",
  "Post Title": "Titre de la publication",
  "Write about the work or training": "Ecrivez sur le travail ou la formation",
  "Your info shown under this post": "Vos informations affichees sous cette publication",
  "Service Provider": "Prestataire",
  "Uploading 2 items...": "Televersement de 2 elements...",

  /* ── Feed / TikTok UI ─────────────────────────────────── */
  "Feed": "Fil",
  "Discover": "Decouvrir",
  "Publish": "Publier",
  "Offers": "Offres",
  "Publish my competence": "Publier ma competence",
  "Comment": "Commenter",
  "Share": "Partager",
  "Follow": "Suivre",
  "Following": "Suivi",
  "Comments": "Commentaires",
  "Add a comment": "Ajouter un commentaire",
  "No comments yet. Be the first!": "Aucun commentaire. Soyez le premier !",

  /* ── Internship / Offer UI ────────────────────────────── */
  "Internship Offers": "Offres de stage",
  "Paid": "Remunere",
  "Transport": "Transport",
  "Unpaid": "Non remunere",
  "Apply": "Postuler",
  "Apply for this offer": "Postuler a cette offre",
  "Closed": "Ferme",
  "Cover letter": "Lettre de motivation",
  "Application sent!": "Candidature envoyee !",
  "My Applications": "Mes candidatures",
  "Pending": "En attente",
  "Under review": "En cours d'examen",
  "Accepted": "Accepte",
  "Rejected": "Refuse",

  /* ── SME Portal ───────────────────────────────────────── */
  "SME Portal": "Portail PME",
  "Active offers": "Offres actives",
  "Total applicants": "Candidats total",
  "Closed offers": "Offres fermees",
  "Publish an internship offer": "Publier une offre de stage",
  "Accept": "Accepter",
  "Decline": "Refuser",
  "Close this offer": "Fermer cette offre",
  "Create your SME profile": "Creer votre profil PME",
  "Company name": "Nom de l'entreprise",
  "Business sector": "Secteur d'activite",
  "Company size": "Taille de l'entreprise",
  "Main city": "Ville principale",
  "Micro (1-9)": "Micro (1-9)",
  "Small (10-49)": "Petite (10-49)",
  "Medium (50-249)": "Moyenne (50-249)",

  /* ── Notifications ────────────────────────────────────── */
  "Notifications": "Notifications",
  "Mark all as read": "Tout marquer comme lu",
  "No notifications yet.": "Aucune notification pour l'instant.",
  "liked your post": "a aime votre publication",
  "commented on your post": "a commente votre publication",
  "is now following you": "vous suit maintenant",
  "applied to your offer": "a postule a votre offre",
  "updated your application": "a mis a jour votre candidature",

  /* ── Role Select ──────────────────────────────────────── */
  "Welcome to Workforce Connect": "Bienvenue sur Workforce Connect",
  "Worker": "Travailleur",
  "Client": "Client",
  "SME / Company": "PME / Entreprise",

  /* ── 16 Cameroonian Trades ────────────────────────────── */
  "Masonry": "Maconnerie",
  "Electricity": "Electricite",
  "Carpentry": "Menuiserie",
  "Sewing": "Couture",
  "Hair styling": "Coiffure",
  "Mechanics": "Mecanique",
  "Welding": "Soudure",
  "Tiling": "Carrelage",
  "Cooking": "Cuisine",
  "IT / Computing": "Informatique",
  "Air conditioning": "Climatisation",
  "Gardening": "Jardinage",
  "Security agent": "Agent de securite",
  "Add Media": "Ajouter un media",
  "Portfolio Feed": "Fil portfolio",
  "Create Post": "Creer une publication",
  "Like": "J'aime",
  "Message": "Message",
  "Photo + video": "Photo + video",
  "Yesterday": "Hier",
  "Just now": "A l'instant",
  "New": "Nouveau",
  "Project Title or Location": "Titre du projet ou lieu",
  "Installation": "Installation",
  "Repair": "Reparation",
  "Maintenance": "Maintenance",
  "Training": "Formation",
  "Emergency": "Urgence",
  "Pro Photo Tips": "Conseils photo pro",
  "Use natural daylight for clear photos.": "Utilisez la lumiere naturelle pour des photos claires.",
  "Show Before and After shots.": "Montrez des photos avant et apres.",
  "Focus on your specific handiwork.": "Mettez en valeur votre travail precis.",
  "Publish to Profile": "Publier sur le profil",

  "STEP 1 OF 3": "ETAPE 1 SUR 3",
  "STEP 2 OF 3": "ETAPE 2 SUR 3",
  "Step 3 of 3": "Etape 3 sur 3",
  "Details": "Details",
  "Location & Budget": "Lieu et budget",
  "Final Step: Visuals": "Derniere etape : visuels",
  "Post a New Job": "Publier un nouveau travail",
  "Describe the task so we can match you with the right pro.": "Decrivez la tache pour que nous trouvions le bon pro.",
  "What service do you need?": "De quel service avez-vous besoin ?",
  "Electrician": "Electricien",
  "Cleaner": "Nettoyeur",
  "Explain the job": "Expliquez le travail",
  "No service found.": "Aucun service trouve.",
  "Be specific about the problem to get better quotes.": "Soyez precis pour obtenir de meilleurs devis.",
  "Add photos or videos": "Ajouter des photos ou videos",
  "Upload clear photos or a short video so providers can understand the job.": "Ajoutez des photos claires ou une courte video pour aider les prestataires a comprendre le travail.",
  "Add photo": "Ajouter photo",
  "Add video": "Ajouter video",
  "Photo": "Photo",
  "Video": "Video",
  "Add": "Ajouter",
  "Next: Schedule & Budget": "Suivant : horaire et budget",
  "Where is the work?": "Ou se trouve le travail ?",
  "Neighborhood or Address": "Quartier ou adresse",
  "Use My Current Location": "Utiliser ma position actuelle",
  "Set Your Budget": "Definir votre budget",
  "Fixed Price": "Prix fixe",
  "Pay a set amount for the total job": "Payez un montant fixe pour tout le travail",
  "Estimated Amount": "Montant estime",
  "Negotiable": "Negociable",
  "Discuss price later": "Discuter du prix plus tard",
  "Cash on Site": "Especes sur place",
  "Pay in person": "Payer en personne",
  "Setting a clear budget helps you find qualified providers faster. Most jobs in your area for Plumbing range from $50 - $150.": "Un budget clair vous aide a trouver plus vite des prestataires qualifies. La plupart des travaux de plomberie dans votre zone vont de 50 $ a 150 $.",
  "Back": "Retour",
  "Next: Visuals": "Suivant : visuels",
  "Show the Work": "Montrez le travail",
  "Adding clear photos of the job site or items helps providers share accurate quotes.": "Des photos claires du lieu ou des objets aident les prestataires a partager des devis precis.",
  "Add Photos or Video": "Ajouter photos ou video",
  "Local Reach": "Portee locale",
  "Your job will be visible to 142 verified providers in": "Votre travail sera visible par 142 prestataires verifies a",
  "Verified users get 30% more responses": "Les utilisateurs verifies recoivent 30 % de reponses en plus",
  "Post Job Now": "Publier maintenant",
  "Save as Draft": "Enregistrer brouillon",
  "A notification was sent to 12 nearby plumbers.": "Une notification a ete envoyee a 12 plombiers proches.",
  "Job Posted Successfully!": "Travail publie avec succes !",
  "Your request has been broadcast to skilled providers in your area.": "Votre demande a ete diffusee aux prestataires qualifies de votre zone.",
  "Expect responses from qualified providers within the next 30 minutes.": "Attendez-vous a des reponses de prestataires qualifies dans les 30 prochaines minutes.",
  "POST SUMMARY": "RESUME",
  "Live": "En ligne",
  "Emergency Pipe Repair": "Reparation urgente de tuyau",
  "Industrial Zone, Block C": "Zone industrielle, Bloc C",
  "Est. Budget: $150 - $200": "Budget estime : 150 $ - 200 $",
  "Plumbing": "Plomberie",
  "Urgent": "Urgent",
  "View My Jobs": "Voir mes travaux",
  "Back to Home": "Retour accueil",

  "Online": "En ligne",
  "Today": "Aujourd'hui",
  "Price Agreed": "Prix accepte",
  "Fixed rate of $85.00 for gasket replacement and labor.": "Tarif fixe de 85,00 $ pour le remplacement du joint et la main-d'oeuvre.",
  "Job Started": "Travail commence",
  "Work officially commenced at 10:40 AM": "Le travail a officiellement commence a 10h40",
  "Kitchen sink leak repair": "Reparation de fuite d'evier de cuisine",
  "Verified provider": "Prestataire verifie",
  "Active": "Actif",
  "Share location": "Partager la position",
  "Send photo": "Envoyer une photo",
  "Confirm price": "Confirmer le prix",
  "Keep job updates, photos, and payment agreement inside this chat.": "Gardez les actualites du travail, les photos et l'accord de paiement dans cette discussion.",
  "Type a message...": "Ecrire un message...",

  "Welcome to Workforce": "Bienvenue sur Workforce",
  "Add your service details and start receiving requests.": "Ajoutez les details de votre service et commencez a recevoir des demandes.",
  "Your Phone Number": "Votre numero de telephone",
  "We'll send a code to verify this number.": "Nous enverrons un code pour verifier ce numero.",
  "Next": "Suivant",
  "Select Your Trade": "Choisissez votre metier",
  "Barber": "Coiffeur",
  "Other": "Autre",
  "Confirm Selection": "Confirmer la selection",
  "Set Location": "Definir le lieu",
  "We use your location to show you jobs in your area.": "Nous utilisons votre position pour afficher les travaux pres de vous.",
  "Use Current Location": "Utiliser ma position",
  "Finish Setup": "Terminer la configuration",

  "How would you like to use the application?": "Comment souhaitez-vous utiliser l'application ?",
  "I offer my skills and services. I publish my work, apply to internships, and get discovered.": "Je propose mes compétences et services. Je publie mon travail, postule aux stages, et me fais découvrir.",
  "I am looking for a service provider or craftsperson. I publish a request and receive offers.": "Je cherche un prestataire ou artisan. Je publie une demande et reçois des offres.",
  "I represent a company. I publish internship offers and recruit local talent.": "Je représente une entreprise. Je publie des offres de stage et recrute des talents locaux.",
  "Loading...": "Chargement…",
  "Discover pros": "Découvrir des pros",
  "Search plumber, seamstress, mason...": "Rechercher plombier, couturière, maçon…",
  "Clear": "Effacer",
  "Service categories": "Catégories de services",
  "Available now": "Disponibles maintenant",
  "Searching...": "Recherche en cours…",
  "No providers found. Try another filter.": "Aucun prestataire trouvé. Essayez un autre filtre.",
  "Available": "Disponible",
  "See profile": "Voir le profil",
  "Electrical": "Electricité",
  "Security officer": "Agent de sécurité",
  "Dashboard": "Tableau de bord",
  "Applications": "Candidatures",
  "Loading offers...": "Chargement des offres…",
  "No offers available right now.": "Aucune offre disponible pour le moment.",
  "Active internship offers": "Offres de stage actives",
  "No active offers.": "Aucune offre active.",
  "Offer details": "Détail de l'offre",
  "My offers": "Mes offres",
  "No offers published. Start by creating one.": "Aucune offre publiée. Commencez par en créer une.",
  "Publish offer": "Publier l'offre",
  "Offer title": "Titre de l'offre",
  "Unread": "Non lu",
  "Discover offers": "Découvrir les offres",
  "You have not applied to any offers yet.": "Vous n'avez encore postulé à aucune offre.",
  "Offer": "Offre",
  "The company will review your file and contact you.": "L'entreprise examinera votre dossier et vous contactera.",
  "View my applications": "Voir mes candidatures",
  "CV (PDF or Word) - optional": "CV (PDF ou Word) - optionnel",
  "Sending...": "Envoi...",
  "Send my application": "Envoyer ma candidature",
  "Sign in to apply.": "Connectez-vous pour postuler.",
  "Applicants": "Candidats",
  "Candidate": "Candidat",
  "Back to feed": "Retour au fil",
  "Send": "Envoyer",
  "Close": "Fermer",
  "Delete": "Supprimer",
  "Refresh": "Rafraîchir",
  "Back to home": "Retour à l'accueil",
  "Access denied": "Accès refusé",
  "You must be signed in as an administrator.": "Vous devez être connecté en tant qu'administrateur.",
  "Your account does not have administrator permissions.": "Votre compte n'a pas les droits administrateur.",
  "Sign in": "Se connecter",
  "Users": "Utilisateurs",
  "Posts": "Posts",
  "Administrator Area": "Espace Administrateur",
  "Admin - Workforce Connect": "Admin - Workforce Connect",
  "Name": "Nom",
  "Role": "Role",
  "Title": "Titre",
  "Category": "Categorie",
  "Views": "Vues",
  "Trade": "Metier",
  "City": "Ville",
  "Status": "Statut",
  "Offer ID": "ID offre",
  "Applicant": "Candidat",
  "Date": "Date",
  "Action": "Action",
  "Actions": "Actions",
  "Definitely delete this post?": "Supprimer ce post definitivement ?",
  "Delete this offer?": "Supprimer cette offre ?",
  "Post deleted": "Post supprime",
  "Offer closed": "Offre fermee",
  "Offer deleted": "Offre supprimee"
};

const placeholderTranslations = {
  "you@example.com": "vous@exemple.com",
  "Minimum 8 characters": "Minimum 8 caracteres",
  "Enter your legal name": "Entrez votre nom legal",
  "Search for plumbers, tailors...": "Rechercher plombiers, tailleurs...",
  "Search your service field...": "Rechercher votre domaine de service...",
  "Explain what you made, repaired, taught, or learned...": "Expliquez ce que vous avez cree, repare, enseigne ou appris...",
  "e.g., Bastos Main Line Repair": "ex. : Reparation conduite principale Bastos",
  "Search neighbourhood...": "Rechercher un quartier...",
  "Or enter your area manually": "Ou entrez votre quartier manuellement",
  "e.g. My kitchen sink is leaking from the main pipe. I need someone to come look at it this afternoon...": "ex. : Mon evier fuit au niveau du tuyau principal. J'ai besoin de quelqu'un cet apres-midi...",
  "Search plumber, seamstress, mason...": "Rechercher plombier, couturiere, macon...",
  "e.g. BTP Akwa SARL": "ex: BTP Akwa SARL",
  "e.g. Heavy masonry internship": "ex: Stage maconnerie gros oeuvre",
  "e.g. 3 months": "ex: 3 mois",
  "e.g. Complete electrical panel repair": "ex: Reparation tableau electrique complet",
  "Explain what you did, repaired, built, or taught...": "Explique ce que tu as fait, repare, construit ou enseigne...",
  "Hello, I am interested in this internship because...": "Bonjour, je suis interesse(e) par ce stage car..."
};

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {}
});

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/…/g, "...")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function createReverseMap(source) {
  return Object.entries(source).reduce((result, [english, french]) => {
    result[normalizeText(french)] = english;
    return result;
  }, {});
}

const reverseTranslations = createReverseMap(translations);
const reversePlaceholderTranslations = createReverseMap(placeholderTranslations);
const attributeTranslations = { ...translations, ...placeholderTranslations };
const reverseAttributeTranslations = createReverseMap(attributeTranslations);

function translateStructuredValue(value, language) {
  const applicantMatch = String(value).match(/^(Candidats|Applicants)\s+[–—-]\s+(.+)$/);
  if (applicantMatch) {
    return language === "fr" ? `Candidats - ${applicantMatch[2]}` : `Applicants - ${applicantMatch[2]}`;
  }

  const statusMatch = String(value).match(/^(Statut|Status)\s*[–—>-]+\s*(.+)$/);
  if (statusMatch) {
    return language === "fr" ? `Statut - ${statusMatch[2]}` : `Status - ${statusMatch[2]}`;
  }

  return null;
}

function translateValue(value, language, sourceMap, reverseMap) {
  const clean = normalizeText(value);
  if (!clean) return value;

  const structuredValue = translateStructuredValue(value, language);
  if (structuredValue) return structuredValue;

  if (language === "fr") {
    const englishSource = reverseMap[clean] || clean;
    return sourceMap[englishSource] || value;
  }

  return reverseMap[clean] || value;
}

function applyTranslatedAttribute(element, attribute, language) {
  const originalKey = `original${attribute.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())}`;
  const translatedKey = `translated${attribute.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())}`;
  const currentValue = element.getAttribute(attribute);
  if (!currentValue) return;

  if (!element.dataset[originalKey]) {
    element.dataset[originalKey] = currentValue;
  } else if (currentValue !== element.dataset[translatedKey] && currentValue !== element.dataset[originalKey]) {
    element.dataset[originalKey] = currentValue;
  }

  const source = element.dataset[originalKey];
  const nextValue = translateValue(source, language, attributeTranslations, reverseAttributeTranslations);
  if (element.getAttribute(attribute) !== nextValue) {
    element.setAttribute(attribute, nextValue);
  }
  element.dataset[translatedKey] = nextValue;
}

function applyLanguage(language) {
  document.documentElement.lang = language === "fr" ? "fr-CM" : "en";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }

      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => {
    if (!originalText.has(node)) {
      originalText.set(node, node.nodeValue);
    } else if (node.nodeValue !== translatedText.get(node) && node.nodeValue !== originalText.get(node)) {
      originalText.set(node, node.nodeValue);
    }

    const source = originalText.get(node);
    const leading = source.match(/^\s*/)?.[0] || "";
    const trailing = source.match(/\s*$/)?.[0] || "";
    const clean = source.trim();
    const nextText = translateValue(clean, language, translations, reverseTranslations);
    const nextValue = `${leading}${nextText}${trailing}`;
    if (node.nodeValue !== nextValue) {
      node.nodeValue = nextValue;
    }
    translatedText.set(node, nextValue);
  });

  const attributeSelector = TRANSLATED_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(",");
  document.querySelectorAll(attributeSelector).forEach((element) => {
    TRANSLATED_ATTRIBUTES.forEach((attribute) => {
      if (element.hasAttribute(attribute)) {
        applyTranslatedAttribute(element, attribute, language);
      }
    });
  });
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");

  const value = useMemo(
    () => ({
      language,
      setLanguage(nextLanguage) {
        setLanguageState(nextLanguage);
      }
    }),
    [language]
  );

  useEffect(() => {
    const run = () => applyLanguage(language);
    run();

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(run);
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: TRANSLATED_ATTRIBUTES,
      childList: true,
      characterData: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const isFrench = language === "fr";

  return (
    <div className="language-toggle" aria-label="Language selector">
      <Globe2 size={17} />
      <div>
        <button
          className={!isFrench ? "active" : ""}
          type="button"
          onClick={() => setLanguage("en")}
        >
          EN
        </button>
        <button
          className={isFrench ? "active" : ""}
          type="button"
          onClick={() => setLanguage("fr")}
        >
          FR
        </button>
      </div>
    </div>
  );
}

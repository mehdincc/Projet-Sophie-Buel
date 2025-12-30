console.log("JS chargé");

/* =====================================================
   1. VÉRIFIER SI L’UTILISATEUR EST CONNECTÉ
===================================================== */

// On récupère le token stocké lors du login
const token = localStorage.getItem("token");

// Si token existe → utilisateur connecté
const isConnected = token !== null;

if (isConnected) {
  console.log("Utilisateur connecté");
} else {
  console.log("Utilisateur NON connecté");
}

/* =====================================================
   2. RÉCUPÉRATION DES ÉLÉMENTS HTML
===================================================== */

// Galerie des projets (page d’accueil)
const gallery = document.querySelector(".gallery");

// Zone des filtres
const filtersDiv = document.querySelector(".filters");

// Lien login / logout (IMPORTANT : id dans le HTML)
const loginLink = document.querySelector("#login-link");

// Bandeau "mode édition"
const editBanner = document.querySelector(".edit-mode");

// Bouton "Modifier" à côté de Mes Projets
const editProjectsLink = document.querySelector(".edit-projects");

/* =====================================================
   3. COMPORTEMENT SI UTILISATEUR CONNECTÉ
===================================================== */

if (isConnected) {
  // Afficher le bandeau mode édition
  if (editBanner) {
    editBanner.style.display = "flex";
  }

  // Afficher le bouton "Modifier"
  if (editProjectsLink) {
    editProjectsLink.style.display = "flex";
  }

  // Cacher les filtres
  if (filtersDiv) {
    filtersDiv.style.display = "none";
  }

  // Transformer login → logout
  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", (event) => {
      event.preventDefault();

      // Suppression des infos de connexion
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      // Redirection vers la page login
      window.location.href = "login.html";
    });
  }
} else {
  // Si pas connecté → cacher le bandeau
  if (editBanner) {
    editBanner.style.display = "none";
  }

  // Cacher le bouton "Modifier"
  if (editProjectsLink) {
    editProjectsLink.style.display = "none";
  }
}

/* =====================================================
   4. FONCTION : AFFICHER LES TRAVAUX
===================================================== */

function afficherTravaux(travaux) {
  if (!gallery) return;

  // On vide la galerie avant d’afficher
  gallery.innerHTML = "";

  travaux.forEach((work) => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

/* =====================================================
   5. FONCTION : BOUTON ACTIF (FILTRES)
===================================================== */

function setActiveButton(buttonClique) {
  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach((btn) => btn.classList.remove("active"));
  buttonClique.classList.add("active");
}

/* =====================================================
   6. PAGE D’ACCUEIL : TRAVAUX + FILTRES
===================================================== */

if (gallery) {
  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((works) => {
      console.log("Travaux reçus :", works);

      // Affichage des projets
      afficherTravaux(works);

      // Si connecté → PAS de filtres
      if (isConnected) return;

      // Sinon → création des filtres
      fetch("http://localhost:5678/api/categories")
        .then((response) => response.json())
        .then((categories) => {
          console.log("Catégories reçues :", categories);

          // Bouton Tous
          const btnTous = document.createElement("button");
          btnTous.textContent = "Tous";
          btnTous.classList.add("active");
          filtersDiv.appendChild(btnTous);

          btnTous.addEventListener("click", () => {
            setActiveButton(btnTous);
            afficherTravaux(works);
          });

          // Boutons catégories
          categories.forEach((category) => {
            const btn = document.createElement("button");
            btn.textContent = category.name;
            filtersDiv.appendChild(btn);

            btn.addEventListener("click", () => {
              setActiveButton(btn);

              const travauxFiltres = works.filter(
                (work) => work.categoryId === category.id
              );

              afficherTravaux(travauxFiltres);
            });
          });
        });
    });
}

/* =====================================================
   7. PAGE LOGIN : AUTHENTIFICATION
===================================================== */

const form = document.querySelector("#login-form");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // empêche le rechargement

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          // Connexion réussie
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);

          window.location.href = "index.html";
        } else {
          document.querySelector("#login-error").textContent =
            "Email ou mot de passe incorrect.";
        }
      })
      .catch(() => {
        document.querySelector("#login-error").textContent = "Erreur serveur.";
      });
  });
}
/* =====================================================
   ÉTAPE 6 — MODALE (OUVRIR / FERMER + CHANGER DE VUE)
   Objectif : 1 seule modale, 2 vues (galerie / formulaire)
===================================================== */

// Bouton "modifier" (à côté de Mes projets)
const editProjectsBtn = document.querySelector(".edit-projects");

// Overlay + boîte modale
const modalOverlay = document.querySelector("#modal-overlay");
const modal = document.querySelector("#modal");

// Boutons de fermeture / navigation
const modalCloseBtn = document.querySelector("#modal-close");
const modalAddBtn = document.querySelector("#modal-add-btn");
const modalBackBtn = document.querySelector("#modal-back");

// Les 2 vues de la modale
const modalGalleryView = document.querySelector("#modal-gallery-view");
const modalFormView = document.querySelector("#modal-form-view");

/* ---------- Fonctions simples ---------- */

// Ouvrir la modale (affiche overlay)
function openModal() {
  // On montre l’overlay (et donc la modale au centre)
  modalOverlay.classList.add("is-open");

  // Par défaut : on arrive sur la vue galerie
  showGalleryView();
}

// Fermer la modale
function closeModal() {
  modalOverlay.classList.remove("is-open");

  // Optionnel : quand on ferme, on revient sur la galerie
  // (comme ça, quand on ré-ouvre, c’est propre)
  showGalleryView();
}

// Afficher la vue galerie / cacher la vue formulaire
function showGalleryView() {
  modalGalleryView.classList.remove("modal-hidden");
  modalFormView.classList.add("modal-hidden");
}

// Afficher la vue formulaire / cacher la vue galerie
function showFormView() {
  modalGalleryView.classList.add("modal-hidden");
  modalFormView.classList.remove("modal-hidden");
}

/* ---------- Événements (clics) ---------- */

// 1) Ouvrir au clic sur "modifier"
if (editProjectsBtn) {
  editProjectsBtn.addEventListener("click", () => {
    openModal();
  });
}

// 2) Fermer au clic sur la croix
if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", () => {
    closeModal();
  });
}

// 3) Fermer au clic sur l’overlay (en dehors de la modale)
if (modalOverlay) {
  modalOverlay.addEventListener("click", (event) => {
    // si on clique sur l’overlay (et pas dans la boîte)
    if (event.target === modalOverlay) {
      closeModal();
    }
  });
}

// 4) Passer à la vue "Ajout photo"
if (modalAddBtn) {
  modalAddBtn.addEventListener("click", () => {
    showFormView();
  });
}

// 5) Revenir à la vue "Galerie"
if (modalBackBtn) {
  modalBackBtn.addEventListener("click", () => {
    showGalleryView();
  });
}
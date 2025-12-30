console.log("JS chargé");

/* =====================================================
   1) VÉRIFIER SI L’UTILISATEUR EST CONNECTÉ
   -> On regarde si un token existe dans localStorage
===================================================== */

const token = localStorage.getItem("token");
const isConnected = token !== null;

if (isConnected) {
  console.log("Utilisateur connecté ✅");
} else {
  console.log("Utilisateur NON connecté ❌");
}

/* =====================================================
   2) RÉCUPÉRATION DES ÉLÉMENTS HTML (peuvent être absents)
===================================================== */

// Page accueil
const gallery = document.querySelector(".gallery");
const filtersDiv = document.querySelector(".filters");

// Header / nav
const loginLink = document.querySelector("#login-link");

// Bandeau "mode édition"
const editBanner = document.querySelector(".edit-mode");

// Bouton "modifier" à côté de "Mes projets"
const editProjectsBtn = document.querySelector(".edit-projects");

/* =====================================================
   3) MODE ÉDITION (UNIQUEMENT SI CONNECTÉ)
   - Afficher bandeau
   - Cacher filtres
   - Login => Logout + déconnexion
   - Afficher "modifier"
===================================================== */

if (isConnected) {
  // 1) Bandeau
  if (editBanner) {
    editBanner.style.display = "flex";
  }

  // 2) Cacher filtres
  if (filtersDiv) {
    filtersDiv.style.display = "none";
  }

  // 3) Afficher le bouton "modifier"
  if (editProjectsBtn) {
    editProjectsBtn.style.display = "flex";
  }

  // 4) Login => Logout
  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", (event) => {
      event.preventDefault();

      // Supprimer token / userId
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      // Retour login
      window.location.href = "login.html";
    });
  }
} else {
  // Si pas connecté : bandeau caché
  if (editBanner) {
    editBanner.style.display = "none";
  }
}

/* =====================================================
   4) FONCTION : AFFICHER LES TRAVAUX
===================================================== */

function afficherTravaux(travaux) {
  if (!gallery) return;

  // On vide la galerie avant de réafficher
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
   5) FONCTION : BOUTON ACTIF (FILTRES)
===================================================== */

function setActiveButton(buttonClique) {
  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach((btn) => btn.classList.remove("active"));
  buttonClique.classList.add("active");
}

/* =====================================================
   6) PAGE ACCUEIL : WORKS + FILTRES
   - Works : toujours
   - Filtres : seulement si pas connecté
===================================================== */

if (gallery) {
  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((works) => {
      console.log("Travaux reçus :", works);

      // Affichage de tous les projets
      afficherTravaux(works);

      // Si connecté => on ne crée pas les filtres
      if (isConnected) return;

      // Sinon => on crée les filtres
      fetch("http://localhost:5678/api/categories")
        .then((response) => response.json())
        .then((categories) => {
          console.log("Catégories reçues :", categories);

          // Bouton "Tous"
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
    })
    .catch((error) => {
      console.log("Erreur fetch works/categories :", error);
    });
}

/* =====================================================
   7) PAGE LOGIN : AUTHENTIFICATION
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
      body: JSON.stringify({ email: email, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          // Connexion OK
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);

          // Retour accueil
          window.location.href = "index.html";
        } else {
          document.querySelector("#login-error").textContent =
            "Email ou mot de passe incorrect.";
        }
      })
      .catch(() => {
        document.querySelector("#login-error").textContent =
          "Erreur serveur. Réessaie.";
      });
  });
}

/* =====================================================
   8) ÉTAPE 6 — MODALE (OUVRIR / FERMER + CHANGER DE VUE)
===================================================== */

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

// Ouvrir la modale
function openModal() {
  if (!modalOverlay) return;

  modalOverlay.classList.add("is-open");

  // Quand on ouvre : on revient toujours sur la galerie
  showGalleryView();
}

// Fermer la modale
function closeModal() {
  if (!modalOverlay) return;

  modalOverlay.classList.remove("is-open");

  // Quand on ferme : on remet la galerie (propre pour la prochaine ouverture)
  showGalleryView();
}

// Afficher galerie / cacher formulaire
function showGalleryView() {
  if (!modalGalleryView || !modalFormView) return;

  modalGalleryView.classList.remove("modal-hidden");
  modalFormView.classList.add("modal-hidden");
}

// Afficher formulaire / cacher galerie
function showFormView() {
  if (!modalGalleryView || !modalFormView) return;

  modalGalleryView.classList.add("modal-hidden");
  modalFormView.classList.remove("modal-hidden");
}

// 1) Ouvrir au clic sur "modifier" (seulement si connecté)
if (isConnected && editProjectsBtn) {
  editProjectsBtn.addEventListener("click", () => {
    console.log("Clic sur modifier => ouverture modale ✅");
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
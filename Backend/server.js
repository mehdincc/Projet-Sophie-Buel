console.log("JS chargé");

/* =====================================================
   1) CONNEXION : on vérifie si un token existe
===================================================== */
const token = localStorage.getItem("token");
const isConnected = token !== null;

/* =====================================================
   2) RÉCUPÉRATION DES ÉLÉMENTS HTML (peuvent être absents)
===================================================== */
const gallery = document.querySelector(".gallery");
const filtersDiv = document.querySelector(".filters");
const loginLink = document.querySelector("#login-link");
const editBanner = document.querySelector(".edit-mode");

// Bouton "modifier" (celui à côté de "Mes projets")
const editProjectsBtn = document.querySelector(".edit-projects");

// Modale + overlay
const modalOverlay = document.querySelector("#modal-overlay");
const modal = document.querySelector("#modal");
const modalCloseBtn = document.querySelector("#modal-close");

// Les 2 vues de la modale
const modalGalleryView = document.querySelector("#modal-gallery-view");
const modalFormView = document.querySelector("#modal-form-view");

// Boutons de navigation dans la modale
const modalAddBtn = document.querySelector("#modal-add-btn");
const modalBackBtn = document.querySelector("#modal-back");

/* =====================================================
   3) MODE CONNECTÉ / DÉCONNECTÉ (étape 5.3)
===================================================== */
if (isConnected) {
  // Afficher bandeau mode édition
  if (editBanner) editBanner.style.display = "flex";

  // Cacher filtres
  if (filtersDiv) filtersDiv.style.display = "none";

  // Afficher le bouton "modifier"
  if (editProjectsBtn) editProjectsBtn.style.display = "flex";

  // login -> logout
  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "login.html";
    });
  }
} else {
  // cacher bandeau si pas connecté
  if (editBanner) editBanner.style.display = "none";

  // cacher modifier si pas connecté
  if (editProjectsBtn) editProjectsBtn.style.display = "none";
}

/* =====================================================
   4) GALERIE D’ACCUEIL (works + filtres si pas connecté)
===================================================== */

// Afficher les travaux
function afficherTravaux(travaux) {
  if (!gallery) return;

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

// Bouton actif (filtres)
function setActiveButton(buttonClique) {
  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach((btn) => btn.classList.remove("active"));
  buttonClique.classList.add("active");
}

// Récupérer les works (si on est bien sur index = gallery existe)
if (gallery) {
  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((works) => {
      afficherTravaux(works);

      // Si connecté : pas de filtres
      if (isConnected) return;

      // Sinon : créer les filtres
      fetch("http://localhost:5678/api/categories")
        .then((response) => response.json())
        .then((categories) => {
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
    })
    .catch((error) => console.log("Erreur works:", error));
}

/* =====================================================
   5) LOGIN (étape 5.2) — seulement sur login.html
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
   6) MODALE (étape 6.1) — ouverture/fermeture + vues
===================================================== */

// Fonctions utilitaires
function openModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.add("is-open");
  showGalleryView(); // à l’ouverture, on revient toujours sur la galerie
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove("is-open");
  showGalleryView(); // reset pour éviter que ça reste sur le formulaire
}

function showGalleryView() {
  if (!modalGalleryView || !modalFormView) return;
  modalGalleryView.classList.remove("modal-hidden");
  modalFormView.classList.add("modal-hidden");
}

function showFormView() {
  if (!modalGalleryView || !modalFormView) return;
  modalGalleryView.classList.add("modal-hidden");
  modalFormView.classList.remove("modal-hidden");
}

// 1) Ouvrir la modale au clic sur "modifier"
if (isConnected && editProjectsBtn) {
  editProjectsBtn.addEventListener("click", () => {
    openModal();
  });
}

// 2) Fermer la modale au clic sur la croix
if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", () => {
    closeModal();
  });
}

// 3) Fermer au clic sur l’overlay (mais pas quand on clique dans la modale)
if (modalOverlay) {
  modalOverlay.addEventListener("click", (event) => {
    // Si on clique exactement sur l’overlay (le fond), on ferme
    if (event.target === modalOverlay) {
      closeModal();
    }
  });
}

// 4) Switch vers le formulaire (Ajouter une photo)
if (modalAddBtn) {
  modalAddBtn.addEventListener("click", () => {
    showFormView();
  });
}

// 5) Retour vers la galerie (flèche)
if (modalBackBtn) {
  modalBackBtn.addEventListener("click", () => {
    showGalleryView();
  });
}
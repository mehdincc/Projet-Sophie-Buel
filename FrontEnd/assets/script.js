console.log("JS chargé");

/* =====================================================
   1) VÉRIFIER SI L’UTILISATEUR EST CONNECTÉ
===================================================== */

// On lit le token (pour savoir si connecté)
const token = localStorage.getItem("token");
const isConnected = token !== null;

console.log(isConnected ? "Utilisateur connecté ✅" : "Utilisateur NON connecté ❌");

/* =====================================================
   2) RÉCUPÉRATION DES ÉLÉMENTS HTML
===================================================== */

// Galerie principale
const gallery = document.querySelector(".gallery");
const filtersDiv = document.querySelector(".filters");

// Header / nav
const loginLink = document.querySelector("#login-link");

// Mode édition
const editBanner = document.querySelector(".edit-mode");
const editProjectsBtn = document.querySelector(".edit-projects");

/* =====================================================
   3) MODE ÉDITION (SI CONNECTÉ)
===================================================== */

if (isConnected) {
  if (editBanner) editBanner.style.display = "flex";
  if (filtersDiv) filtersDiv.style.display = "none";
  if (editProjectsBtn) editProjectsBtn.style.display = "flex";

  if (loginLink) {
    loginLink.textContent = "logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "login.html";
    });
  }
} else {
  if (editBanner) editBanner.style.display = "none";
}

/* =====================================================
   4) AFFICHER LES TRAVAUX (GALERIE PRINCIPALE)
===================================================== */

function afficherTravaux(travaux) {
  if (!gallery) return;

  gallery.innerHTML = "";

  travaux.forEach((work) => {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;

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
   5) FILTRES (UTILISATEUR NON CONNECTÉ)
===================================================== */

function setActiveButton(activeBtn) {
  document.querySelectorAll(".filters button").forEach((btn) =>
    btn.classList.remove("active")
  );
  activeBtn.classList.add("active");
}

/* =====================================================
   6) CHARGEMENT DES WORKS + FILTRES
===================================================== */

let cachedWorks = [];

if (gallery) {
  fetch("http://localhost:5678/api/works")
    .then((res) => res.json())
    .then((works) => {
      cachedWorks = works;
      afficherTravaux(works);

      // Si connecté : pas de filtres
      if (isConnected) return;

      // Sinon : filtres
      fetch("http://localhost:5678/api/categories")
        .then((res) => res.json())
        .then((categories) => {
          const btnTous = document.createElement("button");
          btnTous.textContent = "Tous";
          btnTous.classList.add("active");
          filtersDiv.appendChild(btnTous);

          btnTous.addEventListener("click", () => {
            setActiveButton(btnTous);
            afficherTravaux(works);
          });

          categories.forEach((cat) => {
            const btn = document.createElement("button");
            btn.textContent = cat.name;
            filtersDiv.appendChild(btn);

            btn.addEventListener("click", () => {
              setActiveButton(btn);
              afficherTravaux(works.filter((w) => w.categoryId === cat.id));
            });
          });
        });
    })
    .catch((err) => console.error("Erreur fetch works :", err));
}

/* =====================================================
   7) LOGIN
===================================================== */

const form = document.querySelector("#login-form");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
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
   8) MODALE — OUVERTURE / FERMETURE / NAVIGATION
===================================================== */

const modalOverlay = document.querySelector("#modal-overlay");
const modalCloseBtn = document.querySelector("#modal-close");
const modalAddBtn = document.querySelector("#modal-add-btn");
const modalBackBtn = document.querySelector("#modal-back");

const modalGalleryView = document.querySelector("#modal-gallery-view");
const modalFormView = document.querySelector("#modal-form-view");
const modalGallery = document.querySelector("#modal-gallery");

function openModal() {
  if (!modalOverlay) return;

  modalOverlay.classList.add("is-open");
  showGalleryView();
  loadModalWorks();
}

function closeModal() {
  if (!modalOverlay) return;

  modalOverlay.classList.remove("is-open");
  showGalleryView();
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

if (isConnected && editProjectsBtn) {
  editProjectsBtn.addEventListener("click", openModal);
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);

if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

if (modalAddBtn) modalAddBtn.addEventListener("click", showFormView);
if (modalBackBtn) modalBackBtn.addEventListener("click", showGalleryView);

/* =====================================================
   9) MODALE — MINIATURES + SUPPRESSION (DELETE)
===================================================== */

// Affiche les miniatures dans la modale
function renderModalWorks(works) {
  if (!modalGallery) return;

  modalGallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-thumb");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-work-btn");
    deleteBtn.dataset.id = work.id;

    const trashIcon = document.createElement("img");
    trashIcon.src = "./assets/icons/trash-can-solid.svg";
    trashIcon.alt = "Supprimer";

    deleteBtn.appendChild(trashIcon);

    deleteBtn.addEventListener("click", () => {
      deleteWork(work.id, figure);
    });

    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}

// Charge les works dans la modale
function loadModalWorks() {
  // si cachedWorks déjà chargé => on l’utilise
  if (cachedWorks.length > 0) {
    renderModalWorks(cachedWorks);
    return;
  }

  // sinon on refetch (au cas où modale ouverte trop vite)
  fetch("http://localhost:5678/api/works")
    .then((res) => res.json())
    .then((works) => {
      cachedWorks = works;
      renderModalWorks(works);
    })
    .catch(() => alert("Erreur chargement des travaux dans la modale."));
}

// ✅ DELETE : on relit le token AU MOMENT DU CLIC
function deleteWork(id, figureElement) {
  const token = localStorage.getItem("token"); // ✅ important pour éviter 401

  if (!token) {
    alert("Token manquant. Reconnecte-toi.");
    window.location.href = "login.html";
    return;
  }

  fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (res.status === 204) {
        // 1) retirer de la modale
        if (figureElement) figureElement.remove();

        // 2) retirer de la galerie principale
        if (gallery) {
          const mainFigure = gallery.querySelector(`figure[data-id="${id}"]`);
          if (mainFigure) mainFigure.remove();
        }

        // 3) retirer du cache
        cachedWorks = cachedWorks.filter((w) => w.id !== id);

        console.log(`Work ${id} supprimé ✅`);
      } else if (res.status === 401) {
        alert("401 Unauthorized : token invalide/expiré. Reconnecte-toi.");
      } else {
        alert("Erreur suppression.");
      }
    })
    .catch(() => alert("Erreur serveur pendant la suppression."));
}
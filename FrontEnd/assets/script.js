console.log("JS chargé");

/* =====================================================
   RÉCUPÉRATION DES ÉLÉMENTS HTML
===================================================== */

// Galerie des projets (page d’accueil)
const gallery = document.querySelector(".gallery");

// Zone des filtres
const filtersDiv = document.querySelector(".filters");


/* =====================================================
   ÉTAPE 5.3 — VÉRIFIER SI L’UTILISATEUR EST CONNECTÉ
===================================================== */


// On vérifie si un token existe dans le navigateur
const token = localStorage.getItem("token");

if (token) {
  console.log("Utilisateur connecté");

  // Quand on est connecté :
  // 1. On cache les filtres
  if (filtersDiv) {
    filtersDiv.style.display = "none";
  }

  // 2. Le bouton "login" devient "logout"
  const loginLi = document.querySelector("nav li:nth-child(3)");

  if (loginLi) {
    loginLi.textContent = "logout";

    loginLi.addEventListener("click", () => {
      // Déconnexion
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      // Retour à la page login
      window.location.href = "login.html";
    });
  }
}

/* =====================================================
   FONCTION : AFFICHER LES TRAVAUX
===================================================== */

function afficherTravaux(travaux) {
  // On vide la galerie avant d’afficher autre chose
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
   FONCTION : METTRE LE BOUTON ACTIF
===================================================== */

function setActiveButton(buttonClique) {
  const buttons = document.querySelectorAll(".filters button");

  buttons.forEach((btn) => btn.classList.remove("active"));
  buttonClique.classList.add("active");
}

/* =====================================================
   RÉCUPÉRATION DES TRAVAUX (PAGE D’ACCUEIL)
===================================================== */

fetch("http://localhost:5678/api/works")
  .then((response) => response.json())
  .then((works) => {
    console.log("Travaux reçus :", works);

    // Affichage de tous les projets au chargement
    afficherTravaux(works);

    /* -----------------------------------------------
       RÉCUPÉRATION DES CATÉGORIES
    ----------------------------------------------- */

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

        // Boutons des catégories
        categories.forEach((category) => {
          const btn = document.createElement("button");
          btn.textContent = category.name;
          filtersDiv.appendChild(btn);

          btn.addEventListener("click", () => {
            setActiveButton(btn);

            // On filtre les travaux selon la catégorie
            const travauxFiltres = works.filter(
              (work) => work.categoryId === category.id
            );

            afficherTravaux(travauxFiltres);
          });
        });
      });
  });

/* =====================================================
   PAGE LOGIN — AUTHENTIFICATION
===================================================== */

const form = document.querySelector("#login-form");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault(); // empêche le rechargement de la page

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
        // Si le token existe → connexion réussie
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);

          // Redirection vers l’accueil
          window.location.href = "index.html";
        } else {
          document.querySelector("#login-error").textContent =
            "Erreur : email ou mot de passe incorrect.";
        }
      })
      .catch(() => {
        document.querySelector("#login-error").textContent =
          "Erreur serveur. Réessaie.";
      });
  });
}
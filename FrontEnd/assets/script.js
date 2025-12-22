console.log("JS chargé");

// Récupération des éléments HTML
const gallery = document.querySelector(".gallery");
const filtersDiv = document.querySelector(".filters");

// Fonction pour afficher les travaux
function afficherTravaux(travaux) {
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

// Mettre le bouton cliqué en actif
function setActiveButton(buttonClique) {
  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach((btn) => btn.classList.remove("active"));
  buttonClique.classList.add("active");
}

// Récupération des travaux
fetch("http://localhost:5678/api/works")
  .then((response) => response.json())
  .then((works) => {
    console.log("Travaux reçus :", works);

    // Affichage de tous les projets au chargement
    afficherTravaux(works);

    // Récupération des catégories
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
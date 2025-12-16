console.log("JavaScript chargé");

// 1. Appel à l’API
fetch("http://localhost:5678/api/works")
  .then((response) => response.json())
  .then((works) => {

    console.log("Travaux reçus :", works);

    // 2. On récupère la galerie dans le HTML
    const gallery = document.querySelector(".gallery");

    // 3. On parcourt tous les projets reçus
    works.forEach((work) => {

      // Création des éléments HTML
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      const figcaption = document.createElement("figcaption");
      
        img.src = work.imageUrl;
        img.alt = work.title;
        figcaption.textContent = work.title;

      // Assemblage
      figure.appendChild(img);
      figure.appendChild(figcaption);

      // Ajout dans la galerie
      gallery.appendChild(figure);
    });
  })
  .catch((error) => {
    console.error("Erreur fetch :", error);
  });
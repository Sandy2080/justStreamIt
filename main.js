const mainUrl = "http://localhost:8000/api/v1/titles/";

// Best movie
function fetchBestMovie() {
  let bestTitle = document.getElementById("top-title"),
    bestDesc = document.getElementsByClassName("best-desc")[0],
    bestButton = document.getElementsByClassName("button")[1];

  fetch(mainUrl + "?sort_by=-imdb_score")
    .then((response) => response.json())
    .then((data) => {
      bestTitle.innerHTML = data["results"][0]["title"];

      // bestImg.src = data["results"][0]["image_url"];
      document.getElementById("top0").style.backgroundImage =
        "url('" + data["results"][0]["image_url"] + "')";
      bestButton.setAttribute(
        "onclick",
        `openModal("${data["results"][0]["id"]}")`
      );
      fetch(data["results"][0]["url"])
        .then((response) => response.json())
        .then((data) => {
          bestDesc.innerHTML = data["description"];
        });
    });
}

// Modal control and fetch data
function openModal(id) {
  let modal = document.getElementById("modal");
  let span = document.getElementsByClassName("close")[0];
  fetchModalData(id);
  modal.style.display = "block";
  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target === modal) modal.style.display = "none";
  };
}

function fetchModalData(id) {
  fetch(mainUrl + id)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("modal-cover").src = data["image_url"];
      document.getElementById("modal-title").innerHTML = data["title"];

      document.getElementById("modal-year").innerHTML = data["year"];
      document.getElementById("modal-duration").innerHTML =
        data["duration"] + " min";
      document.getElementById("modal-genres").innerHTML = data["genres"];
      document.getElementById("modal-imdb").innerHTML =
        data["imdb_score"] + " / 10";

      document.getElementById("modal-directors").innerHTML = data["directors"];
      document.getElementById("modal-cast").innerHTML = data["actors"] + "...";
      document.getElementById("modal-country").innerHTML = data["countries"];

      if (typeof data["rated"] === "string" || data["rated"] instanceof String)
        document.getElementById("modal-rating").innerHTML = data["rated"];
      else
        document.getElementById("modal-rating").innerHTML = data["rated"] + "+"; // add "+" if age rating is a number

      let modalBoxOffice = document.getElementById("modal-box-office");
      if (data["worldwide_gross_income"] == null)
        modalBoxOffice.innerHTML = "N/A";
      // placeholder for unspecified box-office
      else
        modalBoxOffice.innerHTML =
          data["worldwide_gross_income"] + " " + data["budget_currency"];

      let regExp = /[a-zA-Z]/g;
      if (regExp.test(data["long_description"]))
        document.getElementById("modal-desc").innerHTML =
          data["long_description"];
      else document.getElementById("modal-desc").innerHTML = "N/A"; // placeholder for missing description
    });
}

// Categories

async function fetchCategory(name) {
  let moviesData = [];
  const response = await fetch(mainUrl + "?sort_by=-imdb_score&genre=" + name);
  if (response.ok) {
    const json = await response.json();
    const movies_results = json.results;

    const response_next = await fetch(json.next);
    const json_next = await response_next.json();
    const movies_results_next = json_next.results;

    const movies = [...movies_results, ...movies_results_next];

    for (let i = 0; i < 7; i++) {
      moviesData.push(movies[i]);
    }
    return moviesData;
  }
}

// Carousel controls

function moveCarouselLeft(category) {
  let carrouselContent = document.querySelector("#" + category + "-movies");
  let carrouselLeftBtn = document.querySelector("#" + category + "-left");
  let carrouselRightBtn = document.querySelector("#" + category + "-right");
  const bounds = carrouselContent.getClientRects();
  let left = 0;
  console.log(left);
  carrouselContent.style.left = -480 * 1 + "px";
  carrouselRightBtn.classList.remove("show");
  carrouselRightBtn.classList.add(".left");
  carrouselLeftBtn.classList.add("show");
}

function moveCarouselRight(category) {
  let carrouselContent = document.querySelector("#" + category + "-movies");
  let carrouselLeftBtn = document.querySelector("#" + category + "-left");
  let carrouselRightBtn = document.querySelector("#" + category + "-right");

  carrouselContent.style.left = "0px";
  carrouselRightBtn.classList.add("show");
  carrouselRightBtn.classList.add(".right");
  carrouselLeftBtn.classList.remove("show");
}

async function buildCarousel(category, name) {
  let cat_name = name;
  if (name === "best") cat_name = "";

  const section = document.createElement("section");
  section.classList.add("categories");

  const carousel = document.createElement("div");
  carousel.classList.add("container");

  const categoryTitle = document.createElement("h2");
  categoryTitle.innerHTML = `${category} movies`;
  carousel.append(categoryTitle);

  const carouselContainer = document.createElement("div");
  carouselContainer.classList.add("carousel-container");

  const carouselContent = document.createElement("div");
  carouselContent.classList.add("carousel-content");
  carouselContent.setAttribute("id", `${name}-movies`);

  document.querySelector(".carousels").appendChild(section);

  const movies = await fetchCategory(cat_name);

  let i = 0;
  for (const movie of movies) {
    const box = document.createElement("div");
    box.classList.add("box");
    box.setAttribute("id", `${cat_name}${i + 1}`);

    const movieCover = document.createElement("img");
    movieCover.setAttribute("alt", movie.title);
    movieCover.src = movie.image_url;
    box.appendChild(movieCover);

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    const movieTitle = document.createElement("p");
    movieTitle.innerHTML = movie.title;
    overlay.appendChild(movieTitle);

    const playButton = document.createElement("button");
    playButton.classList.add("overlay-button");
    playButton.innerHTML = '<i class="bi bi-play-fill"></i> Play';
    overlay.appendChild(playButton);

    const modalButton = document.createElement("button");
    modalButton.classList.add("overlay-button");
    modalButton.setAttribute("onclick", `openModal("${movie.id}")`);
    modalButton.innerHTML = "More...";
    overlay.appendChild(modalButton);

    box.appendChild(overlay);
    carouselContent.appendChild(box);

    i++;
  }

  const controls = document.createElement("div");
  controls.classList.add("controls");

  const leftButton = document.createElement("button");
  leftButton.classList.add("btn");
  leftButton.classList.add("left");
  leftButton.setAttribute("aria-label", `${name} slide left`);
  leftButton.setAttribute("id", `${name}-left`);
  leftButton.setAttribute("onclick", `moveCarouselRight("${name}")`);
  controls.appendChild(leftButton);

  const rightButton = document.createElement("button");
  rightButton.classList.add("btn");
  rightButton.classList.add("right");
  rightButton.classList.add("show");
  rightButton.setAttribute("id", `${name}-right`);
  rightButton.setAttribute("aria-label", `${name} slide right`);
  rightButton.setAttribute("onclick", `moveCarouselLeft("${name}")`);
  controls.appendChild(rightButton);

  carouselContainer.appendChild(carouselContent);
  carouselContainer.appendChild(controls);

  carousel.appendChild(carouselContainer);
  section.appendChild(carousel);
}

function start() {
  const categories = ["Horror", "History", "Romance"];
  buildCarousel("Best-rated", "best");
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    buildCarousel(category, category.toLowerCase());
  }
  fetchBestMovie();
}

window.addEventListener("load", start);

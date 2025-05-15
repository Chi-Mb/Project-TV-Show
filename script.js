
const url = "https://api.tvmaze.com/shows";

const state = {
  allMovies: [],
  searchTerm: "",
  cachedEpisodes: {},
};

const filmCardContainer = document.getElementById("filmCard-container");
const searchBox = document.getElementById("search-input");
const dropDownSelector = document.getElementById("movie");
const epiDropDownSelector = document.getElementById("episode");
const counter = document.getElementById("counter");

// Fetch all shows from API
async function getMovies() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok " + res.statusText);
    const data = await res.json();
    clearErrorMessage();
    return data.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  } catch (error) {
    displayErrorMessage(
      "Sorry, there was an error loading the shows. Please try again later."
    );
    return [];
  }
}

// Display error messages
function displayErrorMessage(message) {
  const errorMessageDiv = document.getElementById("error-message");
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = "block";
}

function clearErrorMessage() {
  const errorMessageDiv = document.getElementById("error-message");
  errorMessageDiv.textContent = "";
  errorMessageDiv.style.display = "none";
}

// Populate show dropdown
function populateShowSelector(allMovies) {
  dropDownSelector.innerHTML = `<option value="">Select a Show</option>`;
  allMovies.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    dropDownSelector.appendChild(option);
  });
}

// Fetch and populate episodes
async function episodeSelector(showId) {
  if (state.cachedEpisodes[showId]) {
    updateEpisodeDropdown(state.cachedEpisodes[showId]);
    return;
  }

  try {
    const episodeUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;
    const res = await fetch(episodeUrl);
    if (!res.ok) throw new Error("Error fetching episodes");
    const episodes = await res.json();
    state.cachedEpisodes[showId] = episodes;
    clearErrorMessage();
    updateEpisodeDropdown(episodes);
  } catch (error) {
    displayErrorMessage("Error loading episodes. Please try again.");
  }
}

// Populate episode dropdown
function updateEpisodeDropdown(episodes) {
  epiDropDownSelector.innerHTML = `<option value="">All Episodes</option>`;
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episode.name} (S${String(episode.season).padStart(2, '0')}E${String(episode.number).padStart(2, '0')})`;
    epiDropDownSelector.appendChild(option);
  });
}

// Create card for movie or episode
function createFilmCard(item, isEpisode = false) {
  const filmCard = document.createElement("div");
  filmCard.classList.add("film-card");

  const bannerImg = document.createElement("img");
  bannerImg.src = item.image?.medium || "https://via.placeholder.com/210x295";
  bannerImg.alt = `${item.name} image`;
  filmCard.appendChild(bannerImg);

  const titleElement = document.createElement("h3");
  titleElement.textContent =
    isEpisode && item.season
      ? `${item.name} (S${String(item.season).padStart(2, '0')}E${String(item.number).padStart(2, '0')})`
      : item.name;
  filmCard.appendChild(titleElement);

  const summaryElement = document.createElement("p");
  summaryElement.innerHTML = item.summary || "No summary available.";
  filmCard.appendChild(summaryElement);

  const linkElement = document.createElement("a");
  linkElement.href = item.url;
  linkElement.textContent = "More Info";
  linkElement.target = "_blank";
  linkElement.classList.add("redirect");
  filmCard.appendChild(linkElement);

  return filmCard;
}

// Render movie list
function displayMovies(movies) {
  counter.textContent = `Results: ${movies.length}`;
  filmCardContainer.innerHTML = "";
  if (movies.length === 0) {
    filmCardContainer.innerHTML = "<p>No results found.</p>";
    return;
  }
  movies.forEach((movie) => {
    filmCardContainer.appendChild(createFilmCard(movie));
  });
}

// Render episode list
function displayEpisodes(episodes) {
  counter.textContent = `Results: ${episodes.length}`;
  filmCardContainer.innerHTML = "";
  if (episodes.length === 0) {
    filmCardContainer.innerHTML = "<p>No results found.</p>";
    return;
  }
  episodes.forEach((episode) => {
    filmCardContainer.appendChild(createFilmCard(episode, true));
  });
}

// Handle show selection
async function userSelection() {
  dropDownSelector.addEventListener("change", async () => {
    const selectedShowId = dropDownSelector.value;

    if (!selectedShowId) {
      displayMovies(state.allMovies);
      epiDropDownSelector.innerHTML = "";
      epiDropDownSelector.style.display = "none";
      return;
    }

    await episodeSelector(selectedShowId);

    const episodes = state.cachedEpisodes[selectedShowId] || [];
    displayEpisodes(episodes);
    epiDropDownSelector.style.display = "inline-block";
  });
}

// Handle episode selection
epiDropDownSelector.addEventListener("change", function () {
  const selectedEpisodeId = this.value;
  const selectedShowId = dropDownSelector.value;
  if (!selectedShowId || !state.cachedEpisodes[selectedShowId]) return;

  if (!selectedEpisodeId) {
    displayEpisodes(state.cachedEpisodes[selectedShowId]);
  } else {
    const selectedEpisode = state.cachedEpisodes[selectedShowId].find(
      (ep) => ep.id.toString() === selectedEpisodeId
    );
    if (selectedEpisode) {
      displayEpisodes([selectedEpisode]);
    }
  }
});

// Handle search input
function searchResults(event) {
  state.searchTerm = event.target.value.toLowerCase();

  if (!dropDownSelector.value) {
    const filteredMovies = state.allMovies.filter((movie) =>
      movie.name.toLowerCase().includes(state.searchTerm)
    );
    displayMovies(filteredMovies);
  } else {
    const selectedShowId = dropDownSelector.value;
    if (!state.cachedEpisodes[selectedShowId]) return;
    const filteredEpisodes = state.cachedEpisodes[selectedShowId].filter((episode) =>
      episode.name.toLowerCase().includes(state.searchTerm)
    );
    displayEpisodes(filteredEpisodes);
  }
}

searchBox.addEventListener("input", searchResults);

// Setup function
async function setup() {
  state.allMovies = await getMovies();
  populateShowSelector(state.allMovies);
  displayMovies(state.allMovies); // Show all by default
  userSelection();
}

window.onload = setup;

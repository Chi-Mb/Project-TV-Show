const SHOWS_API_URL = "https://api.tvmaze.com/shows";

const state = {
  allShows: [],
  allEpisodes: [],
  cachedEpisodes: {},
  currentView: "shows", 
};

const showContainer = document.getElementById("filmCard-container");
const searchBox = document.getElementById("search-input");
const episodeSelector = document.getElementById("episode");
const counter = document.getElementById("counter");
const errorMessageDiv = document.getElementById("error-message");
const backButton = document.getElementById("back-button");



async function fetchShows() {
  try {
    const res = await fetch(SHOWS_API_URL);
    if (!res.ok) throw new Error("Failed to fetch shows.");
    const shows = await res.json();
    return shows.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    showError(err.message);
    return [];
  }
}

async function fetchEpisodes(showId) {
  if (state.cachedEpisodes[showId]) {
    return state.cachedEpisodes[showId];
  }
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!res.ok) throw new Error("Failed to fetch episodes.");
    const episodes = await res.json();
    state.cachedEpisodes[showId] = episodes;
    return episodes;
  } catch (err) {
    showError(err.message);
    return [];
  }
}


function renderShows(shows) {
  clearError();
  showContainer.innerHTML = "";
  counter.textContent = `Shows Found: ${shows.length}`;

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.classList.add("film-card");
    card.innerHTML = `
      <img src="${show.image?.medium || 'https://via.placeholder.com/210x295'}" alt="${show.name}">
      <h3>${show.name}</h3>
      <p>${show.summary || "No summary available"}</p>
      <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
      <p><strong>Status:</strong> ${show.status}</p>
      <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
      <p><strong>Runtime:</strong> ${show.runtime} mins</p>
    `;
    card.addEventListener("click", () => loadEpisodes(show.id));
    showContainer.appendChild(card);
  });

  episodeSelector.style.display = "none";
  backButton.style.display = "none";
  state.currentView = "shows";
}

function renderEpisodes(episodes) {
  clearError();
  showContainer.innerHTML = "";
  counter.textContent = `Episodes Found: ${episodes.length}`;

  episodes.forEach((ep) => {
    const card = document.createElement("div");
    card.classList.add("film-card");
    card.innerHTML = `
      <img src="${ep.image?.medium || 'https://via.placeholder.com/210x295'}" alt="${ep.name}">
      <h3>${ep.name} (S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")})</h3>
      <p>${ep.summary || "No summary available"}</p>
      <a href="${ep.url}" target="_blank">More Info</a>
    `;
    showContainer.appendChild(card);
  });

  episodeSelector.style.display = "inline-block";
  backButton.style.display = "inline-block";
  state.currentView = "episodes";
}



async function loadEpisodes(showId) {
  const episodes = await fetchEpisodes(showId);
  state.allEpisodes = episodes;
  renderEpisodes(episodes);
  updateEpisodeDropdown(episodes);
}



function updateEpisodeDropdown(episodes) {
  episodeSelector.innerHTML = `<option value="">All Episodes</option>`;
  episodes.forEach((ep) => {
    const option = document.createElement("option");
    option.value = ep.id;
    option.textContent = `${ep.name} (S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")})`;
    episodeSelector.appendChild(option);
  });
}

episodeSelector.addEventListener("change", (e) => {
  const selectedId = e.target.value;
  if (!selectedId) {
    renderEpisodes(state.allEpisodes);
  } else {
    const episode = state.allEpisodes.find((ep) => ep.id.toString() === selectedId);
    if (episode) renderEpisodes([episode]);
  }
});

searchBox.addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();

  if (state.currentView === "shows") {
    const filtered = state.allShows.filter((show) =>
      show.name.toLowerCase().includes(searchTerm) ||
      show.summary?.toLowerCase().includes(searchTerm) ||
      show.genres.join(" ").toLowerCase().includes(searchTerm)
    );
    renderShows(filtered);
  } else if (state.currentView === "episodes") {
    const filtered = state.allEpisodes.filter((ep) =>
      ep.name.toLowerCase().includes(searchTerm)
    );
    renderEpisodes(filtered);
  }
});



backButton.addEventListener("click", () => {
  searchBox.value = "";
  renderShows(state.allShows);
});



function showError(message) {
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = "block";
}

function clearError() {
  errorMessageDiv.textContent = "";
  errorMessageDiv.style.display = "none";
}



window.onload = async () => {
  state.allShows = await fetchShows();
  renderShows(state.allShows);
};


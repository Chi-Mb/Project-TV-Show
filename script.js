const url = "https://api.tvmaze.com/shows";

const state = {
  allShows: [],
  allEpisodes: [],
  searchTerm: "",
  cachedEpisodes: {},
  currentView: "shows", 
};

const showContainer = document.getElementById("filmCard-container");
const searchBox = document.getElementById("search-input");
const showSelector = document.getElementById("movie");
const episodeSelector = document.getElementById("episode");
const counter = document.getElementById("counter");
const errorMessageDiv = document.getElementById("error-message");


async function fetchShows() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch shows");
    const data = await res.json();
    return data.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  } catch (err) {
    showError(err.message);
    return [];
  }
}


async function fetchEpisodes(showId) {
  if (state.cachedEpisodes[showId]) return state.cachedEpisodes[showId];
  try {
    const res = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!res.ok) throw new Error("Failed to fetch episodes");
    const episodes = await res.json();
    state.cachedEpisodes[showId] = episodes;
    return episodes;
  } catch (err) {
    showError(err.message);
    return [];
  }
}


function showError(msg) {
  errorMessageDiv.textContent = msg;
  errorMessageDiv.style.display = "block";
}

function clearError() {
  errorMessageDiv.textContent = "";
  errorMessageDiv.style.display = "none";
}


function renderShows(shows) {
  showContainer.innerHTML = "";
  counter.textContent = `Results: ${shows.length}`;
  shows.forEach((show) => {
    const card = document.createElement("div");
    card.classList.add("film-card");
    card.innerHTML = `
      <img src="${show.image?.medium || "https://via.placeholder.com/210x295"}" alt="${show.name}">
      <h3>${show.name}</h3>
      <p>${show.summary || "No summary"}</p>
      <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
      <p><strong>Status:</strong> ${show.status}</p>
      <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
      <p><strong>Runtime:</strong> ${show.runtime} min</p>
    `;
    card.addEventListener("click", () => loadEpisodes(show.id));
    showContainer.appendChild(card);
  });
  showSelector.style.display = "none";
  episodeSelector.style.display = "none";
  state.currentView = "shows";
}


function renderEpisodes(episodes) {
  showContainer.innerHTML = "";
  counter.textContent = `Results: ${episodes.length}`;
  episodes.forEach((ep) => {
    const card = document.createElement("div");
    card.classList.add("film-card");
    card.innerHTML = `
      <img src="${ep.image?.medium || "https://via.placeholder.com/210x295"}" alt="${ep.name}">
      <h3>${ep.name} (S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")})</h3>
      <p>${ep.summary || "No summary"}</p>
      <a href="${ep.url}" target="_blank" class="redirect">More Info</a>
    `;
    showContainer.appendChild(card);
  });
  showSelector.style.display = "none";
  episodeSelector.style.display = "inline-block";
  state.currentView = "episodes";
}


async function loadEpisodes(showId) {
  const episodes = await fetchEpisodes(showId);
  state.allEpisodes = episodes;
  updateEpisodeSelector(episodes);
  renderEpisodes(episodes);
  addBackLink();
}


function updateEpisodeSelector(episodes) {
  episodeSelector.innerHTML = `<option value="">All Episodes</option>`;
  episodes.forEach((ep) => {
    const opt = document.createElement("option");
    opt.value = ep.id;
    opt.textContent = `${ep.name} (S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")})`;
    episodeSelector.appendChild(opt);
  });
}


function addBackLink() {
  const link = document.createElement("button");
  link.textContent = "Back to Shows";
  link.onclick = () => {
    renderShows(state.allShows);
    searchBox.value = "";
  };
  showContainer.prepend(link);
}


searchBox.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  if (state.currentView === "shows") {
    const filtered = state.allShows.filter((s) =>
      s.name.toLowerCase().includes(term) ||
      s.summary.toLowerCase().includes(term) ||
      s.genres.join(" ").toLowerCase().includes(term)
    );
    renderShows(filtered);
  } else {
    const filtered = state.allEpisodes.filter((ep) =>
      ep.name.toLowerCase().includes(term)
    );
    renderEpisodes(filtered);
  }
});


episodeSelector.addEventListener("change", (e) => {
  const id = e.target.value;
  if (!id) return renderEpisodes(state.allEpisodes);
  const ep = state.allEpisodes.find((e) => e.id.toString() === id);
  if (ep) renderEpisodes([ep]);
});

window.onload = async () => {
  state.allShows = await fetchShows();
  renderShows(state.allShows);
};


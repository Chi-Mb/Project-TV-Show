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
const episodeSelector = document.getElementById("episode");
const counter = document.getElementById("counter");
const errorMessageDiv = document.getElementById("error-message");
const episodeLabel = document.querySelector('label[for="episode"]');

async function fetchShows() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch shows");
    let data = await res.json();
    data = data.filter(show => show.name !== "666 Park Avenue");
    return data.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
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

function updateSearchPlaceholder() {
  if (state.currentView === "shows") {
    searchBox.placeholder = "Search shows...";
  } else {
    searchBox.placeholder = "Search episodes...";
  }
}

function renderShows(shows) {
  showContainer.innerHTML = "";
  counter.textContent = `Results: ${shows.length}`;

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.classList.add("film-card");

    const img = document.createElement("img");
    img.src = show.image?.medium || "https://via.placeholder.com/210x295";
    img.alt = show.name;
    card.appendChild(img);

    const h3 = document.createElement("h3");
    h3.textContent = show.name;
    card.appendChild(h3);

    const pSummary = document.createElement("p");
    pSummary.innerHTML = show.summary || "No summary";
    card.appendChild(pSummary);

    const pGenres = document.createElement("p");
    pGenres.textContent = `Genres: ${show.genres.join(", ")}`;
    card.appendChild(pGenres);

    const pStatus = document.createElement("p");
    pStatus.textContent = `Status: ${show.status}`;
    card.appendChild(pStatus);

    const pRating = document.createElement("p");
    pRating.textContent = `Rating: ${show.rating?.average || "N/A"}`;
    card.appendChild(pRating);

    const pRuntime = document.createElement("p");
    pRuntime.textContent = `Runtime: ${show.runtime} min`;
    card.appendChild(pRuntime);

    card.addEventListener("click", () => loadEpisodes(show.id));
    showContainer.appendChild(card);
  });

  episodeSelector.style.display = "none";
  episodeLabel.style.display = "none";
  state.currentView = "shows";
  clearError();
  updateSearchPlaceholder();
}

function renderEpisodes(episodes) {
  showContainer.innerHTML = "";
  counter.textContent = `Results: ${episodes.length}`;

  episodes.forEach((ep) => {
    const card = document.createElement("div");
    card.classList.add("film-card");

    const img = document.createElement("img");
    img.src = ep.image?.medium || "https://via.placeholder.com/210x295";
    img.alt = ep.name;
    card.appendChild(img);

    const h3 = document.createElement("h3");
    h3.textContent = `${ep.name} (S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")})`;
    card.appendChild(h3);

    const pSummary = document.createElement("p");
    pSummary.innerHTML = ep.summary || "No summary";
    card.appendChild(pSummary);

    const aMore = document.createElement("a");
    aMore.href = ep.url;
    aMore.target = "_blank";
    aMore.className = "redirect";
    aMore.textContent = "More Info";
    card.appendChild(aMore);

    showContainer.appendChild(card);
  });

  episodeSelector.style.display = "inline-block";
  episodeLabel.style.display = "inline-block";
  state.currentView = "episodes";
  clearError();
  updateSearchPlaceholder();
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
  const existingBackBtn = document.getElementById("back-to-shows-btn");
  if (existingBackBtn) existingBackBtn.remove();

  const link = document.createElement("button");
  link.textContent = "Back to Shows";
  link.id = "back-to-shows-btn";
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



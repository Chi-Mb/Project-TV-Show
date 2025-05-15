const searchBox = document.getElementById("search-input");
const dropDownSelector = document.getElementById("movie");
const counter = document.getElementById("counter");

const state = { allEpisodes: [], searchTerm: "" };

function setup() {
  document.getElementById("filmCardContainer").innerHTML = "<p>Loading episodes...</p>";

  fetch("https://api.tvmaze.com/shows/82/episodes")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      state.allEpisodes = data;
      makePageForEpisodes(data);
      selector(data);
      userSelection();
    })
    .catch((err) => {
      showError(err.message);
    });
}

function showError(message) {
  const container = document.getElementById("filmCardContainer");
  container.innerHTML = `<p style="color: red; font-weight: bold;">Error: ${message}</p>`;
}

function selector(allEpisodes) {
  dropDownSelector.innerHTML = `<option value="">All Episodes</option>`;
  for (let episode of allEpisodes) {
    const option = document.createElement("option");
    option.value = episode.name;
    option.textContent = episode.name || `${episode.id} - No name!`;
    dropDownSelector.appendChild(option);
  }
}

function render() {
  const searched = state.allEpisodes.filter((ep) =>
    ep.name.toLowerCase().includes(state.searchTerm.toLowerCase())
  );
  counter.textContent = `Results: ${searched.length}/${state.allEpisodes.length}`;
  makePageForEpisodes(searched);
}

function searchRes(event) {
  state.searchTerm = event.target.value;
  render();
}

searchBox.addEventListener("input", searchRes);

function userSelection() {
  dropDownSelector.addEventListener("change", () => {
    const selectedValue = dropDownSelector.value.toLowerCase();
    const filtered = state.allEpisodes.filter((ep) =>
      ep.name.toLowerCase().includes(selectedValue)
    );
    makePageForEpisodes(selectedValue === "" ? state.allEpisodes : filtered);
    counter.textContent = `Results: ${selectedValue === "" ? state.allEpisodes.length : filtered.length}/${state.allEpisodes.length}`;
  });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("filmCardContainer");
  rootElem.textContent = "";

  const totalCount = document.createElement("h2");
  totalCount.textContent = `Got ${episodeList.length} episode(s)`;
  totalCount.style.textAlign = "center";
  totalCount.style.marginBottom = "2rem";
  rootElem.appendChild(totalCount);

  for (const episode of episodeList) {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = `${episode.name} - S${episode.season
      .toString()
      .padStart(2, "0")}E${episode.number.toString().padStart(2, "0")}`;

    const image = document.createElement("img");
    image.src = episode.image.medium;
    image.alt = episode.name;

    const summary = document.createElement("div");
    summary.className = "card-description";
    summary.innerHTML = episode.summary;

    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(summary);

    rootElem.appendChild(card);
  }
}

window.onload = setup;

function setup() {
  const allEpisodes = getAllEpisodes(); // Assume this returns the episode list
  state.allEpisodes = allEpisodes;
  makePageForEpisodes(allEpisodes);
  selector(allEpisodes);         // Populate dropdown
  userSelection();               // Set up dropdown event listener
}

//////////////////////////////////////////////////////

const searchBox = document.getElementById("search-input");
const dropDownSelector = document.getElementById("movie");
const counter = document.getElementById("counter");

// State object for shared data
const state = { allEpisodes: [], searchTerm: "" };

// Populate dropdown options
function selector(allEpisodes) {
  dropDownSelector.innerHTML = `<option value="">All Episodes</option>`;
  for (let episode of allEpisodes) {
    const option = document.createElement("option");
    option.value = episode.name;
    option.textContent = episode.name || `${episode.id} - No name!`;
    dropDownSelector.appendChild(option);
  }
}

// Re-render episode cards based on search
function render() {
  const searched = state.allEpisodes.filter((ep) =>
    ep.name.toLowerCase().includes(state.searchTerm.toLowerCase())
  );
  counter.textContent = `Results: ${searched.length}/${state.allEpisodes.length}`;
  makePageForEpisodes(searched);
}

// Update searchTerm on input and re-render
function searchRes(event) {
  state.searchTerm = event.target.value;
  render();
}

searchBox.addEventListener("input", searchRes);

// Filter episodes based on dropdown selection
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

////////////////////////////////////////////////////////

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

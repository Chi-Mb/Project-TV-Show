//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
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

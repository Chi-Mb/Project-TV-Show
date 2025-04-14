//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.textContent = `Got ${episodeList.length} episode(s)`;

for (const episode of episodeList) {
  console.log(episode)
  const newdiv = document.createElement("div")
  const newimg = document.createElement("img")
  newimg.src = `${episode.image.medium}`
  const description = document.createElement("div")
  rootElem.appendChild(newdiv)
  rootElem.appendChild(newimg)
  rootElem.appendChild(description)
  newdiv.textContent = `${episode.name} - S${episode.season.toString().padStart(2,0)} E${episode.number.toString().padStart(2,0)}`
  description.textContent = `${episode.summary}`
}


}

window.onload = setup;
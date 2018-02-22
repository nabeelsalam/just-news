const main = document.getElementById('MainContainer');
const sourcesList = document.getElementById('SourcesList');
const APIKEY = '566b3b9b5aa142baab77da3c31a35102';
const loader = document.getElementById('Loader');
let source = 'bbc-news';


window.addEventListener('load', async e => {

  let defaultSource = localStorage.selectedSource ? localStorage.selectedSource : source;

  let sources = await fetch('https://newsapi.org/v2/sources?apiKey=566b3b9b5aa142baab77da3c31a35102');
  let json = await sources.json();
  source = json.sources[0].id || source;
  createSourcesList(json.sources);
  sourcesList.value = defaultSource;
  createNewsList(defaultSource);
  sourcesList.addEventListener('change', e => {
    localStorage.selectedSource = e.target.value;
    createNewsList(e.target.value);
  })
})

function createSourcesList(sources) {
  sourcesList.innerHTML = sources.map(createSourceItem).join('\n');
}

function createSourceItem({id, name}) {
  return `
<option value="${id}">${name}</option>
`;
}

async function createNewsList(source) {
  showLoader();
  let res = await fetch(`https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=${APIKEY}`);
  let {articles} = await res.json();
  main.innerHTML = articles
    .map(createCard)
    .join('\n');
  hideLoader();
}

function createCard({title, description, urlToImage, url}) {
  return `
  <a target="_blank" href="${url}">
  <div class="card ml-0">
  <img class="card-img-top" src="${urlToImage}" alt="Card image cap">
  <div class="card-body">
    <h5 class="card-title">${title}</h5>
    <p class="card-text">${description}</p>
  </div>
</div>
</a>
`
}

function showLoader() {
  loader.style.display = "inline-block";
}
function hideLoader() {
  loader.style.display = "none";
}
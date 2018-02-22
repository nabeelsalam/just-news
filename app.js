const main = document.getElementById('MainContainer');
const sourcesList = document.getElementById('SourcesList');
const APIKEY = '566b3b9b5aa142baab77da3c31a35102';
const loader = document.getElementById('Loader');
const sourcesURL = 'https://newsapi.org/v2/sources?apiKey=566b3b9b5aa142baab77da3c31a35102'
let source = 'bbc-news';

/**
 * Functionality after the page loads
 */
window.addEventListener('load', async e => {
  showLoader();
  let defaultSource = localStorage.selectedSource ? localStorage.selectedSource : source;

  /**
   * Loading the details from cache
   */
  try {
    let cachedSourcesResponse = await caches.match(sourcesURL);
    let json = await cachedSourcesResponse.json();

    createSourcesList(json.sources);
    sourcesList.value = defaultSource;
    createNewsList(defaultSource);
  } catch (error) {
    console.log('Could not load from cache', error)
  }

  /**
   * Fetching the sources from the network
   */
  let sources = await fetch(sourcesURL);
  let json = await sources.json();

  createSourcesList(json.sources);
  sourcesList.value = defaultSource;

  /**
   * Fetching the news from the network
   */
  createNewsList(defaultSource);
  sourcesList.addEventListener('change', e => {
    localStorage.selectedSource = e.target.value;
    createNewsList(e.target.value);
  })

  /**
   * Registering the service worker
   */
  if (navigator.serviceWorker) {
    try {
      navigator.serviceWorker.register('sw.js');
      console.log('sw worker registered');
    } catch (error) {
      console.log('sw worker could not be supported', err);

    }
  }

})

/**
 * Creating the sources list
 */
function createSourcesList(sources) {
  sourcesList.innerHTML = sources.map(createSourceItem).join('\n');
}

/**
 * Creating the source option item
 */
function createSourceItem({id, name}) {
  return `
<option value="${id}">${name}</option>
`;
}

/**
 * Creating the news list 
 */
async function createNewsList(source) {
  showLoader();
  const fetchURL = `https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=${APIKEY}`;
  try {
    let cachedResponse = await caches.match(fetchURL);
    let {articles} = await cachedResponse.json();
    let news = articles
      .map(createCard)
      .join('\n');
    main.innerHTML = news;
  } catch (error) {}

  let res = await fetch(fetchURL);
  let {articles} = await res.json();
  let news = articles
    .map(createCard)
    .join('\n');
  main.innerHTML = news;
  hideLoader();
}

/**
 *  Creating the news card
 */
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

/**
 * Show the loader
 */
function showLoader() {
  loader.style.display = "inline-block";
}

/**
 * Hide the loader
 */
function hideLoader() {
  loader.style.display = "none";
}
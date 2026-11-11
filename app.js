const API_URL = "https://pt.wikipedia.org/w/api.php";

const catalog = [
  { title: "Baleia-azul", category: "Mamíferos", color: "#2a8fa2" },
  { title: "Tubarão-baleia", category: "Peixes", color: "#2f7b9d" },
  { title: "Orca", category: "Mamíferos", color: "#173d64" },
  { title: "Tartaruga-marinha", category: "Répteis", color: "#2c9c84" },
  { title: "Raia-manta", category: "Peixes", color: "#517da8" },
  { title: "Cavalo-marinho", category: "Peixes", color: "#be8c65" },
  { title: "Polvo", category: "Invertebrados", color: "#bb6c82" },
  { title: "Água-viva", category: "Invertebrados", color: "#8d72b4" },
  { title: "Golfinho", category: "Mamíferos", color: "#448caf" },
  { title: "Pinguim-imperador", category: "Aves", color: "#37546a" },
];

const state = { animals: [], search: "", category: "Todos", loading: false };
const grid = document.querySelector("#animalGrid");
const statusLine = document.querySelector("#statusLine");
const statusText = document.querySelector("#statusText");
const emptyState = document.querySelector("#emptyState");
const emptyTitle = document.querySelector("#emptyTitle");
const emptyText = document.querySelector("#emptyText");
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const refreshButton = document.querySelector("#refreshButton");
const retryButton = document.querySelector("#retryButton");
const themeToggle = document.querySelector("#themeToggle");

function escapeHTML(value = "") {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;",
  })[character]);
}

function placeholderImage(title, color) {
  const shortTitle = title.length > 18 ? `${title.slice(0, 18)}…` : title;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#062737"/></linearGradient></defs><rect width="900" height="560" fill="url(#g)"/><circle cx="730" cy="110" r="90" fill="white" fill-opacity=".12"/><circle cx="130" cy="420" r="140" fill="white" fill-opacity=".07"/><path d="M0 440 C160 370 260 510 420 428 S710 370 900 448 V560 H0Z" fill="#061d2a" fill-opacity=".35"/><text x="48" y="96" fill="#eafffc" font-family="Arial, sans-serif" font-size="20" letter-spacing="4">MARÉ VIVA</text><text x="48" y="500" fill="#eafffc" font-family="Arial, sans-serif" font-size="42" font-weight="bold">${escapeHTML(shortTitle)}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function setStatus(message, type = "ready") {
  statusText.textContent = message;
  statusLine.classList.toggle("is-error", type === "error");
}

function showLoading() {
  state.loading = true;
  emptyState.hidden = true;
  grid.innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton" aria-hidden="true"></div>').join("");
  setStatus("Buscando histórias no oceano...");
  refreshButton.classList.add("is-loading");
  refreshButton.disabled = true;
}

function finishLoading() {
  state.loading = false;
  refreshButton.classList.remove("is-loading");
  refreshButton.disabled = false;
}

function createCard(animal, index) {
  const image = animal.image || placeholderImage(animal.title, animal.color);
  const description = animal.extract || "Uma espécie marinha esperando para ser descoberta.";
  const source = animal.url || `https://pt.wikipedia.org/wiki/${encodeURIComponent(animal.title.replaceAll(" ", "_"))}`;
  return `<article class="animal-card" style="animation-delay: ${Math.min(index * 45, 260)}ms">
    <div class="card-image">
      <img src="${escapeHTML(image)}" alt="Imagem de ${escapeHTML(animal.title)}" loading="lazy" />
      <span class="card-badge">${escapeHTML(animal.category)}</span>
    </div>
    <div class="card-body">
      <div class="card-title-row"><h3>${escapeHTML(animal.title)}</h3><span class="card-arrow" aria-hidden="true">↗</span></div>
      <p>${escapeHTML(description)}</p>
      <div class="card-footer"><span>fonte: Wikipédia</span><a href="${escapeHTML(source)}" target="_blank" rel="noreferrer">ler mais</a></div>
    </div>
  </article>`;
}

function filteredAnimals() {
  const query = state.search.trim().toLocaleLowerCase("pt-BR");
  return state.animals.filter((animal) => {
    const matchesText = !query || `${animal.title} ${animal.extract}`.toLocaleLowerCase("pt-BR").includes(query);
    const matchesCategory = state.category === "Todos" || animal.category === state.category;
    return matchesText && matchesCategory;
  });
}

function renderAnimals() {
  const items = filteredAnimals();
  if (!items.length) {
    grid.innerHTML = "";
    emptyState.hidden = false;
    emptyTitle.textContent = state.animals.length ? "Nada encontrado por aqui." : "A maré está quieta.";
    emptyText.textContent = state.animals.length ? "Tente outro termo ou limpe o filtro para voltar a navegar." : "Não conseguimos trazer os dados agora. Tente atualizar em alguns segundos.";
    retryButton.textContent = state.animals.length ? "Limpar filtros" : "Tentar novamente";
    return;
  }
  emptyState.hidden = true;
  grid.innerHTML = items.map(createCard).join("");
  setStatus(`${items.length} ${items.length === 1 ? "espécie encontrada" : "espécies encontradas"} na coleção.`);
}

async function loadAnimals() {
  showLoading();
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    redirects: "1",
    uselang: "pt-br",
    prop: "extracts|pageimages|info",
    exintro: "1",
    explaintext: "1",
    exsentences: "3",
    piprop: "thumbnail",
    pithumbsize: "900",
    inprop: "url",
    titles: catalog.map((animal) => animal.title).join("|"),
  });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`API respondeu ${response.status}`);
    const data = await response.json();
    const pages = Object.values(data?.query?.pages || {});
    state.animals = pages
      .filter((page) => !page.missing)
      .map((page) => {
        const source = catalog.find((animal) => animal.title.toLocaleLowerCase("pt-BR") === page.title.toLocaleLowerCase("pt-BR")) || catalog.find((animal) => page.title.toLocaleLowerCase("pt-BR").includes(animal.title.toLocaleLowerCase("pt-BR"))) || {};
        return {
          title: page.title,
          category: source.category || "Vida marinha",
          color: source.color || "#2a8fa2",
          extract: page.extract,
          image: page.thumbnail?.source,
          url: page.fullurl,
        };
      });
    finishLoading();
    state.animals.sort((a, b) => catalog.findIndex((item) => item.title === a.title) - catalog.findIndex((item) => item.title === b.title));
    renderAnimals();
  } catch (error) {
    console.error(error);
    state.animals = [];
    finishLoading();
    setStatus("Não foi possível consultar a API agora.", "error");
    grid.innerHTML = "";
    emptyState.hidden = false;
    emptyTitle.textContent = "A maré está quieta.";
    emptyText.textContent = "A fonte pública não respondeu. Tente atualizar em alguns segundos.";
    retryButton.textContent = "Tentar novamente";
  }
}

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderAnimals();
});
categorySelect.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderAnimals();
});
refreshButton.addEventListener("click", loadAnimals);
retryButton.addEventListener("click", () => {
  if (state.animals.length) {
    state.search = "";
    state.category = "Todos";
    searchInput.value = "";
    categorySelect.value = "Todos";
    renderAnimals();
  } else {
    loadAnimals();
  }
});
themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = isDark ? "light" : "dark";
  themeToggle.setAttribute("aria-label", isDark ? "Ativar tema escuro" : "Ativar tema claro");
});

loadAnimals();

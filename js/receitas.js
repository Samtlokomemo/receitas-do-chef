const API_BASE = "https://api-receitas-pi.vercel.app";
const LIMIT = 10;
const REQUEST_LIMIT = 100;
const EXCLUDED_RECIPE_NAMES = [
    "panquecas americanas",
    "curry de grão-de-bico",
    "salada grega",
    "tournedos de wagyu com salsa de mirtilo e menta",
    "sushi de atum com molho teriyaki",
    "risotto de queijo com molho de salsa",
    "gado à mineira",
    "bisteca de carne com molho bbq",
    "bistecas de carne com molho bbq",
    "bisteca a flamenga",
    "bisteca à flamenga",
    "Tournedos de Wagyu com Molho de Menta e Abacate",
];
const imageLoadCache = new Map();

const state = {
    page: 1,
    query: "",
    type: "todos",
    loading: false,
    recipes: [],
    totalItems: 0,
    totalPages: null,
    hasNext: false,
    requestId: 0,
};

const elements = {
    form: document.querySelector("#search-form"),
    search: document.querySelector("#search-input"),
    filters: document.querySelector("#filter-pills"),
    grid: document.querySelector("#recipes-grid"),
    status: document.querySelector("#status-message"),
    prev: document.querySelector("#prev-page"),
    next: document.querySelector("#next-page"),
    pageIndicator: document.querySelector("#page-indicator"),
    modal: document.querySelector("#recipe-modal"),
    modalContent: document.querySelector("#modal-content"),
};

function debounce(fn, delay = 500) {
    let timer;
    return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), delay);
    };
}

function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizeResponse(payload) {
    if (Array.isArray(payload)) {
        return { items: payload, totalPages: null, totalItems: null };
    }

    const items = payload?.receitas
        || payload?.data
        || payload?.results
        || payload?.items
        || payload?.docs
        || [];

    const meta = payload?.meta || payload?.pagination || payload || {};
    const totalPages = meta.totalPages
        || meta.total_pages
        || meta.totalPaginas
        || meta.total_paginas
        || meta.pages
        || null;

    const totalItems = meta.total
        || meta.totalItems
        || meta.total_itens
        || meta.count
        || null;

    return {
        items: Array.isArray(items) ? items : [],
        totalPages: totalPages ? Number(totalPages) : null,
        totalItems: totalItems ? Number(totalItems) : null,
    };
}

function normalizeText(value = "") {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

const EXCLUDED_RECIPES = new Set(EXCLUDED_RECIPE_NAMES.map(normalizeText));

function getRecipeImage(recipe) {
    return String(recipe?.link_imagem || "").trim();
}

function isValidImageUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (error) {
        return false;
    }
}

function shouldShowRecipe(recipe) {
    const title = normalizeText(recipe?.receita);
    const image = getRecipeImage(recipe);
    return Boolean(title)
        && !EXCLUDED_RECIPES.has(title)
        && Boolean(image)
        && isValidImageUrl(image);
}

function canLoadImage(src) {
    if (imageLoadCache.has(src)) {
        return Promise.resolve(imageLoadCache.get(src));
    }

    return new Promise((resolve) => {
        const image = new Image();
        const timeout = window.setTimeout(() => {
            imageLoadCache.set(src, false);
            resolve(false);
        }, 4000);

        image.onload = () => {
            window.clearTimeout(timeout);
            imageLoadCache.set(src, true);
            resolve(true);
        };

        image.onerror = () => {
            window.clearTimeout(timeout);
            imageLoadCache.set(src, false);
            resolve(false);
        };

        image.src = src;
    });
}

async function onlyRecipesWithWorkingImages(recipes) {
    const checks = await Promise.all(recipes.map(async (recipe) => ({
        recipe,
        hasImage: await canLoadImage(getRecipeImage(recipe)),
    })));

    return checks
        .filter((item) => item.hasImage)
        .map((item) => item.recipe);
}

function imageMarkup(recipe, className = "", removeOnError = false) {
    const image = getRecipeImage(recipe);
    const title = escapeHtml(recipe?.receita || "Receita");

    if (!image) {
        return `<div class="image-fallback ${className}" aria-hidden="true"><i class="fas fa-utensils"></i></div>`;
    }

    const onError = removeOnError
        ? `handleRecipeImageError('${escapeHtml(recipe.id)}')`
        : "this.replaceWith(createImageFallback())";

    return `<img class="${className}" src="${escapeHtml(image)}" alt="${title}" loading="lazy" onerror="${onError}">`;
}

function createImageFallback() {
    const fallback = document.createElement("div");
    fallback.className = "image-fallback";
    fallback.setAttribute("aria-hidden", "true");
    fallback.innerHTML = '<i class="fas fa-utensils"></i>';
    return fallback;
}

function summarize(value, max = 92) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (text.length <= max) {
        return text;
    }

    return `${text.slice(0, max).trim()}...`;
}

function baseIngredientNames(recipe) {
    const base = recipe?.IngredientesBase;
    if (!Array.isArray(base)) {
        return "";
    }

    return base
        .flatMap((item) => item?.nomesIngrediente || [])
        .filter(Boolean)
        .join(", ");
}

function buildPaginatedUrl(page = 1) {
    const params = new URLSearchParams();

    if (state.query) {
        params.set("descricao", state.query);
        params.set("page", page);
        params.set("limit", REQUEST_LIMIT);
        return `${API_BASE}/receitas/descricao?${params.toString()}`;
    }

    params.set("page", page);
    params.set("limit", REQUEST_LIMIT);
    return `${API_BASE}/receitas/todas?${params.toString()}`;
}

function setLoading() {
    state.loading = true;
    elements.status.className = "status-message";
    elements.status.textContent = "Carregando receitas...";
    elements.grid.innerHTML = Array.from({ length: 8 }, () => '<div class="skeleton" aria-hidden="true"></div>').join("");
    updatePagination();
}

function setError(message) {
    elements.grid.innerHTML = "";
    elements.status.className = "status-message error";
    elements.status.textContent = message;
}

function renderRecipes(recipes, totalItems) {
  if (!recipes.length) {
    elements.grid.innerHTML = "";
    elements.status.textContent = "Nenhuma receita encontrada. Tente outro termo ou filtro.";
    return;
  }

  elements.status.textContent = `${totalItems} receita${totalItems > 1 ? "s" : ""} encontrada${totalItems > 1 ? "s" : ""}.`;
  elements.grid.innerHTML = recipes.map((recipe) => {
    const favIcon = typeof isFavorite === "function" && isFavorite(recipe.id) ? "fas" : "far";
    return `
    <button class="recipe-card" type="button" data-id="${escapeHtml(recipe.id)}" aria-label="Ver detalhes de ${escapeHtml(recipe.receita || "receita")}">
      ${imageMarkup(recipe, "", true)}
      <div class="recipe-card-body">
        <span class="recipe-type">${escapeHtml(recipe.tipo || "receita")}</span>
        <h3>${escapeHtml(recipe.receita || "Receita sem nome")}</h3>
        <p>${escapeHtml(summarize(recipe.ingredientes || baseIngredientNames(recipe) || recipe.modo_preparo))}</p>
      </div>
      <span class="fav-btn" data-fav-id="${escapeHtml(recipe.id)}" aria-label="Favoritar receita"><i class="${favIcon} fa-heart"></i></span>
    </button>
  `}).join("");
}

function getVisibleRecipes() {
    const start = (state.page - 1) * LIMIT;
    return state.recipes.slice(start, start + LIMIT);
}

function renderCurrentPage() {
    state.totalItems = state.recipes.length;
    state.totalPages = Math.max(1, Math.ceil(state.totalItems / LIMIT));
    if (state.page > state.totalPages) {
        state.page = state.totalPages;
    }

    state.hasNext = state.page < state.totalPages;
    renderRecipes(getVisibleRecipes(), state.totalItems);
    updatePagination();
}

function handleRecipeImageError(id) {
    const nextRecipes = state.recipes.filter((recipe) => String(recipe.id) !== String(id));
    if (nextRecipes.length === state.recipes.length) {
        return;
    }

    state.recipes = nextRecipes;
    renderCurrentPage();
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Nao foi possivel carregar as receitas.");
    }

    return response.json();
}

async function fetchPaginatedRecipes() {
    const firstPayload = await fetchJson(buildPaginatedUrl(1));
    const firstPage = normalizeResponse(firstPayload);
    const totalPages = firstPage.totalPages || 1;
    const allItems = [...firstPage.items];

    if (totalPages > 1) {
        const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) => index + 2);
        const payloads = await Promise.all(remainingPages.map((page) => fetchJson(buildPaginatedUrl(page))));
        payloads.forEach((payload) => {
            allItems.push(...normalizeResponse(payload).items);
        });
    }

    return allItems;
}

async function fetchRecipes() {
    const requestId = state.requestId + 1;
    state.requestId = requestId;
    setLoading();

    try {
        const payload = state.type !== "todos" && !state.query
            ? await fetchJson(`${API_BASE}/receitas/tipo/${encodeURIComponent(state.type)}`)
            : await fetchPaginatedRecipes();

        if (requestId !== state.requestId) {
            return;
        }

        const { items } = normalizeResponse(payload);
        const visibleRecipes = items.filter(shouldShowRecipe);
        const recipesWithImages = await onlyRecipesWithWorkingImages(visibleRecipes);

        if (requestId !== state.requestId) {
            return;
        }

        state.recipes = recipesWithImages;
        renderCurrentPage();
    } catch (error) {
        if (requestId !== state.requestId) {
            return;
        }

        state.recipes = [];
        setError("Nao conseguimos buscar as receitas agora. Verifique sua conexao e tente novamente.");
    } finally {
        if (requestId === state.requestId) {
            state.loading = false;
            updatePagination();
        }
    }
}

function updatePagination() {
    const hasKnownPrevious = state.page > 1;

    elements.pageIndicator.textContent = `Pagina ${state.page}${state.totalPages ? ` de ${state.totalPages}` : ""}`;

    elements.prev.disabled = state.loading || !hasKnownPrevious;
    elements.next.disabled = state.loading || !state.hasNext;
}

function setActiveFilter(type) {
    state.type = type;
    state.page = 1;

    elements.filters.querySelectorAll(".pill").forEach((button) => {
        const isActive = button.dataset.type === type;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    fetchRecipes();
}

function splitToItems(value) {
    if (Array.isArray(value)) {
        return value.filter(Boolean).map(String);
    }

    return String(value || "")
        .split(/\r?\n|;|,(?=\s*[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ0-9])/)
        .map((item) => item.trim().replace(/^[-*]\s*/, ""))
        .filter(Boolean);
}

function ingredientList(recipe) {
    const ingredients = splitToItems(recipe.ingredientes || baseIngredientNames(recipe));

    if (!ingredients.length) {
        return "<p class=\"preparation\">Ingredientes nao informados.</p>";
    }

    return `<ul>${ingredients.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function detailMarkup(recipe) {
    return `
        <div class="modal-hero">
            ${imageMarkup(recipe)}
        </div>
        <div class="modal-body">
            <span class="recipe-type">${escapeHtml(recipe.tipo || "receita")}</span>
            <h2 id="modal-title">${escapeHtml(recipe.receita || "Receita sem nome")}</h2>
            <div class="detail-columns">
                <section class="detail-block">
                    <h3>Ingredientes</h3>
                    ${ingredientList(recipe)}
                </section>
                <section class="detail-block">
                    <h3>Modo de preparo</h3>
                    <div class="preparation">${escapeHtml(recipe.modo_preparo || "Modo de preparo nao informado.")}</div>
                </section>
            </div>
        </div>
    `;
}
function animateRecipeContent() {
    if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const title = elements.modalContent.querySelector("#modal-title");
    const sections = elements.modalContent.querySelectorAll(".detail-block");
    const listItems = elements.modalContent.querySelectorAll(".detail-block li");
    const preparation = elements.modalContent.querySelector(".preparation");

    const tl = window.gsap.timeline({ defaults: { ease: "power2.out" } });

    if (title) {
        tl.from(title, {
            opacity: 0,
            y: 20,
            duration: 0.4
        });
    }

    if (sections.length) {
        tl.from(sections, {
            opacity: 0,
            y: 20,
            duration: 0.4,
            stagger: 0.15
        }, "-=0.2");
    }

    if (listItems.length) {
        tl.from(listItems, {
            opacity: 0,
            x: -15,
            duration: 0.3,
            stagger: 0.05
        }, "-=0.2");
    }

    if (preparation) {
        tl.from(preparation, {
            opacity: 0,
            y: 15,
            duration: 0.4
        }, "-=0.2");
    }
}

async function showRecipeDetails(id) {
    elements.modalContent.innerHTML = '<div class="modal-body"><p class="preparation">Carregando detalhes...</p></div>';
    openModal();

    try {
        const response = await fetch(`${API_BASE}/receitas/${encodeURIComponent(id)}`);
        if (!response.ok) {
            throw new Error("Detalhes indisponiveis.");
        }

        const payload = await response.json();
        const recipe = payload?.receita && typeof payload.receita === "object" ? payload.receita : payload;
        elements.modalContent.innerHTML = detailMarkup(recipe);
        animateRecipeContent();
    } catch (error) {
        elements.modalContent.innerHTML = '<div class="modal-body"><p class="preparation">Nao foi possivel carregar os detalhes desta receita.</p></div>';
    }
}

const handleSearch = debounce((event) => {
    state.query = event.target.value.trim();
    state.page = 1;
    fetchRecipes();
}, 500);

elements.search.addEventListener("input", handleSearch);

elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.query = elements.search.value.trim();
    state.page = 1;
    fetchRecipes();
});

elements.filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-type]");
    if (!button) {
        return;
    }

    setActiveFilter(button.dataset.type);
});

elements.grid.addEventListener("click", (event) => {
  const favBtn = event.target.closest(".fav-btn");
  if (favBtn && typeof toggleFavorite === "function") {
    event.stopPropagation();
    toggleFavorite(favBtn.dataset.favId);
    const icon = favBtn.querySelector("i");
    icon.classList.toggle("fas");
    icon.classList.toggle("far");
    return;
  }

  const card = event.target.closest(".recipe-card");
  if (card?.dataset.id) {
    showRecipeDetails(card.dataset.id);
  }
});

elements.prev.addEventListener("click", () => {
    if (state.page > 1) {
        state.page -= 1;
        renderCurrentPage();
    }
});

elements.next.addEventListener("click", () => {
    state.page += 1;
    renderCurrentPage();
});

elements.modal.addEventListener("click", (event) => {
    const clickedBackdrop = event.target.classList.contains("modal-backdrop");
    const clickedCloseButton = event.target.closest(".modal-close");

    if (clickedBackdrop || clickedCloseButton) {
        closeModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.modal.classList.contains("open")) {
        closeModal();
    }
});

setActiveFilter("todos");

// Botão acessiblidade

const accessibilityBtn =
document.getElementById("accessibility-btn");

const accessibilityPanel =
document.getElementById("accessibility-panel");

const closePanel =
document.getElementById("close-panel");

/* Abrir painel */

accessibilityBtn.addEventListener("click", () => {
    accessibilityPanel.classList.add("open");
});

/* Fechar painel */

closePanel.addEventListener("click", () => {
    accessibilityPanel.classList.remove("open");
});

/* Trocar tema */

function setTheme(theme){

    document.body.classList.remove(
        "dark-mode",
        "contrast-light",
        "contrast-dark"
    );

    if(theme === "dark"){
        document.body.classList.add("dark-mode");
    }

    if(theme === "contrast-light"){
        document.body.classList.add("contrast-light");
    }

    if(theme === "contrast-dark"){
        document.body.classList.add("contrast-dark");
    }

    localStorage.setItem("theme", theme);
}

/* Carregar tema salvo */

const savedTheme = localStorage.getItem("theme");

if(savedTheme){
    setTheme(savedTheme);
}



// Navegação por teclado

let lastFocusedElement = null;
let modalAnimation = null;
let isModalClosing = false;

function shouldAnimateModal() {
    return Boolean(window.gsap) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function modalParts() {
    return {
        backdrop: elements.modal.querySelector(".modal-backdrop"),
        card: elements.modal.querySelector(".modal-card"),
    };
}

function stopModalAnimation() {
    if (modalAnimation) {
        modalAnimation.kill();
        modalAnimation = null;
    }
}

function resetModalAnimationStyles() {
    const { backdrop, card } = modalParts();

    if (window.gsap) {
        window.gsap.set([backdrop, card], { clearProps: "all" });
    }
}

function openModal() {
    if (elements.modal.classList.contains("open") && !isModalClosing) {
        return;
    }

    lastFocusedElement = document.activeElement;
    isModalClosing = false;
    stopModalAnimation();
    
    elements.modal.classList.add("open");
    elements.modal.setAttribute("aria-hidden", "false");
    elements.modal.style.pointerEvents = "";
    document.body.style.overflow = "hidden";

    const focusCloseButton = () => {
        const closeButton = elements.modal.querySelector('.modal-close');
        if (closeButton) closeButton.focus();
    };

    focusCloseButton();

    if (!shouldAnimateModal()) {
        resetModalAnimationStyles();
        return;
    }

    const { backdrop, card } = modalParts();

    modalAnimation = window.gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
            modalAnimation = null;
        },
    });

    modalAnimation
        .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.18 })
        .fromTo(
            card,
            { autoAlpha: 0, y: 28, scale: 0.98 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.28 },
            0.03
        );
}

function closeModal() {
    if (!elements.modal.classList.contains("open") || isModalClosing) {
        return;
    }

    isModalClosing = true;
    stopModalAnimation();
    elements.modal.setAttribute("aria-hidden", "true");
    elements.modal.style.pointerEvents = "none";
    document.body.style.overflow = "";

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }

    const finishClose = () => {
        elements.modal.classList.remove("open");
        elements.modal.style.pointerEvents = "";
        resetModalAnimationStyles();
        isModalClosing = false;
    };

    if (!shouldAnimateModal()) {
        finishClose();
        return;
    }

    const { backdrop, card } = modalParts();

    modalAnimation = window.gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
            modalAnimation = null;
            finishClose();
        },
    });

    modalAnimation
        .to(card, { autoAlpha: 0, y: 18, scale: 0.98, duration: 0.2 })
        .to(backdrop, { opacity: 0, duration: 0.16 }, 0.05);
}

elements.modal.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;

    const focusableElements = elements.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
        if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault(); 
        }
    } else {
        if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault(); 
        }
    }
});

function openAccessibilityPanel() {
    lastFocusedElementPanel = document.activeElement;
    
    accessibilityPanel.classList.add("open");
    accessibilityBtn.setAttribute("aria-expanded", "true"); 
    setTimeout(() => {
        closePanel.focus();
    }, 310); 
}

function closeAccessibilityPanel() {
    accessibilityPanel.classList.remove("open");
    accessibilityBtn.setAttribute("aria-expanded", "false");

    if (lastFocusedElementPanel) {
        lastFocusedElementPanel.focus();
    }
}

accessibilityBtn.addEventListener("click", openAccessibilityPanel);
closePanel.addEventListener("click", closeAccessibilityPanel);

accessibilityPanel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeAccessibilityPanel();
        return;
    }

    if (event.key !== 'Tab') return;

    const focusableElements = accessibilityPanel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) { 
        if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault(); 
        }
    } else { 
        if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault(); 
        }
    }
});

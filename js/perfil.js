const API_BASE = "https://api-receitas-pi.vercel.app";

const user = getLoggedUser();

if (!user) {
window.location.href = "login.html";
}

document.getElementById("profile-avatar").textContent = user.avatar;
document.getElementById("profile-name").textContent = user.name;
document.getElementById("profile-email").textContent = user.email;
document.getElementById("profile-bio").textContent = user.bio;

document.getElementById("logout-btn").addEventListener("click", () => {
logout();
});

async function loadFavorites() {
const favStatus = document.getElementById("fav-status");
const favGrid = document.getElementById("fav-grid");

if (!user.favorites.length) {
favStatus.textContent = "Voce ainda nao tem receitas favoritas. Explore o catalogo e favorite as que mais gostar!";
favGrid.innerHTML = "";
return;
}

favStatus.textContent = "Carregando favoritas...";
favGrid.innerHTML = Array.from({ length: 3 }, () => '<div class="skeleton" aria-hidden="true"></div>').join("");

try {
const recipes = await Promise.all(
user.favorites.map(async (id) => {
const response = await fetch(`${API_BASE}/receitas/${encodeURIComponent(id)}`);
if (!response.ok) return null;
const payload = await response.json();
return payload?.receita && typeof payload.receita === "object" ? payload.receita : payload;
})
);

const valid = recipes.filter(Boolean);
favStatus.textContent = `${valid.length} receita${valid.length > 1 ? "s" : ""} favorita${valid.length > 1 ? "s" : ""}`;

favGrid.innerHTML = valid.map((recipe) => {
const image = String(recipe?.link_imagem || "").trim();
const title = recipe?.receita || "Receita";
const type = recipe?.tipo || "receita";
const imgTag = image
? `<img src="${image}" alt="${title}" loading="lazy" onerror="this.replaceWith(createImageFallback())">`
: `<div class="image-fallback" aria-hidden="true"><i class="fas fa-utensils"></i></div>`;

return `
<a class="recipe-card" href="index.html" aria-label="Ver ${title}">
${imgTag}
<div class="recipe-card-body">
<span class="recipe-type">${type}</span>
<h3>${title}</h3>
</div>
</a>
`;
}).join("");
} catch (error) {
favStatus.textContent = "Nao foi possivel carregar as receitas favoritas.";
favGrid.innerHTML = "";
}
}

function createImageFallback() {
const fallback = document.createElement("div");
fallback.className = "image-fallback";
fallback.setAttribute("aria-hidden", "true");
fallback.innerHTML = '<i class="fas fa-utensils"></i>';
return fallback;
}

loadFavorites();

// Acessibilidade - Painel
(function () {
  const accessibilityBtn = document.getElementById("accessibility-btn");
  const accessibilityPanel = document.getElementById("accessibility-panel");
  const closePanel = document.getElementById("close-panel");
  let lastFocusedElementPanel = null;

  function setTheme(theme) {
    document.body.classList.remove("dark-mode", "contrast-light", "contrast-dark");

    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    }
    if (theme === "contrast-light") {
      document.body.classList.add("contrast-light");
    }
    if (theme === "contrast-dark") {
      document.body.classList.add("contrast-dark");
    }

    localStorage.setItem("theme", theme);
  }

  window.setTheme = setTheme;

  function openAccessibilityPanel() {
    lastFocusedElementPanel = document.activeElement;
    accessibilityPanel.classList.add("open");
    accessibilityBtn.setAttribute("aria-expanded", "true");
    setTimeout(function () {
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

  accessibilityPanel.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeAccessibilityPanel();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = accessibilityPanel.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
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

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    setTheme(savedTheme);
  }
})();

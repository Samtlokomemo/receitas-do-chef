const USERS = {
  "test@gmail": {
    password: "1234",
    name: "Chef Teste",
    avatar: "CT",
    bio: "Amante de cozinha caseira e receitas praticas.",
    favorites: [],
  },
};

function getLoggedUser() {
  const email = localStorage.getItem("loggedUser");
  if (!email) return null;
  return { email, ...USERS[email] } || null;
}

function login(email, password) {
  const user = USERS[email];
  if (!user || user.password !== password) return null;
  localStorage.setItem("loggedUser", email);
  return { email, ...user };
}

function logout() {
  if (confirm("Deseja sair da conta?")) {
    localStorage.removeItem("loggedUser");
    window.location.reload();
  }
}

function toggleFavorite(recipeId) {
  const email = localStorage.getItem("loggedUser");
  if (!email || !USERS[email]) return false;

  const favs = USERS[email].favorites;
  const index = favs.indexOf(String(recipeId));

  if (index === -1) {
    favs.push(String(recipeId));
  } else {
    favs.splice(index, 1);
  }

  return true;
}

function isFavorite(recipeId) {
  const email = localStorage.getItem("loggedUser");
  if (!email || !USERS[email]) return false;
  return USERS[email].favorites.includes(String(recipeId));
}

function updateTopbar() {
  const link = document.querySelector(".login-link");
  if (!link) return;

  const user = getLoggedUser();
  if (user) {
    link.href = "perfil.html";
    link.textContent = `${user.name}`;
  } else {
    link.href = "login.html";
    link.textContent = "Login";
  }
}

document.addEventListener("DOMContentLoaded", updateTopbar);

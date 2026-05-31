document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.querySelector(".toggle-password");

  togglePassword.addEventListener("click", function () {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    const icon = this.querySelector("i");
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
    this.setAttribute("aria-label", type === "password" ? "Mostrar senha" : "Ocultar senha");
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const user = login(email, password);

    if (user) {
      window.location.href = "perfil.html";
    } else {
      alert("E-mail ou senha inválidos!");
    }
  });

  const loggedUser = getLoggedUser();
  if (loggedUser) {
    window.location.href = "index.html";
  }

  // Acessibilidade - Painel
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
});

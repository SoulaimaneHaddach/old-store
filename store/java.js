document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initMobileNav();
  initProductCatalog();
  initForms();
});

function initParticles() {
  const canvas = document.querySelector(".background");
  if (!canvas || typeof window.Particles === "undefined") {
    return;
  }

  window.Particles.init({
    selector: ".background",
    color: ["#03dac6", "#ff0266", "#7ef9ff", "#ffffff"],
    connectParticles: true,
    maxParticles: 90,
    responsive: [
      {
        breakpoint: 768,
        options: { maxParticles: 45, connectParticles: false },
      },
    ],
  });
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-links");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function parseProductPrice(product) {
  const text =
    product.dataset.price ||
    product.querySelector(".price")?.textContent ||
    product.querySelector(".normal")?.textContent ||
    "0";

  const digits = text.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

function initProductCatalog() {
  const page =
    document.querySelector("[data-product-page]") ||
    document.querySelector(".products")?.closest("body");
  if (!page) return;

  const currentPage = (window.location.pathname.split("/").pop() || "")
    .replace(/\.html$/i, "");
  const defaultCategory = ["camera", "laptops", "drone", "pc"].includes(currentPage)
    ? currentPage
    : "all";

  const grid = page.querySelector(".products");
  const products = Array.from(page.querySelectorAll(".card"));
  if (!grid || !products.length) return;

  const search = page.querySelector("[data-product-search]");
  const sort = page.querySelector("[data-sort]");
  const filters = page.querySelectorAll("[data-category-filter]");
  const emptyState = page.querySelector(".no-results");
  let activeCategory = defaultCategory;

  function render() {
    const query = (search?.value || "").trim().toLowerCase();

    products.forEach((product) => {
      const productCategory = (
        product.dataset.category ||
        defaultCategory ||
        "all"
      ).toLowerCase();
      const title = (
        product.dataset.name ||
        product.querySelector(".title")?.textContent ||
        product.textContent || ""
      )
        .trim()
        .toLowerCase();
      const matchesCategory =
        activeCategory === "all" || productCategory === activeCategory;
      const matchesQuery = !query || title.includes(query);
      product.hidden = !(matchesCategory && matchesQuery);
    });

    const visible = products.filter((product) => !product.hidden);
    if (sort) {
      visible.sort((a, b) => {
        if (sort.value === "price-low") return parseProductPrice(a) - parseProductPrice(b);
        if (sort.value === "price-high") return parseProductPrice(b) - parseProductPrice(a);
        if (sort.value === "name") {
          const nameA = (a.dataset.name || a.querySelector(".title")?.textContent || "").trim().toLowerCase();
          const nameB = (b.dataset.name || b.querySelector(".title")?.textContent || "").trim().toLowerCase();
          return nameA.localeCompare(nameB);
        }
        return 0;
      });

      visible.forEach((product) => grid.appendChild(product));
    }

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible.length === 0);
    }
  }

  filters.forEach((button) =>
    button.addEventListener("click", (event) => {
      const target = button.getAttribute("href");
      const targetPage = target ? target.replace(/\.html$/i, "") : "";
      if (targetPage && targetPage !== currentPage) {
        return;
      }

      event.preventDefault();
      filters.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      activeCategory = button.dataset.categoryFilter || "all";
      render();
    }),
  );

  search?.addEventListener("input", render);
  sort?.addEventListener("change", render);
  render();
}

function initForms() {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    const status = form.querySelector(".form-status");
    const password = form.querySelector('input[type="password"]');
    const email = form.querySelector('input[type="email"]');
    const confirm = form.querySelector("#confirmPassword");
    let message = "";

    if (form.dataset.formType === "signup") {
      if (!email?.value.includes("@"))
        message = "Please enter a valid email address.";
      else if ((password?.value || "").length < 6)
        message = "Password must be at least 6 characters.";
      else if (password?.value !== confirm?.value)
        message = "Passwords do not match.";
    } else if (
      !form.querySelector('[name="username"]')?.value.trim() ||
      !password?.value.trim()
    ) {
      message = "Please enter your username and password.";
    }

    if (message) {
      event.preventDefault();
      if (status) {
        status.textContent = message;
        status.className = "form-status is-error";
      }
    } else if (status) {
      event.preventDefault();
      status.textContent =
        form.dataset.formType === "signup"
          ? "Demo account setup complete."
          : "Demo login successful.";
      status.className = "form-status is-success";
    }
  });
}

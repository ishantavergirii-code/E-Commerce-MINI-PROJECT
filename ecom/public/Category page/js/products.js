import { apiFetch, getToken } from "/assets/js/api.js";

document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("productsContainer");
  const priceFilter = document.getElementById("priceFilter");
  const priceValue = document.getElementById("priceValue");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");
  const cartCountNav = document.getElementById("cartCountNav");

  const formatPrice = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));

  let page = 1;
  const limit = 8;
  let debounce;
  let lastTotalPages = 1;

  const params = new URLSearchParams(window.location.search);
  const initialQ = params.get("query");
  if (initialQ && searchInput) searchInput.value = initialQ;

  async function refreshCartNav() {
    if (!cartCountNav) return;
    if (!getToken()) {
      cartCountNav.textContent = "0";
      return;
    }
    try {
      const { cartCount } = await apiFetch("/api/cart/count", { auth: true });
      cartCountNav.textContent = String(cartCount ?? 0);
    } catch {
      cartCountNav.textContent = "0";
    }
  }

  priceFilter.addEventListener("input", (e) => {
    priceValue.textContent = formatPrice(e.target.value);
  });

  priceFilter.addEventListener("change", () => {
    page = 1;
    loadProducts();
  });
  categoryFilter.addEventListener("change", () => {
    page = 1;
    loadProducts();
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        page = 1;
        loadProducts();
      }, 300);
    });
  }

  const watchImages = [
    "/assets/images/watches/luxury_watch_one.png",
    "/assets/images/watches/modern_smart_watch.png",
    "/assets/images/watches/classic_leather_watch.png",
    "/assets/images/watches/sport_dive_watch.png"
  ];

  function getWatchImage(name) {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return watchImages[hash % watchImages.length];
  }

  async function loadProducts() {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort: "newest",
      priceMax: String(priceFilter.value),
    });
    const q = (searchInput?.value || "").trim();
    if (q) qs.set("search", q);

    const res = await apiFetch(`/api/products?${qs.toString()}`);
    lastTotalPages = res.totalPages || 1;

    let rows = res.data || [];
    const cat = categoryFilter.value;
    if (cat !== "all") {
      rows = rows.filter((_, i) => (cat === "men" ? i % 2 === 0 : i % 2 === 1));
    }

    if (!rows.length) {
      productsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--surface-color); border-radius: 20px; border: 1px dashed var(--border-color);">
                    <h3 style="margin-bottom: 0.5rem; font-weight: 500;">No timepieces match your criteria.</h3>
                    <p style="color: var(--text-secondary);">Try adjusting filters or search.</p>
                </div>`;
      injectPager();
      return;
    }

    productsContainer.innerHTML = rows
      .map(
        (p) => `
            <article class="product">
                <img src="${p.image_url || getWatchImage(p.name)}" alt="${escapeAttr(p.name)}" class="product-image" loading="lazy">
                <div class="product-info">
                    <h2>${escapeHtml(p.name)}</h2>
                    <p>${escapeHtml(p.description)}</p>
                    <div class="product-bottom">
                        <span class="product-price">${formatPrice(p.price)}</span>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                          <a class="buy-btn" style="text-decoration:none;display:inline-flex;align-items:center;justify-content:center;" href="../Product page/Product.html?id=${encodeURIComponent(p.id)}">View</a>
                          <button type="button" class="buy-btn" data-add="${escapeAttr(p.id)}">Add to cart</button>
                          <button type="button" class="buy-btn" data-buy="${escapeAttr(p.id)}">Buy now</button>
                        </div>
                    </div>
                </div>
            </article>`,
      )
      .join("");

    productsContainer.querySelectorAll("button[data-add]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-add");
        try {
          await apiFetch("/api/cart/add", { method: "POST", auth: true, body: { productId: id, quantity: 1 } });
          await refreshCartNav();
          alert("Added to cart");
        } catch (e) {
          alert(e.message || "Login required");
          if ((e.status || 0) === 401) location.href = "../User login-Register/User.html";
        }
      });
    });

    productsContainer.querySelectorAll("button[data-buy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-buy");
        location.href = `../Payment Gateway/Payment.html?source=intent&productId=${encodeURIComponent(id)}`;
      });
    });

    injectPager();
  }

  function injectPager() {
    let el = document.getElementById("catPager");
    if (!el) {
      el = document.createElement("div");
      el.id = "catPager";
      el.style.cssText = "display:flex;gap:12px;justify-content:center;align-items:center;margin:24px 0;flex-wrap:wrap;";
      productsContainer.parentElement.appendChild(el);
    }
    el.innerHTML = `
      <button type="button" id="catPrev" class="buy-btn" style="padding:8px 16px;">Prev</button>
      <span style="opacity:0.85;">Page ${page} / ${lastTotalPages}</span>
      <button type="button" id="catNext" class="buy-btn" style="padding:8px 16px;">Next</button>`;
    const prev = document.getElementById("catPrev");
    const next = document.getElementById("catNext");
    prev.disabled = page <= 1;
    next.disabled = page >= lastTotalPages;
    prev.onclick = () => {
      page = Math.max(1, page - 1);
      loadProducts().catch((e) => alert(e.message));
    };
    next.onclick = () => {
      page = Math.min(lastTotalPages, page + 1);
      loadProducts().catch((e) => alert(e.message));
    };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, "&quot;");
  }

  refreshCartNav();
  loadProducts().catch((e) => {
    productsContainer.innerHTML = `<p style="padding:2rem;">${escapeHtml(e.message)}</p>`;
  });
});

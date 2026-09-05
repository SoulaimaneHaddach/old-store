document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initMobileNav();
  initProductCatalog();
  initForms();
});

function initParticles() {
  const canvas = document.querySelector('.background');
  if (!canvas || typeof window.Particles === 'undefined') {
    return;
  }

  window.Particles.init({
    selector: '.background',
    color: ['#03dac6', '#ff0266', '#7ef9ff', '#ffffff'],
    connectParticles: true,
    maxParticles: 90,
    responsive: [{
      breakpoint: 768,
      options: { maxParticles: 45, connectParticles: false }
    }]
  });
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-links');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initProductCatalog() {
  const page = document.querySelector('[data-product-page]') || document.querySelector('.products')?.closest('body');
  if (!page) return;

  const grid = page.querySelector('.products-grid, .products');
  const products = Array.from(page.querySelectorAll('.product-card, .card'));
  if (!grid || !products.length) return;

  let toolbar = page.querySelector('.catalog-toolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.className = 'catalog-toolbar';
    toolbar.style.cssText = 'display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin:1rem 0;color:#b5bfd3';
    toolbar.innerHTML = '<label>Search <input type="search" data-product-search placeholder="Search products" style="padding:.7rem;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:#172033;color:#edf5ff"></label><label>Sort <select data-sort style="padding:.7rem;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:#172033;color:#edf5ff"><option value="featured">Featured</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option><option value="name">Name</option></select></label>';
    grid.parentElement.insertBefore(toolbar, grid);
  }

  const search = toolbar.querySelector('[data-product-search]');
  const sort = toolbar.querySelector('[data-sort]');
  const filters = page.querySelectorAll('[data-category-filter]');
  let activeCategory = 'all';

  const priceOf = (product) => Number.parseFloat(product.dataset.price || '0') || 0;

  function render() {
    const query = (search?.value || '').trim().toLowerCase();
    products.forEach((product) => {
      const name = (product.dataset.name || product.querySelector('.title')?.textContent || product.textContent).toLowerCase();
      product.hidden = !(name.includes(query) && (activeCategory === 'all' || product.dataset.category === activeCategory));
    });

    const visible = products.filter((product) => !product.hidden);
    if (!grid || !sort) return;
    visible.sort((a, b) => {
      if (sort.value === 'price-low') return priceOf(a) - priceOf(b);
      if (sort.value === 'price-high') return priceOf(b) - priceOf(a);
      if (sort.value === 'name') return (a.dataset.name || '').localeCompare(b.dataset.name || '');
      return 0;
    }).forEach((product) => grid.appendChild(product));
  }

  filters.forEach((button) => button.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    activeCategory = button.dataset.categoryFilter || 'all';
    render();
  }));
  search?.addEventListener('input', render);
  sort?.addEventListener('change', render);
  render();
}

function initForms() {
  const form = document.querySelector('.auth-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    const status = form.querySelector('.form-status');
    const password = form.querySelector('input[type="password"]');
    const email = form.querySelector('input[type="email"]');
    const confirm = form.querySelector('#confirmPassword');
    let message = '';

    if (form.dataset.formType === 'signup') {
      if (!email?.value.includes('@')) message = 'Please enter a valid email address.';
      else if ((password?.value || '').length < 6) message = 'Password must be at least 6 characters.';
      else if (password?.value !== confirm?.value) message = 'Passwords do not match.';
    } else if (!form.querySelector('[name="username"]')?.value.trim() || !password?.value.trim()) {
      message = 'Please enter your username and password.';
    }

    if (message) {
      event.preventDefault();
      if (status) {
        status.textContent = message;
        status.className = 'form-status is-error';
      }
    } else if (status) {
      event.preventDefault();
      status.textContent = form.dataset.formType === 'signup' ? 'Demo account setup complete.' : 'Demo login successful.';
      status.className = 'form-status is-success';
    }
  });
}

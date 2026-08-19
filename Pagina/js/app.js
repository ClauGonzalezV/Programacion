// Immediate theme apply
(function() {
  document.documentElement.setAttribute('data-theme', 'dark');
})();

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  renderOffices();
  initContactForm();
  initNewsletterForm();
  initProductSearch();
  initViewSwitcher();
  initModal();
});

/* --- Navbar Scroll & Mobile Menu --- */
function initNavbar() {
  const header = document.querySelector('.header');
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = navMenu.classList.contains('active') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        if (toggleBtn.querySelector('i')) {
          toggleBtn.querySelector('i').className = 'fa-solid fa-bars';
        }
      });
    });
  }
}

/* --- Live Search Filter --- */
function initProductSearch() {
  const searchInput = document.getElementById('search-products-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    // Filter Banner Links
    const bannerItems = document.querySelectorAll('.banner-link-items li');
    bannerItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (query === '' || text.includes(query)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });

    // Hide empty category cards if no items match
    const categoryCards = document.querySelectorAll('.gladiator-category-card');
    categoryCards.forEach(card => {
      const visibleLinks = card.querySelectorAll('.banner-link-items li[style*="display: block"], .banner-link-items li:not([style*="display: none"])');
      if (query !== '' && visibleLinks.length === 0) {
        card.style.display = 'none';
      } else {
        card.style.display = 'grid';
      }
    });
  });
}

/* --- View Switcher (Banners vs Grid) --- */
function initViewSwitcher() {
  const btnBanners = document.getElementById('btn-view-banners');
  const btnGrid = document.getElementById('btn-view-grid');
  const bannersStack = document.getElementById('banners-view-stack');
  const gridContainer = document.getElementById('grid-view-container');

  if (!btnBanners || !btnGrid || !bannersStack || !gridContainer) return;

  btnBanners.addEventListener('click', () => {
    btnBanners.classList.add('active');
    btnGrid.classList.remove('active');
    bannersStack.style.display = 'flex';
    gridContainer.style.display = 'none';
  });

  btnGrid.addEventListener('click', () => {
    btnGrid.classList.add('active');
    btnBanners.classList.remove('active');
    bannersStack.style.display = 'none';
    gridContainer.style.display = 'grid';
    renderGridProducts('all');
  });
}

/* --- Render Grid View Products --- */
function renderGridProducts(categoryFilter = 'all') {
  const container = document.getElementById('grid-view-container');
  if (!container) return;

  const filtered = categoryFilter === 'all' 
    ? GLADIATOR_SOLUTIONS 
    : GLADIATOR_SOLUTIONS.filter(s => s.category === categoryFilter);

  container.innerHTML = filtered.map(item => {
    const imgDisplay = item.image 
      ? `<img src="${item.image}" alt="${item.name}" style="max-height: 140px; max-width: 100%; object-fit: contain;">`
      : item.imageSvg;

    return `
    <div class="product-card">
      <div class="card-top">
        <span class="card-badge">${item.badge}</span>
        <div class="card-icon"><i class="${item.icon}"></i></div>
      </div>
      <div class="card-image-box">
        ${imgDisplay}
      </div>
      <h3 class="card-title">${item.name}</h3>
      <p class="card-subtitle">${item.subtitle}</p>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.2rem;">${item.description}</p>
      <ul class="card-specs-list">
        ${Object.entries(item.specs).map(([key, val]) => `
          <li class="card-spec-item">
            <i class="fa-solid fa-circle-check"></i>
            <span><strong>${key}:</strong> ${val}</span>
          </li>
        `).join('')}
      </ul>
      <div class="card-footer">
        <button onclick="openProductModal('${item.id}')" class="btn btn-primary" style="width: 100%;">
          <i class="fa-solid fa-microchip"></i> Ver Ficha Técnica & Cotizar
        </button>
      </div>
    </div>
  `;
  }).join('');
}

/* --- Product Technical Specification Modal --- */
function openProductModal(productId) {
  const modal = document.getElementById('product-modal');
  const modalTitle = document.getElementById('modal-product-title');
  const modalBody = document.getElementById('modal-product-body');
  const modalWaBtn = document.getElementById('modal-wa-link');

  const product = GLADIATOR_SOLUTIONS.find(p => p.id === productId);
  if (!product || !modal) return;

  modalTitle.textContent = product.name;

  let datasheetsHtml = '';
  if (product.datasheets && product.datasheets.length > 0) {
    datasheetsHtml = `
      <h4 style="color: var(--primary-cyan); font-size: 1.2rem; margin-top: 1.75rem; margin-bottom: 1.25rem; font-family: var(--font-heading); text-align: center;">
        <i class="fa-solid fa-file-pdf"></i> Fichas Técnicas Oficiales de Equipamiento Modelo 501:
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        ${product.datasheets.map(sheet => `
          <div style="background: #ffffff; color: #0f172a; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); display: flex; flex-direction: column; border: 1px solid #cbd5e1;">
            <!-- Header Bar -->
            <div style="background: #2563eb; color: #ffffff; padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between;">
              <div style="font-family: var(--font-heading); font-weight: 800; font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase;">
                ${sheet.title}
              </div>
              <div style="background: #ffffff; color: #1e3a8a; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 800; font-size: 0.7rem;">
                RFID
              </div>
            </div>

            <!-- Content Area -->
            <div style="padding: 1.25rem; flex-grow: 1; display: flex; flex-direction: column; align-items: center;">
              <div style="width: 100%; height: 130px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.5rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center;">
                ${sheet.imageSvg}
              </div>

              <!-- Gladiator Badge -->
              <div style="margin-bottom: 1rem; text-align: center;">
                <span style="background: #0f172a; color: #00f2fe; padding: 0.35rem 0.85rem; border-radius: 4px; font-weight: 800; font-size: 0.75rem; letter-spacing: 1px;">
                  GLADIATOR CONTROL
                </span>
              </div>

              <!-- Features Checklist -->
              <div style="width: 100%; text-align: left;">
                <h6 style="font-size: 0.8rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.25rem;">
                  CARACTERÍSTICAS:
                </h6>
                <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.8rem; color: #334155;">
                  ${sheet.features.map(f => `
                    <li style="margin-bottom: 0.35rem; position: relative; padding-left: 1rem; line-height: 1.35;">
                      <span style="position: absolute; left: 0; color: #2563eb; font-weight: bold;">•</span>
                      ${f}
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  const modalImg = product.image 
    ? `<img src="${product.image}" alt="${product.name}" style="max-height: 220px; max-width: 100%; object-fit: contain;">`
    : product.imageSvg;

  modalBody.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem; background: rgba(0,0,0,0.4); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-glow);">
      ${modalImg}
    </div>
    <p style="font-size: 1.05rem; color: var(--text-main); margin-bottom: 1.25rem; line-height: 1.5;">${product.description}</p>
    
    ${datasheetsHtml}

    <h4 style="color: var(--primary-cyan); font-size: 1.15rem; margin-bottom: 0.75rem; font-family: var(--font-heading);">
      <i class="fa-solid fa-list-check"></i> Resumen de Especificaciones Técnicas
    </h4>
    <table class="modal-specs-table">
      <tbody>
        ${Object.entries(product.specs).map(([key, value]) => `
          <tr>
            <th>${key}</th>
            <td>${value}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  if (modalWaBtn) {
    const text = encodeURIComponent(`Hola Gladiator Control! Deseo consultar cotización e información técnica sobre: ${product.name}`);
    modalWaBtn.href = `https://api.whatsapp.com/send?phone=+56976991350&text=${text}`;
  }

  modal.showModal();
}

function initModal() {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close();
    });
  }
}

/* --- Render Multi-Country Offices --- */
function renderOffices() {
  const container = document.getElementById('offices-container');
  if (!container) return;

  container.innerHTML = GLADIATOR_OFFICES.map(office => `
    <div class="office-card">
      <div class="office-header">
        <h3>${office.country}</h3>
      </div>
      <p class="office-address"><i class="fa-solid fa-location-dot"></i> ${office.address}</p>
      <p class="office-postal">${office.postalCode}</p>
      <div class="office-actions">
        <a href="${office.whatsappLink}" target="_blank" class="btn btn-whatsapp">
          <i class="fa-brands fa-whatsapp"></i> WhatsApp ${office.phone}
        </a>
      </div>
    </div>
  `).join('');
}

/* --- Contact Form Handling --- */
function initContactForm() {
  const form = document.getElementById('main-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name').value;
    const email = document.getElementById('form-email').value;
    const phone = document.getElementById('form-phone').value;
    const msg = document.getElementById('form-msg').value;

    const waText = encodeURIComponent(
      `Hola Gladiator Control!\n` +
      `Nombre: ${name}\n` +
      `Email: ${email}\n` +
      `Teléfono: ${phone}\n` +
      `Mensaje: ${msg}`
    );

    window.open(`https://api.whatsapp.com/send?phone=+56976991350&text=${waText}`, '_blank');
    alert('Serás redirigido a WhatsApp para conectarte directamente con nuestro equipo de atención.');
    form.reset();
  });
}

/* --- Newsletter Form --- */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('¡Gracias por suscribirte a Gladiator Control! Te mantendremos informado sobre nuestras innovaciones.');
    form.reset();
  });
}

import { supabaseClient } from './supabase.js';
const ADMIN_WA = '6288218776877';

let products = [];
let currentSearch = '';

// Theme Toggle dengan animasi smooth
const themeToggle = document.getElementById('themeToggle');
const sunIcon = document.querySelector('.fa-sun');
const moonIcon = document.querySelector('.fa-moon');

themeToggle.onclick = () => {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  
  if (isDark) {
    sunIcon.style.opacity = '0';
    moonIcon.style.opacity = '1';
  } else {
    sunIcon.style.opacity = '1';
    moonIcon.style.opacity = '0';
  }
  
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

// Initialize theme
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  sunIcon.style.opacity = '0';
  moonIcon.style.opacity = '1';
}

// Loading animation
function showLoading() {
  document.getElementById('catalog').innerHTML = `
    <div class="loading-animation">
      <div class="loading-spinner"></div>
      <p>Memuat produk...</p>
    </div>
  `;
}

// Update render function
function render(cat, search = '') {
  let list = products.filter(p => cat === 'all' || p.cat === cat);
  
  if (search) {
    list = list.filter(p => 
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.cat.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (list.length === 0) {
    document.getElementById('catalog').innerHTML = `
      <div class="empty-box">
        <h2>${search ? 'Produk tidak ditemukan' : 'Belum ada produk'}</h2>
        <p>${search ? 'Coba kata kunci lain' : 'Produk akan segera ditambahkan'}</p>
      </div>
    `;
    return;
  }
  
  const html = list.map((p, index) => `
    <div class="card" style="animation-delay: ${index * 0.1}s">
      <img src="${p.thumb}" alt="${p.nama}" loading="lazy">
      <div class="card-body">
        <h3>${p.nama}</h3>
        <span class="stok-badge">Stok ${p.stok}</span>
        <p>Kategori: ${getCategoryName(p.cat)}</p>
        <p><strong>Rp${p.harga.toLocaleString()}</strong></p>
        <button onclick="order('${p.id}')" class="order-btn">
          <i class="fab fa-whatsapp"></i>
          Beli via WhatsApp
        </button>
      </div>
    </div>
  `).join('');
  
  document.getElementById('catalog').innerHTML = html;
  
  // Add animation to cards
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
  });
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

function getCategoryName(cat) {
  const names = {
    'FF': 'Free Fire',
    'ML': 'Mobile Legends',
    'RB': 'Roblox',
    'LAIN': 'Lainnya'
  };
  return names[cat] || cat;
}

// Update order function
window.order = id => {
  const p = products.find(x => x.id === id);
  const text = `Halo Faiz_F JB Store, saya mau beli:
  
📦 Produk: ${p.nama}
🎮 Kategori: ${getCategoryName(p.cat)}
📊 Stok: ${p.stok}
💰 Harga: Rp${p.harga.toLocaleString()}
🔗 Link: ${location.origin}?ref=${p.id}`;
  
  window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(text)}`);
};

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

function performSearch() {
  currentSearch = searchInput.value.trim();
  const activeCat = document.querySelector('.filter.active').dataset.cat;
  render(activeCat, currentSearch);
}

searchBtn.onclick = performSearch;
searchInput.onkeyup = (e) => {
  if (e.key === 'Enter') performSearch();
};

// Filter buttons
document.querySelectorAll('.filter').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSearch = '';
    searchInput.value = '';
    load(btn.dataset.cat);
  };
});

// Admin modal
const modal = document.getElementById('adminModal');
const adminBtn = document.getElementById('adminBtn');
const closeModal = document.querySelector('.close');

adminBtn.onclick = () => modal.style.display = 'flex';
closeModal.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

window.checkAdmin = () => {
  if (document.getElementById('adminPass').value === 'JBF827') {
    modal.style.display = 'none';
    location.href = '/admin';
  } else {
    // Error animation
    const input = document.getElementById('adminPass');
    input.style.animation = 'shake 0.5s';
    setTimeout(() => input.style.animation = '', 500);
  }
};

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(shakeStyle);

// Load products
async function load(cat = 'all') {
  showLoading();
  let q = supabaseClient.from('products').select('*').order('created_at', { ascending: false });
  if (cat !== 'all') q = q.eq('cat', cat);
  const { data } = await q;
  products = data || [];
  render(cat);
}

// Initial load
load();

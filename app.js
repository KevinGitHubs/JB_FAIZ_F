import { supabaseClient } from './supabase.js';

const ADMIN_WA = '6281234567890';
let products = [];

const toggleBtn = document.getElementById('themeToggle');
const icon = document.getElementById('themeIcon');
toggleBtn.onclick = () => {
  const dark = document.documentElement.getAttribute('data-theme') !== 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  icon.src = dark ? 'assets/sun.svg' : 'assets/moon.svg';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
};
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  icon.src = 'assets/sun.svg';
}

async function load(cat = 'all') {
  let q = supabaseClient.from('products').select('*').order('created_at', { ascending: false });
  if (cat !== 'all') q = q.eq('cat', cat);
  const { data } = await q;
  products = data || [];
  render(cat);
}
function render(cat) {
  const list = products.filter(p => cat === 'all' || p.cat === cat);
  const html = list.map(p => `
    <div class="card">
      <img src="${p.thumb}" alt="${p.nama}">
      <div class="card-body">
        <h3>${p.nama}</h3>
        <span class="stok-badge">Stok ${p.stok}</span>
        <p>Kategori: ${p.cat}</p>
        <p><strong>Rp${p.harga.toLocaleString()}</strong></p>
        <button onclick="order('${p.id}')">Beli via WhatsApp</button>
      </div>
    </div>
  `).join('');
  document.getElementById('catalog').innerHTML = html;
}
window.order = id => {
  const p = products.find(x => x.id === id);
  const text = `Halo, saya mau beli:
- Nama: ${p.nama}
- Kategori: ${p.cat}
- Stok: ${p.stok}
- Harga: Rp${p.harga.toLocaleString()}
- Link: ${location.origin}?ref=${p.id}`;
  open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(text)}`);
};

document.querySelectorAll('.filter').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    load(btn.dataset.cat);
  };
});

load();
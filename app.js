import { supabaseClient } from './supabase.js';
const ADMIN_WA = '6281312345678'; // <-- ganti nomor kamu
let products = [];

const toggleBtn = document.getElementById('themeToggle');
const icon = document.getElementById('themeIconPath');

toggleBtn.onclick = () => {
  const dark = document.documentElement.getAttribute('data-theme') !== 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  icon.setAttribute('d', dark
    ? 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1-1-1v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-1 1zM5.636 6.636a1 1 0 0 1 1.414-1.414l1.414 1.414a1 1 0 1 1-1.414 1.414L5.636 6.636zm11.314 11.314a1 1 0 0 1 1.414-1.414l1.414 1.414a1 1 0 0 1-1.414 1.414l-1.414-1.414z'
    : 'M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c.44-.06.9-.1 1.36-.1z');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
};
if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  icon.setAttribute('d', 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1zm0 18a1 1 0 0 1-1-1v-2a1 1 0 0 1 2 0v2a1 1 0 0 1-1 1zM5.636 6.636a1 1 0 0 1 1.414-1.414l1.414 1.414a1 1 0 1 1-1.414 1.414L5.636 6.636zm11.314 11.314a1 1 0 0 1 1.414-1.414l1.414 1.414a1 1 0 0 1-1.414 1.414l-1.414-1.414z');
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
  if (list.length === 0) {
    document.getElementById('catalog').innerHTML = `
      <div class="empty-box">
        <h2>Aduh Belum Ada Stock Ni Brayy</h2>
        <p>Silakan kembali lagi nanti atau hubungi admin.</p>
      </div>
    `;
    return;
  }
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

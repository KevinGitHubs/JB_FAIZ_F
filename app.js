import { db, collection, onSnapshot } from './firebase-config.js';

const catalog = document.getElementById('catalog');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
let products = [];

// Realtime listener
onSnapshot(collection(db, 'products'), snap => {
  products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  render('all', '');
});

function render(cat = 'all', search = '') {
  let list = products.filter(p => cat === 'all' || p.cat === cat);
  if (search) {
    list = list.filter(p =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.cat.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (list.length === 0) {
    catalog.innerHTML = `
      <div class="empty-box">
        <h2>Belum ada produk</h2>
        <p>Produk akan segera ditambahkan</p>
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
        <p>Kategori: ${getCategoryName(p.cat)}</p>
        ${p.deskripsi ? `<p class="desc">${p.deskripsi}</p>` : ''}
        <p><strong>Rp${p.harga.toLocaleString()}</strong></p>
        <button onclick="order('${p.id}')">Beli via WhatsApp</button>
      </div>
    </div>
  `).join('');
  catalog.innerHTML = html;
}

window.order = id => {
  const p = products.find(x => x.id === id);
  const text = `Halo FaizF JB Store, saya mau beli:
📦 Produk: ${p.nama}
🎮 Kategori: ${getCategoryName(p.cat)}
📊 Stok: ${p.stok}
💰 Harga: Rp${p.harga.toLocaleString()}
${p.deskripsi ? '📝 ' + p.deskripsi : ''}
🔗 Link: ${location.origin}?ref=${p.id}`;
  open(`https://wa.me/6288218776877?text=${encodeURIComponent(text)}`);
};

searchBtn.onclick = () => render(document.querySelector('.filter.active').dataset.cat, searchInput.value.trim());
searchInput.onkeyup = e => { if (e.key === 'Enter') searchBtn.click(); };

document.querySelectorAll('.filter').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render(btn.dataset.cat, searchInput.value.trim());
  };
});

function getCategoryName(cat) {
  const names = { FF: 'Free Fire', ML: 'Mobile Legends', RB: 'Roblox', LAIN: 'Lainnya' };
  return names[cat] || cat;
}

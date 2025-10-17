// ==========================
//  CONFIG FIREBASE (GANTI DENGAN PUNYA KAMU)
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyBv7gQRRZ43Ks6niAWb-zvd9L6Pj2zUMM0",
  authDomain: "dbfsv2.firebaseapp.com",
  projectId: "dbfsv2",
  storageBucket: "dbfsv2.firebasestorage.app",
  messagingSenderId: "416095859405",
  appId: "1:416095859405:web:4c6fbf508526eaa256af84",
  measurementId: "G-FZ0MYEJVDF"
};

// Inisialisasi Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ==========================
//  VARIABEL GLOBAL
// ==========================
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let tickets = Number(localStorage.getItem('tickets')) || 0;
let currentType = 'all';
let currentCat = 'all';
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// ==========================
//  UI UPDATE
// ==========================
function updateCartUI() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cartCount').innerText = total;
}
function updateTicketUI() {
  document.getElementById('ticketCount').innerText = tickets;
}

// ==========================
//  REALTIME PRODUK (FIRESTORE)
// =========================>
firebase.firestore().collection('products').onSnapshot(snap => {
  products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderByType(currentType, document.getElementById('searchInput').value);
  updateTicketUI();
});

// ==========================
//  RENDER BY TIPE & KATEGORI
// ==========================
function renderByType(tipe = 'all', search = '') {
  let list = products.filter(p => (tipe === 'all' || p.tipe === tipe) && (currentCat === 'all' || p.cat === currentCat));
  if (search) {
    list = list.filter(p => p.nama.toLowerCase().includes(search.toLowerCase()));
  }
  if (list.length === 0) {
    document.getElementById('catalog').innerHTML = `<div class="empty-box"><h2>Belum ada produk ${tipe}</h2><p>Admin akan segera menambahkan.</p></div>`;
    return;
  }
  const html = list.map((p, index) => {
    const isFood = p.tipe === 'makanan';
    const isWish = wishlist.includes(p.id);
    return `
      <div class="card" style="animation-delay: ${index * 0.1}s">
        <img src="${p.thumb}" alt="${p.nama}">
        <button class="wishlist-btn ${isWish ? 'active' : ''}" onclick="toggleWishlist('${p.id}')"><i class="fas fa-heart"></i></button>
        <div class="card-body">
          <h3>${p.nama}</h3>
          <p class="cat">${getCategoryName(p.cat)}</p>
          ${isFood ? `<p class="stok-only">Stok: <strong>${p.stok}</strong></p>` : `<p class="dm">DM: ${p.nama}</p><p class="harga">Rp${p.harga.toLocaleString()}</p>`}
          ${p.deskripsi ? `<p class="desc">${p.deskripsi}</p>` : ''}
          <button class="order-btn" onclick="addToCart('${p.id}')"><i class="fab fa-whatsapp"></i> Beli via WhatsApp</button>
          <button class="share-btn" onclick="shareIG('${location.origin}?ref=${p.id}')"><i class="fab fa-instagram"></i> Share</button>
          <button class="qr-btn" onclick="showQR('${p.id}')"><i class="fas fa-qrcode"></i> QR</button>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('catalog').innerHTML = html;
}

// ==========================
//  KERANJANG + TIKET
// ==========================
window.addToCart = id => {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const exist = cart.find(i => i.id === id);
  if (exist) exist.qty += 1;
  else cart.push({ ...p, qty: 1 });
  localStorage.setItem('cart', JSON.stringify(cart));
  tickets += 1;
  localStorage.setItem('tickets', tickets);
  updateCartUI();
  updateTicketUI();
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  playNotif();
};

window.checkoutWhatsApp = () => {
  if (cart.length === 0) return alert('Keranjang kosong!');
  const grandTotal = cart.reduce((sum, i) => sum + i.harga * i.qty, 0);
  const items = cart.map(i => `${i.nama} (${i.qty}x) – Rp${(i.harga * i.qty).toLocaleString()}`).join('\n');
  const text = `Halo FSm4r Premium Store, saya mau beli:\n${items}\n💰 Total: Rp${grandTotal.toLocaleString()}\n📍 Tipe: ${cart[0].tipe}`;
  open(`https://wa.me/6288218776877?text=${encodeURIComponent(text)}`);
  cart = []; localStorage.removeItem('cart'); updateCartUI();
};

// ==========================
//  WISHLIST
// ==========================
window.toggleWishlist = id => {
  const idx = wishlist.indexOf(id);
  idx > -1 ? wishlist.splice(idx, 1) : wishlist.push(id);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  renderByType(currentType, document.getElementById('searchInput').value);
};

// ==========================
//  SPIN WHEEL + TIKET
// =========================>
const hadiah = [
  { label: 'Voucher 10K', color: '#00ff88', chance: 30 },
  { label: 'Voucher 25K', color: '#ff00ff', chance: 20 },
  { label: 'Voucher 50K', color: '#3742fa', chance: 10 },
  { label: 'Gratis Ongkir', color: '#ffa502', chance: 25 },
  { label: 'Tiket +1', color: '#70a1ff', chance: 10 },
  { label: 'Zonk', color: '#747d8c', chance: 5 }
];

document.getElementById('spinBtn').onclick = () => {
  if (tickets < 2) return alert('Kamu butuh 2 tiket untuk spin!');
  tickets -= 2;
  localStorage.setItem('tickets', tickets);
  updateTicketUI();
  document.getElementById('spinModal').style.display = 'flex';
  drawWheel(0);
};

document.getElementById('startSpin').onclick = () => {
  const canvas = document.getElementById('wheel');
  const ctx = canvas.getContext('2d');
  const arc = Math.PI * 2 / hadiah.length;
  let currentAngle = 0;
  let spinAngle = Math.random() * 360 + 720;
  const spin = () => {
    spinAngle -= 10;
    if (spinAngle <= 0) {
      const winIndex = Math.floor((360 - (currentAngle % 360)) / (360 / hadiah.length)) % hadiah.length;
      const menang = hadiah[winIndex];
      document.getElementById('spinResult').innerText = `Selamat! Kamu mendapat: ${menang.label}`;
      confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
      return;
    }
    currentAngle += 10;
    drawWheel(currentAngle);
    requestAnimationFrame(spin);
  };
  spin();
};

function drawWheel(angle) {
  const ctx = document.getElementById('wheel').getContext('2d');
  const arc = Math.PI * 2 / hadiah.length;
  ctx.clearRect(0, 0, 300, 300);
  hadiah.forEach((h, i) => {
    ctx.beginPath();
    ctx.arc(150, 150, 140, i * arc + angle, (i + 1) * arc + angle);
    ctx.lineTo(150, 150);
    ctx.fillStyle = h.color;
    ctx.fill();
    ctx.save();
    ctx.translate(150, 150);
    ctx.rotate(i * arc + arc / 2 + angle);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Poppins';
    ctx.fillText(h.label, 90, 0);
    ctx.restore();
  });
}

// ==========================
//  DARK MODE AUTO
// ==========================
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// ==========================
//  SHARE & QR
// ==========================
window.shareIG = url => open(`https://www.instagram.com/create/story/?url=${encodeURIComponent(url)}`);
window.showQR = id => {
  const modal = document.createElement('div');
  modal.className = 'qr-modal';
  modal.innerHTML = `<div class="qr-box"><canvas id="qr${id}"></canvas><button onclick="this.parentElement.remove()">Tutup</button></div>`;
  document.body.appendChild(modal);
  new QRCode(document.getElementById(`qr${id}`), `${location.origin}?ref=${id}`);
};

// ==========================
//  SOUND NOTIF
// ==========================
function playNotif() {
  const audio = new Audio('assets/notif.mp3');
  audio.play().catch(() => {});
}

// ==========================
//  EVENT LISTENER
// ==========================
document.getElementById('searchBtn').onclick = () => renderByType(currentType, document.getElementById('searchInput').value);
document.getElementById('searchInput').onkeyup = e => { if (e.key === 'Enter') renderByType(currentType, e.target.value); };
document.querySelectorAll('.filter').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCat = btn.dataset.cat;
    renderByType(currentType, document.getElementById('searchInput').value);
  };
});
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentType = btn.dataset.tipe;
    renderByType(currentType, document.getElementById('searchInput').value);
  };
});
document.querySelector('.close').onclick = () => document.getElementById('spinModal').style.display = 'none';

// ==========================
//  UTILS
// ==========================
function getCategoryName(cat) {
  const names = { FF: 'Free Fire', ML: 'Mobile Legends', RB: 'Roblox', LAIN': 'Lainnya' };
  return names[cat] || cat;
}

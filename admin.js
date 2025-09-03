import { supabaseClient } from './supabase.js';

const form = document.getElementById('addForm');
const list = document.getElementById('productList');

form.thumb.onchange = e => {
  const img = document.getElementById('thumbPrev');
  img.src = URL.createObjectURL(e.target.files[0]);
  img.style.display = 'block';
};
form.detail.onchange = e => {
  const box = document.getElementById('detailPrev');
  box.innerHTML = '';
  [...e.target.files].forEach(f => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(f);
    box.appendChild(img);
  });
};

refresh();
async function refresh() {
  const { data } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
  list.innerHTML = (data || []).map(p => `
    <li>
      <img src="${p.thumb}">
      <span>${p.nama} (${p.cat})</span>
      <button onclick="del('${p.id}')">Hapus</button>
    </li>
  `).join('');
}

form.onsubmit = async e => {
  e.preventDefault();
  const fd = new FormData(form);

  const upload = async file => {
    const fname = Date.now() + '-' + file.name;
    const { data, error } = await supabaseClient.storage.from('public').upload(fname, file);
    return error ? null : supabaseClient.storage.from('public').getPublicUrl(fname).data.publicUrl;
  };

  const thumbUrl = await upload(fd.get('thumb'));
  const detailUrls = await Promise.all([...fd.getAll('detail')].map(upload));

  await supabaseClient.from('products').insert({
    cat: fd.get('cat'),
    nama: fd.get('nama'),
    stok: +fd.get('stok'),
    harga: +fd.get('harga'),
    thumb: thumbUrl,
    detail: detailUrls.filter(u => u)
  });
  form.reset(); refresh();
};

window.del = async id => {
  await supabaseClient.from('products').delete().eq('id', id);
  refresh();
};

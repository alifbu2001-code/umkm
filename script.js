// ====== PENGATURAN (GANTI) ======
const NOMOR_WA = "6281234567890"; // format: 62 + nomor tanpa 0 di depan
const NAMA_TOKO = "Coffee Shop";

// ====== DATA KERANJANG ======
const cart = {}; // contoh isi: { "Espresso": { harga: 12000, qty: 2 } }

const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");

// ====== 1. Tambahkan tombol "Tambah" ke setiap menu ======
document.querySelectorAll(".menu-group .price-list li").forEach((li) => {
  const nama = li.querySelector(".item-name").textContent.trim();
  const harga = parseInt(li.querySelector(".item-price").textContent) * 1000; // "12K" -> 12000

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "add-btn";
  btn.textContent = "Tambah";
  btn.setAttribute("aria-label", "Tambah " + nama + " ke keranjang");
btn.addEventListener("click", () => {
    tambah(nama, harga);
    animasiTambah(btn);
  });
  li.appendChild(btn);
});

// ====== 2. Fungsi keranjang ======
function tambah(nama, harga) {
  if (!cart[nama]) cart[nama] = { harga: harga, qty: 0 };
  cart[nama].qty++;
  render();
}

function ubah(nama, selisih) {
  cart[nama].qty += selisih;
  if (cart[nama].qty <= 0) delete cart[nama];
  render();
}

function render() {
  const daftar = document.getElementById("cart-items");
  daftar.innerHTML = "";

  let total = 0;
  let jumlah = 0;

  for (const [nama, item] of Object.entries(cart)) {
    total += item.harga * item.qty;
    jumlah += item.qty;

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="ci-info">
        <span class="ci-name"></span>
        <span class="ci-sub">${rupiah(item.harga)} × ${item.qty}</span>
      </div>
      <div class="ci-qty">
        <button type="button" aria-label="Kurangi">−</button>
        <span>${item.qty}</span>
        <button type="button" aria-label="Tambah">+</button>
      </div>`;
    li.querySelector(".ci-name").textContent = nama;

    const tombol = li.querySelectorAll(".ci-qty button");
    tombol[0].addEventListener("click", () => ubah(nama, -1));
    tombol[1].addEventListener("click", () => ubah(nama, 1));

    daftar.appendChild(li);
  }

  const kosong = jumlah === 0;
  document.getElementById("cart-count").textContent = jumlah;
  document.getElementById("cart-total").textContent = rupiah(total);
  document.getElementById("cart-empty").hidden = !kosong;
  document.getElementById("cart-total-row").hidden = kosong;
  document.getElementById("checkout-form").hidden = kosong;
}

// ====== 3. Buka / tutup keranjang ======
const dialog = document.getElementById("cart-dialog");
document.getElementById("cart-open").addEventListener("click", () => dialog.showModal());
document.getElementById("cart-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close(); // klik area gelap di luar kotak
});

// ====== 4. Form checkout ======
const tipe = document.getElementById("co-tipe");
const alamatWrap = document.getElementById("co-alamat-wrap");
const alamat = document.getElementById("co-alamat");

tipe.addEventListener("change", () => {
  const antar = tipe.value === "Antar";
  alamatWrap.hidden = !antar;
  alamat.required = antar;
});

document.getElementById("checkout-form").addEventListener("submit", (e) => {
  e.preventDefault();
  if (Object.keys(cart).length === 0) return;

  let pesan = `Halo ${NAMA_TOKO}, saya mau pesan:\n\n`;
  let total = 0;

  for (const [nama, item] of Object.entries(cart)) {
    const subtotal = item.harga * item.qty;
    total += subtotal;
    pesan += `- ${nama} x${item.qty} = ${rupiah(subtotal)}\n`;
  }

  pesan += `\nTotal: ${rupiah(total)}\n`;
  pesan += `\nNama: ${document.getElementById("co-nama").value.trim()}`;
  pesan += `\nPesanan: ${tipe.value}`;
  if (tipe.value === "Antar") pesan += `\nAlamat: ${alamat.value.trim()}`;

  const catatan = document.getElementById("co-catatan").value.trim();
  if (catatan) pesan += `\nCatatan: ${catatan}`;

  const url = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(pesan)}`;
  window.open(url, "_blank", "noopener");
});
// ====== 5. Animasi saat menambah ke keranjang ======
function animasiTambah(tombol) {
  // Hormati pengguna yang mematikan animasi di perangkatnya
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const fab = document.getElementById("cart-open");
  const dari = tombol.getBoundingClientRect();
  const ke = fab.getBoundingClientRect();

  // 1. Titik kecil terbang dari tombol ke keranjang
  const titik = document.createElement("div");
  titik.className = "fly-dot";
  titik.style.left = dari.left + dari.width / 2 - 8 + "px";
  titik.style.top = dari.top + dari.height / 2 - 8 + "px";
  document.body.appendChild(titik);

  const dx = ke.left + ke.width / 2 - (dari.left + dari.width / 2);
  const dy = ke.top + ke.height / 2 - (dari.top + dari.height / 2);

  const terbang = titik.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.4 }
    ],
    { duration: 600, easing: "ease-in" }
  );

  terbang.onfinish = () => {
    titik.remove();
    // 2. Tombol keranjang membal
    fab.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.15)" },
        { transform: "scale(1)" }
      ],
      { duration: 300 }
    );
  };

  // 3. Tulisan tombol berubah sebentar
  tombol.textContent = "✓ Ditambah";
  setTimeout(() => (tombol.textContent = "Tambah"), 900);
}
// ====== 6. Pindah halaman lewat klik (tanpa scroll) ======
const halaman = document.querySelectorAll(".page");
const linkNav = document.querySelectorAll(".nav-list a");

function tampilkan(id) {
  const target = document.getElementById(id);
  if (!target || !target.classList.contains("page")) id = "beranda";

  halaman.forEach((h) => h.classList.toggle("aktif", h.id === id));

  linkNav.forEach((a) => {
    const aktif = a.getAttribute("href") === "#" + id;
    a.classList.toggle("aktif", aktif);
    if (aktif) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", () => tampilkan(location.hash.slice(1)));
tampilkan(location.hash.slice(1) || "beranda");
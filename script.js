// =========================================
// 1. IMPORT FIREBASE LENGKAP
// =========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection, 
  addDoc,     
  getDocs,
  updateDoc, 
  increment,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =========================================
// 2. KONFIGURASI FIREBASE
// =========================================
const firebaseConfig = {
  apiKey: "AIzaSyB8Kufn-wpQPMRnMv4EJk9VJ2MCa_FEwIE",
  authDomain: "toko-sepatu-online.firebaseapp.com",
  databaseURL: "https://toko-sepatu-online-default-rtdb.firebaseio.com",
  projectId: "toko-sepatu-online",
  storageBucket: "toko-sepatu-online.firebasestorage.app",
  messagingSenderId: "891980669080",
  appId: "1:891980669080:web:9e51fc6d80c2f474ee30ed",
  measurementId: "G-9TM7GDB9WP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =========================================
// 3. VARIABEL GLOBAL & HELPER
// =========================================
let allProductsData = []; 
const cart = []; 

// Fungsi Ambil Elemen (Biar aman kalau elemen tidak ada)
const getEl = (id) => document.getElementById(id);

// Fungsi Alert Custom
function showAlert(message) {
  const customAlert = getEl("custom-alert");
  const alertMsg = getEl("alert-msg");
  
  if (customAlert && alertMsg) {
    alertMsg.textContent = message;
    customAlert.style.display = "flex";
  } else {
    alert(message);
  }
}

// Fungsi Convert File ke Base64 (Untuk Bukti Transfer)
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// =========================================
// 4. CEK STATUS LOGIN (AUTH STATE)
// =========================================
onAuthStateChanged(auth, async (user) => {
  const loginWrapper = getEl("login-wrapper");
  const loginBtnNav = getEl("login-btn-nav");
  const logoutBtn = getEl("logout-btn");
  const userInfo = getEl("user-info");
  const adminLinkNav = getEl("admin-link-nav");
  const btnMyOrders = getEl("btn-my-orders");

  if (user) {
    // --- JIKA USER LOGIN ---
    if (loginWrapper) loginWrapper.style.display = "none";
    if (loginBtnNav) loginBtnNav.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (btnMyOrders) btnMyOrders.style.display = "inline-block";

    try {
      // Cek Data User di Database
      const u = await getDoc(doc(db, "users", user.uid));
      if (u.exists()) {
        const data = u.data();
        
        // Cek Role Admin
        if (data.role === 'admin') {
            if (adminLinkNav) adminLinkNav.style.display = "inline-block";
            if (userInfo) {
                userInfo.style.display = "inline-block";
                userInfo.textContent = `Halo, Admin ${data.username}`;
            }
        } else {
            // User Biasa
            if (adminLinkNav) adminLinkNav.style.display = "none";
            if (userInfo) {
                userInfo.style.display = "inline-block";
                userInfo.textContent = `Halo, ${data.username}`;
            }
        }
      }
    } catch (e) {
      console.error("Auth Error:", e);
    }
  } else {
    // --- JIKA USER LOGOUT ---
    if (loginBtnNav) loginBtnNav.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (userInfo) userInfo.style.display = "none";
    if (adminLinkNav) adminLinkNav.style.display = "none";
    if (btnMyOrders) btnMyOrders.style.display = "none";
  }
});

// =========================================
// 5. LOGIKA LOGIN / REGISTER / LOGOUT
// =========================================

// Tombol Login di Navbar
const loginBtnNav = getEl("login-btn-nav");
if (loginBtnNav) {
    loginBtnNav.addEventListener("click", () => {
        const wrapper = getEl("login-wrapper");
        const loginTab = getEl("login-tab");
        const regTab = getEl("register-tab");
        
        if (wrapper) wrapper.style.display = "flex";
        if (loginTab) loginTab.style.display = "block";
        if (regTab) regTab.style.display = "none";
    });
}

// Tombol Tutup Login
const loginClose = getEl("login-close");
if (loginClose) {
    loginClose.addEventListener("click", () => {
        const wrapper = getEl("login-wrapper");
        if (wrapper) wrapper.style.display = "none";
    });
}

// Switch ke Register
const goRegister = getEl("go-register");
if (goRegister) {
    goRegister.addEventListener("click", (e) => {
        e.preventDefault();
        getEl("login-tab").style.display = "none";
        getEl("register-tab").style.display = "block";
    });
}

// Switch ke Login
const goLogin = getEl("go-login");
if (goLogin) {
    goLogin.addEventListener("click", (e) => {
        e.preventDefault();
        getEl("login-tab").style.display = "block";
        getEl("register-tab").style.display = "none";
    });
}

// Eksekusi Login
const btnLogin = getEl("btn-login");
if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        const u = getEl("login-username").value;
        const p = getEl("login-password").value;
        if (!u || !p) return showAlert("Isi username dan password!");

        try {
            const snap = await getDoc(doc(db, "usernames", u));
            if (!snap.exists()) throw new Error("Username tidak ditemukan");
            
            const uid = snap.data().uid;
            const userSnap = await getDoc(doc(db, "users", uid));
            const email = userSnap.data().email;

            await signInWithEmailAndPassword(auth, email, p);
            showAlert("Login Berhasil!");
        } catch (e) { showAlert(e.message); }
    });
}

// Eksekusi Daftar
const btnDaftar = getEl("btn-daftar");
if (btnDaftar) {
    btnDaftar.addEventListener("click", async () => {
        const u = getEl("reg-username").value;
        const e = getEl("reg-email").value;
        const p = getEl("reg-password").value;

        if (!u || !e || !p) return showAlert("Lengkapi data!");

        try {
            const snap = await getDoc(doc(db, "usernames", u));
            if (snap.exists()) throw new Error("Username sudah dipakai!");

            const cred = await createUserWithEmailAndPassword(auth, e, p);
            await setDoc(doc(db, "users", cred.user.uid), {
                username: u, email: e, role: "user", createdAt: Date.now()
            });
            await setDoc(doc(db, "usernames", u), { uid: cred.user.uid });

            showAlert("Berhasil Daftar! Silakan Login.");
            getEl("login-tab").style.display = "block";
            getEl("register-tab").style.display = "none";
        } catch (err) { showAlert(err.message); }
    });
}

// Eksekusi Logout
const logoutBtn = getEl("logout-btn");
const logoutModal = getEl("logout-confirm-modal");
const btnLogoutYes = getEl("btn-logout-yes");
const btnLogoutNo = getEl("btn-logout-no");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        if (logoutModal) logoutModal.style.display = "flex";
    });
}
if (btnLogoutNo) {
    btnLogoutNo.addEventListener("click", () => {
        if (logoutModal) logoutModal.style.display = "none";
    });
}
if (btnLogoutYes) {
    btnLogoutYes.addEventListener("click", async () => {
        await signOut(auth);
        window.location.reload();
    });
}

// =========================================
// 6. LOAD PRODUK & FILTER & SEARCH
// =========================================
async function loadProducts() {
  const homeContainer = getEl("home-products");
  const allContainer = getEl("all-products");

  // UPDATE: Menggunakan loader animasi CSS
  if(allContainer) allContainer.innerHTML = '<div class="loader"></div>';

  try {
    const snap = await getDocs(collection(db, "products"));
    allProductsData = [];
    snap.forEach(d => allProductsData.push({ docId: d.id, ...d.data() }));

    // Render Home (3 Terbaru)
    if (homeContainer) {
        const homeData = [...allProductsData].sort((a, b) => b.createdAt - a.createdAt);
        renderProductList(homeContainer, homeData.slice(0, 3));
    }

    // Render Katalog (Filter)
    applyFilters(); 

  } catch (err) { console.error("Load Error:", err); }
}

// =========================================
// PERBAIKAN FUNGSI FILTER (GANTI YANG LAMA)
// =========================================
function applyFilters() {
  const container = getEl("all-products");
  const searchInput = getEl("search-input");
  const filterCategory = getEl("filter-category");
  const sortSelect = getEl("sort-select");

  if (!container) return;

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const categoryVal = filterCategory ? filterCategory.value : "all";
  const sortVal = sortSelect ? sortSelect.value : "newest";

  let filtered = allProductsData.filter(p => {
      // 1. Filter Search (Nama)
      const matchName = p.name ? p.name.toLowerCase().includes(searchTerm) : false;

      // 2. Filter Kategori (LOGIKA BARU YANG LEBIH KETAT)
      let matchCat = false;
      
      if (categoryVal === "all") {
          // Jika pilih "Semua Kategori", semua produk boleh lewat
          matchCat = true;
      } else {
          // Jika pilih kategori tertentu (misal: Pria), 
          // Cek apakah data di database SAMA PERSIS dengan pilihan
          if (p.category && p.category === categoryVal) {
              matchCat = true;
          } else {
              matchCat = false;
          }
      }

      // Produk harus lolos filter Nama DAN filter Kategori
      return matchName && matchCat;
  });

  // Sorting (Urutan)
  if (sortVal === "cheap") filtered.sort((a, b) => a.price - b.price);
  else if (sortVal === "expensive") filtered.sort((a, b) => b.price - a.price);
  else filtered.sort((a, b) => b.createdAt - a.createdAt); // Default: Terbaru

  renderProductList(container, filtered);
}

function renderProductList(container, list) {
    container.innerHTML = "";
    if (list.length === 0) {
        container.innerHTML = "<p style='text-align:center; width:100%; color:#aaa;'>Produk tidak ditemukan.</p>";
    } else {
        list.forEach(p => container.appendChild(createProductCard(p)));
    }
}

// Event Listeners Filter
const searchInput = getEl("search-input");
if (searchInput) searchInput.addEventListener("input", applyFilters);

const filterCategory = getEl("filter-category");
if (filterCategory) filterCategory.addEventListener("change", applyFilters);

const sortSelect = getEl("sort-select");
if (sortSelect) sortSelect.addEventListener("change", applyFilters);


// =========================================
// 7. MEMBUAT KARTU PRODUK (CARD UI)
// =========================================
function createProductCard(p) {
  const card = document.createElement("div");
  card.className = "produk-card";

  // Visual (Gambar/Emoji)
  let visual = "";
  if (p.imageType === 'url' || p.imageType === 'image') {
    visual = `<img src="${p.imageValue}" class="produk-img" loading="lazy">`;
  } else {
    visual = `<div class="produk-emoji">${p.imageValue || p.emoji}</div>`;
  }

  // Stok & Dropdown Size
  const stok = p.stock || 0;
  let actionHTML = "";
  let stokHTML = "";

  if (stok > 0) {
    stokHTML = `<span style="color:#fbbf24; font-size:0.9rem;">Sisa: ${stok}</span>`;
    
    // Logika Dropdown Size
    let sizeOptions = '<option value="">Pilih Size</option>';
    if (p.sizes && Array.isArray(p.sizes) && p.sizes.length > 0) {
        // Cek jika cuma "All Size"
        if(p.sizes.includes("All Size")) {
             sizeOptions += '<option value="All Size">All Size</option>';
        } else {
             // Sortir ukuran angka
             p.sizes.sort((a,b)=>a-b).forEach(s => {
                sizeOptions += `<option value="${s}">${s}</option>`;
             });
        }
    } else {
        // Default jika data size kosong
        sizeOptions += '<option value="All Size">All Size</option>';
    }

    // Tombol Add to Cart Aktif
    actionHTML = `
      <div style="display:flex; gap:8px; margin-top:10px;">
          <select class="size-selector select-dark" style="padding:8px; border-radius:12px; border:1px solid #ddd; background:#1e1b4b; color:white; width:40%; cursor:pointer;">
              ${sizeOptions}
          </select>
          <button class="add-cart" 
            style="flex:1;"
            data-id="${p.docId}" 
            data-name="${p.name}" 
            data-price="${p.price}"
            data-stock="${stok}">
            + Keranjang
          </button>
      </div>`;
  } else {
    // Tombol Habis
    stokHTML = `<span style="color:#ef4444; font-weight:bold;">Habis</span>`;
    actionHTML = `
      <button disabled style="width:100%; margin-top:10px; padding:12px; background:#475569; border-radius:12px; cursor:not-allowed; border:none; color:#ccc;">
        Stok Habis
      </button>`;
  }

  card.innerHTML = `
    ${visual}
    <h3>${p.name}</h3>
    <div style="display:flex; justify-content:space-between;"> 
        <p class="price">Rp ${p.price.toLocaleString("id-ID")}</p> 
        ${stokHTML}
    </div>
    <p class="desc">${p.desc}</p>
    ${actionHTML}
  `;
  return card;
}

// =========================================
// 8. KERANJANG (CART)
// =========================================
const cartBtn = getEl("cart-btn");
const cartSidebar = getEl("cart-sidebar");
const cartClose = getEl("cart-close");
const cartList = getEl("cart-items");
const cartTotal = getEl("cart-total");
const cartCount = getEl("cart-count");

// Buka Cart (Tutup Orders sidebar jika ada)
if (cartBtn) {
    cartBtn.addEventListener("click", () => {
        document.body.classList.remove("orders-open");
        document.body.classList.toggle("cart-open");
    });
}

// Tutup Cart
if (cartClose) {
    cartClose.addEventListener("click", () => {
        document.body.classList.remove("cart-open");
    });
}

// Render Cart
function renderCart() {
  if (!cartList) return;
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="cart-item-row" style="width:100%; display:flex; justify-content:space-between; align-items:center;">
        <span>${item.name} <strong style="color:#fbbf24">(${item.size})</strong><br>
        <small>Rp ${item.price.toLocaleString()}</small></span>
        <button class="btn-remove" onclick="window.hapusItem(${index})">×</button>
      </div>
    `;
    cartList.appendChild(li);
  });

  if (cartTotal) cartTotal.textContent = total.toLocaleString();
  if (cartCount) cartCount.textContent = cart.length;
}

// Hapus Item (Global function)
window.hapusItem = (index) => {
  cart.splice(index, 1);
  renderCart();
};

// Animasi Terbang ke Cart
function flyToCart(btn, content, isImg) {
    if(!cartBtn) return;
    let f = document.createElement(isImg?"img":"div");
    if(isImg) { f.src=content; f.className="flying-img"; f.style.width="50px"; f.style.height="50px"; f.style.borderRadius="50%"; }
    else { f.textContent=content; f.className="flying-emoji"; }
    
    const r = btn.getBoundingClientRect();
    f.style.position="fixed"; f.style.top=r.top+"px"; f.style.left=r.left+"px"; 
    document.body.appendChild(f);
    
    setTimeout(() => { 
        const rc = cartBtn.getBoundingClientRect(); 
        f.style.top=(rc.top+5)+"px"; f.style.left=(rc.left+5)+"px"; 
        f.style.opacity="0.5"; f.style.transform="scale(0.3)"; 
    }, 10);
    
    setTimeout(() => { 
        f.remove(); 
        cartBtn.style.transform="scale(1.3)"; cartBtn.style.color="#fbbf24"; 
        setTimeout(()=>cartBtn.style.transform="scale(1)", 200); 
    }, 800);
}

// Event Delegate: Tombol Add to Cart
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-cart")) {
    const btn = e.target;
    const sizeSelect = btn.previousElementSibling;
    const selectedSize = sizeSelect ? sizeSelect.value : "All Size";
    
    // Validasi Ukuran
    if (selectedSize === "") return showAlert("⚠️ Harap pilih ukuran sepatu dulu!");
    
    // Cek Stok di Keranjang
    const maxStock = parseInt(btn.dataset.stock);
    const inCart = cart.filter(i => i.id === btn.dataset.id).length;
    if (inCart >= maxStock) return showAlert("Stok habis!");

    // Masuk Keranjang
    cart.push({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseInt(btn.dataset.price),
        size: selectedSize
    });
    
    // Animasi
    const card = btn.closest(".produk-card");
    const img = card.querySelector("img");
    if (img) flyToCart(btn, img.src, true);
    else flyToCart(btn, card.querySelector(".produk-emoji").textContent, false);
    
    setTimeout(() => renderCart(), 700);
  }
});


// =========================================
// 9. CHECKOUT TRANSFER (UPLOAD BUKTI)
// =========================================
const btnCheckout = getEl("checkout-btn");
const checkoutModal = getEl("checkout-modal");
const closeCheckout = getEl("close-checkout");
const confirmPaymentBtn = getEl("confirm-payment-btn");
const proofFile = getEl("proof-file");
const checkoutTotalDisplay = getEl("checkout-total-display");

// Klik Checkout -> Buka Modal
if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
        if (cart.length === 0) return showAlert("Keranjang kosong!");
        if (!auth.currentUser) {
            showAlert("Login dulu!");
            document.body.classList.remove("cart-open");
            const loginW = getEl("login-wrapper");
            if(loginW) loginW.style.display = "flex";
            return;
        }

        // Tampilkan Total
        const total = cart.reduce((a,b) => a + b.price, 0);
        if (checkoutTotalDisplay) checkoutTotalDisplay.textContent = "Rp " + total.toLocaleString("id-ID");
        
        // Buka Modal
        if (checkoutModal) checkoutModal.style.display = "flex";
        document.body.classList.remove("cart-open");
    });
}

// Tutup Checkout
if (closeCheckout) {
    closeCheckout.addEventListener("click", () => {
        if (checkoutModal) checkoutModal.style.display = "none";
    });
}

// Eksekusi Pembayaran
if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener("click", async () => {
        const file = proofFile.files[0];
        if (!file) return showAlert("Wajib upload bukti transfer!");
        if (file.size > 1024 * 1024) return showAlert("File terlalu besar (Max 1MB)");

        confirmPaymentBtn.disabled = true;
        confirmPaymentBtn.textContent = "Mengirim...";

        try {
            // Konversi Gambar
            const proofBase64 = await convertToBase64(file);
            const total = cart.reduce((a, b) => a + b.price, 0);

            // Simpan Order
            await addDoc(collection(db, "orders"), {
                userId: auth.currentUser.uid,
                items: cart,
                total: total,
                status: "Menunggu Verifikasi",
                proofImage: proofBase64,
                paymentMethod: "Transfer Bank",
                createdAt: Date.now()
            });

            // Kurangi Stok di Database
            for (const item of cart) {
                if (item.id) {
                    await updateDoc(doc(db, "products", item.id), {
                        stock: increment(-1)
                    });
                }
            }

            // Bersihkan Keranjang
            cart.length = 0;
            renderCart();
            checkoutModal.style.display = "none";
            loadProducts(); // Reload untuk update stok di tampilan
            showAlert("Pesanan Berhasil! Admin akan memverifikasi bukti bayar.");

        } catch (e) {
            console.error(e);
            showAlert("Gagal: " + e.message);
        } finally {
            confirmPaymentBtn.disabled = false;
            confirmPaymentBtn.textContent = "Kirim Bukti Pembayaran";
        }
    });
}


// =========================================
// 10. STATUS PESANAN (SIDEBAR)
// =========================================
const btnMyOrders = getEl("btn-my-orders");
const ordersSidebar = getEl("orders-sidebar");
const closeOrders = getEl("close-orders");
const ordersListContainer = getEl("orders-list-container");

// Buka Sidebar Pesanan
if (btnMyOrders) {
    btnMyOrders.addEventListener("click", (e) => {
        e.preventDefault();
        document.body.classList.remove("cart-open"); // Tutup cart
        document.body.classList.add("orders-open"); // Buka orders
        loadMyOrders();
    });
}

// Tutup Sidebar Pesanan
if (closeOrders) {
    closeOrders.addEventListener("click", () => {
        document.body.classList.remove("orders-open");
    });
}

// Fetch Pesanan
async function loadMyOrders() {
    if (!ordersListContainer) return;
    // UPDATE: Pakai loader
    ordersListContainer.innerHTML = '<div class="loader"></div>';
    
    if (!auth.currentUser) return;

    try {
        const q = query(collection(db, "orders"), where("userId", "==", auth.currentUser.uid));
        const snap = await getDocs(q);
        
        const orders = [];
        snap.forEach(d => orders.push({ id: d.id, ...d.data() }));
        orders.sort((a, b) => b.createdAt - a.createdAt);

        renderMyOrders(orders);
    } catch (e) {
        console.error(e);
        ordersListContainer.innerHTML = "<p style='text-align:center; color:red;'>Gagal memuat data.</p>";
    }
}

// Render Mini Card Pesanan
function renderMyOrders(orders) {
    ordersListContainer.innerHTML = "";
    if (orders.length === 0) {
        ordersListContainer.innerHTML = "<p style='text-align:center; color:#aaa; margin-top:20px;'>Belum ada pesanan.</p>";
        return;
    }

    orders.forEach(o => {
        const date = new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
        const itemNames = o.items.map(i => i.name).join(", ");
        const itemCount = o.items.length;
        
        // Warna Status
        let statusColor = "#fbbf24"; let statusIcon = "🕒";
        if (o.status === "Lunas / Proses" || o.status === "Proses") {
            statusColor = "#3b82f6"; statusIcon = "📦";
        } else if (o.status === "Selesai") {
            statusColor = "#10b981"; statusIcon = "✅";
        } else if (o.status === "Batal") {
            statusColor = "#ef4444"; statusIcon = "❌";
        }

        const card = document.createElement("div");
        card.className = "order-card-mini";
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <span style="color:#aaa; font-size:0.8rem;">${date}</span>
                <span style="background:${statusColor}; color:black; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:0.75rem;">${statusIcon} ${o.status}</span>
            </div>
            <h4 style="margin:0 0 5px 0; color:white; font-size:0.95rem;">${itemNames}</h4>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px;">
                <span style="color:#ccc; font-size:0.85rem;">${itemCount} Barang</span>
                <span style="color:#fbbf24; font-weight:bold;">Rp ${o.total.toLocaleString("id-ID")}</span>
            </div>
        `;
        ordersListContainer.appendChild(card);
    });
}


// =========================================
// 11. NAVIGASI HALAMAN & GLOBAL CLICK
// =========================================
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    
    // Jangan cegah default jika tombol Admin atau Pesanan (karena logic mereka beda)
    if (link.id === "admin-link-nav" || link.id === "btn-my-orders") return;

    e.preventDefault();
    
    // --- PERBAIKAN PENTING: Buka kunci scroll saat pindah menu ---
    document.body.classList.remove("cart-open");
    document.body.classList.remove("orders-open");
    // -----------------------------------------------------------

    const targetId = link.dataset.target;
    
    // Sembunyikan semua section
    document.querySelectorAll("main > section").forEach(s => s.style.display = "none");
    
    // Tampilkan target
    const targetSection = getEl(targetId);
    if (targetSection) targetSection.style.display = "block";
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Tutup Modal/Alert jika klik di luar
window.addEventListener("click", (e) => {
    const loginWrapper = getEl("login-wrapper");
    const customAlert = getEl("custom-alert");
    const logoutModal = getEl("logout-confirm-modal");
    const checkoutModal = getEl("checkout-modal");

    if (e.target === loginWrapper) loginWrapper.style.display = "none";
    if (e.target === customAlert) customAlert.style.display = "none";
    if (e.target === logoutModal) logoutModal.style.display = "none";
    if (e.target === checkoutModal) checkoutModal.style.display = "none";
});

// Tutup Alert Tombol
const btnCloseAlert = getEl("btn-close-alert");
if(btnCloseAlert) {
    btnCloseAlert.addEventListener("click", () => {
        const customAlert = getEl("custom-alert");
        if(customAlert) customAlert.style.display = "none";
    });
}

// Load Awal
loadProducts();

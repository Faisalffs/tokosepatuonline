// ============ 1. IMPORT FIREBASE ============
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
  updateDoc, // Tambahan untuk update stok
  increment  // Tambahan untuk mengurangi stok
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ============ 2. CONFIG (PASTIKAN API KEY BENAR) ============
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

// ============ 3. DOM ELEMENTS ============
// Auth & Nav
const loginWrapper = document.getElementById("login-wrapper");
const loginBtnNav = document.getElementById("login-btn-nav");
const logoutBtn = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");
const sortSelect = document.getElementById("sort-select");

// Inputs Auth
const regUsername = document.getElementById("reg-username");
const regEmail = document.getElementById("reg-email");
const regPass = document.getElementById("reg-password");
const loginUsername = document.getElementById("login-username");
const loginPass = document.getElementById("login-password");

// Custom Alert
const customAlert = document.getElementById("custom-alert");
const alertMsg = document.getElementById("alert-msg"); // Perbaikan ID (sebelumnya alert-message)
const btnCloseAlert = document.getElementById("btn-close-alert");

// Fungsi Alert Custom
function showAlert(message) {
  if (customAlert && alertMsg) {
    alertMsg.textContent = message;
    customAlert.style.display = "flex";
  } else {
    alert(message);
  }
}
if (btnCloseAlert) btnCloseAlert.addEventListener("click", () => customAlert.style.display = "none");


// ============ 4. AUTH & REDIRECT ADMIN ============
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User Login
    if (loginWrapper) loginWrapper.style.display = "none";
    loginBtnNav.style.display = "none";
    logoutBtn.style.display = "inline-block";

    try {
      // Cek Role
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();

        // JIKA ADMIN -> LEMPAR KE DASHBOARD
        if (data.role === 'admin') {
          console.log("Admin login. Redirecting...");
          window.location.href = "admin.html"; 
          return; 
        }

        // JIKA USER BIASA
        userInfo.style.display = "inline-block";
        userInfo.textContent = `Halo, ${data.username}`;
      }
    } catch (e) { console.error(e); }
  } else {
    // Belum Login
    loginBtnNav.style.display = "inline-block";
    logoutBtn.style.display = "none";
    userInfo.style.display = "none";
  }
});


// ============ 5. LOGIKA TAB & LOAD PRODUK ============
const sections = {
  home: document.getElementById("home-section"),
  produk: document.getElementById("produk-section")
};

// Navigasi Tab
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.dataset.target;
    
    // Hide All
    Object.values(sections).forEach(s => s.style.display = "none");
    // Show Target
    const targetSection = document.getElementById(targetId);
    if(targetSection) targetSection.style.display = "block";
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Load & Sort Produk
async function loadProducts() {
  const homeContainer = document.getElementById("home-products");
  const allContainer = document.getElementById("all-products");

  try {
    const snap = await getDocs(collection(db, "products"));
    const products = [];
    // Kita simpan juga ID dokumennya
    snap.forEach(d => products.push({ docId: d.id, ...d.data() }));

    // SORTIR
    const sortValue = sortSelect ? sortSelect.value : "newest";
    if (sortValue === "cheap") products.sort((a, b) => a.price - b.price);
    else if (sortValue === "expensive") products.sort((a, b) => b.price - a.price);
    else if (sortValue === "name") products.sort((a, b) => a.name.localeCompare(b.name));
    else products.sort((a, b) => b.createdAt - a.createdAt); // Default Newest

    // Helper Render
    const render = (container, list) => {
      container.innerHTML = "";
      if (list.length === 0) container.innerHTML = "<p style='text-align:center'>Belum ada produk.</p>";
      else list.forEach(p => container.appendChild(createProductCard(p)));
    };

    if (homeContainer) render(homeContainer, products.slice(0, 3));
    if (allContainer) render(allContainer, products);

  } catch (err) { console.error(err); }
}

// Event Sortir
if (sortSelect) sortSelect.addEventListener("change", () => loadProducts());

// Buat HTML Kartu Produk (UPDATE STOK LOGIC)
function createProductCard(p) {
  const card = document.createElement("div");
  card.className = "produk-card";

  // Cek Gambar vs Emoji
  let visual = "";
  if (p.imageType === 'url' || p.imageType === 'image') {
    visual = `<img src="${p.imageValue}" class="produk-img" alt="${p.name}" loading="lazy">`;
  } else {
    visual = `<div class="produk-emoji">${p.imageValue || p.emoji}</div>`;
  }

  // LOGIKA STOK
  const stok = p.stock || 0;
  let btnHTML = "";
  let stokHTML = "";

  if (stok > 0) {
    // Jika ada stok
    stokHTML = `<span style="color:#fbbf24; font-size:0.9rem;">Sisa: ${stok}</span>`;
    btnHTML = `
      <button class="add-cart" 
        data-id="${p.docId}" 
        data-name="${p.name}" 
        data-price="${p.price}"
        data-stock="${stok}">
        + Keranjang
      </button>`;
  } else {
    // Jika habis
    stokHTML = `<span style="color:#ef4444; font-weight:bold; font-size:0.9rem;">Stok Habis</span>`;
    btnHTML = `
      <button disabled style="width:100%; padding:12px; background:#475569; color:#94a3b8; border:none; border-radius:50px; cursor:not-allowed;">
        Stok Habis
      </button>`;
  }

  card.innerHTML = `
    ${visual}
    <h3>${p.name}</h3>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
        <p class="price" style="margin:0;">Rp ${p.price.toLocaleString("id-ID")}</p>
        ${stokHTML}
    </div>
    <p class="desc">${p.desc}</p>
    ${btnHTML}
  `;
  return card;
}

// Load Awal
loadProducts();


// ============ 6. REGISTER & LOGIN ============
document.getElementById("btn-daftar")?.addEventListener("click", async () => {
  const u = regUsername.value.trim();
  const e = regEmail.value.trim();
  const p = regPass.value.trim();
  
  if (!u || !e || !p) return showAlert("Lengkapi data!");
  
  try {
    const uSnap = await getDoc(doc(db, "usernames", u));
    if (uSnap.exists()) throw new Error("Username sudah dipakai!");

    const cred = await createUserWithEmailAndPassword(auth, e, p);
    await setDoc(doc(db, "users", cred.user.uid), { 
      username: u, email: e, role: "user", createdAt: Date.now() 
    });
    await setDoc(doc(db, "usernames", u), { uid: cred.user.uid });
    
    showAlert("Berhasil Daftar!");
  } catch (err) { showAlert(err.message); }
});

document.getElementById("btn-login")?.addEventListener("click", async () => {
  const u = loginUsername.value.trim();
  const p = loginPass.value.trim();
  if (!u || !p) return showAlert("Isi data!");
  
  try {
    const uSnap = await getDoc(doc(db, "usernames", u));
    if (!uSnap.exists()) throw new Error("User tidak ditemukan");
    
    const uid = uSnap.data().uid;
    const userSnap = await getDoc(doc(db, "users", uid));
    await signInWithEmailAndPassword(auth, userSnap.data().email, p);
    showAlert("Login Berhasil!");
  } catch (err) { showAlert(err.message); }
});

// ============ 7. KERANJANG CANGGIH ============

const cart = []; 
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartList = document.getElementById("cart-items");

function renderCart() {
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="cart-item-row">
        <span>${item.name} <br> <small style="color:#aaa">Rp ${item.price.toLocaleString()}</small></span>
        <button class="btn-remove" onclick="hapusItem(${index})">×</button>
      </div>
    `;
    cartList.appendChild(li);
  });

  if (cartTotal) cartTotal.textContent = total.toLocaleString();
  if (cartCount) cartCount.textContent = cart.length;
}

window.hapusItem = (index) => {
  cart.splice(index, 1);
  renderCart();
};

function flyToCart(btn, content, isImage = true) {
  const cartBtn = document.getElementById("cart-btn");
  if (!cartBtn) return;

  let flyer;
  if (isImage) {
    flyer = document.createElement("img");
    flyer.src = content;
    flyer.classList.add("flying-img");
    flyer.style.width = "50px"; flyer.style.height = "50px";
    flyer.style.borderRadius = "50%"; flyer.style.objectFit = "cover";
  } else {
    flyer = document.createElement("div");
    flyer.textContent = content;
    flyer.classList.add("flying-emoji");
  }

  const rectBtn = btn.getBoundingClientRect();
  flyer.style.position = "fixed";
  flyer.style.top = rectBtn.top + "px";
  flyer.style.left = rectBtn.left + "px";
  document.body.appendChild(flyer);

  setTimeout(() => {
    const rectCart = cartBtn.getBoundingClientRect();
    flyer.style.top = (rectCart.top + 5) + "px";
    flyer.style.left = (rectCart.left + 5) + "px";
    flyer.style.opacity = "0.5"; flyer.style.transform = "scale(0.3)";
  }, 10);

  setTimeout(() => {
    flyer.remove();
    cartBtn.style.transform = "scale(1.3)"; cartBtn.style.color = "#fbbf24";
    setTimeout(() => { cartBtn.style.transform = "scale(1)"; cartBtn.style.color = ""; }, 200);
  }, 800);
}

// --- EVENT LISTENER ADD TO CART (DENGAN CEK STOK LOCAL) ---
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("add-cart")) {
    const btn = e.target;
    
    // Cek duplikasi di keranjang (Opsional: Batasi beli 1 per klik atau max stok)
    // Untuk simpelnya, kita cek stok statis dari tombol
    const maxStock = parseInt(btn.dataset.stock);
    const itemInCart = cart.filter(i => i.id === btn.dataset.id).length;

    if (itemInCart >= maxStock) {
      return showAlert("Stok tidak mencukupi untuk menambah lagi!");
    }

    // Masukkan Data ke Array
    cart.push({ 
        id: btn.dataset.id, // Penting untuk mengurangi stok nanti
        name: btn.dataset.name, 
        price: parseInt(btn.dataset.price) 
    });
    
    // Animasi
    const card = btn.closest(".produk-card");
    const imgElement = card.querySelector("img");
    const emojiElement = card.querySelector(".produk-emoji");

    if (imgElement) flyToCart(btn, imgElement.src, true);
    else if (emojiElement) flyToCart(btn, emojiElement.textContent, false);

    setTimeout(() => { renderCart(); }, 700);
  }
});

// --- TOGGLE SIDEBAR ---
document.getElementById("cart-btn")?.addEventListener("click", () => document.body.classList.toggle("cart-open"));
document.getElementById("cart-close")?.addEventListener("click", () => document.body.classList.remove("cart-open"));

// --- CHECKOUT (UPDATE STOK DATABASE) ---
document.getElementById("checkout-btn")?.addEventListener("click", async () => {
  if (cart.length === 0) return showAlert("Keranjang kosong!");
  if (!auth.currentUser) {
    showAlert("Login dulu untuk belanja!");
    document.body.classList.remove("cart-open");
    loginWrapper.style.display="flex";
    return;
  }
  
  const total = cart.reduce((a,b) => a+b.price, 0);
  
  // Disable tombol biar ga double klik
  const btnCheckout = document.getElementById("checkout-btn");
  btnCheckout.disabled = true;
  btnCheckout.textContent = "Memproses...";

  try {
    // 1. Simpan Order
    await addDoc(collection(db, "orders"), {
      userId: auth.currentUser.uid,
      items: cart,
      total: total,
      status: "Baru",
      createdAt: Date.now()
    });

    // 2. Kurangi Stok di Database (Batch Logic Sederhana)
    // Kita loop item di keranjang dan kurangi satu per satu
    for (const item of cart) {
        if(item.id) {
            const productRef = doc(db, "products", item.id);
            await updateDoc(productRef, {
                stock: increment(-1)
            });
        }
    }

    // 3. Kirim WA
   // ... kode sebelumnya (di dalam event listener checkout-btn) ...

    // 3. Kirim WA
    const text = cart.map(i => `${i.name}`).join(", ");
    
    // PERUBAHAN: Nomor diganti menjadi 6289601572430
    window.open(`https://wa.me/6289601572430?text=Halo Admin, Saya mau order: ${text} | Total: Rp ${total.toLocaleString()}`, "_blank");
    
    // 4. Reset
    cart.length = 0; 
    renderCart(); 
    
    // ... kode selanjutnya ...
    renderCart(); 
    document.body.classList.remove("cart-open");
    loadProducts(); // Reload produk biar stok di tampilan update
    showAlert("Pesanan berhasil dibuat!");

  } catch(e) { 
    console.error(e);
    showAlert("Gagal checkout: " + e.message); 
  } finally {
    btnCheckout.disabled = false;
    btnCheckout.textContent = "Checkout WhatsApp";
  }
});


// ============ 8. MODAL & UI HELPERS ============
const logoutModal = document.getElementById("logout-confirm-modal");
document.getElementById("logout-btn")?.addEventListener("click", () => {
  if (logoutModal) logoutModal.style.display = "flex";
});
document.getElementById("btn-logout-no")?.addEventListener("click", () => logoutModal.style.display="none");
document.getElementById("btn-logout-yes")?.addEventListener("click", async () => {
  await signOut(auth); window.location.reload();
});

loginBtnNav.addEventListener("click", () => loginWrapper.style.display="flex");
document.getElementById("login-close").addEventListener("click", () => loginWrapper.style.display="none");

document.getElementById("go-register").addEventListener("click", () => {
  document.getElementById("login-tab").style.display="none";
  document.getElementById("register-tab").style.display="block";
});
document.getElementById("go-login").addEventListener("click", () => {
  document.getElementById("login-tab").style.display="block";
  document.getElementById("register-tab").style.display="none";
});

window.addEventListener("click", (e) => {
  if (e.target === loginWrapper) loginWrapper.style.display = "none";
  if (e.target === logoutModal) logoutModal.style.display = "none";
  if (e.target === customAlert) customAlert.style.display = "none";
});

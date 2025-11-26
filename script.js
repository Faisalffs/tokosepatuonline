import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// === CONFIG (Isi API Key Anda) ===
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

// === DOM ELEMENTS ===
const loginWrapper = document.getElementById("login-wrapper");
const userInfo = document.getElementById("user-info");
const loginBtnNav = document.getElementById("login-btn-nav");
const logoutBtn = document.getElementById("logout-btn");
const sortSelect = document.getElementById("sort-select");

// === CUSTOM ALERT ===
const customAlert = document.getElementById("custom-alert");
const alertMsg = document.getElementById("alert-msg");
function showAlert(msg) {
  if(customAlert) { alertMsg.textContent = msg; customAlert.style.display="flex"; }
  else alert(msg);
}
document.getElementById("btn-close-alert")?.addEventListener("click", () => customAlert.style.display="none");

// === AUTH & REDIRECT ===
onAuthStateChanged(auth, async (user) => {
  if (user) {
    if(loginWrapper) loginWrapper.style.display="none";
    loginBtnNav.style.display="none";
    logoutBtn.style.display="inline-block";
    
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        // REDIRECT ADMIN
        if (data.role === 'admin') { window.location.href = "admin.html"; return; }
        
        userInfo.style.display="inline-block";
        userInfo.textContent = `Halo, ${data.username}`;
      }
    } catch(e) { console.error(e); }
  } else {
    loginBtnNav.style.display="inline-block";
    logoutBtn.style.display="none";
    userInfo.style.display="none";
  }
});

// === LOAD PRODUK (TAB & SORTIR) ===
const sections = { home: document.getElementById("home-section"), produk: document.getElementById("produk-section") };

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    Object.values(sections).forEach(s => s.style.display="none");
    const target = document.getElementById(link.dataset.target);
    if(target) target.style.display="block";
    window.scrollTo({top:0, behavior:"smooth"});
  });
});

async function loadProducts() {
  const homeDiv = document.getElementById("home-products");
  const allDiv = document.getElementById("all-products");
  
  try {
    const snap = await getDocs(collection(db, "products"));
    const products = [];
    snap.forEach(d => products.push(d.data()));

    // SORTIR
    const type = sortSelect ? sortSelect.value : "newest";
    if(type === "cheap") products.sort((a,b) => a.price - b.price);
    else if(type === "expensive") products.sort((a,b) => b.price - a.price);
    else if(type === "name") products.sort((a,b) => a.name.localeCompare(b.name));
    else products.sort((a,b) => b.createdAt - a.createdAt);

    // RENDER
    const render = (container, data) => {
      container.innerHTML = "";
      if(data.length === 0) container.innerHTML = "<p>Kosong.</p>";
      data.forEach(p => container.appendChild(createCard(p)));
    };

    if(homeDiv) render(homeDiv, products.slice(0,3));
    if(allDiv) render(allDiv, products);

  } catch(e) { console.error(e); }
}

if(sortSelect) sortSelect.addEventListener("change", loadProducts);
loadProducts();

function createCard(p) {
  const card = document.createElement("div");
  card.className = "produk-card";
  
  let visual = "";
  if(p.imageType === 'image' || p.imageType === 'url') {
    visual = `<img src="${p.imageValue}" class="produk-img" alt="${p.name}">`;
  } else {
    visual = `<div class="produk-emoji">${p.imageValue || p.emoji}</div>`;
  }

  card.innerHTML = `
    ${visual}
    <h3>${p.name}</h3>
    <p class="price">Rp ${p.price.toLocaleString()}</p>
    <p class="desc">${p.desc}</p>
    <button class="add-cart" data-name="${p.name}" data-price="${p.price}">+ Keranjang</button>
  `;
  return card;
}

// === LOGIN / REGISTER / LOGOUT ===
// (Bagian Auth tetap sama, gunakan kode login/register sebelumnya, dipersingkat disini)
document.getElementById("btn-login")?.addEventListener("click", async () => {
   const u = document.getElementById("login-username").value;
   const p = document.getElementById("login-password").value;
   if(!u || !p) return showAlert("Isi data!");
   try {
     const uSnap = await getDoc(doc(db, "usernames", u));
     if(!uSnap.exists()) throw new Error("User tidak ada");
     const uid = uSnap.data().uid;
     const userSnap = await getDoc(doc(db, "users", uid));
     await signInWithEmailAndPassword(auth, userSnap.data().email, p);
     showAlert("Login Sukses!");
   } catch(e) { showAlert(e.message); }
});

// LOGOUT CONFIRM
const logoutModal = document.getElementById("logout-confirm-modal");
document.getElementById("logout-btn")?.addEventListener("click", () => logoutModal.style.display="flex");
document.getElementById("btn-logout-no")?.addEventListener("click", () => logoutModal.style.display="none");
document.getElementById("btn-logout-yes")?.addEventListener("click", async () => {
  await signOut(auth); window.location.reload();
});


// === KERANJANG (SIDEBAR PUSH) ===
const cart = [];
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartList = document.getElementById("cart-items");

function renderCart() {
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    total += item.price;
    const li = document.createElement("li");
    li.textContent = `${item.name} - Rp ${item.price.toLocaleString()}`;
    cartList.appendChild(li);
  });
  if(cartTotal) cartTotal.textContent = total.toLocaleString();
  if(cartCount) cartCount.textContent = cart.length; // FIX COUNTER
}

// Add Item
document.addEventListener("click", (e) => {
  if(e.target.classList.contains("add-cart")) {
    const btn = e.target;
    cart.push({name: btn.dataset.name, price: parseInt(btn.dataset.price)});
    renderCart();
    showAlert("Masuk Keranjang! 🛒");
    
    // Auto buka sidebar saat tambah item (Opsional, biar keren)
    document.body.classList.add("cart-open");
  }
});

// TOGGLE SIDEBAR (BODY CLASS)
document.getElementById("cart-btn")?.addEventListener("click", () => {
  document.body.classList.toggle("cart-open");
});
document.getElementById("cart-close")?.addEventListener("click", () => {
  document.body.classList.remove("cart-open");
});

// CHECKOUT
document.getElementById("checkout-btn")?.addEventListener("click", async () => {
  if(cart.length === 0) return showAlert("Kosong!");
  if(!auth.currentUser) { showAlert("Login dulu!"); return; }
  
  // Kirim DB & WA
  const total = cart.reduce((a,b)=>a+b.price,0);
  await addDoc(collection(db,"orders"), {
    uid: auth.currentUser.uid, items: cart, total, status: "Baru", date: Date.now()
  });
  const text = cart.map(i=>i.name).join(", ");
  window.open(`https://wa.me/6281234567890?text=Order: ${text} | Total: ${total}`, "_blank");
  
  cart.length=0; renderCart(); document.body.classList.remove("cart-open");
});

// Modal UI Helpers (Login)
loginBtnNav.addEventListener("click", () => loginWrapper.style.display="flex");
document.getElementById("login-close").addEventListener("click", () => loginWrapper.style.display="none");
// ... toggle tab login/register ...
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIG
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
// 1. ADD FORM
const inpName = document.getElementById("p-name"), inpPrice = document.getElementById("p-price"), inpStock = document.getElementById("p-stock"), inpCategory = document.getElementById("p-category"), inpDesc = document.getElementById("p-desc");
const selectType = document.getElementById("p-type"), inpEmoji = document.getElementById("p-emoji"), inpFile = document.getElementById("p-file"), fileInfo = document.getElementById("file-info");
const btnSave = document.getElementById("btn-save");

// 2. EDIT FORM (MODAL)
const eName = document.getElementById("e-name"), ePrice = document.getElementById("e-price"), eStock = document.getElementById("e-stock"), eCategory = document.getElementById("e-category"), eDesc = document.getElementById("e-desc");
const eType = document.getElementById("e-type"), eEmoji = document.getElementById("e-emoji"), eFile = document.getElementById("e-file"), eFileInfo = document.getElementById("e-file-info");
const btnUpdate = document.getElementById("btn-update-edit"), btnCancelEdit = document.getElementById("btn-cancel-edit");
const editModal = document.getElementById("edit-product-modal");

// 3. TABLES & TABS
const tableBody = document.getElementById("table-body");
const orderTableBody = document.getElementById("order-table-body");
const tabList = document.getElementById("tab-btn-list"), tabAdd = document.getElementById("tab-btn-add"), tabOrders = document.getElementById("tab-btn-orders");
const viewList = document.getElementById("view-list-products"), viewAdd = document.getElementById("view-add-product"), viewOrders = document.getElementById("view-orders");
const statProducts = document.getElementById("stat-products"), statStock = document.getElementById("stat-stock"), statOrders = document.getElementById("stat-orders");

let editId = null; let productsData = []; let currentImageUrl = ""; 

// === HELPER ===
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

function switchView(viewName) {
    viewList.style.display = "none"; viewAdd.style.display = "none"; viewOrders.style.display = "none";
    tabList.classList.remove("active-tab"); tabAdd.classList.remove("active-tab"); tabOrders.classList.remove("active-tab");

    if (viewName === 'list') { viewList.style.display = "block"; tabList.classList.add("active-tab"); loadProducts(); } 
    else if (viewName === 'add') { viewAdd.style.display = "block"; tabAdd.classList.add("active-tab"); resetAddForm(); } 
    else if (viewName === 'orders') { viewOrders.style.display = "block"; tabOrders.classList.add("active-tab"); loadOrders(); }
}

if(tabList) tabList.addEventListener("click", () => switchView('list'));
if(tabAdd) tabAdd.addEventListener("click", () => switchView('add'));
if(tabOrders) tabOrders.addEventListener("click", () => switchView('orders'));

// Logic Image Input (Add Form)
if (selectType) {
  selectType.addEventListener("change", () => {
    if (selectType.value === "emoji") { inpEmoji.style.display = "block"; inpFile.style.display = "none"; fileInfo.style.display = "none"; } 
    else { inpEmoji.style.display = "none"; inpFile.style.display = "block"; fileInfo.style.display = "block"; fileInfo.textContent = "📁 Maksimal 500KB"; }
  });
}

// Logic Image Input (Edit Form)
if (eType) {
  eType.addEventListener("change", () => {
    if (eType.value === "emoji") { eEmoji.style.display = "block"; eFile.style.display = "none"; eFileInfo.style.display = "none"; } 
    else { eEmoji.style.display = "none"; eFile.style.display = "block"; eFileInfo.style.display = "block"; eFileInfo.textContent = "Biarkan kosong jika tidak ganti foto"; }
  });
}

function updateStats(ordersCount = null) {
    if (statProducts) statProducts.textContent = productsData.length;
    if (statStock) { const totalStock = productsData.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0); statStock.textContent = totalStock; }
    if (statOrders && ordersCount !== null) statOrders.textContent = ordersCount;
}

// === AUTH ===
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data().role === 'admin') { loadProducts(); loadOrders(); } 
      else { alert("Bukan Admin!"); window.location.href = "index.html"; }
    } catch (e) { window.location.href = "index.html"; }
  } else { window.location.href = "index.html"; }
});

// === PRODUK: READ ===
async function loadProducts() {
  tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Loading...</td></tr>";
  try {
    const snap = await getDocs(collection(db, "products"));
    productsData = [];
    snap.forEach(d => productsData.push({ id: d.id, ...d.data() }));
    productsData.sort((a, b) => b.createdAt - a.createdAt);
    renderTable(); updateStats();
  } catch (e) { console.error(e); }
}

function renderTable() {
  tableBody.innerHTML = "";
  if (productsData.length === 0) { tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Belum ada produk.</td></tr>"; return; }
  productsData.forEach(p => {
    let visual = (p.imageType === 'image' || p.imageType === 'url') ? `<img src="${p.imageValue}" style="width:50px; height:50px; object-fit:cover; border-radius:8px;">` : `<span style="font-size:2rem">${p.imageValue || p.emoji}</span>`;
    let catBadge = `<span style="background:rgba(59,130,246,0.2); color:#60a5fa; padding:2px 8px; border-radius:4px; font-size:0.75rem;">${p.category || 'Uncategorized'}</span>`;
    let sizeBadge = (p.sizes && p.sizes.length > 0) ? `<small style="color:#aaa;">Size: ${p.sizes.join(", ")}</small>` : `<small style="color:#aaa;">All Size</small>`;
    const row = document.createElement("tr");
    row.innerHTML = `<td>${visual}</td><td><strong>${p.name}</strong><br>${catBadge} <br> ${sizeBadge}</td><td style="color:#fbbf24; font-weight:bold;">Rp ${p.price.toLocaleString('id-ID')}</td><td>${p.stock || 0} Pcs</td><td><button onclick="window.startEdit('${p.id}')" style="background:#fbbf24; color:black; border:none; padding:6px 12px; border-radius:6px; margin-right:5px; cursor:pointer; font-weight:bold;">Edit</button><button onclick="window.hapus('${p.id}')" style="background:rgba(239,68,68,0.2); color:#f87171; border:1px solid #ef4444; padding:6px 12px; border-radius:6px; cursor:pointer;">Hapus</button></td>`;
    tableBody.appendChild(row);
  });
}

// === PRODUK: CREATE (TAMBAH) ===
btnSave.addEventListener("click", async () => {
  const name = inpName.value, price = parseInt(inpPrice.value), stock = parseInt(inpStock.value), desc = inpDesc.value, category = inpCategory.value, type = selectType.value;
  const selectedSizes = Array.from(document.querySelectorAll('input[name="size"]:checked')).map(cb => cb.value);
  if(!name || !price || isNaN(stock) || !desc) return alert("Isi data!");
  if(selectedSizes.length === 0) selectedSizes.push("All Size");

  btnSave.disabled = true; btnSave.textContent = "Menyimpan...";
  try {
    let finalImageValue = "";
    if (type === 'emoji') { finalImageValue = inpEmoji.value; if(!finalImageValue) throw new Error("Isi Emoji!"); } 
    else {
      const file = inpFile.files[0];
      if (file) { if (file.size > 500 * 1024) throw new Error("File Max 500KB"); finalImageValue = await convertToBase64(file); } 
      else throw new Error("Pilih Foto!");
    }
    const payload = { name, price, stock, desc, category, sizes: selectedSizes, imageType: type, imageValue: finalImageValue, emoji: type === 'emoji' ? finalImageValue : "", createdAt: Date.now() };
    await addDoc(collection(db, "products"), payload);
    alert("Produk Berhasil Ditambah!");
    resetAddForm();
    switchView('list');
  } catch (e) { alert("Error: " + e.message); } finally { btnSave.disabled = false; btnSave.textContent = "+ Simpan Produk"; }
});

function resetAddForm() {
  inpName.value = ""; inpPrice.value = ""; inpStock.value = ""; inpDesc.value = ""; inpEmoji.value = ""; inpFile.value = ""; inpCategory.value = "Uncategorized";
  document.querySelectorAll('input[name="size"]').forEach(cb => cb.checked = false);
}

// === PRODUK: DELETE ===
window.hapus = async (id) => { 
    if(confirm("Hapus permanen?")) { await deleteDoc(doc(db, "products", id)); loadProducts(); } 
};

// === PRODUK: EDIT (POP-UP) ===
window.startEdit = (id) => {
  const p = productsData.find(x => x.id === id); if (!p) return;
  editId = id;
  currentImageUrl = p.imageValue;

  // Isi Data ke Modal
  eName.value = p.name; ePrice.value = p.price; eStock.value = p.stock || 0; eDesc.value = p.desc; eCategory.value = p.category || "Uncategorized";
  document.querySelectorAll('input[name="size-edit"]').forEach(cb => cb.checked = false);
  if (p.sizes) p.sizes.forEach(s => { const cb = document.querySelector(`input[name="size-edit"][value="${s}"]`); if(cb) cb.checked = true; });

  if (p.imageType === 'image' || p.imageType === 'url') {
    eType.value = 'image'; eFile.style.display = 'block'; eEmoji.style.display = 'none'; eFileInfo.style.display = 'block'; eFileInfo.textContent = "Biarkan kosong jika tidak ganti foto";
  } else {
    eType.value = 'emoji'; eFile.style.display = 'none'; eEmoji.style.display = 'block'; eFileInfo.style.display = 'none'; eEmoji.value = p.imageValue || p.emoji;
  }

  // Tampilkan Modal
  editModal.style.display = "flex";
};

// Tombol Simpan di Modal Edit
btnUpdate.addEventListener("click", async () => {
    const name = eName.value, price = parseInt(ePrice.value), stock = parseInt(eStock.value), desc = eDesc.value, category = eCategory.value, type = eType.value;
    const selectedSizes = Array.from(document.querySelectorAll('input[name="size-edit"]:checked')).map(cb => cb.value);
    if(!name || !price || isNaN(stock) || !desc) return alert("Isi data!");
    if(selectedSizes.length === 0) selectedSizes.push("All Size");

    btnUpdate.disabled = true; btnUpdate.textContent = "Menyimpan...";
    try {
        let finalImageValue = "";
        if (type === 'emoji') { finalImageValue = eEmoji.value; if(!finalImageValue) throw new Error("Isi Emoji!"); } 
        else {
            const file = eFile.files[0];
            if (file) { 
                if (file.size > 500 * 1024) throw new Error("File Max 500KB"); 
                finalImageValue = await convertToBase64(file); 
            } else { 
                finalImageValue = currentImageUrl; // Pakai foto lama
            }
        }
        
        const payload = { name, price, stock, desc, category, sizes: selectedSizes, imageType: type, imageValue: finalImageValue, emoji: type === 'emoji' ? finalImageValue : "" };
        await updateDoc(doc(db, "products", editId), payload);
        alert("Produk Berhasil Diupdate!");
        editModal.style.display = "none";
        loadProducts();
    } catch (e) { alert("Error: " + e.message); } 
    finally { btnUpdate.disabled = false; btnUpdate.textContent = "Simpan Perubahan"; }
});

btnCancelEdit.addEventListener("click", () => editModal.style.display = "none");

// ============ ORDERS & STATUS OK BUTTON ============
async function loadOrders() {
    orderTableBody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Loading...</td></tr>";
    try {
        const userMap = await getUserMap();
        const snap = await getDocs(collection(db, "orders"));
        let orders = []; snap.forEach(d => orders.push({ id: d.id, ...d.data() }));
        orders.sort((a, b) => b.createdAt - a.createdAt);
        renderOrders(orders, userMap);
        updateStats(orders.length);
    } catch (e) { orderTableBody.innerHTML = `<tr><td colspan='7'>Error: ${e.message}</td></tr>`; }
}

async function getUserMap() { const map = {}; try { const snap = await getDocs(collection(db, "users")); snap.forEach(d => map[d.id] = d.data().username || "Unknown"); } catch(e){} return map; }

function renderOrders(orders, userMap) {
    orderTableBody.innerHTML = "";
    if (orders.length === 0) { orderTableBody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Belum ada pesanan.</td></tr>"; return; }
    orders.forEach(o => {
        const date = new Date(o.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
        const rawId = o.userId || "UnknownID"; const shortId = rawId.length > 5 ? rawId.slice(0, 5) : rawId; const userName = userMap[rawId] || "User Tidak Dikenal";
        const itemsList = o.items.map(i => `• ${i.name} ${i.size ? '(Size: '+i.size+')' : ''}`).join("<br>");
        let statusColor = "#fbbf24"; 
        if (o.status === "Lunas / Proses") statusColor = "#3b82f6"; if (o.status === "Selesai") statusColor = "#10b981"; if (o.status === "Batal") statusColor = "#ef4444";
        const proofBtn = o.proofImage ? `<button onclick="window.lihatBukti('${o.proofImage}')" style="background:rgba(139,92,246,0.2); color:#a78bfa; border:1px solid rgba(139,92,246,0.4); padding:6px 12px; border-radius:8px; cursor:pointer;">📷 Lihat</button>` : `<span style="color:#aaa;">-</span>`;

        const selectId = `status-select-${o.id}`;
        const row = document.createElement("tr");
        row.innerHTML = `<td>${date}</td><td><strong>${userName}</strong><br><small style="color:#aaa;">ID: ${shortId}...</small></td><td style="font-size:0.9rem; color:#e2e8f0;">${itemsList}</td><td style="color:#fbbf24; font-weight:bold;">Rp ${o.total.toLocaleString('id-ID')}</td><td style="text-align:center;">${proofBtn}</td><td><span style="background:${statusColor}; color:black; padding:4px 10px; border-radius:6px; font-weight:bold; font-size:0.75rem;">${o.status}</span></td>
        <td>
            <div style="display:flex; gap:5px; margin-bottom:8px;">
                <select id="${selectId}" style="padding:8px; border-radius:8px; border:1px solid #555; background:#222; color:white; width:100%;">
                    <option value="Menunggu Verifikasi" ${o.status==='Menunggu Verifikasi'?'selected':''}>Menunggu</option>
                    <option value="Lunas / Proses" ${o.status==='Lunas / Proses'?'selected':''}>Proses</option>
                    <option value="Selesai" ${o.status==='Selesai'?'selected':''}>Selesai</option>
                    <option value="Batal" ${o.status==='Batal'?'selected':''}>Batal</option>
                </select>
                <button onclick="window.simpanStatus('${o.id}', '${selectId}')" style="background:#10b981; color:black; border:none; padding:0 12px; border-radius:8px; cursor:pointer; font-weight:bold;">OK</button>
            </div>
            <button onclick="window.hapusOrder('${o.id}')" style="width:100%; background:rgba(239,68,68,0.2); color:#f87171; border:1px solid #ef4444; padding:6px; border-radius:8px; cursor:pointer;">Hapus</button>
        </td>`;
        orderTableBody.appendChild(row);
    });
}

window.simpanStatus = async (orderId, selectElementId) => {
    const selectEl = document.getElementById(selectElementId);
    if(!selectEl) return;
    const newStatus = selectEl.value;
    const btn = selectEl.nextElementSibling; 
    const oldText = btn.textContent;
    btn.textContent = "..."; btn.disabled = true;

    try {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        btn.textContent = "✓"; btn.style.background = "#fbbf24";
        setTimeout(() => { loadOrders(); }, 1000);
    } catch(e) { alert("Gagal: " + e.message); btn.textContent = oldText; btn.disabled = false; }
};

window.hapusOrder = async (id) => { if(confirm("Hapus pesanan ini permanen?")) { await deleteDoc(doc(db, "orders", id)); loadOrders(); }};
window.lihatBukti = (url) => { const w = window.open("", "_blank"); w.document.write(`<body style="background:#1a1a1a;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;"><img src="${url}" style="max-width:90%;max-height:90%;border-radius:10px;"></body>`); };

const logoutModal = document.getElementById("logout-confirm-modal");
document.getElementById("logout-btn").addEventListener("click", () => logoutModal.style.display="flex");
document.getElementById("btn-logout-no").addEventListener("click", () => logoutModal.style.display="none");
document.getElementById("btn-logout-yes").addEventListener("click", async () => { await signOut(auth); window.location.href="index.html"; });

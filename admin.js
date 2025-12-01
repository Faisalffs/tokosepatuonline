import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// === CONFIG ===
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
const tableBody = document.getElementById("table-body");
const inpName = document.getElementById("p-name");
const inpPrice = document.getElementById("p-price");
const inpStock = document.getElementById("p-stock"); // INPUT STOK
const inpDesc = document.getElementById("p-desc");

// Element Gambar
const selectType = document.getElementById("p-type");
const inpEmoji = document.getElementById("p-emoji");
const inpFile = document.getElementById("p-file");
const fileInfo = document.getElementById("file-info");

const btnSave = document.getElementById("btn-save");
const btnCancel = document.getElementById("btn-cancel");

let isEditing = false;
let editId = null;
let productsData = [];
let currentImageUrl = ""; 

// === HELPER: CONVERT FILE TO BASE64 (HACK STORAGE) ===
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// === LOGIKA GANTI INPUT (EMOJI vs FILE) ===
if (selectType) {
  selectType.addEventListener("change", () => {
    if (selectType.value === "emoji") {
      inpEmoji.style.display = "block";
      inpFile.style.display = "none";
      fileInfo.style.display = "none";
    } else {
      inpEmoji.style.display = "none";
      inpFile.style.display = "block";
      fileInfo.style.display = "block";
      fileInfo.textContent = isEditing ? "Biarkan kosong jika tidak ganti foto" : "Wajib pilih foto (Max 500KB)";
    }
  });
}

// === 1. CEK KEAMANAN (REDIRECT NON-ADMIN) ===
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data().role === 'admin') {
        loadProducts(); // Aman, load data
      } else {
        alert("Anda bukan Admin!");
        window.location.href = "index.html"; // Tendang ke user
      }
    } catch (e) { window.location.href = "index.html"; }
  } else {
    window.location.href = "index.html"; // Belum login
  }
});

// === 2. CRUD PRODUK ===
async function loadProducts() {
  tableBody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:white;'>Loading data...</td></tr>";
  try {
    const snap = await getDocs(collection(db, "products"));
    productsData = [];
    snap.forEach(d => productsData.push({ id: d.id, ...d.data() }));
    productsData.sort((a, b) => b.createdAt - a.createdAt);
    renderTable();
  } catch (e) { console.error(e); }
}

function renderTable() {
  tableBody.innerHTML = "";
  productsData.forEach(p => {
    let visual = "";
    if (p.imageType === 'image' || p.imageType === 'url') {
      visual = `<img src="${p.imageValue}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">`;
    } else {
      visual = `<span style="font-size:2rem">${p.imageValue || p.emoji}</span>`;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${visual}</td>
      <td><strong>${p.name}</strong></td>
      <td>Rp ${p.price.toLocaleString('id-ID')}</td>
      <td>${p.stock || 0} Pcs</td> <td style="color:#aaa">${p.desc}</td>
      <td>
        <button onclick="window.startEdit('${p.id}')" class="btn-action edit">Edit</button>
        <button onclick="window.hapus('${p.id}')" class="btn-action hapus">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// === 3. SIMPAN (CREATE / UPDATE) ===
btnSave.addEventListener("click", async () => {
  const name = inpName.value;
  const price = parseInt(inpPrice.value);
  const stock = parseInt(inpStock.value); // AMBIL STOK
  const desc = inpDesc.value;
  const type = selectType.value; 
  
  if(!name || !price || isNaN(stock) || !desc) return alert("Isi semua data termasuk stok!");

  btnSave.disabled = true;
  btnSave.textContent = "Menyimpan...";

  try {
    let finalImageValue = "";

    if (type === 'emoji') {
      finalImageValue = inpEmoji.value;
      if(!finalImageValue) throw new Error("Emoji wajib diisi!");
    } else {
      // HANDLE FILE UPLOAD (BASE64)
      const file = inpFile.files[0];
      if (file) {
        // FIX: BATAS SIZE TURUN JADI 500KB AGAR FIREBASE TIDAK ERROR
        if (file.size > 500 * 1024) throw new Error("File terlalu besar! Max 500KB");
        finalImageValue = await convertToBase64(file);
      } else {
        // Jika edit dan tidak ganti foto
        if (isEditing) finalImageValue = currentImageUrl;
        else throw new Error("Foto wajib dipilih!");
      }
    }

    const payload = { 
      name, price, stock, desc, // SIMPAN STOK KE DATABASE
      imageType: type, 
      imageValue: finalImageValue,
      emoji: type === 'emoji' ? finalImageValue : "" 
    };

    if (isEditing) {
      await updateDoc(doc(db, "products", editId), payload);
      alert("Produk Updated!");
    } else {
      payload.createdAt = Date.now();
      await addDoc(collection(db, "products"), payload);
      alert("Produk Saved!");
    }
    
    resetForm();
    loadProducts();
  } catch (e) { alert("Error: " + e.message); }
  finally { 
    btnSave.disabled = false; 
    btnSave.textContent = isEditing ? "Simpan Perubahan" : "+ Simpan Produk";
  }
});

// === 4. GLOBAL HELPER ===
window.hapus = async (id) => {
  if (confirm("Hapus produk ini?")) {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  }
};

window.startEdit = (id) => {
  const p = productsData.find(x => x.id === id);
  if (!p) return;
  
  inpName.value = p.name; 
  inpPrice.value = p.price; 
  inpStock.value = p.stock || 0; // ISI FORM DENGAN STOK LAMA
  inpDesc.value = p.desc;

  if (p.imageType === 'image' || p.imageType === 'url') {
    selectType.value = 'image';
    inpFile.style.display = 'block'; inpEmoji.style.display = 'none';
    fileInfo.style.display = 'block';
    fileInfo.textContent = "Biarkan kosong jika tidak ganti foto";
    currentImageUrl = p.imageValue;
  } else {
    selectType.value = 'emoji';
    inpFile.style.display = 'none'; inpEmoji.style.display = 'block';
    fileInfo.style.display = 'none';
    inpEmoji.value = p.imageValue || p.emoji;
  }

  isEditing = true; editId = id;
  btnSave.textContent = "Simpan Perubahan";
  btnCancel.style.display = "block";
};

function resetForm() {
  isEditing = false; editId = null; currentImageUrl = "";
  inpName.value = ""; 
  inpPrice.value = ""; 
  inpStock.value = ""; // RESET STOK
  inpDesc.value = "";
  inpEmoji.value = ""; inpFile.value = "";
  selectType.value = "emoji";
  inpEmoji.style.display = "block"; inpFile.style.display = "none";
  fileInfo.style.display = "none";
  btnSave.textContent = "+ Simpan Produk";
  btnCancel.style.display = "none";
}
btnCancel.addEventListener("click", resetForm);

// === 5. LOGOUT CONFIRMATION (ADMIN) ===
const logoutModal = document.getElementById("logout-confirm-modal");
const btnYes = document.getElementById("btn-logout-yes");
const btnNo = document.getElementById("btn-logout-no");

document.getElementById("logout-btn").addEventListener("click", () => {
  if (logoutModal) logoutModal.style.display = "flex";
});

if(btnNo) btnNo.addEventListener("click", () => logoutModal.style.display = "none");

if(btnYes) {
  btnYes.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

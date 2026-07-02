// 1. MASUKKAN URL GOOGLE APPS SCRIPT DI SINI
const GAS_URL = "https://script.google.com/macros/s/AKfycbxoabOhILmnKHBElWFFGr3qIjmpRWVouvdGOW5YGEXke6Fnr0udZ5FCBVg4K0YhhGMZ/exec";

// ==========================================
// BAGIAN 1: MANAJEMEN SESI (Mengingat Login)
// ==========================================
function checkSession() {
    const sessionData = localStorage.getItem("perindagku_session");
    if (sessionData) {
        const user = JSON.parse(sessionData);
        // Sembunyikan login, tampilkan dashboard
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("dashboardPage").style.display = "block";
        
        // Tampilkan info user
        document.getElementById("userNama").innerText = user.nama;
        document.getElementById("userNip").innerText = user.nip;
        document.getElementById("userHakAkses").innerText = user.hak_akses;
        
        loadModul(); // Muat pilihan modul
    } else {
        document.getElementById("loginPage").style.display = "block";
        document.getElementById("dashboardPage").style.display = "none";
    }
}

// Tombol Logout
document.getElementById("btnLogout").addEventListener("click", function() {
    localStorage.removeItem("perindagku_session");
    checkSession();
});

// ==========================================
// BAGIAN 2: PROSES LOGIN
// ==========================================
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const nip = document.getElementById("nip").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("loginMessage");
    
    msg.innerText = "Mengecek data pegawai...";
    msg.style.color = "blue";

    try {
        // Berdasarkan kode Anda, login menggunakan parameter action=login 
        const response = await fetch(`${GAS_URL}?action=login&nip=${nip}&password=${password}`);
        const result = await response.json();

        if (result.status === "Sukses") {
            // Simpan sesi dan masuk 
            const userData = { nip: nip, nama: result.nama, hak_akses: result.hak_akses };
            localStorage.setItem("perindagku_session", JSON.stringify(userData));
            checkSession(); 
        } else {
            msg.innerText = result.pesan || "NIP atau Password salah!"; // [cite: 29]
            msg.style.color = "red";
        }
    } catch (error) {
        msg.innerText = "Koneksi terputus. Pastikan URL Apps Script sudah benar.";
        msg.style.color = "red";
    }
});

// ==========================================
// BAGIAN 3: AMBIL DATA MODUL DAN KIRIM LAPORAN
// ==========================================
async function loadModul() {
    try {
        // Ambil data modul dari Apps Script [cite: 44]
        const response = await fetch(`${GAS_URL}?action=getModul`);
        const modulList = await response.json();
        
        const selectModul = document.getElementById("modul");
        selectModul.innerHTML = '<option value="">-- Pilih Modul --</option>'; 
        
        modulList.forEach(m => {
            const option = document.createElement("option");
            option.value = m.nama_modul; // [cite: 46]
            option.text = m.nama_modul;
            selectModul.appendChild(option);
        });
    } catch (error) {
        console.error("Gagal mengambil modul", error);
    }
}

document.getElementById("laporanForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("perindagku_session"));
    const msg = document.getElementById("laporanMessage");
    
    msg.innerText = "Sedang mengirim laporan ke server...";
    msg.style.color = "blue";

    // Format data sesuai dengan Apps Script penerima (doPost) [cite: 136, 225, 231]
    const payloadData = {
        action: "insert_data",
        nama_modul: document.getElementById("modul").value,
        Petugas: user.nama,
        NIP: user.nip,
        Nama_Usaha: document.getElementById("namaUsaha").value,
        Keterangan: document.getElementById("keterangan").value
    };

    try {
        const response = await fetch(GAS_URL, {
            method: "POST",
            body: JSON.stringify(payloadData) // [cite: 137]
        });
        const result = await response.json();

        if (result.status === "Sukses") {
            msg.innerText = result.pesan || "Laporan berhasil disimpan!"; // [cite: 255]
            msg.style.color = "green";
            document.getElementById("laporanForm").reset();
        } else {
            msg.innerText = "Gagal: " + result.pesan; // [cite: 256]
            msg.style.color = "red";
        }
    } catch (error) {
        msg.innerText = "Gagal mengirim data.";
        msg.style.color = "red";
    }
});

// Jalankan sistem saat halaman pertama kali dibuka
window.onload = checkSession;
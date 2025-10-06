// --- Pengaturan Penyimpanan Data Permanen ---
const STORAGE_KEY = 'tabunganBerduaData';

// Fungsi untuk menyimpan seluruh data ke localStorage
function simpanData() {
    const data = {
        saldo: totalSaldo,
        angga: kontribusiAngga,
        wawa: kontribusiWawa,
        riwayat: Array.from(riwayatList.children).map(li => li.innerHTML) 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Fungsi untuk memuat data dari localStorage
function muatData() {
    const dataString = localStorage.getItem(STORAGE_KEY);
    
    if (dataString) {
        const data = JSON.parse(dataString);
        
        totalSaldo = data.saldo || 0;
        kontribusiAngga = data.angga || 0;
        kontribusiWawa = data.wawa || 0;
        
        if (data.riwayat) {
            data.riwayat.reverse().forEach(itemHTML => {
                const listItem = document.createElement('li');
                
                const isAngga = itemHTML.includes('Angga');
                listItem.classList.add(isAngga ? 'angga' : 'wawa');
                
                listItem.innerHTML = itemHTML;
                riwayatList.prepend(listItem);
            });
        }
    }
}


// --- Pengaturan Tujuan Awal ---
const TARGET_DANA = 10000000; // Rp 10.000.000

// --- Variabel Saldo & Kontribusi ---
let totalSaldo = 0;
let kontribusiAngga = 0;
let kontribusiWawa = 0;

// --- DOM Elements (ID Disesuaikan) ---
const totalSaldoDisplay = document.getElementById('total-saldo');
const kontribusiAnggaDisplay = document.getElementById('kontribusi-angga-display');
const kontribusiWawaDisplay = document.getElementById('kontribusi-wawa-display');
const inputJumlah = document.getElementById('jumlah');
const selectPengguna = document.getElementById('pengguna');
const riwayatList = document.getElementById('riwayat-list');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const targetAmountDisplay = document.getElementById('target-amount');

// Fungsi pembantu untuk format Rupiah
function formatRupiah(angka) {
    // Digunakan untuk DISPLAY output (mempertahankan 'Rp')
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// FUNGSI BARU: Untuk memformat input jumlah (nominal tanpa 'Rp')
function formatNominal(angka) {
    // 1. Ubah input menjadi angka murni (hapus semua non-digit)
    const angkaBersih = angka.replace(/\D/g, ''); 
    if (angkaBersih === '') return '';

    // 2. Konversi ke integer dan format dengan pemisah ribuan
    const angkaTerformat = parseInt(angkaBersih).toLocaleString('id-ID');
    
    return angkaTerformat;
}

// FUNGSI BARU: Handle input real-time
function handleInputFormat(event) {
    // Ambil nilai input dan format
    const nilaiTerformat = formatNominal(event.target.value);
    
    // Terapkan kembali nilai yang sudah diformat ke input
    event.target.value = nilaiTerformat;
}

// Fungsi utama untuk memperbarui seluruh tampilan
function updateDisplay() {
    totalSaldoDisplay.textContent = formatRupiah(totalSaldo);
    kontribusiAnggaDisplay.textContent = formatRupiah(kontribusiAngga);
    kontribusiWawaDisplay.textContent = formatRupiah(kontribusiWawa);

    const percentage = Math.min((totalSaldo / TARGET_DANA) * 100, 100);
    progressBar.style.width = percentage.toFixed(2) + '%';
    progressText.textContent = `${percentage.toFixed(2)}% tercapai`;

    if (totalSaldo >= TARGET_DANA) {
        progressText.textContent = 'TUJUAN TERCAPAI! 🎉';
    }
}

// Fungsi untuk menambahkan riwayat transaksi
function addRiwayat(pengguna, jumlah) {
    const listItem = document.createElement('li');
    const now = new Date();
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    const waktuLengkap = now.toLocaleDateString('id-ID', options);
    
    const namaPengguna = pengguna === 'angga' ? 'Angga' : 'Wawa'; 
    
    listItem.classList.add(pengguna);
    listItem.innerHTML = `Setoran dari <strong>${namaPengguna}</strong>: ${formatRupiah(jumlah)} (${waktuLengkap})`;
    
    riwayatList.prepend(listItem);
}

// Fungsi untuk SETOR (Tabung)
function addSetoran() {
    // AMBIL NILAI: Bersihkan string dari pemisah ribuan (titik) sebelum di-parse
    const nilaiInputBersih = inputJumlah.value.replace(/\./g, '');
    const jumlahSetor = parseInt(nilaiInputBersih);
    const pengguna = selectPengguna.value;

    if (isNaN(jumlahSetor) || jumlahSetor <= 0) {
        alert('Masukkan jumlah setoran yang valid (angka positif).');
        // Kosongkan input bahkan jika ada angka tidak valid yang terformat
        inputJumlah.value = ''; 
        return;
    }

    totalSaldo += jumlahSetor;

    if (pengguna === 'angga') {
        kontribusiAngga += jumlahSetor;
    } else if (pengguna === 'wawa') {
        kontribusiWawa += jumlahSetor;
    }
    
    updateDisplay();
    addRiwayat(pengguna, jumlahSetor);
    
    simpanData(); 
    
    // Kosongkan input
    inputJumlah.value = '';
}

// Inisialisasi: Atur nilai target dan tampilkan saldo awal
function init() {
    muatData(); 
    
    targetAmountDisplay.textContent = formatRupiah(TARGET_DANA);
    updateDisplay();
    
    // BARU: Tambahkan event listener saat inisialisasi
    inputJumlah.addEventListener('input', handleInputFormat);
}

// --- Fungsi untuk Reset Data Permanen ---
function resetData() {
    // Tampilkan konfirmasi untuk menghindari penghapusan yang tidak disengaja
    const konfirmasi = confirm("Apakah Anda yakin ingin me-RESET SEMUA data tabungan (Saldo, Kontribusi, dan Riwayat)? Tindakan ini tidak bisa dibatalkan.");

    if (konfirmasi) {
        // 1. Hapus data dari localStorage
        localStorage.removeItem(STORAGE_KEY);
        
        // 2. Reset variabel global
        totalSaldo = 0;
        kontribusiAngga = 0;
        kontribusiWawa = 0;

        // 3. Bersihkan riwayat di tampilan
        riwayatList.innerHTML = ''; 

        // 4. Perbarui seluruh tampilan
        updateDisplay();
        
        alert("Data tabungan berhasil di-reset!");
    }
}
// Sisa kode (simpanData, muatData, init, dll.) tetap dipertahankan.
init();
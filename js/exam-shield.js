const siswa = requireAuth('siswa');
const ujian = JSON.parse(sessionStorage.getItem('currentUjian') || 'null');
if (!siswa || !ujian) { window.location.href = 'index.html'; throw new Error(); }

// === Load Soal ===
let bankSoal = DB.getSoal(ujian.mapel);
if (ujian.antiCurang.acakSoal) bankSoal = bankSoal.sort(() => Math.random() - 0.5);
bankSoal = bankSoal.slice(0, ujian.jumlahSoal);

if (ujian.antiCurang.acakOpsi) {
  bankSoal = bankSoal.map(s => {
    const keys = Object.keys(s.opsi || {}).sort(() => Math.random() - 0.5);
    const newOpsi = {};
    keys.forEach((k, i) => newOpsi[String.fromCharCode(65+i)] = s.opsi[k]);
    return { ...s, opsi: newOpsi };
  });
}

let currentIndex = 0;
let jawaban = new Array(bankSoal.length).fill(null);
let ditandai = new Array(bankSoal.length).fill(false);
let pelanggaran = 0;

document.getElementById('examTitle').textContent = ujian.nama;
document.getElementById('examStudent').textContent = `Nama: ${siswa.nama} • Kelas: ${siswa.kelas}`;
document.getElementById('totalSoal').textContent = bankSoal.length;

// === Render Soal ===
function renderSoal() {
  const s = bankSoal[currentIndex];
  const opsiHTML = Object.entries(s.opsi || {}).map(([k, v]) => `
    <label class="opsi-item">
      <input type="radio" name="jawaban" value="${k}" ${jawaban[currentIndex]===k?'checked':''} />
      <b>${k}.</b> ${v}
    </label>
  `).join('');
  
  document.getElementById('questionArea').innerHTML = `
    <h3>Soal ${currentIndex+1}</h3>
    <p style="margin:12px 0">${s.teks}</p>
    <div class="opsi-list">${opsiHTML}</div>
  `;
  
  document.querySelectorAll('input[name="jawaban"]').forEach(r => {
    r.addEventListener('change', () => {
      jawaban[currentIndex] = r.value;
      updateNav();
    });
  });
  
  updateNav();
}

function updateNav() {
  const grid = document.getElementById('navGrid');
  grid.innerHTML = bankSoal.map((_, i) => {
    let cls = '';
    if (jawaban[i] !== null) cls = 'answered';
    if (ditandai[i]) cls = 'marked';
    if (i === currentIndex) cls += ' current';
    return `<button class="${cls}" onclick="goToSoal(${i})">${i+1}</button>`;
  }).join('');
  
  document.getElementById('answeredCount').textContent = jawaban.filter(j => j !== null).length;
}
window.goToSoal = i => { currentIndex = i; renderSoal(); };

// === Timer ===
let timeLeft = ujian.durasi * 60;
const timerEl = document.getElementById('timer');
const timerInterval = setInterval(() => {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  if (timeLeft <= 0) { clearInterval(timerInterval); kumpulkanUjian(); }
  timeLeft--;
}, 1000);

// === Anti-Curang ===
const ac = ujian.antiCurang;

// Fullscreen
if (ac.fullscreen) {
  document.getElementById('btnFullscreen').addEventListener('click', () => {
    document.documentElement.requestFullscreen();
    document.getElementById('fullscreenPrompt').classList.add('hidden');
    document.getElementById('examInterface').classList.remove('hidden');
    renderSoal();
  });
} else {
  document.getElementById('fullscreenPrompt').classList.add('hidden');
  document.getElementById('examInterface').classList.remove('hidden');
  renderSoal();
}

// Deteksi pindah tab
if (ac.deteksiTab) {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pelanggaran++;
      document.getElementById('pelanggaranCount').textContent = pelanggaran;
      document.getElementById('warningOverlay').classList.remove('hidden');
      if (pelanggaran >= 3) kumpulkanUjian();
    }
  });
}

document.getElementById('btnKembaliUjian').addEventListener('click', () => {
  document.getElementById('warningOverlay').classList.add('hidden');
});

// Nonaktifkan klik kanan
if (ac.noRightClick) {
  document.addEventListener('contextmenu', e => e.preventDefault());
}

// Nonaktifkan copy-paste
if (ac.noCopy) {
  document.addEventListener('copy', e => e.preventDefault());
  document.addEventListener('cut', e => e.preventDefault());
  document.addEventListener('paste', e => e.preventDefault());
}

// === Tombol Aksi ===
document.getElementById('btnTandai').addEventListener('click', () => {
  ditandai[currentIndex] = !ditandai[currentIndex];
  updateNav();
});

document.getElementById('btnKumpulkan').addEventListener('click', () => {
  if (confirm('Yakin ingin mengumpulkan ujian?')) kumpulkanUjian();
});

function kumpulkanUjian() {
  clearInterval(timerInterval);
  let benar = 0;
  const detail = bankSoal.map((s, i) => {
    const isCorrect = jawaban[i] === s.jawaban;
    if (isCorrect) benar++;
    return { no: i+1, jawabanSiswa: jawaban[i], kunci: s.jawaban, benar: isCorrect };
  });
  const nilai = Math.round((benar / bankSoal.length) * 100);
  
  DB.saveHasil({
    siswaUsername: siswa.username,
    siswa: siswa.nama,
    tokenUjian: ujian.token,
    namaUjian: ujian.nama,
    nilai, benar, total: bankSoal.length,
    waktu: new Date().toLocaleString('id-ID'),
    detail, pelanggaran
  });
  
  document.getElementById('resultDetail').innerHTML = `
    <p><b>Nilai:</b> ${nilai}</p>
    <p><b>Benar:</b> ${benar} / ${bankSoal.length}</p>
    <p><b>Pelanggaran:</b> ${pelanggaran}</p>
  `;
  document.getElementById('resultModal').classList.remove('hidden');
}

document.getElementById('btnTutupHasil').addEventListener('click', () => {
  sessionStorage.removeItem('currentUjian');
  window.location.href = 'siswa.html';
});

document.getElementById('btnCetak').addEventListener('click', () => window.print());

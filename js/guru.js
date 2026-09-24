const guru = requireAuth('guru');
if (!guru) throw new Error('Unauthorized');

document.getElementById('guruName').textContent = guru.nama;

// Populate mapel dropdown
const mapelSelect = document.getElementById('bsMapel');
mapelSelect.innerHTML = `<option value="${guru.mapel}">${guru.mapel}</option>`;

// === Input Soal ===
let soalBatch = [];
function renderSoalBatch() {
  const container = document.getElementById('soalContainer');
  container.innerHTML = soalBatch.map((s, i) => `
    <div class="soal-item" style="background:#f9fafb;padding:12px;border-radius:8px;margin-bottom:10px;">
      <b>Soal ${i+1}</b>
      <textarea rows="2" placeholder="Teks soal" onchange="soalBatch[${i}].teks=this.value">${s.teks||''}</textarea>
      <input type="text" placeholder="Opsi A" value="${s.opsi?.A||''}" onchange="soalBatch[${i}].opsi.A=this.value" />
      <input type="text" placeholder="Opsi B" value="${s.opsi?.B||''}" onchange="soalBatch[${i}].opsi.B=this.value" />
      <input type="text" placeholder="Opsi C" value="${s.opsi?.C||''}" onchange="soalBatch[${i}].opsi.C=this.value" />
      <input type="text" placeholder="Opsi D" value="${s.opsi?.D||''}" onchange="soalBatch[${i}].opsi.D=this.value" />
      <input type="text" placeholder="Jawaban Benar (A/B/C/D)" value="${s.jawaban||''}" onchange="soalBatch[${i}].jawaban=this.value" />
      <button type="button" class="btn-danger" onclick="soalBatch.splice(${i},1);renderSoalBatch()">Hapus</button>
    </div>
  `).join('');
}

document.getElementById('btnTambahSoal').addEventListener('click', () => {
  soalBatch.push({ teks: '', opsi: { A:'', B:'', C:'', D:'' }, jawaban: '' });
  renderSoalBatch();
});

document.getElementById('btnSimpanSemuaSoal').addEventListener('click', () => {
  const mapel = document.getElementById('bsMapel').value;
  if (!mapel) return alert('Pilih mata pelajaran!');
  soalBatch.forEach(s => {
    s.mapel = mapel;
    s.jenis = document.getElementById('bsJenis').value;
    s.poin = +document.getElementById('bsPoin').value;
    DB.saveSoal(mapel, s);
  });
  alert(`${soalBatch.length} soal disimpan ke bank ${mapel}`);
  soalBatch = [];
  renderSoalBatch();
  document.getElementById('modalSoal').classList.add('hidden');
});

// === Ujian Saya ===
function refreshUjianGuru() {
  const tbody = document.querySelector('#tabelUjianGuru tbody');
  const ujian = DB.getUjian().filter(u => u.createdBy === guru.username);
  document.getElementById('totalUjianGuru').textContent = ujian.length;
  tbody.innerHTML = ujian.map(u => `
    <tr><td>${u.nama}</td><td>${u.kelas}</td><td><b>${u.token}</b></td><td>Aktif</td></tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center">Belum ada ujian</td></tr>';
}
refreshUjianGuru();

// === Bank Soal count ===
document.getElementById('totalSoal').textContent = DB.getSoal(guru.mapel).length;

// === Hasil ===
function refreshHasil() {
  const tbody = document.querySelector('#tabelHasil tbody');
  const hasil = DB.getHasil().filter(h => {
    const ujian = DB.getUjian().find(u => u.token === h.tokenUjian);
    return ujian && ujian.createdBy === guru.username;
  });
  tbody.innerHTML = hasil.map(h => `
    <tr><td>${h.siswa}</td><td>${h.namaUjian}</td><td><b>${h.nilai}</b></td><td>${h.waktu}</td></tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center">Belum ada hasil</td></tr>';
}
refreshHasil();

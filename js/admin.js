const admin = requireAuth('admin');
if (!admin) throw new Error('Unauthorized');

// Render dashboard stats
function refreshStats() {
  document.getElementById('totalGuru').textContent = DB.getUsers('guru').length;
  document.getElementById('totalSiswa').textContent = DB.getUsers('siswa').length;
  document.getElementById('totalUjian').textContent = DB.getUjian().length;
}
refreshStats();

// === Tambah Guru ===
document.getElementById('formGuru').addEventListener('submit', e => {
  e.preventDefault();
  const nama = document.getElementById('gNama').value.trim();
  const nip = document.getElementById('gNip').value.trim();
  const mapel = document.getElementById('gMapel').value.trim();
  DB.saveUser('guru', { nama, username: nip, password: nip, mapel });
  alert('Guru ditambahkan. Password awal = NIP.');
  e.target.reset();
  document.getElementById('modalGuru').classList.add('hidden');
  refreshGuru();
  refreshStats();
});

function refreshGuru() {
  const tbody = document.querySelector('#tabelGuru tbody');
  tbody.innerHTML = DB.getUsers('guru').map(g => `
    <tr><td>${g.nama}</td><td>${g.username}</td><td>${g.mapel}</td>
    <td><button class="btn-danger" onclick="hapusGuru('${g.username}')">Hapus</button></td></tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center">Belum ada data</td></tr>';
}
window.hapusGuru = username => {
  if (!confirm('Hapus guru ini?')) return;
  DB.set('users_guru', DB.getUsers('guru').filter(g => g.username !== username));
  refreshGuru(); refreshStats();
};
refreshGuru();

// === Tambah Siswa ===
document.getElementById('formSiswa').addEventListener('submit', e => {
  e.preventDefault();
  const nama = document.getElementById('sNama').value.trim();
  const nisn = document.getElementById('sNisn').value.trim();
  const kelas = document.getElementById('sKelas').value.trim();
  DB.saveUser('siswa', { nama, username: nisn, password: nisn, kelas });
  alert('Siswa ditambahkan. Username & password = NISN.');
  e.target.reset();
  document.getElementById('modalSiswa').classList.add('hidden');
  refreshSiswa();
  refreshStats();
});

function refreshSiswa() {
  const tbody = document.querySelector('#tabelSiswa tbody');
  tbody.innerHTML = DB.getUsers('siswa').map(s => `
    <tr><td>${s.nama}</td><td>${s.username}</td><td>${s.kelas}</td>
    <td><button class="btn-danger" onclick="hapusSiswa('${s.username}')">Hapus</button></td></tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center">Belum ada data</td></tr>';
}
window.hapusSiswa = username => {
  if (!confirm('Hapus siswa ini?')) return;
  DB.set('users_siswa', DB.getUsers('siswa').filter(s => s.username !== username));
  refreshSiswa(); refreshStats();
};
refreshSiswa();

// === Buat Ujian ===
document.getElementById('btnGenToken').addEventListener('click', () => {
  const token = Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById('uToken').value = token;
});

document.getElementById('formUjian').addEventListener('submit', e => {
  e.preventDefault();
  const ujian = {
    nama: document.getElementById('uNama').value,
    mapel: document.getElementById('uMapel').value,
    kelas: document.getElementById('uKelas').value,
    durasi: +document.getElementById('uDurai').value,
    mulai: document.getElementById('uMulai').value,
    selesai: document.getElementById('uSelesai').value,
    jumlahSoal: +document.getElementById('uJumlahSoal').value,
    token: document.getElementById('uToken').value,
    antiCurang: {
      acakSoal: document.getElementById('acAcakSoal').checked,
      acakOpsi: document.getElementById('acAcakOpsi').checked,
      fullscreen: document.getElementById('acFullscreen').checked,
      noCopy: document.getElementById('acNoCopy').checked,
      deteksiTab: document.getElementById('acDeteksiTab').checked,
      noRightClick: document.getElementById('acNoRightClick').checked,
      oneSession: document.getElementById('acOneSession').checked,
      kamera: document.getElementById('acKamera').checked,
    },
    createdBy: admin.username
  };
  DB.saveUjian(ujian);
  alert('Ujian diterbitkan! Token: ' + ujian.token);
  e.target.reset();
  document.getElementById('modalUjian').classList.add('hidden');
  refreshUjian();
  refreshStats();
});

function refreshUjian() {
  const tbody = document.querySelector('#tabelUjian tbody');
  tbody.innerHTML = DB.getUjian().map(u => `
    <tr><td>${u.nama}</td><td>${u.mapel}</td><td>${u.kelas}</td>
    <td>${u.durasi} mnt</td><td><b>${u.token}</b></td>
    <td><button class="btn-danger" onclick="hapusUjian('${u.token}')">Hapus</button></td></tr>
  `).join('') || '<tr><td colspan="6" style="text-align:center">Belum ada ujian</td></tr>';
}
window.hapusUjian = token => {
  if (!confirm('Hapus ujian ini?')) return;
  DB.set('ujian', DB.getUjian().filter(u => u.token !== token));
  refreshUjian(); refreshStats();
};
refreshUjian();

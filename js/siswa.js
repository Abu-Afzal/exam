const siswa = requireAuth('siswa');
if (!siswa) throw new Error('Unauthorized');

document.getElementById('siswaName').textContent = siswa.nama;

// === Token Ujian ===
document.getElementById('formToken').addEventListener('submit', e => {
  e.preventDefault();
  const token = document.getElementById('inputToken').value.trim().toUpperCase();
  const ujian = DB.findUjianByToken(token);
  
  if (!ujian) return alert('Token tidak valid!');
  if (ujian.kelas !== siswa.kelas) return alert('Ujian ini bukan untuk kelas Anda!');
  
  const now = new Date();
  const mulai = new Date(ujian.mulai);
  const selesai = new Date(ujian.selesai);
  if (now < mulai) return alert('Ujian belum dimulai!');
  if (now > selesai) return alert('Ujian sudah berakhir!');
  
  // Simpan sesi ujian & redirect
  sessionStorage.setItem('currentUjian', JSON.stringify(ujian));
  window.location.href = 'ujian.html';
});

// === Riwayat Nilai ===
function refreshNilai() {
  const tbody = document.querySelector('#tabelNilai tbody');
  const hasil = DB.getHasil().filter(h => h.siswaUsername === siswa.username);
  tbody.innerHTML = hasil.map(h => `
    <tr><td>${h.namaUjian}</td><td><b>${h.nilai}</b></td><td>${h.waktu}</td>
    <td><button class="btn-secondary" onclick='alert(${JSON.stringify(h.detail)})</button></td></tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center">Belum ada riwayat</td></tr>';
}
refreshNilai();

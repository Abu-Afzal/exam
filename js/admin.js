// ============================================
// ADMIN DASHBOARD - SUPABASE VERSION (FINAL)
// ============================================

const currentUser = requireAuth('admin');
if (!currentUser) {
  console.log('Redirect ke login...');
} else {
  console.log('✅ Admin logged in:', currentUser.profile.nama);
  initAdminDashboard();
}

async function initAdminDashboard() {
  await refreshStats();
  await refreshGuru();
  await refreshSiswa();
  await refreshUjian();
}

// ============================================
// DASHBOARD STATS
// ============================================
async function refreshStats() {
  try {
    const guru = await DB.getUsers('guru');
    const siswa = await DB.getUsers('siswa');
    const ujian = await DB.getUjian();
    
    document.getElementById('totalGuru').textContent = guru ? guru.length : 0;
    document.getElementById('totalSiswa').textContent = siswa ? siswa.length : 0;
    document.getElementById('totalUjian').textContent = ujian ? ujian.length : 0;
  } catch (error) {
    console.error('Error refresh stats:', error);
  }
}

// ============================================
// DATA GURU
// ============================================
async function refreshGuru() {
  try {
    const guruList = await DB.getUsers('guru');
    const tbody = document.querySelector('#tabelGuru tbody');
    
    if (!guruList || guruList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Belum ada data guru</td></tr>';
      return;
    }
    
    tbody.innerHTML = guruList.map(g => `
      <tr>
        <td>${g.nama}</td>
        <td>${g.nip_nisn}</td>
        <td>${g.mapel || '-'}</td>
        <td>
          <button class="btn-danger" onclick="hapusGuru('${g.id}', '${g.nama}')">Hapus</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error refresh guru:', error);
  }
}

// Form Tambah Guru
const formGuru = document.getElementById('formGuru');
if (formGuru) {
  formGuru.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nama = document.getElementById('gNama').value.trim();
    const nip = document.getElementById('gNip').value.trim();
    const mapel = document.getElementById('gMapel').value.trim();
    
    if (!nama || !nip || !mapel) {
      alert('Semua field harus diisi!');
      return;
    }
    
    const email = `${nip.toLowerCase()}@examshield.id`;
    const password = nip; // Password default = NIP
    
    try {
      // Panggil function via RPC
      const { data, error } = await supabaseClient.rpc('create_user_and_profile', {
        p_email: email,
        p_password: password,
        p_role: 'guru',
        p_nama: nama,
        p_nip_nisn: nip,
        p_mapel: mapel
      });
      
      if (error) throw error;
      
      alert(`✅ Guru berhasil ditambahkan!\n\n Email: ${email}\n Password: ${nip}\n\nSimpan password ini untuk diberikan kepada guru.`);
      
      formGuru.reset();
      document.getElementById('modalGuru').classList.add('hidden');
      await refreshGuru();
      await refreshStats();
      
    } catch (error) {
      console.error('Error tambah guru:', error);
      alert('❌ Gagal menambah guru: ' + error.message);
    }
  });
}

window.hapusGuru = async (id, nama) => {
  if (!confirm(`Hapus guru "${nama}"?`)) return;
  try {
    const { data, error } = await supabaseClient.rpc('delete_user_and_profile', {
      p_user_id: id
    });
    
    if (error) throw error;
    
    alert('✅ Guru dihapus');
    await refreshGuru();
    await refreshStats();
  } catch (error) {
    console.error('Error hapus guru:', error);
    alert('❌ Gagal hapus: ' + error.message);
  }
};

// ============================================
// DATA SISWA
// ============================================
async function refreshSiswa() {
  try {
    const siswaList = await DB.getUsers('siswa');
    const tbody = document.querySelector('#tabelSiswa tbody');
    
    if (!siswaList || siswaList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Belum ada data siswa</td></tr>';
      return;
    }
    
    tbody.innerHTML = siswaList.map(s => `
      <tr>
        <td>${s.nama}</td>
        <td>${s.nip_nisn}</td>
        <td>${s.kelas || '-'}</td>
        <td>
          <button class="btn-danger" onclick="hapusSiswa('${s.id}', '${s.nama}')">Hapus</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error refresh siswa:', error);
  }
}

const formSiswa = document.getElementById('formSiswa');
if (formSiswa) {
  formSiswa.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nama = document.getElementById('sNama').value.trim();
    const nisn = document.getElementById('sNisn').value.trim();
    const kelas = document.getElementById('sKelas').value.trim();
    
    if (!nama || !nisn || !kelas) {
      alert('Semua field harus diisi!');
      return;
    }
    
    const email = `${nisn.toLowerCase()}@examshield.id`;
    const password = nisn;
    
    try {
      const { data, error } = await supabaseClient.rpc('create_user_and_profile', {
        p_email: email,
        p_password: password,
        p_role: 'siswa',
        p_nama: nama,
        p_nip_nisn: nisn,
        p_kelas: kelas
      });
      
      if (error) throw error;
      
      alert(`✅ Siswa berhasil ditambahkan!\n\n📧 Email: ${email}\n🔑 Password: ${nisn}\n\nSimpan password ini untuk diberikan kepada siswa.`);
      
      formSiswa.reset();
      document.getElementById('modalSiswa').classList.add('hidden');
      await refreshSiswa();
      await refreshStats();
      
    } catch (error) {
      console.error('Error tambah siswa:', error);
      alert('❌ Gagal menambah siswa: ' + error.message);
    }
  });
}

window.hapusSiswa = async (id, nama) => {
  if (!confirm(`Hapus siswa "${nama}"?`)) return;
  try {
    const { data, error } = await supabaseClient.rpc('delete_user_and_profile', {
      p_user_id: id
    });
    
    if (error) throw error;
    
    alert('✅ Siswa dihapus');
    await refreshSiswa();
    await refreshStats();
  } catch (error) {
    console.error('Error hapus siswa:', error);
    alert('❌ Gagal hapus: ' + error.message);
  }
};

// ============================================
// DATA UJIAN
// ============================================
async function refreshUjian() {
  try {
    const ujianList = await DB.getUjian();
    const tbody = document.querySelector('#tabelUjian tbody');
    
    if (!ujianList || ujianList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Belum ada ujian</td></tr>';
      return;
    }
    
    tbody.innerHTML = ujianList.map(u => `
      <tr>
        <td>${u.nama}</td>
        <td>${u.mapel}</td>
        <td>${u.kelas}</td>
        <td>${u.durasi} mnt</td>
        <td><b>${u.token}</b></td>
        <td>
          <button class="btn-danger" onclick="hapusUjian('${u.id}')">Hapus</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error refresh ujian:', error);
  }
}

const btnGenToken = document.getElementById('btnGenToken');
if (btnGenToken) {
  btnGenToken.addEventListener('click', () => {
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById('uToken').value = token;
  });
}

const formUjian = document.getElementById('formUjian');
if (formUjian) {
  formUjian.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = document.getElementById('uToken').value.trim();
    if (!token) {
      alert('Generate token terlebih dahulu!');
      return;
    }
    
    const ujian = {
      guru_id: currentUser.profile.id,
      nama: document.getElementById('uNama').value.trim(),
      mapel: document.getElementById('uMapel').value.trim(),
      kelas: document.getElementById('uKelas').value.trim(),
      durasi: parseInt(document.getElementById('uDurai').value),
      waktu_mulai: document.getElementById('uMulai').value,
      waktu_selesai: document.getElementById('uSelesai').value,
      jumlah_soal: parseInt(document.getElementById('uJumlahSoal').value),
      token: token.toUpperCase(),
      anti_curang: {
        acakSoal: document.getElementById('acAcakSoal').checked,
        acakOpsi: document.getElementById('acAcakOpsi').checked,
        fullscreen: document.getElementById('acFullscreen').checked,
        noCopy: document.getElementById('acNoCopy').checked,
        deteksiTab: document.getElementById('acDeteksiTab').checked,
        noRightClick: document.getElementById('acNoRightClick').checked,
        oneSession: document.getElementById('acOneSession').checked,
        kamera: document.getElementById('acKamera').checked,
      },
      status: 'aktif'
    };
    
    try {
      await DB.saveUjian(ujian);
      alert(`✅ Ujian diterbitkan!\n\n Token: ${token}\n\nBagikan token ini kepada siswa.`);
      
      formUjian.reset();
      document.getElementById('modalUjian').classList.add('hidden');
      await refreshUjian();
      await refreshStats();
      
    } catch (error) {
      console.error('Error buat ujian:', error);
      alert('❌ Gagal membuat ujian: ' + error.message);
    }
  });
}

window.hapusUjian = async (id) => {
  if (!confirm('Hapus ujian ini?')) return;
  try {
    const { error } = await supabaseClient.from('ujian').delete().eq('id', id);
    if (error) throw error;
    alert('✅ Ujian dihapus');
    await refreshUjian();
    await refreshStats();
  } catch (error) {
    alert('❌ Gagal hapus: ' + error.message);
  }
};
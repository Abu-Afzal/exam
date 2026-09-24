// ============================================
// LOGIKA LOGIN & AUTENTIKASI
// ============================================

if (document.getElementById('loginForm')) {
  let currentRole = 'admin'; // Default role yang dipilih di tab

  // Logic Tab Role
  document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentRole = tab.dataset.role;
    });
  });

  // Logic Submit Login
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Karena kita pakai email di Supabase, input username sekarang dianggap email
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const err = document.getElementById('loginError');
    
    err.classList.add('hidden');
    err.textContent = '❌ Sedang memproses...';
    err.classList.remove('hidden');

    try {
      // 1. Login ke Supabase Auth
      const { user } = await Auth.signIn(email, password);
      
      // 2. Ambil Profile untuk cek Role
      const currentUser = await Auth.getCurrentUser();
      
      if (!currentUser || !currentUser.profile) {
        throw new Error('Profile tidak ditemukan');
      }

      // 3. Validasi Role
      if (currentUser.profile.role !== currentRole) {
        await Auth.signOut();
        err.textContent = ` Akun ini terdaftar sebagai ${currentUser.profile.role}, bukan ${currentRole}.`;
        return;
      }

      // 4. Simpan Session & Redirect
      sessionStorage.setItem('user', JSON.stringify(currentUser));
      window.location.href = `${currentRole}.html`;

    } catch (error) {
      console.error(error);
      err.textContent = '❌ Email atau password salah, atau akun belum dikonfirmasi.';
    }
  });

  // Toggle Password
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
}

// ============================================
// LOGIKA LOGOUT (Untuk semua halaman dashboard)
// ============================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Yakin ingin keluar?')) {
      await Auth.signOut();
      sessionStorage.removeItem('user');
      window.location.href = 'index.html';
    }
  });
}

// ============================================
// NAVIGASI SIDEBAR & MODAL (Tetap sama)
// ============================================
document.querySelectorAll('.sidebar-menu a[data-section]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    const target = link.dataset.section;
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`sec-${target}`).classList.remove('hidden');
  });
});

document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.modal).classList.remove('hidden');
  });
});
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').classList.add('hidden');
  });
});

// ============================================
// AUTH GUARD (Cek login di setiap halaman)
// ============================================
function requireAuth(role) {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) {
    window.location.href = 'index.html';
    return null;
  }
  const user = JSON.parse(userStr);
  if (user.profile.role !== role) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

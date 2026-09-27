// ============================================
// LOGIKA LOGIN & AUTENTIKASI
// ============================================

if (document.getElementById('loginForm')) {
  let currentRole = 'admin';

  document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentRole = tab.dataset.role;
    });
  });

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const err = document.getElementById('loginError');
    
    err.classList.add('hidden');

    try {
      console.log('🔄 Login attempt for:', email);
      
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Email atau password salah');
      }
      
      if (!authData.user) {
        throw new Error('User tidak ditemukan');
      }
      
      console.log('✅ Auth berhasil, user ID:', authData.user.id);
      
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('Profile tidak ditemukan di database');
      }
      
      if (!profile) {
        throw new Error('Profile tidak ditemukan');
      }
      
      console.log('✅ Profile ditemukan:', profile);
      
      if (profile.role !== currentRole) {
        await supabaseClient.auth.signOut();
        err.textContent = `⚠️ Akun ini terdaftar sebagai ${profile.role.toUpperCase()}, bukan ${currentRole}.`;
        err.classList.remove('hidden');
        return;
      }

      const userData = {
        id: authData.user.id,
        email: authData.user.email,
        profile: profile
      };
      
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      // ✅ PERBAIKAN PATH: redirect ke folder examshield/
      console.log('📝 Session disimpan, redirect ke examshield/' + currentRole + '.html');
      window.location.href = `examshied/${currentRole}.html`;

    } catch (error) {
      console.error('❌ Login error:', error);
      err.textContent = '❌ ' + error.message;
      err.classList.remove('hidden');
    }
  });

  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
}

// ============================================
// LOGOUT
// ============================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Yakin ingin keluar?')) {
      await supabaseClient.auth.signOut();
      sessionStorage.removeItem('user');
      window.location.href = '../index.html'; // ✅ Kembali ke root
    }
  });
}

// ============================================
// NAVIGASI SIDEBAR & MODAL
// ============================================
document.querySelectorAll('.sidebar-menu a[data-section]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    const target = link.dataset.section;
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    const targetEl = document.getElementById(`sec-${target}`);
    if (targetEl) targetEl.classList.remove('hidden');
  });
});

document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modalId = btn.dataset.modal;
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  });
});

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    if (modal) modal.classList.add('hidden');
  });
});

// ============================================
// AUTH GUARD
// ============================================
function requireAuth(role) {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) {
    console.log('⚠️ Tidak ada session, redirect ke login');
    window.location.href = '../index.html';
    return null;
  }
  
  try {
    const user = JSON.parse(userStr);
    if (!user.profile || user.profile.role !== role) {
      console.log('⚠️ Role tidak cocok, redirect ke login');
      window.location.href = '../index.html';
      return null;
    }
    console.log('✅ Auth guard passed untuk', role);
    return user;
  } catch (error) {
    console.error('Error parse session:', error);
    window.location.href = '../index.html';
    return null;
  }
}
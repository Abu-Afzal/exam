// ============================================
// KONFIGURASI SUPABASE
// ============================================
const SUPABASE_URL = 'https://rsynofcalfxnomuancec.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeW5vZmNhbGZ4bm9tdWFuY2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNTUyNjgsImV4cCI6MjEwNTgzMTI2OH0.A4us-2_E_GOpCiWtcDbOWCZc9pawv-Nww0k214TaXJM';

// ⚠️ PENTING: Gunakan nama "supabaseClient" (bukan "supabase") 
// agar tidak bentrok dengan SDK global
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// HELPER: AUTHENTICATION
// ============================================
const Auth = {
  async signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await supabaseClient.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) return null;
    return { ...user, profile };
  }
};

// ============================================
// HELPER: DATABASE
// ============================================
const DB = {
  async getUjian() {
    const { data, error } = await supabaseClient.from('ujian').select('*');
    if (error) throw error;
    return data;
  },

  async findUjianByToken(token) {
    const { data, error } = await supabaseClient
      .from('ujian')
      .select('*')
      .eq('token', token.toUpperCase())
      .single();
    if (error) return null;
    return data;
  },

  async saveUjian(ujian) {
    const { data, error } = await supabaseClient.from('ujian').insert(ujian).select().single();
    if (error) throw error;
    return data;
  },

  async getSoal(mapel) {
    const { data, error } = await supabaseClient.from('bank_soal').select('*').eq('mapel', mapel);
    if (error) throw error;
    return data;
  },

  async saveSoal(soal) {
    const { data, error } = await supabaseClient.from('bank_soal').insert(soal).select().single();
    if (error) throw error;
    return data;
  },

  async getHasil() {
    const { data, error } = await supabaseClient.from('hasil').select('*');
    if (error) throw error;
    return data;
  },

  async saveHasil(hasil) {
    const { data, error } = await supabaseClient.from('hasil').insert(hasil).select().single();
    if (error) throw error;
    return data;
  },

  async getUsers(role) {
    const { data, error } = await supabaseClient.from('profiles').select('*').eq('role', role);
    if (error) throw error;
    return data;
  }
};
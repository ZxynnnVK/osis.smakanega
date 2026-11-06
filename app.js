// 1. Buat project di https://supabase.com
// 2. Ganti dua nilai di bawah dengan Project URL dan anon/publishable key dari Supabase.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'GANTI_DENGAN_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'GANTI_DENGAN_SUPABASE_ANON_KEY';
const configured = !SUPABASE_URL.startsWith('GANTI_') && !SUPABASE_ANON_KEY.startsWith('GANTI_');
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const board = document.querySelector('#board');
const dialog = document.querySelector('#formDialog');
const form = document.querySelector('#aspirationForm');
let currentFilter = 'semua';
let aspirations = [];

document.querySelector('#openForm').addEventListener('click', () => dialog.showModal());
document.querySelector('#closeForm').addEventListener('click', () => dialog.close());
document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
  currentFilter = btn.dataset.filter;
  document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === btn));
  render();
}));

function dateLabel(value) {
  return new Intl.DateTimeFormat('id-ID', {day:'numeric', month:'short', year:'numeric'}).format(new Date(value));
}
function render() {
  const visible = aspirations.filter(a => currentFilter === 'semua' || a.kind === currentFilter);
  document.querySelector('#count').textContent = aspirations.length;
  board.replaceChildren();
  if (!visible.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'Belum ada aspirasi di kategori ini. Jadilah yang pertama! 📌';
    board.append(empty); return;
  }
  visible.forEach((a, i) => {
    const note = document.createElement('article');
    note.className = 'note';
    note.style.setProperty('--tilt', `${((i % 5) - 2) * 1.1}deg`);
    const type = document.createElement('div'); type.className = 'note-type'; type.textContent = a.kind;
    const message = document.createElement('p'); message.textContent = a.message;
    const meta = document.createElement('div'); meta.className = 'note-meta';
    const author = document.createElement('span'); author.textContent = a.name?.trim() || 'Anonim';
    const date = document.createElement('span'); date.textContent = dateLabel(a.created_at);
    meta.append(author, date); note.append(type, message, meta); board.append(note);
  });
}
async function loadAspirations() {
  if (!configured) {
    board.innerHTML = '<div class="empty">Hubungkan Supabase terlebih dahulu. Ikuti petunjuk di README.md 📌</div>';
    document.querySelector('#formHint').textContent = 'Website belum terhubung ke database.';
    return;
  }
  const { data, error } = await supabase.from('aspirations').select('id,kind,name,message,created_at').eq('status','pending').order('created_at',{ascending:false});
  if (error) { board.textContent = 'Gagal memuat aspirasi. Periksa konfigurasi database.'; console.error(error); return; }
  aspirations = data || []; render();
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!configured) { alert('Website belum terhubung ke Supabase. Ikuti README.md.'); return; }
  const submit = form.querySelector('button[type=submit]');
  submit.disabled = true; submit.textContent = 'Mengirim...';
  const kind = new FormData(form).get('kind');
  const name = document.querySelector('#studentName').value.trim() || null;
  const message = document.querySelector('#message').value.trim();
  const { error } = await supabase.from('aspirations').insert({kind,name,message});
  submit.disabled = false; submit.textContent = 'Tempel di Mading';
  if (error) { alert('Pesan belum berhasil dikirim. Coba lagi.'); console.error(error); return; }
  form.reset(); dialog.close();
});
if (configured) {
  supabase.channel('aspiration-board')
    .on('postgres_changes',{event:'*',schema:'public',table:'aspirations'},loadAspirations)
    .subscribe();
}
loadAspirations();

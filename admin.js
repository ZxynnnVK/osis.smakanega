import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const URL='GANTI_DENGAN_SUPABASE_PROJECT_URL', KEY='GANTI_DENGAN_SUPABASE_ANON_KEY';
const loginBox=document.querySelector('#loginBox'), panel=document.querySelector('#panel'), root=document.querySelector('#adminList'), loginMessage=document.querySelector('#loginMessage');
if(URL.startsWith('GANTI_')||KEY.startsWith('GANTI_')) loginMessage.textContent='Atur URL dan key Supabase di admin.js terlebih dahulu.';
else {
 const db=createClient(URL,KEY);
 async function load(){
  const {data,error}=await db.from('aspirations').select('*').eq('status','pending').order('created_at',{ascending:true});
  root.replaceChildren();
  if(error){root.textContent='Tidak dapat memuat data. Pastikan akun ini terdaftar sebagai pengurus.';return;}
  if(!data.length){root.textContent='Semua aspirasi sudah ditanggapi.';return;}
  data.forEach(a=>{
   const card=document.createElement('article');card.className='admin-card';
   const title=document.createElement('b');title.textContent=`${a.kind} • ${a.name||'Anonim'}`;
   const msg=document.createElement('p');msg.textContent=a.message;
   const date=document.createElement('small');date.textContent=new Date(a.created_at).toLocaleString('id-ID');
   const btn=document.createElement('button');btn.className='primary';btn.textContent='Tandai sudah ditanggapi';
   btn.onclick=async()=>{btn.disabled=true;const {error}=await db.from('aspirations').update({status:'responded'}).eq('id',a.id);if(error){alert('Gagal memperbarui status. Pastikan akun ini terdaftar sebagai pengurus.');btn.disabled=false;}else load();};
   card.append(title,msg,date,btn);root.append(card);
  });
 }
 async function showSession(session){
  const {data,error}=await db.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(error||!data){loginBox.hidden=false;panel.hidden=true;loginMessage.textContent='Akun ini belum diberi akses pengurus.';return;}
  loginBox.hidden=true;panel.hidden=false;load();
 }
 document.querySelector('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();loginMessage.textContent='Memeriksa akun...';
  const {data,error}=await db.auth.signInWithPassword({email:document.querySelector('#email').value,password:document.querySelector('#password').value});
  if(error){loginMessage.textContent='Login gagal. Periksa email dan password.';return;}
  await showSession(data.session);
 });
 document.querySelector('#logout').onclick=async()=>{await db.auth.signOut();panel.hidden=true;loginBox.hidden=false;};
 db.auth.getSession().then(({data})=>{if(data.session)showSession(data.session);});
 db.auth.onAuthStateChange((_event,session)=>{if(!session){panel.hidden=true;loginBox.hidden=false;}});
 db.channel('admin-aspirations').on('postgres_changes',{event:'*',schema:'public',table:'aspirations'},load).subscribe();
}

(async function () {
  'use strict';
  const {client,config,el,goodId,url,listingUrl,show}=window.PC_WEB;
  el('back').href=goodId?listingUrl():'ilanlar.html';
  const phoneNext=(new URLSearchParams(location.search)).get('next')==='telefon';
  const page=()=>goodId?(phoneNext?listingUrl():url('mesaj.html')):'ilanlar.html';
  const loginCallback=()=>url('giris.html')+(goodId&&phoneNext?'&next=telefon':'');
  const validLegal=()=>config && config.signupEnabled===true
    && /^\d+\.\d+\.\d+$/.test(config.legalVersion||'')
    && /^[0-9a-f]{64}$/.test(config.legalSha256||'');
  const spaces={login:el('login-area'),register:el('register-area'),complete:el('complete-area'),reset:el('reset-area')};
  function view(name){for(const [key,section] of Object.entries(spaces))section.hidden=key!==name;el('tab-login').setAttribute('aria-selected',name==='login'?'true':'false');el('tab-register').setAttribute('aria-selected',name==='register'?'true':'false');}
  function errText(error){return String(error?.message||'İşlem gerçekleştirilemedi.').slice(0,240);}
  const phone=(value)=>{let v=String(value||'').replace(/[^0-9]/g,'');if(v.startsWith('90')&&v.length===12)v=v.slice(2);if(v.startsWith('0')&&v.length===11)v=v.slice(1);return /^5[0-9]{9}$/.test(v)?'+90'+v:null;};
  const nameOk=value=>String(value||'').trim().length>=2;
  const emailOk=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value||'');
  async function haveLegal(user){const {data,error}=await client.from('pc_legal_acceptances').select('id').eq('user_id',user.id).eq('document_key','membership').limit(1);if(error)throw error;return Array.isArray(data)&&data.length>0;}
  async function proceed(user){
    if(await haveLegal(user)){location.replace(page());return;}
    view('complete');const data=user.user_metadata||{};
    el('complete-name').value=String(data.full_name||data.name||'');
    el('complete-phone').value=String(data.phone||'');
    show('Giriş yapıldı. Mesajlaşmaya devam etmeden önce üyeliğini tamamla.');
  }
  async function doComplete(name,normalizedPhone){
    if(!validLegal())throw new Error('Üyelik sözleşmesi sürümü ve imzası henüz yapılandırılmadı. Kayıt şu an açılamıyor.');
    const {data:{user},error:authErr}=await client.auth.getUser();if(authErr||!user)throw new Error('Oturumun süresi doldu. Tekrar giriş yap.');
    const old=user.user_metadata||{};
    const {error:updateErr}=await client.auth.updateUser({data:{...old,full_name:name,name,phone:normalizedPhone}});if(updateErr)throw updateErr;
    const {data:profile,error:readErr}=await client.from('profiles').select('id').eq('id',user.id).maybeSingle();
    if(readErr)throw new Error('Profil kontrolü başarısız: '+readErr.message);
    if(!profile)throw new Error('Profil kaydı oluşturulamamış. Sunucudaki profil oluşturma tetikleyicisini kontrol edin.');
    const {error:writeErr}=await client.from('profiles').update({display_name:name}).eq('id',user.id);if(writeErr)throw writeErr;
    const {error:legalErr}=await client.from('pc_legal_acceptances').upsert({
      user_id:user.id, document_key:'membership',document_version:config.legalVersion,document_sha256:config.legalSha256
    },{onConflict:'user_id,document_key,document_version,document_sha256',ignoreDuplicates:true});
    if(legalErr)throw new Error('Sözleşme kaydı tamamlanamadı: '+legalErr.message);
    location.replace(page());
  }
  async function withGoogle(){
    if(!client)return;
    const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:loginCallback()}});
    if(error)show('Google ile giriş başlatılamadı: '+errText(error),true);
  }
  if(!client){show('Supabase web giriş anahtarı bulunamadı. Yönetici public anahtarı tanımlamalıdır.',true);return;}
  el('tab-login').addEventListener('click',()=>view('login'));
  el('tab-register').addEventListener('click',()=>{view('register');if(!validLegal())show('Üyelik sözleşmesi yapılandırılmadan yeni kayıt başlatılamaz. Sözleşme ayarını tamamlayın.',true);});
  el('google').addEventListener('click',()=>withGoogle().catch(e=>show(errText(e),true)));
  el('register-google').addEventListener('click',()=>withGoogle().catch(e=>show(errText(e),true)));
  el('login-form').addEventListener('submit',async e=>{
    e.preventDefault();const submit=e.submitter;submit.disabled=true;
    try{
      const email=el('login-email').value.trim().toLowerCase(),password=el('login-password').value;
      if(!emailOk(email))throw new Error('Geçerli e-posta adresi giriniz.');
      const {data,error}=await client.auth.signInWithPassword({email,password});
      if(error)throw error;if(!data.user)throw new Error('Oturum açılamadı.');
      await proceed(data.user);
    }catch(error){show('Giriş yapılamadı: '+errText(error),true)}finally{submit.disabled=false;}
  });
  el('register-form').addEventListener('submit',async e=>{
    e.preventDefault();const submit=e.submitter;submit.disabled=true;
    try{
      if(!validLegal())throw new Error('Üyelik sözleşmesi sürümü ve SHA256 henüz yapılandırılmamış.');
      if(!el('register-terms').checked)throw new Error('Üyelik sözleşmesini onaylamalısın.');
      const fullName=el('register-name').value.trim(),normalizedPhone=phone(el('register-phone').value);
      const email=el('register-email').value.trim().toLowerCase(),password=el('register-password').value;
      if(!nameOk(fullName))throw new Error('Ad Soyad en az 2 karakter olmalı.');
      if(!normalizedPhone)throw new Error('Geçerli Türkiye cep telefonu numarası gir.');
      if(!emailOk(email)||password.length<8)throw new Error('E-posta ve şifreyi kontrol et (şifre en az 8 karakter).');
      const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:loginCallback(),data:{full_name:fullName,name:fullName,phone:normalizedPhone}}});
      if(error)throw error;
      if(data.session&&data.user){await doComplete(fullName,normalizedPhone);return;}
      show('Üyelik isteği alındı. E-posta adresine gelen doğrulama bağlantısını aç; sonra üyeliğini tamamlayabilirsin.');
      view('login');
    }catch(error){show('Üye olma işlemi tamamlanamadı: '+errText(error),true)}finally{submit.disabled=false;}
  });
  el('complete-form').addEventListener('submit',async e=>{
    e.preventDefault();const submit=e.submitter;submit.disabled=true;
    try{
      if(!el('complete-terms').checked)throw new Error('Üyelik sözleşmesini onaylamalısın.');
      const fullName=el('complete-name').value.trim(),normalizedPhone=phone(el('complete-phone').value);
      if(!nameOk(fullName)||!normalizedPhone)throw new Error('Ad Soyad veya cep telefonu bilgisi geçerli değil.');
      await doComplete(fullName,normalizedPhone);
    }catch(error){show('Üyelik tamamlanamadı: '+errText(error),true)}finally{submit.disabled=false;}
  });
  el('complete-signout').addEventListener('click',async()=>{await client.auth.signOut();view('login');show('Çıkış yapıldı. Başka hesapla giriş yapabilirsin.');});
  el('forgot').addEventListener('click',async()=>{
    const email=el('login-email').value.trim().toLowerCase();
    if(!emailOk(email)){show('Önce e-posta adresini gir.',true);return;}
    try{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:loginCallback()});if(error)throw error;show('Şifre sıfırlama bağlantısı e-posta adresine gönderildiyse gelen kutunda görünecektir.');}
    catch(error){show('Şifre sıfırlama isteği gönderilemedi: '+errText(error),true);}
  });
  client.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')view('reset');});
  el('reset-form').addEventListener('submit',async e=>{
    e.preventDefault();const submit=e.submitter;submit.disabled=true;
    try{const pass=el('new-password').value;if(pass.length<8)throw new Error('En az 8 karakter olmalı.');const {error}=await client.auth.updateUser({password:pass});if(error)throw error;show('Şifren güncellendi.');await client.auth.signOut();view('login');}
    catch(error){show('Şifre güncellenemedi: '+errText(error),true)}finally{submit.disabled=false;}
  });
  try{const {data:{user},error}=await client.auth.getUser();if(!error&&user&&!(new URLSearchParams(location.search)).has('error'))await proceed(user);}
  catch(error){show('Oturum kontrolünde sorun oluştu: '+errText(error),true);}
}());

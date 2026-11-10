(async function () {
  'use strict';
  const {client,config,el,goodId,url,listingUrl,show}=window.PC_WEB;
  el('back').href=listingUrl();
  const login=el('tab-login'),reg=el('tab-register');
  const switchTab=(register)=>{
    login.setAttribute('aria-selected',register?'false':'true');
    reg.setAttribute('aria-selected',register?'true':'false');
    el('login-area').hidden=register; el('register-area').hidden=!register;
  };
  login.addEventListener('click',()=>switchTab(false));
  reg.addEventListener('click',()=>switchTab(true));
  if (!goodId){show('Gecerli bir ilan baglantisindan gelmelisiniz.',true);return;}
  if (!client){show('Web giris ayarlari eksik. Yonetici public Supabase anahtarini yapilandirmalidir.',true);return;}
  try {
    const {data:{user},error}=await client.auth.getUser();
    if(!error && user){location.replace(url('mesaj.html'));return;}
  } catch (_) { /* Not logged in. */ }
  el('login-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const email=el('login-email').value.trim();
    const button=event.submitter;button.disabled=true;
    try{
      const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:url('giris.html')}});
      if(error)throw error;
      show('Giris baglantisi gonderildi. E-posta kutunu kontrol et.');
    }catch(e){show('Giris baglantisi gonderilemedi. E-posta veya Supabase ayarlarini kontrol et: '+(e.message||'Hata'),true)}
    finally{button.disabled=false;}
  });
  async function withGoogle(){
    const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:url('giris.html')}});
    if(error)show('Google girisi baslatilamadi: '+error.message,true);
  }
  el('google').addEventListener('click',()=>withGoogle().catch(e=>show(e.message,true)));
  el('register-google').addEventListener('click',()=>withGoogle().catch(e=>show(e.message,true)));
}());

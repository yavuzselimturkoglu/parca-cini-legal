(async function () {
  'use strict';
  const {client,el,goodId,id,url,listingUrl,show}=window.PC_WEB;
  el('back').href=listingUrl();
  if (!goodId || !client) {show('Gecersiz ilan veya eksik web giris ayarlari.',true);return;}
  let user, conversationId;
  let polling=false;
  let pendingMessage=null;
  async function loadMessages(){
    if(polling||!conversationId)return;
    polling=true;
    try{
      const {data,error}=await client.from('messages')
        .select('id,sender_id,body,created_at,read_at')
        .eq('conversation_id',conversationId).order('created_at',{ascending:false}).limit(100);
      if(error)throw error;
      const list=el('messages');list.replaceChildren();
      for(const row of [...(data||[])].reverse()){
        const node=document.createElement('div');node.className='bubble'+(row.sender_id===user.id?' mine':'');
        const body=document.createElement('div');body.textContent=String(row.body||'').slice(0,2000);
        const time=document.createElement('time');
        const t=Date.parse(row.created_at);time.textContent=Number.isFinite(t)?new Date(t).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'}):'';
        node.append(body,time);list.append(node);
      }
      if(!(data||[]).length){const empty=document.createElement('p');empty.className='fine';empty.textContent='Henuz mesaj yok. Ilk mesaji siz gonderebilirsiniz.';list.append(empty);}
      list.scrollTop=list.scrollHeight;
    }catch(e){show('Sohbet mesajlari alinamadi: '+(e.message||'Erisim engellendi'),true)}
    finally{polling=false;}
  }
  try{
    const {data:auth,error:authErr}=await client.auth.getUser();
    if(authErr || !auth.user){location.replace(url('giris.html'));return;}
    user=auth.user;
    el('signed-in').textContent=user.email||'Parca Cini uyesi';
    el('sign-out').addEventListener('click',async()=>{await client.auth.signOut();location.replace(url('giris.html'));});
    const {data:pub,error:pubErr}=await client.from('pc_legal_acceptances')
      .select('id').eq('user_id',user.id).eq('document_key','membership').limit(1);
    if(pubErr)throw new Error('Uyelik sozlesmesi kontrol edilemedi: '+pubErr.message);
    if(!pub || pub.length===0)throw new Error('Mesaj yazmak icin uygulamadaki uyelik sozlesmesi ve profil kaydini tamamlamalisiniz.');
    const listingResponse=await fetch('https://wwviljsegjmritgindso.supabase.co/functions/v1/pc-public-listing-v6?id='+encodeURIComponent(id),{cache:'no-store'});
    if(!listingResponse.ok)throw new Error('Ilan artik yayinda degil.');
    const listing=await listingResponse.json();
    const contact=listing.contact_channels||{};
    if(listing.is_sold || contact.messages!==true)throw new Error('Bu ilanin mesajlasma secenegi kapali.');
    el('listing-title').textContent=String(listing.title||'Ilan');
    // The server-side SECURITY DEFINER RPC checks published/sold/expired,
    // phone-only preference, self-contact and reciprocal block state.
    const {data:seller,error:guardErr}=await client.rpc('pc_web_contact_guard_v1',{p_listing_id:id});
    if(guardErr||!seller)throw new Error('Iletisim izni kontrolu basarisiz: '+(guardErr?.message||'Erisim yok'));
    const {data:existing,error:existingErr}=await client.from('conversations')
      .select('id').eq('listing_id',id).eq('buyer_id',user.id).eq('seller_id',seller).limit(1);
    if(existingErr)throw existingErr;
    if(existing && existing.length){conversationId=existing[0].id;}
    else{
      const {data:created,error:createErr}=await client.from('conversations')
        .insert({listing_id:id,buyer_id:user.id,seller_id:seller}).select('id').single();
      if(createErr){
        if(createErr.code!=='23505')throw createErr;
        const {data:retry,error:retryErr}=await client.from('conversations')
          .select('id').eq('listing_id',id).eq('buyer_id',user.id).eq('seller_id',seller).single();
        if(retryErr)throw retryErr;conversationId=retry.id;
      }else{conversationId=created.id;}
    }
    await loadMessages();
    el('message-form').hidden=false;
    window.setInterval(()=>{if(!document.hidden)void loadMessages();},7000);
  }catch(e){show(e.message||'Sohbet acilamadi.',true);el('messages').textContent='Mesajlasma su anda kullanilamiyor.';return;}
  el('message-form').addEventListener('submit',async(e)=>{
    e.preventDefault();
    const body=el('message-text').value.trim();
    if(!body || [...body].length>2000)return;
    el('send').disabled=true;
    const retryKey=body+'|'+conversationId;
    if(!pendingMessage || pendingMessage.key!==retryKey)pendingMessage={key:retryKey,id:crypto.randomUUID()};
    try{
      // Re-run the server permission check before every send.
      const {error:guardErr}=await client.rpc('pc_web_contact_guard_v1',{p_listing_id:id});
      if(guardErr)throw guardErr;
      const {error}=await client.from('messages')
        .insert({id:pendingMessage.id,conversation_id:conversationId,sender_id:user.id,body});
      if(error){
        if(error.code!=='23505')throw error;
        const {data:reconciled,error:checkErr}=await client.from('messages')
          .select('id,body,sender_id').eq('id',pendingMessage.id).eq('conversation_id',conversationId).eq('sender_id',user.id).maybeSingle();
        if(checkErr||!reconciled||reconciled.body!==body)throw error;
      }
      pendingMessage=null;el('message-text').value='';el('feedback').hidden=true;
      await loadMessages();
    }catch(error){show('Mesaj gonderilemedi: '+(error.message||'Erisim hatasi')+'. Tekrar denemeden once sohbeti kontrol edin.',true)}
    finally{el('send').disabled=false;}
  });
}());

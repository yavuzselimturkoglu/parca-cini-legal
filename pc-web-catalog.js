(async function () {
  'use strict';
  const {client,el}=window.PC_WEB;
  const pageSize=12;
  const photoOrigin='https://wwviljsegjmritgindso.supabase.co';
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let page=0, search='', busy=false, loaded=0;
  const status=el('catalog-status'), grid=el('catalog-grid');
  if(!client){status.textContent='İlanlar henüz yapılandırılmadı. Yönetici Supabase public anahtarını tanımlamalı.';return;}
  const query=new URLSearchParams(location.search);
  search=(query.get('ara')||'').trim().slice(0,64);
  page=Math.min(Math.max(Number.parseInt(query.get('sayfa')||'1',10)||1,1),21)-1;
  el('search').value=search;
  const fmt=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:0});
  const text=(node,value)=>{node.textContent=String(value||'');return node;};
  function photoUrl(path){
    if(typeof path!=='string'||!path||path.includes('..')||path.startsWith('/'))return null;
    const url=client.storage.from('listing-images').getPublicUrl(path).data.publicUrl;
    try{const candidate=new URL(url);return candidate.protocol==='https:'&&candidate.origin===photoOrigin&&candidate.pathname.startsWith('/storage/v1/object/public/listing-images/')?url:null;}catch{return null;}
  }
  function card(item){
    if(!item || !uuid.test(item.id||''))return null;
    const a=document.createElement('a');a.className='catalog-card';a.href='ilan.html?id='+encodeURIComponent(item.id);
    const media=document.createElement('div');media.className='catalog-media';
    const src=photoUrl(item.photo_path);
    if(src){const img=document.createElement('img');img.src=src;img.alt='';img.loading='lazy';img.decoding='async';media.append(img);}
    else{const placeholder=document.createElement('div');placeholder.className='catalog-placeholder';placeholder.textContent='PARÇA CİNİ';media.append(placeholder);}
    const body=document.createElement('div');body.className='catalog-card-body';
    const title=document.createElement('h2');text(title,item.title||'Motosiklet parçası');
    const price=document.createElement('p');price.className='catalog-price';price.textContent=typeof item.price_try==='number'&&Number.isFinite(item.price_try)?fmt.format(item.price_try)+' TL':'Fiyat belirtilmemiş';
    const city=document.createElement('p');city.className='catalog-city';text(city,[item.district,item.city].filter(Boolean).join(' / ')||'Konum belirtilmemiş');
    body.append(title,price,city);a.append(media,body);return a;
  }
  function urlState(){const q=new URLSearchParams();if(search)q.set('ara',search);if(page)q.set('sayfa',String(page+1));history.replaceState(null,'','ilanlar.html'+(q.toString()?'?'+q.toString():''));}
  async function load(){
    if(busy)return;busy=true;status.textContent='İlanlar yükleniyor...';grid.replaceChildren();el('next').disabled=true;el('prev').disabled=true;
    try {
      const {data,error}=await client.rpc('pc_web_public_listings_v1',{p_offset:page*pageSize,p_search:search});
      if(error)throw error;
      if(!Array.isArray(data))throw new Error('İlan servisi geçersiz yanıt döndürdü.');
      loaded=data.length;
      const fragment=document.createDocumentFragment();
      for(const item of data){const node=card(item);if(node)fragment.append(node);}
      grid.append(fragment);
      status.textContent=data.length?'Yayındaki ilanları görüntülüyorsunuz.':'Bu aramayla eşleşen aktif ilan bulunamadı.';
      el('prev').disabled=page===0;el('next').disabled=data.length<pageSize||page>=20;
      el('page').textContent='Sayfa '+(page+1);urlState();
    }catch(e){loaded=0;status.textContent='İlan listesi alınamadı. pc_web_public_listings_v1 veritabanı işlevinin kurulu olduğunu kontrol edin. '+(e.message||'');}
    finally{busy=false;}
  }
  el('catalog-form').addEventListener('submit',e=>{e.preventDefault();search=el('search').value.trim().slice(0,64);page=0;void load();});
  el('prev').addEventListener('click',()=>{if(page>0){page--;void load();}});
  el('next').addEventListener('click',()=>{if(loaded===pageSize&&page<20){page++;void load();}});
  await load();
}());

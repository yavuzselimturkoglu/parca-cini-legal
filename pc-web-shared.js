(function () {
  'use strict';
  const base = 'https://yavuzselimturkoglu.github.io/parca-cini-legal/';
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('ilan') || '';
  const config = window.PC_WEB_CONFIG;
  const createClient = window.supabase && window.supabase.createClient;
  const sdkReady = config && config.url === 'https://wwviljsegjmritgindso.supabase.co'
    && config.publishableKey && !config.publishableKey.includes('PASTE')
    && typeof createClient === 'function';
  const client = sdkReady ? createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'parcacini-web-auth-v1' }
  }) : null;
  const el = name => document.getElementById(name);
  const show = (text, error=false) => {const node=el('feedback');if(node){node.textContent=text;node.dataset.error=error?'true':'false';node.hidden=false;}};
  const goodId = pattern.test(id);
  const url = page => base + page + (goodId ? '?ilan=' + encodeURIComponent(id) : '');
  const listingUrl = () => base + 'ilan.html' + (goodId ? '?id='+encodeURIComponent(id) : '');
  window.PC_WEB = Object.freeze({ id, goodId, client, el, show, url, listingUrl, config });
}());

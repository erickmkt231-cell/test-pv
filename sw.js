/* AquaGest Service Worker — cache com atualização automática */
const VERSION='aquagest-v3';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.hostname.endsWith('supabase.co'))return; /* dados sempre online */
  if(u.origin===location.origin){
    /* network-first: pega a versão nova, cai para o cache se offline */
    e.respondWith(fetch(e.request).then(r=>{const cl=r.clone();caches.open(VERSION).then(c=>c.put(e.request,cl));return r}).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html'))));
  }else{
    /* CDNs (gráficos, fontes): cache-first */
    e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{const cl=r.clone();caches.open(VERSION).then(c=>c.put(e.request,cl));return r})));
  }
});

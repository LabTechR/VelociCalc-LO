const CACHE='velocicalc-lo-v5';
const ASSETS=['./','./index.html','./styles.css','./app.bundle.js?v=5','./manifest.webmanifest','./icons/logo.svg','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('velocicalc-lo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(caches.open(CACHE).then(async c=>{
  if(e.request.mode==='navigate'){
   try{const response=await fetch(e.request,{cache:'no-cache'});if(!response.ok)throw Error('Página no disponible');await c.put('./index.html',response.clone());return response;}
   catch{return c.match('./index.html');}
  }
  const hit=await c.match(e.request);if(hit)return hit;
  return fetch(e.request);
 }));
});

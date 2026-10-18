const CACHE='velocicalc-lo-v1';
const ASSETS=['./','./index.html','./styles.css','./app.js','./physics.js','./manifest.webmanifest','./icons/logo.svg','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('velocicalc-lo-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;try{return await fetch(e.request);}catch(err){if(e.request.mode==='navigate')return c.match('./index.html');throw err;}}));});

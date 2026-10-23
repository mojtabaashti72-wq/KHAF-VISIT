const C="kv-app-v2",T="kv-tiles",APP=["./","index.html","map.html","manifest.webmanifest","icon-192.png","icon-512.png"];
const TH=["cartocdn.com","arcgisonline.com","tile.openstreetmap.org"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(APP)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C&&x!=T).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request,u=new URL(r.url);if(r.method!="GET")return;
if(TH.some(h=>u.hostname.endsWith(h))){e.respondWith(caches.open(T).then(async c=>{const m=await c.match(r.url);if(m)return m;try{const n=await fetch(r.url,{mode:"cors"});if(n.ok)c.put(r.url,n.clone());return n}catch(x){try{return await fetch(r)}catch(y){return Response.error()}}}));return}
if(u.origin==location.origin){e.respondWith(caches.open(C).then(async c=>{const m=await c.match(r,{ignoreSearch:true});const n=fetch(r).then(x=>{if(x.ok)c.put(r,x.clone());return x}).catch(()=>m);return m||n}))}});

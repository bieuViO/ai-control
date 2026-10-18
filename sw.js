// Service worker đơn giản: cache vỏ app để mở nhanh; API luôn đi mạng.
var C="aic-v42", F=["./","index.html","explorer.js","sheets.js","manifest.json","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(F)}));self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}))});
self.addEventListener("fetch",function(e){ if(e.request.method!=="GET")return; e.respondWith(fetch(e.request).catch(function(){return caches.match(e.request)})) });

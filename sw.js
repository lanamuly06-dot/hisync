self.addEventListener("install",function(){self.skipWaiting()});
self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim())});
self.addEventListener("fetch",function(e){
  if(e.request.method!=="GET")return;
  e.respondWith(fetch(e.request).catch(function(){
    return new Response("Kamu sedang offline. Sambungkan internet lalu coba lagi.",{status:503,headers:{"Content-Type":"text/plain;charset=utf-8"}})
  }))
});

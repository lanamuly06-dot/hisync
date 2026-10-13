/* HISYNC service worker.
   - File aplikasi (html/js/css/json): ambil dari internet dulu, cadangan dari cache bila lambat/offline.
   - Firebase SDK dan gambar: dari cache dulu (lebih cepat).
   Naikkan angka V setiap kali kamu mengganti gambar atau menambah file baru ke daftar CORE. */
var V="hs-v1";
var SDK=[
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"
];
var CORE=["./","index.html","style.css","theme.css","config.js","app.js","members.js","settings.js","social.js","feed.js","extras.js","plus.js","more.js","manifest.json",
  "IMG-20260903-WA0074.jpg","IMG-20260903-WA0004.jpg","IMG-20260901-WA0016.jpg","Tak berjudul108_20261011224016.png"];
var INDEX=new URL("index.html",self.registration.scope).href;

function offline(){return new Response("Kamu sedang offline. Sambungkan internet lalu coba lagi.",{status:503,headers:{"Content-Type":"text/plain;charset=utf-8"}})}
function put(key,res){var cp=res.clone();caches.open(V).then(function(c){c.put(key,cp)})}

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(V).then(function(c){
    return Promise.all(CORE.concat(SDK).map(function(u){return c.add(new Request(u,{cache:"reload"})).catch(function(){})}))
  }).then(function(){return self.skipWaiting()}))
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))
});

function netFirst(req){
  var nav=req.mode==="navigate",key=nav?INDEX:req.url.split("#")[0];
  var net=fetch(nav?req.url:req,{cache:"no-cache"}).then(function(res){if(res&&res.ok)put(key,res);return res});
  var slow=new Promise(function(_,rej){setTimeout(function(){rej(new Error("slow"))},4500)});
  return Promise.race([net,slow]).catch(function(){
    return caches.match(key).then(function(r){return r||net.catch(offline)})
  })
}
function cacheFirst(req){
  return caches.match(req).then(function(r){
    return r||fetch(req).then(function(res){if(res&&res.ok)put(req,res);return res}).catch(offline)
  })
}
self.addEventListener("fetch",function(e){
  var req=e.request;if(req.method!=="GET")return;
  var u=new URL(req.url);
  if(u.origin===self.location.origin){
    if(/\.(?:jpe?g|png|webp|gif|svg|ico)$/i.test(u.pathname))e.respondWith(cacheFirst(req));
    else e.respondWith(netFirst(req));
    return
  }
  if(u.href.indexOf("https://www.gstatic.com/firebasejs/")===0)e.respondWith(cacheFirst(req))
});

/* HISYNC extras: ulang tahun member + bookmark postingan.
   Dimuat setelah feed.js. Tidak butuh perubahan Firestore rules
   (bookmark disimpan di usersettings/{uid}, yang sudah boleh ditulis pemiliknya). */
(function(){
if(typeof firebase==="undefined"||!firebase.apps.length)return;
var $=function(i){return document.getElementById(i)};
var fa=firebase.auth(),db=firebase.firestore(),FV=firebase.firestore.FieldValue;
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function ea(s){return esc(s).replace(/"/g,"&quot;")}
function ago(t){var s=(Date.now()-t)/1000;return s<60?"baru saja":s<3600?Math.floor(s/60)+" mnt":s<86400?Math.floor(s/3600)+" jam":Math.floor(s/86400)+" hr"}
function LS(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
var BADGE='<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px;margin-left:3px"><circle cx="12" cy="12" r="11" fill="#1d9bf0"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var ICON='<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/></svg>';

/* ---- data member (samakan tanggalnya dengan members.js bila diubah) ---- */
var M=[
  {k:"ali",n:"Alisha",c:"#8a94c8",bd:"2010-10-15"},
  {k:"nova",n:"Nova",c:"#ec5f86",bd:"2010-11-08"},
  {k:"ikh",n:"Ikhsan",c:"#4f7bff",bd:"2010-12-06"}
];
var BC={ali:"#8a94c8",nova:"#ec5f86",ikh:"#4f7bff"};
var BL=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
var uid=null,bm=[],myBias=null,flag=false,PC={},sv={list:[]},tok=0;

/* ---- CSS ---- */
var css=document.createElement("style");
css.textContent=[
".hbtn{border:0;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--card,var(--soft));box-shadow:var(--shadow,none);color:var(--fg);cursor:pointer;flex:none}",
".hbtn svg,.bm svg{width:20px;height:20px;fill:none}",
".bm{margin-left:auto;border:0;background:none;color:var(--mute);cursor:pointer;padding:6px 0 0;line-height:0}",
".bm.on{color:var(--brand-ink,#4a5fd6)}.bm.on svg{fill:currentColor}",
"body.nonotif .bell:not(:has(#nbd)){display:grid!important}",
"#bdc{margin:8px 16px;padding:14px 16px;border-radius:20px;background:var(--card);box-shadow:var(--shadow)}",
".bdh{font-weight:800;font-size:15px;margin-bottom:6px}",
".bdr{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line);flex-wrap:wrap}",
".bdr:first-of-type{border-top:0}",
".bdr.td{background:color-mix(in srgb,var(--c) 12%,transparent);border-radius:14px;padding:10px 12px;border-top:0;margin-top:4px}",
".bdn{font:700 26px/1 var(--hand,cursive);color:var(--c)}",
".bdt{font-size:13px;color:var(--mute);flex:1 1 140px}",
".bdb{border:0;background:var(--c);color:#fff;border-radius:99px;padding:8px 14px;font:600 13px inherit;font-family:inherit;cursor:pointer}",
".bdbig{font-size:44px;text-align:center;animation:bdpop .5s ease-out both}",
"@keyframes bdpop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}",
".bdtt{font-weight:800;font-size:18px;text-align:center;margin:6px 0 10px}"
].join("");
document.head.appendChild(css);

/* =================== ULANG TAHUN =================== */
function wibToday(){var d=new Date(Date.now()+252e5);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())}
function dayKey(){return new Date(Date.now()+252e5).toISOString().slice(0,10)}
function bdLeft(bd){
  var p=bd.split("-"),y=+p[0],m=+p[1]-1,d=+p[2],t=wibToday(),yr=new Date(t).getUTCFullYear(),nb=Date.UTC(yr,m,d);
  if(nb<t){yr++;nb=Date.UTC(yr,m,d)}
  return{left:Math.round((nb-t)/864e5),age:yr-y,txt:d+" "+BL[m]}
}
var home=$("v-home"),card=document.createElement("div");card.id="bdc";card.className="hide";
if(home){var hero=home.querySelector(".hero");home.insertBefore(card,hero?hero.nextSibling:home.firstChild)}
function renderBd(){
  var l=M.map(function(m){var b=bdLeft(m.bd);b.m=m;return b}).filter(function(b){return b.left<=7}).sort(function(a,b){return a.left-b.left});
  if(!l.length){card.classList.add("hide");card.innerHTML="";return}
  card.classList.remove("hide");
  card.innerHTML='<div class="bdh">🎂 Ulang tahun member</div>'+l.map(function(b){
    var td=b.left===0,t=td?"Hari ini! Genap "+b.age+" tahun":(b.left===1?"Besok":b.left+" hari lagi")+" · "+b.txt+" · genap "+b.age+" tahun";
    return '<div class="bdr'+(td?" td":"")+'" style="--c:'+b.m.c+'"><div class="bdn">'+esc(b.m.n)+'</div><div class="bdt">'+esc(t)+'</div>'+(td?'<button class="bdb" data-w="'+b.m.k+'">Kirim ucapan</button>':'')+'</div>'
  }).join("")
}
renderBd();setInterval(renderBd,60000);

var pop=null;
function closePop(){if(pop){pop.remove();pop=null}}
function greet(k){
  var m=M.filter(function(x){return x.k===k})[0];if(!m)return;
  closePop();
  var nb=document.querySelector('#nav button[data-t="home"]');if(nb)nb.click();
  var t=$("pt");if(t){t.value="Selamat ulang tahun yang ke-"+bdLeft(m.bd).age+", "+m.n+"! 🎂💙 Semoga selalu sehat dan bahagia.";window.scrollTo(0,0);t.focus()}
}
function popup(){
  var t=M.filter(function(m){return bdLeft(m.bd).left===0});if(!t.length)return;
  var key="hs_bd_"+dayKey();if(LS(key))return;LS(key,"1");
  pop=document.createElement("div");pop.className="ov";
  pop.innerHTML='<div class="sheet"><div class="bdbig">🎂</div><div class="bdtt">'+(t.length===1?"Hari ini ulang tahun "+esc(t[0].n):"Hari ini ada member yang ulang tahun")+'</div>'+t.map(function(m){
    return '<div class="bdr td" style="--c:'+m.c+'"><div class="bdn">'+esc(m.n)+'</div><div class="bdt">Genap '+bdLeft(m.bd).age+' tahun'+(myBias===m.k?' · bias kamu 💙':'')+'</div><button class="bdb" data-w="'+m.k+'">Kirim ucapan</button></div>'}).join("")+'<button class="btn ghost" data-bdx="1">Nanti saja</button></div>';
  pop.addEventListener("click",function(e){if(e.target===pop||e.target.closest("[data-bdx]"))closePop()});
  document.body.appendChild(pop)
}
document.addEventListener("click",function(e){var w=e.target.closest("[data-w]");if(w)greet(w.dataset.w)});

/* =================== BOOKMARK =================== */
function decorate(){
  [].forEach.call(document.querySelectorAll("#posts .acts,#fl .acts"),function(a){
    var l=a.querySelector(".like"),id=l&&(l.dataset.id||l.dataset.fl);if(!id)return;
    var b=a.querySelector(".bm");
    if(!b){b=document.createElement("button");b.className="bm";b.dataset.bm=id;b.setAttribute("aria-label","Simpan postingan");b.innerHTML=ICON;a.appendChild(b)}
    b.classList.toggle("on",bm.indexOf(id)>-1)
  })
}
function toggle(id){
  if(!uid)return;
  var on=bm.indexOf(id)>-1;
  if(!on&&bm.length>=200){alert("Daftar tersimpan penuh (maks. 200). Hapus beberapa dulu.");return}
  bm=on?bm.filter(function(x){return x!==id}):bm.concat(id);decorate();
  db.doc("usersettings/"+uid).set({bookmarks:on?FV.arrayRemove(id):FV.arrayUnion(id)},{merge:true}).catch(function(){alert("Gagal menyimpan. Coba lagi.")})
}
["posts","fl"].forEach(function(i){var el=$(i);if(el)new MutationObserver(decorate).observe(el,{childList:true,subtree:true})});
document.addEventListener("click",function(e){var b=e.target.closest(".bm[data-bm]");if(b)toggle(b.dataset.bm)});

/* ---- halaman Tersimpan ---- */
var ov=document.createElement("div");ov.className="ov2 hide";document.body.appendChild(ov);
var hdr=document.querySelector("header"),hb=document.createElement("button");
hb.className="hbtn";hb.setAttribute("aria-label","Tersimpan");hb.innerHTML=ICON;
if(hdr)hdr.insertBefore(hb,hdr.querySelector(".bell"));
function who(u){
  if(PC[u])return Promise.resolve(PC[u]);
  return Promise.all([db.doc("profiles/"+u).get().catch(function(){return null}),db.doc("verified/"+u).get().catch(function(){return null})]).then(function(r){
    var p=r[0]&&r[0].exists?r[0].data():{};
    PC[u]={name:p.name||"Fan",bias:p.bias,photo:p.photo||"",v:!!(r[1]&&r[1].exists)};return PC[u]
  })
}
function pdoc(id){return db.doc("posts/"+id).get().then(function(d){if(!d.exists)return{id:id,gone:true};var x=d.data();x.id=d.id;return x},function(){return{id:id,gone:true}})}
function pcard(p){
  var un='<button class="bm on" data-un="'+ea(p.id)+'" aria-label="Hapus dari tersimpan">'+ICON+'</button>';
  if(p.gone)return '<div class="post"><div class="tm">Postingan ini sudah dihapus.</div><div class="acts">'+un+'</div></div>';
  var w=PC[p.uid]||{name:"Fan"},c=BC[w.bias]||"#111",ph=w.photo&&String(w.photo).indexOf("data:image/")===0;
  return '<div class="post"><div class="who"><div class="av" style="background:'+c+';overflow:hidden">'+(ph?'<img src="'+w.photo+'" style="width:100%;height:100%;object-fit:cover">':esc((w.name||"?").charAt(0).toUpperCase()))+'</div><div><div class="nm">'+esc(w.name)+(w.v?BADGE:"")+'</div><div class="tm">'+ago(p.ts)+'</div></div></div>'
    +(p.text?'<div class="txt">'+esc(p.text)+'</div>':'')
    +(p.img&&String(p.img).indexOf("data:image/")===0?'<img class="pim" src="'+p.img+'">':'')
    +'<div class="acts"><span class="tm">♥ '+((p.likes||[]).length)+' · 💬 '+Math.max(0,p.cc||0)+'</span>'+un+'</div></div>'
}
function draw(loading){
  var h='<div class="ibt"><button class="sbk" data-sx="1">‹ Kembali</button><b>Tersimpan</b></div>';
  if(loading)h+='<div class="empty">Memuat…</div>';
  else if(!sv.list.length)h+='<div class="empty">Belum ada postingan tersimpan. Ketuk ikon penanda di postingan untuk menyimpannya.</div>';
  else h+=sv.list.map(pcard).join("")+(bm.length>60?'<div class="empty">Menampilkan 60 tersimpan terbaru.</div>':'');
  ov.innerHTML=h
}
function load(){
  var my=++tok,ids=bm.slice().reverse().slice(0,60);
  if(!ids.length){sv.list=[];draw();return}
  draw(true);
  Promise.all(ids.map(pdoc)).then(function(list){
    var us={};list.forEach(function(p){if(p.uid)us[p.uid]=1});
    return Promise.all(Object.keys(us).map(who)).then(function(){return list})
  }).then(function(list){if(my===tok){sv.list=list;draw()}})
}
hb.onclick=function(){ov.classList.remove("hide");ov.scrollTop=0;load()};
ov.addEventListener("click",function(e){
  if(e.target.closest("[data-sx]")){tok++;ov.classList.add("hide");return}
  var u=e.target.closest("[data-un]");
  if(u){var id=u.dataset.un;sv.list=sv.list.filter(function(p){return p.id!==id});toggle(id);draw()}
});

/* =================== DATA =================== */
fa.onAuthStateChanged(function(u){
  uid=u?u.uid:null;if(!u||flag)return;flag=true;
  db.doc("usersettings/"+uid).onSnapshot(function(d){bm=(d.exists&&d.data().bookmarks)||[];decorate()},function(){});
  db.doc("profiles/"+uid).get().then(function(d){myBias=d.exists?d.data().bias:null},function(){});
  var tries=0,t=setInterval(function(){
    if(++tries>120){clearInterval(t);return}
    var app=$("app");if(!app||app.classList.contains("hide"))return;
    clearInterval(t);popup()
  },1500)
});
})();

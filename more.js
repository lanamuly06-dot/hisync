/* HISYNC more: live lewat YouTube, panel admin, banner offline.
   Dimuat setelah plus.js. Tidak mengubah file lain. */
(function(){
if(typeof firebase==="undefined"||!firebase.apps.length)return;
var $=function(i){return document.getElementById(i)};
var fa=firebase.auth(),db=firebase.firestore();
function noop(){}
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function ea(s){return esc(s).replace(/"/g,"&quot;")}
function dd(d){var x=d.data();x.id=d.id;return x}
function img(s){return !!s&&String(s).indexOf("data:image/")===0}
var BN={ali:"Alisha",nova:"Nova",ikh:"Ikhsan"};
var AC={ali:"#8e8e93",nova:"#e5343d",ikh:"#2f6fed"};
var DY=["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
var uid=null,flag=false,live=null,PRF={},BANS={},REP=[],PLm=[],isAdm=false,ytDraft="",AF={tab:"all"};

/* ---------------- CSS ---------------- */
var css=document.createElement("style");
css.textContent=[
"#offb{position:fixed;top:0;left:0;right:0;z-index:99990;background:#1f2340;color:#fff;font:600 13px/1.3 sans-serif;text-align:center;padding:calc(6px + env(safe-area-inset-top,0px)) 12px 6px}",
"#offb.hide{display:none}",
"#ytw{padding:8px 16px 0}#ytw.hide{display:none}",
"#ytw iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:18px;display:block;background:#000}",
"#v-live.ytmode .lvv{display:none}",
"#ytf{margin-top:6px}",
"#adm{position:fixed;top:0;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:var(--bg);color:var(--fg);z-index:17;overflow-y:auto;padding:env(safe-area-inset-top,0px) 0 40px}",
"#adm.hide{display:none}#adm .ibt b{font-size:16px}",
".adg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:12px 16px}",
".adc{background:var(--card);border-radius:18px;padding:14px;box-shadow:var(--shadow)}",
".adc b{display:block;font-size:26px;line-height:1.1}.adc span{font-size:12px;color:var(--mute)}",
".adc button{margin-top:6px;border:0;background:none;color:var(--brand-ink,#2f6fed);font:600 12px inherit;font-family:inherit;padding:0;cursor:pointer}",
".adh{font-size:12px;color:var(--mute);font-weight:600;padding:8px 18px 0}",
".adch{display:flex;align-items:flex-end;gap:8px;padding:10px 18px 4px}",
".adb{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;font-size:11px;color:var(--mute)}",
".adb i{display:block;width:100%;min-height:3px;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,var(--brand2,#a9b8ff),var(--brand,#7f95ff));margin:3px 0}",
".adb b{color:var(--fg);font-size:12px}",
".atabs{display:flex;border-bottom:1px solid var(--line);margin-top:10px}",
".atabs button{flex:1;border:0;background:none;color:var(--mute);font:600 14px inherit;font-family:inherit;padding:12px;cursor:pointer}",
".atabs button.on{color:var(--brand-ink,#2f6fed);box-shadow:inset 0 -2px 0 var(--brand,#7f95ff)}",
"#adsr{padding:10px 16px 0}",
".adr{display:flex;align-items:center;gap:12px;padding:10px 18px;border-top:1px solid var(--line)}",
".adr .t{flex:1;min-width:0}",
".adtg{display:inline-block;margin-left:6px;padding:0 8px;border-radius:99px;background:#e5343d;color:#fff;font:700 10px/16px sans-serif;vertical-align:2px}"
].join("");
document.head.appendChild(css);

/* ---------------- BANNER OFFLINE ---------------- */
var ob=document.createElement("div");ob.id="offb";ob.className="hide";ob.textContent="Kamu sedang offline. Beberapa fitur tidak tersedia.";
document.body.appendChild(ob);
function netUpd(){ob.classList.toggle("hide",navigator.onLine!==false)}
window.addEventListener("online",netUpd);window.addEventListener("offline",netUpd);netUpd();

/* ---------------- LIVE LEWAT YOUTUBE ---------------- */
function ytId(s){
  s=String(s||"").trim();
  if(/^[A-Za-z0-9_-]{11}$/.test(s))return s;
  var m=/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/|shorts\/|v\/)|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/.exec(s);
  return m?m[1]:""
}
var vlive=$("v-live"),lbox=$("livebox"),wrap=document.createElement("div"),fr=document.createElement("iframe"),curYt="",lastVis=false;
wrap.id="ytw";wrap.className="hide";
fr.title="YouTube Live";fr.setAttribute("allow","autoplay; encrypted-media; picture-in-picture; fullscreen");
fr.setAttribute("allowfullscreen","");fr.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
wrap.appendChild(fr);
function syncYt(){
  if(!vlive)return;
  var id=live&&live.active?ytId(live.yt||""):"",vis=!vlive.classList.contains("hide"),want=id&&vis?id:"";
  if(vlive.classList.contains("ytmode")!==!!id)vlive.classList.toggle("ytmode",!!id);
  if(wrap.classList.contains("hide")===!!want)wrap.classList.toggle("hide",!want);
  if(want!==curYt){curYt=want;fr.src=want?"https://www.youtube-nocookie.com/embed/"+want+"?autoplay=1&playsinline=1&rel=0&modestbranding=1":"about:blank"}
}
function injectForm(){
  var g=$("golive");if(!g||$("ytlink"))return;
  var d=document.createElement("div");d.id="ytf";
  d.innerHTML='<label>Link YouTube Live (opsional)</label><input id="ytlink" placeholder="https://youtube.com/live/…" value="'+ea(ytDraft)+'" autocomplete="off"><div class="tm" style="margin-top:4px">Kosongkan untuk live kamera. Di YouTube, pastikan "izinkan penyematan" aktif.</div>';
  g.parentNode.insertBefore(d,g)
}
if(vlive&&lbox){
  vlive.insertBefore(wrap,vlive.firstChild);
  new MutationObserver(function(){var v=!vlive.classList.contains("hide");if(v!==lastVis){lastVis=v;syncYt()}}).observe(vlive,{attributes:true,attributeFilter:["class"]});
  new MutationObserver(injectForm).observe(lbox,{childList:true});
  document.addEventListener("input",function(e){if(e.target.id==="ytlink")ytDraft=e.target.value});
  /* capture: kalau ada link YouTube, ambil alih tombol Mulai Live (tanpa menyalakan kamera) */
  document.addEventListener("click",function(e){
    if(!e.target.closest("#golive"))return;
    var link=($("ytlink")&&$("ytlink").value||"").trim();if(!link)return;
    e.stopPropagation();e.preventDefault();
    var id=ytId(link),t=($("ltitle")&&$("ltitle").value||"").trim();
    if(!id){alert("Link YouTube tidak dikenali. Contoh: https://youtube.com/live/xxxxxxxxxxx");return}
    if(!t){alert("Isi judul live dulu.");return}
    ytDraft="";
    db.doc("live/current").set({title:t,uid:uid,ts:Date.now(),active:true,yt:id}).catch(function(){alert("Gagal memulai live. Hanya admin atau member yang bisa.")})
  },true)
}

/* ---------------- PANEL ADMIN ---------------- */
function dayIdx(t){return Math.floor((t+252e5)/864e5)}
function fmtD(t){return new Date(t).toLocaleDateString("id-ID",{day:"numeric",month:"short"})}
function av(u,s){
  var p=PRF[u]||{},c=AC[p.bias]||"#111";
  return '<div class="av" style="background:'+c+';width:'+s+'px;height:'+s+'px;font-size:'+Math.round(s*.4)+'px;overflow:hidden;flex:none">'+(img(p.photo)?'<img src="'+ea(p.photo)+'" style="width:100%;height:100%;object-fit:cover">':esc((p.name||"?").charAt(0).toUpperCase()))+'</div>'
}
var ad=document.createElement("div");ad.id="adm";ad.className="hide";
ad.innerHTML='<div class="ibt"><button class="sbk" data-ax="1">‹ Kembali</button><b>Panel Admin</b></div><div id="ads"></div><div class="atabs"><button data-at="all" class="on">Semua pengguna</button><button data-at="ban">Diblokir</button></div><div id="adsr"><input id="adq" maxlength="30" placeholder="Cari nama atau username…"></div><div id="adl"></div>';
document.body.appendChild(ad);
function drawStats(){
  var td=dayIdx(Date.now()),c=[0,0,0,0,0,0,0],us=Object.keys(PRF);
  us.forEach(function(u){var t=PRF[u].ts;if(typeof t!=="number")return;var d=td-dayIdx(t);if(d>=0&&d<7)c[6-d]++});
  var n7=c.reduce(function(a,b){return a+b},0),max=Math.max.apply(null,c.concat([1]));
  var p24=PLm.filter(function(p){return Date.now()-p.ts<864e5}).length,p24t=PLm.length>=50&&p24>=50?"50+":String(p24);
  var nb=Object.keys(BANS).length;
  $("ads").innerHTML='<div class="adg">'
   +'<div class="adc"><b>'+us.length+'</b><span>Total pengguna</span></div>'
   +'<div class="adc"><b>'+c[6]+'</b><span>Baru hari ini</span></div>'
   +'<div class="adc"><b>'+n7+'</b><span>Baru 7 hari</span></div>'
   +'<div class="adc"><b>'+p24t+'</b><span>Postingan 24 jam</span></div>'
   +'<div class="adc"><b>'+nb+'</b><span>Diblokir</span></div>'
   +'<div class="adc"><b>'+REP.length+'</b><span>Laporan menunggu</span>'+(REP.length?'<br><button data-rep="1">Lihat laporan ›</button>':'')+'</div></div>'
   +'<div class="adh">Pengguna baru 7 hari terakhir</div><div class="adch">'+c.map(function(n,i){var dt=new Date((td-6+i)*864e5);return '<div class="adb"><b>'+n+'</b><i style="height:'+Math.max(3,Math.round(n/max*70))+'px"></i><span>'+DY[dt.getUTCDay()]+'</span></div>'}).join("")+'</div>'
}
function drawList(){
  var q=($("adq").value||"").trim().toLowerCase().replace(/^@/,""),ids;
  if(AF.tab==="ban")ids=Object.keys(BANS);
  else ids=Object.keys(PRF);
  ids=ids.filter(function(u){
    if(!q)return true;var p=PRF[u]||{};
    return (p.name||"").toLowerCase().indexOf(q)>-1||(p.username||"").toLowerCase().indexOf(q)>-1
  }).sort(function(a,b){return ((PRF[b]||{}).ts||0)-((PRF[a]||{}).ts||0)}).slice(0,100);
  $("adl").innerHTML=ids.length?ids.map(function(u){
    var p=PRF[u]||{},bn=!!BANS[u];
    return '<div class="adr">'+av(u,40)+'<div class="t"><div class="nm">'+esc(p.name||"(tanpa profil)")+(bn?'<span class="adtg">Diblokir</span>':'')+'</div><div class="tm">@'+esc(p.username||"-")+(BN[p.bias]?' · bias '+BN[p.bias]:'')+(typeof p.ts==="number"?' · gabung '+fmtD(p.ts):'')+'</div></div>'
     +(u===uid?'<span class="tm">Kamu</span>':'<button class="lb'+(bn?"":" d")+'" data-ban="'+ea(u)+'">'+(bn?"Buka blokir":"Blokir")+'</button>')+'</div>'
  }).join(""):'<div class="empty">'+(AF.tab==="ban"?"Tidak ada pengguna yang diblokir.":"Tidak ada pengguna yang cocok.")+'</div>'
}
function refreshAd(){if(!ad.classList.contains("hide")){drawStats();drawList()}}
function toggleBan(u){
  var p=PRF[u]||{},nm=p.name||"pengguna",fail=function(){alert("Gagal. Coba lagi.")};
  if(BANS[u]){if(confirm("Buka blokir "+nm+"?"))db.doc("bans/"+u).delete().catch(fail)}
  else{if(u===uid)return;if(confirm("Blokir "+nm+"? Dia tidak akan bisa memakai HISYNC lagi."))db.doc("bans/"+u).set({ts:Date.now(),by:uid}).catch(fail)}
}
ad.addEventListener("click",function(e){
  if(e.target.closest("[data-ax]")){ad.classList.add("hide");return}
  var t=e.target.closest("[data-at]");
  if(t){AF.tab=t.dataset.at;[].forEach.call(ad.querySelectorAll("[data-at]"),function(b){b.classList.toggle("on",b===t)});drawList();return}
  var b=e.target.closest("[data-ban]");if(b){toggleBan(b.dataset.ban);return}
  if(e.target.closest("[data-rep]")){ad.classList.add("hide");var n=document.querySelector('#nav button[data-t="me"]');if(n)n.click()}
});
ad.addEventListener("input",function(e){if(e.target.id==="adq")drawList()});
function injectAdm(){
  if(!isAdm)return;var out=$("out");if(!out||$("admb"))return;
  var b=document.createElement("button");b.className="btn ghost";b.id="admb";b.textContent="🛡 Panel Admin";out.parentNode.insertBefore(b,out)
}
document.addEventListener("click",function(e){
  if(!e.target.closest("#admb"))return;
  ad.classList.remove("hide");ad.scrollTop=0;drawStats();drawList()
});
if($("meb"))new MutationObserver(injectAdm).observe($("meb"),{childList:true});

/* ---------------- DATA ---------------- */
fa.onAuthStateChanged(function(u){
  uid=u?u.uid:null;if(!u||flag)return;flag=true;
  db.doc("live/current").onSnapshot(function(d){live=d.exists?d.data():null;syncYt()},noop);
  db.doc("admins/"+uid).get().then(function(d){
    if(!d.exists)return;isAdm=true;injectAdm();
    db.collection("profiles").onSnapshot(function(s){PRF={};s.docs.forEach(function(x){PRF[x.id]=x.data()});refreshAd()},noop);
    db.collection("bans").onSnapshot(function(s){BANS={};s.docs.forEach(function(x){BANS[x.id]=x.data()});refreshAd()},noop);
    db.collection("reports").limit(100).onSnapshot(function(s){REP=s.docs.map(dd);refreshAd()},noop);
    db.collection("posts").orderBy("ts","desc").limit(50).onSnapshot(function(s){PLm=s.docs.map(function(x){return{ts:x.data().ts}});refreshAd()},noop)
  },noop)
});
})();

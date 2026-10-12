(function(){
if(typeof firebase==="undefined"||!firebase.apps.length)return;
var $=function(i){return document.getElementById(i)};
var fa=firebase.auth(),db=firebase.firestore();
var APP_ID="626adbd192d94d708f0b6d4bf78e1bac";
var BADGE='<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px;margin-left:3px"><circle cx="12" cy="12" r="11" fill="#1d9bf0"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var uid=null,live=null,hostFlag=false,V={},PN={},MA={},flag=false;
var client=null,mic=null,cam=null,joined=null,busy=false,mutedA=false,mutedV=false,cams=[],camIdx=0,msg="",tiles={};
function noop(){}
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function canLive(){if(hostFlag)return true;for(var k in MA)if(MA[k]===uid)return true;return false}
function prof(u){if(PN[u])return;PN[u]={name:"…"};db.doc("profiles/"+u).get().then(function(d){PN[u]={name:d.exists?d.data().name:"Fan"};labels()},function(){PN[u]={name:"Fan"};labels()})}
function pn(u){prof(u);return PN[u].name}

var css=document.createElement("style");
css.textContent=".lvv{display:none!important}#livebox>.card:has(#golive){display:none!important}#lg{padding:12px 18px 0}.lgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px}.lgrid.one{grid-template-columns:1fr}.lgrid:empty{display:none}.gt{position:relative;background:#000;border-radius:14px;overflow:hidden;aspect-ratio:3/4}.lgrid.one .gt{aspect-ratio:4/5}.gt .gl{position:absolute;left:8px;bottom:8px;color:#fff;font-size:12px;font-weight:600;background:#0007;border-radius:99px;padding:2px 10px;z-index:3}.gt.off::after{content:'Kamera mati';position:absolute;top:0;bottom:0;left:0;right:0;display:grid;place-items:center;color:#fff;font-size:13px;background:#222;z-index:2}.lcard{border:1px solid var(--line);border-radius:18px;padding:16px;margin-top:6px}.lctl{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px}.lctl button{border:0;background:var(--soft);color:var(--fg);border-radius:99px;padding:10px 14px;font:600 13px inherit;font-family:inherit;cursor:pointer}.lctl button.off,.lctl button.end{background:#e5343d;color:#fff}.lctl button.go{background:var(--acc,#111);color:#fff}.lctl button:disabled{opacity:.5}.lmsg{color:var(--mute);font-size:13px;text-align:center;padding:10px 0 2px}.lmsg.err{color:#e5343d}";
document.head.appendChild(css);
var lg=document.createElement("div");lg.id="lg";lg.innerHTML='<div id="lgrid" class="lgrid"></div><div id="lui"></div>';
$("v-live").insertBefore(lg,$("livebox"));

/* ---------- tile ---------- */
function ensureTile(u){
  var t=tiles[u];if(t)return t;
  var d=document.createElement("div");d.className="gt";
  var box=document.createElement("div");box.style.cssText="position:absolute;top:0;left:0;right:0;bottom:0";
  var lb=document.createElement("div");lb.className="gl";
  d.appendChild(box);d.appendChild(lb);$("lgrid").appendChild(d);
  t=tiles[u]={el:d,box:box,lb:lb};labels();layout();return t
}
function removeTile(u){var t=tiles[u];if(!t)return;t.el.remove();delete tiles[u];layout()}
function clearTiles(){Object.keys(tiles).forEach(removeTile)}
function labels(){Object.keys(tiles).forEach(function(u){tiles[u].lb.innerHTML=esc(pn(u))+(V[u]?BADGE:"")+(u===uid?" (kamu)":"")})}
function layout(){$("lgrid").className="lgrid"+(Object.keys(tiles).length===1?" one":"")}

/* ---------- UI ---------- */
function ui(){
  var el=$("lui");if(!el)return;
  var h="";
  if(typeof AgoraRTC==="undefined"){el.innerHTML='<div class="lmsg err">Komponen live belum termuat. Muat ulang halaman.</div>';return}
  var on=live&&live.active;
  if(!on&&!joined){
    if(canLive())h='<div class="lcard"><div class="nm" style="font-size:17px">Mulai live</div><div class="tm">Beberapa member bisa tampil bersamaan dalam grid.</div><label>Judul live</label><input id="l2t" maxlength="60" placeholder="mis. Nonton bareng"><div class="lctl"><button class="go" data-l="start"'+(busy?" disabled":"")+'>Mulai Live</button></div></div>';
  }else if(on&&!joined){
    h='<div class="lcard"><div class="nm" style="font-size:16px">● Live sedang berlangsung</div><div class="lctl"><button class="go" data-l="watch"'+(busy?" disabled":"")+'>Tonton live</button>'+(canLive()?'<button data-l="host"'+(busy?" disabled":"")+'>Gabung sebagai host</button>':'')+'</div></div>';
  }else if(joined){
    var host=joined.role==="host",starter=live&&live.uid===uid;
    h='<div class="lctl">'+(host?'<button data-l="mic" class="'+(mutedA?"off":"")+'">'+(mutedA?"Mikrofon mati":"Mikrofon")+'</button><button data-l="cam" class="'+(mutedV?"off":"")+'">'+(mutedV?"Kamera mati":"Kamera")+'</button>'+(cams.length>1?'<button data-l="flip">Balik kamera</button>':'')+(starter?'<button class="end" data-l="finish">Selesai live</button>':'<button class="end" data-l="leave">Keluar</button>'):'<button class="end" data-l="leave">Berhenti menonton</button>')+'</div>';
    if(!host&&!Object.keys(tiles).length)h+='<div class="lmsg">Menunggu host menyalakan kamera…</div>'
  }
  if(msg)h+='<div class="lmsg err">'+esc(msg)+'</div>';
  el.innerHTML=h
}
function emsg(e){var c=e&&(e.code||e.name)||"";
  if(c==="PERMISSION_DENIED"||c==="NotAllowedError")return "Izin kamera atau mikrofon ditolak. Izinkan di pengaturan browser lalu coba lagi.";
  if(c==="DEVICE_NOT_FOUND"||c==="NotFoundError")return "Kamera atau mikrofon tidak ditemukan.";
  if(c==="NOT_READABLE"||c==="NotReadableError")return "Kamera sedang dipakai aplikasi lain.";
  if(/token|vendor key|static key|CAN_NOT_GET_GATEWAY|INVALID_PARAMS/i.test(String(c)+" "+String(e&&e.message||"")))return "Gagal terhubung ke server live. Pastikan proyek Agora memakai mode Testing (APP ID saja, tanpa token).";
  return (e&&e.message)||"Terjadi kesalahan."}

/* ---------- Agora ---------- */
function initClient(){
  if(client)return;
  AgoraRTC.setLogLevel(3);
  client=AgoraRTC.createClient({mode:"live",codec:"vp8"});
  client.on("user-published",function(user,type){
    client.subscribe(user,type).then(function(){
      if(type==="video"){var t=ensureTile(user.uid);t.el.classList.remove("off");user.videoTrack.play(t.box);try{client.setStreamFallbackOption(user.uid,1)}catch(e){}}
      if(type==="audio"&&user.audioTrack)user.audioTrack.play();
      ui()
    },noop)
  });
  client.on("user-unpublished",function(user,type){if(type==="video"&&tiles[user.uid])tiles[user.uid].el.classList.add("off")});
  client.on("user-left",function(user){removeTile(user.uid);ui()});
  window.addEventListener("pagehide",function(){try{client.leave()}catch(e){}})
}
function startPublish(){
  return AgoraRTC.createMicrophoneAndCameraTracks({AEC:true,ANS:true,AGC:true},{encoderConfig:{width:640,height:480,frameRate:24,bitrateMax:900},optimizationMode:"motion"}).then(function(r){
    mic=r[0];cam=r[1];mutedA=false;mutedV=false;
    var t=ensureTile(uid);cam.play(t.box);
    try{client.enableDualStream().catch(noop)}catch(e){}
    return client.publish([mic,cam])
  }).then(function(){return AgoraRTC.getCameras().then(function(c){cams=c},function(){cams=[]})})
}
function joinLive(role){
  if(busy||joined||!live||!live.active)return;
  if(typeof AgoraRTC==="undefined"){msg="Komponen live belum termuat.";ui();return}
  busy=true;msg="";ui();initClient();
  var ch="hs"+live.ts;
  client.setClientRole(role==="host"?"host":"audience").then(function(){return client.join(APP_ID,ch,null,uid)}).then(function(){
    joined={role:role,ch:ch};
    return role==="host"?startPublish():null
  }).then(function(){busy=false;ui()},function(e){
    msg=emsg(e);busy=false;leaveLive(true)
  })
}
function leaveLive(keepMsg){
  var p=Promise.resolve();
  try{if(mic){mic.stop();mic.close()}if(cam){cam.stop();cam.close()}}catch(e){}
  mic=null;cam=null;cams=[];
  if(client)p=client.leave().then(noop,noop);
  return p.then(function(){joined=null;busy=false;clearTiles();if(!keepMsg)msg="";ui()})
}
function startLive(){
  var inp=$("l2t"),t=inp&&inp.value.trim();
  if(!t){msg="Isi judul live dulu.";ui();return}
  var ts=Date.now(),data={title:t,uid:uid,ts:ts,active:true};
  db.doc("live/current").set(data).then(function(){live=data;joinLive("host")},function(){msg="Gagal memulai live. Pastikan akunmu admin atau host.";ui()})
}
function finishLive(){
  if(!live||!confirm("Akhiri live untuk semua penonton?"))return;
  db.doc("live/current").set({title:live.title,uid:live.uid,ts:live.ts,active:false}).catch(function(){msg="Gagal mengakhiri live.";ui()})
}
lg.addEventListener("click",function(e){
  var b=e.target.closest("[data-l]");if(!b)return;var a=b.dataset.l;
  if(a==="start")startLive();
  else if(a==="watch")joinLive("audience");
  else if(a==="host")joinLive("host");
  else if(a==="leave")leaveLive();
  else if(a==="finish")finishLive();
  else if(a==="mic"&&mic){mutedA=!mutedA;mic.setMuted(mutedA).then(ui,ui)}
  else if(a==="cam"&&cam){mutedV=!mutedV;cam.setMuted(mutedV).then(ui,ui);if(tiles[uid])tiles[uid].el.classList.toggle("off",mutedV)}
  else if(a==="flip"&&cam&&cams.length>1){camIdx=(camIdx+1)%cams.length;cam.setDevice(cams[camIdx].deviceId).catch(function(e){msg=emsg(e);ui()})}
});

/* ---------- data ---------- */
fa.onAuthStateChanged(function(u){
  uid=u?u.uid:null;if(!u||flag)return;flag=true;
  db.doc("live/current").onSnapshot(function(d){
    live=d.exists?d.data():null;
    if(joined&&(!live||!live.active||"hs"+live.ts!==joined.ch))leaveLive();
    else ui()
  },noop);
  db.collection("verified").onSnapshot(function(s){V={};s.docs.forEach(function(d){V[d.id]=true});labels()},noop);
  db.collection("memberacct").onSnapshot(function(s){MA={};s.docs.forEach(function(d){MA[d.id]=d.data().uid});ui()},noop);
  Promise.all([db.doc("admins/"+uid).get(),db.doc("hosts/"+uid).get()]).then(function(r){hostFlag=r[0].exists||r[1].exists;ui()},noop);
  ui()
});
})();

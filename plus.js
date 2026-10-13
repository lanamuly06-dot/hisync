/* HISYNC plus: postingan artis, pencarian + hashtag, profil lengkap.
   Dimuat setelah extras.js. Tidak mengubah file lain. */
(function(){
if(typeof firebase==="undefined"||!firebase.apps.length)return;
var $=function(i){return document.getElementById(i)};
var fa=firebase.auth(),db=firebase.firestore(),FV=firebase.firestore.FieldValue;
function noop(){}
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function ea(s){return esc(s).replace(/"/g,"&quot;")}
function dd(d){var x=d.data();x.id=d.id;return x}
function ago(t){var s=(Date.now()-t)/1000;return s<60?"baru saja":s<3600?Math.floor(s/60)+" mnt":s<86400?Math.floor(s/3600)+" jam":Math.floor(s/86400)+" hr"}
function img(s){return !!s&&String(s).indexOf("data:image/")===0}
var BADGE='<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px;margin-left:3px"><circle cx="12" cy="12" r="11" fill="#1d9bf0"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var BL=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
var BN={ali:"Alisha",nova:"Nova",ikh:"Ikhsan"};
var MC={ali:"#8a94c8",nova:"#ec5f86",ikh:"#4f7bff"};
var AC={ali:"#8e8e93",nova:"#e5343d",ikh:"#2f6fed"};
var MP={ali:"IMG-20260903-WA0074.jpg",nova:"IMG-20260903-WA0004.jpg",ikh:"IMG-20260901-WA0016.jpg"};
var uid=null,flag=false,PRF={},UN={},MA={},UM={},PL=[],PM={},st={},stLoaded=false,MED={},S={tab:"p"};
function nameOf(u){return (PRF[u]&&PRF[u].name)||"Fan"}
function avatar(u,s){
  var p=PRF[u]||{},c=AC[p.bias]||"#111";
  return '<div class="av" style="background:'+c+';width:'+s+'px;height:'+s+'px;font-size:'+Math.round(s*.4)+'px;overflow:hidden;flex:none">'+(img(p.photo)?'<img src="'+ea(p.photo)+'" style="width:100%;height:100%;object-fit:cover">':esc(nameOf(u).charAt(0).toUpperCase()))+'</div>'
}
function fmtDM(s){var m=/^(\d\d)-(\d\d)$/.exec(s||"");return m&&BL[+m[1]-1]?(+m[2])+" "+BL[+m[1]-1]:""}
function fmtFull(s){var m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(s||"");return m&&BL[+m[2]-1]?(+m[3])+" "+BL[+m[2]-1]+" "+m[1]:""}
function validBirth(s){
  if(!/^\d{4}-\d\d-\d\d$/.test(s||""))return false;
  var d=new Date(s+"T00:00:00Z");
  return !isNaN(d)&&d.getUTCFullYear()>=1930&&d.getTime()<=Date.now()&&d.toISOString().slice(0,10)===s
}
/* buka profil lewat handler yang sudah ada di social.js (#ib menangani [data-u]) */
function openProfile(u){var ib=$("ib");if(!ib||!u)return;var s=document.createElement("span");s.dataset.u=u;ib.appendChild(s);s.click();s.remove()}

/* ---------------- CSS ---------------- */
var css=document.createElement("style");
css.textContent=[
"body header{gap:6px}body header .bell,body header .hbtn{width:38px;height:38px}",
".hbtn{border:0;border-radius:50%;display:grid;place-items:center;background:var(--card,var(--soft));box-shadow:var(--shadow,none);color:var(--fg);cursor:pointer;flex:none}",
".hbtn svg{width:19px;height:19px;fill:none}",
"body .post.ap{box-shadow:inset 4px 0 0 var(--mc),var(--shadow);background:color-mix(in srgb,var(--mc) 7%,var(--card))}",
".aptag{display:inline-block;margin-left:6px;padding:0 7px;border-radius:99px;background:var(--mc,#7f95ff);color:#fff;font:700 10px/16px var(--ui,sans-serif);letter-spacing:.06em;vertical-align:2px}",
".ht{color:var(--brand-ink,#2f6fed);font-weight:600;cursor:pointer}",
"#srch{position:fixed;top:0;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:var(--bg);color:var(--fg);z-index:16;overflow-y:auto;padding:env(safe-area-inset-top,0px) 0 40px}",
"#srch.hide{display:none}#srch .ibt input{flex:1;min-width:0;margin:0}",
".stabs{display:flex;border-bottom:1px solid var(--line)}",
".stabs button{flex:1;border:0;background:none;color:var(--mute);font:600 14px inherit;font-family:inherit;padding:12px;cursor:pointer}",
".stabs button.on{color:var(--brand-ink,#2f6fed);box-shadow:inset 0 -2px 0 var(--brand,#7f95ff)}",
".sh2{font-size:12px;color:var(--mute);font-weight:600;padding:16px 18px 0}",
".htc{display:flex;flex-wrap:wrap;gap:8px;padding:10px 18px}",
".htc button{border:0;background:var(--soft);color:var(--brand-ink,#2f6fed);border-radius:99px;padding:7px 14px;font:600 13px inherit;font-family:inherit;cursor:pointer}",
".htc small{color:var(--mute);font-weight:600}",
".pinfo{margin:10px 16px 0;padding:4px 14px;border-radius:18px;background:var(--card);box-shadow:var(--shadow)}",
".pir{display:flex;gap:10px;align-items:center;padding:10px 0;font-size:14px;border-top:1px solid var(--line)}",
".pir:first-child{border-top:0}.pir span:first-child{width:22px;text-align:center}",
".pir em{margin-left:auto;font-style:normal;font-weight:600;text-align:right}",
".pir .pv{font-size:11px;color:var(--mute);font-weight:400;margin-left:6px}",
".pmg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:12px 16px}",
".pmg img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;cursor:pointer;display:block}",
".pmedia .ptabs~*:not(.pmg){display:none!important}",
".pmedia .ptabs button.on:not(.pmb){box-shadow:none;color:var(--mute)}",
"#pxf{margin-top:4px}#pxf label.pxs{display:flex;align-items:center;gap:10px;margin-top:14px;font-size:14px}",
"#pxf .pxs input{width:20px;height:20px;margin:0;flex:none}"
].join("");
document.head.appendChild(css);

/* ---------------- 1. POSTINGAN ARTIS ---------------- */
var pe=$("posts"),fcont=$("fl"),chips=$("fchips"),artistBtn=null,artistOn=false,AU=null,AL={list:[]};
function decoArtist(){
  [].forEach.call(document.querySelectorAll("#posts .post"),function(p){
    var l=p.querySelector(".like"),id=l&&l.dataset.id,u=id&&PM[id],k=u&&UM[u];if(!k)return;
    if(!p.classList.contains("ap")){p.classList.add("ap");p.style.setProperty("--mc",MC[k])}
    var nm=p.querySelector(".nm");
    if(nm&&!nm.querySelector(".aptag")){var t=document.createElement("span");t.className="aptag";t.textContent="ARTIS";nm.appendChild(t)}
  })
}
function acard(p){
  var k=UM[p.uid];if(!k)return"";
  var l=p.likes||[],on=l.indexOf(uid)>-1,id=ea(p.id),c=MC[k];
  return '<div class="post ap" style="--c:'+c+';--mc:'+c+'"><div class="who"><img src="'+MP[k]+'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:50% 20%;flex:none"><div><div class="nm">'+esc(BN[k])+BADGE+'<span class="aptag">ARTIS</span></div><div class="tm">'+ago(p.ts)+'</div></div></div>'
   +(p.text?'<div class="txt">'+esc(p.text)+'</div>':'')+(img(p.img)?'<img class="pim" src="'+ea(p.img)+'">':'')
   +'<div class="acts"><button class="like'+(on?" on":"")+'" data-fl="'+id+'" data-al="1">'+(on?"♥":"♡")+" "+l.length+'</button><button class="lb" data-cm="'+id+'">💬 '+Math.max(0,p.cc||0)+'</button></div></div>'
}
function drawArtist(){
  if(!artistOn)return;
  var h=AL.list.map(acard).join("");
  fcont.innerHTML=h||'<div class="empty">Belum ada postingan dari artis.</div>'
}
function loadArtist(){
  if(AU){AU();AU=null}
  var us=Object.keys(MA).map(function(k){return MA[k]}).filter(Boolean);
  if(!us.length){fcont.innerHTML='<div class="empty">Akun member belum diatur oleh admin.</div>';return}
  fcont.innerHTML='<div class="empty">Memuat…</div>';
  AU=db.collection("posts").where("uid","in",us).limit(60).onSnapshot(function(s){
    AL.list=s.docs.map(dd).sort(function(a,b){return b.ts-a.ts});drawArtist()
  },function(){if(artistOn)fcont.innerHTML='<div class="empty">Gagal memuat postingan artis.</div>'})
}
function showArtist(){
  var all=chips.querySelector('[data-f="all"]');if(all)all.click();
  artistOn=true;
  [].forEach.call(chips.querySelectorAll("button"),function(b){b.classList.toggle("on",b===artistBtn)});
  pe.style.display="none";fcont.classList.remove("hide");loadArtist()
}
function hideArtist(){artistOn=false;if(AU){AU();AU=null}if(artistBtn)artistBtn.classList.remove("on")}
if(chips&&pe&&fcont){
  artistBtn=document.createElement("button");artistBtn.dataset.af="1";artistBtn.style.setProperty("--c","#7f95ff");artistBtn.textContent="★ Artis";
  chips.insertBefore(artistBtn,chips.children[1]||null);
  /* capture: cegah handler lama feed.js (yang tidak mengenal chip ini) */
  chips.addEventListener("click",function(e){
    var b=e.target.closest("button");if(!b)return;
    if(b===artistBtn){e.stopPropagation();showArtist()}
    else if(artistOn)hideArtist()
  },true);
  fcont.addEventListener("click",function(e){
    var b=e.target.closest("[data-al]");if(!b||!artistOn)return;
    var id=b.dataset.fl,p=AL.list.filter(function(x){return x.id===id})[0];if(!p)return;
    var l=(p.likes||[]).slice(),i=l.indexOf(uid);if(i>-1)l.splice(i,1);else l.push(uid);p.likes=l;drawArtist();
    if(i===-1&&p.uid!==uid)db.doc("notifs/like_"+id+"_"+uid).set({to:p.uid,from:uid,type:"like",post:id,text:"",ts:Date.now(),read:false}).catch(noop);
    db.doc("posts/"+id).update({likes:i>-1?FV.arrayRemove(uid):FV.arrayUnion(uid)}).catch(noop)
  })
}

/* ---------------- 2. PENCARIAN + HASHTAG ---------------- */
var HRE=new RegExp("(^|[\\s(.,!?])#([\\p{L}\\p{N}_]{2,30})","gu");
function tagNode(n){
  var t=n.nodeValue;if(t.indexOf("#")<0)return;
  HRE.lastIndex=0;var m,last=0,fr=null;
  while((m=HRE.exec(t))){
    if(!fr)fr=document.createDocumentFragment();
    var s=m.index+m[1].length;
    fr.appendChild(document.createTextNode(t.slice(last,s)));
    var sp=document.createElement("span");sp.className="ht";sp.dataset.ht=m[2].toLowerCase();sp.textContent="#"+m[2];fr.appendChild(sp);
    last=s+1+m[2].length
  }
  if(fr){fr.appendChild(document.createTextNode(t.slice(last)));n.parentNode.replaceChild(fr,n)}
}
function linkTags(){
  [].forEach.call(document.querySelectorAll(".txt:not([data-hl])"),function(el){
    el.dataset.hl="1";
    [].slice.call(el.childNodes).forEach(function(n){if(n.nodeType===3)tagNode(n)})
  })
}
var so=document.createElement("div");so.id="srch";so.className="hide";
so.innerHTML='<div class="ibt"><button class="sbk" data-sc="1" aria-label="Kembali">‹</button><input id="sq" maxlength="40" autocomplete="off" placeholder="Cari postingan, #hashtag, atau pengguna…"></div><div class="stabs"><button data-st="p" class="on">Postingan</button><button data-st="u">Pengguna</button></div><div id="sres"></div>';
document.body.appendChild(so);
var hdr=document.querySelector("header"),sbtn=document.createElement("button");
sbtn.className="hbtn";sbtn.setAttribute("aria-label","Cari");
sbtn.innerHTML='<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
if(hdr)hdr.insertBefore(sbtn,hdr.querySelector(".hbtn")||hdr.querySelector(".bell"));
function setTabs(){[].forEach.call(so.querySelectorAll("[data-st]"),function(b){b.classList.toggle("on",b.dataset.st===S.tab)})}
function escRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
function findPosts(q){
  var ql=q.toLowerCase();
  if(ql.charAt(0)==="#"){
    var t=ql.slice(1);if(!t)return[];
    var re=new RegExp("(^|[\\s(.,!?])#"+escRe(t)+"(?![\\p{L}\\p{N}_])","iu");
    return PL.filter(function(p){return re.test(p.text||"")})
  }
  return PL.filter(function(p){return (p.text||"").toLowerCase().indexOf(ql)>-1||nameOf(p.uid).toLowerCase().indexOf(ql)>-1})
}
function rcard(p){
  var k=UM[p.uid];
  return '<div class="post'+(k?" ap":"")+'" style="--mc:'+(k?MC[k]:"transparent")+'"><div class="who" data-pu="'+ea(p.uid)+'" style="cursor:pointer">'+avatar(p.uid,36)+'<div><div class="nm">'+esc(nameOf(p.uid))+(k?BADGE+'<span class="aptag">ARTIS</span>':'')+'</div><div class="tm">'+ago(p.ts)+'</div></div></div>'
   +(p.text?'<div class="txt">'+esc(p.text)+'</div>':'')+(img(p.img)?'<img class="pim" src="'+ea(p.img)+'">':'')
   +'<div class="tm" style="margin-top:6px">♥ '+((p.likes||[]).length)+' · 💬 '+Math.max(0,p.cc||0)+'</div></div>'
}
function trending(){
  var c={};
  PL.forEach(function(p){var m,re=new RegExp(HRE.source,"gu");while((m=re.exec(p.text||""))){var k=m[2].toLowerCase();c[k]=(c[k]||0)+1}});
  var ks=Object.keys(c).sort(function(a,b){return c[b]-c[a]}).slice(0,12);
  return ks.length?'<div class="sh2">Hashtag terbaru</div><div class="htc">'+ks.map(function(k){return '<button data-q="#'+ea(k)+'">#'+esc(k)+' <small>'+c[k]+'</small></button>'}).join("")+'</div>':'<div class="empty">Belum ada hashtag. Tulis #sesuatu di postinganmu untuk memulai.</div>'
}
function drawSearch(){
  var q=$("sq").value.trim(),h="";
  if(S.tab==="p"){
    if(!q)h=trending();
    else{
      var r=findPosts(q);
      h=(r.length?r.map(rcard).join(""):'<div class="empty">Tidak ada postingan yang cocok.</div>')+'<div class="tm" style="text-align:center;padding:10px 18px">Mencari di '+PL.length+' postingan terbaru.</div>'
    }
  }else{
    var q2=q.toLowerCase().replace(/^@/,"");
    if(!q2)h='<div class="empty">Ketik nama atau username untuk mencari pengguna.</div>';
    else{
      var ids=Object.keys(PRF).filter(function(k){var p=PRF[k];return (p.name||"").toLowerCase().indexOf(q2)>-1||(p.username||"").toLowerCase().indexOf(q2)>-1}).sort(function(a,b){return nameOf(a).localeCompare(nameOf(b))}).slice(0,50);
      h=ids.length?ids.map(function(k){var p=PRF[k];return '<div class="dsr" data-pu="'+ea(k)+'">'+avatar(k,40)+'<div style="min-width:0"><div class="nm">'+esc(p.name||"Fan")+(UM[k]?BADGE:"")+'</div><div class="tm">@'+esc(p.username||"")+(BN[p.bias]?' · bias '+BN[p.bias]:'')+'</div></div></div>'}).join(""):'<div class="empty">Tidak ada pengguna yang cocok.</div>'
    }
  }
  $("sres").innerHTML=h
}
function openSearch(q,raise){
  so.style.zIndex=raise?21:16;S.tab="p";so.classList.remove("hide");so.scrollTop=0;
  $("sq").value=q||"";setTabs();drawSearch()
}
sbtn.onclick=function(){openSearch("",false);$("sq").focus()};
so.addEventListener("click",function(e){
  if(e.target.closest("[data-sc]")){so.classList.add("hide");return}
  var t=e.target.closest("[data-st]");if(t){S.tab=t.dataset.st;setTabs();drawSearch();return}
  var q=e.target.closest("[data-q]");if(q){$("sq").value=q.dataset.q;drawSearch();return}
  var u=e.target.closest("[data-pu]");if(u){so.style.zIndex=16;openProfile(u.dataset.pu)}
});
so.addEventListener("input",function(e){if(e.target.id==="sq")drawSearch()});
document.addEventListener("click",function(e){
  var h=e.target.closest(".ht");if(!h)return;
  e.preventDefault();
  if(h.closest("#srch")){S.tab="p";$("sq").value="#"+h.dataset.ht;setTabs();drawSearch();so.scrollTop=0}
  else openSearch("#"+h.dataset.ht,!!h.closest(".ov2,#stp"))
});

/* ---------------- 3. PROFIL LENGKAP ---------------- */
var su=$("setup"),dn=$("done"),pending=null,wasVis=su?!su.classList.contains("hide"):false;
if(su&&dn){
  var box=document.createElement("div");box.id="pxf";
  box.innerHTML='<label>Tanggal lahir (opsional)</label><input type="date" id="pbd" min="1930-01-01"><label>Lokasi (opsional)</label><input id="ploc" maxlength="40" placeholder="mis. Jakarta, Indonesia"><label class="pxs"><input type="checkbox" id="pshow"> Tampilkan di profil publik</label><div class="tm" style="margin-top:6px">Yang tampil ke orang lain hanya tanggal dan bulan lahir, tanpa tahun. Tahun lahirmu tetap privat.</div>';
  su.insertBefore(box,dn);
  $("pbd").max=new Date().toISOString().slice(0,10);
  dn.addEventListener("click",function(){
    if(!stLoaded)return;
    var b=$("pbd").value;if(!validBirth(b))b="";
    pending={birth:b,loc:$("ploc").value.trim().slice(0,40),show:$("pshow").checked,t:Date.now()}
  });
  document.addEventListener("click",function(e){if(e.target.closest("#cancel"))pending=null},true);
  new MutationObserver(function(){
    var vis=!su.classList.contains("hide");
    if(vis&&!wasVis){$("pbd").value=st.birth||"";$("ploc").value=st.loc||"";$("pshow").checked=!!st.pshow}
    if(!vis&&wasVis)flush();
    wasVis=vis
  }).observe(su,{attributes:true,attributeFilter:["class"]})
}
/* app.js menyimpan profil dengan set() penuh, jadi kolom tambahan ditulis ulang setelah simpan sukses */
function flush(){
  var p=pending;pending=null;
  if(!p||!uid||Date.now()-p.t>120000)return;
  db.doc("profiles/"+uid).set({bdm:p.show&&p.birth?p.birth.slice(5):"",loc:p.show?p.loc:"",pshow:!!p.show},{merge:true}).catch(noop);
  db.doc("usersettings/"+uid).set({birth:p.birth||"",loc:p.loc||"",pshow:!!p.show},{merge:true}).catch(noop)
}
function userOfProf(prof){var t=prof.querySelector(".tm"),m=t&&/^@(\S+)/.exec(t.textContent||"");return m?UN[m[1].toLowerCase()]:null}
function infoHtml(u){
  var p=PRF[u]||{},mine=u===uid,bd="",lc="",priv=false;
  if(mine){bd=fmtFull(st.birth);lc=st.loc||"";priv=!st.pshow}
  else if(p.pshow){bd=fmtDM(p.bdm);lc=p.loc||""}
  if(!bd&&!lc)return"";
  var tag=priv?'<span class="pv">🔒 hanya kamu</span>':"";
  return (bd?'<div class="pir"><span>🎂</span>Tanggal lahir<em>'+esc(bd)+tag+'</em></div>':'')+(lc?'<div class="pir"><span>📍</span>Lokasi<em>'+esc(lc)+(bd?'':tag)+'</em></div>':'')
}
function injectInfo(){
  [].forEach.call(document.querySelectorAll(".pfs"),function(pfs){
    var prev=pfs.previousElementSibling,box=null,prof=prev;
    if(prev&&prev.classList.contains("pinfo")){box=prev;prof=prev.previousElementSibling}
    if(!prof||!prof.classList.contains("prof"))return;
    var u=userOfProf(prof),h=u?infoHtml(u):"";
    if(!h){if(box)box.remove();return}
    if(!box){box=document.createElement("div");box.className="pinfo";pfs.parentNode.insertBefore(box,pfs)}
    if(box.dataset.sig!==h){box.dataset.sig=h;box.innerHTML=h}
  })
}
/* tab Media di profil */
function renderMedia(el){
  var prof=el.querySelector(".prof"),u=prof&&userOfProf(prof),g=el.querySelector(".pmg");
  if(!g){g=document.createElement("div");g.className="pmg";el.appendChild(g)}
  var list=u&&MED[u];
  g.innerHTML=!list?'<div class="empty" style="grid-column:1/-1">Memuat…</div>':list.length?list.map(function(p){return '<img src="'+ea(p.img)+'" alt="">'}).join(""):'<div class="empty" style="grid-column:1/-1">Belum ada foto.</div>'
}
function loadMedia(el){
  var prof=el.querySelector(".prof"),u=prof&&userOfProf(prof);if(!u)return;
  el.dataset.pmu=u;renderMedia(el);
  db.collection("posts").where("uid","==",u).limit(60).get().then(function(s){
    MED[u]=s.docs.map(dd).filter(function(p){return img(p.img)}).sort(function(a,b){return b.ts-a.ts});
    if(el.classList.contains("pmedia"))renderMedia(el)
  },function(){MED[u]=[];if(el.classList.contains("pmedia"))renderMedia(el)})
}
function injectMedia(){
  [].forEach.call(document.querySelectorAll(".ptabs"),function(tabs){
    if(tabs.querySelector(".pmb"))return;
    var el=tabs.parentElement;if(!el)return;
    var b=document.createElement("button");b.className="pmb";b.textContent="Media";tabs.appendChild(b);
    var prof=el.querySelector(".prof"),u=prof&&userOfProf(prof);
    if(el.classList.contains("pmedia")&&el.dataset.pmu===u){b.classList.add("on");renderMedia(el)}
    else el.classList.remove("pmedia")
  })
}
function bigPic(src){
  var v=$("sv");if(!v)return;
  v.style.background="#000 url("+src+") center/contain no-repeat";v.innerHTML="";v.classList.remove("hide");v.onclick=function(){v.classList.add("hide")}
}
/* capture: jalan sebelum handler tab bawaan yang merender ulang profil */
document.addEventListener("click",function(e){
  var pm=e.target.closest(".pmb");
  if(pm){
    var tabs=pm.parentElement,el=tabs.parentElement;
    el.classList.add("pmedia");
    [].forEach.call(tabs.children,function(x){x.classList.toggle("on",x===pm)});
    loadMedia(el);return
  }
  var t=e.target.closest(".ptabs button");
  if(t){var el2=t.closest(".ptabs").parentElement;el2.classList.remove("pmedia");var g=el2.querySelector(".pmg");if(g)g.remove();return}
  var im=e.target.closest(".pmg img");if(im&&img(im.getAttribute("src")))bigPic(im.getAttribute("src"))
},true);

/* ---------------- loop ringan ---------------- */
var raf=0;
function tick(){
  if(raf)return;
  raf=requestAnimationFrame(function(){raf=0;try{linkTags();decoArtist();injectInfo();injectMedia()}catch(e){}})
}
new MutationObserver(tick).observe(document.body,{childList:true,subtree:true});

fa.onAuthStateChanged(function(u){
  uid=u?u.uid:null;if(!u||flag)return;flag=true;
  db.collection("profiles").onSnapshot(function(s){
    PRF={};UN={};
    s.docs.forEach(function(d){var x=d.data();PRF[d.id]=x;if(x.username)UN[String(x.username).toLowerCase()]=d.id});
    tick()
  },noop);
  db.collection("memberacct").onSnapshot(function(s){
    MA={};UM={};
    s.docs.forEach(function(d){var x=d.data();MA[d.id]=x.uid;if(x.uid)UM[x.uid]=d.id});
    tick();if(artistOn)loadArtist()
  },noop);
  db.collection("posts").orderBy("ts","desc").limit(50).onSnapshot(function(s){
    PL=s.docs.map(dd);PM={};PL.forEach(function(p){PM[p.id]=p.uid});
    tick();if(!so.classList.contains("hide"))drawSearch()
  },noop);
  db.doc("usersettings/"+uid).onSnapshot(function(d){st=d.exists?d.data():{};stLoaded=true;tick()},noop)
});
})();

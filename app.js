(function(){
var $=function(i){return document.getElementById(i)};
var B={ali:{n:"Alisha",c:"#8e8e93"},nova:{n:"Nova",c:"#e5343d"},ikh:{n:"Ikhsan",c:"#2f6fed"}};
var fa,db,uid,P={},posts=[],chats=[],stories=[],live=null,lchats=[],pick="",isAdmin=false,banned=false,reports=[],V={},reacts=[],firstReact=true,lastReact=0,canLive=false,notifs=[],comments=[],curPost=null,unsubC=null,stream=null,timer=null,frame="",pimg="",simg="",pphoto=null,tab="home",authed=false,editing=false,ready=false;
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function ago(t){var s=(Date.now()-t)/1000;return s<60?"baru saja":s<3600?Math.floor(s/60)+" mnt":s<86400?Math.floor(s/3600)+" jam":Math.floor(s/86400)+" hr"}
function nid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function col(u){var p=P[u];return p&&B[p.bias]?B[p.bias].c:"#111"}
function nm(u){return P[u]?P[u].name:"Fan"}
function av(u,s){var p=P[u],h=p&&p.photo&&String(p.photo).indexOf("data:image/")===0;return '<div class="av" style="background:'+col(u)+';width:'+s+'px;height:'+s+'px;font-size:'+Math.round(s*.4)+'px;overflow:hidden">'+(h?'<img src="'+p.photo+'" style="width:100%;height:100%;object-fit:cover">':esc(nm(u).charAt(0).toUpperCase()))+'</div>'}
function show(id){["gate","auth","setup","app"].forEach(function(x){$(x).classList.toggle("hide",x!==id)})}
function put(path,d){return db.doc(path).set(d).catch(function(){alert("Gagal menyimpan. Coba lagi.")})}
function me(){return P[uid]}
var cssEl=document.createElement("style");cssEl.textContent=".acts{display:flex;gap:16px;align-items:center}.lb{border:0;background:none;color:var(--mute);font:inherit;font-size:13px;padding:6px 0 0;cursor:pointer}.lb.d{color:#e5343d}.x{color:var(--mute);cursor:pointer;margin-left:8px;font-size:12px}.rep{padding:12px 0;border-top:1px solid var(--line);font-size:13px}";document.head.appendChild(cssEl);
function del(path){return db.doc(path).delete().catch(function(){alert("Gagal menghapus.")})}
function ban(u){if(!u||u===uid)return;if(confirm("Blokir pengguna ini? Mereka tidak bisa lagi memakai HISYNC."))put("bans/"+u,{ts:Date.now(),by:uid})}
function postActs(p){var h="",i=esc(p.id);if(p.uid===uid||isAdmin)h+='<button class="lb d" data-act="del" data-id="'+i+'">Hapus</button>';if(p.uid!==uid)h+='<button class="lb" data-act="rep" data-id="'+i+'">Laporkan</button>';if(isAdmin&&p.uid!==uid)h+='<button class="lb d" data-act="ban" data-id="'+i+'">Blokir</button>';return h}
function postAct(act,id){var p=posts.filter(function(x){return x.id===id})[0];if(!p)return;
  if(act==="del"){if(confirm("Hapus postingan ini?"))del("posts/"+id)}
  else if(act==="ban")ban(p.uid);
  else if(act==="cm")openCm(id);
  else if(act==="rep"){var r=prompt("Alasan laporan (mis. spam, kasar, tidak pantas):");if(r===null)return;db.doc("reports/"+id+"_"+uid).set({target:"posts/"+id,author:p.uid,by:uid,text:String(p.text||"").slice(0,100),reason:r.slice(0,100),ts:Date.now()}).then(function(){alert("Terima kasih, laporanmu sudah dikirim ke admin.")}).catch(function(){alert("Gagal mengirim laporan.")})}
}
function repHtml(){if(!isAdmin)return"";return '<div class="card"><div class="nm" style="font-size:16px">Laporan ('+reports.length+')</div>'+(reports.length?reports.map(function(r){var i=esc(r.id);return '<div class="rep"><b>'+esc(nm(r.author))+'</b>: '+esc(r.text)+'<br><span class="tm">Dilaporkan '+esc(nm(r.by))+' · '+esc(r.reason||"-")+'</span><div class="acts"><button class="lb d" data-ra="del" data-rid="'+i+'">Hapus konten</button><button class="lb d" data-ra="ban" data-rid="'+i+'">Blokir</button><button class="lb" data-ra="ign" data-rid="'+i+'">Abaikan</button></div></div>'}).join(""):'<div class="tm" style="margin-top:6px">Tidak ada laporan.</div>')+'</div>'}
function repAct(a,id){var r=reports.filter(function(x){return x.id===id})[0];if(!r)return;
  if(a==="del"){del(r.target);del("reports/"+id)}
  else if(a==="ban"){if(r.author===uid)return;if(confirm("Blokir pengguna ini dan hapus kontennya?")){put("bans/"+r.author,{ts:Date.now(),by:uid});del(r.target);del("reports/"+id)}}
  else del("reports/"+id)
}
function modClick(e){var r=e.target.closest("[data-e]");if(r){react(r.dataset.e);return}var x=e.target.closest("[data-cdel]");if(x){if(confirm("Hapus pesan ini?"))del(x.dataset.cdel);return}var b=e.target.closest("[data-cban]");if(b)ban(b.dataset.cban)}
var ncss=document.createElement("style");ncss.textContent=".bell{border:0;background:var(--soft);color:var(--fg);border-radius:99px;padding:6px 12px;font-size:15px;cursor:pointer;position:relative}.bell i{position:absolute;top:-4px;right:-4px;background:#e5343d;color:#fff;font:700 10px/16px sans-serif;min-width:16px;height:16px;border-radius:99px;text-align:center;font-style:normal}.ov{position:fixed;inset:0;background:#0007;z-index:15;display:flex;align-items:flex-end}.ov .sheet{max-height:80vh;overflow:auto}.cmt{padding:8px 0;border-top:1px solid var(--line);font-size:14px}.cmt b{font-size:13px}.nti{padding:10px 0;border-top:1px solid var(--line);font-size:14px;cursor:pointer}.nti.u{font-weight:600}.cin{display:flex;gap:8px;margin-top:10px}.cin button{border:0;background:var(--acc);color:#fff;border-radius:12px;padding:0 16px;font:600 14px inherit;font-family:inherit;cursor:pointer}";ncss.textContent+=".fl{position:fixed;bottom:130px;font-size:28px;z-index:30;pointer-events:none;animation:flup 2.2s ease-out forwards}@keyframes flup{from{transform:translateY(0);opacity:1}to{transform:translateY(-260px);opacity:0}}.rbar{display:flex;gap:8px;padding:10px 18px;flex-wrap:wrap}.rb{border:1px solid var(--line);background:var(--soft);border-radius:99px;padding:6px 12px;font:600 14px inherit;font-family:inherit;cursor:pointer;color:var(--fg)}";document.head.appendChild(ncss);
var cmEl=document.createElement("div");cmEl.className="ov hide";cmEl.innerHTML='<div class="sheet"><b>Komentar</b><div id="cml"></div><div class="cin"><input id="cmi" maxlength="200" placeholder="Tulis komentar…"><button id="cmb">Kirim</button></div><button class="btn ghost" id="cmx">Tutup</button></div>';document.body.appendChild(cmEl);
var ntEl=document.createElement("div");ntEl.className="ov hide";ntEl.innerHTML='<div class="sheet"><b>Notifikasi</b><div id="ntl"></div><button class="btn ghost" id="ntx">Tutup</button></div>';document.body.appendChild(ntEl);
var bell=document.createElement("button");bell.className="bell";bell.innerHTML='🔔<i class="hide" id="nbd"></i>';document.querySelector("header").appendChild(bell);
function notify(p,type,text,id){if(!p||p.uid===uid)return;db.doc("notifs/"+(id||nid())).set({to:p.uid,from:uid,type:type,post:p.id,text:String(text||"").slice(0,60),ts:Date.now(),read:false}).catch(function(){})}
function renderCm(){$("cml").innerHTML=comments.length?comments.map(function(c){return '<div class="cmt"><b style="color:'+col(c.uid)+'">'+esc(nm(c.uid))+vb(c.uid)+'</b> <span class="tm">'+ago(c.ts)+'</span>'+(c.uid===uid||isAdmin?' <span class="x" data-cd="'+esc(c.id)+'">✕</span>':'')+'<div class="txt">'+esc(c.text)+'</div></div>'}).join(""):'<div class="empty">Belum ada komentar. Tulis yang pertama!</div>'}
function openCm(id){var p=posts.filter(function(x){return x.id===id})[0];if(!p)return;curPost=p;comments=[];cmEl.classList.remove("hide");renderCm();if(unsubC)unsubC();
  unsubC=db.collection("posts/"+id+"/comments").orderBy("ts","asc").limit(100).onSnapshot(function(s){comments=s.docs.map(function(d){var x=d.data();x.id=d.id;return x});renderCm()},function(){})}
function closeCm(){if(unsubC)unsubC();unsubC=null;curPost=null;cmEl.classList.add("hide")}
function sendCm(){var t=$("cmi").value.trim();if(!t||!curPost)return;var p=curPost;$("cmi").value="";
  db.doc("posts/"+p.id+"/comments/"+nid()).set({text:t,uid:uid,ts:Date.now()}).then(function(){db.doc("posts/"+p.id).update({cc:firebase.firestore.FieldValue.increment(1)}).catch(function(){});notify(p,"comment",t)}).catch(function(){alert("Gagal mengirim komentar.")})}
$("cmb").onclick=sendCm;$("cmi").onkeydown=function(e){if(e.key==="Enter")sendCm()};$("cmx").onclick=closeCm;
$("cml").onclick=function(e){var x=e.target.closest("[data-cd]");if(x&&curPost&&confirm("Hapus komentar ini?")){var pid=curPost.id;db.doc("posts/"+pid+"/comments/"+x.dataset.cd).delete().then(function(){db.doc("posts/"+pid).update({cc:firebase.firestore.FieldValue.increment(-1)}).catch(function(){})}).catch(function(){alert("Gagal menghapus.")})}};
function renderNt(){$("ntl").innerHTML=notifs.length?notifs.map(function(n){return '<div class="nti'+(n.read?"":" u")+'" data-p="'+esc(n.post)+'">'+(n.read?"":"● ")+esc(nm(n.from))+vb(n.from)+(n.type==="like"?" menyukai postinganmu":' mengomentari: "'+esc(n.text)+'"')+' <span class="tm">'+ago(n.ts)+'</span></div>'}).join(""):'<div class="empty">Belum ada notifikasi.</div>'}
function renderBell(){var c=notifs.filter(function(n){return !n.read}).length,b=$("nbd");b.textContent=c>9?"9+":c;b.classList.toggle("hide",!c);if(!ntEl.classList.contains("hide"))renderNt()}
function closeNt(){ntEl.classList.add("hide");notifs.forEach(function(n){if(!n.read)db.doc("notifs/"+n.id).update({read:true}).catch(function(){})})}
bell.onclick=function(){renderNt();ntEl.classList.remove("hide")};
$("ntx").onclick=closeNt;$("ntl").onclick=function(e){var i=e.target.closest("[data-p]");if(i){var id=i.dataset.p;closeNt();openCm(id)}};
var BADGE='<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px;margin-left:3px"><circle cx="12" cy="12" r="11" fill="#1d9bf0"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function vb(u){return V[u]?BADGE:""}
var D=864e5;
function fmtW(ms){var h=Math.ceil(ms/36e5);return h>=24?Math.ceil(h/24)+" hari":h+" jam"}
function nameLog(p){var n=Date.now();return(p.nameLog||[]).filter(function(t){return n-t<7*D})}
function nameLock(p){var l=nameLog(p);return l.length>=2?Math.min.apply(null,l)+7*D-Date.now():0}
function unLock(p){var r=(p.unAt||0)+14*D-Date.now();return r>0?r:0}
function biasLock(p){var r=(p.biasAt||0)+7*D-Date.now();return r>0?r:0}
var ef=document.createElement("div");ef.id="ef";ef.className="hide";ef.innerHTML='<label>Nama tampilan</label><input id="en" maxlength="24"><div class="tm" id="enh" style="margin-top:4px"></div><label>Username</label><input id="eu" maxlength="20"><div class="tm" id="euh" style="margin-top:4px"></div>';
var l1=$("setup").querySelector("label");l1.parentNode.insertBefore(ef,l1);
var bh=document.createElement("div");bh.className="tm";bh.id="bh";bh.style.marginTop="8px";$("bias").parentNode.insertBefore(bh,$("bias").nextSibling);
function setHints(isEdit){var p=me();ef.classList.toggle("hide",!(isEdit&&p));if(!(isEdit&&p)){bh.textContent="";return}
  var nl=nameLock(p),ul=unLock(p),bl=biasLock(p);
  $("en").disabled=!!nl;$("eu").disabled=!!ul;
  $("enh").textContent=nl?"Nama sudah diganti 2× minggu ini. Bisa lagi dalam "+fmtW(nl):"Sisa ganti nama minggu ini: "+(2-nameLog(p).length)+"×";
  $("euh").textContent=ul?"Username bisa diganti lagi dalam "+fmtW(ul):"Username bisa diganti 1× tiap 14 hari";
  bh.textContent=bl?"Bias bisa diganti lagi dalam "+fmtW(bl):"Bias bisa diganti 1× seminggu"}
var EMO=["❤️","😍","👏","🔥","😂"];
function renderRc(){var el=$("rbar");if(!el||!live)return;var c={};reacts.forEach(function(r){if(r.live===live.ts)c[r.e]=(c[r.e]||0)+1});el.innerHTML=EMO.map(function(e){return '<button class="rb" data-e="'+e+'">'+e+' <span>'+(c[e]||0)+'</span></button>'}).join("")}
function floatE(e){var s=document.createElement("span");s.className="fl";s.textContent=e;s.style.left=(15+Math.random()*65)+"%";document.body.appendChild(s);setTimeout(function(){s.remove()},2200)}
function react(e){if(!live||!live.active||Date.now()-lastReact<400)return;lastReact=Date.now();floatE(e);db.doc("livereact/"+nid()).set({e:e,uid:uid,ts:Date.now(),live:live.ts}).catch(function(){})}
var MP={ali:"IMG-20260903-WA0074.jpg",nova:"IMG-20260903-WA0004.jpg",ikh:"IMG-20260901-WA0016.jpg"};
function shrink(f,m,q,sq){return new Promise(function(ok){var r=new FileReader();r.onload=function(){var i=new Image();i.onload=function(){var c=document.createElement("canvas"),x=c.getContext("2d");if(sq){var s=Math.min(i.width,i.height);c.width=c.height=m;x.drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,0,0,m,m)}else{var k=Math.min(1,m/Math.max(i.width,i.height));c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);x.drawImage(i,0,0,c.width,c.height)}ok(c.toDataURL("image/jpeg",q))};i.src=r.result};r.readAsDataURL(f)})}
function pick1(cam,cb){var f=$(cam?"fc":"fg");f.value="";f.onchange=function(){if(f.files[0])cb(f.files[0])};f.click()}
function drawPP(){var b=me()||editing||{},ph=pphoto!==null?pphoto:(b.photo||""),c=pick&&B[pick]?B[pick].c:"#bbb";$("ppv2").innerHTML=ph?'<img class="mp" style="outline-color:'+c+'" src="'+ph+'">':'<div class="mp av" style="background:'+c+';font-size:26px">'+esc((b.name||"?").charAt(0).toUpperCase())+'</div>'}
function setPP(cam){pick1(cam,function(f){shrink(f,160,.72,true).then(function(d){pphoto=d;drawPP()})})}
$("ppg").onclick=function(){setPP(0)};$("ppc").onclick=function(){setPP(1)};
function startCam(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){alert("Kamera tidak tersedia di browser ini.");return}
  navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false}).then(function(s){
    stream=s;if($("lv"))$("lv").srcObject=s;
    timer=setInterval(function(){var v=$("lv");if(!v||!v.videoWidth)return;var c=document.createElement("canvas");c.width=240;c.height=Math.round(240*v.videoHeight/v.videoWidth);c.getContext("2d").drawImage(v,0,0,c.width,c.height);db.doc("live/frame").set({img:c.toDataURL("image/jpeg",.5),ts:Date.now()}).catch(function(){})},4000)
  }).catch(function(){alert("Kamera tidak bisa diakses. Izinkan akses kamera di browser, lalu coba lagi.")})
}
function stopCam(){if(timer)clearInterval(timer);timer=null;if(stream)stream.getTracks().forEach(function(t){t.stop()});stream=null}

/* AUTH */
var EM={"auth/invalid-credential":"Email atau password salah.","auth/wrong-password":"Email atau password salah.","auth/user-not-found":"Akun tidak ditemukan.","auth/email-already-in-use":"Email sudah terdaftar, silakan masuk.","auth/weak-password":"Password minimal 6 karakter.","auth/invalid-email":"Format email tidak valid.","auth/invalid-phone-number":"Nomor tidak valid. Contoh: +62812xxxxxxx","auth/invalid-verification-code":"Kode salah.","auth/too-many-requests":"Terlalu banyak percobaan, coba lagi nanti.","auth/popup-closed-by-user":""};
function aerr(m){$("aerr").textContent=m||""}
function fail(e){aerr(EM[e.code]!==undefined?EM[e.code]:(e.message||"Terjadi kesalahan."))}
function social(p){fa.signInWithPopup(p).catch(function(e){if(e.code==="auth/popup-blocked")fa.signInWithRedirect(p);else fail(e)})}
$("bg").onclick=function(){aerr();social(new firebase.auth.GoogleAuthProvider())};
$("bf").onclick=function(){aerr();social(new firebase.auth.FacebookAuthProvider())};
$("bin").onclick=function(){aerr();fa.signInWithEmailAndPassword($("em").value.trim(),$("pw").value).catch(fail)};
$("bup").onclick=function(){aerr();fa.createUserWithEmailAndPassword($("em").value.trim(),$("pw").value).catch(fail)};
$("bfp").onclick=function(){var e=$("em").value.trim();if(!e){aerr("Isi email dulu.");return}fa.sendPasswordResetEmail(e).then(function(){aerr("Link reset password dikirim ke emailmu.")}).catch(fail)};
var conf=null,rv=null;
$("bsms").onclick=function(){aerr();var n=$("ph").value.replace(/[\s-]/g,"");if(n.charAt(0)==="0")n="+62"+n.slice(1);
  if(!rv)rv=new firebase.auth.RecaptchaVerifier("rc",{size:"invisible"});
  fa.signInWithPhoneNumber(n,rv).then(function(c){conf=c;$("cdw").classList.remove("hide");aerr("Kode dikirim lewat SMS.")}).catch(function(e){fail(e);try{rv.clear()}catch(x){}rv=null})};
$("bcode").onclick=function(){if(conf)conf.confirm($("cd").value.trim()).catch(fail)};
$("fsout").onclick=function(){fa.signOut().then(function(){location.reload()})};
$("signup").onclick=function(){
  var n=$("sn").value.trim(),u=$("su").value.trim().toLowerCase();
  if(!n||!/^[a-z0-9_.]{3,20}$/.test(u)){aerr("Isi nama, dan username 3–20 huruf/angka/_ tanpa spasi.");return}
  for(var k in P){if(P[k].username===u&&k!==uid){aerr("Username sudah dipakai.");return}}
  pick="";pphoto=null;$("bio").value="";editing={name:n,username:u};openSetup(false)
};
function openSetup(isEdit){setHints(isEdit);
  $("stt").textContent=isEdit?"Edit profil":"Lengkapi profilmu";$("cancel").classList.toggle("hide",!isEdit);
  $("bias").innerHTML=Object.keys(B).map(function(k){return '<button data-k="'+k+'" style="--c:'+B[k].c+'" class="'+(pick===k?"on":"")+'"><img src="'+MP[k]+'" style="width:46px;height:46px;border-radius:50%;object-fit:cover;object-position:50% 20%;display:block;margin:0 auto 6px;outline:2px solid '+B[k].c+'">'+B[k].n+'</button>'}).join("");
  drawPP();show("setup")
}
$("bias").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(me()&&b.dataset.k!==me().bias&&biasLock(me())){alert("Bias bisa diganti lagi dalam "+fmtW(biasLock(me()))+".");return}pick=b.dataset.k;openSetup(!$("cancel").classList.contains("hide"))};
$("cancel").onclick=function(){editing=false;route()};
$("done").onclick=function(){
  if(!pick){alert("Pilih bias dulu ya 🤍");return}
  var base=me()||editing||{};
  var o={name:base.name,username:base.username,bio:$("bio").value.trim(),bias:pick,photo:pphoto!==null?pphoto:(base.photo||""),ts:base.ts||Date.now()},p=me();
  if(p){var now=Date.now(),nn=$("en").value.trim().slice(0,24),uu=$("eu").value.trim().toLowerCase();
    o.nameLog=nameLog(p);o.unAt=p.unAt||0;o.biasAt=p.biasAt||0;
    if(!nn){alert("Nama tampilan tidak boleh kosong.");return}
    if(nn!==p.name){if(nameLock(p)){alert("Nama sudah diganti 2× minggu ini. Bisa lagi dalam "+fmtW(nameLock(p))+".");return}o.name=nn;o.nameLog.push(now)}
    if(uu!==p.username){if(unLock(p)){alert("Username baru bisa diganti lagi dalam "+fmtW(unLock(p))+".");return}
      if(!/^[a-z0-9_.]{3,20}$/.test(uu)){alert("Username 3–20 huruf/angka/_ tanpa spasi.");return}
      for(var k in P){if(P[k].username===uu&&k!==uid){alert("Username sudah dipakai.");return}}
      o.username=uu;o.unAt=now}
    if(pick!==p.bias){if(biasLock(p)){alert("Bias bisa diganti lagi dalam "+fmtW(biasLock(p))+".");return}o.biasAt=now}}
  put("profiles/"+uid,o).then(function(){authed=true;editing=false;route()})
};

/* ROUTING */
function route(){
  if(!ready)return;
  if(!authed){show("auth");return}
  if(editing)return;
  if(!me()){var dn=fa&&fa.currentUser&&fa.currentUser.displayName;if(dn&&!$("sn").value)$("sn").value=dn.slice(0,24);$("fm").classList.add("hide");$("fs").classList.remove("hide");show("auth");return}
  if(editing)return;
  document.documentElement.style.setProperty("--acc",col(uid));
  $("hi").textContent="Hai, "+me().name;
  show("app");renderAll()
}
nav.onclick=function(e){
  var b=e.target.closest("button");if(!b)return;tab=b.dataset.t;
  [].forEach.call(nav.querySelectorAll("button"),function(x){x.classList.toggle("on",x===b)});
  ["home","chat","live","mem","me"].forEach(function(t){$("v-"+t).classList.toggle("hide",t!==tab)});
  if(tab==="chat")setTimeout(function(){scrollTo(0,document.body.scrollHeight)},30)
};

/* RENDER */
function renderStories(){
  var cut=Date.now()-864e5,list=stories.filter(function(s){return s.ts>cut});
  $("stories").innerHTML='<div class="st" id="addst"><div class="av" style="background:var(--soft);color:var(--fg);outline-color:var(--line)">+</div>Story</div>'+
  list.map(function(s){return '<div class="st" data-id="'+esc(s.id)+'" style="--c:'+col(s.uid)+'">'+av(s.uid,54)+esc(nm(s.uid))+'</div>'}).join("");
  $("addst").onclick=function(){simg="";$("stx").value="";$("spv").innerHTML="";$("sh").classList.remove("hide")};
  [].forEach.call($("stories").querySelectorAll("[data-id]"),function(el){el.onclick=function(){
    var s=stories.filter(function(x){return x.id===el.dataset.id})[0];if(!s)return;
    var v=$("sv");v.style.background=s.img&&String(s.img).indexOf("data:image/")===0?'#000 url('+s.img+') center/cover':col(s.uid);v.innerHTML='<small>'+esc(nm(s.uid))+vb(s.uid)+' · '+ago(s.ts)+'</small>'+esc(s.text)+((s.uid===uid||isAdmin)?'<button class="btn ghost" id="sdel" style="position:absolute;bottom:40px;width:auto;padding:10px 20px">Hapus story</button>':'');var sd=$("sdel");if(sd)sd.onclick=function(ev){ev.stopPropagation();if(confirm("Hapus story ini?")){del("stories/"+s.id);v.classList.add("hide")}};v.classList.remove("hide");v.onclick=function(){v.classList.add("hide")}}})
}
function renderPosts(){
  $("posts").innerHTML=posts.length?posts.map(function(p){
    var l=p.likes||[],on=l.indexOf(uid)>-1;
    return '<div class="post" style="--c:'+col(p.uid)+'"><div class="who">'+av(p.uid,36)+'<div><div class="nm">'+esc(nm(p.uid))+vb(p.uid)+'</div><div class="tm">'+ago(p.ts)+'</div></div></div><div class="txt">'+esc(p.text)+'</div>'+(p.img&&String(p.img).indexOf("data:image/")===0?'<img class="pim" src="'+p.img+'">':'')+'<div class="acts"><button class="like'+(on?" on":"")+'" data-id="'+esc(p.id)+'">'+(on?"♥":"♡")+" "+l.length+'</button><button class="lb" data-act="cm" data-id="'+esc(p.id)+'">💬 '+Math.max(0,p.cc||0)+'</button>'+postActs(p)+'</div></div>'}).join(""):'<div class="empty">Belum ada postingan. Jadilah yang pertama menyapa 🤍</div>'
}
function renderChat(){
  var near=innerHeight+scrollY>document.body.scrollHeight-180,first=!$("msgs").dataset.i;
  $("msgs").innerHTML=chats.length?chats.map(function(m){var s=m.uid===uid;return '<div class="m'+(s?" me":"")+'" style="--c:'+col(m.uid)+'"><div class="nm">'+(s?"Kamu":esc(nm(m.uid)))+vb(m.uid)+(s||isAdmin?'<span class="x" data-cdel="chat/'+esc(m.id)+'">✕</span>':'')+(isAdmin&&!s?'<span class="x" data-cban="'+esc(m.uid)+'">⛔</span>':'')+'</div><div class="b">'+esc(m.text)+'</div></div>'}).join(""):'<div class="empty">Belum ada obrolan. Sapa fans lain!</div>';
  if(tab==="chat"&&(near||first)){scrollTo(0,document.body.scrollHeight);$("msgs").dataset.i=1}
}
function renderLive(){
  var h="";
  if(live&&live.active){
    h='<div class="card"><span class="live">● LIVE</span><div class="nm" style="font-size:17px">'+esc(live.title)+'</div><div class="tm">oleh '+esc(nm(live.uid))+vb(live.uid)+' · '+ago(live.ts)+'</div>'+(live.uid===uid||isAdmin?'<button class="btn ghost" id="endlive">Akhiri Live</button>':"")+'</div>'+
    (live.uid===uid?'<video id="lv" autoplay playsinline muted class="lvv"></video>':'<img id="lf" class="lvv" '+(frame?'src="'+frame+'"':'')+'>')+'<div class="rbar" id="rbar"></div><div class="msgs" style="padding-bottom:140px">'+(lchats.length?lchats.map(function(m){return '<div class="m'+(m.uid===uid?" me":"")+'" style="--c:'+col(m.uid)+'"><div class="nm">'+esc(nm(m.uid))+vb(m.uid)+(m.uid===uid||isAdmin?'<span class="x" data-cdel="livechat/'+esc(m.id)+'">✕</span>':'')+(isAdmin&&m.uid!==uid?'<span class="x" data-cban="'+esc(m.uid)+'">⛔</span>':'')+'</div><div class="b">'+esc(m.text)+'</div></div>'}).join(""):'<div class="empty">Belum ada komentar.</div>')+'</div>'+
    '<div class="cbar"><input id="lt" maxlength="150" placeholder="Komentar live…"><button id="lb">Kirim</button></div>'
  }else h='<div class="card"><div class="nm" style="font-size:17px">Belum ada live</div>'+(canLive?'<div class="tm">Mulai ruang live dan ajak fans ngobrol bareng.</div><label>Judul live</label><input id="ltitle" maxlength="60" placeholder="mis. Nonton bareng"><button class="btn" id="golive">Mulai Live</button>':'<div class="tm">Live hanya dimulai oleh admin atau member HISYNC. Cek lagi nanti ya 🤍</div>')+'</div>';
  var keep=$("lt")?$("lt").value:"";$("livebox").innerHTML=h;if($("lt"))$("lt").value=keep;if($("lv")&&stream)$("lv").srcObject=stream;renderRc();
  if($("golive"))$("golive").onclick=function(){var t=$("ltitle").value.trim();if(!t||!canLive)return;put("live/current",{title:t,uid:uid,ts:Date.now(),active:true});startCam()};
  if($("endlive"))$("endlive").onclick=function(){stopCam();put("live/current",{title:live.title,uid:live.uid,ts:live.ts,active:false})};
  if($("lb")){var f=function(){var t=$("lt").value.trim();if(!t)return;$("lt").value="";put("livechat/"+nid(),{text:t,uid:uid,ts:Date.now(),live:live.ts})};$("lb").onclick=f;$("lt").onkeydown=function(e){if(e.key==="Enter")f()}}
}
function renderMem(){
  $("mems").innerHTML=Object.keys(B).map(function(k){
    var n=0;for(var u in P)if(P[u].bias===k)n++;
    return '<div class="card mem" style="border-color:'+B[k].c+'"><img class="mp" src="'+MP[k]+'" style="outline-color:'+B[k].c+'"><div><div class="nm" style="font-size:17px">'+B[k].n+'</div><div class="tm">'+n+' fans memilih bias ini</div></div></div>'}).join("")
}
function renderMe(){
  var p=me();if(!p)return;var b=B[p.bias];
  $("meb").innerHTML='<div class="prof">'+av(uid,84)+'<div class="nm" style="font-size:20px">'+esc(p.name)+vb(uid)+'</div><div class="tm">@'+esc(p.username)+' · bias '+(b?b.n:"-")+'</div><p style="margin-top:12px">'+(esc(p.bio)||'<span class="tm">Belum ada bio</span>')+'</p></div><div style="padding:0 24px"><button class="btn ghost" id="edit">Edit profil</button><button class="btn ghost" id="out">Keluar</button></div>'+repHtml();
  $("edit").onclick=function(){pick=p.bias;pphoto=null;$("en").value=p.name;$("eu").value=p.username;$("bio").value=p.bio||"";editing=true;openSetup(true)};
  $("out").onclick=function(){stopCam();fa.signOut().then(function(){location.reload()})}
}
function renderAll(){renderStories();renderPosts();renderChat();renderLive();renderMem();renderMe()}

/* ACTIONS */
function pv(){$("ppv").innerHTML=pimg?'<img class="thumb" src="'+pimg+'">':""}
function sv2(){$("spv").innerHTML=simg?'<img class="thumb" src="'+simg+'">':""}
function pi(cam){pick1(cam,function(f){shrink(f,600,.55).then(function(d){pimg=d;pv()})})}
function si(cam){pick1(cam,function(f){shrink(f,720,.6).then(function(d){simg=d;sv2()})})}
$("pg").onclick=function(){pi(0)};$("pc").onclick=function(){pi(1)};$("sg").onclick=function(){si(0)};$("sc").onclick=function(){si(1)};
$("scx").onclick=function(){$("sh").classList.add("hide")};
$("spost").onclick=function(){var t=$("stx").value.trim();if(!t&&!simg)return;var o={text:t,uid:uid,ts:Date.now()};if(simg)o.img=simg;put("stories/"+nid(),o);$("sh").classList.add("hide")};
$("pb").onclick=function(){var t=$("pt").value.trim();if(!t&&!pimg)return;var o={text:t,uid:uid,ts:Date.now(),likes:[]};if(pimg)o.img=pimg;$("pt").value="";pimg="";pv();put("posts/"+nid(),o)};
function sendChat(){var t=$("ct").value.trim();if(!t)return;$("ct").value="";put("chat/"+nid(),{text:t,uid:uid,ts:Date.now()})}
$("cb").onclick=sendChat;$("ct").onkeydown=function(e){if(e.key==="Enter")sendChat()};
$("posts").onclick=function(e){
  var a=e.target.closest("[data-act]");if(a){postAct(a.dataset.act,a.dataset.id);return}var b=e.target.closest(".like");if(!b)return;
  var p=posts.filter(function(x){return x.id===b.dataset.id})[0];if(!p)return;
  var i=(p.likes||[]).indexOf(uid);if(i===-1)notify(p,"like","","like_"+p.id+"_"+uid);
  db.doc("posts/"+p.id).update({likes:i>-1?firebase.firestore.FieldValue.arrayRemove(uid):firebase.firestore.FieldValue.arrayUnion(uid)}).catch(function(){})
};

$("msgs").onclick=modClick;$("livebox").onclick=modClick;
$("meb").onclick=function(e){var a=e.target.closest("[data-ra]");if(a)repAct(a.dataset.ra,a.dataset.rid)};

/* DATA */
function sub(path,ord,lim,fn){db.collection(path).orderBy("ts",ord).limit(lim).onSnapshot(function(s){fn(s.docs.map(function(d){var x=d.data();x.id=d.id;return x}));if(ready&&authed&&!editing&&me())renderAll()},function(){})}
if(typeof firebase==="undefined"||String(FIREBASE_CONFIG.apiKey).indexOf("ISI")===0){$("gate").innerHTML='<p class="sub">Firebase belum dikonfigurasi. Isi FIREBASE_CONFIG di file config.js.</p>'}
else{
  firebase.initializeApp(FIREBASE_CONFIG);fa=firebase.auth();db=firebase.firestore();var started=false;
  function go(){
    db.collection("profiles").onSnapshot(function(s){P={};s.docs.forEach(function(d){P[d.id]=d.data()});if(!ready){ready=true;route()}else if(!editing)route()},function(){});
    sub("posts","desc",50,function(a){posts=a});
    sub("chat","desc",60,function(a){chats=a.reverse()});
    sub("stories","desc",30,function(a){stories=a});
    sub("livechat","desc",50,function(a){lchats=a.filter(function(m){return live&&m.live===live.ts}).reverse()});
    db.doc("live/current").onSnapshot(function(d){live=d.exists?d.data():null;if(ready&&authed&&!editing&&me())renderLive()},function(){});
    db.doc("live/frame").onSnapshot(function(d){if(d.exists&&String(d.data().img).indexOf("data:image/")===0){frame=d.data().img;var f=$("lf");if(f)f.src=frame}},function(){});
    db.collection("notifs").where("to","==",uid).limit(50).onSnapshot(function(s){notifs=s.docs.map(function(d){var x=d.data();x.id=d.id;return x}).sort(function(a,b){return b.ts-a.ts});renderBell()},function(){});
    db.collection("verified").onSnapshot(function(s){V={};s.docs.forEach(function(d){V[d.id]=true});if(ready&&authed&&!editing&&me())renderAll();if(curPost)renderCm()},function(){});
    db.doc("hosts/"+uid).get().then(function(d){if(d.exists){canLive=true;db.doc("verified/"+uid).set({ts:Date.now()}).catch(function(){});if(ready&&authed&&!editing&&me())renderLive()}},function(){});
    db.collection("livereact").orderBy("ts","desc").limit(200).onSnapshot(function(s){reacts=s.docs.map(function(d){return d.data()});if(!firstReact)s.docChanges().forEach(function(c){var r=c.doc.data();if(c.type==="added"&&r.uid!==uid&&live&&r.live===live.ts&&Date.now()-r.ts<8000)floatE(r.e)});firstReact=false;renderRc()},function(){});
    db.doc("admins/"+uid).get().then(function(d){if(d.exists){isAdmin=true;canLive=true;db.doc("verified/"+uid).set({ts:Date.now()}).catch(function(){});sub("reports","desc",50,function(a){reports=a});if(ready&&authed&&!editing&&me())renderAll()}},function(){});
  }
  fa.onAuthStateChanged(function(u){
    if(!u){if(banned)return;ready=true;authed=false;uid=null;show("auth");return}
    uid=u.uid;authed=true;
    if(started)return;started=true;
    db.doc("bans/"+uid).get().then(function(d){if(d.exists){banned=true;$("gate").innerHTML='<p class="sub">Akunmu diblokir oleh admin HISYNC.</p>';show("gate");fa.signOut()}else go()},function(){go()});
  });
}
})();

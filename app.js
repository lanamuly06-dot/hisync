(function(){
var $=function(i){return document.getElementById(i)};
var B={ali:{n:"Alisha",c:"#8e8e93"},nova:{n:"Nova",c:"#e5343d"},ikh:{n:"Ikhsan",c:"#2f6fed"}};
var fa,db,uid,P={},posts=[],chats=[],stories=[],live=null,lchats=[],pick="",stream=null,timer=null,frame="",pimg="",simg="",pphoto=null,tab="home",authed=false,editing=false,ready=false;
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function ago(t){var s=(Date.now()-t)/1000;return s<60?"baru saja":s<3600?Math.floor(s/60)+" mnt":s<86400?Math.floor(s/3600)+" jam":Math.floor(s/86400)+" hr"}
function nid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function col(u){var p=P[u];return p&&B[p.bias]?B[p.bias].c:"#111"}
function nm(u){return P[u]?P[u].name:"Fan"}
function av(u,s){var p=P[u],h=p&&p.photo&&String(p.photo).indexOf("data:image/")===0;return '<div class="av" style="background:'+col(u)+';width:'+s+'px;height:'+s+'px;font-size:'+Math.round(s*.4)+'px;overflow:hidden">'+(h?'<img src="'+p.photo+'" style="width:100%;height:100%;object-fit:cover">':esc(nm(u).charAt(0).toUpperCase()))+'</div>'}
function show(id){["gate","auth","setup","app"].forEach(function(x){$(x).classList.toggle("hide",x!==id)})}
function put(path,d){return db.doc(path).set(d).catch(function(){alert("Gagal menyimpan. Coba lagi.")})}
function me(){return P[uid]}
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
function openSetup(isEdit){
  $("stt").textContent=isEdit?"Edit profil":"Lengkapi profilmu";$("cancel").classList.toggle("hide",!isEdit);
  $("bias").innerHTML=Object.keys(B).map(function(k){return '<button data-k="'+k+'" style="--c:'+B[k].c+'" class="'+(pick===k?"on":"")+'"><img src="'+MP[k]+'" style="width:46px;height:46px;border-radius:50%;object-fit:cover;object-position:50% 20%;display:block;margin:0 auto 6px;outline:2px solid '+B[k].c+'">'+B[k].n+'</button>'}).join("");
  drawPP();show("setup")
}
$("bias").onclick=function(e){var b=e.target.closest("button");if(!b)return;pick=b.dataset.k;openSetup(!$("cancel").classList.contains("hide"))};
$("cancel").onclick=function(){editing=false;route()};
$("done").onclick=function(){
  if(!pick){alert("Pilih bias dulu ya 🤍");return}
  var base=me()||editing||{};
  put("profiles/"+uid,{name:base.name,username:base.username,bio:$("bio").value.trim(),bias:pick,photo:pphoto!==null?pphoto:(base.photo||""),ts:base.ts||Date.now()}).then(function(){authed=true;editing=false;route()})
};

/* ROUTING */
function route(){
  if(!ready)return;
  if(!authed){show("auth");return}
  if(editing)return;
  if(!me()){var dn=fa&&fa.currentUser&&fa.currentUser.displayName;if(dn&&!$("sn").value)$("sn").value=dn.slice(0,24);$("fm").classList.add("hide");$("fs").classList.remove("hide");show("auth");return}
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
    var v=$("sv");v.style.background=s.img&&String(s.img).indexOf("data:image/")===0?'#000 url('+s.img+') center/cover':col(s.uid);v.innerHTML='<small>'+esc(nm(s.uid))+' · '+ago(s.ts)+'</small>'+esc(s.text);v.classList.remove("hide");v.onclick=function(){v.classList.add("hide")}}})
}
function renderPosts(){
  $("posts").innerHTML=posts.length?posts.map(function(p){
    var l=p.likes||[],on=l.indexOf(uid)>-1;
    return '<div class="post" style="--c:'+col(p.uid)+'"><div class="who">'+av(p.uid,36)+'<div><div class="nm">'+esc(nm(p.uid))+'</div><div class="tm">'+ago(p.ts)+'</div></div></div><div class="txt">'+esc(p.text)+'</div>'+(p.img&&String(p.img).indexOf("data:image/")===0?'<img class="pim" src="'+p.img+'">':'')+'<button class="like'+(on?" on":"")+'" data-id="'+esc(p.id)+'">'+(on?"♥":"♡")+" "+l.length+'</button></div>'}).join(""):'<div class="empty">Belum ada postingan. Jadilah yang pertama menyapa 🤍</div>'
}
function renderChat(){
  var near=innerHeight+scrollY>document.body.scrollHeight-180,first=!$("msgs").dataset.i;
  $("msgs").innerHTML=chats.length?chats.map(function(m){var s=m.uid===uid;return '<div class="m'+(s?" me":"")+'" style="--c:'+col(m.uid)+'"><div class="nm">'+(s?"Kamu":esc(nm(m.uid)))+'</div><div class="b">'+esc(m.text)+'</div></div>'}).join(""):'<div class="empty">Belum ada obrolan. Sapa fans lain!</div>';
  if(tab==="chat"&&(near||first)){scrollTo(0,document.body.scrollHeight);$("msgs").dataset.i=1}
}
function renderLive(){
  var h="";
  if(live&&live.active){
    h='<div class="card"><span class="live">● LIVE</span><div class="nm" style="font-size:17px">'+esc(live.title)+'</div><div class="tm">oleh '+esc(nm(live.uid))+' · '+ago(live.ts)+'</div>'+(live.uid===uid?'<button class="btn ghost" id="endlive">Akhiri Live</button>':"")+'</div>'+
    (live.uid===uid?'<video id="lv" autoplay playsinline muted class="lvv"></video>':'<img id="lf" class="lvv" '+(frame?'src="'+frame+'"':'')+'>')+'<div class="msgs" style="padding-bottom:140px">'+(lchats.length?lchats.map(function(m){return '<div class="m'+(m.uid===uid?" me":"")+'" style="--c:'+col(m.uid)+'"><div class="nm">'+esc(nm(m.uid))+'</div><div class="b">'+esc(m.text)+'</div></div>'}).join(""):'<div class="empty">Belum ada komentar.</div>')+'</div>'+
    '<div class="cbar"><input id="lt" maxlength="150" placeholder="Komentar live…"><button id="lb">Kirim</button></div>'
  }else h='<div class="card"><div class="nm" style="font-size:17px">Belum ada live</div><div class="tm">Mulai ruang live dan ajak fans lain ngobrol bareng.</div><label>Judul live</label><input id="ltitle" maxlength="60" placeholder="mis. Nonton bareng"><button class="btn" id="golive">Mulai Live</button></div>';
  var keep=$("lt")?$("lt").value:"";$("livebox").innerHTML=h;if($("lt"))$("lt").value=keep;if($("lv")&&stream)$("lv").srcObject=stream;
  if($("golive"))$("golive").onclick=function(){var t=$("ltitle").value.trim();if(!t)return;put("live/current",{title:t,uid:uid,ts:Date.now(),active:true});startCam()};
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
  $("meb").innerHTML='<div class="prof">'+av(uid,84)+'<div class="nm" style="font-size:20px">'+esc(p.name)+'</div><div class="tm">@'+esc(p.username)+' · bias '+(b?b.n:"-")+'</div><p style="margin-top:12px">'+(esc(p.bio)||'<span class="tm">Belum ada bio</span>')+'</p></div><div style="padding:0 24px"><button class="btn ghost" id="edit">Edit profil</button><button class="btn ghost" id="out">Keluar</button></div>';
  $("edit").onclick=function(){pick=p.bias;pphoto=null;$("bio").value=p.bio||"";editing=true;openSetup(true)};
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
  var b=e.target.closest(".like");if(!b)return;
  var p=posts.filter(function(x){return x.id===b.dataset.id})[0];if(!p)return;
  var l=(p.likes||[]).slice(),i=l.indexOf(uid);i>-1?l.splice(i,1):l.push(uid);
  db.doc("posts/"+p.id).update({likes:l}).catch(function(){})
};

/* DATA */
function sub(path,ord,lim,fn){db.collection(path).orderBy("ts",ord).limit(lim).onSnapshot(function(s){fn(s.docs.map(function(d){var x=d.data();x.id=d.id;return x}));if(ready&&authed&&!editing&&me())renderAll()},function(){})}
if(typeof firebase==="undefined"||String(FIREBASE_CONFIG.apiKey).indexOf("ISI")===0){$("gate").innerHTML='<p class="sub">Firebase belum dikonfigurasi. Isi FIREBASE_CONFIG di file config.js.</p>'}
else{
  firebase.initializeApp(FIREBASE_CONFIG);fa=firebase.auth();db=firebase.firestore();var started=false;
  fa.onAuthStateChanged(function(u){
    if(!u){ready=true;authed=false;uid=null;show("auth");return}
    uid=u.uid;authed=true;
    if(started)return;started=true;
    db.collection("profiles").onSnapshot(function(s){P={};s.docs.forEach(function(d){P[d.id]=d.data()});if(!ready){ready=true;route()}else if(!editing)route()},function(){});
    sub("posts","desc",50,function(a){posts=a});
    sub("chat","desc",60,function(a){chats=a.reverse()});
    sub("stories","desc",30,function(a){stories=a});
    sub("livechat","desc",50,function(a){lchats=a.filter(function(m){return live&&m.live===live.ts}).reverse()});
    db.doc("live/current").onSnapshot(function(d){live=d.exists?d.data():null;if(ready&&authed&&!editing&&me())renderLive()},function(){});
    db.doc("live/frame").onSnapshot(function(d){if(d.exists&&String(d.data().img).indexOf("data:image/")===0){frame=d.data().img;var f=$("lf");if(f)f.src=frame}},function(){});
  });
}
})();

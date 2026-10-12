(function(){
if(typeof firebase==="undefined"||!firebase.apps.length)return;
var $=function(i){return document.getElementById(i)};
var fa=firebase.auth(),db=firebase.firestore(),FV=firebase.firestore.FieldValue;
var KEYS=["ali","nova","ikh"];
var B={ali:{n:"Alisha",c:"#8e8e93"},nova:{n:"Nova",c:"#e5343d"},ikh:{n:"Ikhsan",c:"#2f6fed"}};
var MP={ali:"IMG-20260903-WA0074.jpg",nova:"IMG-20260903-WA0004.jpg",ikh:"IMG-20260901-WA0016.jpg"};
var BADGE='<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px;margin-left:3px"><circle cx="12" cy="12" r="11" fill="#1d9bf0"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var uid=null,V={},MA={},PN={},ST={},isAdm=false,flag=false,curStory=null;
function noop(){}
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function ea(s){return esc(s).replace(/"/g,"&quot;")}
function nid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function ago(t){var s=(Date.now()-t)/1000;return s<60?"baru saja":s<3600?Math.floor(s/60)+" mnt":s<86400?Math.floor(s/3600)+" jam":Math.floor(s/86400)+" hr"}
function dd(d){var x=d.data();x.id=d.id;return x}
function vb(u){return V[u]?BADGE:""}
function prof(u){if(PN[u])return;PN[u]={name:"…"};db.doc("profiles/"+u).get().then(function(d){PN[u]=d.exists?{name:d.data().name,bias:d.data().bias}:{name:"Fan"};refresh()},function(){PN[u]={name:"Fan"};refresh()})}
function pn(u){prof(u);return PN[u].name}
function pc(u){var p=PN[u];return p&&p.bias&&B[p.bias]?B[p.bias].c:"#111"}
function refresh(){renderRv();renderLikeBar()}
function notify(to,type,text,postId,id){if(!to||to===uid)return;db.doc("notifs/"+(id||nid())).set({to:to,from:uid,type:type,post:postId,text:String(text||"").slice(0,60),ts:Date.now(),read:false}).catch(noop)}

var css=document.createElement("style");
css.textContent=".ov:has(#cml){display:none!important}#fchips{display:flex;gap:8px;padding:10px 18px;overflow-x:auto;border-bottom:1px solid var(--line)}#fchips button{flex:none;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:99px;padding:7px 14px;font:600 13px inherit;font-family:inherit;cursor:pointer}#fchips button.on{background:var(--c,var(--acc,#111));border-color:var(--c,var(--acc,#111));color:#fff}.cmt.rp{margin-left:22px;border-left:2px solid var(--line);padding-left:10px}#rvt{display:flex;justify-content:space-between;align-items:center;background:var(--soft);border-radius:10px;padding:6px 10px;margin-top:10px;font-size:13px}#rvt span{cursor:pointer;color:var(--mute)}";
document.head.appendChild(css);

/* ---------- LIKE STORY ---------- */
function renderLikeBar(){
  var sv=$("sv"),old=$("slk");
  if(!sv||sv.classList.contains("hide")||!curStory||!ST[curStory]){if(old)old.remove();return}
  var s=ST[curStory],l=s.likes||[],on=l.indexOf(uid)>-1,bar=old;
  if(!bar){bar=document.createElement("div");bar.id="slk";bar.style.cssText="position:absolute;bottom:100px;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:8px;padding:0 20px;font-size:13px;font-weight:600";bar.onclick=function(e){e.stopPropagation()};sv.appendChild(bar)}
  var names=(s.uid===uid||isAdm)&&l.length?'<div style="max-width:90%;text-align:center;line-height:1.4">Disukai oleh '+l.slice(0,10).map(function(x){return esc(pn(x))}).join(", ")+(l.length>10?" dan "+(l.length-10)+" lainnya":"")+'</div>':'';
  bar.innerHTML='<button id="slb" style="border:0;background:#0006;color:#fff;border-radius:99px;padding:10px 20px;font:600 16px inherit;font-family:inherit;cursor:pointer">'+(on?"♥":"♡")+" "+l.length+'</button>'+names;
  $("slb").onclick=toggleStory
}
function toggleStory(){
  var id=curStory,s=ST[id];if(!s)return;
  var l=(s.likes||[]).slice(),i=l.indexOf(uid);if(i>-1)l.splice(i,1);else l.push(uid);s.likes=l;renderLikeBar();
  db.doc("stories/"+id).update({likes:i>-1?FV.arrayRemove(uid):FV.arrayUnion(uid)}).catch(function(){alert("Gagal. Coba lagi.")})
}

/* ---------- BALAS KOMENTAR ---------- */
var rv={post:null,comments:[],un:null,to:null};
var rEl=document.createElement("div");rEl.className="ov hide";
rEl.innerHTML='<div class="sheet"><b>Komentar</b><div id="rvl"></div><div id="rvt" class="hide"></div><div class="cin"><input id="rvi" maxlength="200" placeholder="Tulis komentar…"><button id="rvb">Kirim</button></div><button class="btn ghost" id="rvx">Tutup</button></div>';
document.body.appendChild(rEl);
function cHtml(c,reply){
  var par=reply?c.reply:c.id;
  return '<div class="cmt'+(reply?" rp":"")+'"><b style="color:'+pc(c.uid)+'">'+esc(pn(c.uid))+'</b>'+vb(c.uid)+' <span class="tm">'+ago(c.ts)+'</span>'+(c.uid===uid||isAdm?' <span class="x" data-cdx="'+ea(c.id)+'">✕</span>':'')+'<div class="txt">'+(reply&&c.to?'<span class="tm">↩ '+esc(pn(c.to))+' </span>':'')+esc(c.text)+'</div><button class="lb" data-rep="'+ea(c.id)+'" data-par="'+ea(par)+'" data-to="'+ea(c.uid)+'">Balas</button></div>'
}
function renderRv(){
  var el=$("rvl");if(!el||rEl.classList.contains("hide"))return;
  var ids={};rv.comments.forEach(function(c){ids[c.id]=1});
  var top=rv.comments.filter(function(c){return !c.reply||!ids[c.reply]});
  var h=top.length?top.map(function(c){
    return cHtml(c,false)+rv.comments.filter(function(r){return r.reply===c.id}).map(function(r){return cHtml(r,true)}).join("")
  }).join(""):'<div class="empty">Belum ada komentar. Tulis yang pertama!</div>';
  el.innerHTML=h;
  var t=$("rvt");t.classList.toggle("hide",!rv.to);
  if(rv.to)t.innerHTML='<div>Membalas <b>'+esc(pn(rv.to.uid))+'</b></div><span data-rx="1">✕</span>'
}
function openRv(id){
  if(rv.un)rv.un();
  rv.post={id:id,uid:null};rv.comments=[];rv.to=null;rEl.classList.remove("hide");renderRv();
  db.doc("posts/"+id).get().then(function(d){if(d.exists&&rv.post&&rv.post.id===id)rv.post.uid=d.data().uid},noop);
  rv.un=db.collection("posts/"+id+"/comments").orderBy("ts","asc").limit(200).onSnapshot(function(s){rv.comments=s.docs.map(dd);rv.comments.forEach(function(c){prof(c.uid);if(c.to)prof(c.to)});renderRv()},noop)
}
function closeRv(){if(rv.un)rv.un();rv.un=null;rv.post=null;rv.to=null;rEl.classList.add("hide")}
function sendRv(){
  var inp=$("rvi"),t=inp.value.trim(),p=rv.post;if(!t||!p)return;inp.value="";
  var c={text:t,uid:uid,ts:Date.now()},to=rv.to;
  if(to){c.reply=to.parent;c.to=to.uid}
  rv.to=null;renderRv();
  db.doc("posts/"+p.id+"/comments/"+nid()).set(c).then(function(){
    db.doc("posts/"+p.id).update({cc:FV.increment(1)}).catch(noop);
    notify(p.uid,"comment",t,p.id);
    if(to&&to.uid!==p.uid)notify(to.uid,"comment","↩ "+t,p.id)
  }).catch(function(){alert("Gagal mengirim komentar.")})
}
function delC(id){
  var c=rv.comments.filter(function(x){return x.id===id})[0],p=rv.post;if(!c||!p||!confirm("Hapus komentar ini?"))return;
  var all=[c].concat(c.reply?[]:rv.comments.filter(function(x){return x.reply===id})),pid=p.id;
  Promise.all(all.map(function(x){return db.doc("posts/"+pid+"/comments/"+x.id).delete().then(function(){return 1},function(){return 0})})).then(function(r){
    var n=r.reduce(function(a,b){return a+b},0);if(n)db.doc("posts/"+pid).update({cc:FV.increment(-n)}).catch(noop)
  })
}
rEl.addEventListener("click",function(e){
  var t=e.target;
  if(t.closest("#rvx")){closeRv();return}
  if(t.closest("#rvb")){sendRv();return}
  if(t.closest("[data-rx]")){rv.to=null;renderRv();return}
  var d=t.closest("[data-cdx]");if(d){delC(d.dataset.cdx);return}
  var r=t.closest("[data-rep]");if(r){rv.to={parent:r.dataset.par,uid:r.dataset.to};renderRv();$("rvi").focus()}
});
rEl.addEventListener("keydown",function(e){if(e.target.id==="rvi"&&e.key==="Enter")sendRv()});

/* ---------- FILTER FEED ---------- */
var pe=$("posts"),chips=document.createElement("div");chips.id="fchips";
chips.innerHTML='<button data-f="all" class="on">Semua</button>'+KEYS.map(function(k){return '<button data-f="'+k+'" style="--c:'+B[k].c+'">'+B[k].n+'</button>'}).join("");
pe.parentNode.insertBefore(chips,pe);
var fcont=document.createElement("div");fcont.id="fl";fcont.className="hide";pe.parentNode.insertBefore(fcont,pe);
var fl={f:"all",un:null,list:[]};
function fcard(p,k){
  var l=p.likes||[],on=l.indexOf(uid)>-1;
  return '<div class="post" style="--c:'+B[k].c+'"><div class="who"><img src="'+MP[k]+'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:50% 20%;flex:none"><div><div class="nm">'+esc(B[k].n)+BADGE+'</div><div class="tm">'+ago(p.ts)+'</div></div></div>'
  +(p.text?'<div class="txt">'+esc(p.text)+'</div>':'')+(p.img&&String(p.img).indexOf("data:image/")===0?'<img class="pim" src="'+p.img+'">':'')
  +'<div class="acts"><button class="like'+(on?" on":"")+'" data-fl="'+ea(p.id)+'">'+(on?"♥":"♡")+" "+l.length+'</button><button class="lb" data-cm="'+ea(p.id)+'">💬 '+Math.max(0,p.cc||0)+'</button></div></div>'
}
function renderF(){
  var k=fl.f;if(k==="all")return;
  fcont.innerHTML=fl.list.length?fl.list.map(function(p){return fcard(p,k)}).join(""):'<div class="empty">Belum ada postingan dari '+esc(B[k].n)+'.</div>'
}
function setF(f){
  fl.f=f;fl.list=[];if(fl.un){fl.un();fl.un=null}
  [].forEach.call(chips.querySelectorAll("button"),function(b){b.classList.toggle("on",b.dataset.f===f)});
  pe.style.display=f==="all"?"":"none";fcont.classList.toggle("hide",f==="all");
  if(f==="all"){fcont.innerHTML="";return}
  var mu=MA[f];if(!mu){fcont.innerHTML='<div class="empty">Akun '+esc(B[f].n)+' belum diatur oleh admin.</div>';return}
  fcont.innerHTML='<div class="empty">Memuat…</div>';
  fl.un=db.collection("posts").where("uid","==",mu).limit(60).onSnapshot(function(s){fl.list=s.docs.map(dd).sort(function(a,b){return b.ts-a.ts});renderF()},function(){fcont.innerHTML='<div class="empty">Gagal memuat postingan.</div>'})
}
chips.addEventListener("click",function(e){var b=e.target.closest("button");if(b)setF(b.dataset.f)});
fcont.addEventListener("click",function(e){
  var c=e.target.closest("[data-cm]");if(c){openRv(c.dataset.cm);return}
  var b=e.target.closest("[data-fl]");if(!b)return;
  var id=b.dataset.fl,p=fl.list.filter(function(x){return x.id===id})[0];if(!p)return;
  var l=(p.likes||[]).slice(),i=l.indexOf(uid);if(i>-1)l.splice(i,1);else l.push(uid);p.likes=l;renderF();
  if(i===-1)notify(p.uid,"like","",id,"like_"+id+"_"+uid);
  db.doc("posts/"+id).update({likes:i>-1?FV.arrayRemove(uid):FV.arrayUnion(uid)}).catch(noop)
});

/* ---------- KLIK GLOBAL ---------- */
function closeOldSheet(){setTimeout(function(){var x=$("cmx");if(x)x.click()},0)}
document.addEventListener("click",function(e){
  var s=e.target.closest("#stories .st[data-id]");if(s){curStory=s.dataset.id;renderLikeBar();return}
  var c=e.target.closest('#posts [data-act="cm"]');if(c){openRv(c.dataset.id);closeOldSheet();return}
  var n=e.target.closest("#ntl [data-p]");if(n){openRv(n.dataset.p);closeOldSheet()}
});

/* ---------- STORY 24 JAM ---------- */
function cleanup(){
  db.collection("stories").where("ts","<",Date.now()-864e5).limit(100).get().then(function(s){
    s.docs.forEach(function(d){d.ref.delete().catch(noop)})
  }).catch(noop)
}

/* ---------- DATA ---------- */
fa.onAuthStateChanged(function(u){
  uid=u?u.uid:null;if(!u||flag)return;flag=true;
  db.collection("verified").onSnapshot(function(s){V={};s.docs.forEach(function(d){V[d.id]=true});refresh()},noop);
  db.collection("memberacct").onSnapshot(function(s){MA={};s.docs.forEach(function(d){MA[d.id]=d.data().uid});if(fl.f!=="all"&&!fl.un)setF(fl.f)},noop);
  db.doc("admins/"+uid).get().then(function(d){isAdm=d.exists;refresh()},noop);
  db.collection("stories").orderBy("ts","desc").limit(30).onSnapshot(function(s){ST={};s.docs.forEach(function(d){ST[d.id]=d.data()});renderLikeBar()},noop);
  cleanup();setInterval(cleanup,36e5)
});
})();

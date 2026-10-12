(function(){
if(typeof firebase==="undefined"||!firebase.apps.length)return;
var $=function(i){return document.getElementById(i)};
var fa=firebase.auth(),db=firebase.firestore();
var KEYS=["ali","nova","ikh"];
var B={ali:{n:"Alisha",c:"#8e8e93"},nova:{n:"Nova",c:"#e5343d"},ikh:{n:"Ikhsan",c:"#2f6fed"}};
var MP={ali:"IMG-20260903-WA0074.jpg",nova:"IMG-20260903-WA0004.jpg",ikh:"IMG-20260901-WA0016.jpg"};
var BADGE='<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px;margin-left:3px"><circle cx="12" cy="12" r="11" fill="#1d9bf0"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var uid=null,P={},V={},MA={},myKey=null,isAdm=false,threads=[],grpLast=null,homePosts=[],view="list",cur=null,unsub=null,msgs=[],msgsOk=false,flag=false,pfC=null,myC=null,autoDone=false;
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function ea(s){return esc(s).replace(/"/g,"&quot;")}
function nid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function ago(t){var s=(Date.now()-t)/1000;return s<60?"baru saja":s<3600?Math.floor(s/60)+" mnt":s<86400?Math.floor(s/3600)+" jam":Math.floor(s/86400)+" hr"}
function dd(d){var x=d.data();x.id=d.id;return x}
function col(u){var p=P[u];return p&&B[p.bias]?B[p.bias].c:"#111"}
function nm(u){return P[u]?P[u].name:"Fan"}
function vb(u){return V[u]?BADGE:""}
function avh(u,s){var p=P[u],h=p&&p.photo&&String(p.photo).indexOf("data:image/")===0;return '<div class="av" style="background:'+col(u)+';width:'+s+'px;height:'+s+'px;font-size:'+Math.round(s*.4)+'px;overflow:hidden;flex:none">'+(h?'<img src="'+p.photo+'" style="width:100%;height:100%;object-fit:cover">':esc(nm(u).charAt(0).toUpperCase()))+'</div>'}
function mimg(k,s){return '<img src="'+MP[k]+'" style="width:'+s+'px;height:'+s+'px;border-radius:50%;object-fit:cover;object-position:50% 20%;outline:2px solid '+B[k].c+';outline-offset:1px;flex:none">'}

/* waktu buka chat pribadi (WIB): 07.00-11.00 dan 19.00-22.00 */
function dmStatus(){var d=new Date(Date.now()+252e5),m=d.getUTCHours()*60+d.getUTCMinutes();
  if(m>=420&&m<660)return{open:true,txt:"Buka sampai 11.00 WIB"};
  if(m>=1140&&m<1320)return{open:true,txt:"Buka sampai 22.00 WIB"};
  return{open:false,txt:"Buka lagi pukul "+(m<420?"07.00":m<1140?"19.00":"07.00 (besok)")+" WIB"}}

var css=document.createElement("style");
css.textContent="#v-chat>.msgs,#v-chat>.cbar{display:none!important}#nav button{position:relative}.nbd2{position:absolute;top:2px;right:calc(50% - 22px);background:#e5343d;color:#fff;font:700 10px/16px sans-serif;min-width:16px;height:16px;border-radius:99px;text-align:center;font-style:normal;padding:0 4px}.ibh{font-size:22px;font-weight:700;padding:16px 18px 6px}.ibn{color:var(--mute);font-size:13px;padding:0 18px 10px}.ibr{display:flex;gap:12px;align-items:center;padding:12px 18px;border-top:1px solid var(--line);cursor:pointer}.ibr .t{min-width:0;flex:1}.ibr .s{color:var(--mute);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ibr .u{width:10px;height:10px;border-radius:50%;background:#e5343d;flex:none}.chip{font-size:11px;padding:2px 8px;border-radius:99px;background:var(--soft);color:var(--mute);white-space:nowrap}.chip.on{background:#1d9bf022;color:#1d9bf0}.sbk{border:0;background:none;color:var(--fg);font:600 15px inherit;font-family:inherit;padding:10px 14px;cursor:pointer}.ibt{display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--line);position:sticky;top:env(safe-area-inset-top,0px);background:var(--bg);z-index:3}#ib .nm[data-u]{cursor:pointer}#ib .cbar input:disabled{opacity:.5}.ov2{position:fixed;top:0;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:var(--bg);color:var(--fg);z-index:18;overflow-y:auto;padding:env(safe-area-inset-top,0px) 0 40px}.pfs{display:flex;justify-content:space-around;text-align:center;padding:10px 18px;font-size:12px;color:var(--mute)}.pfs b{display:block;font-size:18px;color:var(--fg)}.ptabs{display:flex;border-bottom:1px solid var(--line);margin-top:12px}.ptabs button{flex:1;border:0;background:none;color:var(--mute);font:600 14px inherit;font-family:inherit;padding:12px;cursor:pointer}.ptabs button.on{color:var(--fg);box-shadow:inset 0 -2px 0 var(--fg)}.pc{padding:12px 18px;border-bottom:1px solid var(--line)}.dsr{display:flex;gap:12px;align-items:center;padding:10px 18px;border-top:1px solid var(--line);cursor:pointer}#psb{position:sticky;top:0;padding:8px 18px;background:var(--bg)}";
document.head.appendChild(css);

var ib=document.createElement("div");ib.id="ib";$("v-chat").appendChild(ib);
var nb=document.querySelector('#nav button[data-t="chat"]');
if(nb&&nb.lastChild&&nb.lastChild.nodeType===3)nb.lastChild.nodeValue="Inbox";
var bd=document.createElement("i");bd.className="nbd2 hide";if(nb)nb.appendChild(bd);
var pfEl=document.createElement("div");pfEl.className="ov2 hide";document.body.appendChild(pfEl);
var drEl=document.createElement("div");drEl.className="ov2 hide";document.body.appendChild(drEl);
var myEl=document.createElement("div");myEl.id="mypf";$("v-me").appendChild(myEl);
var pbtn=document.createElement("button");pbtn.className="bell";pbtn.textContent="👥";pbtn.setAttribute("aria-label","Fans");
var hdr=document.querySelector("header"),bl=hdr.querySelector(".bell");hdr.insertBefore(pbtn,bl||null);

/* ---------- INBOX ---------- */
function unread(t){var rd=myKey?t.memRead:t.fanRead;return t.lastBy!==uid&&(t.lastTs||0)>(rd||0)}
function updBadge(){var n=threads.filter(unread).length;bd.textContent=n>9?"9+":n;bd.classList.toggle("hide",!n)}
function row(go,av,name,sub,extra){return '<div class="ibr" data-go="'+ea(go)+'">'+av+'<div class="t"><div class="nm">'+name+'</div><div class="s">'+esc(sub)+'</div></div>'+extra+'</div>'}
function drawList(){
  ib.dataset.cur="";var st=dmStatus(),h='<div class="ibh">Inbox</div>';
  h+='<div class="ibn">Chat pribadi member dibuka pukul 07.00–11.00 dan 19.00–22.00 WIB. Sekarang: <b style="color:var(--fg)">'+(st.open?"Buka":"Tutup")+'</b> · '+esc(st.txt)+'</div>';
  h+=row("grp",'<div class="av" style="width:48px;height:48px;background:var(--soft);color:var(--fg);font-size:22px;flex:none">👥</div>',"Grup HISYNC",grpLast?(nm(grpLast.uid)+": "+grpLast.text):"Semua fans dan member","");
  if(myKey){
    var ts=threads.slice().sort(function(a,b){return(b.lastTs||0)-(a.lastTs||0)});
    ts.forEach(function(t){h+=row("dm:"+t.id,avh(t.fan,48),esc(nm(t.fan))+vb(t.fan),t.last||"",(unread(t)?'<span class="u"></span>':'')+'<span class="chip">'+ago(t.lastTs||0)+'</span>')});
    if(!ts.length)h+='<div class="empty">Belum ada pesan pribadi dari fans.</div>';
  }else KEYS.forEach(function(k){
    var t=threads.filter(function(x){return x.mk===k})[0];
    h+=row("mk:"+k,mimg(k,48),esc(B[k].n)+BADGE,t?t.last:"Ketuk untuk menyapa 🤍",(t&&unread(t)?'<span class="u"></span>':'')+'<span class="chip'+(st.open?" on":"")+'">'+(st.open?"Buka":"Tutup")+'</span>')
  });
  ib.innerHTML=h
}
function leave(){if(unsub){unsub();unsub=null}msgs=[];msgsOk=false}
function msgsHtml(g){
  var h="";
  if(!msgs.length)h+='<div class="empty">'+(g?"Belum ada obrolan. Sapa semuanya!":"Mulai percakapan 🤍")+'</div>';
  msgs.forEach(function(m){var by=g?m.uid:m.by,s=by===uid,del=g&&(s||isAdm);
    h+='<div class="m'+(s?" me":"")+'" style="--c:'+col(by)+'"><div class="nm" '+(g&&!s?'data-u="'+ea(by)+'"':'')+'>'+(s?"Kamu":esc(nm(by)))+vb(by)+(del?'<span class="x" data-del="'+ea(m.id)+'" style="margin-left:8px;color:var(--mute);cursor:pointer;font-size:12px">✕</span>':'')+'</div><div class="b">'+esc(m.text)+'</div></div>'});
  return h
}
function drawThread(){
  var g=cur.type==="grp",st=dmStatus(),can=g||st.open,key=cur.type+":"+(cur.tid||""),stt=g?"":(st.open?"Buka · ":"Tutup · ")+st.txt;
  var near=window.innerHeight+window.scrollY>document.body.scrollHeight-220;
  if(ib.dataset.cur===key&&$("ibm")){
    $("ibm").innerHTML=msgsHtml(g);
    if($("ibst"))$("ibst").textContent=stt;
    var i=$("ibi"),b=$("ibs");i.disabled=!can;b.disabled=!can;i.placeholder=can?"Ketik pesan…":"Chat pribadi sedang tutup";
    if(near||cur.stick){window.scrollTo(0,document.body.scrollHeight);cur.stick=false}
    return
  }
  var title=g?"Grup HISYNC":(myKey?esc(nm(cur.fan))+vb(cur.fan):esc(B[cur.mk].n)+BADGE);
  var av=g?'<div class="av" style="width:36px;height:36px;background:var(--soft);color:var(--fg);flex:none">👥</div>':(myKey?avh(cur.fan,36):mimg(cur.mk,36));
  ib.innerHTML='<div class="ibt"><button class="sbk" data-go="list">‹</button>'+av+'<div style="min-width:0"><div class="nm">'+title+'</div>'+(g?'':'<div class="tm" id="ibst">'+esc(stt)+'</div>')+'</div></div><div class="msgs" id="ibm">'+msgsHtml(g)+'</div><div class="cbar"><input id="ibi" maxlength="300" placeholder="'+(can?"Ketik pesan…":"Chat pribadi sedang tutup")+'"'+(can?'':' disabled')+'><button id="ibs"'+(can?'':' disabled')+'>Kirim</button></div>';
  ib.dataset.cur=key;window.scrollTo(0,document.body.scrollHeight);cur.stick=false
}
function draw(){if(view==="list")drawList();else drawThread()}
function openChat(c){cur=c;c.stick=true;view=c.type;ib.dataset.cur="";leave();msgs=[];draw();subMsgs();window.scrollTo(0,0)}
function subMsgs(){
  if(unsub){unsub();unsub=null}
  var q=cur.type==="grp"?db.collection("chat").orderBy("ts","desc").limit(100):db.collection("dm/"+cur.tid+"/msgs").orderBy("ts","asc").limit(200);
  var c=cur;
  unsub=q.onSnapshot(function(s){
    if(cur!==c)return;
    msgs=s.docs.map(dd);if(c.type==="grp")msgs.reverse();msgsOk=true;draw();
    if(c.type==="dm"&&msgs.length&&msgs[msgs.length-1].by!==uid)markRead(c)
  },function(){msgsOk=false})
}
function markRead(c){var o={};o[myKey?"memRead":"fanRead"]=Date.now();db.doc("dm/"+c.tid).update(o).catch(function(){})}
function send(){
  var inp=$("ibi"),t=inp&&inp.value.trim();if(!t||!cur)return;
  if(cur.type==="grp"){inp.value="";db.doc("chat/"+nid()).set({text:t,uid:uid,ts:Date.now()}).catch(function(){alert("Gagal mengirim pesan.")});return}
  if(!dmStatus().open){alert("Chat pribadi sedang tutup. "+dmStatus().txt+".");return}
  var now=Date.now(),mu=MA[cur.mk];if(!mu){alert("Akun member belum diatur. Hubungi admin.");return}
  var tref=db.doc("dm/"+cur.tid),data={fan:cur.fan,mu:mu,mk:cur.mk,last:t.slice(0,80),lastBy:uid,lastTs:now},c=cur;
  data[myKey?"memRead":"fanRead"]=now;
  var b=db.batch();b.set(tref,data,{merge:true});b.set(tref.collection("msgs").doc(nid()),{by:uid,text:t,ts:now});
  inp.value="";
  b.commit().then(function(){if(!msgsOk&&cur===c)subMsgs()}).catch(function(){alert("Pesan tidak terkirim. Pastikan chat sedang buka dan coba lagi.")})
}
ib.addEventListener("click",function(e){
  var u=e.target.closest("[data-u]");if(u){openProfile(u.dataset.u);return}
  var x=e.target.closest("[data-del]");if(x){if(confirm("Hapus pesan ini?"))db.doc("chat/"+x.dataset.del).delete().catch(function(){});return}
  if(e.target.closest("#ibs")){send();return}
  var g=e.target.closest("[data-go]");if(!g)return;var v=g.dataset.go;
  if(v==="list"){leave();view="list";cur=null;draw();return}
  if(v==="grp"){openChat({type:"grp"});return}
  if(v.indexOf("mk:")===0){var k=v.slice(3);openChat({type:"dm",tid:uid+"_"+k,mk:k,fan:uid});return}
  if(v.indexOf("dm:")===0){var t=threads.filter(function(z){return z.id===v.slice(3)})[0];if(t)openChat({type:"dm",tid:t.id,mk:t.mk,fan:t.fan})}
});
ib.addEventListener("keydown",function(e){if(e.target.id==="ibi"&&e.key==="Enter")send()});
setInterval(function(){if(!$("v-chat").classList.contains("hide")&&(view==="list"||(cur&&cur.type==="dm")))draw()},20000);

/* ---------- PROFIL & FOLLOW ---------- */
function PF(el,u,onClose){
  var s={posts:[],likes:[],fr:0,fg:0,isF:false,tab:"posts"},un=[];
  function pcard(p,a){return '<div class="pc">'+(a?'<div class="nm" data-u="'+ea(p.uid)+'" style="cursor:pointer">'+esc(nm(p.uid))+vb(p.uid)+'</div>':'')+'<div class="tm">'+ago(p.ts)+'</div>'+(p.text?'<div class="txt">'+esc(p.text)+'</div>':'')+(p.img&&String(p.img).indexOf("data:image/")===0?'<img class="pim" src="'+p.img+'">':'')+'<div class="tm" style="margin-top:6px">♥ '+((p.likes||[]).length)+' · 💬 '+Math.max(0,p.cc||0)+'</div></div>'}
  function r(){
    var p=P[u]||{},b=B[p.bias],list=s.tab==="posts"?s.posts:s.likes;
    var h=(onClose?'<button class="sbk" data-x="close">‹ Kembali</button>':'')+'<div class="prof">'+avh(u,84)+'<div class="nm" style="font-size:20px">'+esc(p.name||"Fan")+vb(u)+'</div><div class="tm">@'+esc(p.username||"")+' · bias '+(b?b.n:"-")+'</div>'+(p.bio?'<p style="margin-top:10px">'+esc(p.bio)+'</p>':'')+'</div>'
    +'<div class="pfs"><div><b>'+s.posts.length+'</b>Postingan</div><div><b>'+s.fr+'</b>Pengikut</div><div><b>'+s.fg+'</b>Mengikuti</div></div>'
    +(u!==uid?'<div style="padding:0 24px"><button class="btn'+(s.isF?" ghost":"")+'" data-x="follow" style="margin-top:6px">'+(s.isF?"Mengikuti":"Ikuti")+'</button></div>':'')
    +'<div class="ptabs"><button data-x="tab" data-t="posts" class="'+(s.tab==="posts"?"on":"")+'">Postingan</button><button data-x="tab" data-t="likes" class="'+(s.tab==="likes"?"on":"")+'">Disukai</button></div>'
    +(list.length?list.map(function(x){return pcard(x,s.tab==="likes")}).join(""):'<div class="empty">'+(s.tab==="posts"?"Belum ada postingan.":"Belum ada postingan yang disukai.")+'</div>');
    el.innerHTML=h
  }
  function srt(q){return q.docs.map(dd).sort(function(a,b){return b.ts-a.ts})}
  un.push(db.collection("posts").where("uid","==",u).limit(60).onSnapshot(function(q){s.posts=srt(q);r()},function(){}));
  un.push(db.collection("posts").where("likes","array-contains",u).limit(60).onSnapshot(function(q){s.likes=srt(q);r()},function(){}));
  un.push(db.collection("follows").where("b","==",u).onSnapshot(function(q){s.fr=q.size;s.isF=q.docs.some(function(d){return d.data().a===uid});r()},function(){}));
  un.push(db.collection("follows").where("a","==",u).onSnapshot(function(q){s.fg=q.size;r()},function(){}));
  el.onclick=function(e){
    var n=e.target.closest("[data-u]");if(n){openProfile(n.dataset.u);return}
    var x=e.target.closest("[data-x]");if(!x)return;var a=x.dataset.x;
    if(a==="close"){onClose()}
    else if(a==="tab"){s.tab=x.dataset.t;r()}
    else if(a==="follow"){var ref=db.doc("follows/"+uid+"_"+u);(s.isF?ref.delete():ref.set({a:uid,b:u,ts:Date.now()})).catch(function(){alert("Gagal. Coba lagi.")})}
  };
  r();
  return{r:r,destroy:function(){un.forEach(function(f){f()});un=[]}}
}
function openProfile(u){
  if(!u)return;if(pfC)pfC.destroy();
  pfEl.classList.remove("hide");pfEl.scrollTop=0;
  pfC=PF(pfEl,u,function(){pfC.destroy();pfC=null;pfEl.classList.add("hide");pfEl.innerHTML=""})
}
function drawDir(q){
  q=(q||"").trim().toLowerCase();
  var ids=Object.keys(P).filter(function(k){var p=P[k];return !q||(p.name||"").toLowerCase().indexOf(q)>-1||(p.username||"").toLowerCase().indexOf(q)>-1}).sort(function(a,b){return nm(a).localeCompare(nm(b))}).slice(0,100);
  var keep=$("psi")?$("psi").value:"";
  var h='<div class="ibt"><button class="sbk" data-x="dclose">‹ Kembali</button><b>Daftar fans</b></div><div id="psb"><input id="psi" placeholder="Cari nama atau username…" value="'+ea(keep)+'"></div>';
  h+=ids.length?ids.map(function(k){var p=P[k],b=B[p.bias];return '<div class="dsr" data-u="'+ea(k)+'">'+avh(k,40)+'<div class="t" style="min-width:0"><div class="nm">'+esc(p.name||"Fan")+vb(k)+'</div><div class="tm">@'+esc(p.username||"")+' · bias '+(b?b.n:"-")+'</div></div></div>'}).join(""):'<div class="empty">Tidak ada hasil.</div>';
  drEl.innerHTML=h;
  var i=$("psi");if(i&&keep){i.focus();i.setSelectionRange(keep.length,keep.length)}
}
pbtn.onclick=function(){drEl.classList.remove("hide");drEl.scrollTop=0;drawDir("")};
drEl.addEventListener("click",function(e){
  if(e.target.closest('[data-x="dclose"]')){drEl.classList.add("hide");return}
  var u=e.target.closest("[data-u]");if(u)openProfile(u.dataset.u)
});
drEl.addEventListener("input",function(e){if(e.target.id==="psi")drawDir(e.target.value)});
document.addEventListener("click",function(e){
  var w=e.target.closest("#posts .post .who");if(!w)return;
  var els=[].slice.call(document.querySelectorAll("#posts .post")),i=els.indexOf(w.closest(".post")),p=homePosts[i];
  if(p&&p.uid)openProfile(p.uid)
});

/* ---------- DATA ---------- */
function autoFollow(){
  if(autoDone||!uid)return;var ks=Object.keys(MA);if(!ks.length)return;autoDone=true;
  db.doc("usersettings/"+uid).get().then(function(d){
    if(d.exists&&d.data().autoFollowed)return;
    var b=db.batch();
    ks.forEach(function(k){var m=MA[k];if(m&&m!==uid)b.set(db.doc("follows/"+uid+"_"+m),{a:uid,b:m,ts:Date.now()})});
    b.set(db.doc("usersettings/"+uid),{autoFollowed:true},{merge:true});
    return b.commit()
  }).catch(function(){autoDone=false})
}
function resub(){
  if(!uid)return;
  var q=myKey?db.collection("dm").where("mu","==",uid):db.collection("dm").where("fan","==",uid);
  if(resub.u)resub.u();
  resub.u=q.onSnapshot(function(s){threads=s.docs.map(dd);updBadge();if(view==="list")drawList();else if(cur&&cur.type==="dm")draw()},function(){})
}
fa.onAuthStateChanged(function(u){
  uid=u?u.uid:null;if(!u||flag)return;flag=true;
  db.collection("profiles").onSnapshot(function(s){P={};s.docs.forEach(function(d){P[d.id]=d.data()});draw();if(!drEl.classList.contains("hide"))drawDir($("psi")?$("psi").value:"");if(pfC)pfC.r();if(myC)myC.r()},function(){});
  db.collection("verified").onSnapshot(function(s){V={};s.docs.forEach(function(d){V[d.id]=true});draw()},function(){});
  db.collection("memberacct").onSnapshot(function(s){
    MA={};s.docs.forEach(function(d){MA[d.id]=d.data().uid});
    var mk=null;KEYS.forEach(function(k){if(MA[k]===uid)mk=k});
    var changed=mk!==myKey;myKey=mk;if(changed||!resub.u)resub();draw();autoFollow()
  },function(){});
  db.doc("admins/"+uid).get().then(function(d){isAdm=d.exists;draw()},function(){});
  db.collection("chat").orderBy("ts","desc").limit(1).onSnapshot(function(s){grpLast=s.docs.length?dd(s.docs[0]):null;if(view==="list")drawList()},function(){});
  db.collection("posts").orderBy("ts","desc").limit(50).onSnapshot(function(s){homePosts=s.docs.map(dd)},function(){});
  myC=PF(myEl,uid,null);
  drawList()
});
})();

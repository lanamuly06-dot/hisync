(function(){
if(typeof firebase==="undefined"||!firebase.apps.length)return;
var $=function(i){return document.getElementById(i)};
var db=firebase.firestore(),fa=firebase.auth();
var KEYS=["ali","nova","ikh"];
var B={ali:{n:"Alisha",c:"#8e8e93"},nova:{n:"Nova",c:"#e5343d"},ikh:{n:"Ikhsan",c:"#2f6fed"}};
var MP={ali:"IMG-20260903-WA0074.jpg",nova:"IMG-20260903-WA0004.jpg",ikh:"IMG-20260901-WA0016.jpg"};
var MI={
  ali:{full:"Deva Alisha Putri",stage:"Alisha",pos:"Sulung",bd:"2010-10-15",mbti:"INTP"},
  nova:{full:"Novalia Azahra",stage:"Nova",pos:"Main dancer",bd:"2010-11-08",mbti:"INFP"},
  ikh:{full:"Muhamad Ikhsan Maulana",stage:"Ikhsan",pos:"Bungsu",bd:"2010-12-06",mbti:"INFJ"}
};
var BL=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
var uid=null,bias=null,admin=false,mk=null,unsub=null,mph=[];
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function nid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function bdInfo(bd){var p=bd.split("-"),y=+p[0],m=+p[1]-1,d=+p[2],n=new Date(),t=new Date(n.getFullYear(),n.getMonth(),n.getDate()),nb=new Date(t.getFullYear(),m,d);if(nb<t)nb=new Date(t.getFullYear()+1,m,d);var left=Math.round((nb-t)/864e5);return{txt:d+" "+BL[m]+" "+y,age:nb.getFullYear()-y-(left===0?0:1),left:left}}
function shrink(f,m,q){return new Promise(function(ok){var r=new FileReader();r.onload=function(){var i=new Image();i.onload=function(){var c=document.createElement("canvas"),k=Math.min(1,m/Math.max(i.width,i.height));c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);c.getContext("2d").drawImage(i,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",q))};i.src=r.result};r.readAsDataURL(f)})}

var st=document.createElement("style");
st.textContent="#mems .card{cursor:pointer;position:relative}#mems .card::after{content:'›';margin-left:auto;color:var(--mute);font-size:22px}#md{position:fixed;top:0;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:var(--bg);color:var(--fg);z-index:18;overflow-y:auto;padding:env(safe-area-inset-top,0px) 0 40px}.back{border:0;background:none;color:var(--fg);font:600 15px inherit;font-family:inherit;padding:14px 18px;cursor:pointer}.mhead{text-align:center;padding:10px 18px 18px}.mhead img{width:120px;height:120px;border-radius:50%;object-fit:cover;object-position:50% 20%;outline:4px solid var(--c);outline-offset:3px}.mrow{display:flex;justify-content:space-between;gap:12px;padding:12px 18px;border-top:1px solid var(--line);font-size:14px}.mrow span:first-child{color:var(--mute)}.mrow span:last-child{text-align:right;font-weight:600}.mph{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:0 18px}.mph div{position:relative}.mph img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px;cursor:pointer;display:block}.mx{position:absolute;top:4px;right:4px;background:#0008;color:#fff;border-radius:99px;padding:1px 7px;font-size:12px;cursor:pointer}";
document.head.appendChild(st);
var md=document.createElement("div");md.id="md";md.className="hide";document.body.appendChild(md);

function can(k){return admin||bias===k}
function sync(){
  if(unsub){unsub();unsub=null}
  if(!mk||!can(mk))return;
  var k=mk;
  unsub=db.collection("mphotos/"+k+"/items").orderBy("ts","desc").limit(30).onSnapshot(function(s){
    if(mk!==k)return;
    mph=s.docs.map(function(d){var x=d.data();x.id=d.id;return x});renderMd()
  },function(){})
}
function row(a,b){return '<div class="mrow"><span>'+a+'</span><span>'+esc(b)+'</span></div>'}
function renderMd(){
  var k=mk;if(!k)return;
  var i=MI[k],c=B[k].c,b=bdInfo(i.bd);
  var bday=b.txt+" · "+b.age+" tahun"+(b.left===0?" 🎂 hari ini!":b.left<=7?" 🎂 "+b.left+" hari lagi":"");
  var h='<button class="back" id="mdb">‹ Kembali</button><div class="mhead" style="--c:'+c+'"><img src="'+MP[k]+'"><div style="font-size:22px;font-weight:700;margin-top:14px">'+esc(i.stage)+'</div><div style="color:var(--mute);font-size:14px">'+esc(i.pos)+'</div></div>'
   +row("Nama lengkap",i.full)+row("Nama panggung",i.stage)+row("Posisi dalam grup",i.pos)+row("Tanggal lahir",bday)+row("MBTI",i.mbti||"Belum diisi")
   +'<div style="font-weight:700;font-size:16px;padding:22px 18px 10px;border-top:1px solid var(--line)">Foto Eksklusif</div>';
  if(can(k)){
    if(admin)h+='<div style="padding:0 18px 10px"><button class="ib" data-mg="0">🖼 Tambah dari galeri</button><button class="ib" data-mg="1">📷 Kamera</button></div>';
    h+=mph.length?'<div class="mph">'+mph.filter(function(p){return String(p.img).indexOf("data:image/")===0}).map(function(p){return '<div><img src="'+p.img+'" data-big="'+esc(p.id)+'">'+(admin?'<span class="mx" data-mdel="'+esc(p.id)+'">✕</span>':'')+'</div>'}).join("")+'</div>':'<div style="color:var(--mute);text-align:center;padding:24px 18px;font-size:14px">Belum ada foto eksklusif.</div>';
  }else h+='<div class="card" style="text-align:center;margin:0 18px">🔒<div style="color:var(--mute);font-size:14px;margin-top:6px">Foto eksklusif hanya untuk fans yang memilih '+esc(i.stage)+' sebagai bias.</div></div>';
  md.innerHTML=h
}
function openMd(k){mk=k;mph=[];md.classList.remove("hide");md.scrollTop=0;renderMd();sync()}
function closeMd(){mk=null;if(unsub){unsub();unsub=null}md.classList.add("hide")}
function addPhoto(cam){
  var k=mk,f=$(cam?"fc":"fg");f.value="";
  f.onchange=function(){var file=f.files[0];if(!file)return;
    shrink(file,720,.6).then(function(d){db.doc("mphotos/"+k+"/items/"+nid()).set({img:d,ts:Date.now()}).catch(function(){alert("Gagal menyimpan foto. Pastikan kamu admin.")})})};
  f.click()
}
md.onclick=function(e){
  if(e.target.closest("#mdb")){closeMd();return}
  var g=e.target.closest("[data-mg]");if(g){addPhoto(g.dataset.mg==="1");return}
  var x=e.target.closest("[data-mdel]");if(x){if(confirm("Hapus foto ini?"))db.doc("mphotos/"+mk+"/items/"+x.dataset.mdel).delete().catch(function(){alert("Gagal menghapus.")});return}
  var im=e.target.closest("[data-big]");
  if(im){var p=mph.filter(function(q){return q.id===im.dataset.big})[0];
    if(p&&String(p.img).indexOf("data:image/")===0){var v=$("sv");v.style.background="#000 url("+p.img+") center/contain no-repeat";v.innerHTML="";v.classList.remove("hide");v.onclick=function(){v.classList.add("hide")}}}
};
$("mems").addEventListener("click",function(e){
  var c=e.target.closest(".card");if(!c)return;
  var k=KEYS[[].indexOf.call($("mems").children,c)];if(k)openMd(k)
});
fa.onAuthStateChanged(function(u){
  uid=u?u.uid:null;if(!u)return;
  db.doc("profiles/"+uid).onSnapshot(function(d){var nb=d.exists?d.data().bias:null;if(nb!==bias){bias=nb;if(mk){renderMd();sync()}}},function(){});
  db.doc("admins/"+uid).get().then(function(d){if(d.exists){admin=true;if(mk){renderMd();sync()}}},function(){})
});
})();

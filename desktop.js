/* HISYNC desktop: panel kanan (member, ulang tahun, hashtag), scroll horizontal dengan roda mouse,
   dan tombol Esc untuk menutup panel. Dimuat setelah more.js. Di HP panel kanan disembunyikan oleh desktop.css. */
(function(){
var app=document.getElementById("app");if(!app)return;
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function ea(s){return esc(s).replace(/"/g,"&quot;")}
/* samakan tanggal dengan members.js / extras.js bila diubah */
var M=[
  {k:"ali",n:"Alisha",c:"#8a94c8",bd:"2010-10-15",p:"IMG-20260903-WA0074.jpg"},
  {k:"nova",n:"Nova",c:"#ec5f86",bd:"2010-11-08",p:"IMG-20260903-WA0004.jpg"},
  {k:"ikh",n:"Ikhsan",c:"#4f7bff",bd:"2010-12-06",p:"IMG-20260901-WA0016.jpg"}
];
var BL=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
var texts=[],rs=document.createElement("aside");
rs.id="rside";rs.setAttribute("aria-label","Panel samping");app.appendChild(rs);

function wibToday(){var d=new Date(Date.now()+252e5);return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())}
function bdLeft(bd){
  var p=bd.split("-"),m=+p[1]-1,d=+p[2],t=wibToday(),yr=new Date(t).getUTCFullYear(),nb=Date.UTC(yr,m,d);
  if(nb<t){yr++;nb=Date.UTC(yr,m,d)}
  return{left:Math.round((nb-t)/864e5),txt:d+" "+BL[m]}
}
function trending(){
  var c={};
  texts.forEach(function(t){
    var re=new RegExp("(^|[\\s(.,!?])#([\\p{L}\\p{N}_]{2,30})","gu"),m;
    while((m=re.exec(t))){var k=m[2].toLowerCase();c[k]=(c[k]||0)+1}
  });
  return Object.keys(c).sort(function(a,b){return c[b]-c[a]}).slice(0,8).map(function(k){return[k,c[k]]})
}
function render(){
  var b=M.map(function(m){var x=bdLeft(m.bd);x.m=m;return x}).sort(function(a,b){return a.left-b.left}),tr=trending();
  rs.innerHTML='<button class="rsb" data-rs="search" type="button">🔍 Cari postingan, #hashtag, pengguna…</button>'
   +'<div class="rw"><h3>Member</h3>'+M.map(function(m){return '<div class="rmm" data-rs="mem" style="--mc:'+m.c+'"><img src="'+m.p+'" alt=""><div><div class="n">'+esc(m.n)+'</div><div class="tm">Lihat halaman member</div></div></div>'}).join("")+'</div>'
   +'<div class="rw"><h3>🎂 Ulang tahun</h3>'+b.map(function(x){return '<div class="rbd'+(x.left===0?" td":"")+'" style="--mc:'+x.m.c+'"><div class="n">'+esc(x.m.n)+'</div><div class="d">'+(x.left===0?"Hari ini! 🎉":x.left===1?"Besok":x.left+" hari lagi")+'<br>'+esc(x.txt)+'</div></div>'}).join("")+'</div>'
   +'<div class="rw"><h3># Hashtag terbaru</h3>'+(tr.length?'<div class="rht">'+tr.map(function(t){return '<span class="ht" data-ht="'+ea(t[0])+'">#'+esc(t[0])+'<small>'+t[1]+'</small></span>'}).join("")+'</div>':'<div class="tm">Belum ada hashtag. Tulis #sesuatu di postinganmu.</div>')+'</div>'
}
rs.addEventListener("click",function(e){
  var s=e.target.closest("[data-rs]");if(!s)return;
  if(s.getAttribute("data-rs")==="search"){var b=document.querySelector('.hbtn[aria-label="Cari"]');if(b)b.click()}
  else{var n=document.querySelector('#nav button[data-t="mem"]');if(n){n.click();window.scrollTo(0,0)}}
});
render();setInterval(render,60000);

if(typeof firebase!=="undefined"&&firebase.apps&&firebase.apps.length){
  var fa=firebase.auth(),db=firebase.firestore(),flag=false;
  fa.onAuthStateChanged(function(u){
    if(!u||flag)return;flag=true;
    db.collection("posts").orderBy("ts","desc").limit(50).onSnapshot(function(s){
      texts=s.docs.map(function(d){return d.data().text||""});render()
    },function(){})
  })
}

/* roda mouse menggeser story dan chip filter ke samping */
document.addEventListener("wheel",function(e){
  var s=e.target.closest&&e.target.closest(".stories,#fchips");
  if(!s||e.shiftKey||Math.abs(e.deltaY)<=Math.abs(e.deltaX)||s.scrollWidth<=s.clientWidth)return;
  if(e.deltaY>0&&s.scrollLeft+s.clientWidth>=s.scrollWidth-1)return;
  if(e.deltaY<0&&s.scrollLeft<=0)return;
  s.scrollLeft+=e.deltaY;e.preventDefault()
},{passive:false});

/* Esc menutup panel paling atas */
document.addEventListener("keydown",function(e){
  if(e.key!=="Escape")return;
  var sv=document.getElementById("sv");
  if(sv&&!sv.classList.contains("hide")){sv.classList.add("hide");return}
  var best=null,bz=-1;
  [].forEach.call(document.querySelectorAll(".ov2,#srch,#adm,.ov,#sh,#stp"),function(el){
    if(el.classList.contains("hide"))return;
    var cs=getComputedStyle(el);if(cs.display==="none")return;
    var z=parseInt(cs.zIndex,10)||0;if(z>=bz){bz=z;best=el}
  });
  if(!best)return;
  var b=best.querySelector(".sbk,[data-sc],[data-ax],[data-sx],#cmx,#ntx,#scx,[data-bdx]");
  if(b){e.preventDefault();b.click()}
});
})();

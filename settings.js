(function(){
if(typeof firebase==="undefined"||!firebase.apps.length)return;
var $=function(i){return document.getElementById(i)};
var fa=firebase.auth(),db=firebase.firestore(),de=document.documentElement;
function LS(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
var lang=LS("hs_lang")||"id",theme=LS("hs_theme")||"auto",notif=LS("hs_notif")!=="0";
var uid=null,S={},open="",msg="",msgOk=true,busy=false,form={};
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function ea(s){return esc(s).replace(/"/g,"&quot;")}
function T(a,b){return lang==="en"?b:a}

/*TR*/
var raw=["Memuat…","Loading…","Masuk atau buat akun untuk bergabung","Sign in or create an account to join","Lanjut dengan Google","Continue with Google","Lanjut dengan Facebook","Continue with Facebook","atau dengan email","or with email","Masuk","Sign in","Daftar","Sign up","Lupa password?","Forgot password?","atau dengan nomor telepon","or with phone number","Kirim kode SMS","Send SMS code","Verifikasi","Verify","Satu langkah lagi: buat identitasmu di HISYNC","One more step: create your HISYNC identity","Nama tampilan","Display name","Lanjut","Next","Ganti akun","Switch account","Lengkapi profilmu","Complete your profile","Edit profil","Edit profile","Pilih bias dan tulis bio singkat","Pick your bias and write a short bio","🖼 Galeri","🖼 Gallery","📷 Kamera","📷 Camera","Bias favoritmu","Your favorite bias","Simpan","Save","Batal","Cancel","Beranda","Home","Member","Members","Profil","Profile","Kirim","Send","Bagikan","Share","Tutup","Close","Buat Story","Create Story","Hapus","Delete","Laporkan","Report","Blokir","Block","Hapus story","Delete story","Hapus konten","Delete content","Abaikan","Ignore","Komentar","Comments","Notifikasi","Notifications",
"Belum ada postingan. Jadilah yang pertama menyapa 🤍","No posts yet. Be the first to say hi 🤍","Belum ada komentar. Tulis yang pertama!","No comments yet. Write the first one!","Belum ada komentar.","No comments yet.","Belum ada notifikasi.","No notifications yet.","Belum ada obrolan. Sapa fans lain!","No chat yet. Say hi to other fans!","Kamu","You","baru saja","just now","menyukai postinganmu","liked your post",
"Belum ada live","No live yet","Mulai ruang live dan ajak fans ngobrol bareng.","Start a live room and chat with fans.","Judul live","Live title","Mulai Live","Start Live","Akhiri Live","End Live","Live hanya dimulai oleh admin atau member HISYNC. Cek lagi nanti ya 🤍","Live can only be started by admins or HISYNC members. Check back later 🤍",
"Keluar","Sign out","Belum ada bio","No bio yet","Tidak ada laporan.","No reports.","‹ Kembali","‹ Back","Nama lengkap","Full name","Nama panggung","Stage name","Posisi dalam grup","Position in group","Tanggal lahir","Date of birth","Foto Eksklusif","Exclusive Photos","Belum diisi","Not set","Belum ada foto eksklusif.","No exclusive photos yet.","🖼 Tambah dari galeri","🖼 Add from gallery","Sulung","Eldest","Bungsu","Youngest",
"Username bisa diganti 1× tiap 14 hari","Username can be changed once every 14 days","Bias bisa diganti 1× seminggu","Bias can be changed once a week",
"Apa yang kamu rasakan hari ini?","What's on your mind today?","Ketik pesan…","Type a message…","Tulis sesuatu (opsional)","Write something (optional)","Ceritakan tentang dirimu…","Tell us about yourself…","Komentar live…","Live comment…","Tulis komentar…","Write a comment…","Kode 6 digit","6-digit code","Password (min. 6 karakter)","Password (min. 6 characters)","Nama kamu","Your name","tanpa spasi, mis. fans_hisync","no spaces, e.g. fans_hisync","mis. Nonton bareng","e.g. Watch party",
"Gagal menyimpan. Coba lagi.","Couldn't save. Try again.","Gagal menghapus.","Couldn't delete.","Pilih bias dulu ya 🤍","Pick a bias first 🤍","Nama tampilan tidak boleh kosong.","Display name can't be empty.","Username 3–20 huruf/angka/_ tanpa spasi.","Username: 3–20 letters/numbers/_ with no spaces.","Username sudah dipakai.","Username is already taken.","Hapus postingan ini?","Delete this post?","Hapus pesan ini?","Delete this message?","Hapus komentar ini?","Delete this comment?","Hapus story ini?","Delete this story?","Hapus foto ini?","Delete this photo?","Alasan laporan (mis. spam, kasar, tidak pantas):","Reason for report (e.g. spam, rude, inappropriate):","Terima kasih, laporanmu sudah dikirim ke admin.","Thanks, your report was sent to the admins.","Gagal mengirim laporan.","Couldn't send the report.","Gagal mengirim komentar.","Couldn't send the comment.","Kamera tidak tersedia di browser ini.","Camera isn't available in this browser.","Kamera tidak bisa diakses. Izinkan akses kamera di browser, lalu coba lagi.","Can't access the camera. Allow camera access in your browser and try again.","Blokir pengguna ini? Mereka tidak bisa lagi memakai HISYNC.","Block this user? They won't be able to use HISYNC anymore.","Blokir pengguna ini dan hapus kontennya?","Block this user and delete their content?",
"Email atau password salah.","Wrong email or password.","Akun tidak ditemukan.","Account not found.","Email sudah terdaftar, silakan masuk.","Email already registered, please sign in.","Password minimal 6 karakter.","Password must be at least 6 characters.","Format email tidak valid.","Invalid email format.","Kode salah.","Wrong code.","Terlalu banyak percobaan, coba lagi nanti.","Too many attempts, try again later.","Isi email dulu.","Enter your email first.","Link reset password dikirim ke emailmu.","Password reset link sent to your email.","Kode dikirim lewat SMS.","Code sent via SMS.","Akunmu diblokir oleh admin HISYNC.","Your account was blocked by HISYNC admins."];
var D={};for(var i=0;i<raw.length;i+=2)D[raw[i]]=raw[i+1];
var MON={Januari:"January",Februari:"February",Maret:"March",April:"April",Mei:"May",Juni:"June",Juli:"July",Agustus:"August",September:"September",Oktober:"October",November:"November",Desember:"December"};
function dur(s){return s.replace(/(\d+) hari/,"$1 days").replace(/(\d+) jam/,"$1 hours")}
var PT=[
[/^Hai, (.+)$/,"Hi, $1"],
[/^(· )?(\d+) (mnt|jam|hr)$/,function(m,p,n,u){return(p||"")+n+" "+{mnt:"min",jam:"h",hr:"d"}[u]}],
[/^oleh (.+)$/,"by $1"],
[/^(\d+) fans memilih bias ini$/,"$1 fans picked this bias"],
[/^Laporan \((\d+)\)$/,"Reports ($1)"],
[/^Dilaporkan (.+)$/,"Reported by $1"],
[/^mengomentari: (.*)$/,"commented: $1"],
[/^Sisa ganti nama minggu ini: (\d)×$/,"Name changes left this week: $1×"],
[/^Nama sudah diganti 2× minggu ini\. Bisa lagi dalam (.+?)\.?$/,function(m,d){return"Name already changed 2× this week. Available again in "+dur(d)}],
[/^Username (?:baru )?bisa diganti lagi dalam (.+?)\.?$/,function(m,d){return"Username can be changed again in "+dur(d)}],
[/^Bias bisa diganti lagi dalam (.+?)\.?$/,function(m,d){return"Bias can be changed again in "+dur(d)}],
[/^Foto eksklusif hanya untuk fans yang memilih (.+) sebagai bias\.$/,"Exclusive photos are only for fans who picked $1 as their bias."],
[/^(\d+) (\S+) (\d{4}) · (\d+) tahun(?: 🎂 (?:(hari ini!)|(\d+) hari lagi))?$/,function(m,d,mo,y,a,t,n){return d+" "+(MON[mo]||mo)+" "+y+" · "+a+" years old"+(t?" 🎂 today!":n?" 🎂 "+n+" days to go":"")}]
];
function tr(s){var k=s.trim();if(!k)return null;var out=null;
  if(Object.prototype.hasOwnProperty.call(D,k))out=D[k];
  else for(var i=0;i<PT.length;i++){var m=k.match(PT[i][0]);if(m){out=typeof PT[i][1]==="function"?PT[i][1].apply(null,m):k.replace(PT[i][0],PT[i][1]);break}}
  return out===null?null:s.replace(k,function(){return out})}
/*ENDTR*/

var orig=new WeakMap();
function trNode(n){var v=n.nodeValue,t=tr(v);if(t!==null&&t!==v){orig.set(n,v);n.nodeValue=t}}
function trEl(e){var p=e.getAttribute("placeholder");if(p){var t=tr(p);if(t!==null&&t!==p){e.setAttribute("data-oph",p);e.setAttribute("placeholder",t)}}}
function reNode(n){if(orig.has(n)){n.nodeValue=orig.get(n);orig.delete(n)}}
function reEl(e){var p=e.getAttribute("data-oph");if(p!==null){e.setAttribute("placeholder",p);e.removeAttribute("data-oph")}}
function walk(root,fn,fe){if(root.nodeType===1)fe(root);var w=document.createTreeWalker(root,5),n;while((n=w.nextNode())){if(n.nodeType===3)fn(n);else fe(n)}}
function applyLang(){de.lang=lang;if(lang==="en")walk(document.body,trNode,trEl);else walk(document.body,reNode,reEl)}
new MutationObserver(function(ms){if(lang!=="en")return;ms.forEach(function(m){if(m.type==="characterData")trNode(m.target);else m.addedNodes.forEach(function(n){if(n.nodeType===3)trNode(n);else if(n.nodeType===1)walk(n,trNode,trEl)})})}).observe(document.body,{childList:true,subtree:true,characterData:true});
var _a=window.alert,_c=window.confirm,_p=window.prompt;
function X(m){m=String(m);return lang==="en"?(tr(m)||m):m}
window.alert=function(m){return _a.call(window,X(m))};
window.confirm=function(m){return _c.call(window,X(m))};
window.prompt=function(m,d){return _p.call(window,X(m),d)};

function applyTheme(){if(theme==="light"||theme==="dark")de.setAttribute("data-theme",theme);else de.removeAttribute("data-theme")}
function applyNotif(){document.body.classList.toggle("nonotif",!notif)}
function ws(o){if(uid)db.doc("usersettings/"+uid).set(o,{merge:true}).catch(function(){})}
function setTheme(t,save){theme=t;LS("hs_theme",t);applyTheme();if(save!==false)ws({theme:t})}
function setNotif(on,save){notif=on;LS("hs_notif",on?"1":"0");applyNotif();if(save!==false)ws({notif:on})}
function setLang(l,save){lang=l;LS("hs_lang",l);applyLang();render();if(save!==false)ws({lang:l})}
applyTheme();applyNotif();if(lang==="en")applyLang();

var st=document.createElement("style");
st.textContent=".nonotif .bell{display:none!important}#gear{position:absolute;top:10px;right:16px;border:0;background:var(--soft);color:var(--fg);width:38px;height:38px;border-radius:50%;display:grid;place-items:center;cursor:pointer;z-index:2}#stp{position:fixed;top:0;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:var(--bg);color:var(--fg);z-index:19;overflow-y:auto;padding:env(safe-area-inset-top,0px) 0 40px}#stp .back{border:0;background:none;color:var(--fg);font:600 15px inherit;font-family:inherit;padding:14px 18px;cursor:pointer}.sh{font-size:12px;color:var(--mute);padding:22px 18px 8px;font-weight:600}.sr{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 18px;border-top:1px solid var(--line);font-size:14px}.sr span:first-child{color:var(--mute)}.sr span:last-child{text-align:right;font-weight:600;word-break:break-all}.sbtn{display:block;width:calc(100% - 36px);margin:8px 18px 0;border:0;background:var(--soft);color:var(--fg);border-radius:12px;padding:12px 14px;font:600 14px inherit;font-family:inherit;cursor:pointer;text-align:left}.sbtn.d{color:#e5343d}.sfm{padding:6px 18px 4px}.sfm input{margin-top:8px}.sfm .sbtn{width:100%;margin:8px 0 0;text-align:center}.sfm .go{background:var(--acc,#111);color:#fff}.sfm .go.d{background:#e5343d}.snote{color:var(--mute);font-size:13px;padding:6px 18px}.sw{width:46px;height:28px;border-radius:99px;border:0;background:var(--line);position:relative;cursor:pointer;flex:none}.sw::after{content:'';position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:left .15s}.sw.on{background:var(--acc,#111)}.sw.on::after{left:21px}.sseg{display:flex;gap:6px;padding:4px 18px 8px}.sseg button{flex:1;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:10px;padding:10px 4px;font:600 13px inherit;font-family:inherit;cursor:pointer}.sseg button.on{border-color:var(--acc,#111);background:var(--soft)}.smsg{margin:10px 18px 0;padding:10px 12px;border-radius:10px;font-size:13px;background:var(--soft)}.smsg.err{color:#e5343d}.smsg.ok{color:#2e7d32}";
document.head.appendChild(st);
var panel=document.createElement("div");panel.id="stp";panel.className="hide";document.body.appendChild(panel);
var gear=document.createElement("button");gear.id="gear";gear.setAttribute("aria-label","Settings");
gear.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
var vme=$("v-me");vme.style.position="relative";vme.insertBefore(gear,vme.firstChild);

function prov(u){var p=u.providerData&&u.providerData[0];return p?p.providerId:"password"}
function plabel(id){return id==="password"?"Email":id==="google.com"?"Google":id==="facebook.com"?"Facebook":id==="phone"?T("Nomor telepon","Phone number"):id}
function cdate(u){var t=u.metadata&&u.metadata.creationTime;if(!t)return"—";return new Date(t).toLocaleDateString(lang==="en"?"en-US":"id-ID",{day:"numeric",month:"long",year:"numeric"})}
function fv(id){return ea(form[id]||"")}
function say(m,ok){msg=m;msgOk=!!ok;render()}
function emsg(e){var c=e&&e.code||"";
  if(c==="auth/wrong-password"||c==="auth/invalid-credential"||c==="auth/invalid-login-credentials")return T("Password salah.","Wrong password.");
  if(c==="auth/requires-recent-login")return T("Demi keamanan, keluar lalu masuk lagi, kemudian coba kembali.","For security, sign out and sign in again, then try again.");
  if(c==="auth/weak-password")return T("Password baru minimal 6 karakter.","New password must be at least 6 characters.");
  if(c==="auth/email-already-in-use")return T("Email itu sudah dipakai akun lain.","That email is already used by another account.");
  if(c==="auth/invalid-email")return T("Format email tidak valid.","Invalid email format.");
  if(c==="auth/too-many-requests")return T("Terlalu banyak percobaan, coba lagi nanti.","Too many attempts, try again later.");
  if(c==="auth/popup-closed-by-user"||c==="auth/cancelled-popup-request")return T("Konfirmasi dibatalkan.","Confirmation cancelled.");
  return (e&&e.message)||T("Terjadi kesalahan.","Something went wrong.")}
function run(p){busy=true;say(T("Memproses…","Working…"),1);return p.then(null,function(e){say(emsg(e),0)}).then(function(){busy=false;render()})}
function reauth(pw){var u=fa.currentUser,id=prov(u);
  if(id==="password")return u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email,pw));
  if(id==="google.com")return u.reauthenticateWithPopup(new firebase.auth.GoogleAuthProvider());
  if(id==="facebook.com")return u.reauthenticateWithPopup(new firebase.auth.FacebookAuthProvider());
  return Promise.resolve()}

function sect(t){return '<div class="sh">'+t+'</div>'}
function rowv(a,b){return '<div class="sr"><span>'+a+'</span><span>'+b+'</span></div>'}
function seg(items,cur,attr){return '<div class="sseg">'+items.map(function(x){return '<button '+attr+'="'+x[0]+'" class="'+(cur===x[0]?"on":"")+'">'+x[1]+'</button>'}).join("")+'</div>'}
function render(){
  var u=fa.currentUser;if(!u||panel.classList.contains("hide"))return;
  var id=prov(u),pw=id==="password";
  var h='<button class="back" data-a="back">'+T("‹ Kembali","‹ Back")+'</button><div style="font-size:22px;font-weight:700;padding:0 18px 4px">'+T("Pengaturan","Settings")+'</div>';
  if(msg)h+='<div class="smsg '+(msgOk?"ok":"err")+'">'+esc(msg)+'</div>';
  h+=sect(T("Informasi akun","Account info"))+rowv(T("Email / telepon","Email / phone"),esc(u.email||u.phoneNumber||"—"))+rowv(T("Masuk dengan","Signed in with"),esc(plabel(id)))+rowv(T("Akun dibuat","Account created"),esc(cdate(u)));
  h+=sect(T("Keamanan","Security"));
  if(pw){
    h+='<button class="sbtn" data-o="email">'+T("Ganti email","Change email")+'</button>';
    if(open==="email")h+='<div class="sfm"><input id="f-em" type="email" placeholder="'+T("Email baru","New email")+'" value="'+fv("f-em")+'"><input id="f-pw" type="password" placeholder="'+T("Password saat ini","Current password")+'" value="'+fv("f-pw")+'"><button class="sbtn go" data-a="semail">'+T("Kirim link verifikasi","Send verification link")+'</button></div>';
    h+='<button class="sbtn" data-o="pass">'+T("Ganti password","Change password")+'</button>';
    if(open==="pass")h+='<div class="sfm"><input id="f-op" type="password" placeholder="'+T("Password saat ini","Current password")+'" value="'+fv("f-op")+'"><input id="f-np" type="password" placeholder="'+T("Password baru (min. 6 karakter)","New password (min. 6 characters)")+'" value="'+fv("f-np")+'"><button class="sbtn go" data-a="spass">'+T("Simpan password","Save password")+'</button></div>';
  }else h+='<div class="snote">'+T("Email dan password dikelola oleh ","Email and password are managed by ")+esc(plabel(id))+'.</div>';
  h+=sect(T("Nomor telepon (opsional)","Phone number (optional)"))+'<div class="sfm"><input id="f-ph" type="tel" placeholder="+62 812xxxxxxx" value="'+ea(form["f-ph"]!==undefined?form["f-ph"]:(S.phone||""))+'"><button class="sbtn go" data-a="sphone">'+T("Simpan nomor","Save number")+'</button><div class="snote" style="padding:6px 0 0">'+T("Tersimpan privat untuk akunmu dan belum diverifikasi lewat SMS.","Stored privately for your account and not verified by SMS.")+'</div></div>';
  h+=sect(T("Notifikasi","Notifications"))+'<div class="sr"><span style="color:var(--fg)">'+T("Notifikasi di aplikasi","In-app notifications")+'</span><button class="sw'+(notif?" on":"")+'" data-a="notif" aria-label="notifications"></button></div><div class="snote">'+T("Mengatur ikon lonceng 🔔 untuk suka dan komentar.","Controls the 🔔 bell for likes and comments.")+'</div>';
  h+=sect(T("Tampilan","Appearance"))+seg([["auto",T("Otomatis","Auto")],["light",T("Terang","Light")],["dark",T("Gelap","Dark")]],theme,"data-th")+'<div class="snote" style="padding-bottom:2px">'+T("Bahasa aplikasi","App language")+'</div>'+seg([["id","Bahasa Indonesia"],["en","English"]],lang,"data-lg");
  h+=sect(T("Akun","Account"))+'<button class="sbtn" data-a="logout">'+T("Keluar","Sign out")+'</button><button class="sbtn d" data-o="del">'+T("Hapus akun permanen","Delete account permanently")+'</button>';
  if(open==="del")h+='<div class="sfm"><div class="snote" style="padding:6px 0">'+T("Profil, postingan, story, chat, dan notifikasimu akan dihapus selamanya dan tidak bisa dikembalikan. Ketik HAPUS untuk melanjutkan.","Your profile, posts, stories, chats, and notifications will be deleted forever and can't be restored. Type DELETE to continue.")+'</div><input id="f-dw" placeholder="'+T("Ketik HAPUS","Type DELETE")+'" value="'+fv("f-dw")+'">'+(pw?'<input id="f-dp" type="password" placeholder="'+T("Password","Password")+'" value="'+fv("f-dp")+'">':'')+'<button class="sbtn go d" data-a="sdel">'+T("Hapus akun selamanya","Delete account forever")+'</button></div>';
  panel.innerHTML=h
}
function openP(){msg="";open="";form={};panel.classList.remove("hide");panel.scrollTop=0;render()}
function closeP(){panel.classList.add("hide");msg="";open="";form={}}
gear.onclick=openP;

function saveEmail(){var u=fa.currentUser,ne=(form["f-em"]||"").trim(),pwd=form["f-pw"]||"";
  if(!ne||!pwd){say(T("Isi email baru dan password saat ini.","Enter the new email and your current password."),0);return}
  run(reauth(pwd).then(function(){return u.verifyBeforeUpdateEmail?u.verifyBeforeUpdateEmail(ne):u.updateEmail(ne)}).then(function(){form={};open="";say(T("Link verifikasi dikirim ke email baru. Email berubah setelah kamu mengkliknya.","Verification link sent to the new email. Your email changes after
function savePass(){var u=fa.currentUser,op=form["f-op"]||"",np=form["f-np"]||"";
  if(!op||np.length<6){say(T("Isi password saat ini dan password baru (min. 6 karakter).","Enter your current password and a new one (min. 6 characters)."),0);return}
  run(reauth(op).then(function(){return u.updatePassword(np)}).then(function(){form={};open="";say(T("Password berhasil diganti.","Password changed."),1)}))}
function savePhone(){var v=(form["f-ph"]!==undefined?form["f-ph"]:(S.phone||"")).replace(/[\s-]/g,"");
  if(v.charAt(0)==="0")v="+62"+v.slice(1);
  if(v&&!/^\+?\d{9,15}$/.test(v)){say(T("Nomor tidak valid. Contoh: +62812xxxxxxx","Invalid number. Example: +62812xxxxxxx"),0);return}
  run(db.doc("usersettings/"+uid).set({phone:v},{merge:true}).then(function(){form["f-ph"]=v;say(v?T("Nomor tersimpan.","Number saved."):T("Nomor dihapus.","Number removed."),1)}))}
function wipe(c,f,id){return db.collection(c).where(f,"==",id).get().then(function(s){return Promise.all(s.docs.map(function(d){return d.ref.delete()}))})}
function delAcct(){var u=fa.currentUser,w=(form["f-dw"]||"").trim().toUpperCase(),pwd=form["f-dp"]||"";
  if(w!=="HAPUS"&&w!=="DELETE"){say(T("Ketik HAPUS untuk melanjutkan.","Type DELETE to continue."),0);return}
  if(prov(u)==="password"&&!pwd){say(T("Isi password untuk konfirmasi.","Enter your password to confirm."),0);return}
  if(!confirm(T("Yakin hapus akun secara permanen? Ini tidak bisa dibatalkan.","Delete your account permanently? This can't be undone.")))return;
  var id=u.uid;
  run(reauth(pwd).then(function(){return Promise.all(["posts","stories","chat","livechat"].map(function(c){return wipe(c,"uid",id)}).concat([wipe("notifs","to",id)]))})
    .then(function(){return Promise.all([db.doc("profiles/"+id).delete(),db.doc("usersettings/"+id).delete()])})
    .then(function(){db.doc("verified/"+id).delete().catch(function(){});return u.delete()})
    .then(function(){alert(T("Akunmu sudah dihapus.","Your account was deleted."));location.reload()}))}
panel.addEventListener("click",function(e){
  var b=e.target.closest("button");if(!b)return;
  if(b.dataset.a==="back"){closeP();return}
  if(busy)return;
  if(b.dataset.o){open=open===b.dataset.o?"":b.dataset.o;msg="";render();return}
  if(b.dataset.th){setTheme(b.dataset.th);render();return}
  if(b.dataset.lg){setLang(b.dataset.lg);return}
  var a=b.dataset.a;
  if(a==="notif"){setNotif(!notif);render()}
  else if(a==="logout"){fa.signOut().then(function(){location.reload()})}
  else if(a==="sphone")savePhone();
  else if(a==="semail")saveEmail();
  else if(a==="spass")savePass();
  else if(a==="sdel")delAcct()
});
panel.addEventListener("input",function(e){if(e.target.id)form[e.target.id]=e.target.value});

fa.onAuthStateChanged(function(u){
  uid=u?u.uid:null;if(!u)return;
  db.doc("usersettings/"+uid).onSnapshot(function(d){
    S=d.exists?d.data():{};
    if(S.theme&&S.theme!==theme)setTheme(S.theme,false);
    if(S.lang&&S.lang!==lang)setLang(S.lang,false);
    if(typeof S.notif==="boolean"&&S.notif!==notif)setNotif(S.notif,false);
    render()
  },function(){})
});
})();                                                                                                                                                        

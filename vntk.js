/* vntk.js — "Tài khoản vnEdu" (node Admin vnEdu): tài khoản phụ huynh theo SĐT.
   Chọn trường → chọn lớp / tìm học sinh → bấm Copy để gửi tài khoản + mật khẩu cho giáo viên.
   - Xem/tìm: CHỈ ĐỌC (job vnedu_serial, act ph_lop / ph_hs). Máy tính đăng nhập trường qua extension vnEdu.
   - Reset MK: ghi lên vnEdu, luôn có hộp xác nhận trên điện thoại trước khi gửi lệnh (act ph_reset).
   - Dữ liệu (có mật khẩu) chỉ đi qua hàng đợi Jobs đúng 1 lần: đọc xong app ghi đè kết quả để xóa khỏi Sheet. */
var VT={tk:"",truong:"",title:"",lops:[],rows:[],q:"",run:0,view:[]};
var VT_ST={m:"Mật khẩu khởi tạo",s:"Đã gửi SMS",d:"Đã đổi MK",x:"Chưa rõ"};
function vtNo(s){ return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase(); }

/* Gửi lệnh cho máy tính rồi chờ kết quả (tối đa ~3 phút). onProg nhận dòng tiến độ đầu tiên của máy tính. */
function vtRun(params,onProg,maxN){
  return api("job.enqueue",{tool:"vnedu_serial", params:params}).then(function(r){
    var id=r.id, n=0;
    return new Promise(function(res,rej){
      (function poll(){
        api("job.get",{id:id}).then(function(g){
          var j=g.job||{}, t=String(j.ket_qua||"");
          if(j.trang_thai==="done"){ res({id:id,text:t}); return; }
          if(j.trang_thai==="error"||j.trang_thai==="cancelled"){ rej(new Error(t||"Máy tính báo lỗi")); return; }
          // Lệnh ph_/tt_ KHÔNG BAO GIỜ chờ xác nhận. Nếu có → extension trên máy tính còn bản cũ, không hiểu lệnh và chạy nhầm sang quét serial.
          if(j.trang_thai==="await_confirm"){
            api("job.update",{id:id,trang_thai:"cancelled",ket_qua:"Đã hủy: extension vnEdu trên máy tính còn bản cũ."}).catch(function(){});
            rej(new Error("Extension vnEdu trên máy tính còn là bản CŨ nên chạy nhầm sang quét serial (chưa sửa gì, đã hủy lệnh đó). Mở chrome://extensions → bấm ↻ ở “vnEdu – Cập nhật serial chữ ký số” (cần bản 1.12.0) rồi thử lại."));
            return;
          }
          if(onProg) onProg(t.split("\n")[0]);
          if(++n>(maxN||90)){ rej(new Error("Máy tính chưa phản hồi. Kiểm tra máy tính đang bật và Chrome đang mở.")); return; }
          setTimeout(poll,2000);
        }).catch(rej);
      })();
    });
  });
}
/* Đọc xong thì ghi đè kết quả trong Jobs để mật khẩu không nằm lại trên Sheet */
function vtWipe(id){ api("job.update",{id:id,trang_thai:"done",ket_qua:"Đã đọc xong, dữ liệu đã xóa khỏi hàng đợi."}).catch(function(){}); }
function vtCopy(t){
  function ok(){ toast("Đã copy, dán vào Zalo gửi giáo viên"); }
  function fb(){
    var ta=document.createElement("textarea"); ta.value=t; ta.style.cssText="position:fixed;opacity:0;top:0;left:0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try{ document.execCommand("copy"); ok(); }catch(e){ toast("Không copy được, hãy chọn chữ rồi chép tay"); }
    ta.remove();
  }
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok).catch(fb); else fb();
}
/* r = [id, họ tên, tên lớp, id lớp, tài khoản, mật khẩu, trạng thái, ngày sinh, mã HS] */
function vtText(r){
  var l=["Tài khoản vnEdu phụ huynh"+(VT.truong?" – "+VT.truong:""),
         "Học sinh: "+r[1]+(r[2]?" (lớp "+r[2]+")":""),
         "Tài khoản: "+r[4]];
  if(r[6]==="m") l.push("Mật khẩu: "+r[5]);
  else l.push(r[6]==="d"?"Mật khẩu: phụ huynh đã tự đổi (không còn mật khẩu gốc)":"Mật khẩu: đã gửi qua SMS cho phụ huynh");
  return l.join("\n");
}

/* ---------- Bước 1: chọn trường ---------- */
function openVnTk(){
  var acc=vnAccs();
  var h='<div class="sh-h"><span class="ic">'+svg("users")+'</span><div><b>Tài khoản vnEdu</b><div class="sub">Tài khoản phụ huynh theo lớp</div></div></div>'+
    '<p class="sh-d">Chọn trường. Máy tính sẽ đăng nhập admin trường đó rồi lấy danh sách lớp (chỉ đọc, không sửa gì).</p>';
  if(!connected()) h+='<div class="note">Chưa kết nối máy tính nên chưa dùng được chức năng này.</div>';
  if(acc.length) h+=acc.map(function(a,i){ return '<button class="gm" data-s="'+i+'"><span class="ic">'+svg("users")+'</span><span><b>'+esc(a.truong)+'</b><small>'+esc(a.tk)+'</small></span><i>›</i></button>'; }).join("");
  else h+='<div class="note info">Chưa có trường nào trên điện thoại này. Vào Admin vnEdu → vnEdu – Serial → “Lấy danh sách trường từ máy tính” một lần, rồi quay lại đây.</div>';
  h+='<button class="btn sec" id="vtX">Đóng</button>';
  openSheet(h);
  el("vtX").onclick=function(){ VT.run++; closeSheet(); };
  [].forEach.call(document.querySelectorAll("[data-s]"),function(b){ b.onclick=function(){ vtStart(acc[+b.getAttribute("data-s")]); }; });
}

/* ---------- Bước 2: máy tính đăng nhập, lấy danh sách lớp ---------- */
function vtStart(a){
  if(!connected()){ toast("Chưa kết nối máy tính"); return; }
  var my=++VT.run;
  VT.tk=a.tk; VT.truong=a.truong; VT.title=""; VT.lops=[]; VT.rows=[]; VT.q="";
  openSheet('<div class="sh-h"><span class="ic">'+svg("users")+'</span><div><b>'+esc(a.truong)+'</b><div class="sub">Tài khoản vnEdu</div></div></div>'+
    '<div class="note info" id="vtProg">Đang gửi lệnh cho máy tính…</div><button class="btn sec" id="vtX">Đóng</button>');
  el("vtX").onclick=function(){ VT.run++; closeSheet(); };
  vtRun({act:"ph_lop",tk:a.tk,truong:a.truong},function(t){ if(my===VT.run&&el("vtProg")&&t) el("vtProg").textContent=t; }).then(function(r){
    if(my!==VT.run) return;
    var i=r.text.indexOf("§LOP§"); if(i<0) throw new Error("Máy tính trả dữ liệu không đúng");
    var d=JSON.parse(r.text.slice(i+5)); VT.title=d.title||""; VT.lops=d.lops||[];
    vtWipe(r.id); vtMain();
  }).catch(function(e){
    if(my!==VT.run) return;
    var p=el("vtProg"); if(p){ p.className="note err"; p.textContent="Lỗi: "+e.message; }
  });
}

/* ---------- Bước 3: chọn lớp / tìm học sinh / copy ---------- */
function vtMain(){
  var h='<div class="sh-h"><span class="ic">'+svg("users")+'</span><div><b>'+esc(VT.truong)+'</b><div class="sub">'+esc(VT.title)+'</div></div></div>'+
    '<div class="fld"><label>Lớp</label><select id="vtLop">'+VT.lops.map(function(l){ return '<option value="'+esc(l[0])+'">'+esc(l[1])+'</option>'; }).join("")+'</select></div>'+
    '<button class="btn" id="vtGo" style="margin-top:10px">Xem lớp này</button>'+
    '<div class="fld" style="margin-top:14px"><label>Tìm học sinh</label><input id="vtQ" type="text" placeholder="Tên (gõ không dấu được) hoặc SĐT…" autocomplete="off"></div>'+
    '<button class="btn sec" id="vtAll" style="margin-top:8px">Tìm trong cả trường</button>'+
    '<div id="vtInfo"></div><div id="vtList"></div>'+
    '<button class="btn sec" id="vtBack">Đổi trường</button><button class="btn sec" id="vtX">Đóng</button>';
  openSheet(h);
  el("vtX").onclick=function(){ VT.run++; closeSheet(); };
  el("vtBack").onclick=function(){ VT.run++; openVnTk(); };
  el("vtGo").onclick=function(){ vtLoad({lop:el("vtLop").value},"Đang lấy danh sách lớp…"); };
  el("vtAll").onclick=function(){
    var q=el("vtQ").value.trim();
    if(q.length<2){ toast("Gõ ít nhất 2 ký tự để tìm"); return; }
    vtLoad({lop:"0",q:q},"Đang tìm trong cả trường…");
  };
  el("vtQ").oninput=function(){ VT.q=this.value; vtRender(); };   // lọc ngay trên danh sách đang hiện
}
function vtBusy(on){ ["vtGo","vtAll"].forEach(function(i){ if(el(i)) el(i).disabled=on; }); }
function vtLoad(p,label){
  if(!connected()){ toast("Chưa kết nối máy tính"); return; }
  var my=++VT.run;
  var info=el("vtInfo"); info.innerHTML='<div class="note info" id="vtProg">'+esc(label)+'</div>';
  vtBusy(true);
  var par={act:"ph_hs",tk:VT.tk,truong:VT.truong,title:VT.title,lop:p.lop}; if(p.q) par.q=p.q;
  vtRun(par,function(t){ if(my===VT.run&&el("vtProg")&&t) el("vtProg").textContent=t; }).then(function(r){
    if(my!==VT.run) return;
    var i=r.text.indexOf("§PH§"); if(i<0) throw new Error("Máy tính trả dữ liệu không đúng");
    VT.rows=JSON.parse(r.text.slice(i+4));
    VT.q=p.q||"";                                   // tìm cả trường: giữ chữ đã gõ (kết quả đã lọc sẵn); xem lớp: xóa ô tìm
    if(el("vtQ")) el("vtQ").value=VT.q;
    el("vtInfo").innerHTML='<div class="note info">'+esc(r.text.split("\n")[0])+'</div>';
    vtWipe(r.id); vtBusy(false); vtRender();
  }).catch(function(e){
    if(my!==VT.run) return;
    vtBusy(false);
    if(el("vtInfo")) el("vtInfo").innerHTML='<div class="note err">Lỗi: '+esc(e.message)+'</div>';
  });
}
function vtRender(){
  var box=el("vtList"); if(!box) return;
  var q=vtNo(VT.q).trim(), toks=q?q.split(/\s+/):[];
  VT.view=VT.rows.filter(function(r){
    if(!toks.length) return true;
    var s=vtNo(r[1])+" "+r[4]+" "+r[8];
    return toks.every(function(t){ return s.indexOf(t)>=0; });
  });
  if(!VT.view.length){ box.innerHTML=VT.rows.length?'<div class="note">Không có học sinh khớp.</div>':""; return; }
  box.innerHTML=VT.view.map(function(r,i){
    var st=r[6], tagCls=st==="m"?"done":(st==="d"?"cancelled":"await_confirm");
    var h='<div style="border:1px solid var(--line);background:#fff;border-radius:14px;padding:12px;margin-top:10px">'+
      '<div style="display:flex;gap:8px;align-items:center"><b style="color:var(--blue);font-size:15px;flex:1">'+esc(r[1])+'</b><span class="tag '+tagCls+'">'+esc(VT_ST[st]||VT_ST.x)+'</span></div>'+
      '<div class="sub">'+esc((r[2]?"Lớp "+r[2]:"")+(r[7]?" · "+r[7]:"")+(r[8]?" · Mã "+r[8]:""))+'</div>'+
      '<div style="margin-top:8px;font-size:15px">Tài khoản: <b>'+esc(r[4]||"(chưa có)")+'</b></div>'+
      (st==="m"?'<div style="font-size:15px">Mật khẩu: <b>'+esc(r[5])+'</b></div>':'<div class="sub">'+(st==="d"?"Phụ huynh đã đổi mật khẩu, không còn mật khẩu gốc.":"Mật khẩu đã gửi qua SMS cho phụ huynh.")+'</div>')+
      '<div style="display:flex;gap:8px"><button class="btn" data-c="'+i+'" style="margin-top:10px;padding:11px;font-size:14px;flex:1">Copy gửi GV</button>'+
      (st!=="m"?'<button class="btn danger" data-r="'+i+'" style="margin-top:10px;padding:11px;font-size:14px;flex:1">Reset MK</button>':'')+'</div></div>';
    return h;
  }).join("");
  [].forEach.call(box.querySelectorAll("[data-c]"),function(b){ b.onclick=function(){ vtCopy(vtText(VT.view[+b.getAttribute("data-c")])); }; });
  [].forEach.call(box.querySelectorAll("[data-r]"),function(b){ b.onclick=function(){ vtReset(VT.view[+b.getAttribute("data-r")]); }; });
}

/* ---------- Reset mật khẩu (GHI lên vnEdu): chỉ chạy sau khi anh bấm OK ở hộp xác nhận ---------- */
function vtReset(r){
  if(!r) return;
  if(!confirm("Reset mật khẩu phụ huynh của "+r[1]+(r[2]?" (lớp "+r[2]+")":"")+"?\n\nvnEdu sẽ đặt lại mật khẩu cho tài khoản "+r[4]+". vnEdu sẽ đặt lại mật khẩu và GỬI SMS cho phụ huynh. Nếu vnEdu hiện mật khẩu mới thì app sẽ hiện ngay để anh bấm Copy; nếu vnEdu chỉ ghi \"Đã gửi SMS\" thì mật khẩu chỉ nằm trong tin nhắn của phụ huynh. Không hoàn tác được.")) return;
  var my=++VT.run;
  vtBusy(true);
  el("vtInfo").innerHTML='<div class="note info" id="vtProg">Đang gửi lệnh reset cho máy tính…</div>';
  vtRun({act:"ph_reset",tk:VT.tk,truong:VT.truong,title:VT.title,lop:r[3],hs:r[0]},function(t){ if(my===VT.run&&el("vtProg")&&t) el("vtProg").textContent=t; }).then(function(res){
    if(my!==VT.run) return;
    var i=res.text.indexOf("§PH§"); if(i<0) throw new Error("Máy tính trả dữ liệu không đúng");
    var nr=JSON.parse(res.text.slice(i+4))[0];
    if(nr) VT.rows=VT.rows.map(function(x){ return x[0]===nr[0]?nr:x; });
    el("vtInfo").innerHTML='<div class="note info">Đã reset: '+esc(r[1])+'. '+esc(res.text.split("\n")[0])+''+(nr&&nr[6]==="m"?" Mật khẩu mới hiện bên dưới, bấm Copy gửi GV.":" vnEdu chưa hiện mật khẩu mới (chỉ ghi Đã gửi SMS). Anh thử tìm lại học sinh sau ít phút, hoặc xin phụ huynh đọc lại tin nhắn.")+'</div>';
    vtWipe(res.id); vtBusy(false); vtRender();
  }).catch(function(e){
    if(my!==VT.run) return;
    vtBusy(false);
    if(el("vtInfo")) el("vtInfo").innerHTML='<div class="note err">Lỗi: '+esc(e.message)+'</div>';
  });
}

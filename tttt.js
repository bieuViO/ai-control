/* tttt.js — "Quản lý thanh toán" (node Admin vnEdu): đối chiếu thanh toán đợt "Sổ liên lạc điện tử VnEdu" → đăng ký / hủy gói SLL.
   Quy tắc: đã đóng + chưa đăng ký → ĐĂNG KÝ (khối 1-5 gói 50, khối 6-12 gói 70) · đã đóng + đã đăng ký → giữ nguyên ·
            chưa đóng + đang đăng ký → HỦY · chưa đóng + chưa đăng ký → bỏ qua · học sinh không có phiếu thu → không đụng tới.
   - Bước đối chiếu (tt_plan): CHỈ ĐỌC. Bước áp dụng (tt_apply): GHI lên vnEdu, chỉ chạy sau khi anh bấm xác nhận trên điện thoại.
   Dùng chung hàm vtRun / vtWipe / vnAccs của vntk.js và app chính. */
var TT={tk:"",truong:"",plan:null,run:0};

function tNum(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,"."); }

/* ---------- Bước 1: chọn trường ---------- */
function openTt(){
  var acc=vnAccs();
  var h='<div class="sh-h"><span class="ic">'+svg("users")+'</span><div><b>Quản lý thanh toán</b><div class="sub">Đối chiếu SLL · Nhắc nợ phụ huynh</div></div></div>'+
    '<p class="sh-d">Chọn trường. Máy tính đăng nhập admin trường đó rồi đối chiếu đợt “Sổ liên lạc điện tử VnEdu” (chỉ đọc, chưa sửa gì).</p>';
  if(!connected()) h+='<div class="note">Chưa kết nối máy tính nên chưa dùng được chức năng này.</div>';
  if(acc.length) h+=acc.map(function(a,i){ return '<button class="gm" data-s="'+i+'"><span class="ic">'+svg("users")+'</span><span><b>'+esc(a.truong)+'</b><small>'+esc(a.tk)+'</small></span><i>›</i></button>'; }).join("");
  else h+='<div class="note info">Chưa có trường nào trên điện thoại này. Vào Admin vnEdu → vnEdu – Serial → “Lấy danh sách trường từ máy tính” một lần, rồi quay lại đây.</div>';
  h+='<button class="btn sec" id="ttX">Đóng</button>';
  openSheet(h);
  el("ttX").onclick=function(){ TT.run++; closeSheet(); };
  [].forEach.call(document.querySelectorAll("[data-s]"),function(b){ b.onclick=function(){ ttMenu(acc[+b.getAttribute("data-s")]); }; });
}

/* ---------- Chọn việc: đối chiếu đăng ký/hủy SLL hoặc nhắc nợ ---------- */
function ttMenu(a){
  TT.tk=a.tk; TT.truong=a.truong;
  openSheet('<div class="sh-h"><span class="ic">'+svg("users")+'</span><div><b>'+esc(a.truong)+'</b><div class="sub">Quản lý thanh toán</div></div></div>'+
    '<button class="gm" id="ttM1"><span class="ic">'+svg("users")+'</span><span><b>Đăng ký / hủy gói SLL theo thanh toán</b><small>Đã đóng → đăng ký, chưa đóng → hủy (đợt Sổ liên lạc điện tử)</small></span><i>›</i></button>'+
    '<button class="gm" id="ttM2"><span class="ic">'+svg("users")+'</span><span><b>Nhắc nợ phụ huynh</b><small>Gửi thông báo nợ cho học sinh chưa đóng, toàn trường theo từng đợt</small></span><i>›</i></button>'+
    '<button class="btn sec" id="ttBack">Đổi trường</button><button class="btn sec" id="ttX">Đóng</button>');
  el("ttX").onclick=function(){ TT.run++; closeSheet(); };
  el("ttBack").onclick=function(){ TT.run++; openTt(); };
  el("ttM1").onclick=function(){ ttPlan(a); };
  el("ttM2").onclick=function(){ ttNhacPlan(a); };
}

/* ---------- Nhắc nợ phụ huynh (dùng chức năng "Gửi thông báo nợ" của vnEdu) ---------- */
var TT_NHAC_MAU="(TB) Học sinh [TEN_HOC_SINH], ma [MA_HS] cần nộp số tiền [SO_TIEN] VND. Truy cập ứng dụng vnEdu Connect hoặc VNPT Money để dễ dàng thanh toán online.";
function ttNhacPlan(a){
  if(!connected()){ toast("Chưa kết nối máy tính"); return; }
  var my=++TT.run; TT.tk=a.tk; TT.truong=a.truong; TT.nhac=null;
  openSheet('<div class="sh-h"><span class="ic">'+svg("users")+'</span><div><b>'+esc(a.truong)+'</b><div class="sub">Nhắc nợ phụ huynh</div></div></div>'+
    '<div class="note info" id="ttProg">Đang gửi lệnh cho máy tính…</div><button class="btn sec" id="ttX">Đóng</button>');
  el("ttX").onclick=function(){ TT.run++; closeSheet(); };
  vtRun({act:"tt_nhac_plan",tk:a.tk,truong:a.truong,title:""},function(t){ if(my===TT.run&&el("ttProg")&&t) el("ttProg").textContent=t; },150).then(function(r){
    if(my!==TT.run) return;
    var i=r.text.indexOf("§NHAC§"); if(i<0) throw new Error("Máy tính trả dữ liệu không đúng");
    TT.nhac=JSON.parse(r.text.slice(i+6)); vtWipe(r.id); ttNhacShow();
  }).catch(function(e){
    if(my!==TT.run) return;
    var p=el("ttProg"); if(p){ p.className="note err"; p.textContent="Lỗi: "+e.message; }
  });
}
function ttNhacShow(){
  var N=TT.nhac, keep=el("ttNd")?el("ttNd").value:TT_NHAC_MAU;
  var h='<div class="sh-h"><span class="ic">'+svg("users")+'</span><div><b>'+esc(TT.truong)+'</b><div class="sub">Nhắc nợ phụ huynh · toàn trường</div></div></div>'+
    '<div class="fld"><label>Đợt thanh toán</label><select id="ttDot">'+N.dots.map(function(d,i){
      var todo=d.n-d.sent;
      return '<option value="'+i+'"'+(d.expired||todo<=0?' disabled':'')+'>'+esc(d.ten)+' — chưa đóng '+tNum(d.n)+(d.sent?' (đã nhắc hôm nay '+tNum(d.sent)+')':'')+(d.expired?' · HẾT HẠN':'')+'</option>'; }).join("")+'</select></div>'+
    '<div id="ttDotInfo"></div>'+
    '<div class="fld" style="margin-top:10px"><label>Gửi bằng</label><select id="ttTy"><option value="1">Ứng dụng vnEdu Connect (miễn phí)</option><option value="3">SMS VNPT Money (miễn phí)</option><option value="2">SMS Sổ liên lạc (có thể tính cước)</option></select></div>'+
    '<div class="fld" style="margin-top:10px"><label>Nội dung (tối đa 150 ký tự; giữ [TEN_HOC_SINH] [MA_HS] [SO_TIEN] để vnEdu tự điền)</label><textarea id="ttNd" rows="4" maxlength="150" style="width:100%;box-sizing:border-box">'+esc(keep)+'</textarea></div>'+
    '<div class="sub" id="ttLen"></div>'+
    '<button class="btn danger" id="ttSend" style="margin-top:12px">Gửi nhắc nợ</button>'+
    '<div id="ttOut"></div><button class="btn sec" id="ttRe">Lấy lại số liệu</button><button class="btn sec" id="ttBack">Quay lại</button><button class="btn sec" id="ttX">Đóng</button>';
  openSheet(h);
  var sel=el("ttDot"); for(var k=0;k<sel.options.length;k++){ if(!sel.options[k].disabled){ sel.selectedIndex=k; break; } }
  function upd(){
    var d=N.dots[+sel.value], len=el("ttNd").value.length;
    el("ttLen").textContent=len+"/150 ký tự";
    el("ttDotInfo").innerHTML=d?'<div class="note '+(d.expired?'err':'info')+'">'+(d.expired?'Đợt đã hết hạn ('+esc(d.end)+'), vnEdu không cho gửi thông báo.':'Hạn đóng '+esc(d.end)+' · Chưa đóng: <b>'+tNum(d.n)+'</b> em · Sẽ nhắc: <b>'+tNum(Math.max(0,d.n-d.sent))+'</b> em (bỏ qua em đã nhắc hôm nay) · Tổng tiền chưa thu: '+tNum(d.sum)+' đ')+'</div>':'';
  }
  sel.onchange=upd; el("ttNd").oninput=upd; upd();
  el("ttX").onclick=function(){ TT.run++; closeSheet(); };
  el("ttBack").onclick=function(){ TT.run++; ttMenu({tk:TT.tk,truong:TT.truong}); };
  el("ttRe").onclick=function(){ ttNhacPlan({tk:TT.tk,truong:TT.truong}); };
  el("ttSend").onclick=ttNhacSend;
}
function ttNhacSend(){
  var N=TT.nhac, d=N.dots[+el("ttDot").value], ty=el("ttTy").value, nd=el("ttNd").value.trim();
  if(!d||d.expired){ toast("Đợt này không gửi được"); return; }
  var todo=Math.max(0,d.n-d.sent);
  if(!todo){ toast("Không còn em nào cần nhắc hôm nay"); return; }
  if(!nd||nd.length>150){ toast("Nội dung phải có chữ và tối đa 150 ký tự"); return; }
  var kenh=ty==="1"?"ứng dụng vnEdu Connect":(ty==="3"?"SMS VNPT Money":"SMS Sổ liên lạc (có thể bị tính cước)");
  if(!confirm("Gửi nhắc nợ cho "+tNum(todo)+" học sinh CHƯA đóng của đợt:\n"+d.ten+"\nTrường: "+TT.truong+"\nGửi bằng: "+kenh+"\n\nNội dung:\n"+nd+"\n\nTin gửi thật tới phụ huynh, không thu hồi được. Tiếp tục?")) return;
  if(ty==="2"&&!confirm("SMS Sổ liên lạc có thể bị trừ cước theo gói của trường. Vẫn gửi?")) return;
  if(!connected()){ toast("Chưa kết nối máy tính"); return; }
  var my=++TT.run;
  ["ttSend","ttRe"].forEach(function(i){ if(el(i)) el(i).disabled=true; });
  el("ttOut").innerHTML='<div class="note info" id="ttProg">Đang gửi lệnh cho máy tính… (có thể mất vài phút, đừng đóng Chrome)</div>';
  vtRun({act:"tt_nhac_send",tk:TT.tk,truong:TT.truong,title:N.title,dot:d.id,type:ty,content:nd},
    function(t){ if(my===TT.run&&el("ttProg")&&t) el("ttProg").textContent=t; },300).then(function(r){
    var i=r.text.indexOf("§NHACS§"); if(i<0) throw new Error("Máy tính trả dữ liệu không đúng");
    var x=JSON.parse(r.text.slice(i+7)); vtWipe(r.id);
    d.sent+=x.sent;                                  // cập nhật số đã nhắc hôm nay trên màn hình
    if(el("ttOut")) el("ttOut").innerHTML='<div class="note info">Xong: đã nhắc <b>'+tNum(x.sent)+'</b> em (bỏ qua '+tNum(x.skipped)+' em đã nhắc hôm nay).'+(x.msg?'<br>vnEdu: '+esc(x.msg):'')+'</div>';
    ["ttSend","ttRe"].forEach(function(k){ if(el(k)) el(k).disabled=false; });
  }).catch(function(e){
    if(el("ttOut")) el("ttOut").innerHTML='<div class="note err">Lỗi: '+esc(e.message)+'<br>Bấm “Lấy lại số liệu” để xem tình trạng thực tế trước khi gửi tiếp (em đã nhắc sẽ được bỏ qua).</div>';
    ["ttSend","ttRe"].forEach(function(k){ if(el(k)) el(k).disabled=false; });
  });
}

/* ---------- Bước 2: đối chiếu (chỉ đọc) ---------- */
function ttPlan(a){
  if(!connected()){ toast("Chưa kết nối máy tính"); return; }
  var my=++TT.run; TT.tk=a.tk; TT.truong=a.truong; TT.plan=null;
  openSheet('<div class="sh-h"><span class="ic">'+svg("users")+'</span><div><b>'+esc(a.truong)+'</b><div class="sub">Đang đối chiếu thanh toán</div></div></div>'+
    '<div class="note info" id="ttProg">Đang gửi lệnh cho máy tính…</div><button class="btn sec" id="ttX">Đóng</button>');
  el("ttX").onclick=function(){ TT.run++; closeSheet(); };
  vtRun({act:"tt_plan",tk:a.tk,truong:a.truong,title:""},function(t){ if(my===TT.run&&el("ttProg")&&t) el("ttProg").textContent=t; },150).then(function(r){
    if(my!==TT.run) return;
    var i=r.text.indexOf("§TT§"); if(i<0) throw new Error("Máy tính trả dữ liệu không đúng");
    TT.plan=JSON.parse(r.text.slice(i+4)); vtWipe(r.id); ttShow();
  }).catch(function(e){
    if(my!==TT.run) return;
    var p=el("ttProg"); if(p){ p.className="note err"; p.textContent="Lỗi: "+e.message; }
  });
}

/* Cộng số liệu theo khối. Dòng lớp: [id, tên, khối, hs, đang ĐK, sẽ ĐK, sẽ hủy, giữ, bỏ qua, không phiếu] */
function ttSum(){
  var P=TT.plan, K={}, T={hs:0,dk:0,reg:0,can:0,keep:0,skip:0,none:0};
  P.lops.forEach(function(l){
    var k=K[l[2]]=K[l[2]]||{hs:0,dk:0,reg:0,can:0,keep:0,skip:0,none:0};
    [[k,T]].forEach(function(p){ p.forEach(function(o){ o.hs+=l[3]; o.dk+=l[4]; o.reg+=l[5]; o.can+=l[6]; o.keep+=l[7]; o.skip+=l[8]; o.none+=l[9]; }); });
  });
  return {K:K,T:T};
}
/* Số em ĐĂNG KÝ thực sự làm được: chỉ khối có gói đúng cấp */
function ttGoiOK(k){ var g=TT.plan.goi[k]; return !!(g&&g[2]); }
function ttItems(mode){
  return TT.plan.lops.filter(function(l){ return (ttGoiOK(l[2])?l[5]:0)+(mode==="reg"?0:l[6])>0; })
    .map(function(l){ var g=TT.plan.goi[l[2]]; return [l[0],(g&&g[2])?g[0]:"",l[1]]; });
}

function ttShow(){
  var P=TT.plan, S=ttSum(), T=S.T, pct=T.dk?Math.round(T.can*100/T.dk):0, big=pct>=30;
  var h='<div class="sh-h"><span class="ic">'+svg("users")+'</span><div><b>'+esc(TT.truong)+'</b><div class="sub">'+esc(P.dot.ten)+'</div></div></div>'+
    '<div class="note info">Đã đóng: <b>'+tNum(P.paid)+'</b> em · Chưa đóng: <b>'+tNum(P.unpaid)+'</b> em · Tổng học sinh: <b>'+tNum(T.hs)+'</b></div>'+
    '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:8px"><tr style="text-align:left;color:#666"><th>Khối</th><th>HS</th><th>Đang ĐK</th><th>Sẽ ĐK</th><th>Sẽ hủy</th><th>Giữ</th></tr>'+
    Object.keys(S.K).sort(function(a,b){return a-b;}).map(function(k){ var o=S.K[k];
      return '<tr style="border-top:1px solid var(--line)"><td><b>'+k+'</b></td><td>'+o.hs+'</td><td>'+o.dk+'</td><td>'+(ttGoiOK(k)?o.reg:(o.reg?'<span style="color:#c0392b">'+o.reg+'*</span>':0))+'</td><td><b>'+o.can+'</b></td><td>'+o.keep+'</td></tr>'; }).join("")+
    '<tr style="border-top:2px solid var(--line)"><td><b>Cộng</b></td><td>'+T.hs+'</td><td>'+T.dk+'</td><td>'+T.reg+'</td><td><b>'+T.can+'</b></td><td>'+T.keep+'</td></tr></table>'+
    '<div class="sub" style="margin-top:6px">Bỏ qua (chưa đóng, chưa đăng ký): '+T.skip+' · Không có phiếu thu (không đụng tới): '+T.none+'</div>';
  var gk=Object.keys(P.goi).sort(function(a,b){return a-b;}).filter(function(k){ return !P.goi[k][2]; });
  if(gk.length) h+='<div class="note err">* Khối '+gk.join(", ")+': không xác định được gói đúng cấp (khối 1-5 cần gói 50, khối 6-12 cần gói 70) nên sẽ KHÔNG đăng ký cho các khối này.</div>';
  if(big) h+='<div class="note err"><b>Cảnh báo:</b> sẽ hủy '+tNum(T.can)+' / '+tNum(T.dk)+' em đang đăng ký ('+pct+'%). Phụ huynh những em này sẽ ngừng nhận SLL. Chỉ nên bấm khi đã qua hạn đóng tiền.</div>';
  h+='<button class="btn" id="ttReg" style="margin-top:12px">Chỉ ĐĂNG KÝ người đã đóng ('+tNum(ttGoiOKReg())+' em)</button>'+
     '<button class="btn danger" id="ttAll" style="margin-top:8px">Đăng ký + HỦY người chưa đóng ('+tNum(ttGoiOKReg()+T.can)+' em)</button>'+
     '<div id="ttOut"></div><button class="btn sec" id="ttRe">Đối chiếu lại</button><button class="btn sec" id="ttBack">Đổi trường</button><button class="btn sec" id="ttX">Đóng</button>';
  openSheet(h);
  el("ttX").onclick=function(){ TT.run++; closeSheet(); };
  el("ttBack").onclick=function(){ TT.run++; openTt(); };
  el("ttRe").onclick=function(){ ttPlan({tk:TT.tk,truong:TT.truong}); };
  el("ttReg").onclick=function(){ ttApply("reg"); };
  el("ttAll").onclick=function(){ ttApply("all"); };
}
function ttGoiOKReg(){ var n=0; TT.plan.lops.forEach(function(l){ if(ttGoiOK(l[2])) n+=l[5]; }); return n; }

/* ---------- Bước 3: áp dụng (GHI lên vnEdu) — chỉ sau khi anh xác nhận ---------- */
function ttApply(mode){
  var items=ttItems(mode), S=ttSum(), reg=ttGoiOKReg(), can=mode==="reg"?0:S.T.can;
  if(!items.length||(reg+can)===0){ toast("Không có em nào cần đổi"); return; }
  var msg="Áp dụng cho "+items.length+" lớp của "+TT.truong+":\n• ĐĂNG KÝ gói: "+reg+" em đã đóng"+(can?"\n• HỦY gói: "+can+" em chưa đóng":"")+"\n\nGhi thẳng lên vnEdu, không hoàn tác tự động. Tiếp tục?";
  if(!confirm(msg)) return;
  if(can&&S.T.dk&&can*100/S.T.dk>=30&&!confirm("XÁC NHẬN LẦN CUỐI: sẽ HỦY "+can+" em ("+Math.round(can*100/S.T.dk)+"% số đang đăng ký). Đã qua hạn đóng tiền chưa?")) return;
  if(!connected()){ toast("Chưa kết nối máy tính"); return; }
  var my=++TT.run;
  ["ttReg","ttAll","ttRe"].forEach(function(i){ if(el(i)) el(i).disabled=true; });
  el("ttOut").innerHTML='<div class="note info" id="ttProg">Đang gửi lệnh cho máy tính… (có thể mất vài phút, đừng đóng Chrome)</div>';
  vtRun({act:"tt_apply",tk:TT.tk,truong:TT.truong,title:TT.plan.title,dot:TT.plan.dot.id,mode:mode,items:JSON.stringify(items)},
    function(t){ if(my===TT.run&&el("ttProg")&&t) el("ttProg").textContent=t; },600).then(function(r){
    var i=r.text.indexOf("§TTA§"); if(i<0) throw new Error("Máy tính trả dữ liệu không đúng");
    var d=JSON.parse(r.text.slice(i+5)); vtWipe(r.id);
    var reg2=0,can2=0,bad=null; d.results.forEach(function(x){ if(x.err||x.left>0) bad=bad||x; reg2+=x.register||0; can2+=x.cancel||0; });
    var okAll=!bad&&d.results.length===d.total;
    if(el("ttOut")) el("ttOut").innerHTML='<div class="note '+(okAll?'info':'err')+'">'+(okAll?'Xong: ':'DỪNG: ')+'đã đăng ký '+reg2+' em, hủy '+can2+' em ('+d.results.length+'/'+d.total+' lớp).'+
      (bad?'<br>Lớp '+esc(bad.lop)+': '+esc(bad.err||("ghi xong nhưng còn "+bad.left+" em chưa khớp, đã dừng để kiểm tra"))+'.':'')+'</div>';
    ["ttReg","ttAll","ttRe"].forEach(function(i){ if(el(i)) el(i).disabled=false; });
    if(okAll&&el("ttRe")) el("ttRe").textContent="Đối chiếu lại để kiểm tra";
  }).catch(function(e){
    if(el("ttOut")) el("ttOut").innerHTML='<div class="note err">Lỗi: '+esc(e.message)+'<br>Hãy bấm “Đối chiếu lại” để xem tình trạng thực tế trước khi chạy tiếp.</div>';
    ["ttReg","ttAll","ttRe"].forEach(function(i){ if(el(i)) el(i).disabled=false; });
  });
}

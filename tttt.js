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
  var h='<div class="sh-h"><span class="ic">'+svg("users")+'</span><div><b>Quản lý thanh toán</b><div class="sub">Đối chiếu đã đóng / chưa đóng → đăng ký, hủy SLL</div></div></div>'+
    '<p class="sh-d">Chọn trường. Máy tính đăng nhập admin trường đó rồi đối chiếu đợt “Sổ liên lạc điện tử VnEdu” (chỉ đọc, chưa sửa gì).</p>';
  if(!connected()) h+='<div class="note">Chưa kết nối máy tính nên chưa dùng được chức năng này.</div>';
  if(acc.length) h+=acc.map(function(a,i){ return '<button class="gm" data-s="'+i+'"><span class="ic">'+svg("users")+'</span><span><b>'+esc(a.truong)+'</b><small>'+esc(a.tk)+'</small></span><i>›</i></button>'; }).join("");
  else h+='<div class="note info">Chưa có trường nào trên điện thoại này. Vào Admin vnEdu → vnEdu – Serial → “Lấy danh sách trường từ máy tính” một lần, rồi quay lại đây.</div>';
  h+='<button class="btn sec" id="ttX">Đóng</button>';
  openSheet(h);
  el("ttX").onclick=function(){ TT.run++; closeSheet(); };
  [].forEach.call(document.querySelectorAll("[data-s]"),function(b){ b.onclick=function(){ ttPlan(acc[+b.getAttribute("data-s")]); }; });
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

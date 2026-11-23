/* ĐIỂM DANH – báo cáo nhanh theo lớp cho Ban giám hiệu (THPT Chơn Thành).
   Dữ liệu: tab DIEM_DANH trong Sheet AI_CONTROL (backend DiemDanh.gs: dd.get). Lấy mới từ vnEdu: nút "Lấy báo cáo mới nhất"
   → job vnedu_serial act dd_scan → extension vnEdu trên máy tính quét rồi dd.save. */
"use strict";
(function () {
  var TH_BAD = 85, TH_WARN = 95;          // % điểm danh: dưới 85 = đỏ, 85–95 = vàng, từ 95 = xanh
  var stl = document.createElement("style");
  stl.textContent =
    ".ddchips{display:flex;gap:8px;overflow-x:auto;padding:2px 0 8px;-webkit-overflow-scrolling:touch;scrollbar-width:none}.ddchips::-webkit-scrollbar{display:none}" +
    ".ddchips button{flex:0 0 auto;border:1px solid var(--line);background:#fff;border-radius:12px;padding:7px 12px;font:inherit;text-align:center;line-height:1.25;color:var(--ink,#1b2430)}" +
    ".ddchips button b{display:block;font-size:14px}.ddchips button small{display:block;font-size:11.5px;color:var(--mute)}.ddchips button.on{background:#0B3D91;border-color:#0B3D91;color:#fff}.ddchips button.on small{color:#D6E2FF}" +
    ".ddchips.ddwrap{flex-wrap:wrap;overflow:visible;gap:6px}.ddchips.ddwrap button{padding:6px 10px;min-width:58px}" +
    ".dddate{display:flex;gap:8px;align-items:center;margin:4px 0 10px}.ddnav{flex:0 0 46px;height:46px;border:1px solid var(--line);background:#fff;border-radius:12px;font-size:24px;line-height:1;color:#0B3D91}.ddnav:disabled{opacity:.3}.ddpick{position:relative;flex:1;height:46px;border:1px solid var(--line);background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:#0B3D91}.ddpick small{font-weight:400;color:var(--mute);font-size:13px;margin-left:5px}.ddpick input{position:absolute;left:0;top:0;width:100%;height:100%;opacity:0;cursor:pointer}" +
    ".ddseg{display:flex;gap:8px;margin:2px 0 10px}.ddseg button{flex:1;border:1px solid var(--line);background:#fff;border-radius:22px;padding:9px 6px;font:inherit;font-weight:600;color:#0B3D91}.ddseg button.on{background:#0B3D91;border-color:#0B3D91;color:#fff}" +
    ".ddsum{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:6px}.ddsum div{border-radius:14px;padding:10px 8px;text-align:center;background:#EEF3FB;color:#0B3D91}.ddsum b{display:block;font-size:22px;line-height:1.2}.ddsum small{display:block;font-size:12px;color:var(--mute)}" +
    ".ddsum div.bad{background:#FBEAE9;color:#B23A34}.ddsum div.warn{background:#FFF3DC;color:#8A5200}.ddsum div.ok{background:#E6F5EC;color:#1E7A46}" +
    ".ddh{margin:16px 0 6px;font-weight:700;font-size:15px}.ddh small{font-weight:400;color:var(--mute);font-size:12.5px}" +
    ".ddk{display:flex;gap:8px;flex-wrap:wrap}.ddk span{flex:1 1 30%;border-radius:12px;padding:8px;text-align:center;font-size:13px;background:#F4F6FA}.ddk span b{display:block;font-size:17px}" +
    ".ddk .bad{background:#FBEAE9;color:#B23A34}.ddk .warn{background:#FFF3DC;color:#8A5200}.ddk .ok{background:#E6F5EC;color:#1E7A46}" +
    ".ddl{width:100%;border:1px solid var(--line);background:#fff;border-radius:14px;padding:10px 12px;margin-top:8px;text-align:left;font:inherit;display:block;color:var(--ink,#1b2430)}" +
    ".ddl .r1{display:flex;justify-content:space-between;align-items:center;gap:8px}.ddl .r1 b{font-size:16px}.ddl .pc{font-weight:700;border-radius:10px;padding:2px 9px;font-size:14px}" +
    ".ddl .pc.bad{background:#FBEAE9;color:#B23A34}.ddl .pc.warn{background:#FFF3DC;color:#8A5200}.ddl .pc.ok{background:#E6F5EC;color:#1E7A46}" +
    ".ddst4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.ddst4 span{background:#F4F6FA;border-radius:10px;padding:6px 2px;text-align:center;font-size:11px;line-height:1.25;color:var(--mute)}.ddst4 b{display:block;font-size:17px;color:#1b2430}" +
    ".ddst4 .ok b{color:#1E7A46}.ddst4 .ph b{color:#0B3D91}.ddst4 .kp{background:#FBEAE9}.ddst4 .kp b{color:#B23A34}" +
    ".ddsum .tap{cursor:pointer;box-shadow:inset 0 0 0 2px #0B3D91}.ddsum .tap small.hint{color:#0B3D91;font-weight:600}.ddbk{border:1px solid var(--line);background:#fff;border-radius:12px;padding:8px 12px;font:inherit;font-weight:600;color:#0B3D91;margin:4px 0 6px}.ddcls .nm{margin-top:6px;border-top:1px dashed var(--line);padding-top:6px;font-size:14px}.ddcls .nm div{padding:3px 0}.ddcls .nm em{font-style:normal;color:#1E7A46;font-size:12px;margin-left:4px}" +
    ".ddl .r2{font-size:12.5px;color:var(--mute);margin-top:3px}.ddbar{height:6px;border-radius:4px;background:#E6EAF0;margin-top:6px;overflow:hidden}.ddbar i{display:block;height:100%}" +
    ".ddl .nm{margin-top:8px;border-top:1px dashed var(--line);padding-top:6px;font-size:13.5px}.ddl .nm div{padding:2px 0}.ddl .nm em{font-style:normal;color:#1E7A46;font-size:12px;margin-left:4px}" +
    ".ddcp{margin-top:8px;border:0;background:#EEF3FB;color:#0B3D91;border-radius:10px;padding:7px 12px;font:inherit;font-size:13px;font-weight:600}" +
    ".ddst{display:inline-block;font-size:12px;border-radius:8px;padding:1px 7px;margin-left:4px}.ddst.k{background:#FBEAE9;color:#B23A34}.ddst.p{background:#E6F5EC;color:#1E7A46}" +
    ".ddcap{font-size:12px;color:var(--mute);margin:6px 0}";
  document.head.appendChild(stl);

  var D = { siso: {}, buoi: [], hs: [], cap: "", day: "", b: "s", minStreak: 3, open: {}, busy: false, view: "" };

  function z(n) { return ("0" + n).slice(-2); }
  function noAcc(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D"); }
  /* "261105s" -> {iso:"2026-11-05", b:"s", id:"261105s"} */
  function pid(id) { return { id: id, iso: "20" + id.slice(0, 2) + "-" + id.slice(2, 4) + "-" + id.slice(4, 6), b: id.slice(6, 7) }; }
  function vn(iso) { return iso.slice(8, 10) + "/" + iso.slice(5, 7); }
  var TH = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  function thu(iso) { return TH[new Date(iso + "T00:00:00Z").getUTCDay()]; }
  function capVN(s) { var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})/.exec(String(s || "")); return m ? (m[4] + " " + m[3] + "/" + m[2]) : ""; }
  function sessId(iso, b) { return iso.slice(2).replace(/-/g, "") + b; }
  function pct(n, si) { return si > 0 ? Math.round((si - n) * 1000 / si) / 10 : null; }
  function cls(p) { return p === null ? "" : p < TH_BAD ? "bad" : p < TH_WARN ? "warn" : "ok"; }
  function fp(p) { return p === null ? "–" : (String(p).replace(".", ",") + "%"); }

  /* Biến dữ liệu thô của backend thành dạng dễ tính: m[id] = '' (chưa điểm danh) hoặc 'P'|'SP'|'CP' (có phép) */
  function prepare(r) {
    D.siso = {}; (r.siso || []).forEach(function (a) { D.siso[a[0]] = a[1]; });
    D.buoi = r.buoi || []; D.cap = r.cap_nhat || "";
    D.hs = (r.hs || []).map(function (a) {
      var m = {}; String(a[3] || "").split(" ").forEach(function (t) { if (!t) return; var p = t.split("-"); m[p[0]] = p[1] || ""; });
      return { lop: a[0], ten: a[1], ma: a[2], m: m };
    });
  }
  function days(b) {      // các ngày đã quét buổi b, tăng dần
    var o = {}, out = [];
    D.buoi.forEach(function (id) { var p = pid(id); if (p.b === b && !o[p.iso]) { o[p.iso] = 1; out.push(p.iso); } });
    return out;
  }
  function fixSel() {     // đảm bảo (day, b) có dữ liệu
    var ds = days(D.b);
    if (!ds.length) { var o = D.b === "s" ? "c" : "s"; if (days(o).length) { D.b = o; ds = days(o); } }
    if (ds.indexOf(D.day) < 0) D.day = ds.length ? ds[ds.length - 1] : "";
  }
  function khoi(l) { var m = /^(\d+)/.exec(l); return m ? m[1] : "?"; }
  function lopCmp(a, b) { return a.localeCompare(b, "vi", { numeric: true }); }

  /* Tính báo cáo cho buổi đang chọn */
  function calc() {
    var id = sessId(D.day, D.b), L = {}, tot = { si: 0, n: 0, ph: 0 }, K = {};
    Object.keys(D.siso).forEach(function (l) { L[l] = { lop: l, si: D.siso[l], n: 0, ph: 0, ds: [] }; });
    D.hs.forEach(function (h) {
      if (h.m[id] === undefined) return;
      var o = L[h.lop] || (L[h.lop] = { lop: h.lop, si: 0, n: 0, ph: 0, ds: [] });
      o.n++; if (h.m[id]) o.ph++; o.ds.push(h);
    });
    var list = Object.keys(L).map(function (k) { var o = L[k]; o.p = pct(o.n, o.si); return o; });
    list.forEach(function (o) {
      tot.si += o.si; tot.n += o.n; tot.ph += o.ph;
      var k = K[khoi(o.lop)] || (K[khoi(o.lop)] = { k: khoi(o.lop), si: 0, n: 0 }); k.si += o.si; k.n += o.n;
    });
    list.sort(function (a, b) { var pa = a.p === null ? 101 : a.p, pb = b.p === null ? 101 : b.p; return pa - pb || lopCmp(a.lop, b.lop); });
    return { list: list, tot: tot, K: Object.keys(K).sort().map(function (k) { return K[k]; }), id: id };
  }

  /* Học sinh chưa điểm danh liên tiếp: đếm ngược từ buổi đang chọn theo các buổi cùng loại đã quét */
  function streaks() {
    var seq = D.buoi.filter(function (id) { var p = pid(id); return p.b === D.b && p.iso <= D.day; });
    var out = [];
    D.hs.forEach(function (h) {
      var n = 0, from = "", allPh = true;
      for (var i = seq.length - 1; i >= 0; i--) {
        var v = h.m[seq[i]]; if (v === undefined) break;
        n++; from = pid(seq[i]).iso; if (!v) allPh = false;
      }
      if (n >= D.minStreak) out.push({ h: h, n: n, from: from, ph: allPh });
    });
    out.sort(function (a, b) { return b.n - a.n || lopCmp(a.h.lop, b.h.lop) || a.h.ten.localeCompare(b.h.ten, "vi"); });
    return out;
  }

  function bn() { return D.b === "s" ? "buổi sáng" : "buổi chiều"; }
  function copy(t) {
    function ok() { toast("Đã copy, dán vào Zalo gửi giáo viên chủ nhiệm"); }
    function fb() { var ta = document.createElement("textarea"); ta.value = t; ta.style.cssText = "position:fixed;opacity:0;top:0;left:0"; document.body.appendChild(ta); ta.focus(); ta.select(); try { document.execCommand("copy"); ok(); } catch (e) { toast("Không copy được, hãy chọn chữ rồi chép tay"); } ta.remove(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok).catch(fb); else fb();
  }
  function setMsg(t) { var m = el("ddMsg"); if (m) m.innerHTML = t ? '<div class="note err" style="margin-top:10px">' + esc(t) + "</div>" : ""; }

  /* Văn bản gửi GVCN cho 1 lớp */
  function classText(o, id) {
    return "Lớp " + o.lop + " – chưa điểm danh " + bn() + " " + vn(D.day) + " (" + o.n + "/" + o.si + " em):\n" +
      o.ds.slice().sort(function (a, b) { return a.ten.localeCompare(b.ten, "vi"); }).map(function (x, i) { return (i + 1) + ". " + x.ten + (x.m[id] ? " (có phép)" : " (chưa rõ lý do)"); }).join("\n") +
      "\nĐề nghị GVCN kiểm tra, liên hệ phụ huynh và báo lại.";
  }
  /* Màn danh sách học sinh chưa điểm danh, gom theo lớp */
  function listHtml(C) {
    var L = C.list.filter(function (o) { return o.n > 0; }).sort(function (a, b) { return lopCmp(a.lop, b.lop); });
    var h = '<button type="button" class="ddbk" id="ddBack">← Về báo cáo</button>';
    h += '<div class="ddh">Chưa điểm danh: ' + C.tot.n + " em, " + L.length + ' lớp <small>(' + vn(D.day) + ", " + bn() + ")</small></div>";
    if (!L.length) return h + '<p class="sub">Tất cả học sinh đã điểm danh.</p>';
    h += '<button type="button" class="ddcp" id="ddCpEvery" style="width:100%;margin:0 0 4px">📋 Copy cả danh sách (gửi Ban giám hiệu)</button>';
    L.forEach(function (o, i) {
      h += '<div class="ddl ddcls" style="cursor:default"><div class="r1"><b>' + esc(o.lop) + '</b><span class="pc bad">' + o.n + " em</span></div>" +
        '<div class="r2">Sĩ số ' + o.si + (o.ph ? " · có phép " + o.ph : "") + (o.n - o.ph ? " · không phép " + (o.n - o.ph) : "") + "</div>" +
        '<div class="nm">' + o.ds.slice().sort(function (a, b) { return a.ten.localeCompare(b.ten, "vi"); }).map(function (x, k) { return "<div>" + (k + 1) + ". " + esc(x.ten) + (x.m[C.id] ? "<em>có phép</em>" : "") + "</div>"; }).join("") +
        '</div><button type="button" class="ddcp" data-c2="' + i + '">📋 Copy gửi GVCN ' + esc(o.lop) + "</button></div>";
    });
    D._L = L; return h;
  }
  function wireList(C) {
    wireDays();
    el("ddB").onclick = function (e) { var b = e.target.closest("[data-b]"); if (b) { D.b = b.getAttribute("data-b"); D.open = {}; render(); } };
    el("ddBody").onclick = function (e) {
      if (e.target.closest("#ddBack")) { D.view = ""; render(); return; }
      if (e.target.closest("#ddCpEvery")) {
        copy("Học sinh chưa điểm danh " + bn() + " " + vn(D.day) + " (" + C.tot.n + " em):\n\n" + (D._L || []).map(function (o) { return classText(o, C.id); }).join("\n\n"));
        return;
      }
      var b2 = e.target.closest("[data-c2]"); if (b2) copy(classText(D._L[+b2.getAttribute("data-c2")], C.id));
    };
  }

  /* Thanh chọn ngày: ‹ ngày trước · bấm giữa để mở lịch · ngày sau › */
  function dayBar(ds) {
    var i = ds.indexOf(D.day), prev = i > 0 ? ds[i - 1] : "", next = i >= 0 && i < ds.length - 1 ? ds[i + 1] : "";
    return '<div class="dddate" id="ddDays"><button type="button" class="ddnav" data-d="' + prev + '"' + (prev ? "" : " disabled") + ' aria-label="Ngày trước">‹</button>' +
      '<label class="ddpick">' + vn(D.day) + "<small>(" + thu(D.day) + ') ▾</small><input type="date" id="ddPick" value="' + D.day + '" min="' + ds[0] + '" max="' + ds[ds.length - 1] + '"></label>' +
      '<button type="button" class="ddnav" data-d="' + next + '"' + (next ? "" : " disabled") + ' aria-label="Ngày sau">›</button></div>';
  }
  function wireDays() {
    var box = el("ddDays"), pk = el("ddPick"); if (!box) return;
    box.onclick = function (e) { var b = e.target.closest("[data-d]"); if (b && b.getAttribute("data-d")) { D.day = b.getAttribute("data-d"); D.open = {}; render(); } };
    pk.onclick = function () { try { if (pk.showPicker) pk.showPicker(); } catch (x) { } };
    pk.onchange = function () {
      var v = pk.value, ds = days(D.b); if (!v) return;
      if (ds.indexOf(v) < 0) {    // ngày không có dữ liệu → lấy ngày gần nhất trước đó (hoặc ngày đầu tiên)
        var best = ""; ds.forEach(function (d) { if (d <= v) best = d; });
        var pick = best || ds[0]; toast("Không có dữ liệu ngày " + vn(v) + ", chuyển sang " + vn(pick)); v = pick;
      }
      D.day = v; D.open = {}; render();
    };
  }

  function render() {
    var box = el("ddBody"); if (!box) return;
    fixSel();
    if (!D.day) { box.innerHTML = '<div class="note">Chưa có dữ liệu điểm danh. Bấm “Lấy báo cáo mới nhất” (máy tính cần bật, Chrome đang đăng nhập vnEdu THPT Chơn Thành).</div>'; return; }
    var ds = days(D.b), C = calc(), tp = pct(C.tot.n, C.tot.si);
    var h = dayBar(ds);
    h += '<div class="ddseg" id="ddB"><button type="button" data-b="s" class="' + (D.b === "s" ? "on" : "") + '">Buổi sáng</button><button type="button" data-b="c" class="' + (D.b === "c" ? "on" : "") + '">Buổi chiều</button></div>';
    if (D.view === "list") { box.innerHTML = h + listHtml(C); wireList(C); return; }
    var bad = C.list.filter(function (o) { return o.p !== null && o.p < TH_BAD; }).length;
    h += '<div class="ddsum"><div class="' + cls(tp) + '"><b>' + fp(tp) + "</b><small>đã điểm danh</small></div><div class='tap' id='ddAbs' role='button'><b>" + C.tot.n + "</b><small>chưa điểm danh / " + C.tot.si + '</small><small class=\'hint\'>bấm xem danh sách</small></div><div class="' + (bad ? "bad" : "ok") + '"><b>' + bad + "</b><small>lớp dưới " + TH_BAD + "%</small></div></div>";
    h += '<div class="ddcap">' + vn(D.day) + " (" + thu(D.day) + ") · " + bn() + (C.tot.ph ? " · trong số chưa điểm danh có " + C.tot.ph + " em đã được ghi phép" : "") + (D.cap ? " · cập nhật " + esc(capVN(D.cap)) : "") + "</div>";

    h += '<div class="ddh">Theo khối</div><div class="ddk">' + C.K.map(function (k) { var p = pct(k.n, k.si); return '<span class="' + cls(p) + '">Khối ' + esc(k.k) + "<b>" + fp(p) + "</b>" + k.n + "/" + k.si + " chưa ĐD</span>"; }).join("") + "</div>";

    h += '<div class="ddh">Tỷ lệ từng lớp <small>(thấp nhất lên đầu, bấm để xem tên)</small></div>';
    h += C.list.map(function (o, i) {
      var p = o.p, open = D.open[o.lop], c = cls(p);
      var s = '<button type="button" class="ddl" data-l="' + i + '"><div class="r1"><b>' + esc(o.lop) + '</b><span class="pc ' + c + '">' + fp(p) + '</span></div>' +
        '<div class="ddst4"><span>Sĩ số<b>' + o.si + '</b></span><span class="ok">Có mặt<b>' + Math.max(o.si - o.n, 0) + '</b></span><span class="ph">Vắng có phép<b>' + o.ph + '</b></span><span class="' + (o.n - o.ph > 0 ? "kp" : "") + '">Vắng không phép<b>' + (o.n - o.ph) + "</b></span></div>" +
        '<div class="ddbar"><i style="width:' + (p === null ? 0 : p) + "%;background:" + (c === "bad" ? "#B23A34" : c === "warn" ? "#D98A00" : "#2E9B5F") + '"></i></div>';
      if (open && o.ds.length) {
        s += '<div class="nm">' + o.ds.slice().sort(function (a, b) { return a.ten.localeCompare(b.ten, "vi"); }).map(function (x) { return "<div>" + esc(x.ten) + (x.m[C.id] ? "<em>có phép</em>" : "") + "</div>"; }).join("") +
          '<span class="ddcp" data-cp="' + i + '" role="button">📋 Copy gửi GVCN</span></div>';
      } else if (open) s += '<div class="nm">Cả lớp đã điểm danh.</div>';
      return s + "</button>";
    }).join("");

    var st = streaks();
    h += '<div class="ddh">Chưa điểm danh liên tiếp <small>(tính đến ' + vn(D.day) + ", " + bn() + ")</small></div>";
    h += '<div class="ddchips" id="ddMin">' + [2, 3, 5].map(function (n) { return '<button type="button" data-n="' + n + '" class="' + (n === D.minStreak ? "on" : "") + '"><b>từ ' + n + " buổi</b></button>"; }).join("") + "</div>";
    if (!st.length) h += '<p class="sub">Không có học sinh nào chưa điểm danh từ ' + D.minStreak + " " + bn() + " liên tiếp.</p>";
    else {
      h += '<div class="sub" style="margin-bottom:4px">' + st.length + " học sinh</div>";
      h += st.map(function (s) {
        return '<div class="ddl" style="cursor:default"><div class="r1"><b>' + esc(s.h.ten) + '</b><span class="pc bad">' + s.n + " buổi</span></div><div class=\"r2\">Lớp " + esc(s.h.lop) + " · mã " + esc(s.h.ma) + " · từ " + vn(s.from) +
          (s.ph ? '<span class="ddst p">có phép</span>' : '<span class="ddst k">chưa rõ lý do</span>') + "</div></div>";
      }).join("");
      h += '<button type="button" class="ddcp" id="ddCpAll">📋 Copy danh sách gửi Ban giám hiệu</button>';
    }
    box.innerHTML = h;
    wire(C, st);
  }

  function wire(C, st) {
    wireDays();
    el("ddB").onclick = function (e) { var b = e.target.closest("[data-b]"); if (b) { D.b = b.getAttribute("data-b"); D.open = {}; render(); } };
    el("ddAbs").onclick = function () { D.view = "list"; render(); };
    el("ddMin").onclick = function (e) { var b = e.target.closest("[data-n]"); if (b) { D.minStreak = +b.getAttribute("data-n"); render(); } };
    var body = el("ddBody");
    body.onclick = function (e) {
      var cp = e.target.closest("[data-cp]");
      if (cp) {
        e.stopPropagation(); var o = C.list[+cp.getAttribute("data-cp")];
        copy("Lớp " + o.lop + " – chưa điểm danh " + bn() + " " + vn(D.day) + " (" + o.n + "/" + o.si + " em):\n" +
          o.ds.slice().sort(function (a, b) { return a.ten.localeCompare(b.ten, "vi"); }).map(function (x, i) { return (i + 1) + ". " + x.ten + (x.m[C.id] ? " (có phép)" : ""); }).join("\n") +
          "\nĐề nghị GVCN kiểm tra, liên hệ phụ huynh và báo lại.");
        return;
      }
      if (e.target.id === "ddCpAll") {
        var t = "Học sinh chưa điểm danh từ " + D.minStreak + " " + bn() + " liên tiếp (đến " + vn(D.day) + "):\n" + st.map(function (s, i) { return (i + 1) + ". " + s.h.ten + " – lớp " + s.h.lop + " – " + s.n + " buổi" + (s.ph ? " (có phép)" : ""); }).join("\n");
        copy(t); return;
      }
      var l = e.target.closest("[data-l]");
      if (l) { var o2 = C.list[+l.getAttribute("data-l")]; D.open[o2.lop] = !D.open[o2.lop]; render(); }
    };
  }

  function load() {
    if (!connected()) { setMsg("Chưa kết nối backend"); el("ddBody").innerHTML = ""; return Promise.resolve(); }
    return api("dd.get", {}).then(function (r) { prepare(r); setMsg(""); render(); },
      function (e) { el("ddBody").innerHTML = ""; setMsg(/Action không hợp lệ|không hỗ trợ|unknown|Không biết/i.test(e.message) ? "Backend chưa có DiemDanh.gs (cần dán vào Apps Script và triển khai lại)." : "Không tải được: " + e.message); });
  }

  /* Nút "Lấy báo cáo mới nhất": gửi lệnh cho extension vnEdu trên máy tính (như Doanh thu). Chờ tối đa ~4 phút. */
  function refresh() {
    if (D.busy) return; if (!connected()) { toast("Chưa kết nối backend"); return; }
    D.busy = true; var bt = el("ddRef"); if (bt) { bt.disabled = true; bt.textContent = "Đang gửi lệnh cho máy tính…"; }
    var done = function (msg, err) { D.busy = false; if (bt) { bt.disabled = false; bt.textContent = "🔄 Lấy báo cáo mới nhất"; } if (msg) { if (err) setMsg(msg); else toast(msg); } };
    api("job.enqueue", { tool: "vnedu_serial", params: { act: "dd_scan", tk: "", truong: "", days: "14" } }).then(function (r) {
      var id = r.id, n = 0;
      (function poll() {
        api("job.get", { id: id }).then(function (g) {
          var j = g.job || {}, t = String(j.ket_qua || "");
          if (j.trang_thai === "done") { done("Đã cập nhật điểm danh"); load(); return; }
          if (j.trang_thai === "error" || j.trang_thai === "cancelled") { done(t || "Máy tính báo lỗi", true); return; }
          if (j.trang_thai === "await_confirm") {
            api("job.update", { id: id, trang_thai: "cancelled", ket_qua: "Đã hủy: extension vnEdu trên máy tính chưa hỗ trợ điểm danh (còn bản cũ)." }).catch(function () { });
            done("Extension vnEdu trên máy tính chưa hỗ trợ lấy điểm danh (cần bản 1.14 trở lên). Chưa sửa gì.", true); return;
          }
          if (bt && t) bt.textContent = t.split("\n")[0].slice(0, 40);
          if (++n > 120) { done("Máy tính chưa phản hồi. Kiểm tra máy đang bật, Chrome mở và đang đăng nhập vnEdu THPT Chơn Thành.", true); return; }
          setTimeout(poll, 2000);
        }).catch(function (e) { done("Lỗi: " + e.message, true); });
      })();
    }, function (e) { done("Không gửi được lệnh: " + e.message, true); });
  }

  window.openDiemDanh = function () {
    D.open = {};
    openSheet('<div id="ddBox"><div class="sh-h"><span class="ic">' + svg("users") + '</span><div><b>Điểm danh</b></div></div>' +
      '<p class="sh-d">Báo cáo nhanh THPT Chơn Thành: lớp nào điểm danh thấp, học sinh nào chưa điểm danh nhiều buổi liên tiếp.</p>' +
      '<div id="ddMsg"></div><div id="ddBody"><p class="sub">Đang tải…</p></div>' +
      '<button class="btn" id="ddRef" style="margin-top:14px">🔄 Lấy báo cáo mới nhất</button>' +
      '<p class="sub" style="margin-top:6px">“Chưa điểm danh” = học sinh có tên trong báo cáo vnEdu “Thống kê học sinh chưa điểm danh”, gồm cả em đã được giáo viên ghi phép.</p>' +
      '<button class="btn sec" id="ddClose">Đóng</button></div>');
    el("ddClose").onclick = closeSheet; el("ddRef").onclick = refresh;
    load();
  };
  window.__dd = { D: D, prepare: prepare, calc: calc, streaks: streaks, fixSel: fixSel };   // phục vụ kiểm thử
})();

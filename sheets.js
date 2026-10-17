/* =====================================================================
   BẢNG KHÁCH HÀNG – xem / tìm / thêm / sửa Google Sheet ngay trong app (không phải mở app Sheets)
   File riêng, nạp sau script chính của index.html (dùng lại: api, openSheet, closeSheet, toast,
   esc, el, svg, connected, lsGet, lsSet). Chạy qua backend Apps Script (Code.gs ≥ 1.4.0, action sheet.*).
   Danh sách Sheet được phép nằm trong Code.gs (hằng SHEET_FILES). Mở bằng nút "Bảng KH" trên sơ đồ.
   ===================================================================== */
"use strict";
(function () {
  var css = [
    ".khchips{display:flex;gap:8px;overflow-x:auto;margin-top:10px;padding-bottom:2px}",
    ".khchips button{flex:none;border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 14px;font-size:13px;color:var(--blue)}",
    ".khchips button.on{background:var(--blue);border-color:var(--blue);color:#fff;font-weight:600}",
    ".khchips.tabs button{border-radius:8px;padding:5px 10px;font-size:12.5px}",
    ".khq{display:flex;gap:8px;margin-top:10px}.khq input{flex:1;min-width:0}",
    ".khq button{flex:none;border:0;border-radius:12px;padding:0 16px;background:var(--blue);color:#fff;font-weight:600}",
    ".khtools{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}",
    ".khtools button{border:1px solid var(--line);background:var(--blue-soft);color:var(--blue);border-radius:10px;padding:8px 12px;font-size:13px;font-weight:600}",
    ".khinfo{margin-top:10px;font-size:12.5px;color:var(--mute);min-height:16px}",
    ".khcard{display:block;width:100%;text-align:left;border:1px solid var(--line);background:#fff;border-radius:14px;padding:11px 12px;margin-top:9px;color:var(--text)}",
    ".khcard b{display:block;font-size:14px;font-weight:600;word-break:break-word}",
    ".khcard small{display:block;font-size:12px;color:var(--mute);margin-top:3px;word-break:break-word}",
    ".khcard .rn{float:right;font-size:11px;color:var(--mute);background:var(--blue-soft);border-radius:999px;padding:2px 8px;margin-left:8px}",
    ".khform .fld{margin-top:10px}.khform label{display:block;font-size:12.5px;color:var(--mute);margin-bottom:4px}",
    ".khform input,.khform textarea{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:10px;padding:10px;font:inherit;background:#fff}",
    ".khform textarea{min-height:64px;resize:vertical}.khform input:disabled,.khform textarea:disabled{background:#F3F5F9;color:var(--mute)}",
    ".khform .fx{font-style:normal;font-size:11px;color:#8A5A00;background:#FFF4E5;border-radius:6px;padding:1px 6px;margin-left:4px}",
    ".khact{display:flex;gap:8px;margin-top:14px;position:sticky;bottom:0;background:#fff;padding:8px 0}.khact .btn{flex:1;margin-top:0}"
  ].join("\n");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();

var SH = { files: [], file: "", tab: "", tabs: [], data: null, K: {}, q: "", seq: 0, cur: -1, timer: null, more: false };

function khNorm(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/\s+/g, " ").trim(); }
/* Nhận diện các cột chính theo tên tiêu đề (không phụ thuộc vị trí cột) */
function khKeys(h) {
  var K = { name: -1, mst: -1, dv: -1, dt: -1, ngay: -1, tt: -1, phone: -1, email: -1 };
  (h || []).forEach(function (x, i) {
    var n = khNorm(x);
    if (K.name < 0 && /^ten/.test(n)) K.name = i;
    else if (K.mst < 0 && /^mst/.test(n)) K.mst = i;
    else if (K.dv < 0 && /^dich vu/.test(n)) K.dv = i;
    else if (K.dt < 0 && /^doanh thu/.test(n)) K.dt = i;
    else if (K.ngay < 0 && /^ngay tao/.test(n)) K.ngay = i;
    else if (K.tt < 0 && /^tinh trang/.test(n)) K.tt = i;
    else if (K.phone < 0 && /^(phone|sdt|so dien thoai)/.test(n)) K.phone = i;
    else if (K.email < 0 && /^email/.test(n)) K.email = i;
  });
  return K;
}
function khFlat(v) { return String(v || "").replace(/\s*\n\s*/g, " · ").trim(); }
function khErr(e) {
  var m = String((e && e.message) || e || "Lỗi");
  if (/không hợp lệ: sheet\./i.test(m)) m = "Backend chưa được cập nhật lên bản 1.4.0 (chưa có chức năng Bảng KH). Cần dán Code.gs mới và triển khai lại.";
  var i = el("khInfo"); if (i) i.innerHTML = '<span style="color:var(--err)">' + esc(m) + '</span>'; else toast(m);
}

/* ---------- màn danh sách ---------- */
function openKhach() {
  if (!connected()) {
    openSheet('<div class="sh-h"><span class="ic">' + svg("users") + '</span><div><b>Bảng khách hàng</b></div></div>' +
      '<div class="note err">Chưa kết nối backend. Bấm biểu tượng ⚙ (Cài đặt) để nhập địa chỉ và token.</div><button class="btn sec" id="khX">Đóng</button>');
    el("khX").onclick = closeSheet; return;
  }
  khShell();
  var p = SH.files.length ? Promise.resolve() : api("sheet.files").then(function (r) { SH.files = r.files || []; });
  p.then(function () {
    if (!SH.files.length) throw new Error("Backend chưa có danh sách Sheet.");
    if (!SH.file || !SH.files.some(function (f) { return f.k === SH.file; })) {
      var last = lsGet("kh_file"); SH.file = SH.files.some(function (f) { return f.k === last; }) ? last : SH.files[0].k;
    }
    khDrawFiles();
    return khLoadTabs();
  }).catch(khErr);
}
function khShell() {
  openSheet('<div class="sh-h"><span class="ic">' + svg("users") + '</span><div><b>Bảng khách hàng</b><div class="sub">Xem · tìm · thêm · sửa ngay trong app</div></div></div>' +
    '<div id="khFiles" class="khchips"></div><div id="khTabs" class="khchips tabs"></div>' +
    '<form id="khQ" class="khq" autocomplete="off"><input name="q" type="search" placeholder="Tìm tên, MST, SĐT, dịch vụ…" value="' + esc(SH.q) + '"><button type="submit">Tìm</button></form>' +
    '<div class="khtools"><button type="button" id="khNew">+ Thêm khách</button><button type="button" id="khReload">Tải lại</button></div>' +
    '<div id="khInfo" class="khinfo"></div><div id="khList"></div><button class="btn sec" id="khClose">Đóng</button>');
  el("khClose").onclick = closeSheet;
  el("khNew").onclick = khNew;
  el("khReload").onclick = function () { khRead(); };
  el("khQ").onsubmit = function (e) { e.preventDefault(); SH.q = this.q.value.trim(); khRead(); };
  el("khQ").q.addEventListener("input", function () {
    var v = this.value.trim(); clearTimeout(SH.timer);
    SH.timer = setTimeout(function () { if (v !== SH.q) { SH.q = v; khRead(); } }, 450);
  });
  khDrawFiles(); khDrawTabs(); khRenderList();
}
function khChips(box, items, cur, fn) {
  var b = el(box); if (!b) return;
  b.innerHTML = items.map(function (it, i) { return '<button type="button" data-i="' + i + '"' + (it.k === cur ? ' class="on"' : '') + '>' + esc(it.n) + '</button>'; }).join("");
  Array.prototype.forEach.call(b.querySelectorAll("button"), function (x) { x.onclick = function () { fn(items[+x.getAttribute("data-i")].k); }; });
}
function khDrawFiles() {
  khChips("khFiles", SH.files.map(function (f) { return { k: f.k, n: f.name }; }), SH.file, function (k) {
    if (k === SH.file) return; SH.file = k; lsSet("kh_file", k); SH.tab = ""; SH.tabs = []; SH.data = null; khDrawFiles(); khDrawTabs(); khRenderList(); khLoadTabs().catch(khErr);
  });
}
function khDrawTabs() {
  khChips("khTabs", SH.tabs.map(function (t) { return { k: t, n: String(t).trim() }; }), SH.tab, function (k) {
    if (k === SH.tab) return; SH.tab = k; lsSet("kh_tab_" + SH.file, k); khDrawTabs(); khRead();
  });
}
function khLoadTabs() {
  var f = SH.file;
  return api("sheet.tabs", { file: f }).then(function (r) {
    if (f !== SH.file) return;
    SH.tabs = r.tabs || [];
    var want = lsGet("kh_tab_" + f), mon = "T" + (new Date().getMonth() + 1);
    var has = function (n) { return SH.tabs.some(function (t) { return String(t).trim() === n; }); };
    var pick = SH.tabs.filter(function (t) { return t === want; })[0] || SH.tabs.filter(function (t) { return String(t).trim() === mon; })[0] || SH.tabs[0] || "";
    SH.tab = pick; khDrawTabs(); return khRead();
  });
}
function khRead(more) {
if (!SH.file || !SH.tab) return Promise.resolve();
var my = ++SH.seq, i = el("khInfo"); if (i) i.textContent = "Đang tải…";
var off = (more && SH.data) ? SH.data.rows.length : 0;
return api("sheet.read", { file: SH.file, tab: SH.tab, q: SH.q, limit: 40, offset: off, order: "asc" }).then(function (r) {
if (my !== SH.seq) return;
if (more && SH.data) { r.rows = SH.data.rows.concat(r.rows); }   // nối thêm, giữ thứ tự như Sheet
SH.data = r; SH.K = khKeys(r.header); khRenderList();
}).catch(function (e) { if (my === SH.seq) khErr(e); });
}
function khCard(r, i) {
  var K = SH.K, c = r.cells, g = function (k) { return K[k] >= 0 ? khFlat(c[K[k]]) : ""; };
  var t1, t2, t3;
  if (K.name >= 0 || K.mst >= 0) {
    t1 = g("name") || g("mst") || "(chưa có tên)";
    t2 = [g("mst"), g("ngay")].filter(Boolean).join(" · ");
    t3 = [g("dv"), g("dt"), g("tt")].filter(Boolean).join(" · ");
  } else {
    var ne = c.map(khFlat).filter(Boolean); t1 = ne[0] || "(dòng trống)"; t2 = ne.slice(1, 3).join(" · "); t3 = ne.slice(3, 6).join(" · ");
  }
  return '<button type="button" class="khcard" data-i="' + i + '"><span class="rn">dòng ' + r.row + '</span><b>' + esc(t1) + '</b>' +
    (t2 ? '<small>' + esc(t2) + '</small>' : '') + (t3 ? '<small>' + esc(t3) + '</small>' : '') + '</button>';
}
function khRenderList() {
  var box = el("khList"), info = el("khInfo"); if (!box) return;
  var d = SH.data;
  if (!d) { box.innerHTML = ""; return; }
  box.innerHTML = d.rows.length ? d.rows.map(khCard).join("") + (d.rows.length < d.total ? '<button type="button" class="btn sec" id="khMoreRows" style="margin-top:10px">Xem thêm (' + (d.total - d.rows.length) + ' dòng nữa)</button>' : "") : '<div class="note info" style="margin-top:10px">Không có dòng nào' + (SH.q ? ' khớp “' + esc(SH.q) + '”' : '') + '.</div>';
  if (info) info.textContent = "Hiện " + d.rows.length + " / " + d.total + " dòng" + " · đúng thứ tự trong Sheet · bấm vào khách để sửa";
  if (el("khMoreRows")) el("khMoreRows").onclick = function () { khRead(true); };
Array.prototype.forEach.call(box.querySelectorAll(".khcard"), function (b) { b.onclick = function () { khEdit(+b.getAttribute("data-i")); }; });
}

/* ---------- sửa 1 dòng ---------- */
function khField(name, c, v, dis) {
  var long = String(v).indexOf("\n") >= 0 || String(v).length > 60;
  return '<div class="fld"><label>' + esc(name || ("Cột " + (c + 1))) + (dis ? ' <i class="fx">công thức</i>' : '') + '</label>' +
    (long ? '<textarea data-c="' + c + '"' + (dis ? ' disabled' : '') + '>' + esc(v) + '</textarea>' : '<input type="text" data-c="' + c + '" value="' + esc(v) + '"' + (dis ? ' disabled' : '') + '>') + '</div>';
}
function khEdit(i) {
  var r = SH.data.rows[i]; if (!r) return; SH.cur = i;
  var fx = {}; (r.fx || []).forEach(function (c) { fx[c] = 1; });
  var h = '<div class="sh-h"><span class="ic">' + svg("users") + '</span><div><b>Sửa khách · dòng ' + r.row + '</b><div class="sub">' + esc(SH.tab.trim()) + ' · ' + esc((SH.files.filter(function (f) { return f.k === SH.file; })[0] || {}).name || "") + '</div></div></div><div class="khform" id="khForm">';
  SH.data.header.forEach(function (name, c) { var v = r.cells[c] || ""; if (!name && !v) return; h += khField(name, c, v, !!fx[c]); });
  h += '</div><div class="khact"><button class="btn" id="khSave">Lưu</button><button class="btn sec" id="khCancel">Hủy</button></div>';
  openSheet(h);
  el("khCancel").onclick = function () { khBack(false); };
  el("khSave").onclick = khSave;
}
function khSave() {
  var r = SH.data.rows[SH.cur], ch = [], btn = el("khSave");
  Array.prototype.forEach.call(document.querySelectorAll("#khForm [data-c]"), function (e) {
    if (e.disabled) return; var c = +e.getAttribute("data-c");
    if (e.value !== (r.cells[c] || "")) ch.push({ col: c + 1, value: e.value });
  });
  if (!ch.length) { toast("Chưa có thay đổi nào"); return; }
  if (!confirm("Lưu " + ch.length + " ô thay đổi vào dòng " + r.row + " (" + SH.tab.trim() + ")?")) return;
  btn.disabled = true; btn.textContent = "Đang lưu…";
  api("sheet.update", { file: SH.file, tab: SH.tab, row: r.row, check: { col: 1, value: r.cells[0] || "" }, changes: ch })
    .then(function () { toast("Đã lưu vào Sheet"); khBack(true); })
    .catch(function (e) { btn.disabled = false; btn.textContent = "Lưu"; toast("Không lưu được: " + e.message); });
}

/* ---------- thêm khách mới ---------- */
function khNew() {
  var d = SH.data; if (!d || !d.header.length) { toast("Chọn file và tab trước"); return; }
  var K = SH.K, main = ["name", "mst", "dv", "dt", "ngay", "tt", "phone", "email"].map(function (k) { return K[k]; }).filter(function (c) { return c >= 0; });
  var h = '<div class="sh-h"><span class="ic">' + svg("users") + '</span><div><b>Thêm khách mới</b><div class="sub">' + esc(SH.tab.trim()) + ' · ' + esc((SH.files.filter(function (f) { return f.k === SH.file; })[0] || {}).name || "") + '</div></div></div><div class="khform" id="khForm">';
  var rest = "";
  d.header.forEach(function (name, c) { if (!name) return; if (main.length && main.indexOf(c) < 0) rest += khField(name, c, "", false); else h += khField(name, c, "", false); });
  if (rest) h += '<button type="button" class="btn sec" id="khMore" style="margin-top:12px">Hiện thêm cột khác</button><div id="khRest" style="display:none">' + rest + '</div>';
  h += '</div><div class="khact"><button class="btn" id="khAdd">Thêm vào Sheet</button><button class="btn sec" id="khCancel">Hủy</button></div>';
  openSheet(h);
  el("khCancel").onclick = function () { khBack(false); };
  if (el("khMore")) el("khMore").onclick = function () { el("khRest").style.display = "block"; this.style.display = "none"; };
  el("khAdd").onclick = khAppend;
}
function khAppend() {
  var vals = [], any = false, btn = el("khAdd");
  Array.prototype.forEach.call(document.querySelectorAll("#khForm [data-c]"), function (e) { var c = +e.getAttribute("data-c"); vals[c] = e.value; if (String(e.value).trim()) any = true; });
  if (!any) { toast("Chưa nhập nội dung"); return; }
  for (var i = 0; i < vals.length; i++) if (vals[i] == null) vals[i] = "";
  if (!confirm("Thêm dòng mới vào " + SH.tab.trim() + "?")) return;
  btn.disabled = true; btn.textContent = "Đang thêm…";
  api("sheet.append", { file: SH.file, tab: SH.tab, values: vals })
    .then(function (r) { toast("Đã thêm vào dòng " + r.row); SH.q = ""; khBack(true); })
    .catch(function (e) { btn.disabled = false; btn.textContent = "Thêm vào Sheet"; toast("Không thêm được: " + e.message); });
}

function khBack(reload) {
  khShell();
  if (reload) khRead();
}

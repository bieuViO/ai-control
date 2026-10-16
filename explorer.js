/* =====================================================================
   FILE MÁY TÍNH – duyệt / tìm / xem / sửa / copy / di chuyển / tải lên / tải về
   File riêng, nạp sau script chính của index.html (dùng lại: api, openSheet, closeSheet,
   toast, esc, el, svg, connected, refreshJobs, fileIcon, fmtSize, dirOf, NOI_VN, lsGet, lsSet).
   Mọi thao tác chạy qua hàng đợi Apps Script → agent trên máy tính (file_ops.py).
   ===================================================================== */
"use strict";
(function () {
  var css = [
    ".exq{display:flex;gap:8px;margin-top:12px}.exq input{flex:1;min-width:0}.exq button{flex:none;border:0;border-radius:12px;padding:0 16px;background:var(--blue);color:#fff;font-weight:600}",
    ".exroots{display:flex;gap:8px;margin-top:10px;overflow-x:auto}.exroots button{flex:none;border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 14px;font-size:13px;color:var(--text)}",
    ".exroots button.on{background:var(--blue);border-color:var(--blue);color:#fff}",
    ".exbar{display:flex;align-items:center;gap:6px;margin-top:12px;font-size:13px;color:var(--mute);flex-wrap:wrap}",
    ".exbar a{color:var(--blue);text-decoration:none;font-weight:600;cursor:pointer}.exbar .up{border:1px solid var(--line);background:#fff;border-radius:10px;padding:4px 10px;color:var(--blue);font-weight:600;margin-right:4px}",
    ".extools{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}.extools button{border:1px solid var(--line);background:var(--blue-soft);color:var(--blue);border-radius:10px;padding:7px 11px;font-size:13px;font-weight:600}",
    ".extools button.warn{background:#FFF4E5;color:#7A4306;border-color:#F5D9B0}.extools svg,.exsel svg,.exv-act svg{width:16px;height:16px;vertical-align:-3px;fill:none;stroke:currentColor;stroke-width:1.8}",
    ".exbusy{margin-top:10px;font-size:13px;color:var(--blue);min-height:0}.exbusy:empty{display:none}",
    ".exrow{display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--line);padding:10px 2px}",
    ".exrow .ic{width:36px;height:36px;border-radius:10px;background:var(--blue-soft);color:var(--blue);display:grid;place-items:center;flex:none}.exrow .ic svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7}",
    ".exrow .tx{flex:1;min-width:0;cursor:pointer}.exrow b{display:block;font-size:14px;font-weight:600;color:var(--text);word-break:break-word}.exrow small{display:block;font-size:11.5px;color:var(--mute);margin-top:2px;word-break:break-all}",
    ".exrow .mo{flex:none;border:0;background:none;font-size:20px;color:var(--mute);padding:4px 8px}.exrow.sel{background:var(--blue-soft)}",
    ".exrow .ck{width:20px;height:20px;border-radius:6px;border:2px solid var(--line);flex:none}.exrow.sel .ck{background:var(--blue);border-color:var(--blue)}",
    ".exmenu{display:flex;gap:6px;flex-wrap:wrap;padding:6px 0 10px 46px;border-bottom:1px solid var(--line)}.exmenu button{border:1px solid var(--line);background:#fff;border-radius:10px;padding:6px 10px;font-size:12.5px;color:var(--blue);font-weight:600}",
    ".exsel{position:sticky;bottom:0;background:#fff;border-top:1px solid var(--line);padding:10px 0;display:flex;gap:6px;flex-wrap:wrap;align-items:center;z-index:2}",
    ".exsel b{font-size:13px;margin-right:auto}.exsel button{border:0;border-radius:10px;padding:8px 11px;font-size:13px;font-weight:600;background:var(--blue);color:#fff}.exsel button.sec{background:var(--blue-soft);color:var(--blue)}",
    ".exin{display:flex;gap:8px;margin-top:10px}.exin input{flex:1;min-width:0}.exin button{border:0;border-radius:10px;padding:0 14px;background:var(--blue);color:#fff;font-weight:600}",
    ".exv-act{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px}.exv-act button,.exv-act a{border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 11px;font-size:13px;color:var(--blue);font-weight:600;text-decoration:none}",
    ".exv-act .pri{background:var(--blue);color:#fff;border-color:var(--blue)}",
    ".exframe{width:100%;height:62vh;border:1px solid var(--line);border-radius:12px;margin-top:12px;background:#F8FAFD}",
    ".exgrid{overflow:auto;max-height:58vh;border:1px solid var(--line);border-radius:12px;margin-top:10px}",
    ".exgrid table{border-collapse:collapse;font-size:12.5px}.exgrid th{position:sticky;top:0;background:#F1F5FB;color:var(--mute);font-weight:600;padding:4px 6px;border:1px solid var(--line)}",
    ".exgrid td{border:1px solid var(--line);padding:4px 6px;min-width:70px;max-width:220px;white-space:pre-wrap;word-break:break-word;vertical-align:top}",
    ".exgrid td.rn{position:sticky;left:0;background:#F1F5FB;color:var(--mute);min-width:32px;text-align:right}.exgrid td.f{color:#8A5A00;background:#FFFBF0}",
    ".exgrid td[contenteditable=true]{background:#FFFDE7;outline:none}.exgrid td.chg{background:#E3F6E8}",
    ".extabs{display:flex;gap:6px;overflow-x:auto;margin-top:10px}.extabs button{flex:none;border:1px solid var(--line);background:#fff;border-radius:8px;padding:5px 10px;font-size:12.5px}.extabs button.on{background:var(--blue);color:#fff;border-color:var(--blue)}",
    ".expara{max-height:52vh;overflow:auto;border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-top:10px;font-size:13.5px;line-height:1.55;background:#fff}.expara p{margin:0 0 8px}",
    ".exedit{width:100%;min-height:52vh;font:13px/1.5 ui-monospace,Consolas,monospace;border:1px solid var(--line);border-radius:12px;padding:10px;margin-top:10px;box-sizing:border-box}",
    ".exrep{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}"
  ].join("\n");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();

var EX = { path: "@d", data: null, mode: "dir", q: "", search: null, sel: {}, selMode: false, clip: null, rootPath: {}, menu: -1, busy: false };
var EX_EDIT_TEXT = /\.(txt|csv|md|json|ini|log|bat|cmd|ps1|py|js|html?|css|xml|gs|tsv|ya?ml)$/i;

/* ---------- chạy 1 việc trên máy tính và chờ kết quả (nhanh: hỏi mỗi 1,2 giây) ---------- */
function exRun(tool, params, label) {
  if (!connected()) return window.EX_MOCK ? window.EX_MOCK(tool, params) : Promise.reject(new Error("Chưa kết nối máy tính. Vào Cài đặt để kết nối."));
  exBusy(label || "Đang chờ máy tính…");
  return api("job.enqueue", { tool: tool, params: params }).then(function (r) {
    var id = r.id, t0 = Date.now();
    return new Promise(function (res, rej) {
      (function poll() {
        api("job.get", { id: id }).then(function (g) {
          var j = g.job, s = j.trang_thai, sec = Math.round((Date.now() - t0) / 1000);
          if (s === "done") return res(j);
          if (s === "error" || s === "cancelled") return rej(new Error(String(j.ket_qua || "Máy tính báo lỗi")));
          if (sec > 120) return rej(new Error("Máy tính chưa phản hồi sau 2 phút. Kiểm tra máy đang bật và agent đang chạy."));
          exBusy((label || "Đang chờ máy tính") + " · " + sec + "s" + (s === "queued" && sec > 6 ? " (máy đang khởi động chế độ nhanh)" : ""));
          setTimeout(poll, 1200);
        }).catch(function () { setTimeout(poll, 2000); });
      })();
    });
  }).then(function (j) { exBusy(""); refreshJobs(); return j; }, function (e) { exBusy(""); refreshJobs(); throw e; });
}
function exBusy(t) { EX.busy = !!t; var b = el("exBusy"); if (b) b.textContent = t || ""; }
function exParse(j, tag) { var s = String(j.ket_qua || ""); if (s.indexOf(tag) !== 0) throw new Error(s || "Kết quả không đọc được"); return JSON.parse(s.slice(tag.length)); }
function exFid(u) { var m = String(u || "").match(/\/d\/([\w-]+)/) || String(u || "").match(/[?&]id=([\w-]+)/); return m ? m[1] : ""; }
function exB64(str) { return btoa(unescape(encodeURIComponent(str))); }
function exSave() { lsSet("ex_last", EX.path); }

/* ---------- MỞ MÀN HÌNH ---------- */
function openExplorer(opt) {
  opt = opt || {};
  EX.sel = {}; EX.selMode = false; EX.menu = -1;
  var h = '<div class="sh-h"><span class="ic">' + svg("search") + '</span><div><b>My Computer</b><div class="sub">Ổ D · Downloads · Desktop</div></div></div>' +
    '<form id="exQ" class="exq" autocomplete="off"><input name="q" type="search" placeholder="Tìm tên file, tên khách, MST…" value="' + esc(opt.q || "") + '"><button type="submit">Tìm</button></form>' +
    '<div class="exroots">' + ["d", "downloads", "desktop"].map(function (k) { return '<button type="button" data-r="@' + k + '">' + NOI_VN[k] + '</button>'; }).join("") + '</div>' +
    '<div id="exBar" class="exbar"></div><div id="exTools" class="extools"></div><div id="exBusy" class="exbusy"></div>' +
    '<div id="exList"></div><div id="exSel"></div><div id="exOut"></div>' +
    '<input type="file" id="exUp" multiple style="display:none"><button class="btn sec" id="exClose">Đóng</button>';
  openSheet(h);
  el("exClose").onclick = closeSheet;
  el("exQ").onsubmit = function (e) { e.preventDefault(); var q = this.q.value.trim(); if (q) exSearch(q); };
  Array.prototype.forEach.call(document.querySelectorAll(".exroots button"), function (b) { b.onclick = function () { exGo(b.getAttribute("data-r")); }; });
  el("exUp").onchange = exUpload;
  if (opt.restore && (EX.mode === "search" ? EX.search : EX.data)) { exRender(); return; }   // quay lại từ màn xem file: hiện ngay, không hỏi lại máy
  if (opt.q) exSearch(opt.q);
  else if (opt.path) exGo(opt.path);
  else if (EX.data && EX.mode === "dir") { exRender(); exGo(EX.path, true); }
  else exGo(lsGet("ex_last") || "@d");
}

/* ---------- DUYỆT THƯ MỤC ---------- */
function exGo(path, silent) {
  if (EX.busy && !silent) return;
  EX.mode = "dir"; EX.menu = -1;
  if (!silent) { EX.sel = {}; el("exList").innerHTML = '<div class="empty">Đang mở…</div>'; }
  return exRun("tim_file", { trong: path }, "Đang mở thư mục").then(function (j) {
    var d = exParse(j, "§DIR§");
    EX.data = d; EX.path = d.path;
    if (!d.parent) EX.rootPath[d.root] = d.path;
    exSave(); exRender();
  }).catch(function (e) { if (!silent) el("exList").innerHTML = '<div class="note err">' + esc(e.message) + '</div>'; });
}

function exSearch(q) {
  if (EX.busy) return;
  EX.mode = "search"; EX.q = q; EX.sel = {}; EX.menu = -1;
  el("exList").innerHTML = '<div class="empty">Đang tìm…</div>';
  var noi = EX.data && EX.data.root ? "" : "";
  exRun("tim_file", { q: q, noi: noi, explorer: 1, limit: 150 }, "Đang tìm “" + q + "”").then(function (j) {
    EX.search = exParse(j, "§FILES§"); exRender();
  }).catch(function (e) { el("exList").innerHTML = '<div class="note err">' + esc(e.message) + '</div>'; });
}

function exItems() { return EX.mode === "search" ? (EX.search ? EX.search.items : []) : (EX.data ? EX.data.items : []); }

function exRender() {
  var d = EX.data, items = exItems();
  // nút nơi gốc đang mở
  Array.prototype.forEach.call(document.querySelectorAll(".exroots button"), function (b) {
    b.classList.toggle("on", EX.mode === "dir" && d && ("@" + d.root) === b.getAttribute("data-r"));
  });
  // thanh đường dẫn
  var bar = "";
  if (EX.mode === "search") {
    bar = '<button class="up" id="exBack">‹ Thư mục</button> Kết quả tìm “' + esc(EX.q) + '” · ' + (EX.search ? EX.search.n : 0) + ' mục';
  } else if (d) {
    var rp = EX.rootPath[d.root], segs = [], acc = "";
    if (d.parent) bar += '<button class="up" id="exUpDir">↑ Lên</button>';
    if (rp && d.path.indexOf(rp) === 0) {
      bar += '<a data-p="@' + d.root + '">' + esc(NOI_VN[d.root] || d.root) + '</a>';
      acc = rp.replace(/[\\\/]+$/, "");
      d.path.slice(rp.length).split(/[\\\/]/).filter(Boolean).forEach(function (s) { acc += "\\" + s; segs.push([s, acc]); });
      segs.forEach(function (s) { bar += ' › <a data-p="' + esc(s[1]) + '">' + esc(s[0]) + '</a>'; });
    } else bar += esc(d.path);
    bar += ' · ' + d.n + ' mục';
  }
  el("exBar").innerHTML = bar;
  if (el("exBack")) el("exBack").onclick = function () { EX.mode = "dir"; EX.sel = {}; exRender(); };
  if (el("exUpDir")) el("exUpDir").onclick = function () { exGo(d.parent); };
  Array.prototype.forEach.call(document.querySelectorAll(".exbar a"), function (a) { a.onclick = function () { exGo(a.getAttribute("data-p")); }; });
  exTools();
  // danh sách
  if (!items.length) { el("exList").innerHTML = '<div class="empty">' + (EX.mode === "search" ? "Không tìm thấy. Thử từ khóa ngắn hơn." : "Thư mục trống") + '</div>'; exSelBar(); return; }
  var h = "";
  items.forEach(function (it, i) {
    var meta = (it.d ? "Thư mục" : fmtSize(it.s)) + (it.t ? " · " + it.t : "");
    var sub = EX.mode === "search" ? esc(dirOf(it.p)) + '</small><small>' + esc((NOI_VN[it.r] || "") + " · " + meta) : esc(meta);
    h += '<div class="exrow' + (EX.sel[it.p] ? " sel" : "") + '" data-i="' + i + '">' + (EX.selMode ? '<span class="ck"></span>' : "") +
      '<span class="ic">' + svg(fileIcon(it)) + '</span><span class="tx"><b>' + esc(it.n) + '</b><small>' + sub + '</small></span>' +
      (EX.selMode ? "" : '<button class="mo" data-m="' + i + '" aria-label="Thao tác">⋯</button>') + '</div>';
    if (EX.menu === i) h += exMenuHtml(it);
  });
  if (EX.data && EX.mode === "dir" && EX.data.n > items.length) h += '<div class="note info">Thư mục có ' + EX.data.n + ' mục, đang hiện ' + items.length + '. Dùng ô Tìm để lọc.</div>';
  el("exList").innerHTML = h;
  Array.prototype.forEach.call(document.querySelectorAll(".exrow"), function (r) {
    var it = items[+r.getAttribute("data-i")];
    r.querySelector(".tx").onclick = function () {
      if (EX.selMode) { exToggle(it); return; }
      if (it.d) exGo(it.p); else exView(it);
    };
    if (EX.selMode) r.onclick = function (e) { if (!e.target.closest(".tx")) exToggle(it); };
  });
  Array.prototype.forEach.call(document.querySelectorAll(".exrow .mo"), function (b) {
    b.onclick = function () { var i = +b.getAttribute("data-m"); EX.menu = EX.menu === i ? -1 : i; exRender(); };
  });
  Array.prototype.forEach.call(document.querySelectorAll(".exmenu button"), function (b) {
    b.onclick = function () { exAction(b.getAttribute("data-a"), [items[EX.menu]]); };
  });
  exSelBar();
}

function exMenuHtml(it) {
  var a = it.d ? [["open", "Mở"], ["copy", "Copy"], ["move", "Di chuyển"]]
    : [["view", "Xem"], ["get", "Tải về / Zalo"], ["copy", "Copy"], ["move", "Di chuyển"]];
  if (!it.d && (EX_EDIT_TEXT.test(it.n) || /\.(xlsx|xlsm|docx)$/i.test(it.n))) a.splice(1, 0, ["edit", "Sửa"]);
  if (EX.mode === "search") a.push(["folder", "Mở thư mục chứa"]);
  return '<div class="exmenu">' + a.map(function (x) { return '<button data-a="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>';
}

function exAction(act, list) {
  list = list.filter(Boolean); if (!list.length) return;
  var it = list[0];
  if (act === "open") return exGo(it.p);
  if (act === "view" || act === "edit") return exView(it, act === "edit");
  if (act === "folder") return exGo(dirOf(it.p));
  if (act === "get") return exGet(list);
  if (act === "copy" || act === "move") {
    EX.clip = { move: act === "move", items: list.map(function (x) { return { p: x.p, n: x.n, d: x.d }; }) };
    EX.sel = {}; EX.selMode = false; EX.menu = -1;
    toast("Đã chọn " + list.length + " mục. Mở thư mục đích rồi bấm “Dán vào đây”");
    if (EX.mode === "search") { EX.mode = "dir"; }
    exRender();
  }
}

/* ---------- thanh công cụ: thư mục mới, tải lên, chọn nhiều, dán ---------- */
function exTools() {
  var h = "", inDir = EX.mode === "dir" && EX.data;
  if (EX.clip) h += (inDir ? '<button class="warn" id="exPaste">' + svg(EX.clip.move ? "send" : "folder") + ' Dán ' + EX.clip.items.length + ' mục vào đây (' + (EX.clip.move ? "di chuyển" : "copy") + ')</button>' : "") + '<button id="exClipX">Hủy dán</button>';
  if (inDir) h += '<button id="exNew">' + svg("folder") + ' Thư mục mới</button><button id="exUpBtn">' + svg("upload") + ' Tải lên từ điện thoại</button>';
  h += '<button id="exSelM">' + (EX.selMode ? "Xong chọn" : "Chọn nhiều") + '</button>';
  h += '<button id="exRef" aria-label="Làm mới">' + svg("refresh") + '</button>';
  el("exTools").innerHTML = h;
  if (el("exPaste")) el("exPaste").onclick = exPaste;
  if (el("exClipX")) el("exClipX").onclick = function () { EX.clip = null; exRender(); };
  if (el("exNew")) el("exNew").onclick = exNewFolder;
  if (el("exUpBtn")) el("exUpBtn").onclick = function () { el("exUp").value = ""; el("exUp").click(); };
  el("exSelM").onclick = function () { EX.selMode = !EX.selMode; EX.sel = {}; EX.menu = -1; exRender(); };
  el("exRef").onclick = function () { if (EX.mode === "search") exSearch(EX.q); else exGo(EX.path); };
}

function exToggle(it) { if (EX.sel[it.p]) delete EX.sel[it.p]; else EX.sel[it.p] = it; exRender(); }
function exSelBar() {
  var list = Object.keys(EX.sel).map(function (k) { return EX.sel[k]; }), box = el("exSel");
  if (!EX.selMode || !list.length) { box.innerHTML = ""; return; }
  var files = list.filter(function (x) { return !x.d; });
  box.innerHTML = '<div class="exsel"><b>Đã chọn ' + list.length + '</b>' + (files.length ? '<button id="exSGet">' + svg("download") + ' Tải về</button>' : "") +
    '<button id="exSCopy" class="sec">Copy</button><button id="exSMove" class="sec">Di chuyển</button></div>';
  if (el("exSGet")) el("exSGet").onclick = function () { exGet(files); };
  el("exSCopy").onclick = function () { exAction("copy", list); };
  el("exSMove").onclick = function () { exAction("move", list); };
}

function exPaste() {
  var c = EX.clip; if (!c || !EX.data) return;
  exRun("copy_file", { srcs: c.items.map(function (x) { return x.p; }), dst: EX.data.path, move: c.move }, c.move ? "Đang di chuyển" : "Đang copy").then(function (j) {
    EX.clip = null; toast(c.move ? "Đã di chuyển xong" : "Đã copy xong"); exOut(j.ket_qua); exGo(EX.data.path, true);
  }).catch(function (e) { exOut(e.message, true); });
}

function exNewFolder() {
  var o = el("exOut");
  o.innerHTML = '<form class="exin" id="exNF"><input name="n" placeholder="Tên thư mục mới" autofocus><button>Tạo</button></form>';
  el("exNF").onsubmit = function (e) {
    e.preventDefault(); var n = this.n.value.trim(); if (!n) return;
    exRun("tao_thu_muc", { parent: EX.data.path, name: n }, "Đang tạo thư mục").then(function (j) { o.innerHTML = ""; toast("Đã tạo thư mục"); exGo(EX.data.path, true); })
      .catch(function (e2) { exOut(e2.message, true); });
  };
  o.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function exOut(msg, err) { var o = el("exOut"); if (o) o.innerHTML = '<div class="note ' + (err ? "err" : "info") + '" style="white-space:pre-wrap">' + esc(msg) + '</div>'; }

/* ---------- ĐIỆN THOẠI → MÁY TÍNH ---------- */
function exUpload() {
  var files = Array.prototype.slice.call(el("exUp").files || []); if (!files.length || !EX.data) return;
  var big = files.filter(function (f) { return f.size > 10 * 1048576; });
  if (big.length) { toast("File quá 10 MB: " + big[0].name); return; }
  if (!connected()) { toast("Chưa kết nối máy tính"); return; }
  var ids = [], k = 0, dst = EX.data.path;
  exBusy("Đang gửi lên 0/" + files.length + "…");
  files.reduce(function (p, f) {
    return p.then(function () {
      return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(",")[1]); }; r.onerror = rej; r.readAsDataURL(f); })
        .then(function (b64) { return api("file.put", { name: f.name, mime: f.type || "application/octet-stream", b64: b64 }); })
        .then(function (r) { ids.push({ id: r.file_id, name: f.name }); k++; exBusy("Đang gửi lên " + k + "/" + files.length + "…"); });
    });
  }, Promise.resolve()).then(function () {
    return exRun("nhan_file", { dst: dst, files: ids }, "Máy tính đang lưu file");
  }).then(function (j) { toast("Đã lưu " + ids.length + " file vào máy"); exOut(j.ket_qua); exGo(dst, true); })
    .catch(function (e) { exBusy(""); exOut(/Action không hợp lệ/.test(e.message) ? "Cần cập nhật Apps Script (bản 1.2.0 có file.put)" : e.message, true); });
}

/* ---------- MÁY TÍNH → ĐIỆN THOẠI (1 hoặc nhiều file) ---------- */
function exGet(list) {
  list = list.filter(function (x) { return !x.d; }).slice(0, 10);
  if (!list.length) return;
  var big = list.filter(function (x) { return x.s > 10 * 1048576; });
  if (big.length) { toast("File quá 10 MB, mở trên máy tính: " + big[0].n); return; }
  exRun("lay_file", { paths: list.map(function (x) { return x.p; }) }, "Đang lấy " + list.length + " file").then(function (j) {
    var links = String(j.link_file || "").split(" ").filter(Boolean);
    var h = '<div class="note info">Đã lấy ' + links.length + ' file. Bấm Tải để lưu về máy, Zalo để gửi ngay.</div>';
    links.forEach(function (u, i) {
      var fid = exFid(u), nm = list[i] ? list[i].n : "file";
      h += '<div class="exrow"><span class="ic">' + svg(fileIcon({ n: nm })) + '</span><span class="tx"><b>' + esc(nm) + '</b></span>' +
        '<a class="btn" style="width:auto;margin:0;padding:8px 12px;text-decoration:none" href="https://drive.google.com/uc?export=download&id=' + esc(fid) + '">Tải</a>' +
        '<button class="btn ok" style="width:auto;margin:0 0 0 6px;padding:8px 12px" data-z="' + esc(fid) + '">Zalo</button></div>';
    });
    el("exOut").innerHTML = h; EX.sel = {}; EX.selMode = false; exRender();
    Array.prototype.forEach.call(document.querySelectorAll("#exOut [data-z]"), function (b) { b.onclick = function () { exShare(b.getAttribute("data-z"), b); }; });
    el("exOut").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }).catch(function (e) { exOut(e.message, true); });
}

function exShare(fid, btn) {
  var label = btn ? btn.innerHTML : "";
  if (btn) { btn.disabled = true; btn.textContent = "…"; }
  api("file.get", { file_id: fid }).then(function (r) {
    var bin = atob(r.b64), arr = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    var f = new File([arr], r.name, { type: r.mime });
    if (btn) { btn.disabled = false; btn.innerHTML = "Gửi"; btn.onclick = function () { doShare(f); }; }
    return doShare(f);
  }).catch(function (e) { if (btn) { btn.disabled = false; btn.innerHTML = label; } toast("Lỗi: " + e.message); });
  function doShare(f) {
    if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], title: f.name }).catch(function (e) { if (e && e.name === "NotAllowedError") toast("Bấm “Gửi” lần nữa để chia sẻ"); });
    var a = document.createElement("a"); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); a.remove();
    toast("Máy không hỗ trợ chia sẻ trực tiếp, đã tải file về."); return Promise.resolve();
  }
}

/* =====================================================================
   XEM / SỬA FILE
   ===================================================================== */
var EXV = null;   // file đang xem: {it, data, editing}
function exView(it, wantEdit, sheet, note) {
  EXV = { it: it, data: null, editing: false, wantEdit: !!wantEdit, note: note || "" };
  var h = '<div class="sh-h"><button class="btn sec" id="exVBack" style="width:auto;margin:0 8px 0 0;padding:8px 12px;flex:none">‹</button><span class="ic" style="flex:none">' + svg(fileIcon(it)) + '</span><div style="min-width:0"><b style="word-break:break-word">' + esc(it.n) + '</b><div class="sub" style="word-break:break-all">' + esc(dirOf(it.p)) + '</div></div></div>' +
    '<div id="exBusy" class="exbusy"></div><div id="exVBody"><div class="empty">Đang mở file…</div></div><div id="exOut"></div>' +
    '<button class="btn sec" id="exVClose">Về danh sách</button>';
  openSheet(h);
  el("exVBack").onclick = el("exVClose").onclick = exBackToList;
  exRun("doc_file", sheet ? { path: it.p, sheet: sheet } : { path: it.p }, "Đang mở file").then(function (j) {
    EXV.data = exParse(j, "§OPEN§"); exViewRender();
  }).catch(function (e) { el("exVBody").innerHTML = '<div class="note err">' + esc(e.message) + '</div>' + exActHtml(); exBindAct(); });
}
function exBackToList() { EXV = null; openExplorer({ restore: true }); }

function exActHtml() {
  var d = EXV.data || {}, it = EXV.it, h = '<div class="exv-act">';
  if (d.file_id) h += '<a class="pri" href="https://drive.google.com/uc?export=download&id=' + esc(d.file_id) + '">' + svg("download") + ' Tải về</a><button id="exVZalo">' + svg("share") + ' Zalo</button><a href="https://drive.google.com/file/d/' + esc(d.file_id) + '/view" target="_blank" rel="noopener">' + svg("link") + ' Mở trên Drive</a>';
  else h += '<button class="pri" id="exVGet">' + svg("download") + ' Tải về / Zalo</button>';
  h += '<button id="exVCopy">Copy</button><button id="exVMove">Di chuyển</button><button id="exVDir">Thư mục chứa</button></div>';
  return h;
}
function exBindAct() {
  var it = EXV.it, d = EXV.data || {};
  if (el("exVZalo")) el("exVZalo").onclick = function () { exShare(d.file_id, el("exVZalo")); };
  if (el("exVGet")) el("exVGet").onclick = function () { exBackToList(); setTimeout(function () { exGet([it]); }, 50); };
  el("exVCopy").onclick = function () { exBackToList(); exAction("copy", [it]); };
  el("exVMove").onclick = function () { exBackToList(); exAction("move", [it]); };
  el("exVDir").onclick = function () { EXV = null; openExplorer({ path: dirOf(it.p) }); };
}

function exViewRender() {
  var d = EXV.data, b = el("exVBody"), h = '<p class="sh-d">' + fmtSize(d.size) + ' · sửa lúc ' + esc(d.t) + '</p>';
  if (d.kind === "text") {
    h += '<pre class="res" id="exTxt" style="max-height:58vh">' + esc(d.content) + '</pre>' + (d.cut ? '<div class="note">File dài, chỉ hiện 40.000 ký tự đầu nên không sửa từ điện thoại.</div>' : "");
    if (!d.cut) h += '<button class="btn" id="exEditT">Sửa nội dung</button>';
  } else if (d.kind === "excel") {
    h += '<div class="extabs">' + d.sheets.map(function (s) { return '<button data-s="' + esc(s) + '"' + (s === d.sheet ? ' class="on"' : "") + '>' + esc(s) + '</button>'; }).join("") + '</div>';
    h += '<div class="exgrid"><table><tr><th></th>' + d.cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") + '</tr>' +
      d.rows.map(function (row, r) { return '<tr><td class="rn">' + (r + 1) + '</td>' + row.map(function (c, k) { return '<td data-c="' + d.cols[k] + (r + 1) + '"' + (c[1] ? ' class="f" title="Công thức"' : "") + '>' + esc(c[0]) + '</td>'; }).join("") + '</tr>'; }).join("") + '</table></div>';
    if (d.max_row > d.rows.length || d.max_col > d.cols.length) h += '<div class="note info">Đang hiện ' + d.rows.length + '/' + d.max_row + ' dòng, ' + d.cols.length + '/' + d.max_col + ' cột đầu. Ô vàng là công thức (không sửa từ điện thoại).</div>';
    if (d.co_hinh) h += '<div class="note">File có hình/biểu đồ nên chỉ xem, không sửa từ điện thoại (tránh mất hình).</div>';
    else if (d.edit) h += '<button class="btn" id="exEditX">Sửa ô</button>';
  } else if (d.kind === "word") {
    h += '<div class="expara">' + (d.paras.length ? d.paras.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") : '<i>Không có chữ</i>') + '</div>';
    if (d.file_id) h += '<div id="exWPrev"><button class="btn sec" id="exWPrevB">Xem đúng bố cục (qua Drive)</button></div>';
    if (d.edit) h += '<button class="btn" id="exEditW">Tìm &amp; thay chữ</button>';
  } else if (d.kind === "image" && d.file_id) {
    h += '<div id="exImg" class="empty">Đang tải ảnh…</div>';
  } else if (d.file_id) {
    h += '<iframe class="exframe" src="https://drive.google.com/file/d/' + esc(d.file_id) + '/preview" allow="autoplay"></iframe><div class="sub" style="margin-top:6px">Nếu khung trên trống: bấm “Mở trên Drive” (điện thoại cần đăng nhập đúng tài khoản Google).</div>';
  } else {
    h += '<div class="note">File lớn hơn 10 MB nên không xem trước được trên điện thoại. Anh mở trên máy tính.</div>';
  }
  b.innerHTML = h + exActHtml();
  exBindAct();
  if (EXV.note) { exOut(EXV.note); EXV.note = ""; }       // kết quả lưu (kèm đường dẫn bản sao lưu)
  if (d.kind === "image" && d.file_id) api("file.get", { file_id: d.file_id }).then(function (r) { el("exImg").outerHTML = '<img src="data:' + r.mime + ';base64,' + r.b64 + '" style="max-width:100%;border-radius:12px;margin-top:10px">'; }).catch(function () { el("exImg").textContent = "Không tải được ảnh"; });
  Array.prototype.forEach.call(b.querySelectorAll(".extabs button"), function (t) { t.onclick = function () { exView(EXV.it, false, t.getAttribute("data-s")); }; });
  if (el("exWPrevB")) el("exWPrevB").onclick = function () { el("exWPrev").innerHTML = '<iframe class="exframe" src="https://drive.google.com/file/d/' + esc(d.file_id) + '/preview"></iframe><div class="sub" style="margin-top:6px">Khung trống: điện thoại cần đăng nhập đúng tài khoản Google, hoặc bấm “Mở trên Drive”.</div>'; };
  if (el("exEditT")) el("exEditT").onclick = exEditText;
  if (el("exEditX")) el("exEditX").onclick = exEditExcel;
  if (el("exEditW")) el("exEditW").onclick = exEditWord;
  if (EXV.wantEdit) { EXV.wantEdit = false; var eb = el("exEditT") || el("exEditX") || el("exEditW"); if (eb) eb.click(); }
}

/* --- sửa văn bản --- */
function exEditText() {
  var d = EXV.data, pre = el("exTxt");
  pre.outerHTML = '<textarea class="exedit" id="exTA" spellcheck="false"></textarea>';
  el("exTA").value = d.content;
  el("exEditT").outerHTML = '<button class="btn ok" id="exSaveT">Lưu vào máy tính</button><button class="btn sec" id="exCancelT">Hủy sửa</button>';
  el("exCancelT").onclick = exViewRender;
  el("exSaveT").onclick = function () {
    var txt = el("exTA").value; if (txt === d.content) { toast("Chưa thay đổi gì"); return; }
    var btn = el("exSaveT"); btn.disabled = true;
    exBusy("Đang gửi nội dung…");
    api("file.put", { name: "sua_" + EXV.it.n + ".txt", mime: "text/plain", b64: exB64(txt) })
      .then(function (r) { return exRun("sua_file", { path: d.path, kind: "text", file_id: r.file_id }, "Đang lưu"); })
      .then(function (j) { toast("Đã lưu"); exView(EXV.it, false, null, j.ket_qua); })
      .catch(function (e) { btn.disabled = false; exBusy(""); exOut(e.message, true); });
  };
}

/* --- sửa ô Excel --- */
function exEditExcel() {
  var d = EXV.data, chg = {};
  Array.prototype.forEach.call(document.querySelectorAll(".exgrid td[data-c]"), function (td) {
    if (td.classList.contains("f")) return;
    td.setAttribute("contenteditable", "true"); td.dataset.old = td.textContent;
    td.addEventListener("input", function () { var v = td.innerText.replace(/\n$/, ""); if (v !== td.dataset.old) { chg[td.dataset.c] = v; td.classList.add("chg"); } else { delete chg[td.dataset.c]; td.classList.remove("chg"); } el("exSaveX").textContent = "Lưu " + Object.keys(chg).length + " ô"; });
  });
  el("exEditX").outerHTML = '<div class="note info">Chạm vào ô để sửa. Ô vàng là công thức, không sửa được. Số có 0 ở đầu (MST, SĐT) được giữ nguyên dạng chữ.</div><button class="btn ok" id="exSaveX">Lưu 0 ô</button><button class="btn sec" id="exCancelX">Hủy sửa</button>';
  el("exCancelX").onclick = function () { exViewRender(); };
  el("exSaveX").onclick = function () {
    var list = Object.keys(chg).map(function (c) { return { sheet: d.sheet, cell: c, value: chg[c] }; });
    if (!list.length) { toast("Chưa sửa ô nào"); return; }
    var btn = el("exSaveX"); btn.disabled = true;
    exRun("sua_file", { path: d.path, kind: "excel", changes: list }, "Đang lưu Excel").then(function (j) {
      toast("Đã lưu " + list.length + " ô"); exView(EXV.it, false, d.sheet, j.ket_qua);
    }).catch(function (e) { btn.disabled = false; exOut(e.message, true); });
  };
}

/* --- tìm & thay trong Word --- */
function exEditWord() {
  var d = EXV.data;
  el("exEditW").outerHTML = '<div class="note info">Tìm đúng chữ (phân biệt hoa/thường) và thay trong toàn bộ file: thân bài, bảng, đầu/cuối trang. Bản cũ được sao lưu trước khi lưu.</div>' +
    '<form id="exWF">' + [0, 1, 2].map(function (i) { return '<div class="exrep"><input name="f' + i + '" placeholder="Chữ cần tìm"><input name="w' + i + '" placeholder="Thay bằng"></div>'; }).join("") +
    '<button class="btn ok" type="submit">Thay &amp; lưu</button><button class="btn sec" type="button" id="exCancelW">Hủy</button></form>';
  el("exCancelW").onclick = exViewRender;
  el("exWF").onsubmit = function (e) {
    e.preventDefault(); var f = this, reps = [];
    [0, 1, 2].forEach(function (i) { var a = f["f" + i].value; if (a) reps.push({ find: a, "with": f["w" + i].value }); });
    if (!reps.length) { toast("Nhập chữ cần tìm"); return; }
    exRun("sua_file", { path: d.path, kind: "word", replace: reps }, "Đang thay chữ trong Word").then(function (j) {
      toast("Xong"); exView(EXV.it, false, null, j.ket_qua);
    }).catch(function (e2) { exOut(e2.message, true); });
  };
}

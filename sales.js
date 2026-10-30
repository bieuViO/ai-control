/* =====================================================================
   AI BÁN HÀNG – nút trên sơ đồ AI Control (nằm đúng chỗ cũ của nút HĐ Word)
   Xem số liệu bot bán hàng, khách NÓNG cần gọi, việc anh cần làm, nhật ký; nhập hoa hồng;
   bấm 1 khách để Gọi / Zalo / mở tool Báo giá – Hợp đồng có sẵn (điền sẵn MST + dịch vụ).
   File riêng, nạp sau sheets.js (dùng lại: api, openSheet, closeSheet, toast, esc, el, svg,
   connected, lsGet, lsSet, toolById, openTool, fmtMoney, renderHub).
   Dữ liệu: Google Sheet "AI Bán Hàng – VNPT Chơn Thành", đọc/ghi qua backend Apps Script
   (action sheet.files / sheet.read / sheet.update, Code.gs ≥ 1.4.0).
   Backend chỉ cho đọc Sheet có trong hằng SHEET_FILES của Code.gs → phải thêm Sheet này vào đó.
   ===================================================================== */
"use strict";
(function () {
  var css = [
    ".abh-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}",
    ".abh-chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;background:var(--blue-soft);color:#12326B}",
    ".abh-chip.warn{background:var(--warn-bg);color:#7A4306}.abh-chip.ok{background:var(--ok-bg);color:#0E6B4C}",
    ".abh-chip i{width:8px;height:8px;border-radius:50%;background:currentColor;opacity:.75}",
    ".abh-kpi{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}",
    ".abh-kpi>div{border:1px solid var(--line);border-radius:14px;padding:10px 12px;min-width:0}",
    ".abh-kpi small{display:block;font-size:12px;color:var(--mute)}",
    ".abh-kpi b{display:block;font-size:22px;font-weight:800;color:var(--blue);line-height:1.25;word-break:break-word}",
    ".abh-kpi .hot{border-color:#E4A39B;background:#FFF7F6}.abh-kpi .hot small,.abh-kpi .hot b{color:#8E2A20}",
    ".abh-self{background:#F8FAFD;border:1px solid var(--line);border-radius:14px;padding:12px;margin-top:10px}",
    ".abh-self h4{margin:0;font-size:14px;color:var(--blue)}",
    ".abh-bar{height:8px;border-radius:8px;background:#E3E9F3;margin-top:8px;overflow:hidden}.abh-bar i{display:block;height:100%;background:var(--ok)}",
    ".abh-self p{margin:6px 0 0;font-size:12.5px;color:#475467}",
    "h3.sec.abh-red{color:#8E2A20}",
    ".abh-lead{border:1px solid var(--line);border-radius:14px;padding:12px;margin-top:8px;box-shadow:var(--shadow);background:#fff}",
    ".abh-lh{display:flex;justify-content:space-between;align-items:center;gap:8px}.abh-lh b{font-size:15px;word-break:break-word}",
    ".abh-tag{flex:none;font-size:11px;font-weight:800;padding:3px 9px;border-radius:999px;background:var(--blue-soft);color:var(--blue);white-space:nowrap}",
    ".abh-tag.hot{background:var(--err-bg);color:#8E2A20}.abh-tag.warm{background:var(--warn-bg);color:#7A4306}.abh-tag.ok{background:var(--ok-bg);color:#0E6B4C}",
    ".abh-l1{font-size:13px;color:#344054;margin-top:4px;word-break:break-word}.abh-l2{font-size:12px;color:var(--mute);margin-top:2px;word-break:break-word}",
    ".abh-acts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:10px}",
    ".abh-acts a,.abh-acts button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:48px;border:0;border-radius:10px;background:var(--blue-soft);color:var(--blue);font-size:12px;font-weight:700;text-decoration:none;font-family:inherit;padding:0}",
    ".abh-acts .pri{background:var(--blue);color:#fff}.abh-acts .off{opacity:.4;pointer-events:none}.abh-acts svg{font-size:17px}",
    ".abh-more{display:block;width:100%;margin-top:6px;border:0;background:none;color:var(--blue-2);font-weight:700;font-size:13px;padding:8px 0 0;text-align:right}",
    ".abh-task{border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-top:8px}",
    ".abh-task.hl{border:1.5px solid var(--blue-2);background:#F5F8FF}",
    ".abh-task b{display:block;font-size:14px}.abh-task small{display:block;font-size:12px;color:var(--mute);margin-top:2px;word-break:break-word;white-space:pre-line}",
    ".abh-task .row{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}",
    ".abh-task .row a,.abh-task .row button{border:0;border-radius:10px;padding:10px 14px;font-weight:700;font-size:13.5px;min-height:44px;background:var(--blue-soft);color:var(--blue);text-decoration:none;display:inline-flex;align-items:center;font-family:inherit}",
    ".abh-task .row .pri{background:var(--blue);color:#fff}",
    ".abh-hh{display:flex;gap:8px;margin-top:8px}.abh-hh input{flex:1;min-width:0}",
    ".abh-hh button{flex:none;border:0;border-radius:12px;padding:0 18px;background:var(--blue);color:#fff;font-weight:700;font-size:15px}",
    ".abh-log{display:flex;gap:12px;align-items:flex-start;padding:10px 2px;border-bottom:1px solid var(--line)}.abh-log:last-child{border:0}",
    ".abh-log .ji{width:34px;height:34px;border-radius:10px;background:var(--blue-soft);color:var(--blue);display:grid;place-items:center;font-size:17px;flex:none}",
    ".abh-log b{display:block;font-size:13.5px}.abh-log span{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:12px;color:var(--mute)}",
    ".abh-row2{display:flex;gap:10px}.abh-row2 .btn{flex:1;text-align:center;text-decoration:none;display:block}",
    ".abh-dl{display:grid;grid-template-columns:110px minmax(0,1fr);column-gap:10px;border:1px solid var(--line);border-radius:14px;padding:4px 12px;margin:12px 0 0;font-size:13.5px}",
    ".abh-dl dt{color:var(--mute);padding:7px 0;border-bottom:1px solid #EEF2F8}.abh-dl dd{margin:0;padding:7px 0;border-bottom:1px solid #EEF2F8;font-weight:600;word-break:break-word}",
    ".abh-st{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}",
    ".abh-st button{min-height:44px;border:1px solid var(--line);background:#fff;color:var(--blue);border-radius:999px;padding:0 14px;font-size:13px;font-weight:600}",
    ".abh-st button.on{background:var(--ok);border-color:var(--ok);color:#fff;font-weight:700}",
    ".abh-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}",
    ".abh-id{font:12px/1.4 ui-monospace,Consolas,monospace;background:#fff;border:1px dashed var(--line);border-radius:8px;padding:6px 8px;word-break:break-all;margin-top:6px;user-select:text;-webkit-user-select:text}",
    ".node .abh-badge{position:absolute;top:-4%;left:-4%;min-width:calc(var(--u)*4.6);height:calc(var(--u)*4.6);border-radius:999px;background:#FBBF24;color:#3b2a00;font-weight:800;font-size:max(10px,calc(var(--u)*2.6));display:grid;place-items:center;border:calc(var(--u)*.45) solid #fff;padding:0 3px}",
    ".node.abh-hot{box-shadow:0 0 0 calc(var(--u)*.8) var(--cyan),0 0 0 calc(var(--u)*1.8) rgba(0,163,224,.22),0 calc(var(--u)*1.2) calc(var(--u)*3.4) rgba(11,61,145,.42)}"
  ].join("\n");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
})();

/* ---------- cấu hình ---------- */
var ABH = {
  SHEET_ID: "1dp-par2cKJUDzeVORHaNCgQRwcV2GGUe7uI47BFX1HI",
  file: "", data: null, hot: -1, seq: 0, lead: null, conv: {}
};
var ABH_URL = "https://docs.google.com/spreadsheets/d/" + ABH.SHEET_ID + "/edit";
var ABH_ST = ["Mới", "Đã gọi", "Đã báo giá", "Đã ký", "Không mua"];

function abhNorm(s) { return String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/\s+/g, " ").trim(); }
function abhNum(v) { var n = String(v == null ? "" : v).replace(/[^\d-]/g, ""); return n ? +n : 0; }
function abhMoney(v) { var s = String(v == null ? "" : v).trim(); if (!s) return "0 đ"; if (/^-?[\d.,\s]+$/.test(s)) return fmtMoney(abhNum(s)) + " đ"; return s; }
function abhPhone(v) { var d = String(v || "").replace(/\D/g, ""); if (/^84\d{9}$/.test(d)) d = "0" + d.slice(2); return d; }
/* Chờ backend tối đa 25 giây, quá thì báo để bấm Tải lại */
function abhApi(action, data) {
  return Promise.race([api(action, data), new Promise(function (_, rej) { setTimeout(function () { rej(new Error("Backend phản hồi chậm (quá 25 giây). Bấm Tải lại.")); }, 25000); })]);
}

/* ---------- tìm Sheet AI Bán Hàng trong danh sách Sheet backend cho phép ---------- */
function abhFindFile() {
  if (ABH.file) return Promise.resolve(ABH.file);
  return abhApi("sheet.files").then(function (r) {
    var files = r.files || [], want = lsGet("abh_file");
    var hit = files.filter(function (f) { return f.k === want; })[0] || files.filter(function (f) {
      var s = abhNorm([f.k, f.name, f.id, f.url].join(" "));
      return s.indexOf(ABH.SHEET_ID.toLowerCase()) >= 0 || s.indexOf("ban hang") >= 0 || s.indexOf("ban_hang") >= 0 || s.indexOf("banhang") >= 0;
    })[0];
    if (!hit) { var e = new Error("NOFILE"); e.nofile = true; throw e; }
    ABH.file = hit.k; lsSet("abh_file", hit.k); return hit.k;
  });
}
function abhRead(tab, limit, order) {
  return abhApi("sheet.read", { file: ABH.file, tab: tab, q: "", limit: limit || 60, offset: 0, order: order || "asc" })
    .then(function (r) { return (r.rows || []).slice().sort(function (a, b) { return a.row - b.row; }); });
}
/* Ghi 1 dòng: kiểm tra cột 1 đúng giá trị cũ rồi mới ghi (giống Bảng KH) */
function abhUpdate(tab, row, check, changes) {
  return abhApi("sheet.update", { file: ABH.file, tab: tab, row: row, check: { col: 1, value: check }, changes: changes });
}

/* ---------- đọc toàn bộ số liệu cho màn chính ---------- */
function abhLeadOf(r) {
  var c = r.cells || [];
  return { row: r.row, key: c[0] || "", t: c[0] || "", kenh: c[1] || "", psid: c[2] || "", ten: c[3] || "", loai: c[4] || "", dt: c[5] || "",
    nhu: c[6] || "", sp: c[7] || "", mst: c[8] || "", sdt: c[9] || "", dongy: c[10] || "", muc: c[11] || "", tt: c[12] || "", dthd: c[13] || "", hh: c[14] || "", note: c[15] || "" };
}
function abhLoad() {
  return abhFindFile().then(function () {
    return Promise.all([abhRead("TongQuan", 40), abhRead("ViecCuaAnh", 40), abhRead("Leads", 200, "desc"), abhRead("NhatKy", 60, "desc"), abhRead("ChiPhi", 40)]);
  }).then(function (a) {
    var kv = {};
    a[0].forEach(function (r) { var k = abhNorm(r.cells[0]); if (k) kv[k] = r.cells[1] == null ? "" : String(r.cells[1]); });
    var get = function (p) { for (var k in kv) if (k.indexOf(p) === 0) return kv[k]; return ""; };
    var hh = null, can = "";
    a[4].forEach(function (r) {
      var k = abhNorm(r.cells[0]);
      if (k.indexOf("hoa hong trung binh") === 0) hh = { row: r.row, label: r.cells[0], value: r.cells[1] || "" };
      else if (k.indexOf("so hd can") === 0) can = r.cells[1] || "";
    });
    var tasks = a[1].filter(function (r) { return /^chua/.test(abhNorm(r.cells[5])) && String(r.cells[1] || "").trim(); }).map(function (r) {
      var c = r.cells; return { row: r.row, n: c[0] || "", title: c[1] || "", how: c[2] || "", link: c[3] || "" };
    });
    var leads = a[2].filter(function (r) { var c = r.cells || []; return c[0] || c[2] || c[9]; }).map(abhLeadOf).reverse();
    var logs = a[3].filter(function (r) { return String(r.cells[0] || "").trim(); }).reverse().slice(0, 4).map(function (r) { return { d: r.cells[0], did: r.cells[1] || "", kq: r.cells[2] || "" }; });
    ABH.data = {
      todayLead: get("lead moi hom nay"), hot: get("lead nong chua goi"), ky: get("hop dong da ky"), hhThang: get("hoa hong thang nay"),
      chiPhi: get("chi phi ai"), tuNuoi: get("tinh trang tu nuoi"), bot: get("trang thai bot"), capNhat: get("cap nhat lan cuoi"),
      hh: hh, canHD: can, tasks: tasks, leads: leads, logs: logs
    };
    ABH.hot = leads.filter(abhIsHotNew).length;
    abhPaintBadge();
    return ABH.data;
  });
}
function abhIsHotNew(l) { return abhNorm(l.muc) === "nong" && (!l.tt || abhNorm(l.tt) === "moi"); }

/* ---------- màn chính ---------- */
function abhHead(sub) {
  return '<div class="sh-h"><span class="ic">' + svg("sale") + '</span><div><b>AI Bán Hàng</b><div class="sub">' + esc(sub || "Fanpage VNPT CHƠN THÀNH · HĐĐT + chữ ký số cho hộ kinh doanh") + '</div></div></div>';
}
function abhFoot() {
  return '<div class="abh-row2"><a class="btn sec" href="' + ABH_URL + '" target="_blank" rel="noopener">Mở Sheet</a><button class="btn sec" type="button" id="abhReload">Tải lại</button></div>' +
    '<button class="btn sec" type="button" id="abhClose">Đóng</button>';
}
function abhBindFoot() {
  if (el("abhClose")) el("abhClose").onclick = function () { closeSheet(); abhBadgeSoon(); };
  if (el("abhReload")) el("abhReload").onclick = function () { openSales(true); };
}
function openSales(reload) {
  ABH.lead = null;
  if (!connected()) {
    openSheet(abhHead() + '<div class="note err">Chưa kết nối backend. Bấm biểu tượng ⚙ (Cài đặt) để nhập địa chỉ và token.</div>' + abhFoot());
    abhBindFoot(); return;
  }
  var my = ++ABH.seq;
  if (ABH.data && !reload) abhRender(); else openSheet(abhHead() + '<div class="note info">Đang tải số liệu từ Sheet AI Bán Hàng…</div>' + abhFoot());
  abhBindFoot();
  abhLoad().then(function () {
    if (my !== ABH.seq || ABH.lead || !el("sheet").classList.contains("open")) return;
    var a = document.activeElement; if (a && a.tagName === "INPUT" && el("sheet").contains(a)) return;   // anh đang gõ thì không vẽ lại
    abhRender();
  })
    .catch(function (e) { if (my === ABH.seq) abhErr(e); });
}
function abhErr(e) {
  var m = String((e && e.message) || e || "Lỗi");
  var h = abhHead();
  if (e && e.nofile) {
    h += '<div class="note">Backend chưa được phép đọc Sheet AI Bán Hàng. Cần thêm 1 dòng vào Code.gs (làm trên máy tính):</div>' +
      '<div class="ht-card"><h4>Cách thêm</h4><div class="sub" style="white-space:pre-line">1. Mở Sheet AI_CONTROL → Tiện ích mở rộng → Apps Script.\n2. Trong Code.gs tìm SHEET_FILES, chép 1 dòng của KHÁCH HÀNG 2026, đổi tên thành “AI Bán Hàng” và ID thành:</div>' +
      '<div class="abh-id" id="abhId">' + ABH.SHEET_ID + '</div><div class="row" style="display:flex;gap:8px;margin-top:8px"><button class="btn sec" type="button" id="abhCopy" style="margin-top:0">Chép ID</button></div>' +
      '<div class="sub" style="white-space:pre-line;margin-top:8px">3. Lưu → Triển khai → Quản lý các lần triển khai → Sửa (bút chì) → Phiên bản: Phiên bản mới → Triển khai.\n4. Quay lại đây bấm Tải lại.</div></div>';
  } else if (/không hợp lệ: sheet\./i.test(m)) {
    h += '<div class="note err">Backend chưa có chức năng đọc Sheet (cần Code.gs từ 1.4.0). Cần dán Code.gs mới và triển khai lại.</div>';
  } else {
    h += '<div class="note err">Không tải được số liệu: ' + esc(m) + '</div>';
  }
  openSheet(h + abhFoot()); abhBindFoot();
  if (el("abhCopy")) el("abhCopy").onclick = function () {
    var done = function () { toast("Đã chép ID Sheet"); };
    try { navigator.clipboard.writeText(ABH.SHEET_ID).then(done, function () { toast("Không chép được, anh giữ ngón tay lên ID để chép"); }); } catch (x) { toast("Anh giữ ngón tay lên ID để chép"); }
  };
}
function abhKpi(label, val, hot) { return '<div' + (hot ? ' class="hot"' : '') + '><small>' + esc(label) + '</small><b>' + esc(val) + '</b></div>'; }
function abhLeadCard(l, cls) {
  var tag = cls === "hot" ? "NÓNG" : (cls === "warm" ? "ẤM" : (l.tt || "Đang theo dõi"));
  var sdt = abhPhone(l.sdt), line1 = [l.loai, l.dt, l.nhu || l.sp].filter(Boolean).join(" · "), line2 = [l.mst ? "MST " + l.mst : "", l.sdt, l.t].filter(Boolean).join(" · ");
  return '<article class="abh-lead"><div class="abh-lh"><b>' + esc(l.ten || "Khách " + (l.kenh || "Fanpage")) + '</b><span class="abh-tag ' + (cls || "") + '">' + esc(tag) + '</span></div>' +
    (line1 ? '<div class="abh-l1">' + esc(line1) + '</div>' : '') + (line2 ? '<div class="abh-l2">' + esc(line2) + '</div>' : '') +
    '<div class="abh-acts">' +
    '<a class="pri' + (sdt ? '' : ' off') + '" href="' + (sdt ? 'tel:' + sdt : '#') + '">' + svg("call") + 'Gọi</a>' +
    '<a class="' + (sdt ? '' : 'off') + '" href="' + (sdt ? 'https://zalo.me/' + sdt : '#') + '" target="_blank" rel="noopener">' + svg("chat") + 'Zalo</a>' +
    '<button type="button" data-abg="' + l.row + '">' + svg("quote") + 'Báo giá</button>' +
    '<button type="button" data-ahd="' + l.row + '">' + svg("contract") + 'Hợp đồng</button></div>' +
    '<button type="button" class="abh-more" data-aopen="' + l.row + '">Chi tiết, đổi trạng thái ›</button></article>';
}
function abhRender() {
  var d = ABH.data; if (!d) return;
  var botOff = /^⏸|chua chay|tam dung|loi/.test(abhNorm(d.bot)), botTxt = String(d.bot || "Chưa rõ").replace(/^[⏸▶✅⚠️\s]+/, "");
  var hot = d.leads.filter(abhIsHotNew), done = { "da ky": 1, "khong mua": 1 };
  var follow = d.leads.filter(function (l) { return abhNorm(l.muc) === "nong" && !abhIsHotNew(l) && !done[abhNorm(l.tt)]; });
  var warm = d.leads.filter(function (l) { return abhNorm(l.muc) === "am" && !done[abhNorm(l.tt)]; });
  var hhM = abhNum(d.hhThang), cp = abhNum(d.chiPhi), pct = cp > 0 ? Math.min(100, Math.round(hhM / cp * 100)) : (hhM > 0 ? 100 : 0);
  var h = abhHead() +
    '<div class="abh-chips"><span class="abh-chip ' + (botOff ? "warn" : "ok") + '"><i></i>' + esc(botTxt) + '</span>' +
    (d.capNhat ? '<span class="abh-chip">Cập nhật ' + esc(d.capNhat) + '</span>' : '') + '</div>' +
    '<div class="abh-kpi">' + abhKpi("Lead hôm nay", d.todayLead || "0") + abhKpi("Khách NÓNG chưa gọi", String(hot.length), hot.length > 0) +
    abhKpi("Hợp đồng đã ký", d.ky || "0") + abhKpi("Hoa hồng tháng này", abhMoney(d.hhThang)) + '</div>' +
    '<div class="abh-self"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><h4>AI đã tự nuôi được chưa?</h4><span class="sub" style="margin:0">Chi phí AI: ' + esc(abhMoney(d.chiPhi)) + '/tháng</span></div>' +
    '<div class="abh-bar" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
    '<p>' + esc(d.tuNuoi || "Chưa có số liệu") + (/^\d+$/.test(String(d.canHD).trim()) ? ' · Cần ' + esc(d.canHD) + ' HĐ/tháng để hòa vốn' : '') + '</p></div>';
  if (hot.length) h += '<h3 class="sec abh-red">Khách NÓNG cần gọi · ' + hot.length + '</h3>' + hot.map(function (l) { return abhLeadCard(l, "hot"); }).join("");
  if (follow.length) h += '<h3 class="sec">Đang theo dõi · ' + follow.length + '</h3>' + follow.slice(0, 10).map(function (l) { return abhLeadCard(l, "ok"); }).join("");
  if (warm.length) h += '<h3 class="sec">Khách ấm · chưa để SĐT · ' + warm.length + '</h3>' + warm.slice(0, 10).map(function (l) { return abhLeadCard(l, "warm"); }).join("");
  if (!d.leads.length) h += '<div class="note info">Chưa có khách. Khi bot trực Fanpage, khách để lại SĐT sẽ hiện ở đây kèm nút Gọi / Báo giá / Hợp đồng.</div>';
  h += '<h3 class="sec">Việc anh cần làm · ' + d.tasks.length + '</h3>';
  if (!d.tasks.length) h += '<div class="note info">Không có việc nào. Bot tự chạy, anh chỉ cần gọi khách NÓNG.</div>';
  d.tasks.forEach(function (t) {
    var tabGid = { BangGia: 105, KienThuc: 104, ChiPhi: 106, Leads: 102, TongQuan: 0 }, lk = String(t.link || "").trim();
    var isHH = abhNorm(t.title).indexOf("hoa hong") >= 0 && d.hh,
      link = /^https?:\/\//.test(lk) ? lk : (tabGid[lk] != null ? ABH_URL + "#gid=" + tabGid[lk] : "");
    var how = String(t.how || ""); if (how.length > 180) how = how.slice(0, 177) + "…";
    h += '<div class="abh-task' + (isHH ? ' hl' : '') + '"><b>' + esc(t.title) + '</b>' + (how && !isHH ? '<small>' + esc(how) + '</small>' : '');
    if (isHH) {
      h += '<label for="abhHH" style="margin:6px 0 0;font-weight:400;font-size:12px;color:var(--mute)">Gõ số tiền (VNĐ), lưu thẳng vào Sheet' + (d.hh.value ? ' · đang là ' + esc(abhMoney(d.hh.value)) : '') + '</label>' +
        '<form class="abh-hh" id="abhHHf" autocomplete="off"><input id="abhHH" type="text" inputmode="numeric" placeholder="Ví dụ 150000" value="' + esc(d.hh.value ? abhNum(d.hh.value) : "") + '"><button type="submit">Lưu</button></form>';
    } else {
      h += '<div class="row">' + (link ? '<a class="pri" href="' + esc(link) + '" target="_blank" rel="noopener">Mở link</a>' : '') +
        '<button type="button" data-adone="' + t.row + '">Đã xong</button></div>';
    }
    h += '</div>';
  });
  if (d.logs.length) {
    h += '<h3 class="sec">Nhật ký theo ngày</h3>' + d.logs.map(function (g) {
      return '<div class="abh-log"><span class="ji">' + svg("clock") + '</span><div style="min-width:0"><b>' + esc(g.d) + '</b><span>' + esc(g.kq || g.did) + '</span></div></div>';
    }).join("");
  }
  openSheet(h + abhFoot()); abhBindFoot();
  var sh = el("sheet");
  Array.prototype.forEach.call(sh.querySelectorAll("[data-aopen]"), function (b) { b.onclick = function () { abhOpenLead(+b.getAttribute("data-aopen")); }; });
  Array.prototype.forEach.call(sh.querySelectorAll("[data-abg]"), function (b) { b.onclick = function () { abhToTool("bao_gia", +b.getAttribute("data-abg")); }; });
  Array.prototype.forEach.call(sh.querySelectorAll("[data-ahd]"), function (b) { b.onclick = function () { abhToTool("hop_dong_web", +b.getAttribute("data-ahd")); }; });
  Array.prototype.forEach.call(sh.querySelectorAll("[data-adone]"), function (b) { b.onclick = function () { abhTaskDone(+b.getAttribute("data-adone"), b); }; });
  if (el("abhHHf")) el("abhHHf").onsubmit = function (e) { e.preventDefault(); abhSaveHH(); };
}

/* ---------- lưu hoa hồng trung bình (ChiPhi!B10) + đánh dấu việc xong ---------- */
function abhSaveHH() {
  var d = ABH.data, v = abhNum(el("abhHH").value), btn = el("abhHHf").querySelector("button");
  if (!(v > 0)) { toast("Nhập số tiền lớn hơn 0"); return; }
  if (!confirm("Lưu hoa hồng trung bình " + fmtMoney(v) + " đ / hợp đồng?")) return;
  btn.disabled = true; btn.textContent = "Đang lưu…";
  abhUpdate("ChiPhi", d.hh.row, d.hh.label, [{ col: 2, value: v }]).then(function () {
    var t = d.tasks.filter(function (x) { return abhNorm(x.title).indexOf("hoa hong") >= 0; })[0];
    return t ? abhUpdate("ViecCuaAnh", t.row, t.n, [{ col: 6, value: "Đã xong" }]).catch(function () {}) : null;
  }).then(function () { toast("Đã lưu hoa hồng vào Sheet"); openSales(true); })
    .catch(function (e) { btn.disabled = false; btn.textContent = "Lưu"; toast("Không lưu được: " + e.message); });
}
function abhTaskDone(row, b) {
  var t = ABH.data.tasks.filter(function (x) { return x.row === row; })[0]; if (!t) return;
  if (!confirm("Đánh dấu xong: “" + t.title + "”?")) return;
  b.disabled = true; b.textContent = "Đang lưu…";
  abhUpdate("ViecCuaAnh", t.row, t.n, [{ col: 6, value: "Đã xong" }]).then(function () { toast("Đã đánh dấu xong"); openSales(true); })
    .catch(function (e) { b.disabled = false; b.textContent = "Đã xong"; toast("Không lưu được: " + e.message); });
}

/* ---------- từ 1 khách mở thẳng tool Báo giá / Hợp đồng có sẵn ---------- */
function abhGuess(l) {
  var s = abhNorm(l.sp + " " + l.nhu + " " + l.note);
  if (/hoa don|invoice|may tinh tien|pos\b/.test(s)) return { bg: "hoa_don", hd: /may tinh tien|pos\b/.test(s) ? "Hóa đơn điện tử máy tính tiền" : "Hóa đơn điện tử TT78" };
  if (/smartca|chu ky so|ky so|chung thu/.test(s)) return { bg: "ca_moi", hd: "CA 1 năm" };
  return { bg: "", hd: "" };
}
function abhToTool(id, row) {
  var l = (ABH.data.leads || []).filter(function (x) { return x.row === row; })[0], t = toolById(id); if (!l || !t) return;
  var g = abhGuess(l), mst = String(l.mst || "").replace(/[^\d-]/g, ""), p = { mst: mst };
  if (id === "bao_gia") { if (g.bg) p.dich_vu = g.bg; } else { if (g.hd) p.nhom_dv = g.hd; }
  openTool(t, p);
  setTimeout(function () { var f = el("tf"); if (f && f.elements.mst && f.elements.mst.value) f.elements.mst.dispatchEvent(new Event("input")); }, 60);   // tự tra tên công ty theo MST
  if (!mst) toast("Khách chưa có MST, anh nhập thêm");
}

/* ---------- chi tiết 1 khách: xem hội thoại, đổi trạng thái, ghi doanh thu / hoa hồng ---------- */
function abhOpenLead(row) {
  var l = (ABH.data.leads || []).filter(function (x) { return x.row === row; })[0]; if (!l) return;
  ABH.lead = l;
  var cur = l.tt || "Mới", sdt = abhPhone(l.sdt), dl = [["Loại hình", l.loai], ["Doanh thu năm", l.dt], ["Nhu cầu", l.nhu], ["Sản phẩm", l.sp], ["MST", l.mst], ["SĐT", l.sdt ? l.sdt + (l.dongy ? " · đồng ý gọi lại: " + l.dongy : "") : ""], ["Kênh", l.kenh], ["Thời gian", l.t]].filter(function (x) { return String(x[1] || "").trim(); });
  var h = '<div class="sh-h"><span class="ic">' + svg("users") + '</span><div><b>' + esc(l.ten || "Khách " + (l.kenh || "Fanpage")) + '</b><div class="sub">' + esc([l.muc ? "Khách " + l.muc : "", "dòng " + l.row + " tab Leads"].filter(Boolean).join(" · ")) + '</div></div></div>' +
    '<dl class="abh-dl">' + dl.map(function (x) { return '<dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd>'; }).join("") + '</dl>' +
    (sdt ? '<div class="abh-row2" style="margin-top:10px"><a class="btn" style="margin-top:0" href="tel:' + sdt + '">Gọi ' + esc(l.sdt) + '</a><a class="btn sec" style="margin-top:0" href="https://zalo.me/' + sdt + '" target="_blank" rel="noopener">Zalo</a></div>' : '') +
    '<h3 class="sec">Bot đã nói chuyện với khách</h3><pre class="res" id="abhConv">' + (l.psid ? "Đang tải…" : "Không có mã hội thoại.") + '</pre>' +
    '<h3 class="sec">Làm tiếp bằng tool có sẵn</h3>' +
    '<button type="button" class="gm" id="abhBG"><span class="ic">' + svg("quote") + '</span><span><b>Tạo báo giá</b><small>Điền sẵn MST + dịch vụ, máy tính dựng file PDF</small></span><i>›</i></button>' +
    '<button type="button" class="gm" id="abhHD"><span class="ic">' + svg("contract") + '</span><span><b>Tạo hợp đồng</b><small>hopdong.vnpt.vn, dừng trước nút Lưu</small></span><i>›</i></button>' +
    '<h3 class="sec">Trạng thái khách</h3><div class="abh-st" id="abhSt" role="group" aria-label="Trạng thái khách">' +
    ABH_ST.map(function (s) { return '<button type="button" aria-pressed="' + (s === cur) + '"' + (s === cur ? ' class="on"' : '') + ' data-s="' + esc(s) + '">' + esc(s) + '</button>'; }).join("") + '</div>' +
    '<div class="abh-two"><div><label for="abhDT">Doanh thu HĐ (VNĐ)</label><input id="abhDT" type="text" inputmode="numeric" value="' + esc(l.dthd ? abhNum(l.dthd) : "") + '"></div>' +
    '<div><label for="abhHHL">Hoa hồng (VNĐ)</label><input id="abhHHL" type="text" inputmode="numeric" value="' + esc(l.hh ? abhNum(l.hh) : "") + '"></div></div>' +
    '<div class="sub">Hoa hồng tự cộng vào ô “AI đã tự nuôi được chưa?”.</div>' +
    '<label for="abhNote">Ghi chú</label><input id="abhNote" type="text" value="' + esc(l.note) + '">' +
    '<button class="btn" type="button" id="abhSave">Lưu</button><button class="btn sec" type="button" id="abhBack">Quay lại</button>';
  openSheet(h);
  var sel = cur;
  Array.prototype.forEach.call(el("abhSt").querySelectorAll("button"), function (b) {
    b.onclick = function () { sel = b.getAttribute("data-s"); Array.prototype.forEach.call(el("abhSt").querySelectorAll("button"), function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); }); };
  });
  el("abhBG").onclick = function () { abhToTool("bao_gia", l.row); };
  el("abhHD").onclick = function () { abhToTool("hop_dong_web", l.row); };
  el("abhBack").onclick = function () { ABH.lead = null; abhRender(); };
  el("abhSave").onclick = function () {
    var dt = el("abhDT").value.trim(), hh = el("abhHHL").value.trim(), note = el("abhNote").value.trim(), ch = [];
    if (sel !== (l.tt || "Mới")) ch.push({ col: 13, value: sel });
    if (dt !== (l.dthd ? String(abhNum(l.dthd)) : "")) ch.push({ col: 14, value: dt ? abhNum(dt) : "" });
    if (hh !== (l.hh ? String(abhNum(l.hh)) : "")) ch.push({ col: 15, value: hh ? abhNum(hh) : "" });
    if (note !== l.note) ch.push({ col: 16, value: note });
    if (!ch.length) { toast("Chưa có thay đổi nào"); return; }
    if (sel === "Đã ký" && !hh) { if (!confirm("Khách đã ký nhưng chưa nhập hoa hồng. Vẫn lưu?")) return; }
    var b = el("abhSave"); b.disabled = true; b.textContent = "Đang lưu…";
    abhUpdate("Leads", l.row, l.key, ch).then(function () { toast("Đã lưu vào Sheet"); openSales(true); })
      .catch(function (e) { b.disabled = false; b.textContent = "Lưu"; toast("Không lưu được: " + e.message); });
  };
  if (l.psid) {
    var show = function (t) { var c = el("abhConv"); if (c && ABH.lead === l) c.textContent = t || "Chưa có nội dung hội thoại."; };
    if (ABH.conv[l.psid] != null) show(ABH.conv[l.psid]);
    else abhApi("sheet.read", { file: ABH.file, tab: "HoiThoai", q: l.psid, limit: 5, offset: 0, order: "asc" }).then(function (r) {
      var hit = (r.rows || []).filter(function (x) { return String(x.cells[0]) === String(l.psid); })[0];
      ABH.conv[l.psid] = hit ? String(hit.cells[2] || "") : ""; show(ABH.conv[l.psid]);
    }).catch(function (e) { show("Không tải được hội thoại: " + e.message); });
  }
}

/* ---------- số vàng trên nút = khách NÓNG chưa gọi ---------- */
function abhPaintBadge() {
  var nd = el("nd_ai_ban_hang"); if (!nd) return;
  var b = nd.querySelector(".abh-badge"), n = ABH.hot > 0 ? ABH.hot : 0;
  nd.classList.toggle("abh-hot", n > 0);
  if (!n) { if (b) b.remove(); return; }
  if (!b) { b = document.createElement("span"); b.className = "abh-badge"; b.setAttribute("aria-hidden", "true"); nd.appendChild(b); }
  b.textContent = n > 99 ? "99+" : n;
  nd.setAttribute("aria-label", "AI Bán Hàng – " + n + " khách nóng chưa gọi");
}
function abhBadgeRefresh() {
  if (!connected() || document.hidden) return;
  abhFindFile().then(function () { return abhRead("Leads", 200, "desc"); }).then(function (rows) {
    ABH.hot = rows.map(abhLeadOf).filter(abhIsHotNew).length; abhPaintBadge();
  }).catch(function () {});
}
function abhBadgeSoon() { setTimeout(abhBadgeRefresh, 800); }
/* Vẽ lại sơ đồ (vd. Đặt lại sơ đồ) thì gắn lại số vàng */
(function () {
  if (typeof renderHub !== "function") return;
  var orig = renderHub;
  renderHub = function () { orig.apply(this, arguments); abhPaintBadge(); };
})();
setTimeout(abhBadgeRefresh, 2500);
setInterval(abhBadgeRefresh, 300000);   // 5 phút/lần khi app đang mở

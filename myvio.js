/* MY ViO – TRỢ LÝ CÁ NHÂN (myvio.js, aic-v68, 12/11/2026)
   Việc cần làm + nhắc việc (trong app), Theo dõi bám đuổi, Ghi chú nhanh, Việc tự sinh từ dữ liệu (khách sắp hết hạn, khách còn nợ).
   Backend: MyVio.gs (mv.list, mv.save, mv.done, mv.note_save, mv.note_del) – lưu tab MYVIO_VIEC, MYVIO_GHICHU trong Sheet AI_CONTROL.
   Thêm nhanh bằng câu thường: "gọi Hải Vân 9h thứ 6", "nộp báo cáo ngày 25 gấp", "nhắc nợ hằng tháng ngày 5", "theo dõi báo giá Cty X 3 ngày nữa". */
"use strict";
(function () {
  var stl = document.createElement("style");
  stl.textContent =
    ".mvtabs{display:flex;gap:6px;margin:10px 0 6px;overflow-x:auto;scrollbar-width:none}.mvtabs::-webkit-scrollbar{display:none}" +
    ".mvtabs button{flex:0 0 auto;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 13px;font:inherit;font-size:13px;font-weight:600;color:var(--blue);cursor:pointer}" +
    ".mvtabs button.on{background:var(--blue);color:#fff;border-color:var(--blue)}.mvtabs b{font-weight:800;margin-left:4px}" +
    ".mvadd{display:flex;gap:6px;align-items:center;margin-top:6px}.mvadd input{flex:1;min-width:0;border:1px solid var(--line);border-radius:999px;padding:11px 14px;font:inherit;font-size:15px}" +
    ".mvadd button{width:44px;height:44px;border-radius:50%;border:0;display:grid;place-items:center;flex:none;cursor:pointer}" +
    ".mvpre{font-size:12px;color:var(--mute);min-height:16px;margin:4px 6px 0}.mvpre b{color:var(--blue)}" +
    ".mvh{margin:14px 0 4px;font-size:13px;font-weight:700;color:var(--blue);display:flex;justify-content:space-between}.mvh.red{color:#B23A34}" +
    ".mvi{display:flex;gap:10px;align-items:flex-start;padding:10px 2px;border-bottom:1px solid var(--line)}" +
    ".mvck{width:24px;height:24px;border-radius:50%;border:2px solid #9DB3D6;background:#fff;flex:none;cursor:pointer;margin-top:1px;display:grid;place-items:center;color:#fff;font-size:14px;padding:0}" +
    ".mvck.on{background:#1E7B45;border-color:#1E7B45}.mvi.cao .mvck{border-color:#D9534F}" +
    ".mvt{flex:1;min-width:0;cursor:pointer}.mvt b{display:block;font-size:14px;font-weight:600;color:#12263F;word-break:break-word}.mvi.done b{text-decoration:line-through;color:var(--mute)}" +
    ".mvt small{display:block;font-size:12px;color:var(--mute);margin-top:2px}.mvt small .red{color:#B23A34;font-weight:700}.mvt small .amb{color:#A15C00;font-weight:700}" +
    ".mvg{display:flex;gap:6px;flex:none}.mvg button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 9px;font:inherit;font-size:12px;cursor:pointer;color:var(--blue)}" +
    ".mvg button.pri{background:var(--blue);color:#fff;border-color:var(--blue)}" +
    ".mvnote{border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-top:8px;background:#fff}.mvnote.pin{border-color:#F2C14E;background:#FFFBEB}" +
    ".mvnote p{margin:0;font-size:14px;white-space:pre-wrap;word-break:break-word}.mvnote small{display:block;color:var(--mute);font-size:12px;margin-top:6px}" +
    ".mvnote .mvg{margin-top:8px}.mvempty{color:var(--mute);font-size:13px;padding:14px 2px}" +
    ".mvsum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.mvsum div{background:#fff;border:1px solid var(--line);border-radius:12px;padding:8px 10px}" +
    ".mvsum b{display:block;font-size:20px;color:var(--blue)}.mvsum .red b{color:#B23A34}.mvsum small{font-size:11.5px;color:var(--mute)}" +
    ".mvsearch{width:100%;border:1px solid var(--line);border-radius:10px;padding:9px 12px;font:inherit;margin-top:8px}" +
    ".node .mvb{position:absolute;top:2%;right:2%;min-width:calc(var(--u)*3.6);height:calc(var(--u)*3.6);border-radius:50%;background:#D9534F;color:#fff;font-weight:800;font-size:max(10px,calc(var(--u)*2.3));display:grid;place-items:center;border:2px solid #fff}";
  document.head.appendChild(stl);

  var M = { viec: [], xong: [], ghi_chu: [], goi_y: [], tab: "hom_nay", q: "", nhom: "", loaded: false, busy: false };
  try { var c = JSON.parse(lsGet("mv_cache") || "null"); if (c && c.viec) { M.viec = c.viec; M.xong = c.xong || []; M.ghi_chu = c.ghi_chu || []; } } catch (e) {}
  function saveCache() { try { lsSet("mv_cache", JSON.stringify({ viec: M.viec, xong: M.xong.slice(0, 30), ghi_chu: M.ghi_chu.slice(0, 200) })); } catch (e) {} }

  /* ---------------- ngày giờ ---------------- */
  function z(n) { return ("0" + n).slice(-2); }
  function ymd(d) { return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); }
  function today0() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function hanDate(h) { var m = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?$/.exec(h || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 23, m[5] ? +m[5] : 59) : null; }
  function dayDiff(h) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(h || ""); if (!m) return null; return Math.round((new Date(+m[1], +m[2] - 1, +m[3]) - today0()) / 864e5); }
  var THU = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  function hanLabel(h) {
    if (!h) return ""; var dd = dayDiff(h), t = (h.split(" ")[1] || ""), d = hanDate(h);
    var s = dd === 0 ? "Hôm nay" : dd === 1 ? "Mai" : dd === -1 ? "Hôm qua" : (THU[d.getDay()] + " " + z(d.getDate()) + "/" + z(d.getMonth() + 1));
    return s + (t ? " " + t : "");
  }
  function overdue(v) { var d = hanDate(v.han); return !!(d && d < new Date()); }
  function nz(x) { return String(x || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase(); }

  /* Hiểu câu tiếng Việt → {tieu_de, han, lap, uu_tien, loai}. Không cần Gemini. */
  function parse(text) {
    var orig = String(text || "").trim(), s = " " + nz(orig) + " ", cut = [], now = new Date(), date = null, hh = null, mi = 0, lap = "", m;
    function mark(re) { var r = s.match(re); if (r) cut.push(r[0].trim()); return r; }
    if (mark(/\s(hang ngay|moi ngay)\s/)) lap = "ngay";
    else if (mark(/\s(hang tuan|moi tuan)\s/)) lap = "tuan";
    else if (mark(/\s(hang thang|moi thang)\s/)) lap = "thang";
    // giờ: 9h, 9h30, 9:30, 9 gio, 14g, kèm sáng/chiều/tối
    if ((m = mark(/\s(?:luc\s+)?(\d{1,2})\s*(?:h|g|gio|:)\s*(\d{1,2})?(?:\s*(?:phut|p))?(?:\s+(sang|trua|chieu|toi))?(?=\s)/))) {
      hh = +m[1]; mi = m[2] ? +m[2] : 0; if (m[3] && /chieu|toi/.test(m[3]) && hh < 12) hh += 12; if (m[3] === "trua" && hh < 11) hh += 12;
      if (hh > 23 || mi > 59) { hh = null; mi = 0; }
    } else if ((m = mark(/\s(sang|trua|chieu|toi)(?:\s+nay)?(?=\s)/))) { hh = { sang: 8, trua: 12, chieu: 14, toi: 19 }[m[1]]; }
    // ngày
    var d0 = today0();
    if (mark(/\s(hom nay|bay gio)\s/)) date = d0;
    else if (mark(/\s(ngay mai)\s/) || (!/\S\s+Mai(\s|$)/.test(orig) && mark(/\s(mai)\s/))) date = new Date(d0.getTime() + 864e5);   // "Mai" viết hoa giữa câu = tên (Mai Linh), không phải ngày mai
    else if (mark(/\s(ngay kia|ngay mot|mot)\s/)) date = new Date(d0.getTime() + 2 * 864e5);
    else if ((m = mark(/\s(\d{1,2})\s*(?:ngay|hom)\s*(?:nua|toi)\s/)) || (m = mark(/\s(?:sau|trong)\s*(\d{1,2})\s*ngay\s/))) date = new Date(d0.getTime() + (+m[1]) * 864e5);
    else if ((m = mark(/\s(?:vao\s+)?(?:(thu)\s*(hai|ba|tu|nam|sau|bay|[2-7])|(chu nhat|cn))(?:\s+(tuan sau|tuan toi))?\s/))) {
      var map = { hai: 1, ba: 2, tu: 3, nam: 4, sau: 5, bay: 6, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "7": 6 }, wd = m[3] ? 0 : map[m[2]];
      var add; if (m[4]) { add = ((8 - d0.getDay()) % 7 || 7) + (wd === 0 ? 6 : wd - 1); } else { add = (wd - d0.getDay() + 7) % 7; if (add === 0) add = 7; }
      date = new Date(d0.getTime() + add * 864e5); if (lap === "" && /\smoi\s+thu|\smoi\s+chu nhat/.test(s)) lap = "tuan";
    }
    else if (mark(/\s(tuan sau|tuan toi)\s/)) date = new Date(d0.getTime() + 7 * 864e5);
    else if ((m = mark(/\s(?:ngay\s+)?(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\s/))) {
      var yy = m[3] ? (+m[3] < 100 ? 2000 + (+m[3]) : +m[3]) : d0.getFullYear(); date = new Date(yy, +m[2] - 1, +m[1]);
      if (!m[3] && date < d0) date.setFullYear(yy + 1);
    } else if ((m = mark(/\sngay\s+(\d{1,2})(?:\s+thang\s+(\d{1,2}))?\s/))) {
      var mon = m[2] ? +m[2] - 1 : d0.getMonth(); date = new Date(d0.getFullYear(), mon, +m[1]);
      if (date < d0) { if (m[2]) date.setFullYear(d0.getFullYear() + 1); else date = new Date(d0.getFullYear(), d0.getMonth() + 1, +m[1]); }
    }
    if (!date && hh != null) { date = d0; if (hh < now.getHours() || (hh === now.getHours() && mi <= now.getMinutes())) date = new Date(d0.getTime() + 864e5); }
    if (!date && lap) date = d0;
    var uu = "tb"; if (mark(/\s(gap|khan|quan trong|uu tien)\s/)) uu = "cao";
    var loai = /\s(theo doi|hoi lai|bam|follow)\s/.test(s) ? "theo_doi" : "viec";
    // cắt các cụm thời gian / lệnh ra khỏi tên việc (dựa trên chữ không dấu → bỏ cùng số từ ở câu gốc)
    var words = orig.split(/\s+/), nw = nz(orig).split(/\s+/), drop = {};
    cut.concat(["nhac toi", "nhac anh", "nhac em", "nhac minh", "ghi nho", "nho", "theo doi", "viec", "lam viec"]).forEach(function (c, ci) {
      var cw = c.split(" "); for (var i = 0; i + cw.length <= nw.length; i++) {
        if (nw.slice(i, i + cw.length).join(" ") === c && (ci < cut.length || i === 0)) { for (var k = 0; k < cw.length; k++) drop[i + k] = 1; break; }
      }
    });
    var title = words.filter(function (w, i) { return !drop[i]; }).join(" ").replace(/^[:,\-–\s]+|[:,\-–\s]+$/g, "").replace(/\s+(luc|vao|ngay)$/i, "");
    if (!title) title = orig;
    title = title.charAt(0).toUpperCase() + title.slice(1);
    return { tieu_de: title, han: date ? ymd(date) + (hh != null ? " " + z(hh) + ":" + z(mi) : "") : "", lap: lap, uu_tien: uu, loai: loai };
  }
  window.mvParse = parse;

  /* ---------------- dữ liệu ---------------- */
  function load(goiY) {
    if (!connected()) return Promise.resolve();
    return api("mv.list", { goi_y: goiY !== false }).then(function (r) {
      M.viec = r.viec || []; M.xong = r.xong || []; M.ghi_chu = r.ghi_chu || []; if (goiY !== false) M.goi_y = r.goi_y || []; M.loaded = true;
      saveCache(); badge(); render();
    }).catch(function (err) {
      var b = el("mvBody"); if (b && !M.viec.length) b.innerHTML = '<div class="note err">' + esc(/không hợp lệ|mv\.list/i.test(err.message) ? "Backend chưa có MyVio.gs (cần triển khai bản mới)." : "Không tải được: " + err.message) + "</div>";
    });
  }
  function counts() {
    var od = 0, td = 0; M.viec.forEach(function (v) { if (!v.han) return; if (overdue(v)) od++; else if (dayDiff(v.han) === 0) td++; });
    return { od: od, td: td };
  }
  function badge() {
    var nd = el("nd_my_vio"); if (!nd) return; var c = counts(), n = c.od + c.td, b = nd.querySelector(".mvb");
    if (!n) { if (b) b.remove(); return; }
    if (!b) { b = document.createElement("span"); b.className = "mvb"; nd.appendChild(b); } b.textContent = n > 99 ? "99+" : n;
  }
  window.mvBadge = badge;
  function upsert(v) { var i = M.viec.findIndex(function (x) { return x.id === v.id; }); if (v.trang_thai !== "mo") { if (i >= 0) M.viec.splice(i, 1); } else if (i >= 0) M.viec[i] = v; else M.viec.push(v); saveCache(); badge(); }
  function addViec(v, quiet) {
    return api("mv.save", { viec: v }).then(function (r) {
      upsert(r.viec); if (v.nguon) M.goi_y = M.goi_y.filter(function (g) { return g.key !== v.nguon; });
      if (!quiet) toast(r.viec.trang_thai === "huy" ? "Đã bỏ qua" : "Đã lưu việc"); render(); return r.viec;
    }).catch(function (err) { toast("Lỗi: " + err.message); throw err; });
  }
  window.mvAdd = function (text) { var p = parse(text); return addViec(p, true).then(function (v) { return { viec: v, p: p }; }); };
  window.mvNote = function (text, khach) { return api("mv.note_save", { ghi_chu: { noi_dung: text, khach: khach || "" } }).then(function (r) { M.ghi_chu.unshift(r.ghi_chu); saveCache(); return r.ghi_chu; }); };
  window.mvData = function () { return M; };

  /* ---------------- giao diện ---------------- */
  window.openMyVio = function (tab) {
    if (tab) M.tab = tab;
    var h = '<div class="sh-h"><span class="ic">' + svg("vio") + '</span><div><b>My ViO</b><div class="sub">Trợ lý cá nhân · việc, nhắc việc, theo dõi, ghi chú</div></div></div>' +
      '<form class="mvadd" id="mvForm" autocomplete="off"><input id="mvIn" placeholder="Thêm việc: gọi Hải Vân 9h thứ 6…">' +
      '<button type="button" class="btn-mic" id="mvMic">' + svg("mic") + '</button><button type="submit" class="btn-go">' + svg("send") + "</button></form>" +
      '<div class="mvpre" id="mvPre"></div><div class="mvtabs" id="mvTabs"></div><div id="mvBody"></div>';
    openSheet(h);
    el("mvIn").oninput = preview;
    el("mvForm").onsubmit = function (e) { e.preventDefault(); submitQuick(); };
    wireMic();
    render(); load(true);
  };
  function preview() {
    var v = el("mvIn").value.trim(), p = el("mvPre"); if (!p) return;
    if (!v) { p.innerHTML = ""; return; }
    if (M.tab === "ghi_chu") { p.innerHTML = "Lưu thành <b>ghi chú</b>"; return; }
    var r = parse(v);
    p.innerHTML = (r.loai === "theo_doi" ? "Theo dõi" : "Việc") + ": <b>" + esc(r.tieu_de) + "</b>" + (r.han ? " · hạn <b>" + esc(hanLabel(r.han)) + "</b>" : " · không hạn") +
      (r.lap ? " · lặp <b>" + { ngay: "hằng ngày", tuan: "hằng tuần", thang: "hằng tháng" }[r.lap] + "</b>" : "") + (r.uu_tien === "cao" ? " · <b style=\"color:#B23A34\">gấp</b>" : "");
  }
  function submitQuick() {
    var v = el("mvIn").value.trim(); if (!v || M.busy) return;
    if (!connected()) { toast("Cần kết nối backend (Cài đặt)"); return; }
    M.busy = true;
    var done = function () { M.busy = false; el("mvIn").value = ""; preview(); };
    if (M.tab === "ghi_chu") { window.mvNote(v).then(function () { done(); toast("Đã lưu ghi chú"); render(); }).catch(function (e) { M.busy = false; toast("Lỗi: " + e.message); }); return; }
    var p = parse(v); if (M.tab === "theo_doi") p.loai = "theo_doi";
    addViec(p).then(done, function () { M.busy = false; });
  }
  function tabsHtml() {
    var c = counts(), td = M.viec.filter(function (v) { return v.loai === "theo_doi"; }).length;
    return [["hom_nay", "Hôm nay", c.od + c.td], ["viec", "Việc", M.viec.filter(function (v) { return v.loai !== "theo_doi"; }).length], ["theo_doi", "Theo dõi", td], ["ghi_chu", "Ghi chú", M.ghi_chu.length]]
      .map(function (t) { return '<button type="button" data-mt="' + t[0] + '" class="' + (M.tab === t[0] ? "on" : "") + '">' + t[1] + (t[2] ? "<b>" + t[2] + "</b>" : "") + "</button>"; }).join("");
  }
  function itemHtml(v) {
    var od = overdue(v) && v.han, dd = dayDiff(v.han), sub = [];
    if (v.han) sub.push('<span class="' + (od ? "red" : dd === 0 ? "amb" : "") + '">' + (od ? "Quá hạn · " : "") + esc(hanLabel(v.han)) + "</span>");
    if (v.lap) sub.push("↻ " + { ngay: "hằng ngày", tuan: "hằng tuần", thang: "hằng tháng" }[v.lap]);
    if (v.khach) sub.push(esc(v.khach));
    if (v.nhom && v.nhom !== "VNPT") sub.push(esc(v.nhom));
    return '<div class="mvi ' + (v.uu_tien === "cao" ? "cao" : "") + '" data-id="' + esc(v.id) + '"><button type="button" class="mvck" data-ck="' + esc(v.id) + '" aria-label="Xong"></button>' +
      '<div class="mvt" data-ed="' + esc(v.id) + '"><b>' + (v.uu_tien === "cao" ? "❗ " : "") + esc(v.tieu_de) + "</b>" + (sub.length ? "<small>" + sub.join(" · ") + "</small>" : "") + (v.ghi_chu ? "<small>" + esc(v.ghi_chu).slice(0, 120) + "</small>" : "") + "</div></div>";
  }
  function sortV(a, b) { var x = hanDate(a.han), y = hanDate(b.han); if (x && y) return x - y; if (x) return -1; if (y) return 1; return (a.uu_tien === "cao" ? 0 : 1) - (b.uu_tien === "cao" ? 0 : 1); }
  function groupHtml(list) {
    list = list.slice().sort(sortV);
    var g = { qh: [], hn: [], st: [], kh: [] };
    list.forEach(function (v) { if (!v.han) g.kh.push(v); else if (overdue(v)) g.qh.push(v); else if (dayDiff(v.han) <= 0) g.hn.push(v); else g.st.push(v); });
    var h = "";
    if (g.qh.length) h += '<div class="mvh red">Quá hạn<span>' + g.qh.length + "</span></div>" + g.qh.map(itemHtml).join("");
    if (g.hn.length) h += '<div class="mvh">Hôm nay<span>' + g.hn.length + "</span></div>" + g.hn.map(itemHtml).join("");
    if (g.st.length) h += '<div class="mvh">Sắp tới<span>' + g.st.length + "</span></div>" + g.st.map(itemHtml).join("");
    if (g.kh.length) h += '<div class="mvh">Không hạn<span>' + g.kh.length + "</span></div>" + g.kh.map(itemHtml).join("");
    return h || '<div class="mvempty">Chưa có việc nào. Gõ ô phía trên, ví dụ “nộp báo cáo ngày 25 gấp”.</div>';
  }
  function render() {
    var body = el("mvBody"), tabs = el("mvTabs"); if (!body || !tabs) return;
    tabs.innerHTML = tabsHtml();
    tabs.onclick = function (e) { var b = e.target.closest("[data-mt]"); if (!b) return; M.tab = b.getAttribute("data-mt"); el("mvIn").placeholder = { hom_nay: "Thêm việc: gọi Hải Vân 9h thứ 6…", viec: "Thêm việc: nộp báo cáo ngày 25 gấp…", theo_doi: "Theo dõi: báo giá Cty X, hỏi lại 3 ngày nữa…", ghi_chu: "Ghi chú nhanh…" }[M.tab]; preview(); render(); };
    var h = "";
    if (M.tab === "hom_nay") {
      var c = counts(), wk = M.viec.filter(function (v) { var d = dayDiff(v.han); return d != null && d > 0 && d <= 7; }).length;
      h += '<div class="mvsum"><div class="' + (c.od ? "red" : "") + '"><b>' + c.od + "</b><small>Quá hạn</small></div><div><b>" + c.td + "</b><small>Hôm nay</small></div><div><b>" + wk + "</b><small>7 ngày tới</small></div></div>";
      var hn = M.viec.filter(function (v) { var d = dayDiff(v.han); return d != null && d <= 0; });
      h += hn.length ? groupHtml(hn) : '<div class="mvempty">Hôm nay chưa có việc đến hạn. 👍</div>';
      var st = M.viec.filter(function (v) { var d = dayDiff(v.han); return d != null && d > 0 && d <= 7; }).sort(sortV);
      if (st.length) h += '<div class="mvh">7 ngày tới<span>' + st.length + "</span></div>" + st.slice(0, 8).map(itemHtml).join("");
      if (M.goi_y.length) h += '<div class="mvh">Gợi ý từ dữ liệu<span>' + M.goi_y.length + "</span></div>" + M.goi_y.map(function (g, i) {
        return '<div class="mvi"><div class="mvt"><b>' + esc(g.tieu_de) + "</b><small>" + (g.han ? esc(hanLabel(g.han)) + " · " : "") + esc(g.ghi_chu || "") + '</small></div><div class="mvg"><button type="button" class="pri" data-gy="' + i + '">+ Việc</button><button type="button" data-gn="' + i + '">Bỏ</button></div></div>';
      }).join("");
      else if (!M.loaded) h += '<div class="mvempty">Đang tải…</div>';
    } else if (M.tab === "viec" || M.tab === "theo_doi") {
      var list = M.viec.filter(function (v) { return M.tab === "theo_doi" ? v.loai === "theo_doi" : v.loai !== "theo_doi"; });
      if (M.tab === "theo_doi") h += '<div class="mvempty" style="padding:6px 2px">Theo dõi = việc đang chờ người khác (báo giá đã gửi, hợp đồng chờ ký, hồ sơ chờ bổ sung). Đến hạn là lúc hỏi lại khách.</div>';
      h += groupHtml(list);
      if (M.xong.length && M.tab === "viec") h += '<div class="mvh">Đã xong gần đây<span>' + M.xong.length + "</span></div>" + M.xong.slice(0, 10).map(function (v) {
        return '<div class="mvi done"><button type="button" class="mvck on" data-un="' + esc(v.id) + '">✓</button><div class="mvt"><b>' + esc(v.tieu_de) + "</b><small>Xong " + esc(v.xong_luc) + "</small></div></div>"; }).join("");
    } else {
      h += '<input class="mvsearch" id="mvQ" placeholder="Tìm ghi chú (không cần dấu)…" value="' + esc(M.q) + '">';
      var q = nz(M.q).trim(), ns = M.ghi_chu.filter(function (n) { return !q || nz(n.noi_dung + " " + n.khach + " " + n.the).indexOf(q) >= 0; })
        .sort(function (a, b) { return (b.ghim ? 1 : 0) - (a.ghim ? 1 : 0); });
      h += ns.length ? ns.map(function (n) {
        return '<div class="mvnote ' + (n.ghim ? "pin" : "") + '"><p>' + esc(n.noi_dung) + "</p><small>" + (n.khach ? esc(n.khach) + " · " : "") + esc(n.sua_luc || n.tao_luc) + "</small>" +
          '<div class="mvg"><button type="button" data-nv="' + esc(n.id) + '">→ Thành việc</button><button type="button" data-np="' + esc(n.id) + '">' + (n.ghim ? "Bỏ ghim" : "📌 Ghim") + '</button><button type="button" data-nd="' + esc(n.id) + '">Xóa</button></div></div>';
      }).join("") : '<div class="mvempty">' + (q ? "Không thấy ghi chú phù hợp." : "Chưa có ghi chú. Gõ ô phía trên để ghi nhanh.") + "</div>";
    }
    body.innerHTML = h;
    var mq = el("mvQ"); if (mq) mq.oninput = function () { M.q = mq.value; var pos = mq.selectionStart; render(); var m2 = el("mvQ"); if (m2) { m2.focus(); try { m2.setSelectionRange(pos, pos); } catch (e) {} } };
    body.onclick = onBody;
  }
  function find(id) { return M.viec.filter(function (v) { return v.id === id; })[0] || M.xong.filter(function (v) { return v.id === id; })[0]; }
  function onBody(e) {
    var t = e.target.closest("button,[data-ed]"); if (!t) return;
    var a = t.dataset;
    if (a.ck) {   // đánh dấu xong (lạc quan, lỗi thì hoàn lại)
      var v = find(a.ck); if (!v) return; t.classList.add("on"); t.textContent = "✓";
      setTimeout(function () { M.viec = M.viec.filter(function (x) { return x.id !== v.id; }); v.trang_thai = "xong"; v.xong_luc = "vừa xong"; M.xong.unshift(v); saveCache(); badge(); render(); }, 250);
      api("mv.done", { id: v.id, xong: true }).then(function (r) { if (r.tiep) { upsert(r.tiep); render(); toast("Xong · đã tạo lần tiếp: " + hanLabel(r.tiep.han)); } else toast("Đã xong"); })
        .catch(function (err) { toast("Lỗi: " + err.message); load(false); });
    } else if (a.un) {
      var u = find(a.un); if (!u) return; M.xong = M.xong.filter(function (x) { return x.id !== u.id; }); u.trang_thai = "mo"; M.viec.push(u); saveCache(); badge(); render();
      api("mv.done", { id: u.id, xong: false }).catch(function (err) { toast("Lỗi: " + err.message); load(false); });
    } else if (a.ed) editForm(find(a.ed));
    else if (a.gy) { var g = M.goi_y[+a.gy]; addViec({ tieu_de: g.tieu_de, khach: g.khach, mst: g.mst, han: g.han, uu_tien: g.uu_tien, nhom: g.nhom, ghi_chu: g.ghi_chu, nguon: g.key }); }
    else if (a.gn) { var g2 = M.goi_y[+a.gn]; addViec({ tieu_de: g2.tieu_de, nguon: g2.key, trang_thai: "huy" }); }
    else if (a.nv) { var n = M.ghi_chu.filter(function (x) { return x.id === a.nv; })[0]; if (n) { var p = parse(n.noi_dung.split("\n")[0].slice(0, 150)); p.khach = n.khach; p.ghi_chu = n.noi_dung.slice(0, 900); editForm(p, true); } }
    else if (a.np) { var n2 = M.ghi_chu.filter(function (x) { return x.id === a.np; })[0]; if (!n2) return; n2.ghim = n2.ghim ? "" : "1"; render(); api("mv.note_save", { ghi_chu: n2 }).then(function () { saveCache(); }).catch(function (err) { toast("Lỗi: " + err.message); }); }
    else if (a.nd) {
      if (!confirm("Xóa ghi chú này? Không lấy lại được.")) return;
      api("mv.note_del", { id: a.nd }).then(function () { M.ghi_chu = M.ghi_chu.filter(function (x) { return x.id !== a.nd; }); saveCache(); render(); toast("Đã xóa ghi chú"); }).catch(function (err) { toast("Lỗi: " + err.message); });
    }
  }

  /* Form sửa/thêm việc đầy đủ */
  function editForm(v, isNew) {
    if (!v) return; v = Object.assign({ loai: "viec", uu_tien: "tb", nhom: "VNPT", lap: "" }, v);
    var d = (v.han || "").split(" ");
    function sel(name, opts, val) { return '<select name="' + name + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === (val || "") ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>"; }
    var h = '<div class="sh-h"><span class="ic">' + svg("vio") + '</span><div><b>' + (isNew || !v.id ? "Thêm việc" : "Sửa việc") + '</b></div></div><form id="mvEd" autocomplete="off">' +
      '<div class="fld"><label>Việc <i>*</i></label><input name="tieu_de" value="' + esc(v.tieu_de) + '"></div>' +
      '<div class="fld"><label>Loại</label>' + sel("loai", [["viec", "Việc cần làm"], ["theo_doi", "Theo dõi (chờ người khác)"]], v.loai) + "</div>" +
      '<div class="fld"><label>Ngày hạn</label><input name="ngay" type="date" value="' + esc(d[0] || "") + '"></div>' +
      '<div class="fld"><label>Giờ</label><input name="gio" type="time" value="' + esc(d[1] || "") + '"></div>' +
      '<div class="fld"><label>Lặp lại</label>' + sel("lap", [["", "Không"], ["ngay", "Hằng ngày"], ["tuan", "Hằng tuần"], ["thang", "Hằng tháng"]], v.lap) + "</div>" +
      '<div class="fld"><label>Ưu tiên</label>' + sel("uu_tien", [["cao", "Gấp / quan trọng"], ["tb", "Bình thường"], ["thap", "Thấp"]], v.uu_tien) + "</div>" +
      '<div class="fld"><label>Nhóm</label>' + sel("nhom", [["VNPT", "VNPT"], ["Truong", "Trường học"], ["CaNhan", "Cá nhân"]], v.nhom) + "</div>" +
      '<div class="fld"><label>Khách hàng</label><input name="khach" value="' + esc(v.khach || "") + '"></div>' +
      '<div class="fld"><label>MST</label><input name="mst" inputmode="numeric" value="' + esc(v.mst || "") + '"></div>' +
      '<div class="fld"><label>Ghi chú</label><textarea name="ghi_chu" rows="3" style="width:100%;border:1px solid var(--line);border-radius:10px;padding:9px;font:inherit">' + esc(v.ghi_chu || "") + "</textarea></div>" +
      '<button class="btn" type="submit">Lưu</button>' + (v.id && !isNew ? '<button class="btn sec" type="button" id="mvDel" style="margin-top:8px">Bỏ việc này</button>' : "") + "</form>";
    openSheet(h);
    el("mvEd").onsubmit = function (e) {
      e.preventDefault(); var f = e.target, o = {};
      ["tieu_de", "loai", "lap", "uu_tien", "nhom", "khach", "mst", "ghi_chu"].forEach(function (k) { o[k] = f.elements[k].value.trim(); });
      if (!o.tieu_de) { toast("Nhập tên việc"); return; }
      o.han = f.elements.ngay.value ? f.elements.ngay.value + (f.elements.gio.value ? " " + f.elements.gio.value : "") : "";
      if (o.lap && !o.han) { toast("Việc lặp lại cần có ngày hạn"); return; }
      if (v.id && !isNew) { o.id = v.id; o.trang_thai = "mo"; }
      if (v.nguon) o.nguon = v.nguon;
      addViec(o).then(function () { openMyVio(o.loai === "theo_doi" ? "theo_doi" : M.tab === "ghi_chu" ? "viec" : M.tab); });
    };
    var del = el("mvDel"); if (del) del.onclick = function () {
      if (!confirm("Bỏ việc “" + v.tieu_de + "”?")) return;
      var o = Object.assign({}, v, { trang_thai: "huy" }); addViec(o).then(function () { openMyVio(); });
    };
  }

  function wireMic() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, b = el("mvMic"); if (!b) return;
    if (!SR) { b.style.display = "none"; return; }
    var rec = null;
    b.onclick = function () {
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = "vi-VN"; rec.interimResults = false; b.classList.add("rec");
      rec.onresult = function (ev) { el("mvIn").value = ev.results[0][0].transcript; preview(); };
      rec.onend = function () { b.classList.remove("rec"); rec = null; };
      rec.onerror = function () { b.classList.remove("rec"); rec = null; toast("Không nghe được, thử lại"); };
      try { rec.start(); } catch (e) { b.classList.remove("rec"); rec = null; }
    };
  }

  /* Khởi động: số đỏ trên nút My ViO + nhắc 1 lần mỗi ngày khi mở app (chỉ trong app, theo lựa chọn của anh) */
  setTimeout(function () {
    badge();
    if (!connected()) return;
    api("mv.list", { goi_y: false }).then(function (r) {
      M.viec = r.viec || []; M.xong = r.xong || []; M.ghi_chu = r.ghi_chu || []; saveCache(); badge();
      var c = counts(), key = "mv_toast_" + ymd(new Date()), shown = null; try { shown = lsGet(key); } catch (e) {}
      if ((c.od || c.td) && !shown) { toast("My ViO: " + (c.td ? c.td + " việc hôm nay" : "") + (c.td && c.od ? " · " : "") + (c.od ? c.od + " quá hạn" : "")); try { lsSet(key, "1"); } catch (e) {} }
    }).catch(function () {});
  }, 1500);
})();

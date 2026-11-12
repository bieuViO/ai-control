/* MY ViO – TRỢ LÝ CÁ NHÂN (myvio.js, aic-v73, 13/11/2026)
   Việc cần làm + nhắc việc (trong app), Theo dõi bám đuổi, Ghi chú nhanh, Việc tự sinh từ dữ liệu (khách sắp hết hạn, khách còn nợ).
   Backend: MyVio.gs (mv.list, mv.save, mv.done, mv.note_save, mv.note_del) – lưu tab MYVIO_VIEC, MYVIO_GHICHU trong Sheet AI_CONTROL.
   Thêm nhanh bằng câu thường: "gọi Hải Vân 9h thứ 6", "nộp báo cáo ngày 25 gấp", "nhắc nợ hằng tháng ngày 5", "theo dõi báo giá Cty X 3 ngày nữa". */
"use strict";
(function () {
  var stl = document.createElement("style");
  stl.textContent =
    ".mvtabs{display:flex;gap:6px;margin:10px 0 6px;overflow-x:auto;scrollbar-width:none}.mvtabs::-webkit-scrollbar{display:none}" +
    ".mvtabs button{flex:0 0 auto;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 13px;font:inherit;font-size:13px;font-weight:600;color:var(--blue);cursor:pointer}" +
    ".mvtabs button{color:var(--c,var(--blue));border-color:var(--c,var(--line))}.mvtabs button.on{background:var(--c,var(--blue));color:#fff;border-color:var(--c,var(--blue))}.mvtabs b{font-weight:700;margin-left:4px;color:inherit}" +
    ".mvtabs button[data-mt=chi_tieu]{--c:#1E7B4F}.mvtot{font-size:26px;font-weight:800;color:#1E7B4F;margin:6px 0 2px}" +
    ".mvmon{display:flex;align-items:center;justify-content:space-between;margin-top:6px}.mvmon button{border:1px solid var(--line);background:#fff;border-radius:10px;padding:6px 14px;font:inherit;font-weight:700;color:#1E7B4F;cursor:pointer}.mvmon button:disabled{opacity:.35}" +
    ".mvbar{height:6px;border-radius:99px;background:#E1EDE6;margin-top:4px;overflow:hidden}.mvbar i{display:block;height:100%;background:#1E7B4F}" +
    ".mvct{display:flex;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:#fff;margin-top:6px;cursor:pointer}.mvct b{font-size:14px;font-weight:600;color:#12263F}.mvct small{display:block;font-size:12px;color:var(--mute)}.mvct span{font-weight:700;color:#12263F;white-space:nowrap}" +
    ".mvtabs button[data-mt=hom_nay]{--c:#0B3D91}.mvtabs button[data-mt=viec]{--c:#C25E00}.mvtabs button[data-mt=theo_doi]{--c:#6A3FA0}.mvtabs button[data-mt=ghi_chu]{--c:#4B5B6B}" +
    ".mvq{display:flex;gap:6px;margin-top:6px}.mvq button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:4px 11px;font:inherit;font-size:12px;font-weight:600;color:var(--blue);cursor:pointer}" +
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

  var M = { viec: [], xong: [], ghi_chu: [], goi_y: [], tab: "hom_nay", q: "", nhom: "", loaded: false, busy: false, kh: {}, ct: [], ctm: 0, ctLoaded: false, ctBusy: false, ctErr: "" };
  try { var c = JSON.parse(lsGet("mv_cache") || "null"); if (c && c.viec) { M.viec = c.viec; M.xong = c.xong || []; M.ghi_chu = c.ghi_chu || []; M.ct = c.ct || []; } } catch (e) {}
  function saveCache() { try { lsSet("mv_cache", JSON.stringify({ viec: M.viec, xong: M.xong.slice(0, 30), ghi_chu: M.ghi_chu.slice(0, 200), ct: M.ct.slice(0, 300) })); } catch (e) {} }

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
    if (window.mvVoRefresh) window.mvVoRefresh();
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
    if (M.tab === "chi_tieu") { var c = parseCt(v); p.innerHTML = c.so_tien ? "Chi <b>" + vnd(c.so_tien) + "</b> · " + esc(ctNhomName(c.nhom)) + " · " + esc(hanLabel(c.ngay)) + " · " + esc(c.noi_dung) : "Chưa thấy số tiền, ví dụ: ăn trưa 45k"; return; }
    var r = parse(v);
    p.innerHTML = (r.loai === "theo_doi" ? "Theo dõi" : "Việc") + ": <b>" + esc(r.tieu_de) + "</b>" + (r.han ? " · hạn <b>" + esc(hanLabel(r.han)) + "</b>" : " · không hạn") +
      (r.lap ? " · lặp <b>" + { ngay: "hằng ngày", tuan: "hằng tuần", thang: "hằng tháng" }[r.lap] + "</b>" : "") + (r.uu_tien === "cao" ? " · <b style=\"color:#B23A34\">gấp</b>" : "");
  }
  function submitQuick() {
    var v = el("mvIn").value.trim(); if (!v || M.busy) return;
    if (!connected()) { toast("Cần kết nối backend (Cài đặt)"); return; }
    M.busy = true;
    var done = function () { M.busy = false; el("mvIn").value = ""; preview(); };
    if (M.tab === "chi_tieu") {
      var c = parseCt(v); if (!c.so_tien) { M.busy = false; toast("Chưa thấy số tiền. Ví dụ: ăn trưa 45k"); return; }
      api("mv.ct_save", { ct: c }).then(function (r) { M.ct.unshift(r.ct); saveCache(); done(); toast("Đã ghi chi " + vnd(c.so_tien)); render(); }).catch(function (e) { M.busy = false; toast("Lỗi: " + e.message); }); return;
    }
    if (M.tab === "ghi_chu") { window.mvNote(v).then(function () { done(); toast("Đã lưu ghi chú"); render(); }).catch(function (e) { M.busy = false; toast("Lỗi: " + e.message); }); return; }
    var p = parse(v); if (M.tab === "theo_doi") p.loai = "theo_doi";
    addViec(p).then(done, function () { M.busy = false; });
  }
  function tabsHtml() {
    var c = counts(), td = M.viec.filter(function (v) { return v.loai === "theo_doi"; }).length;
    return [["hom_nay", "Hôm nay", c.od + c.td], ["viec", "Việc", M.viec.filter(function (v) { return v.loai !== "theo_doi"; }).length], ["theo_doi", "Theo dõi", td], ["ghi_chu", "Ghi chú", M.ghi_chu.length], ["chi_tieu", "Chi tiêu", 0]]
      .map(function (t) { return '<button type="button" data-mt="' + t[0] + '" class="' + (M.tab === t[0] ? "on" : "") + '">' + t[1] + (t[2] ? "<b>" + t[2] + "</b>" : "") + "</button>"; }).join("");
  }
  function itemHtml(v) {
    var od = overdue(v) && v.han, dd = dayDiff(v.han), sub = [];
    if (v.han) sub.push('<span class="' + (od ? "red" : dd === 0 ? "amb" : "") + '">' + (od ? "Quá hạn · " : "") + esc(hanLabel(v.han)) + "</span>");
    if (v.lap) sub.push("↻ " + { ngay: "hằng ngày", tuan: "hằng tuần", thang: "hằng tháng" }[v.lap]);
    if (v.khach) sub.push(esc(v.khach));
    if (v.nhom && v.nhom !== "VNPT") sub.push(esc(v.nhom));
    return '<div class="mvi ' + (v.uu_tien === "cao" ? "cao" : "") + '" data-id="' + esc(v.id) + '"><button type="button" class="mvck" data-ck="' + esc(v.id) + '" aria-label="Xong"></button>' +
      '<div class="mvt" data-ed="' + esc(v.id) + '"><b>' + (v.uu_tien === "cao" ? "❗ " : "") + esc(v.tieu_de) + "</b>" + (sub.length ? "<small>" + sub.join(" · ") + "</small>" : "") + (v.ghi_chu ? "<small>" + esc(v.ghi_chu).slice(0, 120) + "</small>" : "") +
      ((v.khach || v.mst) ? '<div class="mvq"><button type="button" data-zl="' + esc(v.id) + '">💬 Zalo</button><button type="button" data-bg="' + esc(v.id) + '">Báo giá</button></div>' : "") + "</div></div>";
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
    tabs.onclick = function (e) { var b = e.target.closest("[data-mt]"); if (!b) return; M.tab = b.getAttribute("data-mt"); el("mvIn").placeholder = { hom_nay: "Thêm việc: gọi Hải Vân 9h thứ 6…", viec: "Thêm việc: nộp báo cáo ngày 25 gấp…", theo_doi: "Theo dõi: báo giá Cty X, hỏi lại 3 ngày nữa…", ghi_chu: "Ghi chú nhanh…", chi_tieu: "Chi tiêu: ăn trưa 45k, đổ xăng 200k hôm qua…" }[M.tab]; preview(); render(); };
    var h = "";
    if (M.tab === "hom_nay") {
      var c = counts(), wk = M.viec.filter(function (v) { var d = dayDiff(v.han); return d != null && d > 0 && d <= 7; }).length;
      h += '<div class="mvsum"><div class="' + (c.od ? "red" : "") + '"><b>' + c.od + "</b><small>Quá hạn</small></div><div><b>" + c.td + "</b><small>Hôm nay</small></div><div><b>" + wk + "</b><small>7 ngày tới</small></div></div>";
      h += '<div class="mvvoice"><button type="button" data-vo="1">' + (VO.on ? "🔔 Nhắc việc: BẬT" : "🔕 Nhắc việc: TẮT") + '</button><button type="button" data-vi="1">Lặp mỗi ' + VO.min + ' phút</button><button type="button" data-vh="1" class="' + (voMeeting() ? "sel" : "") + '">🤫 ' + (voMeeting() ? "Đang họp (còn " + Math.ceil((VO.meet - Date.now()) / 60000) + "')" : "Họp 60 phút") + '</button><button type="button" data-vk="1" class="' + (VO.knock ? "sel" : "") + '">🚪 Gõ cửa 3 lần: ' + (VO.knock ? "BẬT" : "TẮT") + '</button><div class="vm">' + VO_MODES.map(function (m) { return '<button type="button" data-vm="' + m[0] + '" class="' + (VO.mode === m[0] ? "sel" : "") + '">' + m[1] + "</button>"; }).join("") + '</div><small>Bấm 1 kiểu để thử ngay. Kiểu 🔊 có gõ cửa 3 lần trước: bấm nút nguồn ngay = đang bận → báo lại sau; không bấm → đọc việc. Họp/chỗ đông người: chọn 📳 Rung hoặc 🔕 Im lặng, hoặc bấm 🤫 Họp 60 phút (tự trở lại sau 1 giờ). Nhắc lặp tới khi bấm xong hoặc Hoãn 30 phút · yên lặng 22h–6h · chỉ khi app đang mở · iPhone không hỗ trợ rung</small></div>';
      var hn = M.viec.filter(function (v) { var d = dayDiff(v.han); return d != null && d <= 0; });
      h += hn.length ? groupHtml(hn) : '<div class="mvempty">Hôm nay chưa có việc đến hạn. 👍</div>';
      var st = M.viec.filter(function (v) { var d = dayDiff(v.han); return d != null && d > 0 && d <= 7; }).sort(sortV);
      if (st.length) h += '<div class="mvh">7 ngày tới<span>' + st.length + "</span></div>" + st.slice(0, 8).map(itemHtml).join("");
      if (M.goi_y.length) h += '<div class="mvh">Gợi ý từ dữ liệu<span>' + M.goi_y.length + "</span></div>" + M.goi_y.map(function (g, i) {
        var tel = sdtOf(g);
        return '<div class="mvi"><div class="mvt" data-gv="' + i + '"><b>' + esc(g.tieu_de) + "</b><small>" + (g.han ? esc(hanLabel(g.han)) + " · " : "") + esc(g.ghi_chu || "") + '</small>' +
          '<div class="mvq">' + (tel ? '<button type="button" data-gt="' + i + '">📞 Gọi</button>' : "") + '<button type="button" data-gz="' + i + '">💬 Zalo</button><button type="button" data-gb="' + i + '">Báo giá</button></div></div><div class="mvg"><button type="button" class="pri" data-gy="' + i + '">+ Việc</button><button type="button" data-gn="' + i + '">Bỏ</button></div></div>';
      }).join("");
      else if (!M.loaded) h += '<div class="mvempty">Đang tải…</div>';
    } else if (M.tab === "viec" || M.tab === "theo_doi") {
      var list = M.viec.filter(function (v) { return M.tab === "theo_doi" ? v.loai === "theo_doi" : v.loai !== "theo_doi"; });
      if (M.tab === "theo_doi") h += '<div class="mvempty" style="padding:6px 2px">Theo dõi = việc đang chờ người khác (báo giá đã gửi, hợp đồng chờ ký, hồ sơ chờ bổ sung). Đến hạn là lúc hỏi lại khách.</div>';
      h += groupHtml(list);
      if (M.xong.length && M.tab === "viec") h += '<div class="mvh">Đã xong gần đây<span>' + M.xong.length + "</span></div>" + M.xong.slice(0, 10).map(function (v) {
        return '<div class="mvi done"><button type="button" class="mvck on" data-un="' + esc(v.id) + '">✓</button><div class="mvt"><b>' + esc(v.tieu_de) + "</b><small>Xong " + esc(v.xong_luc) + "</small></div></div>"; }).join("");
    } else if (M.tab === "chi_tieu") {
      h += ctHtml();
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
    var t = e.target.closest("button,[data-ed],[data-cte],[data-gv]"); if (!t) return;
    var a = t.dataset;
    if (a.vo != null || a.vi != null || a.vm != null || a.vh != null || a.vk != null) { voClick(a); return; }   // nút giọng nói
    if (a.ck) {   // đánh dấu xong (lạc quan, lỗi thì hoàn lại)
      var v = find(a.ck); if (!v) return; t.classList.add("on"); t.textContent = "✓";
      setTimeout(function () { M.viec = M.viec.filter(function (x) { return x.id !== v.id; }); v.trang_thai = "xong"; v.xong_luc = "vừa xong"; M.xong.unshift(v); saveCache(); badge(); render(); }, 250);
      api("mv.done", { id: v.id, xong: true }).then(function (r) { if (r.tiep) { upsert(r.tiep); render(); toast("Xong · đã tạo lần tiếp: " + hanLabel(r.tiep.han)); } else toast("Đã xong"); })
        .catch(function (err) { toast("Lỗi: " + err.message); load(false); });
    } else if (a.un) {
      var u = find(a.un); if (!u) return; M.xong = M.xong.filter(function (x) { return x.id !== u.id; }); u.trang_thai = "mo"; M.viec.push(u); saveCache(); badge(); render();
      api("mv.done", { id: u.id, xong: false }).catch(function (err) { toast("Lỗi: " + err.message); load(false); });
    } else if (a.gv != null || a.gt != null || a.gz != null || a.gb != null) {
      var gi = M.goi_y[+(a.gv != null ? a.gv : a.gt != null ? a.gt : a.gz != null ? a.gz : a.gb)]; if (!gi) return;
      if (a.gv != null) editForm({ tieu_de: gi.tieu_de, khach: gi.khach, mst: gi.mst, han: gi.han, uu_tien: gi.uu_tien, nhom: gi.nhom, ghi_chu: gi.ghi_chu, nguon: gi.key }, true);   // bấm vào dòng gợi ý: mở form điền sẵn
      else suggestAct(a.gt != null ? "tel" : a.gz != null ? "zalo" : "bg", gi);
    } else if (a.ctm) { M.ctm = Math.min(0, M.ctm + (+a.ctm)); render(); } else if (a.cte) { ctForm(M.ct.filter(function (x) { return x.id === a.cte; })[0]); } else if (a.zl || a.bg) khachAct(a.zl ? "zalo" : "bg", find(a.zl || a.bg));
    else if (a.ed) editForm(find(a.ed));
    else if (a.gy) { var g = M.goi_y[+a.gy]; addViec({ tieu_de: g.tieu_de, khach: g.khach, mst: g.mst, han: g.han, uu_tien: g.uu_tien, nhom: g.nhom, ghi_chu: g.ghi_chu, nguon: g.key }, true).then(function () { toast("Đã thêm vào tab Việc"); }); }
    else if (a.gn) { var g2 = M.goi_y[+a.gn]; addViec({ tieu_de: g2.tieu_de, nguon: g2.key, trang_thai: "huy" }); }
    else if (a.nv) { var n = M.ghi_chu.filter(function (x) { return x.id === a.nv; })[0]; if (n) { var p = parse(n.noi_dung.split("\n")[0].slice(0, 150)); p.khach = n.khach; p.ghi_chu = n.noi_dung.slice(0, 900); editForm(p, true); } }
    else if (a.np) { var n2 = M.ghi_chu.filter(function (x) { return x.id === a.np; })[0]; if (!n2) return; n2.ghim = n2.ghim ? "" : "1"; render(); api("mv.note_save", { ghi_chu: n2 }).then(function () { saveCache(); }).catch(function (err) { toast("Lỗi: " + err.message); }); }
    else if (a.nd) {
      if (!confirm("Xóa ghi chú này? Không lấy lại được.")) return;
      api("mv.note_del", { id: a.nd }).then(function () { M.ghi_chu = M.ghi_chu.filter(function (x) { return x.id !== a.nd; }); saveCache(); render(); toast("Đã xóa ghi chú"); }).catch(function (err) { toast("Lỗi: " + err.message); });
    }
  }


  /* Gợi ý từ dữ liệu: SĐT nằm sẵn trong ghi chú ("SĐT 0908885921. Còn 2 ngày") nên Gọi/Zalo chạy ngay, không cần backend mới */
  function sdtOf(g) { var m = /S[ĐD]T\s*([\d .]{9,16})/i.exec(g.ghi_chu || ""); var d = m ? m[1].replace(/\D/g, "") : ""; return d.length >= 9 ? d : ""; }
  function openLink(url) { var a = document.createElement("a"); a.href = url; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); }
  function suggestAct(kind, g) {
    var tel = sdtOf(g);
    if (kind === "tel") { if (tel) openLink("tel:" + tel); else toast("Gợi ý này chưa có SĐT"); return; }
    if (kind === "zalo" && tel) { openLink("https://zalo.me/" + tel); return; }
    if (kind === "bg" && g.mst && typeof openTool === "function" && typeof toolById === "function") { openTool(toolById("bao_gia"), { mst: String(g.mst).replace(/\D/g, ""), ten: g.khach || "" }); return; }
    khachAct(kind === "zalo" ? "zalo" : "bg", { khach: g.khach, mst: g.mst });   // thiếu SĐT/MST: tra qua mv.khach (cần backend bản 22)
  }

  /* Gắn việc với khách: tra SĐT/MST qua mv.khach (chỉ đọc), rồi mở Zalo hoặc form Báo giá điền sẵn MST + tên (anh tự bấm Gửi lệnh) */
  function khachAct(kind, v) {
    if (!v) return;
    if (!connected()) { toast("Cần kết nối backend (Cài đặt)"); return; }
    var key = (v.mst || "") + "|" + (v.khach || "");
    var go = function (k) {
      if (kind === "zalo") {
        var d = String(k.sdt || "").replace(/\D/g, "");
        if (d.length < 9) { toast("Chưa có SĐT của khách này (HET_HAN không có)"); return; }
        if (d.indexOf("84") === 0) d = "0" + d.slice(2);
        var a = document.createElement("a"); a.href = "https://zalo.me/" + d; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove();
      } else {
        var mst = String(k.mst || v.mst || "").replace(/\D/g, "");
        if (!mst) { toast("Chưa biết MST của khách này, hãy nhập MST vào việc"); return; }
        if (typeof openTool !== "function" || typeof toolById !== "function") { toast("Không mở được Báo giá, tải lại trang"); return; }
        openTool(toolById("bao_gia"), { mst: mst, ten: k.ten || v.khach || "" });
      }
    };
    if (M.kh[key]) { go(M.kh[key]); return; }
    toast("Đang tra khách…");
    api("mv.khach", { mst: v.mst || "", khach: v.khach || "" }).then(function (k) { M.kh[key] = k || {}; go(M.kh[key]); })
      .catch(function (e) { toast("Lỗi: " + (/unknown|route/i.test(e.message) ? "backend chưa có mv.khach, cần triển khai bản mới" : e.message)); });
  }

  /* ================= CHI TIÊU (13/11/2026) =================
     Gõ câu thường: "ăn trưa 45k", "đổ xăng 200k hôm qua", "mua in 1tr2 ngày 10/11" → tự hiểu số tiền, ngày, nhóm. */
  var CT_NHOM = [["an_uong", "Ăn uống"], ["di_lai", "Đi lại"], ["vnpt", "Công việc VNPT"], ["gia_dinh", "Gia đình / cá nhân"], ["khac", "Khác"]];
  var CT_KW = {
    an_uong: ["an", "uong", "com", "pho", "bun", "mi", "banh", "ca phe", "cafe", "tra", "tra sua", "nuoc", "bia", "nhau", "lau", "quan", "sang", "bua"],
    di_lai: ["xang", "do xang", "gui xe", "xe", "taxi", "grab", "be", "ve", "bot", "rua xe", "sua xe", "thay nhot", "nhot"],
    vnpt: ["khach", "in", "in an", "photo", "van phong pham", "vpp", "ho so", "ship", "giao hang", "tem", "hop dong", "bao gia"],
    gia_dinh: ["con", "vo", "nha", "tien dien", "tien nuoc", "hoc phi", "thuoc", "sieu thi", "cho", "mua sam", "quan ao", "sinh nhat", "me", "ba"]
  };
  function ctNhomName(k) { for (var i = 0; i < CT_NHOM.length; i++) if (CT_NHOM[i][0] === k) return CT_NHOM[i][1]; return "Khác"; }
  function vnd(n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ"; }
  function ctGuess(content) {
    var s = " " + nz(content) + " ";
    for (var k in CT_KW) if (CT_KW[k].some(function (w) { return s.indexOf(" " + w + " ") >= 0; })) return k;
    return "khac";
  }
  /* Số tiền: 45k, 45 nghìn, 1tr2, 1,5 triệu, 200.000, 200000. Số trần < 1000 hiểu là nghìn (45 = 45.000) */
  function parseMoney(s) {
    s = nz(s); var m, v = 0;
    if ((m = /(\d{1,3}(?:[.,]\d{3})+)(?!\d)/.exec(s))) v = +m[1].replace(/[.,]/g, "");
    else if ((m = /(\d+(?:[.,]\d+)?)\s*(?:tr|trieu|m)(?![a-z])\s*(\d{1,3})?/.exec(s))) { var b = parseFloat(m[1].replace(",", ".")); if (m[2]) b += parseFloat("0." + m[2]); v = Math.round(b * 1e6); }
    else if ((m = /(\d+(?:[.,]\d+)?)\s*(?:k|nghin|ngan)(?![a-z])/.exec(s))) v = Math.round(parseFloat(m[1].replace(",", ".")) * 1000);
    else if ((m = /(?:^|\s)(\d+)(?=\s|$)/.exec(s))) { v = +m[1]; if (v > 0 && v < 1000) v *= 1000; }
    return v;
  }
  function parseCt(text) {
    var orig = String(text || "").trim(), words = orig.split(/\s+/), nw = words.map(nz), drop = {}, d = today0(), i, m;
    for (i = 0; i < nw.length; i++) {   // ngày: hôm nay/qua/kia, dd/mm[/yy], "ngày N"
      if (nw[i] === "hom" && nw[i + 1] === "qua") { d = new Date(d.getTime() - 864e5); drop[i] = drop[i + 1] = 1; }
      else if (nw[i] === "hom" && (nw[i + 1] === "kia" || nw[i + 1] === "truoc")) { d = new Date(d.getTime() - 2 * 864e5); drop[i] = drop[i + 1] = 1; }
      else if (nw[i] === "hom" && nw[i + 1] === "nay") { drop[i] = drop[i + 1] = 1; }
      else if ((m = /^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/.exec(nw[i]))) {
        var yy = m[3] ? (+m[3] < 100 ? 2000 + (+m[3]) : +m[3]) : d.getFullYear(), dt = new Date(yy, +m[2] - 1, +m[1]);
        if (!m[3] && dt > today0()) dt.setFullYear(yy - 1);
        if (!isNaN(dt)) { d = dt; drop[i] = 1; if (nw[i - 1] === "ngay") drop[i - 1] = 1; }
      } else if (nw[i] === "ngay" && /^\d{1,2}$/.test(nw[i + 1] || "") && +nw[i + 1] >= 1 && +nw[i + 1] <= 31) {
        var t0 = today0(), dt2 = new Date(t0.getFullYear(), t0.getMonth(), +nw[i + 1]); if (dt2 > t0) dt2 = new Date(t0.getFullYear(), t0.getMonth() - 1, +nw[i + 1]);
        d = dt2; drop[i] = drop[i + 1] = 1;
      }
    }
    var rest = nw.filter(function (w, k) { return !drop[k]; }).join(" "), tien = parseMoney(rest), UNIT = /^(k|nghin|ngan|tr|trieu|m|d|dong|vnd)$/;
    for (i = 0; i < nw.length; i++) {   // bỏ cụm số tiền khỏi nội dung
      if (drop[i]) continue;
      if (/^\d[\d.,]*(k|tr|trieu|m|d)?\d*$/.test(nw[i])) { drop[i] = 1; if (UNIT.test(nw[i + 1] || "")) drop[i + 1] = 1; }
    }
    var kept = words.filter(function (w, k) { return !drop[k]; });
    while (kept.length && /^(chi|da|tieu|het)$/.test(nz(kept[0]))) kept.shift();
    var nd = kept.join(" ").replace(/^[:,\-–\s]+|[:,\-–\s]+$/g, ""); if (!nd) nd = "Chi tiêu";
    nd = nd.charAt(0).toUpperCase() + nd.slice(1);
    return { ngay: ymd(d), so_tien: tien, noi_dung: nd, nhom: ctGuess(nd) };
  }
  window.mvParseCt = parseCt;
  function ctMonth(off) { var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + off); return d.getFullYear() + "-" + z(d.getMonth() + 1); }
  function ctSum(list) { return list.reduce(function (s, c) { return s + (Number(c.so_tien) || 0); }, 0); }
  function loadCt() {
    if (!connected() || M.ctBusy) return; M.ctBusy = true;
    api("mv.ct_list", {}).then(function (r) { M.ct = r.ct || []; M.ctErr = ""; })
      .catch(function (e) { M.ctErr = /không hợp lệ|ct_list|unknown/i.test(e.message) ? "Backend chưa có chi tiêu (cần triển khai bản mới)." : "Không tải được: " + e.message; })
      .then(function () { M.ctBusy = false; M.ctLoaded = true; saveCache(); render(); });
  }
  function ctHtml() {
    if (!M.ctLoaded && !M.ctBusy) loadCt();
    var key = ctMonth(M.ctm), prev = ctMonth(M.ctm - 1), mm = key.split("-"), h = "";
    var cur = M.ct.filter(function (c) { return String(c.ngay).indexOf(key) === 0; }), pv = M.ct.filter(function (c) { return String(c.ngay).indexOf(prev) === 0; });
    var tong = ctSum(cur), tp = ctSum(pv);
    h += '<div class="mvmon"><button type="button" data-ctm="-1">‹</button><b>Tháng ' + mm[1] + "/" + mm[0] + '</b><button type="button" data-ctm="1"' + (M.ctm >= 0 ? " disabled" : "") + ">›</button></div>";
    if (M.ctErr) h += '<div class="note err">' + esc(M.ctErr) + "</div>";
    h += '<div class="mvtot">' + vnd(tong) + "</div><div class=\"mvempty\" style=\"padding:0 0 6px;text-align:left\">" + cur.length + " khoản" +
      (tp ? " · tháng trước " + vnd(tp) + (tong ? " (" + (tong >= tp ? "+" : "−") + Math.round(Math.abs(tong - tp) * 100 / tp) + "%)" : "") : "") + "</div>";
    var by = {}; cur.forEach(function (c) { by[c.nhom || "khac"] = (by[c.nhom || "khac"] || 0) + (Number(c.so_tien) || 0); });
    Object.keys(by).sort(function (a, b) { return by[b] - by[a]; }).forEach(function (k) {
      h += '<div style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:13px"><span>' + esc(ctNhomName(k)) + "</span><b>" + vnd(by[k]) + '</b></div><div class="mvbar"><i style="width:' + Math.max(3, Math.round(by[k] * 100 / tong)) + '%"></i></div></div>';
    });
    if (!cur.length) return h + '<div class="mvempty">' + (M.ctLoaded ? "Chưa có khoản chi nào trong tháng này. Gõ ô phía trên, ví dụ “ăn trưa 45k”." : "Đang tải…") + "</div>";
    var days = {}, order = []; cur.forEach(function (c) { if (!days[c.ngay]) { days[c.ngay] = []; order.push(c.ngay); } days[c.ngay].push(c); });
    order.sort().reverse().forEach(function (dn) {
      h += '<div class="mvh">' + esc(hanLabel(dn)) + "<span>" + vnd(ctSum(days[dn])) + "</span></div>" + days[dn].map(function (c) {
        return '<div class="mvct" data-cte="' + esc(c.id) + '"><div><b>' + esc(c.noi_dung) + "</b><small>" + esc(ctNhomName(c.nhom)) + (c.ghi_chu ? " · " + esc(c.ghi_chu).slice(0, 60) : "") + "</small></div><span>" + vnd(c.so_tien) + "</span></div>";
      }).join("");
    });
    return h;
  }
  function ctForm(c) {
    var isNew = !c; c = c || { ngay: ymd(new Date()), nhom: "khac" };
    var h = '<div class="sh-h"><span class="ic">' + svg("vio") + '</span><div><b>' + (isNew ? "Thêm khoản chi" : "Sửa khoản chi") + '</b></div></div><form id="mvCt" autocomplete="off">' +
      '<div class="fld"><label>Nội dung <i>*</i></label><input name="noi_dung" value="' + esc(c.noi_dung || "") + '"></div>' +
      '<div class="fld"><label>Số tiền (đồng) <i>*</i></label><input name="so_tien" inputmode="numeric" value="' + esc(c.so_tien || "") + '"></div>' +
      '<div class="fld"><label>Ngày</label><input name="ngay" type="date" value="' + esc(c.ngay || "") + '"></div>' +
      '<div class="fld"><label>Nhóm</label><select name="nhom">' + CT_NHOM.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === c.nhom ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></div>" +
      '<div class="fld"><label>Ghi chú</label><input name="ghi_chu" value="' + esc(c.ghi_chu || "") + '"></div>' +
      '<button class="btn" type="submit">Lưu</button>' + (isNew ? "" : '<button class="btn sec" type="button" id="mvCtDel" style="margin-top:8px">Xóa khoản này</button>') + "</form>";
    openSheet(h);
    el("mvCt").onsubmit = function (e) {
      e.preventDefault(); var f = e.target.elements, o = { noi_dung: f.noi_dung.value.trim(), so_tien: f.so_tien.value.replace(/\D/g, ""), ngay: f.ngay.value, nhom: f.nhom.value, ghi_chu: f.ghi_chu.value.trim() };
      if (!o.noi_dung || !+o.so_tien) { toast("Nhập nội dung và số tiền"); return; }
      if (c.id) o.id = c.id;
      api("mv.ct_save", { ct: o }).then(function (r) {
        M.ct = M.ct.filter(function (x) { return x.id !== r.ct.id; }); M.ct.unshift(r.ct); saveCache(); toast("Đã lưu"); openMyVio("chi_tieu");
      }).catch(function (err) { toast("Lỗi: " + err.message); });
    };
    var del = el("mvCtDel"); if (del) del.onclick = function () {
      if (!confirm("Xóa khoản chi này? Không lấy lại được.")) return;
      api("mv.ct_del", { id: c.id }).then(function () { M.ct = M.ct.filter(function (x) { return x.id !== c.id; }); saveCache(); toast("Đã xóa"); openMyVio("chi_tieu"); }).catch(function (err) { toast("Lỗi: " + err.message); });
    };
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

  /* ---------------- Nhắc bằng giọng nói – lớp A (khi app đang mở) ----------------
     Việc đến hạn mà chưa bấm xong: thanh nhắc ở đầu màn hình + đọc to tiếng Việt, lặp mỗi N phút.
     Bấm ✓ Xong thì ngừng; "Hoãn 30'" tạm ngừng 30 phút. Yên lặng 22h–6h. */
  var VO = { on: lsGet("mv_vo_on") !== "0", min: +lsGet("mv_vo_min") || 10, last: 0, sn: {}, act: false, mode: lsGet("mv_vo_mode") || "voice", meet: +lsGet("mv_vo_meet") || 0, knock: lsGet("mv_vo_knock") !== "0" };
  try { VO.sn = JSON.parse(lsGet("mv_vo_sn") || "{}") || {}; } catch (e) { VO.sn = {}; }
  var VO_SNOOZE = 30, VO_MINS = [5, 10, 15, 30];
  var vstl = document.createElement("style");
  vstl.textContent = ".mvvoice{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0}.mvvoice button{border:1px solid #C25E00;color:#C25E00;background:#fff;border-radius:99px;padding:6px 12px;font-size:13px;font-weight:600}.mvvoice small{flex-basis:100%;color:#6b7280;font-size:11px}" +
    ".mvvoice button.sel{background:#C25E00;color:#fff}.mvvoice .vm{flex-basis:100%;display:flex;gap:6px;flex-wrap:wrap}#mvFlash{position:fixed;left:0;right:0;top:0;height:10px;z-index:100000;background:#D9534F;animation:mvfl .5s ease-in-out 6 alternate;pointer-events:none}@keyframes mvfl{from{opacity:0}to{opacity:1}}" +
    "#mvVoBar{position:fixed;left:0;right:0;top:0;z-index:99999;background:#FFF4E5;border-bottom:2px solid #C25E00;padding:calc(6px + env(safe-area-inset-top,0px)) 10px 8px;box-shadow:0 2px 8px rgba(0,0,0,.2);font-size:14px;color:#222}" +
    "#mvVoBar .vh{display:flex;gap:6px;align-items:center;font-weight:700;color:#C25E00;margin-bottom:4px}#mvVoBar .vh span{flex:1}" +
    "#mvVoBar .vr{display:flex;gap:6px;align-items:center;padding:4px 0;border-top:1px solid #F3D9B8}#mvVoBar .vr b{flex:1;font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis}#mvVoBar .vr small{display:block;font-weight:400;color:#6b7280}" +
    "#mvVoBar button{border:1px solid #C25E00;background:#fff;color:#C25E00;border-radius:8px;padding:6px 10px;font-size:13px;font-weight:700}#mvVoBar button.ok{background:#1E7B4F;border-color:#1E7B4F;color:#fff}";
  document.head.appendChild(vstl);
  function voSave() { try { lsSet("mv_vo_sn", JSON.stringify(VO.sn)); } catch (e) {} }
  /* Thời điểm đến hạn: có giờ → đúng giờ; chỉ có ngày → 08:00 sáng hôm đó */
  function dueAt(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?$/.exec(v.han || ""); if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 8, m[5] ? +m[5] : 0).getTime();
  }
  function voDue() {
    var now = Date.now();
    return M.viec.filter(function (v) { var d = dueAt(v); return d != null && d <= now && !(VO.sn[v.id] > now); }).sort(function (a, b) { return dueAt(a) - dueAt(b); });
  }
  function voQuiet() { var h = new Date().getHours(); return h >= 22 || h < 6; }
  function voBeep() {
    try { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; var c = new AC(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(c.destination); o.start(); setTimeout(function () { o.stop(); c.close(); }, 250); } catch (e) {}
  }
  function voSay(list) {
    voBeep();
    setTimeout(function () {
      try {
        var ss = window.speechSynthesis; if (!ss || !list.length) return; ss.cancel();
        var names = list.slice(0, 3).map(function (v) { return v.tieu_de; });
        var u = new SpeechSynthesisUtterance("Nhắc việc. Anh có " + list.length + " việc đến hạn: " + names.join(". ") + (list.length > 3 ? ". Và " + (list.length - 3) + " việc nữa." : ".") + " Bấm xong để tắt nhắc.");
        u.lang = "vi-VN"; u.rate = 0.95; var vs = ss.getVoices() || [];
        for (var i = 0; i < vs.length; i++) if (/^vi/i.test(vs[i].lang)) { u.voice = vs[i]; break; }
        ss.speak(u);
      } catch (e) {}
    }, 400);
  }
  /* Gõ cửa 3 lần trước khi nói: nếu trong ~5 giây anh bấm nút nguồn (màn hình tắt → trang bị ẩn) nghĩa là đang họp/bận
     → không nói, báo lại sau (đúng chu kỳ nhắc). Không bấm → đọc các việc cần làm. */
  var VO_WAIT = 5;
  function voKnock() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { var c = new AC(); [0, 0.45, 0.9].forEach(function (t) { var o = c.createOscillator(), g = c.createGain(); o.type = "sine"; o.frequency.setValueAtTime(170, c.currentTime + t); o.frequency.exponentialRampToValueAtTime(70, c.currentTime + t + 0.12); g.gain.setValueAtTime(0.0001, c.currentTime + t); g.gain.exponentialRampToValueAtTime(0.9, c.currentTime + t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t + 0.16); o.connect(g); g.connect(c.destination); o.start(c.currentTime + t); o.stop(c.currentTime + t + 0.2); }); setTimeout(function () { try { c.close(); } catch (e) {} }, 1500); }
      if (navigator.vibrate) navigator.vibrate([80, 370, 80, 370, 80]);
    } catch (e) {}
  }
  function voVoice(list, demo) {
    if (!VO.knock) { voSay(list); return; }
    var hid = false, h = function () { if (document.hidden) hid = true; };
    document.addEventListener("visibilitychange", h);
    voKnock();
    setTimeout(function () {
      document.removeEventListener("visibilitychange", h);
      if (hid || document.hidden) { if (!demo) VO.last = Date.now(); return; }   // bấm nguồn = bận → báo lại sau
      voSay(list);
    }, 1400 + VO_WAIT * 1000);
    if (demo) toast("🚪 Gõ cửa 3 lần… bấm nút nguồn trong " + VO_WAIT + " giây = bận (không nói); không bấm = đọc việc");
  }
  /* Chế độ nhắc: voice = đọc to · bell = chuông · vibe = rung + nhấp nháy · quiet = chỉ nhấp nháy.
     "Họp 60 phút" = tạm chuyển sang rung (không tiếng) rồi tự trở về chế độ đã chọn. */
  var VO_MODES = [["voice", "🔊 Giọng nói"], ["bell", "🔔 Chuông"], ["vibe", "📳 Rung"], ["quiet", "🔕 Im lặng"]];
  function voMeeting() { return VO.meet > Date.now(); }
  function voMode() { return voMeeting() ? "vibe" : VO.mode; }
  function voFlash() { var f = document.getElementById("mvFlash"); if (f) f.remove(); f = document.createElement("div"); f.id = "mvFlash"; document.body.appendChild(f); setTimeout(function () { f.remove(); }, 3200); }
  function voAlert(list, mode, demo) {
    mode = mode || voMode();
    if (mode === "voice") { voVoice(list, demo); return; }
    if (mode === "bell") { voBeep(); setTimeout(voBeep, 350); setTimeout(voBeep, 700); return; }
    voFlash();   // rung / im lặng: nhấp nháy thanh đầu màn hình
    if (mode === "vibe") { try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) {} }
  }
  function voActive() { return navigator.userActivation ? navigator.userActivation.hasBeenActive : VO.act; }
  /* Thanh nhắc ở đầu màn hình: còn việc đến hạn chưa xong/chưa hoãn thì còn hiện */
  function voBanner() {
    var bar = document.getElementById("mvVoBar"), d = VO.on && connected() ? voDue() : [];
    if (!d.length) { if (bar) bar.remove(); return; }
    if (!bar) { bar = document.createElement("div"); bar.id = "mvVoBar"; bar.onclick = voBar; document.body.appendChild(bar); }
    var h = '<div class="vh"><span>🔔 Việc đến hạn (' + d.length + ')' + (voActive() ? "" : " · chạm màn hình để bật tiếng") + '</span><button type="button" data-bh="1">' + (voMeeting() ? "🤫 Đang họp" : "🤫 Họp") + '</button><button type="button" data-bv="1">▶</button><button type="button" data-bo="1">Mở</button></div>';
    d.slice(0, 3).forEach(function (v) { h += '<div class="vr"><b>' + esc(v.tieu_de) + "<small>" + esc(hanLabel(v.han)) + (v.khach ? " · " + esc(v.khach) : "") + '</small></b><button type="button" class="ok" data-bd="' + esc(v.id) + '">✓ Xong</button><button type="button" data-bs="' + esc(v.id) + '">Hoãn 30\'</button></div>'; });
    if (d.length > 3) h += '<div class="vr"><b>… và ' + (d.length - 3) + " việc nữa</b></div>";
    bar.innerHTML = h;
  }
  function voQuickDone(id) {
    var v = find(id); if (!v) return;
    M.viec = M.viec.filter(function (x) { return x.id !== v.id; }); v.trang_thai = "xong"; v.xong_luc = "vừa xong"; M.xong.unshift(v); saveCache(); badge(); render();
    api("mv.done", { id: v.id, xong: true }).then(function (r) { if (r.tiep) { upsert(r.tiep); render(); toast("Xong · đã tạo lần tiếp: " + hanLabel(r.tiep.han)); } else toast("Đã xong"); })
      .catch(function (err) { toast("Lỗi: " + err.message); load(false); });
  }
  function voBar(e) {
    var b = e.target.closest("button"); if (!b) return; var a = b.dataset;
    if (a.bd) voQuickDone(a.bd);
    else if (a.bs) { VO.sn[a.bs] = Date.now() + VO_SNOOZE * 60000; voSave(); try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (x) {} voBanner(); toast("Hoãn " + VO_SNOOZE + " phút"); }
    else if (a.bo) { if (window.openMyVio) window.openMyVio("hom_nay"); }
    else if (a.bh) { voMeetToggle(); voBanner(); render(); }
    else if (a.bv) voAlert(voDue(), null, true);
  }
  function voMeetToggle() {
    VO.meet = voMeeting() ? 0 : Date.now() + 60 * 60000; try { lsSet("mv_vo_meet", String(VO.meet)); } catch (e) {}
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    toast(voMeeting() ? "🤫 Chế độ họp 60 phút: chỉ rung + nhấp nháy, không tiếng" : "Đã tắt chế độ họp");
  }
  function voClick(a) {
    if (a.vo != null) { VO.on = !VO.on; try { lsSet("mv_vo_on", VO.on ? "1" : "0"); } catch (e) {} if (!VO.on) try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }
    else if (a.vi != null) { VO.min = VO_MINS[(VO_MINS.indexOf(VO.min) + 1) % VO_MINS.length]; try { lsSet("mv_vo_min", String(VO.min)); } catch (e) {} }
    else if (a.vm) { VO.mode = a.vm; try { lsSet("mv_vo_mode", VO.mode); } catch (e) {} var d = voDue(); voAlert(d.length ? d : [{ tieu_de: "việc thử nhắc" }], VO.mode, true); toast("Thử: " + VO_MODES.filter(function (m) { return m[0] === a.vm; })[0][1]); }
    else if (a.vh != null) voMeetToggle();
    else if (a.vk != null) { VO.knock = !VO.knock; try { lsSet("mv_vo_knock", VO.knock ? "1" : "0"); } catch (e) {} }
    voBanner(); render();
  }
  function voTick() {
    voBanner();
    if (!VO.on || !connected() || voQuiet() || document.hidden || !voActive()) return;
    var d = voDue(); if (!d.length) return;
    var now = Date.now(); if (now - VO.last < VO.min * 60000) return;
    VO.last = now; voAlert(d);
  }
  window.mvVoRefresh = voBanner;
  setInterval(voTick, 30000);
  document.addEventListener("pointerdown", function () { VO.act = true; setTimeout(voTick, 400); }, { once: true });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) voTick(); });

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

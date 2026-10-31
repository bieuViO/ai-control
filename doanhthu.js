/* =====================================================================
   DOANH THU – xem doanh thu (báo cáo thu tiền OneBSS) của anh theo tháng, từng khách hàng, ngay trong app.
   File riêng, nạp sau script chính của index.html (dùng lại: api, openSheet, closeSheet, toast, esc, el, svg,
   connected, fmtMoney). Dữ liệu lấy từ tab DOANH_THU (Sheet AI_CONTROL) qua backend DoanhThu.gs (dt.get).
   Nút "Lấy báo cáo mới nhất" → job 'doanh_thu' → extension VNPT Nhắc Nợ trên máy tính lấy báo cáo từ OneBSS → dt.save.
   Xem dữ liệu đã lấy thì KHÔNG cần máy tính bật.
   ===================================================================== */
"use strict";
(function () {
  var css = [
    ".dtbar{display:flex;gap:8px;margin-top:10px;align-items:center}.dtbar select{flex:1;min-width:0;border:1px solid var(--line);border-radius:10px;padding:10px;font-size:14px;background:#fff}",
    ".dtsum{margin-top:12px;border-radius:14px;padding:12px 14px;background:var(--blue-soft);color:#12326B}.dtsum b{display:block;font-size:22px;color:var(--blue)}.dtsum small{display:block;font-size:12.5px;margin-top:3px;color:var(--mute)}",
    ".dtq{width:100%;box-sizing:border-box;margin-top:10px;border:1px solid var(--line);border-radius:10px;padding:10px;font-size:14px}",
    ".dtcard{display:block;width:100%;text-align:left;border:1px solid var(--line);background:#fff;border-radius:14px;padding:11px 12px;margin-top:9px;color:var(--text)}",
    ".dtcard .hd{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.dtcard .hd b{font-size:14px;font-weight:600;word-break:break-word}.dtcard .hd em{font-style:normal;font-weight:700;color:var(--blue);white-space:nowrap}",
    ".dtcard .ln{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;color:#334;border-top:1px dashed var(--line);margin-top:8px;padding-top:6px}.dtcard .ln span:last-child{white-space:nowrap;font-weight:600}",
    ".dtmsg{margin-top:10px;font-size:13px}"
  ].join("");
  var stl = document.createElement("style"); stl.textContent = css; document.head.appendChild(stl);

  var D = { ky: "", thang: [], rows: [], cap: "", q: "", busy: false, open: {}, timer: null, loaded: false };
  function z(n) { return ("0" + n).slice(-2); }
  function money(n) { return fmtMoney(Math.round(n || 0)); }
  function kyVN(k) { return k ? (k.slice(5) + "/" + k.slice(0, 4)) : ""; }
  function curKy() { var d = new Date(); return d.getFullYear() + "-" + z(d.getMonth() + 1); }
  function capVN(s) { var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})/.exec(String(s || "")); return m ? (m[4] + " " + m[3] + "/" + m[2]) : ""; }
  function noAcc(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase(); }
  function setMsg(t, err) { var m = el("dtMsg"); if (!m) return; m.innerHTML = t ? '<div class="note ' + (err ? "err" : "info") + '" style="margin-top:0">' + esc(t) + "</div>" : ""; }

  /* Gom các dòng theo khách (tên khách), sắp xếp doanh thu giảm dần */
  function groups() {
    var q = noAcc(D.q).trim(), map = {}, out = [];
    D.rows.forEach(function (r) {
      var key = String(r[1] || "(không tên)").trim();
      if (q && noAcc(key + " " + r[2] + " " + r[3]).indexOf(q) < 0) return;
      var g = map[key] || (map[key] = { ten: key, tong: 0, ds: [] });
      g.tong += r[10]; g.ds.push(r);
    });
    Object.keys(map).forEach(function (k) { out.push(map[k]); });
    return out.sort(function (a, b) { return b.tong - a.tong; });
  }

  function renderList() {
    var box = el("dtList"); if (!box) return;
    var gs = groups(), tong = 0, tien = 0, vat = 0, n = 0;
    gs.forEach(function (g) { g.ds.forEach(function (r) { tong += r[10]; tien += r[8]; vat += r[9]; n++; }); });
    var sum = el("dtSum");
    if (sum) sum.innerHTML = D.rows.length
      ? '<small>Doanh thu tháng ' + esc(kyVN(D.ky)) + (D.q ? " (đang lọc)" : "") + '</small><b>' + money(tong) + ' đ</b><small>' + gs.length + ' khách · ' + n + ' khoản · chưa VAT ' + money(tien) + ' · VAT ' + money(vat) + '</small>' +
        (D.cap ? '<small>Cập nhật lúc ' + esc(capVN(D.cap)) + '</small>' : "")
      : '<small>Tháng ' + esc(kyVN(D.ky)) + '</small><b>Chưa có dữ liệu</b><small>Bấm “Lấy báo cáo mới nhất” (máy tính cần bật, Chrome đã đăng nhập OneBSS).</small>';
    box.innerHTML = gs.map(function (g, i) {
      var open = D.open[g.ten];
      var h = '<button type="button" class="dtcard" data-g="' + i + '"><div class="hd"><b>' + esc(g.ten) + '</b><em>' + money(g.tong) + '</em></div>' +
        '<div class="sub">' + g.ds.length + ' khoản' + (g.ds[0][5] ? " · " + esc(g.ds[0][5]) : "") + (open ? "" : " · bấm để xem chi tiết") + "</div>";
      if (open) h += g.ds.map(function (r) {
        return '<div class="ln"><span>' + esc(r[0]) + " · " + esc(r[5] || r[6] || "") + (r[3] ? " · HĐ " + esc(r[3]) : "") + (r[7] ? " · " + esc(r[7]) : "") + '</span><span>' + money(r[10]) + "</span></div>";
      }).join("");
      return h + "</button>";
    }).join("") || (D.rows.length ? '<p class="sub" style="margin-top:14px">Không có khách nào khớp.</p>' : "");
    el("dtList").onclick = function (e) {
      var c = e.target.closest("[data-g]"); if (!c) return;
      var g = groups()[+c.getAttribute("data-g")]; if (!g) return;
      D.open[g.ten] = !D.open[g.ten]; renderList();
    };
  }

  function renderMonths() {
    var s = el("dtKy"); if (!s) return;
    var ks = D.thang.map(function (t) { return t.ky; });
    if (ks.indexOf(curKy()) < 0) ks.unshift(curKy());
    if (D.ky && ks.indexOf(D.ky) < 0) ks.push(D.ky);
    ks.sort().reverse();
    s.innerHTML = ks.map(function (k) {
      var t = D.thang.filter(function (x) { return x.ky === k; })[0];
      return '<option value="' + k + '"' + (k === D.ky ? " selected" : "") + ">Tháng " + kyVN(k) + (t ? " · " + money(t.tong) + " đ" : " · chưa lấy") + "</option>";
    }).join("");
  }

  function load(ky) {
    if (!connected()) { setMsg("Chưa kết nối backend", true); return Promise.resolve(); }
    return api("dt.get", { ky: ky || "" }).then(function (r) {
      D.thang = r.thang || []; D.rows = r.rows || []; D.cap = r.cap_nhat || "";
      D.ky = ky || r.ky || curKy(); D.loaded = true;
      if (!ky && !D.rows.length) D.ky = curKy();
      renderMonths(); renderList();
    }, function (e) { setMsg("Không tải được: " + e.message, true); });
  }

  function watch(id, t0) {
    clearTimeout(D.timer);
    if (!el("dtBox")) { D.busy = false; return; }   // đã đóng màn hình
    api("job.get", { id: id }).then(function (r) {
      var j = r.job || {}, wait = Date.now() - t0;
      if (j.trang_thai === "done") { D.busy = false; el("dtGet").disabled = false; setMsg(""); toast("Đã cập nhật doanh thu"); load(D.ky); return; }
      if (j.trang_thai === "error" || j.trang_thai === "cancelled") { D.busy = false; el("dtGet").disabled = false; setMsg("❌ " + (j.ket_qua || "Máy tính báo lỗi"), true); return; }
      if (wait > 300000) { D.busy = false; el("dtGet").disabled = false; setMsg("Quá 5 phút chưa xong. Kiểm tra máy tính còn bật, Chrome đã đăng nhập OneBSS rồi thử lại.", true); return; }
      setMsg(j.trang_thai === "queued"
        ? (wait > 45000 ? "Máy tính chưa nhận lệnh. Hãy bật máy tính, mở Chrome (extension VNPT Nhắc Nợ) rồi chờ thêm…" : "Đã gửi lệnh, đang chờ máy tính nhận…")
        : (j.ket_qua || "Máy tính đang lấy báo cáo từ OneBSS…"));
      D.timer = setTimeout(function () { watch(id, t0); }, 3000);
    }, function () { D.timer = setTimeout(function () { watch(id, t0); }, 4000); });
  }

  function fetchNew() {
    if (!connected()) { toast("Chưa kết nối backend"); return; }
    if (D.busy) return;
    D.busy = true; el("dtGet").disabled = true; setMsg("Đang gửi lệnh cho máy tính…");
    api("job.enqueue", { tool: "doanh_thu", params: { ky: D.ky || curKy() } }).then(function (r) { watch(r.id, Date.now()); },
      function (e) { D.busy = false; el("dtGet").disabled = false; setMsg("Lỗi: " + e.message, true); });
  }

  window.openDoanhThu = function () {
    D.q = ""; D.open = {}; D.busy = false;
    openSheet('<div id="dtBox"><div class="sh-h"><span class="ic">' + svg("chart") + '</span><div><b>Doanh thu</b></div></div>' +
      '<p class="sh-d">Doanh thu của anh (mã CTV051117) theo từng khách, lấy từ báo cáo thu tiền OneBSS.</p>' +
      '<div class="dtbar"><select id="dtKy"></select></div>' +
      '<div class="dtsum" id="dtSum"><small>Đang tải…</small></div>' +
      '<button class="btn" id="dtGet" style="margin-top:10px">Lấy báo cáo mới nhất</button>' +
      '<div class="dtmsg" id="dtMsg"></div>' +
      '<input class="dtq" id="dtQ" type="search" placeholder="Tìm tên khách, mã thuê bao, số hóa đơn…" autocomplete="off">' +
      '<div id="dtList"></div><button class="btn sec" id="dtClose">Đóng</button></div>');
    el("dtClose").onclick = closeSheet;
    el("dtGet").onclick = fetchNew;
    el("dtKy").onchange = function () { D.ky = this.value; D.open = {}; load(D.ky); };
    el("dtQ").oninput = function () { D.q = this.value; renderList(); };
    renderMonths(); load("");
  };
})();

/* CÔNG NỢ THEO THÁNG – xem tổng nợ còn lại từng tháng và từng khách (dữ liệu từ tab CONG_NO, backend CongNo.gs: cn.get). */
"use strict";
(function () {
  var stl = document.createElement("style");
  stl.textContent = ".cnsum{margin-top:12px;border-radius:14px;padding:12px 14px;background:#FBEAE9;color:#7A2420}.cnsum b{display:block;font-size:22px;color:#B23A34}.cnsum small{display:block;font-size:12.5px;margin-top:3px;color:var(--mute)}" +
    ".cnchips{display:flex;gap:8px;overflow-x:auto;padding:2px 0 8px;-webkit-overflow-scrolling:touch;scrollbar-width:none}.cnchips::-webkit-scrollbar{display:none}.cnchips button{flex:0 0 auto;border:1px solid var(--line);background:#fff;border-radius:12px;padding:8px 12px;font:inherit;text-align:center;line-height:1.25;color:var(--ink,#1b2430)}.cnchips button b{display:block;font-size:14px}.cnchips button small{display:block;font-size:11.5px;color:#B23A34}.cnchips button.on{background:#0B3D66;border-color:#0B3D66;color:#fff}.cnchips button.on small{color:#FFD9D6}.cnchips button.z small{color:#1E7A46}.cnchips button.on.z small{color:#CFF0DB}.cncard .hd b{font-size:15px}.cncard .ln{font-size:13px}.cnchk{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px}.cncard em.red{color:#B23A34}";
  document.head.appendChild(stl);
  var D = { ky: "ALL", thang: [], rows: [], cap: "", q: "", onlyDebt: true, open: {} };
  function z(n) { return ("0" + n).slice(-2); }
  function money(n) { return fmtMoney(Math.round(n || 0)); }
  function tr(n) { n = Math.round(n || 0); if (n <= 0) return "0 đ"; if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".", ",").replace(/,0$/, "") + " tr"; return fmtMoney(n); }
  function kyVN(k) { return k ? (k.slice(5) + "/" + k.slice(0, 4)) : ""; }
  function noAcc(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase(); }
  function capVN(s) { var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})/.exec(String(s || "")); return m ? (m[4] + " " + m[3] + "/" + m[2]) : ""; }
  function setMsg(t) { var m = el("cnMsg"); if (m) m.innerHTML = t ? '<div class="note err" style="margin-top:10px">' + esc(t) + "</div>" : ""; }

  function renderMonths() {
    var s = el("cnKy"); if (!s) return;
    var tong = D.thang.reduce(function (a, x) { return a + x.con_no; }, 0);
    s.innerHTML = '<button type="button" data-k="ALL" class="' + (D.ky === "ALL" ? "on" : "") + (tong > 0 ? "" : " z") + '"><b>Tất cả</b><small>nợ ' + tr(tong) + "</small></button>" + D.thang.map(function (x) {
      return '<button type="button" data-k="' + x.ky + '" class="' + (x.ky === D.ky ? "on" : "") + (x.con_no > 0 ? "" : " z") + '"><b>T' + esc(kyVN(x.ky).replace(/\/20(\d\d)$/, "/$1")) + "</b><small>" + (x.con_no > 0 ? "nợ " + tr(x.con_no) : "hết nợ") + "</small></button>";
    }).join("");
    s.onclick = function (e) { var b = e.target.closest("[data-k]"); if (b) load(b.getAttribute("data-k")); };
    var on = s.querySelector(".on"); if (on && on.scrollIntoView) on.scrollIntoView({ inline: "center", block: "nearest" });
  }
  function renderAll() {
    var ts = D.thang.slice().sort(function (a, b) { return a.ky < b.ky ? 1 : -1; }), no = 0, dt = 0, dthu = 0;
    ts.forEach(function (x) { no += x.con_no; dt += x.doanh_thu; dthu += x.da_thu; });
    el("cnSum").innerHTML = ts.length ? '<small>Tổng nợ còn lại (tất cả các tháng)</small><b>' + money(no) + ' đ</b><small>Doanh thu ' + money(dt) + ' · đã thu ' + money(dthu) + '</small>' + (D.cap ? '<small>Cập nhật lúc ' + esc(capVN(D.cap)) + '</small>' : "") : '<small>Chưa có dữ liệu công nợ</small>';
    el("cnList").innerHTML = ts.map(function (x) {
      return '<button type="button" class="dtcard cncard" data-ky="' + esc(x.ky) + '"><div class="hd"><b>Tháng ' + esc(kyVN(x.ky)) + '</b><em class="red">' + money(x.con_no) + '</em></div><div class="sub">' + x.so_khach_no + ' khách còn nợ · doanh thu ' + money(x.doanh_thu) + ' · đã thu ' + money(x.da_thu) + '</div></button>';
    }).join("");
    el("cnList").onclick = function (e) { var c = e.target.closest("[data-ky]"); if (c) { D.ky = c.getAttribute("data-ky"); load(D.ky); } };
  }
  function groups() {
    var q = noAcc(D.q).trim(), map = {}, out = [];
    D.rows.forEach(function (r) {
      if (D.onlyDebt && !(r[6] > 0)) return;
      if (q && noAcc(r[0] + " " + r[1] + " " + r[2]).indexOf(q) < 0) return;
      var g = map[r[0]] || (map[r[0]] = { ten: r[0], no: 0, dt: 0, ds: [] }); g.no += r[6]; g.dt += r[4]; g.ds.push(r);
    });
    Object.keys(map).forEach(function (k) { out.push(map[k]); });
    return out.sort(function (a, b) { return b.no - a.no; });
  }
  function renderMonth() {
    var gs = groups(), no = 0, n = 0; gs.forEach(function (g) { no += g.no; n += g.ds.length; });
    el("cnSum").innerHTML = '<small>Nợ còn lại tháng ' + esc(kyVN(D.ky)) + (D.q ? " (đang lọc)" : "") + '</small><b>' + money(no) + ' đ</b><small>' + gs.length + ' khách · ' + n + ' khoản' + (D.onlyDebt ? " còn nợ" : "") + '</small>' + (D.cap ? '<small>Cập nhật lúc ' + esc(capVN(D.cap)) + '</small>' : "");
    el("cnList").innerHTML = gs.map(function (g, i) {
      var open = D.open[g.ten];
      var h = '<button type="button" class="dtcard cncard" data-g="' + i + '"><div class="hd"><b>' + esc(g.ten) + '</b><em class="red">' + money(g.no) + '</em></div><div class="sub">' + g.ds.length + ' khoản · doanh thu ' + money(g.dt) + (open ? "" : " · bấm để xem chi tiết") + "</div>";
      if (open) h += g.ds.map(function (r) { return '<div class="ln"><span>' + esc(r[1]) + (r[3] ? " · " + esc(r[3]) : "") + " · thu " + money(r[5]) + (r[7] ? " " + esc(r[7]) : "") + '</span><span>' + money(r[6]) + "</span></div>"; }).join("");
      return h + "</button>";
    }).join("") || '<p class="sub" style="margin-top:14px">Không có khách nào khớp.</p>';
    el("cnList").onclick = function (e) { var c = e.target.closest("[data-g]"); if (!c) return; var g = groups()[+c.getAttribute("data-g")]; if (g) { D.open[g.ten] = !D.open[g.ten]; renderMonth(); } };
  }
  function render() { renderMonths(); if (D.ky === "ALL") renderAll(); else renderMonth(); }
  function load(ky) {
    if (!connected()) { setMsg("Chưa kết nối backend"); el("cnSum").innerHTML = "<small>Chưa kết nối</small>"; return Promise.resolve(); }
    D.ky = ky || "ALL"; D.open = {};
    return api("cn.get", { ky: D.ky === "ALL" ? "" : D.ky }).then(function (r) {
      D.thang = r.thang || []; D.rows = r.rows || []; D.cap = r.cap_nhat || ""; setMsg(""); render();
    }, function (e) { el("cnSum").innerHTML = "<small>Không có dữ liệu</small>"; setMsg(/Action không hợp lệ|không hỗ trợ|unknown|Không biết/i.test(e.message) ? "Backend chưa có CongNo.gs (cần dán vào Apps Script và triển khai lại)." : "Không tải được: " + e.message); });
  }
  window.openCongNo = function () {
    D.q = ""; D.open = {}; D.ky = "ALL"; D.onlyDebt = true;
    openSheet('<div id="cnBox"><div class="sh-h"><span class="ic">' + svg("chart") + '</span><div><b>Công nợ theo tháng</b></div></div>' +
      '<p class="sh-d">Tổng nợ còn lại từng tháng và từng khách (từ hệ thống Theo dõi công nợ).</p>' +
      '<div class="cnchips" id="cnKy"></div><div class="cnsum" id="cnSum"><small>Đang tải…</small></div><div id="cnMsg"></div>' +
      '<label class="cnchk"><input type="checkbox" id="cnDebt" checked> Chỉ hiện khoản còn nợ</label>' +
      '<input class="dtq" id="cnQ" type="search" placeholder="Tìm tên khách, mã thuê bao…" autocomplete="off">' +
      '<div id="cnList"></div><button class="btn sec" id="cnClose">Đóng</button></div>');
    el("cnClose").onclick = closeSheet;
    el("cnDebt").onchange = function () { D.onlyDebt = this.checked; if (D.ky !== "ALL") renderMonth(); };
    el("cnQ").oninput = function () { D.q = this.value; if (D.ky !== "ALL") renderMonth(); };
    load("ALL");
  };
})();

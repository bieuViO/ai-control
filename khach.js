/* =====================================================================
 * khach.js (aic, 28/11/2026) – KHUNG CHI TIẾT 1 KHÁCH HÀNG
 * Mở từ: bảng "Hôm nay" của nút AI (Sắp hết hạn, Nợ nhiều nhất) và Gợi ý trong My ViO.
 * Dữ liệu: route chỉ đọc kh.chi_tiet (KhachChiTiet.gs) → HET_HAN, CONG_NO_THANG (do app Theo dõi công nợ đẩy lên), MYVIO_*.
 * Hiện: Dịch vụ + ngày hết hạn, Công nợ từng tháng, Việc đang theo dõi (My ViO).
 * Nút: ➕ Thêm việc My ViO (ghi sổ riêng, R1), 📋 Copy thông tin, mở app Theo dõi công nợ.
 * Dùng chung từ index.html: api, openSheet, el, esc, toast.
 * ===================================================================== */
(function () {
  "use strict";
  var LINK_CN = "https://claude.ai/artifact/JXWt6JKKdSF9NmBWHEdgJg";
  var K = { q: null, d: null, run: 0 };

  var css = document.createElement("style");
  css.textContent =
    ".kh-sub{color:#6B7686;font-size:12px;margin:2px 0 10px}" +
    ".kh-tot{display:flex;gap:8px;margin:0 0 6px}.kh-tot div{flex:1;border-radius:12px;padding:10px 12px;background:#F2F5FA}" +
    ".kh-tot small{display:block;font-size:11px;color:#6B7686}.kh-tot b{font-size:18px}.kh-tot .r b{color:#B23A34}.kh-tot .g b{color:#1E7A46}.kh-tot .a b{color:#C9760B}" +
    ".kh-h{font-weight:700;color:#0B3D91;font-size:13.5px;margin:14px 0 6px;display:flex;justify-content:space-between}.kh-h span{color:#6B7686;font-weight:500;font-size:12px}" +
    ".kh-l>div{display:flex;justify-content:space-between;gap:10px;padding:8px 2px;border-bottom:1px solid #EEF1F5;font-size:13px}" +
    ".kh-l span{min-width:0}.kh-l small{display:block;color:#6B7686;font-size:11.5px}.kh-l em{font-style:normal;white-space:nowrap;text-align:right;font-weight:700}" +
    ".kh-l em small{font-weight:500}.kh-r{color:#B23A34}.kh-g{color:#1E7A46}.kh-a{color:#C9760B}.kh-m{color:#6B7686;font-weight:500}" +
    ".kh-e{color:#6B7686;font-size:12.5px;padding:6px 2px}" +
    ".kh-act{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 4px}.kh-act button,.kh-add button{border:0;border-radius:10px;padding:10px 12px;font:inherit;font-size:13px;font-weight:600;cursor:pointer}" +
    ".kh-act .p{background:#0B3D91;color:#fff}.kh-act .s{background:#EEF2F8;color:#0B3D91}" +
    ".kh-add{display:none;background:#F7F9FC;border:1px solid #E2E6EC;border-radius:12px;padding:10px;margin:6px 0}.kh-add.on{display:block}" +
    ".kh-add input{width:100%;box-sizing:border-box;font:inherit;font-size:14px;padding:9px 10px;border:1px solid #D5DBE4;border-radius:9px}" +
    ".kh-add .pv{font-size:12px;color:#6B7686;margin:6px 0}.kh-add .rw{display:flex;gap:8px;justify-content:flex-end}.kh-add .ok{background:#1E7A46;color:#fff}.kh-add .no{background:#EEF2F8;color:#333}" +
    ".kh-more{border:0;background:none;color:#0B3D91;font:inherit;font-size:12.5px;padding:6px 2px;cursor:pointer}";
  document.head.appendChild(css);

  function money(n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ"; }
  function kyVN(k) { var m = /^(\d{4})-(\d{2})/.exec(k || ""); return m ? m[2] + "/" + m[1] : (k || ""); }
  function dVN(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ""); return m ? m[3] + "/" + m[2] + "/" + m[1] : (d || ""); }
  function ngay(n) { return n == null ? "" : n < 0 ? "quá " + (-n) + " ngày" : n === 0 ? "hết hạn hôm nay" : "còn " + n + " ngày"; }
  function cls(n) { return n == null ? "kh-m" : n < 0 ? "kh-r" : n <= 30 ? "kh-a" : "kh-g"; }
  function hanLbl(h) { if (!h) return "chưa có hạn"; var p = h.split(" "); return dVN(p[0]) + (p[1] ? " " + p[1] : ""); }
  function dvName(x) { return (x.dv ? String(x.dv).toUpperCase() : "") + (x.goi ? (x.dv ? " · " : "") + x.goi : ""); }

  /** Mở khung chi tiết khách. q = {khach, mst} */
  window.openKhach = function (q) {
    if (!q || (!q.khach && !q.mst)) return;
    K.q = q; K.d = null; var run = ++K.run;
    openSheet('<div id="khBox"><div class="sh-h"><span class="ic">👤</span><div><b>Chi tiết khách hàng</b></div></div>' +
      '<div style="font-weight:700;font-size:15px;line-height:1.35;margin-top:4px">' + esc(q.khach || q.mst) + '</div><div class="kh-sub">Đang tải dữ liệu…</div></div>');
    api("kh.chi_tiet", { khach: q.khach || "", mst: q.mst || "" }).then(function (r) {
      if (run !== K.run) return; K.d = r; render();
    }).catch(function (err) {
      if (run !== K.run) return; var b = el("khBox"); if (!b) return;
      var s = b.querySelector(".kh-sub");
      if (s) s.textContent = /không hợp lệ|kh\.chi_tiet/i.test(err.message) ? "Backend chưa có KhachChiTiet.gs (cần triển khai bản mới)." : "Không tải được: " + err.message;
    });
  };

  function suggest(d) {
    var hs = (d.dich_vu || []).filter(function (x) { return x.con_ngay != null && x.con_ngay <= 30; })[0];
    if (hs) return "Gọi gia hạn " + (hs.goi || String(hs.dv || "").toUpperCase()) + " – " + d.ten + " mai";
    if (d.cong_no && d.cong_no.tong > 0) return "Nhắc nợ " + d.ten + " – " + money(d.cong_no.tong) + " mai";
    return "Theo dõi " + d.ten + " 3 ngày nữa";
  }

  function render(showAllKy) {
    var b = el("khBox"), d = K.d; if (!b || !d) return;
    var dv = d.dich_vu || [], cn = d.cong_no || { tong: 0, ky: [] }, kyNo = cn.ky.filter(function (x) { return x.con_no > 0; });
    var sap = dv.filter(function (x) { return x.con_ngay != null && x.con_ngay <= 30; }).length;
    var h = '<div class="sh-h"><span class="ic">👤</span><div><b>Chi tiết khách hàng</b></div></div>' +
      '<div style="font-weight:700;font-size:15px;line-height:1.35;margin-top:4px">' + esc(d.ten) + "</div>" +
      '<div class="kh-sub">' + (d.mst.length ? "MST " + esc(d.mst.join(" · ")) : "Chưa có MST") + "</div>" +
      '<div class="kh-tot"><div class="' + (cn.tong > 0 ? "r" : "g") + '"><small>Còn nợ</small><b>' + (cn.tong > 0 ? money(cn.tong) : "0 đ") + "</b><small>" + kyNo.length + " kỳ chưa thu</small></div>" +
      '<div class="' + (sap ? "a" : "g") + '"><small>Dịch vụ</small><b>' + dv.length + "</b><small>" + (sap ? sap + " sắp/đã hết hạn" : "không có sắp hết hạn") + "</small></div></div>";

    // Dịch vụ + ngày hết hạn (sắp hết hạn lên đầu)
    h += '<div class="kh-h">Dịch vụ & ngày hết hạn<span>' + dv.length + "</span></div><div class=\"kh-l\">";
    h += dv.length ? dv.map(function (x) {
      return "<div><span>" + esc(dvName(x) || "Dịch vụ") + "<small>" + esc(x.ma || "") + (x.gt ? " · GT: " + esc(x.gt) : "") + (x.ghi ? " · " + esc(x.ghi) : "") + "</small></span>" +
        '<em class="' + cls(x.con_ngay) + '">' + esc(dVN(x.han) || "—") + (x.uoc_tinh ? "~" : "") + "<small>" + ngay(x.con_ngay) + "</small></em></div>";
    }).join("") : '<div class="kh-e">Chưa có dịch vụ trong bảng hết hạn.</div>';
    h += "</div>";

    // Công nợ từng tháng (kỳ còn nợ trước, sau đó các kỳ đã thu gần nhất)
    var ds = kyNo.concat(cn.ky.filter(function (x) { return x.con_no <= 0; })), lim = showAllKy ? ds.length : 8;
    h += '<div class="kh-h">Công nợ từng tháng<span>' + cn.ky.length + " khoản</span></div><div class=\"kh-l\">";
    h += ds.length ? ds.slice(0, lim).map(function (x) {
      var no = x.con_no > 0;
      return "<div><span>Kỳ " + esc(kyVN(x.ky)) + "<small>" + esc([x.goi, x.tk].filter(Boolean).join(" · ")) + " · DT " + money(x.doanh_thu) + (x.da_thu ? " · đã thu " + money(x.da_thu) : "") + "</small></span>" +
        '<em class="' + (no ? "kh-r" : "kh-g") + '">' + (no ? money(x.con_no) : "✓ Đã thu") + "<small>" + (no ? "còn nợ" : esc(x.ngay_thu || "")) + "</small></em></div>";
    }).join("") : '<div class="kh-e">Không có trong bảng công nợ theo tháng.</div>';
    h += "</div>" + (ds.length > lim ? '<button type="button" class="kh-more" data-k="all">Xem thêm ' + (ds.length - lim) + " khoản ›</button>" : "");

    // Việc đang theo dõi (My ViO)
    var vs = d.viec || [], gc = d.ghi_chu || [];
    h += '<div class="kh-h">Việc đang theo dõi<span>' + vs.length + "</span></div><div class=\"kh-l\">";
    h += vs.length ? vs.map(function (v) {
      return "<div><span>" + (v.loai === "theo_doi" ? "👀 " : "☐ ") + esc(v.tieu_de) + (v.ghi_chu ? "<small>" + esc(String(v.ghi_chu).slice(0, 120)) + "</small>" : "") + "</span>" +
        '<em class="kh-m">' + esc(hanLbl(v.han)) + "</em></div>";
    }).join("") : '<div class="kh-e">Chưa có việc nào cho khách này.</div>';
    h += gc.slice(0, 3).map(function (n) { return "<div><span>📝 " + esc(String(n.noi_dung).slice(0, 160)) + '</span><em class="kh-m"><small>' + esc(String(n.luc || "").slice(0, 10)) + "</small></em></div>"; }).join("");
    h += "</div>";

    // Nút thao tác
    h += '<div class="kh-add" id="khAdd"><input id="khIn" maxlength="200" value="' + esc(suggest(d)) + '"><div class="pv" id="khPv"></div>' +
      '<div class="rw"><button type="button" class="no" data-k="addx">Hủy</button><button type="button" class="ok" data-k="addok">Thêm việc</button></div></div>' +
      '<div class="kh-act"><button type="button" class="p" data-k="add">➕ Thêm việc My ViO</button><button type="button" class="s" data-k="copy">📋 Copy thông tin</button>' +
      '<button type="button" class="s" data-k="cn">Mở Theo dõi công nợ ›</button></div>';
    b.innerHTML = h;
    b.onclick = onClick;
    var inp = el("khIn"); if (inp) inp.oninput = preview;
  }

  function preview() {
    var inp = el("khIn"), pv = el("khPv"); if (!inp || !pv) return;
    if (typeof window.mvParse !== "function") { pv.textContent = "Hạn: không có"; return; }
    var p = window.mvParse(inp.value || "");
    pv.textContent = "Tên việc: " + (p.tieu_de || "—") + " · Hạn: " + hanLbl(p.han) + (p.uu_tien === "cao" ? " · gấp" : "") + (p.loai === "theo_doi" ? " · theo dõi" : "");
  }

  function onClick(e) {
    var t = e.target.closest("[data-k]"); if (!t) return; var k = t.getAttribute("data-k"), d = K.d; if (!d) return;
    if (k === "all") render(true);
    else if (k === "add") { var a = el("khAdd"); a.classList.add("on"); preview(); var i = el("khIn"); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
    else if (k === "addx") el("khAdd").classList.remove("on");
    else if (k === "addok") addTask(t);
    else if (k === "copy") copyInfo();
    else if (k === "cn") { var x = document.createElement("a"); x.href = LINK_CN; x.target = "_blank"; x.rel = "noopener"; document.body.appendChild(x); x.click(); x.remove(); }
  }

  /** Thêm việc vào My ViO, gắn tên khách + MST (sổ riêng của anh, ghi ngay) */
  function addTask(btn) {
    var d = K.d, txt = (el("khIn").value || "").trim(); if (!txt) { toast("Nhập nội dung việc"); return; }
    var p = typeof window.mvParse === "function" ? window.mvParse(txt) : { tieu_de: txt, loai: "viec", uu_tien: "tb" };
    var v = { loai: p.loai || "viec", tieu_de: p.tieu_de || txt, han: p.han || "", lap: p.lap || "", uu_tien: p.uu_tien || "tb", nhom: "VNPT", khach: d.ten, mst: d.mst[0] || "" };
    btn.disabled = true; btn.textContent = "Đang lưu…";
    api("mv.save", { viec: v }).then(function (r) {
      var nv = r.viec || v;
      try { var M = window.mvData && window.mvData(); if (M && M.viec) { M.viec.push(nv); if (window.mvBadge) window.mvBadge(); } } catch (e) {}
      d.viec = [{ id: nv.id, loai: nv.loai, tieu_de: nv.tieu_de, han: nv.han }].concat(d.viec || []);
      toast("Đã thêm vào My ViO"); render();
    }).catch(function (err) { btn.disabled = false; btn.textContent = "Thêm việc"; toast("Lỗi: " + err.message); });
  }

  /** Copy tên, MST, SĐT, email, nợ từng kỳ, dịch vụ sắp hết hạn – để dán Zalo/ghi chú */
  function copyInfo() {
    var d = K.d, cn = d.cong_no || { tong: 0, ky: [] }, L = [d.ten];
    if (d.mst.length) L.push("MST: " + d.mst.join(", "));
    if (d.sdt) L.push("SĐT: " + d.sdt);
    if (d.email) L.push("Email: " + d.email);
    var no = cn.ky.filter(function (x) { return x.con_no > 0; });
    L.push("Công nợ: " + (cn.tong > 0 ? money(cn.tong) : "không còn nợ"));
    no.slice(0, 12).forEach(function (x) { L.push("- Kỳ " + kyVN(x.ky) + (x.goi ? " (" + x.goi + ")" : "") + ": " + money(x.con_no)); });
    var hs = (d.dich_vu || []).filter(function (x) { return x.con_ngay != null && x.con_ngay <= 30; });
    if (hs.length) { L.push("Dịch vụ sắp/đã hết hạn:"); hs.forEach(function (x) { L.push("- " + dvName(x) + ": " + dVN(x.han) + " (" + ngay(x.con_ngay) + ")"); }); }
    var s = L.join("\n");
    var ok = function () { toast("Đã copy thông tin khách"); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(ok, function () { fallback(s); ok(); });
    else { fallback(s); ok(); }
  }
  function fallback(s) { var t = document.createElement("textarea"); t.value = s; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} t.remove(); }
})();

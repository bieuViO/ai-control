/* BỘ NÃO – nút "AI" trung tâm (brain.js, aic-v68, 12/11/2026)
   Bấm nút AI → màn "Hôm nay" (brain.today, không dùng AI) + ô hỏi/ra lệnh (brain.ask: AI gọi tool đọc dữ liệu,
   tra Internet, và chuẩn bị lệnh cho các node). Việc ghi/gửi: chỉ hiện nút mở form node đã điền sẵn – anh tự bấm Gửi.
   Backend: Brain.gs. Lỗi bộ não → quay về cách cũ (legacyCmd: ai.parse / tra công nợ). */
"use strict";
(function () {
  var stl = document.createElement("style");
  stl.textContent =
    ".brgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}" +
    ".brc{background:#fff;border:1px solid var(--line);border-radius:14px;padding:10px 12px;text-align:left;font:inherit;color:inherit;cursor:pointer}" +
    ".brc small{display:block;color:var(--mute);font-size:12px}.brc b{display:block;font-size:18px;color:var(--blue);margin-top:2px}" +
    ".brc.red b{color:#B23A34}.brc.amb b{color:#A15C00}.brc.ok b{color:#1E7B45}.brc i{font-style:normal;font-size:12px;color:var(--mute)}" +
    ".brlist{margin-top:8px;font-size:13px}.brlist div{display:flex;justify-content:space-between;gap:8px;padding:6px 2px;border-bottom:1px solid var(--line)}" +
    ".brlist span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.brlist em{font-style:normal;font-weight:700;white-space:nowrap}" +
    ".brh{margin:14px 0 4px;font-size:13px;font-weight:700;color:var(--blue)}" +
    ".brchat{margin-top:12px;display:flex;flex-direction:column;gap:8px}" +
    ".brm{max-width:92%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-break:break-word}" +
    ".brm.u{align-self:flex-end;background:var(--blue);color:#fff;border-bottom-right-radius:4px}" +
    ".brm.a{align-self:flex-start;background:var(--blue-soft);color:#12326B;border-bottom-left-radius:4px}" +
    ".brm .st{display:block;margin-top:6px;font-size:11px;opacity:.75}.brm a{color:var(--blue-2)}" +
    ".brm .bract{display:block;margin-top:8px;width:100%;border:0;border-radius:10px;padding:9px;background:var(--blue);color:#fff;font:inherit;font-weight:700;cursor:pointer}" +
    ".brask{display:flex;gap:6px;align-items:center;margin-top:10px;padding:4px 0 6px}" +
    ".brask input{flex:1;min-width:0;border:1px solid var(--line);border-radius:999px;padding:11px 14px;font:inherit;font-size:15px}" +
    ".brask button{width:44px;height:44px;border-radius:50%;border:0;display:grid;place-items:center;flex:none;cursor:pointer}" +
    ".brsug{display:flex;gap:6px;overflow-x:auto;margin-top:8px;scrollbar-width:none}.brsug::-webkit-scrollbar{display:none}" +
    ".brsug button{flex:0 0 auto;border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 12px;font:inherit;font-size:13px;color:var(--blue);cursor:pointer}";
  document.head.appendChild(stl);

  var B = { hist: [], today: null, busy: false };       // hist: [{r:'u'|'a', t}] – nhớ ngữ cảnh trong phiên
  var SUG = ["Hôm nay có việc gì cần làm?", "Việc của tôi hôm nay", "Nhắc tôi ", "Tổng nợ còn bao nhiêu?", "Khách nào sắp hết hạn?", "Doanh thu tháng này?", "Báo giá VAN 100 cho MST "];
  function money(n) { return fmtMoney(Math.round(n || 0)) + " đ"; }
  function tr(n) { n = Math.round(n || 0); return n >= 1e6 ? (n / 1e6).toFixed(1).replace(".", ",").replace(/,0$/, "") + " tr" : fmtMoney(n); }
  function nodeName(id) { var t = toolById(id); return t ? t.name : id; }
  function md(s) {   // định dạng tối giản: **đậm**, link http
    return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">link</a>');
  }

  /* ---------- màn chính ---------- */
  window.openBrain = function (ask) {
    var h = '<div class="sh-h"><span class="ic">' + svg("spark") + '</span><div><b>AI Control – Hôm nay</b></div></div>' +
      '<p class="sh-d" id="brSub">Đang tổng hợp…</p><div id="brToday"></div>' +
      '<div class="brchat" id="brChat"></div>' +
      '<div class="brsug" id="brSug">' + SUG.map(function (s, i) { return '<button type="button" data-s="' + i + '">' + esc(s) + "</button>"; }).join("") + "</div>" +
      '<form class="brask" id="brForm" autocomplete="off"><input id="brIn" placeholder="Hỏi hoặc ra lệnh cho các node…">' +
      '<button type="button" class="btn-mic" id="brMic">' + svg("mic") + '</button><button type="submit" class="btn-go">' + svg("send") + "</button></form>";
    openSheet(h);
    renderChat();
    el("brSug").onclick = function (e) {
      var b = e.target.closest("[data-s]"); if (!b) return; var s = SUG[+b.getAttribute("data-s")];
      if (/(MST|tôi) $/.test(s)) { el("brIn").value = s; el("brIn").focus(); } else send(s);
    };
    el("brForm").onsubmit = function (e) { e.preventDefault(); var v = el("brIn").value.trim(); if (v) { el("brIn").value = ""; send(v); } };
    wireMic();
    if (!connected()) { el("brSub").textContent = "Chưa kết nối backend (Cài đặt)."; return; }
    loadToday();
    if (ask) send(ask);
  };

  function loadToday() {
    api("brain.today", {}).then(function (r) { B.today = r; renderToday(); })
      .catch(function (err) {
        var s = el("brSub"); if (!s) return;
        s.textContent = /không hợp lệ|brain\.today/i.test(err.message) ? "Backend chưa có Brain.gs (cần triển khai bản mới)." : "Không tải được: " + err.message;
      });
  }

  function renderToday() {
    var r = B.today, box = el("brToday"); if (!r || !box) return;
    var ht = r.he_thong || {}, may = ht.may || {}, cn = r.cong_no || {}, dt = r.doanh_thu || {}, hh = r.het_han || {};
    var ag = may.agent, ex = may.ext, onl = function (x, lim) { return x && x.giay_truoc < lim; };
    el("brSub").textContent = "Cập nhật " + (r.luc || "") + " · Máy tính " + (onl(ag, 90) ? "✓" : "✗") + " · Chrome " + (onl(ex, 180) ? "✓" : "✗");
    var cho = (ht.cho_xac_nhan || []).length, loi = (ht.loi_24h || []).length;
    var h = '<div class="brgrid">' +
      '<button type="button" class="brc ' + (cho ? "amb" : "ok") + '" data-go="act"><small>Chờ anh xác nhận</small><b>' + cho + '</b><i>' + (loi ? loi + " lệnh lỗi 24h" : "không có lỗi") + "</i></button>" +
      '<button type="button" class="brc red" data-go="bc_cong_no"><small>Tổng nợ còn lại</small><b>' + (cn.loi ? "—" : tr(cn.tong_con_no)) + '</b><i>' + (cn.so_khach_no || 0) + " khách</i></button>" +
      '<button type="button" class="brc" data-go="bc_doanh_thu"><small>Doanh thu ' + esc((dt.ky || "").split("-").reverse().join("/")) + '</small><b>' + (dt.loi ? "—" : tr(dt.tong_tien)) + '</b><i>' + (dt.so_khach || 0) + " khách</i></button>" +
      '<button type="button" class="brc ' + (hh.tong ? "amb" : "ok") + '" data-go="hh"><small>Sắp hết hạn (30 ngày)</small><b>' + (hh.tong || 0) + '</b><i>' + (hh.da_het_han ? hh.da_het_han + " đã hết hạn" : "khách") + "</i></button></div>";
    if (cho) h += '<div class="brh">Chờ xác nhận</div><div class="brlist">' + ht.cho_xac_nhan.map(function (j) { return '<div data-j="' + esc(j.id) + '"><span>' + esc(nodeName(j.tool)) + "</span><em>" + esc(j.luc) + "</em></div>"; }).join("") + "</div>";
    if (loi) h += '<div class="brh">Lỗi 24 giờ qua</div><div class="brlist">' + ht.loi_24h.map(function (j) { return '<div data-j="' + esc(j.id) + '"><span>' + esc(nodeName(j.tool) + ": " + j.ket_qua) + "</span><em>" + esc(j.luc) + "</em></div>"; }).join("") + "</div>";
    if (hh.danh_sach && hh.danh_sach.length) h += '<div class="brh" id="brHH">Sắp hết hạn</div><div class="brlist">' + hh.danh_sach.slice(0, 6).map(function (x) {
      return "<div><span>" + esc(x.khach) + " · " + esc(x.goi) + "</span><em>" + (x.con_ngay < 0 ? "quá " + (-x.con_ngay) + " ngày" : "còn " + x.con_ngay + " ngày") + "</em></div>"; }).join("") + "</div>";
    if (cn.top && cn.top.length) h += '<div class="brh">Nợ nhiều nhất</div><div class="brlist">' + cn.top.slice(0, 5).map(function (x) { return "<div><span>" + esc(x.khach) + "</span><em>" + money(x.con_no) + "</em></div>"; }).join("") + "</div>";
    box.innerHTML = h;
    box.onclick = function (e) {
      var g = e.target.closest("[data-go]"); if (!g) return; var k = g.getAttribute("data-go");
      if (k === "act") openActivity(); else if (k === "hh") { var a = el("brHH"); if (a) a.scrollIntoView({ behavior: "smooth" }); else send("Khách nào sắp hết hạn?"); }
      else openTool(toolById(k));
    };
  }

  /* ---------- hỏi đáp ---------- */
  function renderChat() {
    var c = el("brChat"); if (!c) return;
    c.innerHTML = B.hist.map(function (m, i) {
      if (m.r === "u") return '<div class="brm u">' + esc(m.t) + "</div>";
      var h = '<div class="brm a">' + md(m.t);
      (m.act || []).forEach(function (a, k) { h += '<button type="button" class="bract" data-m="' + i + '" data-k="' + k + '">Mở “' + esc(nodeName(a.node)) + "” (đã điền sẵn) ›</button>"; });
      if (m.src && m.src.length) h += '<span class="st">Nguồn: ' + m.src.map(function (s) { return '<a href="' + esc(s.uri) + '" target="_blank" rel="noopener">' + esc(s.title || "link") + "</a>"; }).join(" · ") + "</span>";
      if (m.steps && m.steps.length) h += '<span class="st">Đã dùng: ' + esc(m.steps.join(", ")) + "</span>";
      return h + "</div>";
    }).join("") + (B.busy ? '<div class="brm a" id="brWait">Đang suy nghĩ…</div>' : "");
    c.onclick = function (e) {
      var b = e.target.closest(".bract"); if (!b) return;
      var a = B.hist[+b.getAttribute("data-m")].act[+b.getAttribute("data-k")]; openNode(a);
    };
    var w = el("brWait") || c.lastElementChild; if (w && w.scrollIntoView) w.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  /* ---------- LỆNH NHANH: chạy ngay, KHÔNG cần Gemini (Gemini hay quá tải) ----------
     Trả true nếu đã xử lý. Câu khác mới gửi cho bộ não (Gemini). */
  function nz(x) { return String(x || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/\s+/g, " ").trim(); }
  function say(text, t, act) { B.hist.push({ r: "u", t: text }); B.hist.push({ r: "a", t: t, act: act || [], steps: ["lệnh nhanh"] }); renderChat(); }
  function quick(text) {
    var n = nz(text), m, T = B.today || {};
    // 0) My ViO: "nhắc tôi …", "thêm việc …", "theo dõi …" → tạo việc; "ghi chú: …" → ghi chú; "việc của tôi / hôm nay tôi có việc gì" → đọc
    if (typeof window.mvAdd === "function") {
      if ((m = n.match(/^(?:ghi chu|ghi lai|note)\s*[:\-]?\s+(.+)$/))) {
        var nt = text.trim().replace(/^(ghi\s+ch[uú]|ghi\s+l[aạ]i|note)\s*[:\-]?\s*/i, "");
        say(text, "Đang lưu ghi chú…");
        window.mvNote(nt).then(function () { B.hist[B.hist.length - 1].t = "Đã lưu ghi chú: “" + nt + "”."; B.hist[B.hist.length - 1].act = [{ type: "mo_node", node: "my_vio", params: {} }]; renderChat(); })
          .catch(function (e) { B.hist[B.hist.length - 1].t = "Lỗi lưu ghi chú: " + e.message; renderChat(); });
        return true;
      }
      if (/^(nhac (toi|anh|em|minh)|them viec|tao viec|viec\s*:|theo doi\s)/.test(n)) {
        say(text, "Đang thêm vào My ViO…");
        window.mvAdd(text).then(function (r) {
          var v = r.viec, lb = v.han ? v.han.split(" ").reverse().join(" ") : "không hạn";
          B.hist[B.hist.length - 1].t = "Đã thêm " + (v.loai === "theo_doi" ? "theo dõi" : "việc") + ": **" + v.tieu_de + "** – hạn " + lb + (v.lap ? " (lặp " + { ngay: "hằng ngày", tuan: "hằng tuần", thang: "hằng tháng" }[v.lap] + ")" : "") + ". Nhắc trong app (số đỏ trên nút My ViO).";
          B.hist[B.hist.length - 1].act = [{ type: "mo_node", node: "my_vio", params: {} }]; renderChat();
        }).catch(function (e) { B.hist[B.hist.length - 1].t = "Lỗi thêm việc: " + e.message; renderChat(); });
        return true;
      }
      if (/(viec cua toi|toi co viec gi|viec hom nay|viec can lam|qua han)/.test(n) && window.mvData) {
        var D = window.mvData(), now = new Date(), t0 = new Date(); t0.setHours(0, 0, 0, 0);
        var due = function (v) { var mm = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?$/.exec(v.han || ""); return mm ? new Date(+mm[1], +mm[2] - 1, +mm[3], mm[4] ? +mm[4] : 23, mm[5] ? +mm[5] : 59) : null; };
        var qh = D.viec.filter(function (v) { var d = due(v); return d && d < now; }), hn = D.viec.filter(function (v) { var d = due(v); return d && d >= now && d < new Date(t0.getTime() + 864e5); });
        say(text, "My ViO – " + qh.length + " việc quá hạn, " + hn.length + " việc hôm nay:" + qh.concat(hn).slice(0, 10).map(function (v) { return "\n• " + (due(v) < now ? "❗ " : "") + v.tieu_de + (v.han.indexOf(" ") > 0 ? " (" + v.han.split(" ")[1] + ")" : ""); }).join("") + (D.viec.length ? "" : "\nChưa có việc nào."), [{ type: "mo_node", node: "my_vio", params: {} }]);
        return true;
      }
    }
    // 1) Mở / tìm thư mục, file, hồ sơ trên máy tính → My Computer tìm sẵn
    m = n.match(/^(?:mo|tim|lay|xem|kiem)\s+(?:(?:cai|giup|cho|toi|anh)\s+)*(?:folder|thu muc|file|tep|ho so|tai lieu)\s+(.+)$/) ||
        n.match(/^(?:mo|tim|lay)\s+(.+?)\s+(?:folder|thu muc)$/);
    if (m) {
      var ow = text.trim().split(/\s+/), nw = n.split(" "), mw = m[1].split(" "), at = 0;   // lấy lại đúng các từ gốc (giữ dấu)
      for (var i = 0; i + mw.length <= nw.length; i++) if (nw.slice(i, i + mw.length).join(" ") === m[1]) { at = i; break; }
      var q = ow.slice(at, at + mw.length).join(" ");
      say(text, "Mở My Computer và tìm “" + q + "” trên máy tính (ổ D, Downloads, Desktop).", [{ type: "mo_node", node: "tim_file", params: { q: q } }]);
      setTimeout(function () { openTool(toolById("tim_file"), { q: q }); }, 500); return true;
    }
    // 2) Hỏi nợ theo tên / MST → tra thẳng
    if (/^[\d\s\-]{9,}$/.test(text) || (/(^|\s)no(\s|$|\?)/.test(n) && !/nhac|gui|mail|zalo|tong no|tat ca/.test(n))) {
      say(text, "Tra công nợ trực tiếp…"); setTimeout(function () { cnTra(text); }, 300); return true;
    }
    // 3) Tổng nợ / hôm nay / hết hạn / doanh thu → trả lời từ bảng Hôm nay
    if (/tong no|no con bao nhieu|cong no thang/.test(n) && T.cong_no) {
      var c = T.cong_no; say(text, "Tổng nợ còn lại: **" + fmtMoney(c.tong_con_no || 0) + " đ** của " + (c.so_khach_no || 0) + " khách." + (c.top || []).slice(0, 5).map(function (x, i) { return "\n" + (i + 1) + ". " + x.khach + ": " + fmtMoney(x.con_no) + " đ"; }).join(""), [{ type: "mo_node", node: "bc_cong_no", params: {} }]); return true;
    }
    if (/het han|sap het|gia han/.test(n) && T.het_han) {
      var h = T.het_han; say(text, h.tong + " dịch vụ sắp/vừa hết hạn trong 30 ngày (" + (h.da_het_han || 0) + " đã quá hạn):" + (h.danh_sach || []).slice(0, 8).map(function (x) { return "\n• " + x.khach + " – " + x.goi + " – " + (x.con_ngay < 0 ? "quá " + (-x.con_ngay) + " ngày" : "còn " + x.con_ngay + " ngày") + (x.sdt ? " – " + x.sdt : ""); }).join("")); return true;
    }
    if (/doanh thu/.test(n) && T.doanh_thu && !/\d{1,2}\s*\/\s*\d{4}|thang\s+\d/.test(n)) {
      var d = T.doanh_thu; say(text, "Doanh thu " + String(d.ky || "").split("-").reverse().join("/") + ": **" + fmtMoney(d.tong_tien || 0) + " đ** từ " + (d.so_khach || 0) + " khách.", [{ type: "mo_node", node: "bc_doanh_thu", params: {} }]); return true;
    }
    if (/hom nay|viec gi|can lam/.test(n) && T.he_thong) {
      var ht = T.he_thong, cn = T.cong_no || {}, hh = T.het_han || {};
      var mvc = ""; if (window.mvData) { var MD = window.mvData(), nw = new Date(); var dueN = function (v) { var mm = /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}))?$/.exec(v.han || ""); return mm ? new Date(+mm[1], +mm[2] - 1, +mm[3], mm[4] ? +mm[4] : 23, mm[5] ? +mm[5] : 59) : null; };
        var e0 = new Date(); e0.setHours(23, 59, 59, 999); var qh2 = MD.viec.filter(function (v) { var d = dueN(v); return d && d < nw; }).length, hn2 = MD.viec.filter(function (v) { var d = dueN(v); return d && d >= nw && d <= e0; }).length;
        mvc = "\n• My ViO: " + hn2 + " việc hôm nay, " + qh2 + " quá hạn"; }
      say(text, "Hôm nay:" + mvc + "\n• Chờ anh xác nhận: " + (ht.cho_xac_nhan || []).length + " lệnh\n• Lệnh lỗi 24h: " + (ht.loi_24h || []).length + "\n• Nợ còn lại: " + fmtMoney(cn.tong_con_no || 0) + " đ (" + (cn.so_khach_no || 0) + " khách)\n• Sắp hết hạn 30 ngày: " + (hh.tong || 0) + " (" + (hh.da_het_han || 0) + " đã quá hạn)\nXem chi tiết ở bảng phía trên."); return true;
    }
    // 4) Nhắc nợ
    if (/nhac no/.test(n)) {
      var act = /gui lai/.test(n) ? "gui_lai" : (/gui|mail/.test(n) ? "gui_mail" : "tinh_hinh");
      say(text, act === "tinh_hinh" ? "Mở Nhắc nợ – xem tình hình." : "Mở Nhắc nợ – gửi mail. Anh tick chọn khách rồi mới bấm Gửi.", [{ type: "mo_node", node: "nhac_no", params: { act: act } }]);
      setTimeout(function () { openTool(toolById("nhac_no"), { act: act }); }, 500); return true;
    }
    return false;
  }

  var BR_TIMEOUT = 45;   // giây: Gemini quá tải thì không bắt anh chờ mãi
  function send(text) {
    if (B.busy) return; if (!connected()) { toast("Cần kết nối backend (Cài đặt)"); return; }
    try { if (quick(text)) return; } catch (e) { /* lệnh nhanh lỗi → để bộ não xử lý */ }
    var hist = B.hist.slice(-6).map(function (m) { return { r: m.r, t: m.t }; });
    B.hist.push({ r: "u", t: text }); B.busy = true; renderChat();
    var t0 = Date.now(), done = false;
    var tick = setInterval(function () { var w = el("brWait"); if (w) w.textContent = "Đang suy nghĩ… " + Math.round((Date.now() - t0) / 1000) + " giây"; }, 1000);
    var finish = function (msg) { if (done) return false; done = true; clearInterval(tick); B.busy = false; if (msg) { B.hist.push(msg); renderChat(); } return true; };
    var isDebt = /^[\d\s\-]{9,}$/.test(text) || (/(^|[\s,.?!:;])nợ($|[\s,.?!:;])/i.test(text) && !/nhắc|gửi|mail|zalo/i.test(text));
    var timer = setTimeout(function () {
      if (!finish({ r: "a", t: "Gemini đang chậm hoặc quá tải (đã chờ " + BR_TIMEOUT + " giây). Anh thử lại sau ít phút. Số liệu ở bảng Hôm nay vẫn xem được bình thường." + (isDebt ? "\nTôi tra công nợ trực tiếp (không cần Gemini)…" : "") })) return;
      if (isDebt && typeof cnTra === "function") setTimeout(function () { cnTra(text); }, 600);
    }, BR_TIMEOUT * 1000);
    api("brain.ask", { text: text, hist: hist }).then(function (r) {
      clearTimeout(timer);
      if (!finish({ r: "a", t: r.tra_loi || "", act: r.hanh_dong || [], src: r.nguon || [], steps: r.buoc || [] })) return;
      // Chỉ 1 việc cần mở và AI không hỏi lại gì → mở luôn form đã điền sẵn (anh vẫn phải tự bấm Gửi)
      var a = r.hanh_dong || []; if (a.length === 1 && !/\?\s*$/.test(r.tra_loi || "")) setTimeout(function () { openNode(a[0]); }, 900);
    }).catch(function (err) {
      clearTimeout(timer);
      if (!finish({ r: "a", t: "Bộ não đang lỗi (" + err.message + ")." + (isDebt ? " Tôi tra công nợ trực tiếp." : " Anh thử lại sau ít phút.") })) return;
      if (isDebt && typeof cnTra === "function") setTimeout(function () { cnTra(text); }, 600);
      else if (/không hợp lệ/i.test(err.message) && typeof legacyCmd === "function") setTimeout(function () { legacyCmd(text); }, 600);   // backend chưa có Brain.gs → cách cũ
    });
  }

  /* Mở node theo lệnh của bộ não (giống ô lệnh cũ: điền sẵn, anh tự bấm Gửi) */
  function openNode(a) {
    var t = toolById(a.node); if (!t) { toast("Không có node " + a.node); return; }
    var pre = Object.assign({}, a.params || {});
    if (t.id === "hop_dong_web" && pre.dich_vu && !pre.nhom_dv) {
      var m = String(pre.dich_vu).match(/^BHXH VAN (\S+) - (\d+) tháng$/);
      if (m) { pre.nhom_dv = "BHXH VAN"; pre.van_goi = m[1]; pre.van_thang = m[2]; } else pre.nhom_dv = pre.dich_vu;
    }
    openTool(t, Object.keys(pre).length ? pre : undefined, a.thieu || []);
  }

  function wireMic() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, b = el("brMic"); if (!b) return;
    if (!SR) { b.style.display = "none"; return; }
    var rec = null;
    b.onclick = function () {
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = "vi-VN"; rec.interimResults = false; b.classList.add("rec");
      rec.onresult = function (ev) { el("brIn").value = ev.results[0][0].transcript; };
      rec.onend = function () { b.classList.remove("rec"); rec = null; var v = el("brIn") && el("brIn").value.trim(); if (v) { el("brIn").value = ""; send(v); } };
      rec.onerror = function () { b.classList.remove("rec"); rec = null; toast("Không nghe được, thử lại"); };
      try { rec.start(); } catch (e) { b.classList.remove("rec"); rec = null; }
    };
  }
})();

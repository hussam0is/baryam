(function () {
  "use strict";

  var C = window.BARYAM;
  var LANGS = ["he", "en"];
  var lang = pickLang();
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function t(key, vars) {
    var s = (C.text[lang] && C.text[lang][key]) || C.text.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }

  function pickLang() {
    var fromUrl = new URLSearchParams(location.search).get("lang");
    if (LANGS.indexOf(fromUrl) > -1) return fromUrl;
    try {
      var saved = localStorage.getItem("baryam-lang");
      if (LANGS.indexOf(saved) > -1) return saved;
    } catch (e) { /* storage blocked */ }
    return "he";
  }

  // ---- Time in Israel, whatever the visitor's clock says ----
  function israelToday() {
    var parts = {};
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return { iso: parts.year + "-" + parts.month + "-" + parts.day, day: days.indexOf(parts.weekday) };
  }

  function dayName(i) {
    // 1 Jan 2023 was a Sunday
    return new Intl.DateTimeFormat(lang === "he" ? "he-IL" : "en-GB", { weekday: "long", timeZone: "UTC" })
      .format(new Date(Date.UTC(2023, 0, 1 + i)));
  }

  function prettyDate(iso) {
    var d = new Date(iso + "T12:00:00Z");
    return new Intl.DateTimeFormat(lang === "he" ? "he-IL" : "en-GB", {
      weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
    }).format(d);
  }

  // ---- Rendering ----
  function render() {
    var root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "he" ? "rtl" : "ltr";
    document.title = lang === "he" ? "בר ים · BarYam" : "BarYam · בר ים";

    $$("[data-t]").forEach(function (el) { el.textContent = t(el.getAttribute("data-t")); });
    $$("[data-t-placeholder]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-t-placeholder")); });
    $("#lang").setAttribute("aria-label", t("langSwitchLabel"));
    $("#lang").setAttribute("lang", lang === "he" ? "en" : "he");
    $$(".done").forEach(function (el) { el.textContent = ""; });
    $$(".err").forEach(function (el) { el.textContent = ""; });
    $$(".has-error").forEach(function (el) { el.classList.remove("has-error"); });

    renderTonight();
    renderMenu();
    renderEvents();
    renderVisit();
    renderSelects();
    $("#big-group-text").textContent = t("bigGroup", { n: C.maxTableGuests });
  }

  function renderTonight() {
    var today = israelToday();
    var h = C.hours[today.day];
    var el = $("#tonight");
    el.classList.toggle("is-closed", !h);
    el.innerHTML = "";
    if (h) {
      // keep the time range left-to-right inside Hebrew text
      el.textContent = t("openToday", { open: "\u2066" + h.open, close: h.close + "\u2069" });
    } else {
      el.textContent = t("closedToday");
    }
  }

  function renderMenu() {
    var grid = $("#menu-grid");
    grid.innerHTML = "";
    C.menu.forEach(function (section) {
      var col = document.createElement("div");
      col.className = "menu-col";
      var h3 = document.createElement("h3");
      h3.textContent = section.title[lang];
      var ul = document.createElement("ul");
      section.items.forEach(function (item) {
        var li = document.createElement("li");
        var row = document.createElement("div");
        row.className = "dish-row";
        var name = document.createElement("span");
        name.textContent = item[lang][0];
        var leader = document.createElement("span");
        leader.className = "dish-leader";
        leader.setAttribute("aria-hidden", "true");
        var price = document.createElement("span");
        price.className = "dish-price";
        price.textContent = item.price;
        row.append(name, leader, price);
        var desc = document.createElement("p");
        desc.className = "dish-desc";
        desc.textContent = item[lang][1];
        li.append(row, desc);
        ul.appendChild(li);
      });
      col.append(h3, ul);
      grid.appendChild(col);
    });
  }

  function renderEvents() {
    var list = $("#event-list");
    list.innerHTML = "";
    C.events.forEach(function (ev) {
      var e = ev[lang];
      var li = document.createElement("li");
      var size = document.createElement("span");
      size.className = "event-size";
      size.setAttribute("aria-hidden", "true");
      size.textContent = ev.size;
      var h3 = document.createElement("h3");
      h3.textContent = e.name;
      var cap = document.createElement("span");
      cap.className = "event-cap";
      cap.textContent = e.capacity;
      h3.appendChild(cap);
      var p = document.createElement("p");
      p.className = "event-desc";
      p.textContent = e.desc;
      li.append(size, h3, p);
      list.appendChild(li);
    });
  }

  function renderVisit() {
    var c = C.contact;
    $("#address").textContent = c.address[lang];
    $("#maps-link").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(c.mapsQuery);
    $("#call-link").href = "tel:" + c.phoneHref;
    $("#phone-display").textContent = c.phoneDisplay;
    $("#wa-link").href = "https://wa.me/" + c.whatsapp;
    $("#ig-link").href = c.instagram;

    var today = israelToday().day;
    var table = $("#hours");
    table.innerHTML = "";
    var tbody = document.createElement("tbody");
    C.hours.forEach(function (h, i) {
      var tr = document.createElement("tr");
      if (i === today) tr.className = "is-today";
      var d = document.createElement("td");
      d.textContent = dayName(i);
      var v = document.createElement("td");
      if (h) {
        var bdi = document.createElement("bdi");
        bdi.dir = "ltr";
        bdi.textContent = h.open + "–" + h.close;
        v.appendChild(bdi);
      } else {
        v.textContent = t("closed");
      }
      tr.append(d, v);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    $("#year").textContent = new Date().getFullYear();
  }

  function fillSelect(select, options, placeholder) {
    var keep = select.value;
    select.innerHTML = "";
    if (placeholder) {
      var ph = new Option(placeholder, "");
      ph.disabled = true;
      select.add(ph);
    }
    options.forEach(function (o) { select.add(new Option(o.label, o.value)); });
    var values = options.map(function (o) { return o.value; });
    select.value = values.indexOf(keep) > -1 ? keep : (placeholder ? "" : options[0].value);
  }

  function renderSelects() {
    fillSelect($("#b-time"), C.bookingTimes.map(function (x) { return { value: x, label: x }; }), t("choose"));

    var guests = [];
    for (var i = 1; i <= C.maxTableGuests; i++) guests.push({ value: String(i), label: String(i) });
    var g = $("#b-guests");
    var hadValue = g.options.length > 0;
    fillSelect(g, guests);
    if (!hadValue) g.value = "2";

    var types = C.events.map(function (ev) { return { value: ev.id, label: ev[lang].name }; });
    types.push({ value: "other", label: t("eventOther") });
    fillSelect($("#e-type"), types, t("choose"));

    var today = israelToday().iso;
    $("#b-date").min = today;
    $("#e-date").min = today;
  }

  // ---- Forms → WhatsApp ----
  function setError(input, msg) {
    var field = input.closest(".field");
    var err = field && field.querySelector(".err");
    if (field) field.classList.toggle("has-error", !!msg);
    if (err) err.textContent = msg || "";
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validate(form) {
    var firstBad = null;
    var today = israelToday().iso;
    $$("[required]", form).forEach(function (input) {
      var v = input.value.trim();
      var msg = "";
      if (!v) msg = t("errRequired");
      else if (input.type === "tel" && !/^\+?[\d\s\-()]{9,18}$/.test(v)) msg = t("errPhone");
      else if (input.type === "date" && v < today) msg = t("errPast");
      setError(input, msg);
      if (msg && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function openWhatsApp(lines) {
    var url = "https://wa.me/" + C.contact.whatsapp + "?text=" + encodeURIComponent(lines.join("\n"));
    var w = window.open(url, "_blank");
    if (w) { w.opener = null; } else { location.href = url; }
  }

  function line(labelKey, value) { return value ? t(labelKey) + ": " + value : null; }

  $("#book-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    if (!validate(f)) return;
    var el = f.elements;
    var seating = f.querySelector("input[name=seating]:checked").value;
    openWhatsApp([
      t("waTable"),
      line("fName", el["name"].value.trim()),
      line("fPhone", el["phone"].value.trim()),
      line("fDate", prettyDate(el["date"].value)),
      line("fTime", el["time"].value),
      line("fGuests", el["guests"].value),
      line("fSeating", t(seating)),
      line("fNotes", el["notes"].value.trim()),
    ].filter(Boolean));
    $(".done", f).textContent = t("bookDone");
  });

  $("#event-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    if (!validate(f)) return;
    var el = f.elements;
    openWhatsApp([
      t("waEvent"),
      line("fName", el["name"].value.trim()),
      line("fPhone", el["phone"].value.trim()),
      line("fEventType", el["type"].options[el["type"].selectedIndex].text),
      line("fEventDate", prettyDate(el["date"].value)),
      line("fEventGuests", el["guests"].value),
      line("fNotes", el["notes"].value.trim()),
    ].filter(Boolean));
    $(".done", f).textContent = t("eventDone");
  });

  // Clear a field's error as soon as it's fixed
  $$(".form [required]").forEach(function (input) {
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true" && input.value.trim()) setError(input, "");
    });
  });

  $("#lang").addEventListener("click", function () {
    lang = lang === "he" ? "en" : "he";
    try { localStorage.setItem("baryam-lang", lang); } catch (e) { /* storage blocked */ }
    render();
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var defs = $("svg.defs");
    if (defs && defs.pauseAnimations) defs.pauseAnimations();
  }

  render();
})();

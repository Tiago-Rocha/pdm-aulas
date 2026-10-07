/* PDM · app.js · navegação, tema, índice lateral, realce de código, modo projeção.
   Sem dependências além do highlight.js carregado por CDN em cada página. */
(function () {
  "use strict";

  // Fonte única da lista de aulas (número, data, hora, título, repo).
  // O index.html tem a tabela em HTML estático; isto serve para o pager e para "próxima aula".
  var LESSONS = [
    { n: 1, d: "2026-09-21", h: "16:00-18:00", t: "Panorama mobile e install party", te: "Mobile landscape and install party", repo: null, kind: "" },
    { n: 2, d: "2026-09-22", h: "08:30-10:30", t: "Como o Flutter funciona, e Dart I", te: "How Flutter works, and Dart I", repo: null, kind: "" },
    { n: 3, d: "2026-09-23", h: "16:00-18:00", t: "Dart I (continuação) e primeiro repositório no GitHub", te: "Dart I (continued) and first GitHub repository", repo: null, kind: "" },
    { n: 4, d: "2026-09-25", h: "08:30-10:30", t: "Ciclo de vida, assincronia e Dart II", te: "Lifecycle, asynchrony and Dart II", repo: null, kind: "" },
    { n: 5, d: "2026-09-28", h: "16:00-18:00", t: "Anatomia de um projeto Flutter e primeira app", te: "Anatomy of a Flutter project and first app", repo: "pdm-aula-05", kind: "" },
    { n: 6, d: "2026-09-29", h: "08:30-10:30", t: "UX mobile e layouts", te: "Mobile UX and layouts", repo: "pdm-aula-06", kind: "" },
    { n: 7, d: "2026-09-30", h: "16:00-18:00", t: "Layouts (continuação): Stack, listas e widgets próprios", te: "Layouts (continued): Stack, lists and custom widgets", repo: "pdm-aula-06", kind: "" },
    { n: 8, d: "2026-10-06", h: "08:30-11:30", t: "Estado: do setState às arquiteturas", te: "State: from setState to architectures", repo: "pdm-aula-08", kind: "" },
    { n: 9, d: "2026-10-07", h: "16:00-18:00", t: "Navegação", te: "Navigation", repo: "pdm-aula-09", kind: "" },
    { n: 10, d: "2026-10-12", h: "16:00-18:00", t: "Acessibilidade, i18n e mini-projeto", te: "Accessibility, i18n and mini-project", repo: "pdm-aula-10", kind: "" },
    { n: 11, d: "2026-10-13", h: "08:30-10:30", t: "Qualidade: lints, organização e git flow", te: "Quality: lints, organisation and git flow", repo: "pdm-aula-11", kind: "" },
    { n: 12, d: "2026-10-14", h: "16:00-18:00", t: "Network layer e a API do curso", te: "Network layer and the course API", repo: "pdm-aula-12", kind: "" },
    { n: 13, d: "2026-10-19", h: "16:00-18:00", t: "Arquitetura por camadas e gestão de estado", te: "Layered architecture and state management", repo: "pdm-aula-13", kind: "" },
    { n: 14, d: "2026-10-20", h: "08:30-10:30", t: "Resiliência: estados de UI, retry e modo caos", te: "Resilience: UI states, retry and chaos mode", repo: "pdm-aula-14", kind: "" },
    { n: 15, d: "2026-10-21", h: "16:00-18:00", t: "Kickoff do projeto Tempo Açores", te: "Tempo Açores project kickoff", repo: null, kind: "sprint" },
    { n: 16, d: "2026-10-26", h: "16:00-18:00", t: "Persistência local e cache offline", te: "Local persistence and offline cache", repo: "pdm-aula-16", kind: "" },
    { n: 17, d: "2026-10-27", h: "08:30-10:30", t: "Autenticação com token e favoritos sincronizados", te: "Token authentication and synced favourites", repo: "pdm-aula-17", kind: "" },
    { n: 18, d: "2026-10-28", h: "16:00-18:00", t: "Segurança, performance e sprint 1", te: "Security, performance and sprint 1", repo: null, kind: "sprint" },
    { n: 19, d: "2026-11-02", h: "16:00-18:00", t: "Push notifications, review da sprint 1 e revisão para o teste 1", te: "Push notifications, sprint 1 review and revision for test 1", repo: null, kind: "sprint" },
    { n: 20, d: "2026-11-04", h: "16:00-18:00", t: "Teste escrito 1", te: "Written test 1", repo: null, kind: "test" },
    { n: 21, d: "2026-11-06", h: "08:30-12:30", t: "Workshop: localização, mapas e permissões", te: "Workshop: location, maps and permissions", repo: "pdm-aula-21", kind: "workshop" },
    { n: 22, d: "2026-11-09", h: "16:00-18:00", t: "Deep links e notificações locais", te: "Deep links and local notifications", repo: "pdm-aula-22", kind: "" },
    { n: 23, d: "2026-11-10", h: "08:30-10:30", t: "Trabalho em background e sprint 2", te: "Background work and sprint 2", repo: null, kind: "sprint" },
    { n: 24, d: "2026-11-11", h: "16:00-18:00", t: "Hardware e sensores, e sprint 2", te: "Hardware and sensors, and sprint 2", repo: null, kind: "sprint" },
    { n: 25, d: "2026-11-16", h: "16:00-18:00", t: "Testes automatizados e CI", te: "Automated tests and CI", repo: "pdm-aula-25", kind: "" },
    { n: 26, d: "2026-11-18", h: "16:00-18:00", t: "Observabilidade e review da sprint 2", te: "Observability and sprint 2 review", repo: null, kind: "sprint" },
    { n: 27, d: "2026-11-20", h: "08:30-12:30", t: "Workshop: polish de UI e primeira distribuição a testers", te: "Workshop: UI polish and first distribution to testers", repo: "pdm-aula-27", kind: "workshop" },
    { n: 28, d: "2026-11-23", h: "16:00-18:00", t: "Platform channels, plugins e API v2", te: "Platform channels, plugins and API v2", repo: "pdm-aula-28", kind: "" },
    { n: 29, d: "2026-11-24", h: "08:30-10:30", t: "Lojas e monetização, e sprint 3", te: "Stores and monetisation, and sprint 3", repo: null, kind: "sprint" },
    { n: 30, d: "2026-11-25", h: "16:00-18:00", t: "Tamanho, arranque e atualizações, e sprint 3", te: "Size, startup and updates, and sprint 3", repo: null, kind: "sprint" },
    { n: 31, d: "2026-11-30", h: "16:00-18:00", t: "Build e assinatura", te: "Build and signing", repo: "pdm-aula-31", kind: "" },
    { n: 32, d: "2026-12-02", h: "16:30-18:30", t: "Consolas das lojas e review da sprint 3", te: "Store consoles and sprint 3 review", repo: null, kind: "sprint" },
    { n: 33, d: "2026-12-04", h: "08:30-12:30", t: "Revisão para o teste 2 e workshop de finalização", te: "Revision for test 2 and finishing workshop", repo: null, kind: "workshop" },
    { n: 34, d: "2026-12-07", h: "16:00-18:00", t: "Teste escrito 2", te: "Written test 2", repo: null, kind: "test" },
    { n: 35, d: "2026-12-09", h: "16:30-18:30", t: "Como defender um projeto, freeze e ensaio", te: "How to defend a project, freeze and rehearsal", repo: null, kind: "" },
    { n: 36, d: "2026-12-14", h: "16:00-18:00", t: "Apresentações e defesas (I)", te: "Presentations and defences (I)", repo: null, kind: "final" },
    { n: 37, d: "2026-12-16", h: "08:30-10:30", t: "Apresentações e defesas (II) e encerramento", te: "Presentations and defences (II) and wrap-up", repo: null, kind: "final" }
  ];
  // Língua da página: <html lang="en"> nas páginas de en/, português nas restantes.
  var EN = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("en") === 0;
  var T = EN ? {
    dias: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    light: "☀︎ Light", dark: "☾ Dark", projOn: "▣ Normal", projOff: "▢ Projector",
    copy: "Copy", copied: "Copied ✓", toc: "On this page",
    prev: "← Previous", next: "Next →", lesson: "Lesson",
    nextUp: "Next lesson", done: "<strong>Semester over.</strong> Thank you all."
  } : {
    dias: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    light: "☀︎ Claro", dark: "☾ Escuro", projOn: "▣ Normal", projOff: "▢ Projeção",
    copy: "Copiar", copied: "Copiado ✓", toc: "Nesta página",
    prev: "← Anterior", next: "Seguinte →", lesson: "Aula",
    nextUp: "Próxima aula", done: "<strong>Semestre terminado.</strong> Obrigado a todos."
  };
  var DIAS = T.dias;
  function title(l) { return EN && l.te ? l.te : l.t; }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmtDate(iso) {
    var d = new Date(iso + "T12:00:00");
    return DIAS[d.getDay()] + " " + pad(d.getDate()) + "/" + pad(d.getMonth() + 1);
  }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  // ----- Marcadores de seta partilhados pelos diagramas SVG -----
  // Um único <svg> invisível (mas não display:none) no início do body, para que url(#ah) resolva
  // sempre para um elemento renderizável, mesmo quando o diagrama que os declarava está num slide escondido.
  if (document.querySelector("figure.diagram") && !document.getElementById("ah")) {
    var defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    defs.setAttribute("aria-hidden", "true"); defs.setAttribute("focusable", "false");
    defs.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
    defs.innerHTML = '<defs>' +
      '<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah"/></marker>' +
      '<marker id="ah-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ah accent"/></marker>' +
      '</defs>';
    document.body.insertBefore(defs, document.body.firstChild);
  }

  // ----- Tema claro/escuro -----
  var root = document.documentElement;
  var saved = read("pdm-theme");
  if (saved) root.setAttribute("data-theme", saved);
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    var paint = function () { themeBtn.textContent = currentTheme() === "dark" ? T.light : T.dark; };
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next); store("pdm-theme", next); paint();
    });
    paint();
  }

  // ----- Modo projeção (letra grande, sem índice lateral) -----
  if (read("pdm-proj") === "1") root.classList.add("proj");
  var projBtn = document.getElementById("proj-toggle");
  if (projBtn) {
    var paintP = function () { projBtn.textContent = root.classList.contains("proj") ? T.projOn : T.projOff; };
    projBtn.addEventListener("click", function () {
      root.classList.toggle("proj"); store("pdm-proj", root.classList.contains("proj") ? "1" : "0"); paintP();
    });
    paintP();
  }

  // ----- Realce de código + botão copiar -----
  if (window.hljs) {
    document.querySelectorAll("pre code").forEach(function (el) { window.hljs.highlightElement(el); });
  }
  document.querySelectorAll("pre").forEach(function (pre) {
    var b = document.createElement("button");
    b.className = "copy"; b.type = "button"; b.textContent = T.copy;
    b.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var txt = code ? code.innerText : pre.innerText;
      navigator.clipboard.writeText(txt).then(function () {
        b.textContent = T.copied; setTimeout(function () { b.textContent = T.copy; }, 1500);
      });
    });
    pre.appendChild(b);
  });

  // ----- Índice lateral a partir dos h2/h3 do conteúdo -----
  var toc = document.getElementById("toc");
  var main = document.querySelector("main.content");
  if (toc && main) {
    var heads = main.querySelectorAll("h2, h3");
    if (heads.length > 1) {
      var ul = document.createElement("ul");
      heads.forEach(function (h, i) {
        if (!h.id) h.id = "s" + (i + 1) + "-" + h.textContent.toLowerCase().replace(/[^a-z0-9à-ú]+/g, "-").replace(/^-|-$/g, "");
        var li = document.createElement("li"); li.className = h.tagName.toLowerCase();
        var a = document.createElement("a"); a.href = "#" + h.id; a.textContent = h.textContent;
        li.appendChild(a); ul.appendChild(li);
      });
      var h4 = document.createElement("h4"); h4.textContent = T.toc;
      toc.appendChild(h4); toc.appendChild(ul);
      toc.closest(".layout") && toc.closest(".layout").classList.add("has-toc");
      var links = ul.querySelectorAll("a");
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id); });
          }
        });
      }, { rootMargin: "-80px 0px -70% 0px" });
      heads.forEach(function (h) { obs.observe(h); });
    }
  }

  // ----- Pager anterior/seguinte nas páginas de aula -----
  var n = parseInt(document.body.getAttribute("data-aula") || "0", 10);
  var pager = document.getElementById("pager");
  if (n && pager) {
    function link(l, cls, label) {
      if (!l) { var s = document.createElement("span"); return s; }
      var a = document.createElement("a"); a.className = cls;
      a.href = "aula-" + pad(l.n) + ".html";
      a.innerHTML = "<small>" + label + " · " + fmtDate(l.d) + "</small>" + T.lesson + " " + pad(l.n) + " · " + title(l);
      return a;
    }
    var prev = LESSONS.filter(function (l) { return l.n === n - 1; })[0];
    var next = LESSONS.filter(function (l) { return l.n === n + 1; })[0];
    pager.appendChild(link(prev, "prev", T.prev));
    pager.appendChild(link(next, "next", T.next));
  }

  // ----- Index: marcar aulas passadas e mostrar a próxima -----
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var iso = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
  document.querySelectorAll("[data-date]").forEach(function (tr) {
    var d = tr.getAttribute("data-date");
    if (d < iso) tr.classList.add("done");
    if (d === iso) tr.classList.add("today");
  });
  var nextUp = document.getElementById("next-up");
  if (nextUp) {
    var nx = LESSONS.filter(function (l) { return l.d >= iso; })[0];
    if (nx) {
      nextUp.innerHTML = "<strong>" + T.nextUp + "</strong> " + T.lesson + " " + pad(nx.n) + " · " + fmtDate(nx.d) + " · " + nx.h + " · " + title(nx);
    } else {
      nextUp.innerHTML = T.done;
    }
  }

  // ----- Troca de língua -----
  // A raiz do site é a pasta que contém assets/app.js; en/ espelha-a com os mesmos nomes de ficheiro.
  // As bandeiras são SVG (os emojis de bandeira não aparecem no Windows).
  var FLAGS = {
    pt: '<svg viewBox="0 0 60 40" aria-hidden="true"><rect width="60" height="40" fill="#da291c"/><rect width="24" height="40" fill="#046a38"/><circle cx="24" cy="20" r="8" fill="#ffe900"/><path d="M19.5 15h9v6a4.5 4.5 0 0 1-9 0z" fill="#da291c" stroke="#fff" stroke-width="1.2"/></svg>',
    en: '<svg viewBox="0 0 60 40" aria-hidden="true"><rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0L60 40M60 0L0 40" stroke="#c8102e" stroke-width="3"/><path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="13"/><path d="M30 0v40M0 20h60" stroke="#c8102e" stroke-width="7"/></svg>'
  };
  var self = document.querySelector('script[src$="assets/app.js"]');
  var siteRoot = self ? self.src.replace(/assets\/app\.js.*$/, "") : null;
  // Devolve o par de botões PT | EN, ou null se a página não estiver dentro do site.
  // O endereço é calculado no clique, para levar o slide em que se está (#sN).
  function langSwitch() {
    var page = location.href.split("#")[0].split("?")[0];
    if (!siteRoot || page.indexOf(siteRoot) !== 0) return null;
    var rel = page.slice(siteRoot.length).replace(/^en\//, "");
    var box = document.createElement("span"); box.className = "lang-switch";
    [["pt", "PT", "Versão em português", "pt-PT", ""], ["en", "EN", "English version", "en", "en/"]].forEach(function (o) {
      var a = document.createElement("a");
      a.innerHTML = FLAGS[o[0]] + "<span>" + o[1] + "</span>";
      a.title = o[2]; a.setAttribute("hreflang", o[3]); a.setAttribute("lang", o[3]);
      a.href = siteRoot + o[4] + rel + location.hash;
      if ((o[0] === "en") === EN) { a.className = "on"; a.setAttribute("aria-current", "true"); }
      a.addEventListener("click", function () { a.href = siteRoot + o[4] + rel + location.hash; });
      box.appendChild(a);
    });
    return box;
  }
  // Nas aulas a troca fica na barra dos slides, ao lado dos comandos; nas outras páginas, no cabeçalho.
  var tools = document.querySelector("header.site .tools");
  var headerSwitch = tools && !document.getElementById("deck") && langSwitch();
  if (headerSwitch) tools.insertBefore(headerSwitch, tools.firstChild);

  // ----- Marca o link ativo no menu -----
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("header.site nav a").forEach(function (a) {
    var target = a.getAttribute("href").split("#")[0].split("/").pop();
    if (target === here) a.setAttribute("aria-current", "page");
  });

  // ----- Links para repositórios da organização -----
  var ORG = "Tiago-Rocha";
  document.querySelectorAll("a.repo[data-repo]").forEach(function (a) {
    a.href = "https://github.com/" + ORG + "/" + a.getAttribute("data-repo");
    a.target = "_blank"; a.rel = "noopener";
  });

  window.PDM = { LESSONS: LESSONS, ORG: ORG, langSwitch: langSwitch };
})();

/* ===== Motor de slides das aulas =====
   Ativa-se quando existe <div class="deck" id="deck">. Cada <section class="slide"> é um slide;
   data-part no primeiro slide de cada parte dá o nome do segmento na barra do topo. */
(function () {
  "use strict";
  var deck = document.getElementById("deck");
  if (!deck) return;
  var slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
  if (!slides.length) return;
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  var EN = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("en") === 0;
  var T = EN ? {
    slideOf: function (i, n) { return "Slide " + i + " of " + n; },
    prev: "Previous (←)", next: "Next (→)", doc: "Show everything on one page (d)", notes: "Teacher notes (n)", full: "Full screen (f)",
    hint: "← → navigate · click a part of the bar to jump · d document · n teacher notes · f full screen"
  } : {
    slideOf: function (i, n) { return "Slide " + i + " de " + n; },
    prev: "Anterior (←)", next: "Seguinte (→)", doc: "Ver tudo seguido (d)", notes: "Notas do docente (n)", full: "Ecrã inteiro (f)",
    hint: "← → navegar · clica numa parte da barra para saltar · d documento · n notas do docente · f ecrã inteiro"
  };

  // Partes (segmentos da barra)
  var parts = [], last = "Aula";
  slides.forEach(function (s, i) {
    var p = s.getAttribute("data-part") || last; last = p;
    if (!parts.length || parts[parts.length - 1].name !== p) parts.push({ name: p, start: i, count: 0 });
    parts[parts.length - 1].count++;
    s.setAttribute("data-num", T.slideOf(i + 1, slides.length));
  });

  // Barra do topo
  var bar = document.createElement("div"); bar.className = "deckbar";
  bar.innerHTML = '<div class="inner"><div class="segs"></div><div class="ctrl">' +
    '<button type="button" data-act="prev" title="' + T.prev + '">‹</button>' +
    '<span class="counter"></span>' +
    '<button type="button" data-act="next" title="' + T.next + '">›</button>' +
    '<button type="button" data-act="doc" title="' + T.doc + '">Doc</button>' +
    '<button type="button" data-act="notes" title="' + T.notes + '">N</button>' +
    '<button type="button" data-act="full" title="' + T.full + '">⛶</button>' +
    '</div></div>';
  deck.parentNode.insertBefore(bar, deck);
  var segs = bar.querySelector(".segs"), counter = bar.querySelector(".counter");
  var deckSwitch = window.PDM && window.PDM.langSwitch && window.PDM.langSwitch();
  if (deckSwitch) bar.querySelector(".ctrl").appendChild(deckSwitch);
  parts.forEach(function (p) {
    var el = document.createElement("div"); el.className = "seg"; el.style.flex = String(p.count);
    el.title = p.name + " · " + p.count + (p.count === 1 ? " slide" : " slides");
    el.innerHTML = '<span class="label">' + p.name + '</span><div class="track"><i></i></div>';
    el.addEventListener("click", function () { go(p.start); });
    segs.appendChild(el); p.el = el;
  });
  var hint = document.createElement("p"); hint.className = "deck-hint";
  hint.textContent = T.hint;
  deck.parentNode.insertBefore(hint, deck.nextSibling);

  var cur = -1;
  function update() {
    counter.textContent = (cur + 1) + " / " + slides.length;
    parts.forEach(function (p) {
      var done = cur >= p.start + p.count, inside = cur >= p.start && cur < p.start + p.count;
      var frac = done ? 1 : inside ? (cur - p.start + 1) / p.count : 0;
      p.el.querySelector("i").style.width = (frac * 100) + "%";
      p.el.classList.toggle("current", inside); p.el.classList.toggle("done", done);
    });
    bar.querySelector('[data-act="prev"]').disabled = cur === 0;
    bar.querySelector('[data-act="next"]').disabled = cur === slides.length - 1;
  }
  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    if (cur >= 0) slides[cur].classList.remove("active");
    cur = i; slides[cur].classList.add("active");
    update();
    if (history.replaceState) history.replaceState(null, "", "#s" + (cur + 1));
    if (deck.classList.contains("doc")) slides[cur].scrollIntoView({ block: "start", behavior: "smooth" });
    else window.scrollTo({ top: 0 });
  }
  function fromHash() {
    var m = /#s(\d+)/.exec(location.hash);
    go(m ? parseInt(m[1], 10) - 1 : 0);
  }
  function toggleDoc() {
    deck.classList.toggle("doc");
    var on = deck.classList.contains("doc");
    bar.querySelector('[data-act="doc"]').classList.toggle("on", on);
    store("pdm-deck-doc", on ? "1" : "0");
    if (on) slides[cur].scrollIntoView({ block: "start" });
  }
  function toggleNotes() {
    deck.classList.toggle("notes");
    bar.querySelector('[data-act="notes"]').classList.toggle("on", deck.classList.contains("notes"));
  }
  function toggleFull() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
  }
  bar.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-act]"); if (!b) return;
    var act = b.getAttribute("data-act");
    if (act === "prev") go(cur - 1); else if (act === "next") go(cur + 1);
    else if (act === "doc") toggleDoc(); else if (act === "notes") toggleNotes(); else if (act === "full") toggleFull();
  });
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    switch (e.key) {
      case "ArrowRight": case "PageDown": e.preventDefault(); go(cur + 1); break;
      case "ArrowLeft": case "PageUp": e.preventDefault(); go(cur - 1); break;
      case "Home": e.preventDefault(); go(0); break;
      case "End": e.preventDefault(); go(slides.length - 1); break;
      case "d": toggleDoc(); break;
      case "n": toggleNotes(); break;
      case "f": toggleFull(); break;
    }
  });
  // Deslizar no telemóvel
  var tx = null, ty = null;
  deck.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  deck.addEventListener("touchend", function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = ty = null;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 80) go(dx < 0 ? cur + 1 : cur - 1);
  }, { passive: true });
  window.addEventListener("hashchange", fromHash);
  if (read("pdm-deck-doc") === "1") { deck.classList.add("doc"); bar.querySelector('[data-act="doc"]').classList.add("on"); }
  fromHash();
})();

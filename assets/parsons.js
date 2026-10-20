/* PDM · parsons.js · exercícios de ordenar código, com placar ao vivo.

   Exercício:  <div class="parsons" data-id="favs" data-title="lib/x.dart" data-seed="7" [data-blocks]>
                 <script type="text/plain">linhas pela ordem certa</script></div>
     Sem data-blocks, cada linha é uma peça; com data-blocks, as peças separam-se por linhas em branco.
     A ordem certa está no HTML; a página baralha com a semente (o quadro e os alunos veem o mesmo).
     Com data-id, quem entrou numa sala envia o progresso para o placar.

   Construir em conjunto:  <div class="pz-set" data-id="app"> com vários .parsons, cada um com
     data-part="estado-favs" data-layer="Estado" data-label="FavoritesNotifier". A API dá a cada
     aluno a parte com menos gente; sem sala, o aluno escolhe a parte numa lista.

   Placar (no ecrã da sala):  <div class="pz-board" data-id="favs" data-goal="300"></div>
     Equipas e meta da turma. Com data-build, mostra as camadas do pz-set com o mesmo data-id.
     O placar cria o código da sala; os alunos escrevem-no para entrar. */
(function () {
  "use strict";
  var EN = document.documentElement.lang === "en";
  var API = (function () {
    try { var o = new URLSearchParams(location.search).get("api") || localStorage.getItem("pz-api"); if (o) return o.replace(/\/$/, ""); } catch (e) {}
    return "https://api-pdm.sublimecipher.com";
  })() + "/v1/play/";
  var T = EN
    ? { check: "Check", shuffle: "Shuffle", tries: "tries", try1: "try", time: "time",
        hint: "Drag the pieces into the right order. On the keyboard: Tab to a piece, Alt + up or down to move it.",
        ok: function (t, n) { return "Done in " + t + ", " + n + (n === 1 ? " try." : " tries."); },
        bad: function (k, n) { return k + " of " + n + " in the right place. Green ones are right; move the red ones."; },
        helper: "Drag the pieces. A piece in the right place locks and turns green.",
        quiz: "One answer only.", quizOk: "Right.", quizNo: "Not quite.", understood: function (a, b) { return a + " of " + b + " answered right"; },
        room: "Room code", name: "Name", team: "Team", join: "Join the game", leave: "Leave",
        inRoom: function (r, n) { return "Room " + r + " · " + n; }, offline: "no connection to the scoreboard",
        yourPart: "Your part", choose: "Choose a part", waitPart: "Join the room to get your part.",
        code: "Room code", newRoom: "New room", start: "Start", restart: "Restart", goal: "Goal", solved: function (a, b) { return a + " of " + b + " solved"; },
        classDone: function (t) { return "The whole class in " + t; }, goalOk: "goal reached", goalMiss: "goal missed",
        already: "Already solved.", students: function (n) { return n + (n === 1 ? " student" : " students"); }, ex: function (k, n) { return "Exercise " + k + " of " + n; }, prev: "Previous", next: "Next", skip: "Skip",
        student: "Student", stuck: function (m) { return "no check for " + m + " min"; },
        done: function (a, b) { return a + " of " + b + " exercises"; }, noone: "Nobody yet. Students open this lesson, go to the exercises and join with the code.",
        waiting: "Waiting for players. Open this lesson, scroll to the exercise and join with the code.",
        still: "Still building, go and help:", built: function (t) { return "The app is built! " + t; }, ready: "ready" }
    : { check: "Verificar", shuffle: "Baralhar", tries: "tentativas", try1: "tentativa", time: "tempo",
        hint: "Arrasta as peças para a ordem certa. No teclado: Tab até uma peça, Alt + cima ou baixo para a mover.",
        ok: function (t, n) { return "Feito em " + t + ", à " + n + "ª tentativa."; },
        bad: function (k, n) { return k + " de " + n + " no sítio certo. As verdes estão certas; mexe nas vermelhas."; },
        helper: "Arrasta as peças. A que fica no sítio certo prende-se e fica verde.",
        quiz: "Só uma resposta.", quizOk: "Certo.", quizNo: "Não é bem isso.", understood: function (a, b) { return a + " de " + b + " acertaram na pergunta"; },
        room: "Código da sala", name: "Nome", team: "Equipa", join: "Entrar no jogo", leave: "Sair",
        inRoom: function (r, n) { return "Sala " + r + " · " + n; }, offline: "sem ligação ao placar",
        yourPart: "A tua parte", choose: "Escolhe uma parte", waitPart: "Entra na sala para receberes a tua parte.",
        code: "Código da sala", newRoom: "Nova sala", start: "Começar", restart: "Recomeçar", goal: "Meta", solved: function (a, b) { return a + " de " + b + " resolveram"; },
        classDone: function (t) { return "A turma toda em " + t; }, goalOk: "meta cumprida", goalMiss: "meta falhada",
        already: "Já resolvido.", students: function (n) { return n + (n === 1 ? " aluno" : " alunos"); }, ex: function (k, n) { return "Exercício " + k + " de " + n; }, prev: "Anterior", next: "Seguinte", skip: "Saltar",
        student: "Aluno", stuck: function (m) { return "sem verificar há " + m + " min"; },
        done: function (a, b) { return a + " de " + b + " exercícios"; }, noone: "Ainda ninguém. Os alunos abrem esta aula, vão aos exercícios e entram com o código.",
        waiting: "À espera dos alunos. Abrem esta aula, vão até ao exercício e entram com o código.",
        still: "Ainda a construir, vai ajudar:", built: function (t) { return "A app está construída! " + t; }, ready: "pronto" };

  // ----- utilidades -----
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function shuffle(a, rnd) {
    var b = a.slice();
    for (var tries = 0; tries < 20; tries++) {
      for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; }
      var same = 0; for (var k = 0; k < b.length; k++) if (b[k].text === a[k].text) same++;
      if (same <= Math.floor(a.length / 4)) break;
    }
    return b;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function hl(s) {
    if (window.hljs) { try { return window.hljs.highlight(s, { language: "dart", ignoreIllegals: true }).value; } catch (e) {} }
    return esc(s);
  }
  // Duas peças com o mesmo código são equivalentes: os comentários e os espaços não contam
  function same(a, b) {
    var n = function (s) { return s.replace(/\/\/[^\n]*/g, "").replace(/\s+/g, " ").trim(); };
    return n(a) === n(b);
  }
  function fmt(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function load(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  // ----- quem sou eu (aluno) -----
  var me = load("pz-me");
  var listeners = [];
  function setMe(v) { me = v; save("pz-me", v); listeners.forEach(function (f) { f(); }); }
  function joined() { return me && me.room && me.name; }
  function send(puzzle, body) {
    if (!joined()) return Promise.resolve(null);
    body.player = me.id; body.name = me.name; body.team = me.team;
    return fetch(API + encodeURIComponent(me.room) + "/" + encodeURIComponent(puzzle), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true
    }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  // Barra para entrar na sala (uma por exercício; todas mostram o mesmo)
  function joinBar() {
    var bar = el("div", "pz-join");
    function paint() {
      bar.classList.toggle("gate", !joined());
      if (joined()) {
        bar.innerHTML = '<span class="pz-me">' + esc(T.inRoom(me.room, me.name)) + '</span> <button type="button" class="pz-leave">' + T.leave + "</button>";
        bar.querySelector(".pz-leave").onclick = function () { setMe({ id: me.id, name: me.name, team: me.team }); };
      } else {
        bar.innerHTML = '<input class="pz-room" inputmode="numeric" maxlength="6" placeholder="' + T.room + '" aria-label="' + T.room + '">' +
          '<input class="pz-name" maxlength="24" placeholder="' + T.name + '" aria-label="' + T.name + '">' +
          '<button type="button" class="pz-go">' + T.join + "</button>";
        if (me && me.name) bar.querySelector(".pz-name").value = me.name;
        bar.querySelector(".pz-go").onclick = function () {
          var room = bar.querySelector(".pz-room").value.trim(), name = bar.querySelector(".pz-name").value.trim();
          if (!room || !name) { (room ? bar.querySelector(".pz-name") : bar.querySelector(".pz-room")).focus(); return; }
          setMe({ id: (me && me.id) || (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)), room: room, name: name, team: "" });
        };
        bar.addEventListener("keydown", function (e) { if (e.key === "Enter") bar.querySelector(".pz-go").click(); e.stopPropagation(); });
      }
    }
    listeners.push(paint); paint();
    return bar;
  }

  // ----- um exercício -----
  function initPuzzle(box, report, hooks) {
    var src = box.querySelector("script[type='text/plain']");
    var qs = box.querySelector("script[type='application/json']");
    var quiz = qs ? JSON.parse(qs.textContent) : null;
    var raw = src.textContent.replace(/^\n+|\s+$/g, "");
    var blocks = box.hasAttribute("data-blocks");
    var parts = blocks ? raw.split(/\n[ \t]*\n/) : raw.split("\n");
    var pieces = parts.filter(function (p) { return p.trim() !== ""; }).map(function (p, i) { return { id: i, text: p }; });
    var answer = pieces.map(function (p) { return p.text; });
    // data-free="1,2;5,6": peças (pela ordem certa, a contar do 0) que podem trocar entre si
    var groups = (box.getAttribute("data-free") || "").split(";").filter(Boolean).map(function (g) { return g.split(",").map(Number); });
    function okAt(text, i) {
      if (same(text, answer[i])) return true;
      return groups.some(function (g) { return g.indexOf(i) >= 0 && g.some(function (j) { return same(text, answer[j]); }); });
    }

    box.innerHTML = "";
    if (box.getAttribute("data-title")) box.appendChild(el("div", "pz-title")).textContent = box.getAttribute("data-title");
    var list = box.appendChild(el("ol", "pz-list"));
    var bar = box.appendChild(el("div", "pz-bar",
      '<button type="button" class="pz-check">' + T.check + '</button>' +
      '<button type="button" class="pz-shuffle">' + T.shuffle + '</button>' +
      '<span class="pz-stat"><span class="pz-tries">0</span> <span class="pz-tl">' + T.tries + "</span> · " + T.time + ' <span class="pz-time">0:00</span></span>'));
    var msg = box.appendChild(el("p", "pz-msg")); msg.textContent = T.hint;

    var tries = 0, t0 = null, timer = null, done = false;
    var timeEl = bar.querySelector(".pz-time"), triesEl = bar.querySelector(".pz-tries"), tlEl = bar.querySelector(".pz-tl");
    function start() {
      if (t0 || done) return;
      t0 = Date.now();
      timer = setInterval(function () { timeEl.textContent = fmt(Date.now() - t0); }, 500);
      report && report({ right: 0, total: answer.length, tries: 0, ms: 0, solved: false });
    }
    function render(order) {
      list.innerHTML = "";
      order.forEach(function (p) {
        var li = el("li", "pz-item", "<code>" + hl(p.text) + "</code>"); li.tabIndex = 0; li.dataset.text = p.text; list.appendChild(li);
      });
    }
    var helper = box.hasAttribute("data-helper"), locked = 0;
    function clearMarks() { Array.prototype.forEach.call(list.children, function (li) { if (!li.classList.contains("locked")) li.classList.remove("ok", "bad"); }); }
    // Modo de ajuda: a peça que fica no sítio certo prende-se e fica verde
    function lockCheck() {
      if (!helper || done) return;
      var n = 0;
      Array.prototype.forEach.call(list.children, function (li, i) {
        if (okAt(li.dataset.text, i)) { li.classList.add("locked", "ok"); n++; }
      });
      if (n !== locked) {
        locked = n;
        if (n === answer.length) { verify(); return; }
        if (t0) report && report({ right: n, total: answer.length, tries: tries, ms: Date.now() - t0, solved: false });
        msg.textContent = T.bad(n, answer.length).split(".")[0] + "."; msg.className = "pz-msg";
      }
    }
    function reset(seed) {
      done = false; tries = 0; locked = 0; triesEl.textContent = "0"; tlEl.textContent = T.tries; t0 = null; clearInterval(timer); timeEl.textContent = "0:00";
      box.classList.remove("solved", "merged"); msg.textContent = helper ? T.helper : T.hint; msg.className = "pz-msg";
      var oq = box.querySelector(".pz-quiz"); if (oq) oq.remove();
      render(shuffle(pieces, rng(seed)));
      lockCheck();
    }
    reset(parseInt(box.getAttribute("data-seed") || "1", 10));

    function verify() {
      if (done) return;
      start(); tries++; triesEl.textContent = String(tries); tlEl.textContent = tries === 1 ? T.try1 : T.tries;
      var right = 0;
      Array.prototype.forEach.call(list.children, function (li, i) {
        var good = okAt(li.dataset.text, i); if (good) right++;
        li.classList.toggle("ok", good); li.classList.toggle("bad", !good);
      });
      var ms = Date.now() - t0, won = right === answer.length;
      last = { right: right, total: answer.length, tries: tries, ms: ms, solved: won };
      report && report(last);
      if (won) {
        done = true; clearInterval(timer); box.classList.add("solved");
        Array.prototype.forEach.call(list.children, function (li, i) { li.style.setProperty("--i", i); li.style.transform = ""; });
        requestAnimationFrame(function () { box.classList.add("merged"); });
        msg.textContent = T.ok(fmt(ms), tries); msg.className = "pz-msg ok";
        if (quiz) askQuiz();
        if (hooks && hooks.onSolved) hooks.onSolved();
      } else {
        msg.textContent = T.bad(right, answer.length); msg.className = "pz-msg bad";
      }
    }

    // Pergunta de escolha múltipla depois de ordenar: não bloqueia, mas só a primeira resposta conta
    var last = null;
    function askQuiz() {
      var seed = 0, key = (me && me.id) || String(Math.random());
      for (var i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
      var opts = shuffle(quiz.options.map(function (o, i) { return { text: o, id: i }; }), rng(seed + 1));
      var q = el("div", "pz-quiz", "<p class=\"pz-q\"><strong>" + esc(quiz.q) + "</strong> <span class=\"pz-note\">" + T.quiz + "</span></p>");
      var ul = q.appendChild(el("div", "pz-opts"));
      opts.forEach(function (o) {
        var b = el("button", "pz-opt"); b.type = "button"; b.textContent = o.text; b.dataset.id = o.id; ul.appendChild(b);
      });
      var why = q.appendChild(el("p", "pz-why"));
      ul.addEventListener("click", function (e) {
        var b = e.target.closest(".pz-opt"); if (!b || q.classList.contains("answered")) return;
        var good = b.dataset.id === "0";
        q.classList.add("answered");
        Array.prototype.forEach.call(ul.children, function (x) { x.disabled = true; if (x.dataset.id === "0") x.classList.add("right"); });
        if (!good) b.classList.add("wrong");
        why.innerHTML = "<strong>" + (good ? T.quizOk : T.quizNo) + "</strong> " + esc(quiz.why || "");
        if (report && last) { last.quiz = good; report(last); }
      });
      box.appendChild(q);
    }
    bar.querySelector(".pz-shuffle").addEventListener("click", function () { reset(Math.floor(Math.random() * 1e9)); });
    bar.querySelector(".pz-check").addEventListener("click", verify);

    // Trocar duas peças sem mexer nas que estão presas pelo meio
    function sib(li, dir) {
      var n = dir > 0 ? li.nextElementSibling : li.previousElementSibling;
      while (n && n.classList.contains("locked")) n = dir > 0 ? n.nextElementSibling : n.previousElementSibling;
      return n;
    }
    function swap(a, b) {
      var ph = document.createElement("li");
      list.replaceChild(ph, a); list.replaceChild(a, b); list.replaceChild(b, ph);
    }

    // Arrastar (rato e toque)
    var drag = null;
    list.addEventListener("pointerdown", function (e) {
      var li = e.target.closest(".pz-item"); if (!li || done || e.button > 0 || li.classList.contains("locked")) return;
      e.preventDefault(); start(); clearMarks();
      li.setPointerCapture(e.pointerId);
      drag = { li: li, y: e.clientY }; li.classList.add("dragging");
    });
    list.addEventListener("pointermove", function (e) {
      if (!drag) return;
      // um arrasto rápido salta várias linhas num só evento: avança uma a uma até chegar ao rato
      var li = drag.li, guard = 100;
      while (guard--) {
        var dy = e.clientY - drag.y, next = sib(li, 1), prev = sib(li, -1), old = li.offsetTop;
        // desce quando o fundo da peça passa o meio da de baixo; sobe quando o topo passa o meio da de cima
        if (next && dy > next.offsetTop + next.offsetHeight / 2 - li.offsetTop - li.offsetHeight) swap(li, next);
        else if (prev && -dy > li.offsetTop - prev.offsetTop - prev.offsetHeight / 2) swap(li, prev);
        else break;
        drag.y += li.offsetTop - old;
      }
      li.style.transform = "translateY(" + (e.clientY - drag.y) + "px)";
    });
    function end() { if (!drag) return; drag.li.style.transform = ""; drag.li.classList.remove("dragging"); drag = null; lockCheck(); }
    list.addEventListener("pointerup", end);
    list.addEventListener("pointercancel", end);
    list.addEventListener("touchend", function (e) { e.stopPropagation(); });

    // Teclado: Alt + cima ou baixo
    list.addEventListener("keydown", function (e) {
      var li = e.target.closest(".pz-item"); if (!li || done || !e.altKey || li.classList.contains("locked")) return;
      var other = e.key === "ArrowUp" ? sib(li, -1) : e.key === "ArrowDown" ? sib(li, 1) : null;
      if (!other) return;
      e.preventDefault(); start(); clearMarks(); swap(li, other); li.focus(); lockCheck();
    });

    // Já resolvido noutra visita: mostra o bloco final, sem animação e sem enviar nada
    function restore() {
      render(pieces); done = true; clearInterval(timer);
      box.classList.add("solved", "merged", "instant"); msg.textContent = T.already; msg.className = "pz-msg ok";
    }
    return { last: function () { return last; }, restore: restore, total: answer.length };
  }

  // ----- exercício solto, com placar -----
  function initSingle(box) {
    var id = box.getAttribute("data-id");
    if (id) box.parentNode.insertBefore(joinBar(), box);
    initPuzzle(box, id ? function (b) { send(id, b); } : null);
    if (!id) return;
    // com placar, primeiro entra-se na sala; só depois aparece o jogo
    function gate() { box.hidden = !joined(); if (joined()) send(id, { right: 0, total: 0, tries: 0, ms: 0, solved: false }); }
    listeners.push(gate); gate();
  }

  // ----- construir a app em conjunto: cada aluno recebe uma parte -----
  function initSet(set) {
    var id = set.getAttribute("data-id");
    var boxes = Array.prototype.slice.call(set.querySelectorAll(".parsons"));
    var names = boxes.map(function (b) { return b.getAttribute("data-part"); });
    boxes.forEach(function (b) { initPuzzle(b, function (body) { body.parts = names; send(id, body); }); b.hidden = true; });
    var head = el("div", "pz-part");
    set.insertBefore(head, set.firstChild);
    set.insertBefore(joinBar(), head);
    function show(part, given) {
      boxes.forEach(function (b) { b.hidden = b.getAttribute("data-part") !== part; });
      var b = boxes[names.indexOf(part)];
      // "A tua parte" só quando foi a API que a deu; sem ligação, fica a lista para escolher
      if (b && given) head.innerHTML = "<strong>" + T.yourPart + ":</strong> " + esc(b.getAttribute("data-layer")) + " · <code>" + esc(b.getAttribute("data-label")) + "</code>";
    }
    function offline() {
      var opts = boxes.map(function (b) { return '<option value="' + esc(b.getAttribute("data-part")) + '">' + esc(b.getAttribute("data-layer") + " · " + b.getAttribute("data-label")) + "</option>"; }).join("");
      head.innerHTML = "<label>" + T.choose + ' <select class="pz-pick">' + opts + "</select></label> <span class=\"pz-note\">" + T.waitPart + "</span>";
      var sel = head.querySelector(".pz-pick");
      sel.onchange = function () { show(sel.value, false); };
      show(names[0], false);
    }
    function sync() {
      if (!joined()) { head.hidden = true; boxes.forEach(function (b) { b.hidden = true; }); return; }
      head.hidden = false; head.textContent = "…";
      send(id, { right: 0, total: 0, tries: 0, ms: 0, solved: false, parts: names }).then(function (r) {
        if (r && r.you && r.you.part) show(r.you.part, true); else { offline(); head.insertAdjacentHTML("beforeend", ' <span class="pz-note bad">' + T.offline + "</span>"); }
      });
    }
    listeners.push(sync); sync();
  }

  // ----- placar no ecrã da sala -----
  function initBoard(board) {
    var id = board.getAttribute("data-id"), build = board.hasAttribute("data-build");
    var goal = parseInt(board.getAttribute("data-goal") || "0", 10);
    var host = load("pz-host") || {};
    var day = new Date().toISOString().slice(0, 10);
    if (!host.code || host.day !== day) { host = { code: String(1000 + Math.floor(Math.random() * 9000)), day: day, starts: {} }; save("pz-host", host); }
    board.innerHTML =
      '<div class="pz-top"><div class="pz-code"><span>' + T.code + '</span><b></b></div>' +
      '<div class="pz-clock"><span class="pz-goal"></span><b class="pz-elapsed">0:00</b></div>' +
      '<div class="pz-actions"><button type="button" class="pz-start">' + T.start + '</button><button type="button" class="pz-new">' + T.newRoom + "</button></div></div>" +
      '<div class="pz-class"><div class="pz-track"><i></i></div><span class="pz-count"></span></div>' +
      '<div class="pz-body"></div>';
    var codeEl = board.querySelector(".pz-code b"), body = board.querySelector(".pz-body");
    var fill = board.querySelector(".pz-class i"), count = board.querySelector(".pz-count"), elapsed = board.querySelector(".pz-elapsed");
    board.querySelector(".pz-goal").textContent = goal ? T.goal + " " + fmt(goal * 1000) + " · " : "";
    codeEl.textContent = host.code;
    // O início da meta fica no localStorage do professor: sobrevive a recarregar a página
    function startAt() { var h = load("pz-host") || host; return (h.starts || {})[id]; }
    var startBtn = board.querySelector(".pz-start"), clock = board.querySelector(".pz-clock");
    function paintStart() {
      var s = startAt();
      startBtn.textContent = s ? T.restart : T.start;
      startBtn.classList.toggle("restart", !!s);
      clock.classList.toggle("running", !!s);
      elapsed.textContent = s ? fmt(Date.now() - s) : "0:00";
    }
    startBtn.onclick = function () {
      host = load("pz-host") || host; host.starts = host.starts || {}; host.starts[id] = Date.now(); save("pz-host", host);
      paintStart();
      clock.classList.remove("kick"); void clock.offsetWidth; clock.classList.add("kick");
    };
    paintStart(); setInterval(paintStart, 250);
    board.querySelector(".pz-new").onclick = function () {
      host = { code: String(1000 + Math.floor(Math.random() * 9000)), day: day, starts: {} }; save("pz-host", host); codeEl.textContent = host.code; body.innerHTML = "";
    };
    var parts = {};
    if (build) {
      var set = document.querySelector('.pz-set[data-id="' + id + '"]');
      if (set) set.querySelectorAll(".parsons").forEach(function (b) {
        parts[b.getAttribute("data-part")] = { layer: b.getAttribute("data-layer"), label: b.getAttribute("data-label") };
      });
    }
    function live(p) { return p.solved ? p.ms : (p.ms || 0) + p.idle * 1000; }
    function started(p) { return p.solved || p.total > 0; }
    function who(p) {
      var pct = p.total ? Math.round(100 * p.right / p.total) : 0;
      var state = p.solved ? "✓ " + fmt(p.ms) : started(p) ? fmt(live(p)) : T.ready;
      return '<li class="' + (p.solved ? "done" : "") + '"><span class="pz-n">' + esc(p.name) + '</span><span class="pz-mini"><i style="width:' + pct + '%"></i></span>' +
        '<span class="pz-t">' + state + (p.tries ? " · " + p.tries + "×" : "") +
        (p.quiz === true ? ' <span class="pz-qm ok">?✓</span>' : p.quiz === false ? ' <span class="pz-qm no">?✗</span>' : "") + "</span></li>";
    }
    function render(players) {
      var solved = players.filter(function (p) { return p.solved; }).length;
      fill.style.width = (players.length ? 100 * solved / players.length : 0) + "%";
      var all = players.length && solved === players.length;
      var total = all ? Math.max.apply(null, players.map(function (p) { return p.ms; })) : 0;
      var txt = T.solved(solved, players.length);
      var answered = players.filter(function (p) { return p.quiz != null; });
      if (answered.length) txt += " · " + T.understood(answered.filter(function (p) { return p.quiz; }).length, answered.length);
      if (all) txt += " · " + (build ? T.built(fmt(total)) : T.classDone(fmt(total))) + (goal ? " · " + (total <= goal * 1000 ? T.goalOk : T.goalMiss) : "");
      count.textContent = txt;
      board.classList.toggle("all", !!all);
      if (!players.length) { body.innerHTML = '<p class="pz-wait">' + T.waiting + "</p>"; return; }
      if (build) renderBuild(players); else renderTeams(players);
    }
    function renderTeams(players) {
      var teams = {};
      players.forEach(function (p) { (teams[p.team] = teams[p.team] || []).push(p); });
      var list = Object.keys(teams).map(function (k) {
        var ps = teams[k], done = ps.every(function (p) { return p.solved; });
        var prog = ps.reduce(function (a, p) { return a + (p.total ? p.right / p.total : 0); }, 0) / ps.length;
        return { k: k, ps: ps, done: done, time: done ? Math.max.apply(null, ps.map(function (p) { return p.ms; })) : 0, prog: prog };
      });
      list.sort(function (a, b) { return Number(a.k) - Number(b.k) || (a.k < b.k ? -1 : 1); });
      // sem ranking: as equipas não competem, a meta é da turma toda
      body.innerHTML = '<div class="pz-teams">' + list.map(function (t) {
        var badge = t.done ? '<span class="pz-rank">✓ ' + fmt(t.time) + "</span>" : '<span class="pz-rank todo">' + Math.round(t.prog * 100) + "%</span>";
        return '<div class="pz-team' + (t.done ? " done" : "") + '"><h4>' + T.team + " " + esc(t.k) + badge + "</h4><ul>" + t.ps.map(who).join("") + "</ul></div>";
      }).join("") + "</div>";
    }
    function renderBuild(players) {
      var layers = [], by = {};
      Object.keys(parts).forEach(function (k) { var L = parts[k].layer; if (!by[L]) { by[L] = []; layers.push(L); } by[L].push(k); });
      var html = '<div class="pz-layers">' + layers.map(function (L) {
        var ps = players.filter(function (p) { return by[L].indexOf(p.part) >= 0; });
        var prog = ps.length ? ps.reduce(function (a, p) { return a + (p.solved ? 1 : p.total ? p.right / p.total : 0); }, 0) / ps.length : 0;
        var rows = by[L].map(function (k) {
          var mine = ps.filter(function (p) { return p.part === k; });
          return '<div class="pz-piece"><code>' + esc(parts[k].label) + "</code><ul>" + mine.map(who).join("") + "</ul></div>";
        }).join("");
        return '<div class="pz-layer" data-layer="' + esc(L) + '"><div class="pz-lh"><b>' + esc(L) + '</b><span>' + Math.round(prog * 100) + '%</span></div>' +
          '<div class="pz-track big"><i style="width:' + (prog * 100) + '%"></i></div>' + rows + "</div>";
      }).join("") + "</div>";
      var left = players.filter(function (p) { return !p.solved; });
      if (left.length && left.length < players.length) html += '<p class="pz-help"><b>' + T.still + "</b> " + left.map(function (p) { return esc(p.name) + (parts[p.part] ? " (" + esc(parts[p.part].label) + ")" : ""); }).join(", ") + "</p>";
      body.innerHTML = html;
    }
    function active() { var s = board.closest(".slide"); return !s || s.classList.contains("active") || document.querySelector(".deck.doc"); }
    function poll() {
      if (active() && !document.hidden) {
        fetch(API + encodeURIComponent(host.code) + "/" + encodeURIComponent(id))
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (d) { if (d) render(d.players); board.classList.toggle("off", !d); })
          .catch(function () { board.classList.add("off"); });
      }
    }
    poll(); setInterval(poll, 1500);
  }


  // ----- sequência de exercícios, cada aluno ao seu ritmo -----
  //   <div class="pz-seq" data-id="a14"> com vários .parsons, cada um com data-id e data-label
  function initTrack(track) {
    var tid = track.getAttribute("data-id");
    var boxes = Array.prototype.slice.call(track.querySelectorAll(".parsons"));
    var key = "pz-track-" + tid, st = load(key) || { cur: 0, solved: [] };
    var nav = el("div", "pz-nav");
    var ctl = boxes.map(function (b, i) {
      var id = b.getAttribute("data-id");
      return initPuzzle(b, function (body) { send(id, body); }, { onSolved: function () {
        if (st.solved.indexOf(id) < 0) st.solved.push(id);
        save(key, st); paint();
      } });
    });
    var gate = joinBar();
    track.insertBefore(gate, track.firstChild);
    track.insertBefore(nav, gate.nextSibling);
    boxes.forEach(function (b, i) { if (st.solved.indexOf(b.getAttribute("data-id")) >= 0) ctl[i].restore(); });
    function paint() {
      var on = !!joined();
      nav.hidden = !on;
      boxes.forEach(function (b, i) { b.hidden = !on || i !== st.cur; });
      if (!on) return;
      var n = boxes.length, solved = function (i) { return st.solved.indexOf(boxes[i].getAttribute("data-id")) >= 0; };
      // números agrupados por capítulo (data-chapter), na ordem em que aparecem
      var chapters = [];
      boxes.forEach(function (b, i) {
        var c = b.getAttribute("data-chapter") || "";
        if (!chapters.length || chapters[chapters.length - 1].name !== c) chapters.push({ name: c, idx: [] });
        chapters[chapters.length - 1].idx.push(i);
      });
      var dots = chapters.map(function (c) {
        return '<div class="pz-chap">' + (c.name ? "<span>" + esc(c.name) + "</span>" : "") + '<div class="pz-dots">' + c.idx.map(function (i) {
          var b = boxes[i];
          return '<button type="button" class="pz-dot' + (solved(i) ? " done" : "") + (i === st.cur ? " cur" : "") + '" data-i="' + i + '" title="' + esc(b.getAttribute("data-label") || "") + '">' + (i + 1) + "</button>";
        }).join("") + "</div></div>";
      }).join("");
      var chap = boxes[st.cur].getAttribute("data-chapter");
      nav.innerHTML = '<div class="pz-chaps">' + dots + "</div>" +
        '<div class="pz-navrow">' + (chap ? '<span class="pz-chapname">' + esc(chap) + "</span> " : "") + "<b>" + T.ex(st.cur + 1, n) + "</b> · " + esc(boxes[st.cur].getAttribute("data-label") || "") +
        '<span class="pz-navbtns"><button type="button" class="pz-prev"' + (st.cur ? "" : " disabled") + ">" + T.prev + "</button>" +
        '<button type="button" class="pz-next' + (solved(st.cur) ? " go" : "") + '"' + (st.cur < n - 1 ? "" : " disabled") + ">" + (solved(st.cur) ? T.next : T.skip) + "</button></span></div>";
    }
    function go(i) {
      if (i < 0 || i >= boxes.length) return;
      st.cur = i; save(key, st); paint();
      var id = boxes[i].getAttribute("data-id");
      // avisa o painel de que o aluno está neste exercício (sem apagar progresso que já lá esteja)
      if (!ctl[i].last() && st.solved.indexOf(id) < 0) send(id, { right: 0, total: ctl[i].total, tries: 0, ms: 0, solved: false });
      // só desliza se o início dos exercícios estiver fora de vista, e sem animação (não se arrasta a meio)
      var top = track.getBoundingClientRect().top;
      if (top < 0 || top > innerHeight * 0.6) track.scrollIntoView({ block: "start" });
    }
    nav.addEventListener("click", function (e) {
      var d = e.target.closest(".pz-dot"); if (d) { go(Number(d.dataset.i)); return; }
      if (e.target.closest(".pz-prev")) go(st.cur - 1);
      else if (e.target.closest(".pz-next")) go(st.cur + 1);
    });
    listeners.push(function () { paint(); if (joined()) go(st.cur); });
    paint();
    if (joined()) go(st.cur);
  }

  // ----- painel do professor: estado da turma, todos os exercícios -----
  //   <div class="pz-room-board" data-track="a14"></div>
  function initRoomBoard(board) {
    var track = document.querySelector('.pz-seq[data-id="' + board.getAttribute("data-track") + '"]');
    var ex = track ? Array.prototype.map.call(track.querySelectorAll(".parsons"), function (b) {
      return { id: b.getAttribute("data-id"), label: b.getAttribute("data-label") || b.getAttribute("data-id"), chapter: b.getAttribute("data-chapter") || "" };
    }) : [];
    var host = load("pz-host") || {}, day = new Date().toISOString().slice(0, 10);
    if (!host.code || host.day !== day) { host = { code: String(1000 + Math.floor(Math.random() * 9000)), day: day, starts: {} }; save("pz-host", host); }
    board.innerHTML = '<div class="pz-top"><div class="pz-code"><span>' + T.code + '</span><b></b></div>' +
      '<div class="pz-sum"></div><div class="pz-actions"><button type="button" class="pz-new">' + T.newRoom + "</button></div></div>" +
      '<div class="pz-grid"></div>';
    var codeEl = board.querySelector(".pz-code b"), grid = board.querySelector(".pz-grid"), sum = board.querySelector(".pz-sum");
    codeEl.textContent = host.code;
    board.querySelector(".pz-new").onclick = function () {
      host = { code: String(1000 + Math.floor(Math.random() * 9000)), day: day, starts: {} }; save("pz-host", host);
      codeEl.textContent = host.code; grid.innerHTML = "";
    };
    function render(room) {
      var people = {};
      Object.keys(room.puzzles).forEach(function (pid) {
        room.puzzles[pid].forEach(function (p) {
          var s = people[p.id] = people[p.id] || { name: p.name, by: {}, idle: 1e9, cur: null };
          s.by[pid] = p;
          if (p.idle < s.idle) { s.idle = p.idle; s.cur = pid; }
        });
      });
      var list = Object.keys(people).map(function (k) { return people[k]; });
      list.sort(function (a, b) { return a.name.localeCompare(b.name); });
      if (!list.length) { grid.innerHTML = '<p class="pz-wait">' + T.noone + "</p>"; sum.textContent = ""; return; }
      var solvedBy = {}, quizOk = 0, quizN = 0;
      var chaps = [];
      ex.forEach(function (e) { if (!chaps.length || chaps[chaps.length - 1].name !== e.chapter) chaps.push({ name: e.chapter, n: 0 }); chaps[chaps.length - 1].n++; });
      var head = (chaps.some(function (c) { return c.name; }) ? '<tr class="chap"><th></th>' + chaps.map(function (c) { return '<th colspan="' + c.n + '">' + esc(c.name) + "</th>"; }).join("") + "<th></th></tr>" : "") +
        "<tr><th>" + T.student + "</th>" + ex.map(function (e, i) { return '<th title="' + esc(e.label) + '">' + (i + 1) + "</th>"; }).join("") + "<th></th></tr>";
      var rows = list.map(function (s) {
        var n = 0;
        var cells = ex.map(function (e) {
          var p = s.by[e.id];
          if (!p) return '<td class="c"></td>';
          if (p.quiz != null) { quizN++; if (p.quiz) quizOk++; }
          var q = p.quiz === true ? '<i class="q ok"></i>' : p.quiz === false ? '<i class="q no"></i>' : "";
          if (p.solved) { n++; solvedBy[e.id] = (solvedBy[e.id] || 0) + 1; return '<td class="c done' + (s.cur === e.id ? " cur" : "") + '">✓' + q + "</td>"; }
          var pct = p.total ? Math.round(100 * p.right / p.total) : 0;
          return '<td class="c work' + (s.cur === e.id ? " cur" : "") + '"><span class="pz-mini"><i style="width:' + pct + '%"></i></span>' + (p.tries ? "<small>" + p.tries + "×</small>" : "") + "</td>";
        }).join("");
        var curP = s.cur && s.by[s.cur], note = "";
        if (curP && !curP.solved && curP.idle >= 180) note = '<span class="pz-flag stuck">' + T.stuck(Math.floor(curP.idle / 60)) + "</span>";
        return '<tr><td class="n">' + esc(s.name) + "<small>" + T.done(n, ex.length) + "</small></td>" + cells + "<td>" + note + "</td></tr>";
      }).join("");
      var foot = "<tr class=\"tot\"><td></td>" + ex.map(function (e) { return "<td>" + (solvedBy[e.id] || 0) + "</td>"; }).join("") + "<td></td></tr>";
      grid.innerHTML = '<table class="pz-table">' + head + rows + foot + "</table>";
      sum.textContent = T.students(list.length) + (quizN ? " · " + T.understood(quizOk, quizN) : "");
    }
    function active() { var s = board.closest(".slide"); return !s || s.classList.contains("active") || document.querySelector(".deck.doc"); }
    function poll() {
      if (!active() || document.hidden) return;
      fetch(API + encodeURIComponent(host.code))
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d) render(d); board.classList.toggle("off", !d); })
        .catch(function () { board.classList.add("off"); });
    }
    poll(); setInterval(poll, 2000);
  }

  function boot() {
    document.querySelectorAll(".pz-seq").forEach(initTrack);
    document.querySelectorAll(".pz-set").forEach(initSet);
    document.querySelectorAll(".parsons").forEach(function (b) { if (!b.closest(".pz-set") && !b.closest(".pz-seq")) initSingle(b); });
    document.querySelectorAll(".pz-board").forEach(initBoard);
    document.querySelectorAll(".pz-room-board").forEach(initRoomBoard);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

/* Laboratório de observabilidade · PDM
   Uma mini "Tempo Açores" no browser, para os alunos abrirem pelo QR. Tem de propósito
   uma ilha que rebenta (Corvo) e uma lenta (Flores). Com O2_TOKEN preenchido, manda para o
   OpenObserve (logs.sublimecipher.com), pelo SDK de RUM: ecrãs, toques, eventos do funil,
   erros e a gravação da sessão. Duas feature flags vêm de um ficheiro na pdm-api que o
   professor muda durante a aula (chega a todos os telemóveis em ~5 s):
   "corvo" é um kill switch (false põe a previsão do Corvo em pausa, sem erro) e
   "ab_favorito" liga um teste A/B ao botão dos favoritos (metade dos telemóveis vê a versão B).
   Sem token funciona igual, sem mandar nada. */
(function () {
  "use strict";
  // Token RUM do OpenObserve: só serve para enviar dados, não dá para ler nada. OBS_O2_TOKEN só nos testes.
  var O2_TOKEN = window.OBS_O2_TOKEN !== undefined ? window.OBS_O2_TOKEN : "rumFhs19PPQ0gBA96R0";
  var O2_SITE = "logs.sublimecipher.com";
  var FLAGS_URL = window.OBS_FLAGS_URL || "https://api-pdm.sublimecipher.com/static/lab/flags.json";
  var VENDOR = (document.currentScript && document.currentScript.src || "").replace(/obs\.js(\?.*)?$/, "vendor/o2/");

  var app = document.getElementById("app");
  var LANG = document.documentElement.getAttribute("data-lang") === "en" ? "en" : "pt";
  var LOCALE = LANG === "en" ? "en-GB" : "pt-PT";

  var TX = {
    pt: {
      app: "Tempo Açores",
      live: "ao vivo", off: "offline",
      ilhas: "Ilhas", favs: "Favoritos",
      intro: "Escolhe uma ilha e vê a previsão para cinco dias.",
      back: "Ilhas",
      fav: "Guardar nos favoritos", faved: "Nos favoritos",
      favB: "Guardar esta ilha", favedB: "Guardada",
      noFavs: "Ainda sem favoritos. Abre uma ilha e toca em Guardar.",
      loading: "A carregar a previsão…",
      slow: "Está a demorar. A culpa não é da tua rede.",
      crashT: "Algo correu mal",
      crashP: "Não conseguimos mostrar esta ilha.",
      crashSent: "O erro já chegou ao professor, com o que estavas a fazer antes.",
      retry: "Tentar outra vez",
      pausa: "em pausa",
      pausaT: "Previsão em pausa",
      pausaP: "A previsão do Corvo está desligada enquanto a corrigimos. As outras ilhas funcionam.",
      privOn: "O que fazes aqui chega ao painel do professor: ecrãs, toques e erros. Sem nome, email nem localização.",
      privOff: "Nesta versão nada sai do telemóvel.",
      desk: "Abre no telemóvel:",
      other: "EN",
      desc: { sol: "Sol", nuvens: "Nuvens e abertas", aguaceiros: "Aguaceiros", chuva: "Chuva", vento: "Vento forte" }
    },
    en: {
      app: "Azores Weather",
      live: "live", off: "offline",
      ilhas: "Islands", favs: "Favourites",
      intro: "Pick an island and see the five day forecast.",
      back: "Islands",
      fav: "Save to favourites", faved: "In favourites",
      favB: "Save this island", favedB: "Saved",
      noFavs: "No favourites yet. Open an island and tap Save.",
      loading: "Loading the forecast…",
      slow: "This is taking a while. It is not your network.",
      crashT: "Something went wrong",
      crashP: "We could not show this island.",
      crashSent: "The error has reached the teacher, along with what you did before it.",
      retry: "Try again",
      pausa: "paused",
      pausaT: "Forecast paused",
      pausaP: "The Corvo forecast is switched off while we fix it. The other islands work.",
      privOn: "What you do here reaches the teacher's dashboard: screens, taps and errors. No name, email or location.",
      privOff: "In this version nothing leaves your phone.",
      desk: "Open it on your phone:",
      other: "PT",
      desc: { sol: "Sunny", nuvens: "Sunny spells", aguaceiros: "Showers", chuva: "Rain", vento: "Strong wind" }
    }
  }[LANG];

  var IC = { sol: "☀️", nuvens: "⛅", aguaceiros: "🌦️", chuva: "🌧️", vento: "💨" };

  // Dados fixos, parecidos com os da API. Na lista o Corvo parece normal, mas a previsão vem com
  // a lista de dias vazia (o bug);
  // as Flores demoram (a lentidão).
  var ILHAS = [
    { id: "sao-miguel", nome: "São Miguel", max: 19, c: ["nuvens", "aguaceiros", "nuvens", "sol", "chuva"] },
    { id: "terceira", nome: "Terceira", max: 18, c: ["aguaceiros", "nuvens", "nuvens", "chuva", "sol"] },
    { id: "pico", nome: "Pico", max: 18, c: ["sol", "nuvens", "vento", "aguaceiros", "nuvens"] },
    { id: "faial", nome: "Faial", max: 18, c: ["nuvens", "nuvens", "vento", "aguaceiros", "sol"] },
    { id: "sao-jorge", nome: "São Jorge", max: 17, c: ["chuva", "aguaceiros", "nuvens", "nuvens", "sol"] },
    { id: "graciosa", nome: "Graciosa", max: 18, c: ["nuvens", "sol", "sol", "vento", "aguaceiros"] },
    { id: "santa-maria", nome: "Santa Maria", max: 20, c: ["sol", "sol", "nuvens", "aguaceiros", "nuvens"] },
    { id: "flores", nome: "Flores", max: 17, c: ["vento", "chuva", "aguaceiros", "nuvens", "nuvens"], lenta: 4500 },
    { id: "corvo", nome: "Corvo", max: 16, hoje: "nuvens", c: [] }
  ];

  function previsao(ilha) {
    // Devolve { dias: [{ max, min, c }] }. Para o Corvo a lista vem vazia.
    return { dias: ilha.c.map(function (c, i) { var m = ilha.max + [0, -1, 1, 0, -2][i]; return { max: m, min: m - 5, c: c }; }) };
  }

  // ---------- OpenObserve ----------
  // RUM do OpenObserve: ecrãs, toques, eventos do funil (actions), erros e gravação da sessão.
  var ph = null;
  // Valores por defeito: sem rede para as flags, a app comporta-se como sempre.
  var flags = { corvo: true, ab_favorito: false };
  function track(ev, props) {
    if (window.__obs) window.__obs.push(ev);
    ultimoEvento = ev;
    if (!ph) return;
    var p = Object.assign({ variante: variante() }, props || {});
    ph.addAction(ev, p);
  }
  function erro(err, ctx) {
    if (window.__obs) window.__obs.push("erro:" + (ctx.ilha_id || "?"));
    if (!ph) return;
    ph.addError(err, Object.assign({ depois_de: ultimoEvento }, ctx));
  }
  var ultimoEvento = null;

  function script(src) {
    return new Promise(function (ok, falha) {
      var s = document.createElement("script");
      s.src = src; s.async = true; s.onload = ok; s.onerror = falha;
      document.head.appendChild(s);
    });
  }

  function ligarOpenObserve() {
    if (!O2_TOKEN || O2_TOKEN.indexOf("__") === 0) return;
    var base = { clientToken: O2_TOKEN, site: O2_SITE, organizationIdentifier: "default", service: "lab-obs",
      env: window.OBS_ENV || "aula", version: "1.0.0", apiVersion: "v1", insecureHTTP: false };
    script(VENDOR + "openobserve-rum.js").then(function () {
      var rum = window.O2_RUM;
      if (!rum) return;
      rum.init(Object.assign({ applicationId: "lab-obs", sessionSampleRate: 100, sessionReplaySampleRate: 100,
        trackUserInteractions: true, trackResources: false, trackLongTasks: true, defaultPrivacyLevel: "mask-user-input" }, base));
      // o RUM também apanha os erros sem catch, como o PlatformDispatcher.onError
      rum.setGlobalContextProperty("lab", "obs"); rum.setGlobalContextProperty("lang", LANG);
      rum.setGlobalContextProperty("variante", variante());
      ph = rum;
      track("app_aberta");
      render();
    }, function () { /* sem rede para o OpenObserve: fica offline */ });
  }

  // As flags vêm de um ficheiro pequeno; o professor muda-o e todos os telemóveis o leem a cada 5 s.
  function lerFlags() {
    if (document.visibilityState !== "visible") return;
    fetch(FLAGS_URL, { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (f) {
      f = f || {};
      var novo = { corvo: f.corvo !== false, ab_favorito: f.ab_favorito === true };
      if (novo.corvo !== flags.corvo || novo.ab_favorito !== flags.ab_favorito) {
        flags = novo;
        if (ph) ph.setGlobalContextProperty("variante", variante());
        render();
      }
    }, function () {});
  }

  // Teste A/B: cada telemóvel tira à sorte A ou B uma vez e fica sempre no mesmo grupo.
  // Com o teste desligado, todos veem a versão A.
  var GRUPO = (function () {
    var g = null;
    try { g = localStorage.getItem("obs-grupo"); } catch (e) { /* modo privado */ }
    if (g !== "A" && g !== "B") {
      g = Math.random() < 0.5 ? "A" : "B";
      try { localStorage.setItem("obs-grupo", g); } catch (e) { /* modo privado */ }
    }
    return g;
  })();
  function variante() { return flags.ab_favorito ? GRUPO : "sem_teste"; }

  // ---------- Favoritos ----------
  var FK = "obs-favs";
  function favs() { try { return JSON.parse(localStorage.getItem(FK)) || []; } catch (e) { return []; } }
  function setFavs(l) { try { localStorage.setItem(FK, JSON.stringify(l)); } catch (e) { /* modo privado */ } }

  // ---------- Ecrãs ----------
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function rota() { var h = location.hash.replace(/^#\/?/, ""); return h.split("/"); }
  function ir(h) { location.hash = "#/" + h; }
  function porId(id) { for (var i = 0; i < ILHAS.length; i++) if (ILHAS[i].id === id) return ILHAS[i]; return null; }

  function topo() {
    var t = el("div", "top");
    t.appendChild(el("b", null, TX.app));
    var d = el("div"); d.style.display = "flex"; d.style.gap = "8px";
    var live = el("span", "live" + (ph ? " on" : ""), "<i></i>" + (ph ? TX.live : TX.off));
    var a = el("a", null, TX.other); a.href = app.getAttribute("data-other") + location.hash;
    d.appendChild(live); d.appendChild(a); t.appendChild(d);
    return t;
  }

  function linhaIlha(ilha, f) {
    var b = el("button", "ilha");
    var hoje = ilha.c[0] || ilha.hoje, parada = desligada(ilha);
    b.innerHTML = '<span class="ic">' + (parada ? "⏸️" : hoje ? IC[hoje] : "·") + '</span><span class="nome">' + ilha.nome + "</span>" +
      (f.indexOf(ilha.id) >= 0 ? '<span class="fav">★</span>' : "") +
      (parada ? '<span class="pausa">' + TX.pausa + "</span>" : '<span class="t num">' + (hoje ? ilha.max + "°" : "") + "</span>");
    b.onclick = function () { ir("ilha/" + ilha.id); };
    return b;
  }

  function vistaLista(v) {
    v.appendChild(el("h1", null, TX.ilhas));
    v.appendChild(el("p", "what", TX.intro));
    var ul = el("div", "ilhas"), f = favs();
    ILHAS.forEach(function (i) { ul.appendChild(linhaIlha(i, f)); });
    v.appendChild(ul);
    v.appendChild(el("p", "priv", ph ? TX.privOn : TX.privOff));
  }

  function vistaFavs(v) {
    v.appendChild(el("h1", null, TX.favs));
    var f = favs();
    if (!f.length) { v.appendChild(el("p", "what", TX.noFavs)); return; }
    var ul = el("div", "ilhas");
    f.forEach(function (id) { var i = porId(id); if (i) ul.appendChild(linhaIlha(i, f)); });
    v.appendChild(ul);
  }

  // Kill switch: com a flag corvo a false, a previsão do Corvo nem é pedida.
  function desligada(ilha) { return ilha.id === "corvo" && !flags.corvo; }

  var carregamento = 0;
  function vistaIlha(v, ilha) {
    var voltar = el("button", "back", "‹ " + TX.back);
    voltar.onclick = function () { ir(""); };
    v.appendChild(voltar);
    v.appendChild(el("h1", null, ilha.nome));
    var corpo = el("div"); corpo.style.display = "contents";
    v.appendChild(corpo);

    var meu = ++carregamento, t0 = Date.now();
    if (desligada(ilha)) {
      corpo.appendChild(el("div", "estado", '<div class="ic">⏸️</div><h2>' + TX.pausaT + "</h2><p>" + TX.pausaP + "</p>"));
      track("previsao_em_pausa", { ilha: ilha.nome });
    } else if (ilha.lenta) {
      var est = el("div", "estado", '<div class="spin"></div><p>' + TX.loading + "</p>");
      corpo.appendChild(est);
      setTimeout(function () { if (meu === carregamento) est.querySelector("p").textContent = TX.slow; }, 2500);
      setTimeout(function () { if (meu === carregamento) { corpo.innerHTML = ""; mostrar(); } }, ilha.lenta);
    } else {
      mostrar();
    }

    function mostrar() {
      try {
        desenharPrevisao(corpo, ilha, previsao(ilha));
        track("previsao_carregada", { ilha: ilha.nome, ms: Date.now() - t0 });
      } catch (err) {
        // Tal como o FlutterError.onError: o erro não mata a app, mostra um estado de erro e vai para o painel.
        erro(err, { ilha: ilha.nome, ilha_id: ilha.id, ecra: "previsao" });
        corpo.innerHTML = "";
        var e = el("div", "estado");
        e.innerHTML = '<div class="ic">⚠️</div><h2>' + TX.crashT + "</h2><p>" + TX.crashP + (ph ? " " + TX.crashSent : "") + "</p><code></code>";
        e.querySelector("code").textContent = String(err && err.message || err);
        var r = el("button", "btn sec", TX.retry);
        r.onclick = function () { track("tentar_outra_vez", { ilha: ilha.nome }); corpo.innerHTML = ""; mostrar(); };
        e.appendChild(r);
        corpo.appendChild(e);
      }
    }
  }

  function desenharPrevisao(corpo, ilha, p) {
    var hoje = p.dias[0];
    var hero = el("div", "hero");
    // No Corvo, hoje é undefined e a linha seguinte rebenta (TypeError).
    hero.innerHTML = '<div class="ic">' + IC[hoje.c] + '</div><div><div class="t num">' + hoje.max + "°<small>" + hoje.min + "°</small></div>" +
      '<div class="desc">' + TX.desc[hoje.c] + "</div></div>";
    corpo.appendChild(hero);
    // Versão B do teste: o botão sobe para logo a seguir a hoje, maior e com outro texto.
    var B = variante() === "B";
    if (B) corpo.appendChild(botaoFav(ilha, true));

    var dias = el("div", "dias"), d = new Date();
    p.dias.forEach(function (x, i) {
      var dd = new Date(d.getTime() + i * 864e5);
      var nome = dd.toLocaleDateString(LOCALE, { weekday: "short" }).replace(".", "");
      dias.appendChild(el("div", "dia", nome + '<span class="ic">' + IC[x.c] + '</span><b class="num">' + x.max + "°</b>"));
    });
    corpo.appendChild(dias);
    if (!B) corpo.appendChild(botaoFav(ilha, false));
  }

  function botaoFav(ilha, B) {
    var base = B ? "btn b" : "btn";
    function texto(on) { return B ? (on ? "❤️ " + TX.favedB : "❤️ " + TX.favB) : (on ? "★ " + TX.faved : "☆ " + TX.fav); }
    var ja = favs().indexOf(ilha.id) >= 0;
    var b = el("button", base + (ja ? " on" : ""));
    b.textContent = texto(ja);
    b.onclick = function () {
      var l = favs(), i = l.indexOf(ilha.id);
      if (i >= 0) { l.splice(i, 1); track("favorito_removido", { ilha: ilha.nome }); }
      else { l.push(ilha.id); track("favorito_guardado", { ilha: ilha.nome }); }
      setFavs(l);
      var on = i < 0;
      b.className = base + (on ? " on" : "");
      b.textContent = texto(on);
    };
    return b;
  }

  function navegacao(atual) {
    var n = el("nav", "nav"), d = el("div");
    var tabs = [["", TX.ilhas], ["favoritos", TX.favs]];
    tabs.forEach(function (t) {
      var b = el("button", t[0] === atual ? "on" : "", t[1]);
      b.onclick = function () { ir(t[0]); };
      d.appendChild(b);
    });
    n.appendChild(d);
    return n;
  }

  var ultimaRota = null;
  function render() {
    var r = rota(), chave = r.join("/");
    // A flag pode mudar com o aluno dentro de uma ilha: redesenha o ecrã sem contar outra visita.
    var mesma = chave === ultimaRota;
    ultimaRota = chave;
    var scroll = window.scrollY;
    app.innerHTML = "";
    app.appendChild(topo());
    var v = el("main", "view");
    app.appendChild(v);
    var atual = "";
    if (r[0] === "ilha" && porId(r[1])) {
      var ilha = porId(r[1]);
      if (!mesma) track("ilha_aberta", { ilha: ilha.nome });
      vistaIlha(v, ilha);
      atual = null;
    } else if (r[0] === "favoritos") { vistaFavs(v); atual = "favoritos"; }
    else vistaLista(v);
    app.appendChild(navegacao(atual));
    if (mesma) window.scrollTo(0, scroll); else window.scrollTo(0, 0);
  }

  // QR para quem abre no computador
  var qr = app.getAttribute("data-qr");
  if (qr) {
    var box = el("aside", "qrbox");
    var url = location.href.replace(/[#?].*$/, "");
    box.innerHTML = '<img alt="QR"><p>' + TX.desk + "<br><code></code></p>";
    box.querySelector("img").src = qr;
    box.querySelector("code").textContent = url.replace(/^https?:\/\//, "");
    document.body.appendChild(box);
  }

  window.addEventListener("hashchange", render);
  render();
  ligarOpenObserve();
  if (O2_TOKEN && O2_TOKEN.indexOf("__") !== 0) { lerFlags(); setInterval(lerFlags, 5000); }
})();

/* Laboratório de sensores · PDM
   Lê os sensores do telemóvel no browser: DeviceMotionEvent (acelerómetro),
   rotationRate (giroscópio), DeviceOrientationEvent (bússola), Geolocation (GPS)
   e getUserMedia com a Web Audio API (microfone). Sem bibliotecas. */
(function () {
  "use strict";
  var app = document.getElementById("app");
  var LANG = document.documentElement.getAttribute("data-lang") === "en" ? "en" : "pt";
  var LOCALE = LANG === "en" ? "en-GB" : "pt-PT";
  var G = 9.80665;
  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  var TX = {
    pt: {
      title: "Laboratório de sensores",
      intro: "O teu telemóvel tem mais de dez sensores. Aqui vês cinco a trabalhar, ao vivo.",
      go: "Ligar sensores",
      perm: "No iPhone aparece um pedido de acesso ao movimento: é uma permissão, tal como as que a vossa app vai pedir.",
      denied: "Sem autorização não há dados. No iPhone: fecha o separador, abre outra vez e toca em Permitir.",
      desk: "Este computador não tem estes sensores. Abre no telemóvel:",
      other: "EN",
      hz: "leituras/s",
      tabs: { queda: "Queda", nivel: "Nível", rodopio: "Rodopio", bussola: "Bússola", gps: "GPS", som: "Som" },
      queda: {
        h: "Queda livre",
        what: "Larga o telemóvel para cima de um casaco ou almofada, de 30 a 60 cm. Nada de chão.",
        live: "força que o acelerómetro sente agora",
        rest: "parado", fall: "a cair!",
        last: "última queda", none: "ainda nenhuma",
        sec: "s no ar",
        target: function (d) { return d < 3 ? "Desafio dos 50 cm: acertaste!" : "Desafio dos 50 cm: falhaste por " + d + " cm"; },
        real: "<b>No mundo real:</b> durante a queda o acelerómetro marca quase zero. Um relógio percebe que caíste assim, e o iPhone deteta um acidente de carro pelo pico de força a seguir."
      },
      nivel: {
        h: "Nível",
        what: "Pousa o telemóvel numa mesa, ou segura-o de pé, e põe-no direito.",
        flat: "deitado", up: "de pé",
        level: "direito!",
        real: "<b>No mundo real:</b> o nível da app Medição, a grelha da câmara que avisa que a foto está torta, e o ecrã que roda sozinho. É o acelerómetro a ver para onde puxa a gravidade."
      },
      bussola: {
        h: "Bússola",
        what: "Segura o telemóvel deitado e roda devagar. Depois encosta-o ao portátil e vê o que acontece.",
        none: "Sem bússola: este browser não dá a direção.",
        calib: "Se a seta parecer errada, desenha um 8 no ar com o telemóvel.",
        acc: "precisão",
        from: "A partir da ESTA, em Ponta Delgada. Liga o GPS para usares onde estás.",
        fromGps: "A partir de onde estás (GPS).",
        hit: "Estás a apontar para ",
        real: "<b>No mundo real:</b> o Google Maps junta a bússola ao GPS para virar a seta para onde estás a olhar. Um íman ou o metal de um portátil engana-a."
      },
      gps: {
        h: "GPS",
        what: "Mede no meio da sala e depois junto à janela. O círculo é o que o telemóvel não sabe.",
        on: "Ligar GPS",
        wait: "À procura de satélites…",
        denied: "Recusaste a localização. Muda nas definições do browser para este site.",
        err: "Sem localização: ",
        acc: "precisão",
        lat: "latitude", lon: "longitude", alt: "altitude", spd: "velocidade", upd: "leituras", noalt: "sem dado",
        real: "<b>No mundo real:</b> o Uber e o Bolt mostram este círculo. Dentro de casa o telemóvel ajuda-se com o Wi-Fi e as antenas, por isso o círculo cresce."
      },
      rodopio: {
        h: "Rodopio",
        what: "Senta-te numa cadeira que rode, segura o telemóvel ao peito e dá voltas. Ou põe-no a rodar em cima da mesa.",
        turns: "voltas", now: "voltas por segundo agora", max: "o teu máximo", deg: "°/s",
        reset: "Recomeçar",
        none: "Sem giroscópio: este telemóvel não mede a rotação.",
        real: "<b>No mundo real:</b> o giroscópio só mede a velocidade de rotação. A câmara usa-o para o vídeo não tremer e um drone para se manter direito. Para contar voltas a página soma a velocidade ao longo do tempo, e o erro vai-se acumulando."
      },
      som: {
        h: "Som",
        what: "Liga o microfone e batam palmas todos juntos. Quem chega mais alto?",
        on: "Ligar microfone",
        denied: "Recusaste o microfone. Muda nas definições do browser para este site.",
        err: "Sem microfone: ",
        live: "nível de som agora", peak: "pico dos últimos 3 s", rec: "o teu recorde", reset: "Recomeçar",
        newRec: "Recorde novo!",
        zones: [[30, "sussurro"], [60, "conversa"], [80, "rua com trânsito"], [100, "concerto"]],
        approx: "Valor aproximado: o microfone do telemóvel não vem calibrado.",
        real: "<b>No mundo real:</b> o Apple Watch avisa quando o ruído passa os 80 dB durante uns minutos, e o Shazam ouve pelo mesmo microfone. É o sensor que pede sempre permissão."
      },
      places: ["Lisboa", "Nova Iorque", "Montanha do Pico", "Corvo"]
    },
    en: {
      title: "Sensor lab",
      intro: "Your phone has more than ten sensors. Here you can watch five of them working, live.",
      go: "Turn on sensors",
      perm: "On an iPhone you get a request for motion access: it is a permission, just like the ones your app will ask for.",
      denied: "No permission, no data. On an iPhone: close the tab, open it again and tap Allow.",
      desk: "This computer has none of these sensors. Open it on your phone:",
      other: "PT",
      hz: "readings/s",
      tabs: { queda: "Drop", nivel: "Level", rodopio: "Spin", bussola: "Compass", gps: "GPS", som: "Sound" },
      queda: {
        h: "Free fall",
        what: "Drop the phone onto a jacket or a cushion, from 30 to 60 cm. Never onto the floor.",
        live: "force the accelerometer feels right now",
        rest: "still", fall: "falling!",
        last: "last drop", none: "none yet",
        sec: "s in the air",
        target: function (d) { return d < 3 ? "50 cm challenge: spot on!" : "50 cm challenge: off by " + d + " cm"; },
        real: "<b>In the real world:</b> while falling the accelerometer reads almost zero. A watch notices you fell this way, and an iPhone detects a car crash from the spike of force that follows."
      },
      nivel: {
        h: "Level",
        what: "Lay the phone on a table, or hold it upright, and get it straight.",
        flat: "flat", up: "upright",
        level: "level!",
        real: "<b>In the real world:</b> the level in the iPhone Measure app, the camera grid that tells you the photo is crooked, and the screen that rotates by itself. It is the accelerometer seeing where gravity pulls."
      },
      bussola: {
        h: "Compass",
        what: "Hold the phone flat and turn slowly. Then put it next to a laptop and watch.",
        none: "No compass: this browser does not give the heading.",
        calib: "If the arrow looks wrong, draw a figure 8 in the air with the phone.",
        acc: "accuracy",
        from: "From ESTA, in Ponta Delgada. Turn on GPS to use where you are.",
        fromGps: "From where you are (GPS).",
        hit: "You are pointing at ",
        real: "<b>In the real world:</b> Google Maps combines the compass with GPS to turn the arrow to where you are looking. A magnet or the metal in a laptop fools it."
      },
      gps: {
        h: "GPS",
        what: "Measure in the middle of the room and then by the window. The circle is what the phone does not know.",
        on: "Turn on GPS",
        wait: "Looking for satellites…",
        denied: "You refused location. Change it in the browser settings for this site.",
        err: "No location: ",
        acc: "accuracy",
        lat: "latitude", lon: "longitude", alt: "altitude", spd: "speed", upd: "readings", noalt: "no data",
        real: "<b>In the real world:</b> Uber and Bolt show this circle. Indoors the phone helps itself with Wi-Fi and cell towers, so the circle grows."
      },
      rodopio: {
        h: "Spin",
        what: "Sit on a swivel chair, hold the phone to your chest and spin. Or spin it on the table.",
        turns: "turns", now: "turns per second now", max: "your best", deg: "°/s",
        reset: "Start over",
        none: "No gyroscope: this phone does not measure rotation.",
        real: "<b>In the real world:</b> the gyroscope only measures how fast it turns. The camera uses it to keep video steady and a drone to stay level. To count turns the page adds up the speed over time, and the error keeps piling up."
      },
      som: {
        h: "Sound",
        what: "Turn on the microphone and clap all together. Who gets the loudest?",
        on: "Turn on microphone",
        denied: "You refused the microphone. Change it in the browser settings for this site.",
        err: "No microphone: ",
        live: "sound level now", peak: "peak in the last 3 s", rec: "your record", reset: "Start over",
        newRec: "New record!",
        zones: [[30, "whisper"], [60, "conversation"], [80, "busy street"], [100, "concert"]],
        approx: "Rough value: the phone microphone is not calibrated.",
        real: "<b>In the real world:</b> an Apple Watch warns you when noise stays above 80 dB for a few minutes, and Shazam listens through the same microphone. It is the sensor that always asks for permission."
      },
      places: ["Lisbon", "New York", "Mount Pico", "Corvo"]
    }
  };
  var T = TX[LANG];

  var ESTA = { lat: 37.7478, lon: -25.6636 };
  var PLACES = [
    { lat: 38.7223, lon: -9.1393, c: "#ff6b4a" },
    { lat: 40.7128, lon: -74.0060, c: "#b6f36a" },
    { lat: 38.4686, lon: -28.3994, c: "#ffd166" },
    { lat: 39.6716, lon: -31.1114, c: "#b69cff" }
  ];
  PLACES.forEach(function (p, i) { p.name = T.places[i]; });

  function fmt(n, d) { return n.toLocaleString(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function $(s, r) { return (r || app).querySelector(s); }
  function vibrate(ms) { if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (_) {} } }
  var RAD = Math.PI / 180;

  var S = {
    tab: "queda", motion: 0, lastMotion: 0, hz: 0,
    ax: 0, ay: 0, az: G, mag: 1, hist: [],
    falling: false, fallStart: 0, cool: 0, drops: [],
    heading: null, headAcc: null, headSeen: false,
    pos: null, track: [], gpsUpd: 0, gpsOn: false,
    gyro: false, spin: 0, spinW: 0, spinMax: 0, spinLast: 0, spinTurns: 0, spinHist: [],
    micOn: false, db: null, dbHist: [], dbRec: 0, dbRecT: 0
  };
  // Microfone sem calibração: dB ≈ dBFS + CAL. ?cal=N na morada acerta o valor contra um sonómetro.
  var CAL = parseFloat((location.search.match(/[?&]cal=(-?\d+(?:\.\d+)?)/) || [])[1]) || 110;

  /* ---------- Ecrã inicial ---------- */
  function intro() {
    app.innerHTML = "";
    var v = el('<section class="intro"><div class="dots"><i></i><i></i><i></i><i></i><i></i><i></i></div>' +
      "<h1>" + T.title + "</h1><p>" + T.intro + "</p>" +
      '<button class="go" type="button">' + T.go + "</button>" +
      '<p class="small">' + T.perm + "</p>" +
      '<p class="err" hidden></p>' +
      '<div class="qr"><img alt="QR" src="' + app.getAttribute("data-qr") + '"></div>' +
      '<p class="small"><a style="color:inherit" href="' + app.getAttribute("data-other") + '">' + T.other + "</a></p></section>");
    app.appendChild(v);
    $(".go", v).addEventListener("click", start);
  }

  function showErr(msg, desk) {
    var v = $(".intro"); if (!v) return;
    var p = $(".err", v); p.textContent = msg; p.hidden = false;
    if (desk) v.classList.add("desk");
  }

  function start() {
    var asks = [];
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") asks.push(DeviceMotionEvent.requestPermission());
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") asks.push(DeviceOrientationEvent.requestPermission().catch(function () { return "denied"; }));
    // Se o pedido falhar ou for recusado, ouvimos na mesma: o que decide são os dados que chegam.
    var done = function (r) {
      var refused = r && r.length && r[0] !== "granted";
      listen();
      setTimeout(function () {
        if (S.motion > 0) { lab(); return; }
        stopListening();
        showErr(refused ? T.denied : T.desk, !refused);
      }, 1200);
    };
    Promise.all(asks).then(done, function () { done(["denied"]); });
  }

  /* ---------- Sensores ---------- */
  var absEvt = "ondeviceorientationabsolute" in window;
  function onAbs(e) { onOrient(e, true); }
  function onRel(e) { onOrient(e, false); }
  function listen() {
    window.addEventListener("devicemotion", onMotion);
    window.addEventListener(absEvt ? "deviceorientationabsolute" : "deviceorientation", absEvt ? onAbs : onRel);
    if (!S.hzTimer) S.hzTimer = setInterval(function () { S.hz = S.motion - S.lastMotion; S.lastMotion = S.motion; }, 1000);
  }
  function stopListening() {
    window.removeEventListener("devicemotion", onMotion);
    window.removeEventListener(absEvt ? "deviceorientationabsolute" : "deviceorientation", absEvt ? onAbs : onRel);
  }

  function onMotion(e) {
    var a = e.accelerationIncludingGravity;
    if (!a || a.x == null || a.y == null || a.z == null) return;
    // O Safari do iOS dá os eixos com o sinal trocado em relação à especificação.
    var s = isIOS ? -1 : 1;
    S.ax = a.x * s; S.ay = a.y * s; S.az = a.z * s;
    var t = performance.now();
    S.motion++;
    S.mag = Math.sqrt(S.ax * S.ax + S.ay * S.ay + S.az * S.az) / G;
    S.hist.push([t, S.mag]);
    while (S.hist.length && t - S.hist[0][0] > 4000) S.hist.shift();
    detectDrop(t, S.mag);
    spin(e, t);
  }

  // Rodopio: a rotação à volta da vertical é a projeção da velocidade angular na direção da gravidade.
  function spin(e, t) {
    var r = e.rotationRate;
    if (!r || r.alpha == null || r.beta == null || r.gamma == null) return;
    S.gyro = true;
    var m = Math.sqrt(S.ax * S.ax + S.ay * S.ay + S.az * S.az) || G;
    var w = (r.beta * S.ax + r.gamma * S.ay + r.alpha * S.az) / m;
    var dt = S.spinLast ? Math.min(0.1, (t - S.spinLast) / 1000) : 0;
    S.spinLast = t;
    S.spinW = S.spinW * 0.8 + w * 0.2;
    // Abaixo de 20 °/s conta como parado: é ruído e faria as voltas andar sozinhas.
    if (Math.abs(w) > 20) S.spin += w * dt;
    var turns = Math.floor(Math.abs(S.spin) / 360);
    if (turns > S.spinTurns) vibrate(25);
    S.spinTurns = turns;
    var tps = Math.abs(S.spinW) / 360;
    if (tps > S.spinMax) S.spinMax = tps;
    S.spinHist.push([t, tps]);
    while (S.spinHist.length && t - S.spinHist[0][0] > 6000) S.spinHist.shift();
  }

  // Queda livre: a força cai abaixo de 0,35 g e só volta acima de 0,75 g no impacto.
  function detectDrop(t, m) {
    if (!S.falling) {
      if (m < 0.35 && t > S.cool) { S.falling = true; S.fallStart = t; }
      return;
    }
    if (m > 0.75) {
      var dur = (t - S.fallStart) / 1000;
      S.falling = false; S.cool = t + 700;
      if (dur >= 0.1 && dur < 2) {
        var cm = Math.round(0.5 * G * dur * dur * 100);
        S.drops.unshift({ dur: dur, cm: cm });
        if (S.drops.length > 8) S.drops.pop();
        vibrate(80);
        renderDrop();
      }
    } else if (t - S.fallStart > 2500) {
      S.falling = false;
    }
  }

  function onOrient(e, abs) {
    var h = null;
    if (typeof e.webkitCompassHeading === "number" && !isNaN(e.webkitCompassHeading)) {
      h = e.webkitCompassHeading;
      S.headAcc = typeof e.webkitCompassAccuracy === "number" && e.webkitCompassAccuracy >= 0 ? e.webkitCompassAccuracy : null;
    } else if ((abs || e.absolute) && e.alpha != null) {
      h = (360 - e.alpha) % 360;
    }
    if (h == null) return;
    S.headSeen = true;
    if (S.heading == null) { S.heading = h; return; }
    var d = ((h - S.heading + 540) % 360) - 180;
    S.heading = (S.heading + d * 0.3 + 360) % 360;
  }

  function startGps() {
    if (S.gpsOn || !navigator.geolocation) return;
    S.gpsOn = true;
    var st = $("#gps-state"); st.textContent = T.gps.wait; st.hidden = false;
    $("#gps-btn").hidden = true;
    navigator.geolocation.watchPosition(function (p) {
      S.pos = p; S.gpsUpd++;
      S.track.push({ lat: p.coords.latitude, lon: p.coords.longitude });
      if (S.track.length > 200) S.track.shift();
      st.hidden = true;
      renderGps(); renderTargets();
    }, function (err) {
      st.hidden = false;
      st.textContent = err.code === 1 ? T.gps.denied : T.gps.err + err.message;
      if (err.code === 1) { S.gpsOn = false; $("#gps-btn").hidden = false; }
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
  }

  /* ---------- Microfone ---------- */
  var mic = null;
  function startMic() {
    if (S.micOn) return;
    var st = $("#mic-state"), Ctx = window.AudioContext || window.webkitAudioContext;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !Ctx) {
      st.textContent = T.som.err + "getUserMedia"; st.hidden = false; return;
    }
    S.micOn = true;
    // O AudioContext tem de nascer dentro do toque, senão o Safari deixa-o suspenso.
    var ac = new Ctx();
    if (ac.resume) ac.resume();
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (stream) {
      var an = ac.createAnalyser(); an.fftSize = 2048;
      ac.createMediaStreamSource(stream).connect(an);
      mic = { ac: ac, an: an, buf: new Float32Array(an.fftSize) };
      st.hidden = true; $("#mic-btn").hidden = true;
    }, function (err) {
      S.micOn = false; ac.close && ac.close();
      st.hidden = false;
      st.textContent = err && err.name === "NotAllowedError" ? T.som.denied : T.som.err + (err && err.message || err);
    });
  }

  function readMic(t) {
    if (!mic) return;
    if (mic.ac.state === "suspended" && mic.ac.resume) mic.ac.resume();
    mic.an.getFloatTimeDomainData(mic.buf);
    var sum = 0, b = mic.buf;
    for (var i = 0; i < b.length; i++) sum += b[i] * b[i];
    var rms = Math.sqrt(sum / b.length);
    var db = Math.max(20, Math.min(130, 20 * Math.log10(rms || 1e-9) + CAL));
    // Sobe logo, desce devagar: os números não tremem e as palmas ficam no ecrã.
    S.db = S.db == null || db > S.db ? db : S.db * 0.9 + db * 0.1;
    S.dbHist.push([t, db]);
    while (S.dbHist.length && t - S.dbHist[0][0] > 6000) S.dbHist.shift();
    if (db > S.dbRec && t - S.micT0 > 800) {
      if (S.dbRec > 0 && db > S.dbRec + 1) { S.dbRecT = t; vibrate(60); }
      S.dbRec = db;
    }
  }

  /* ---------- Geografia ---------- */
  function bearing(a, b) {
    var y = Math.sin((b.lon - a.lon) * RAD) * Math.cos(b.lat * RAD);
    var x = Math.cos(a.lat * RAD) * Math.sin(b.lat * RAD) - Math.sin(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.cos((b.lon - a.lon) * RAD);
    return (Math.atan2(y, x) / RAD + 360) % 360;
  }
  function dist(a, b) {
    var dl = (b.lat - a.lat) * RAD, dn = (b.lon - a.lon) * RAD;
    var h = Math.sin(dl / 2) * Math.sin(dl / 2) + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dn / 2) * Math.sin(dn / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }
  function origin() { return S.pos ? { lat: S.pos.coords.latitude, lon: S.pos.coords.longitude } : ESTA; }
  function cardinal(h) {
    var n = LANG === "en" ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] : ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
    return n[Math.round(h / 45) % 8];
  }

  /* ---------- Laboratório ---------- */
  var ICONS = {
    queda: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="8" y="2" width="8" height="12" rx="2"/><path d="M12 17v5M9 19l3 3 3-3"/></svg>',
    nivel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="8" width="20" height="8" rx="4"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/></svg>',
    bussola: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
    gps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    rodopio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 11-2.3-5.6"/><path d="M18 2.5v4h-4"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
    som: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/></svg>'
  };

  function lab() {
    app.innerHTML = "";
    S.labT = performance.now();
    app.setAttribute("data-tab", S.tab);
    app.appendChild(el('<header class="top"><b>' + T.title + '</b><span class="chip"><span class="num" id="hz">0</span> ' + T.hz +
      '</span><a href="' + app.getAttribute("data-other") + '">' + T.other + "</a></header>"));

    var q = T.queda;
    app.appendChild(el('<section class="view" data-v="queda"><h2>' + q.h + '</h2><p class="what">' + q.what + "</p>" +
      '<div class="card"><div class="live"><div><div class="big num" id="g">1,00<small>g</small></div><div class="lbl">' + q.live + "</div></div>" +
      '<span class="state" id="fstate">' + q.rest + "</span></div>" +
      '<canvas id="graph" height="160" style="margin-top:14px"></canvas></div>' +
      '<div class="card result" id="result"><div class="lbl">' + q.last + '</div><div class="big num" id="cm">' + q.none + "</div>" +
      '<div class="lbl num" id="dur"></div><div class="target" id="target"></div></div>' +
      '<ul class="drops" id="drops"></ul><p class="real">' + q.real + "</p></section>"));

    var n = T.nivel;
    app.appendChild(el('<section class="view" data-v="nivel"><h2>' + n.h + '</h2><p class="what">' + n.what + "</p>" +
      '<div class="card level"><svg viewBox="-110 -110 220 220" id="lv">' +
      '<g id="lv-flat"><circle r="100" fill="#0e141b" stroke="#2a3644" stroke-width="2"/><circle r="66" fill="none" stroke="#2a3644"/><circle r="12" fill="none" stroke="#5b6b7d" stroke-width="2"/>' +
      '<line x1="-100" y1="0" x2="100" y2="0" stroke="#2a3644"/><line x1="0" y1="-100" x2="0" y2="100" stroke="#2a3644"/>' +
      '<circle id="bubble" r="16" fill="var(--nivel)" opacity=".9"/></g>' +
      '<g id="lv-up" style="display:none"><circle r="100" fill="#0e141b" stroke="#2a3644" stroke-width="2"/>' +
      '<defs><clipPath id="lvclip"><circle r="98"/></clipPath></defs><g clip-path="url(#lvclip)"><g id="horizon"><rect x="-150" y="0" width="300" height="150" fill="#16341c"/><line x1="-150" y1="0" x2="150" y2="0" stroke="var(--nivel)" stroke-width="4"/></g></g>' +
      '<line x1="-60" y1="0" x2="-30" y2="0" stroke="#fff" stroke-width="2"/><line x1="30" y1="0" x2="60" y2="0" stroke="#fff" stroke-width="2"/></g>' +
      '</svg><div class="deg"><div class="big num" id="deg">0°</div><div class="lbl" id="lvmode"></div></div></div>' +
      '<p class="real">' + n.real + "</p></section>"));

    var r = T.rodopio;
    app.appendChild(el('<section class="view" data-v="rodopio"><h2>' + r.h + '</h2><p class="what">' + r.what + "</p>" +
      '<div class="card spin"><svg viewBox="-110 -110 220 220">' +
      '<circle r="92" fill="none" stroke="#1d2631" stroke-width="16"/>' +
      '<circle id="spin-arc" r="92" fill="none" stroke="var(--rodopio)" stroke-width="16" stroke-linecap="round" transform="rotate(-90)" stroke-dasharray="0 578"/>' +
      '<g id="spin-dot"><circle cx="0" cy="-92" r="13" fill="#eef3f8" stroke="#0b0f14" stroke-width="4"/></g>' +
      '<text id="turns" x="0" y="22" text-anchor="middle" font-size="76" font-weight="800" fill="#eef3f8" class="num">0</text>' +
      '<text x="0" y="50" text-anchor="middle" font-size="16" fill="#8d9aab">' + r.turns + "</text></svg>" +
      '<div class="lbl" id="spin-none"></div></div>' +
      '<div class="row"><div class="card"><div class="mid num" id="tps">0</div><div class="lbl">' + r.now + '</div><div class="lbl num" id="dps"></div></div>' +
      '<div class="card"><div class="mid num" id="tpsmax">0</div><div class="lbl">' + r.max + "</div></div></div>" +
      '<div class="card"><canvas id="spin-graph" height="120"></canvas></div>' +
      '<button class="ghost" id="spin-reset" type="button">' + r.reset + "</button>" +
      '<p class="real">' + r.real + "</p></section>"));

    var b = T.bussola;
    var ticks = "";
    for (var i = 0; i < 360; i += 10) {
      var long = i % 30 === 0;
      ticks += '<line x1="0" y1="-100" x2="0" y2="' + (long ? -88 : -94) + '" stroke="' + (long ? "#7d8b9c" : "#3a4655") + '" stroke-width="2" transform="rotate(' + i + ')"/>';
    }
    var card = LANG === "en" ? ["N", "E", "S", "W"] : ["N", "E", "S", "O"];
    var letters = card.map(function (c, k) {
      return '<text x="0" y="-66" transform="rotate(' + (k * 90) + ')" text-anchor="middle" font-size="18" font-weight="800" fill="' + (k === 0 ? "#ff6b4a" : "#eef3f8") + '" font-family="inherit">' + c + "</text>";
    }).join("");
    app.appendChild(el('<section class="view" data-v="bussola"><h2>' + b.h + '</h2><p class="what">' + b.what + "</p>" +
      '<div class="card dial"><svg viewBox="-115 -125 230 240">' +
      '<path d="M0 -122 L8 -106 L-8 -106 Z" fill="var(--bussola)"/>' +
      '<g id="rose"><circle r="104" fill="#0e141b" stroke="#2a3644" stroke-width="2"/>' + ticks + letters + '<g id="tg"></g></g>' +
      '<text id="hd" x="0" y="14" text-anchor="middle" font-size="40" font-weight="800" fill="#eef3f8" class="num">--</text>' +
      '<text id="hc" x="0" y="38" text-anchor="middle" font-size="15" fill="#8d9aab"></text></svg>' +
      '<div class="lbl" id="hacc"></div></div>' +
      '<ul class="targets" id="targets"></ul><div class="lbl" id="from"></div>' +
      '<p class="real">' + b.real + "</p></section>"));

    var g = T.gps;
    app.appendChild(el('<section class="view" data-v="gps"><h2>' + g.h + '</h2><p class="what">' + g.what + "</p>" +
      '<button class="gps-btn" id="gps-btn" type="button">' + g.on + '</button><div class="lbl" id="gps-state" hidden></div>' +
      '<div class="card"><div class="big num" id="acc">±--<small>m</small></div><div class="lbl">' + g.acc + '</div><canvas id="map" height="220"></canvas></div>' +
      '<div class="grid2"><div class="card"><div class="lbl">' + g.lat + '</div><div class="v num" id="lat">--</div></div>' +
      '<div class="card"><div class="lbl">' + g.lon + '</div><div class="v num" id="lon">--</div></div>' +
      '<div class="card"><div class="lbl">' + g.alt + '</div><div class="v num" id="alt">--</div></div>' +
      '<div class="card"><div class="lbl">' + g.spd + '</div><div class="v num" id="spd">--</div></div></div>' +
      '<div class="lbl" id="upd"></div><p class="real">' + g.real + "</p></section>"));

    var so = T.som;
    app.appendChild(el('<section class="view" data-v="som"><h2>' + so.h + '</h2><p class="what">' + so.what + "</p>" +
      '<button class="gps-btn mic-btn" id="mic-btn" type="button">' + so.on + '</button><div class="lbl" id="mic-state" hidden></div>' +
      '<div class="card"><div class="live"><div><div class="big num" id="db">--<small>dB</small></div><div class="lbl">' + so.live + "</div></div>" +
      '<span class="state" id="dbzone"></span></div>' +
      '<div class="meter"><i id="dbbar"></i></div>' +
      '<canvas id="db-graph" height="170" style="margin-top:14px"></canvas><div class="lbl">' + so.approx + "</div></div>" +
      '<div class="row"><div class="card"><div class="mid num" id="dbpeak">--</div><div class="lbl">' + so.peak + "</div></div>" +
      '<div class="card" id="dbrec-card"><div class="mid num" id="dbrec">--</div><div class="lbl" id="dbrec-lbl">' + so.rec + "</div></div></div>" +
      '<button class="ghost" id="mic-reset" type="button">' + so.reset + "</button>" +
      '<p class="real">' + so.real + "</p></section>"));

    var tabs = el('<nav class="tabs"><div class="in"></div></nav>');
    ["queda", "nivel", "rodopio", "bussola", "gps", "som"].forEach(function (k) {
      var bt = el('<button type="button" data-t="' + k + '">' + ICONS[k] + "<span>" + T.tabs[k] + "</span></button>");
      bt.addEventListener("click", function () { go(k); });
      $(".in", tabs).appendChild(bt);
    });
    app.appendChild(tabs);
    $("#gps-btn").addEventListener("click", startGps);
    $("#mic-btn").addEventListener("click", function () { S.micT0 = performance.now(); startMic(); });
    $("#spin-reset").addEventListener("click", function () { S.spin = 0; S.spinTurns = 0; S.spinMax = 0; });
    $("#mic-reset").addEventListener("click", function () { S.dbRec = 0; S.dbRecT = 0; S.micT0 = performance.now(); });
    if (navigator.wakeLock) { navigator.wakeLock.request("screen").catch(function () {}); }
    go(S.tab);
    renderTargets();
    requestAnimationFrame(loop);
  }

  function go(k) {
    S.tab = k;
    app.setAttribute("data-tab", k);
    app.querySelectorAll(".view").forEach(function (v) { v.classList.toggle("on", v.getAttribute("data-v") === k); });
    app.querySelectorAll(".tabs button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-t") === k); });
    window.scrollTo(0, 0);
  }

  /* ---------- Desenho ---------- */
  function sizeCanvas(c) {
    var r = window.devicePixelRatio || 1, w = c.clientWidth, h = c._h || (c._h = parseInt(c.getAttribute("height"), 10));
    if (c._w !== w) { c._w = w; c.width = w * r; c.height = h * r; c.style.height = h + "px"; }
    var x = c.getContext("2d"); x.setTransform(r, 0, 0, r, 0, 0);
    return { x: x, w: w, h: h };
  }

  function drawGraph() {
    var c = $("#graph"); if (!c || !c.clientWidth) return;
    var o = sizeCanvas(c), x = o.x, w = o.w, h = o.h, top = 3;
    x.clearRect(0, 0, w, h);
    x.font = "12px -apple-system, sans-serif"; x.fillStyle = "#8d9aab";
    [0, 1, 2, 3].forEach(function (v) {
      var y = h - (v / top) * (h - 8) - 4;
      x.strokeStyle = v === 1 ? "#3a4655" : "#1d2631"; x.lineWidth = 1;
      x.beginPath(); x.moveTo(26, y); x.lineTo(w, y); x.stroke();
      x.fillText(v + " g", 0, y + 4);
    });
    var now = performance.now(), hs = S.hist;
    if (hs.length < 2) return;
    x.lineWidth = 3; x.lineJoin = "round";
    for (var i = 1; i < hs.length; i++) {
      var x0 = 26 + (1 - (now - hs[i - 1][0]) / 4000) * (w - 26), x1 = 26 + (1 - (now - hs[i][0]) / 4000) * (w - 26);
      var y0 = h - Math.min(hs[i - 1][1], top) / top * (h - 8) - 4, y1 = h - Math.min(hs[i][1], top) / top * (h - 8) - 4;
      x.strokeStyle = hs[i][1] < 0.35 ? "#ffd166" : "#ff6b4a";
      x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
    }
  }

  function renderDrop() {
    if (!$("#cm")) return;
    var d = S.drops[0];
    $("#cm").innerHTML = d.cm + "<small>cm</small>";
    $("#dur").textContent = fmt(d.dur, 2) + " " + T.queda.sec;
    $("#target").textContent = T.queda.target(Math.abs(d.cm - 50));
    var r = $("#result"); r.classList.add("hl"); setTimeout(function () { r.classList.remove("hl"); }, 1200);
    $("#drops").innerHTML = S.drops.slice(1).map(function (x) { return "<li class=\"num\">" + x.cm + " cm</li>"; }).join("");
  }

  function drawLevel() {
    var ax = S.ax, ay = S.ay, az = S.az, m = Math.sqrt(ax * ax + ay * ay + az * az) || G;
    var flat = Math.abs(az) / m > 0.7, deg;
    $("#lv-flat").style.display = flat ? "" : "none";
    $("#lv-up").style.display = flat ? "none" : "";
    if (flat) {
      deg = Math.acos(Math.min(1, Math.abs(az) / m)) / RAD;
      var bx = Math.max(-1, Math.min(1, ax / G * 3)) * 84, by = Math.max(-1, Math.min(1, -ay / G * 3)) * 84;
      var len = Math.sqrt(bx * bx + by * by); if (len > 84) { bx *= 84 / len; by *= 84 / len; }
      $("#bubble").setAttribute("cx", bx.toFixed(1)); $("#bubble").setAttribute("cy", by.toFixed(1));
      $("#lvmode").textContent = T.nivel.flat;
    } else {
      var ang = Math.atan2(ax, ay) / RAD;
      $("#horizon").setAttribute("transform", "rotate(" + ang.toFixed(1) + ")");
      var a = Math.abs(ang) % 90; deg = Math.min(a, 90 - a);
      $("#lvmode").textContent = T.nivel.up;
    }
    var ok = deg < 1;
    $("#deg").textContent = fmt(deg, 1) + "°";
    $("#deg").classList.toggle("ok-text", ok);
    if (ok) $("#lvmode").textContent += " · " + T.nivel.level;
    if (ok && !S.wasLevel) vibrate(30);
    S.wasLevel = ok;
  }

  function renderTargets() {
    var o = origin(), tg = $("#tg"), ul = $("#targets"); if (!tg) return;
    var dots = "", items = "";
    PLACES.forEach(function (p, i) {
      p.b = bearing(o, p); p.d = dist(o, p);
      dots += '<g transform="rotate(' + p.b.toFixed(1) + ')"><circle cx="0" cy="-104" r="7" fill="' + p.c + '" stroke="#0b0f14" stroke-width="2"/></g>';
      items += '<li data-i="' + i + '"><span><i style="background:' + p.c + '"></i>' + p.name + '</span><span class="num">' +
        fmt(Math.round(p.d), 0) + " km · " + Math.round(p.b) + "°</span></li>";
    });
    tg.innerHTML = dots; ul.innerHTML = items;
    $("#from").textContent = S.pos ? T.bussola.fromGps : T.bussola.from;
  }

  function drawCompass() {
    if (!S.headSeen) {
      $("#hd").textContent = "--";
      $("#hacc").textContent = S.motion > 0 && performance.now() - S.labT > 2500 ? T.bussola.none : "";
      return;
    }
    var h = S.heading;
    $("#rose").setAttribute("transform", "rotate(" + (-h).toFixed(1) + ")");
    $("#hd").textContent = Math.round(h) + "°";
    $("#hc").textContent = cardinal(h);
    $("#hacc").textContent = (S.headAcc != null ? T.bussola.acc + " ±" + Math.round(S.headAcc) + "° · " : "") + T.bussola.calib;
    var hit = null;
    PLACES.forEach(function (p, i) {
      var d = Math.abs(((p.b - h + 540) % 360) - 180);
      var li = app.querySelector('#targets li[data-i="' + i + '"]');
      if (li) li.classList.toggle("hit", d < 8);
      if (d < 8 && (hit == null || d < hit.d)) hit = { p: p, d: d };
    });
    var name = hit ? hit.p.name : null;
    if (name && name !== S.lastHit) vibrate(40);
    S.lastHit = name;
  }

  function renderGps() {
    var p = S.pos; if (!p || !$("#acc")) return;
    var c = p.coords;
    $("#acc").innerHTML = "±" + Math.round(c.accuracy) + "<small>m</small>";
    $("#lat").textContent = fmt(c.latitude, 5) + "°";
    $("#lon").textContent = fmt(c.longitude, 5) + "°";
    $("#alt").textContent = c.altitude != null ? Math.round(c.altitude) + " m" + (c.altitudeAccuracy != null ? " ±" + Math.round(c.altitudeAccuracy) : "") : T.gps.noalt;
    $("#spd").textContent = c.speed != null && c.speed >= 0 ? fmt(c.speed * 3.6, 1) + " km/h" : T.gps.noalt;
    $("#upd").textContent = S.gpsUpd + " " + T.gps.upd;
  }

  function drawMap() {
    var cv = $("#map"); if (!cv || !cv.clientWidth) return;
    var o = sizeCanvas(cv), x = o.x, w = o.w, h = o.h, cx = w / 2, cy = h / 2;
    x.clearRect(0, 0, w, h);
    var p = S.pos;
    var acc = p ? p.coords.accuracy : 30;
    var here = p ? { lat: p.coords.latitude, lon: p.coords.longitude } : null;
    var far = 0;
    if (here) S.track.forEach(function (t) { far = Math.max(far, dist(here, t) * 1000); });
    var span = Math.max(acc * 1.25, far * 1.2, 15);
    var px = (Math.min(w, h) / 2 - 8) / span;
    var step = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000].find(function (s) { return span / s <= 4; }) || 10000;
    x.font = "11px -apple-system, sans-serif"; x.fillStyle = "#5b6b7d"; x.strokeStyle = "#1d2631"; x.lineWidth = 1;
    for (var r = step; r <= span; r += step) {
      x.beginPath(); x.arc(cx, cy, r * px, 0, Math.PI * 2); x.stroke();
      x.fillText(r + " m", cx + r * px * 0.71 + 3, cy - r * px * 0.71);
    }
    if (!p) return;
    x.fillStyle = "rgba(182,156,255,.16)"; x.strokeStyle = "rgba(182,156,255,.7)"; x.lineWidth = 2;
    x.beginPath(); x.arc(cx, cy, acc * px, 0, Math.PI * 2); x.fill(); x.stroke();
    x.fillStyle = "rgba(238,243,248,.35)";
    S.track.forEach(function (t) {
      var dx = (t.lon - here.lon) * RAD * 6371000 * Math.cos(here.lat * RAD), dy = (t.lat - here.lat) * RAD * 6371000;
      x.beginPath(); x.arc(cx + dx * px, cy - dy * px, 2.5, 0, Math.PI * 2); x.fill();
    });
    x.fillStyle = "#b69cff"; x.strokeStyle = "#0b0f14"; x.lineWidth = 3;
    x.beginPath(); x.arc(cx, cy, 8, 0, Math.PI * 2); x.stroke(); x.fill();
  }

  // Gráfico de linha dos últimos 6 s, com linhas de referência e etiquetas.
  function lineGraph(c, hist, lo, hi, refs, color) {
    if (!c || !c.clientWidth) return;
    var o = sizeCanvas(c), x = o.x, w = o.w, h = o.h, L = 0, now = performance.now();
    x.clearRect(0, 0, w, h);
    x.font = "12px -apple-system, sans-serif";
    var Y = function (v) { return h - 4 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (h - 18); };
    refs.forEach(function (r) {
      var y = Y(r[0]);
      x.strokeStyle = "#1d2631"; x.lineWidth = 1; x.beginPath(); x.moveTo(L, y); x.lineTo(w, y); x.stroke();
      x.fillStyle = "#5b6b7d"; x.fillText(r[1], L + 2, y - 4);
    });
    if (hist.length < 2) return;
    x.strokeStyle = color; x.lineWidth = 3; x.lineJoin = "round"; x.beginPath();
    hist.forEach(function (p, i) {
      var px = L + (1 - (now - p[0]) / 6000) * (w - L), py = Y(p[1]);
      if (i) x.lineTo(px, py); else x.moveTo(px, py);
    });
    x.stroke();
  }

  function drawSpin() {
    var none = $("#spin-none");
    none.textContent = !S.gyro && S.motion > 0 && performance.now() - S.labT > 2500 ? T.rodopio.none : "";
    var a = Math.abs(S.spin), frac = (a % 360) / 360, C = 2 * Math.PI * 92;
    $("#spin-arc").setAttribute("stroke-dasharray", (frac * C).toFixed(1) + " " + C.toFixed(1));
    $("#spin-dot").setAttribute("transform", "rotate(" + (frac * 360).toFixed(1) + ")");
    $("#turns").textContent = S.spinTurns;
    var tps = Math.abs(S.spinW) / 360;
    $("#tps").textContent = fmt(tps < 0.06 ? 0 : tps, 1);
    $("#dps").textContent = Math.round(Math.abs(S.spinW)) + " " + T.rodopio.deg;
    $("#tpsmax").textContent = fmt(S.spinMax, 1);
    var top = Math.max(2, Math.ceil(S.spinMax));
    var refs = []; for (var v = 1; v <= top; v++) refs.push([v, v + (LANG === "en" ? " turn/s" : " volta/s")]);
    lineGraph($("#spin-graph"), S.spinHist, 0, top, refs, "#f478c4");
  }

  function drawSom(t) {
    if (S.db == null) return;
    var db = S.db, so = T.som;
    $("#db").innerHTML = Math.round(db) + "<small>dB</small>";
    var z = so.zones.reduce(function (acc, q) { return db >= q[0] - 5 ? q[1] : acc; }, so.zones[0][1]);
    $("#dbzone").textContent = z;
    $("#dbzone").classList.toggle("loud", db >= 80);
    $("#dbbar").style.width = Math.max(0, Math.min(100, (db - 20) / 100 * 100)).toFixed(1) + "%";
    var pk = 0; S.dbHist.forEach(function (p) { if (t - p[0] < 3000 && p[1] > pk) pk = p[1]; });
    $("#dbpeak").innerHTML = Math.round(pk) + "<small> dB</small>";
    $("#dbrec").innerHTML = S.dbRec ? Math.round(S.dbRec) + "<small> dB</small>" : "--";
    var fresh = S.dbRecT && t - S.dbRecT < 1500;
    $("#dbrec-card").classList.toggle("hl", !!fresh);
    $("#dbrec-lbl").textContent = fresh ? so.newRec : so.rec;
    lineGraph($("#db-graph"), S.dbHist, 20, 120, so.zones.map(function (q) { return [q[0], q[0] + " dB " + q[1]]; }), "#ffd166");
  }

  function loop() {
    var hz = $("#hz"); if (hz) hz.textContent = S.hz;
    var now = performance.now();
    readMic(now);
    if (S.tab === "queda") {
      $("#g").innerHTML = fmt(S.mag, 2) + "<small>g</small>";
      var st = $("#fstate"); st.textContent = S.falling ? T.queda.fall : T.queda.rest; st.classList.toggle("fall", S.falling);
      drawGraph();
    } else if (S.tab === "nivel") drawLevel();
    else if (S.tab === "bussola") drawCompass();
    else if (S.tab === "gps") drawMap();
    else if (S.tab === "rodopio") drawSpin();
    else if (S.tab === "som") drawSom(now);
    requestAnimationFrame(loop);
  }

  intro();
})();

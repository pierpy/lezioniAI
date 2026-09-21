/* ═══════════════════════════════════════════════════════════════════════
   Tappa 3 — l'approssimatore universale.
   Una rete con un solo strato nascosto:
        f(x) = a₀ + Σ aᵢ · σ(w·(x − cᵢ))
   I centri cᵢ sono distribuiti uniformemente sull'intervallo; i pesi di
   uscita aᵢ si trovano con i minimi quadrati regolarizzati — così il
   risultato è immediato e la lezione non deve aspettare un allenamento.
   Il punto didattico è il teorema di Cybenko (1989): aumentando i neuroni
   l'errore può essere reso piccolo quanto si vuole.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('approssimatore', function () {
  const L = LEZIONE, C = L.colori;

  const X0 = 0, X1 = 10, NCAMPIONI = 220;
  /* Ripidità dell'interruttore morbido: cresce con il numero di neuroni, così
     ogni pezzetto "lavora" sulla propria fetta di intervallo. In una rete vera
     questo valore è una manopola come le altre e lo impara l'allenamento. */
  const pendenza = n => Math.max(1.2, 4 * n / (X1 - X0));

  const obiettivi = {
    onda:      x => Math.sin(0.95 * x),
    gradino:   x => (x < 4.4 ? -0.65 : 0.75),
    montagna:  x => 1.15 * Math.exp(-((x - 3.2) ** 2) / 1.1) - 0.85 * Math.exp(-((x - 7.1) ** 2) / 2.2),
    battito:   x => {
      const t = x % 3.3;
      return 0.10 * Math.sin(1.9 * x)
        + 1.30 * Math.exp(-((t - 1.30) ** 2) / 0.05)
        - 0.40 * Math.exp(-((t - 0.85) ** 2) / 0.06)
        - 0.45 * Math.exp(-((t - 1.75) ** 2) / 0.07)
        + 0.40 * Math.exp(-((t - 2.60) ** 2) / 0.35);
    }
  };

  let nomeObiettivo = 'onda', nNeuroni = 3, mostraPezzi = false;
  let disegnato = null;               // array di y per il disegno a mano libera
  let metodo = 'formula';             // 'formula' = minimi quadrati, 'gradiente' = allenamento
  let rete = null, timerAll = null, iterAll = 0, storiaPerdita = [];

  const W = 720, H = 430;
  const t = L.tela('#ua-grafico', W, H);
  const x = d3.scaleLinear().domain([X0, X1]).range([0, t.w]);
  const y = d3.scaleLinear().domain([-1.7, 1.7]).range([t.h, 0]);

  t.g.append('g').attr('class', 'griglia')
    .call(d3.axisLeft(y).ticks(5).tickSize(-t.w).tickFormat(''))
    .select('.domain').remove();
  t.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${t.h})`)
    .call(d3.axisBottom(x).ticks(6));
  t.g.append('g').attr('class', 'asse').call(d3.axisLeft(y).ticks(5));

  t.svg.append('defs').append('clipPath').attr('id', 'ritaglio-ua')
    .append('rect').attr('width', t.w).attr('height', t.h);
  const gRitagliato = t.g.append('g').attr('clip-path', 'url(#ritaglio-ua)');
  const gPezzi = gRitagliato.append('g');
  const lineaObiettivo = gRitagliato.append('path').attr('fill', 'none')
    .attr('stroke', C.inchiostro3).attr('stroke-width', 3)
    .attr('stroke-dasharray', '7 5');
  const lineaRete = gRitagliato.append('path').attr('fill', 'none')
    .attr('stroke', C.modello).attr('stroke-width', 3).attr('stroke-linecap', 'round');
  const gCentri = t.g.append('g');

  /* legenda con etichette diritte sulle curve (l'identità non sta nel solo colore) */
  const legenda = t.g.append('g').attr('transform', 'translate(8,4)');
  [['obiettivo', C.inchiostro3, '7 5'], ['rete neurale', C.modello, null]].forEach((d, i) => {
    const g = legenda.append('g').attr('transform', `translate(0,${i * 20})`);
    g.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 0).attr('y2', 0)
      .attr('stroke', d[1]).attr('stroke-width', 3).attr('stroke-dasharray', d[2]);
    g.append('text').attr('x', 24).attr('y', 4).attr('font-size', 12)
      .attr('fill', C.inchiostro2).text(d[0]);
  });

  const generatore = d3.line().x(d => x(d[0])).y(d => y(Math.max(-9, Math.min(9, d[1]))));

  const griglia = d3.range(NCAMPIONI).map(i => X0 + (X1 - X0) * i / (NCAMPIONI - 1));

  function valoreObiettivo(xv) {
    if (nomeObiettivo === 'disegno') {
      if (!disegnato) return 0;
      const i = Math.round((xv - X0) / (X1 - X0) * (NCAMPIONI - 1));
      return disegnato[Math.max(0, Math.min(NCAMPIONI - 1, i))];
    }
    return obiettivi[nomeObiettivo](xv);
  }

  /** Allena (in senso stretto: risolve) i pesi di uscita e restituisce il modello. */
  function costruisciRete(n) {
    const p = pendenza(n);
    const centri = d3.range(n).map(i => X0 + (X1 - X0) * (i + 0.5) / n);
    const base = xv => [1].concat(centri.map(c => L.sigmoide(p * (xv - c))));
    const H = griglia.map(base);
    const yv = griglia.map(valoreObiettivo);
    const a = L.minimiQuadrati(H, yv, 1e-6);
    return {
      centri, a,
      f: xv => base(xv).reduce((s, b, k) => s + a[k] * b, 0),
      pezzo: (k, xv) => a[k + 1] * L.sigmoide(p * (xv - centri[k]))
    };
  }

  /* ── la stessa rete, ma con TUTTE le manopole cercate a tentoni ───────
     f(x) = a₀ + Σ aᵢ·σ(wᵢ·(x − cᵢ)):  qui si muovono anche le pendenze wᵢ
     e i centri cᵢ, non solo i pesi di uscita. Ottimizzatore: Adam
     (Kingma & Ba, ICLR 2015), che è quello che si usa davvero. */
  function reteCasuale(n) {
    const rnd = L.casuale(2024 + n);
    const p = pendenza(n);
    return {
      n,
      a0: 0,
      a: d3.range(n).map(() => (rnd() - 0.5) * 0.6),
      w: d3.range(n).map(() => p * (0.4 + 0.4 * rnd())),
      c: d3.range(n).map(i => X0 + (X1 - X0) * (i + 0.5) / n + (rnd() - 0.5) * (X1 - X0) / n),
      m: null, v: null, t: 0
    };
  }

  function modelloAllenato(par) {
    const sig = (k, xv) => L.sigmoide(par.w[k] * (xv - par.c[k]));
    return {
      centri: par.c,
      f: xv => par.a0 + d3.sum(par.a.map((ak, k) => ak * sig(k, xv))),
      pezzo: (k, xv) => par.a[k] * sig(k, xv)
    };
  }

  /** Un passo di Adam su tutte le manopole. */
  function passoAllenamento(par, lr = 0.06) {
    const n = par.n, N = griglia.length;
    const ga = new Float64Array(n), gw = new Float64Array(n), gc = new Float64Array(n);
    let ga0 = 0, perdita = 0;

    for (let i = 0; i < N; i++) {
      const xv = griglia[i];
      let f = par.a0;
      const s = new Float64Array(n);
      for (let k = 0; k < n; k++) { s[k] = L.sigmoide(par.w[k] * (xv - par.c[k])); f += par.a[k] * s[k]; }
      const e = f - valoreObiettivo(xv);
      perdita += e * e / N;
      const fatt = 2 * e / N;
      ga0 += fatt;
      for (let k = 0; k < n; k++) {
        const ds = s[k] * (1 - s[k]);
        ga[k] += fatt * s[k];
        gw[k] += fatt * par.a[k] * ds * (xv - par.c[k]);
        gc[k] += fatt * par.a[k] * ds * (-par.w[k]);
      }
    }

    if (!par.m) {
      par.m = { a: new Float64Array(n), w: new Float64Array(n), c: new Float64Array(n), a0: 0 };
      par.v = { a: new Float64Array(n), w: new Float64Array(n), c: new Float64Array(n), a0: 0 };
    }
    par.t++;
    const b1 = 0.9, b2 = 0.999, eps = 1e-8;
    const corr1 = 1 - Math.pow(b1, par.t), corr2 = 1 - Math.pow(b2, par.t);
    const adam = (m, v, g, passo) => {
      const mm = b1 * m + (1 - b1) * g;
      const vv = b2 * v + (1 - b2) * g * g;
      return [mm, vv, passo * (mm / corr1) / (Math.sqrt(vv / corr2) + eps)];
    };

    let r = adam(par.m.a0, par.v.a0, ga0, lr);
    par.m.a0 = r[0]; par.v.a0 = r[1]; par.a0 -= r[2];
    for (let k = 0; k < n; k++) {
      r = adam(par.m.a[k], par.v.a[k], ga[k], lr);
      par.m.a[k] = r[0]; par.v.a[k] = r[1]; par.a[k] -= r[2];
      /* pendenze e centri si muovono più adagio: sono più delicati */
      r = adam(par.m.w[k], par.v.w[k], gw[k], lr * 2);
      par.m.w[k] = r[0]; par.v.w[k] = r[1]; par.w[k] -= r[2];
      r = adam(par.m.c[k], par.v.c[k], gc[k], lr * 2);
      par.m.c[k] = r[0]; par.v.c[k] = r[1]; par.c[k] -= r[2];
    }
    return perdita;
  }

  /* ── il grafico dell'errore durante l'allenamento ─────────────────────── */

  const tp = L.tela('#ua-perdita', 360, 150, { t: 28, d: 16, b: 28, s: 46 });
  tp.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
    .text('Errore, mentre cerca a tentoni');
  const xp = d3.scaleLinear().range([0, tp.w]);
  const yp = d3.scaleLinear().range([tp.h, 0]);
  const asseXp = tp.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${tp.h})`);
  const asseYp = tp.g.append('g').attr('class', 'asse');
  const curvaPerdita = tp.g.append('path').attr('fill', 'none')
    .attr('stroke', C.errore).attr('stroke-width', 2.5);

  function disegnaPerdita() {
    xp.domain([0, Math.max(50, storiaPerdita.length)]);
    yp.domain([0, Math.max(0.05, d3.max(storiaPerdita) || 1)]).nice();
    asseXp.call(d3.axisBottom(xp).ticks(4));
    asseYp.call(d3.axisLeft(yp).ticks(3).tickFormat(d => L.num(d, 2)));
    curvaPerdita.attr('d', d3.line().x((d, i) => xp(i)).y(d => yp(d))(storiaPerdita));
  }

  function fermaAllenamento() {
    if (timerAll) { timerAll.stop(); timerAll = null; }
    d3.select('#ua-vai').text(iterAll > 0 ? '▶ Continua' : '▶ Allena');
  }

  function riavviaAllenamento() {
    fermaAllenamento();
    rete = reteCasuale(nNeuroni);
    iterAll = 0;
    storiaPerdita = [Math.sqrt(d3.mean(griglia, xv => (modelloAllenato(rete).f(xv) - valoreObiettivo(xv)) ** 2))];
    aggiorna();
  }

  function aggiorna() {
    const modello = (metodo === 'formula')
      ? costruisciRete(nNeuroni)
      : modelloAllenato(reteViva());

    lineaObiettivo.attr('d', generatore(griglia.map(xv => [xv, valoreObiettivo(xv)])));
    lineaRete.attr('d', generatore(griglia.map(xv => [xv, modello.f(xv)])));

    gPezzi.selectAll('path')
      .data(mostraPezzi ? d3.range(nNeuroni) : [])
      .join('path')
      .attr('fill', 'none').attr('stroke', C.errore)
      .attr('stroke-width', 1.5).attr('stroke-opacity', .55)
      .attr('d', k => generatore(griglia.map(xv => [xv, modello.pezzo(k, xv)])));

    gCentri.selectAll('circle').data(modello.centri).join('circle')
      .attr('cx', d => x(d)).attr('cy', t.h + 12).attr('r', 3.5)
      .attr('fill', C.errore).attr('fill-opacity', .8);

    const errori = griglia.map(xv => Math.abs(modello.f(xv) - valoreObiettivo(xv)));
    const emax = d3.max(errori);
    const erms = Math.sqrt(d3.mean(errori.map(e => e * e)));

    d3.select('#ua-punteggi').html(
      `<div class="punteggio studio"><span class="etichetta">Errore medio</span>` +
      `<span class="valore">${L.num(erms, 3)}</span></div>` +
      `<div class="punteggio verifica" data-avanzato><span class="etichetta">Errore massimo</span>` +
      `<span class="valore">${L.num(emax, 3)}</span></div>`);

    if (metodo === 'gradiente') disegnaPerdita();

    const manopole = 3 * nNeuroni + 1;
    let testo;
    if (metodo === 'gradiente') {
      const manopoleCercate = 3 * nNeuroni + 1;
      if (iterAll === 0) {
        testo = `<strong>Manopole a caso.</strong> ${manopoleCercate} numeri messi a sorte: ` +
                'la curva blu non somiglia a niente. Premete «Allena».';
      } else if (erms < 0.05) {
        testo = `<strong>Ce l'ha fatta da sola</strong>, in ${iterAll} passi: errore medio ${L.num(erms, 3)}. ` +
                'Nessuna formula, solo tentativi guidati dall\'errore.';
      } else if (storiaPerdita.length > 60 &&
                 storiaPerdita[storiaPerdita.length - 1] > 0.9 * storiaPerdita[storiaPerdita.length - 50]) {
        testo = `<strong>Si è incastrata.</strong> L'errore non scende più (${L.num(erms, 3)}) ` +
                'ma la curva non ci siamo: succede, ed è la differenza fra «esiste una soluzione» ' +
                'e «riesco a trovarla». Premete «Ricomincia»: da manopole diverse spesso va meglio.';
      } else {
        testo = `Passo ${iterAll}: errore medio ${L.num(erms, 3)}. ` +
                'Guardate i pezzetti che si spostano e si allargano da soli.';
      }
      d3.select('#ua-verdetto')
        .attr('class', 'verdetto ' + (erms < 0.05 ? 'buono' : ''))
        .html(testo);
      return;
    }
    if (erms < 0.02) {
      testo = `<strong>Praticamente perfetta.</strong> Con ${nNeuroni} neuroni (${manopole} manopole) ` +
              `la rete e l'obiettivo si sovrappongono: l'occhio non li distingue più.`;
    } else if (erms < 0.08) {
      testo = `Ci siamo quasi: errore medio ${L.num(erms, 3)}. Aggiungete qualche neurone e sparisce.`;
    } else if (nNeuroni <= 2) {
      testo = `<strong>Con ${nNeuroni} neurone/i</strong> si possono fare solo curve molto semplici: ` +
              `manca la libertà per seguire l'obiettivo.`;
    } else {
      testo = `La rete segue l'andamento generale ma perde i dettagli (errore medio ${L.num(erms, 3)}). ` +
              `Più neuroni = più pezzetti = più dettagli.`;
    }
    d3.select('#ua-verdetto').attr('class', 'verdetto ' + (erms < 0.08 ? 'buono' : '')).html(testo);
  }

  function reteViva() {
    if (!rete || rete.n !== nNeuroni) { rete = reteCasuale(nNeuroni); iterAll = 0; storiaPerdita = []; }
    return rete;
  }

  /* ── disegno a mano libera ───────────────────────────────────────────── */

  const areaDisegno = t.g.append('rect')
    .attr('width', t.w).attr('height', t.h)
    .attr('fill', 'transparent')
    .style('display', 'none');

  function attivaDisegno(attivo) {
    areaDisegno.style('display', attivo ? null : 'none').style('cursor', attivo ? 'crosshair' : null).raise();
    d3.select('#ua-istruzioni').html(attivo
      ? '<strong>Tenete premuto il tasto del mouse e disegnate una curva</strong> da sinistra a destra: la rete proverà a copiarla.'
      : 'La linea grigia è quello che vogliamo ottenere; la linea blu è quello che la rete sa fare.');
    if (attivo && !disegnato) {
      disegnato = griglia.map(xv => 0.9 * Math.sin(xv));
    }
  }

  const trascinaDisegno = d3.drag()
    .on('start drag', function (ev) {
      const [px, py] = d3.pointer(ev, this);
      const i = Math.round(x.invert(px) / (X1 - X0) * (NCAMPIONI - 1));
      const valore = Math.max(-1.6, Math.min(1.6, y.invert(py)));
      for (let k = Math.max(0, i - 2); k <= Math.min(NCAMPIONI - 1, i + 2); k++) disegnato[k] = valore;
      aggiorna();
    });
  areaDisegno.call(trascinaDisegno);

  /* ── comandi ─────────────────────────────────────────────────────────── */

  d3.select('#ua-obiettivo').on('change', function () {
    nomeObiettivo = this.value;
    attivaDisegno(nomeObiettivo === 'disegno');
    if (metodo === 'gradiente') riavviaAllenamento(); else aggiorna();
  });
  d3.select('#ua-neuroni').on('input', function () {
    nNeuroni = +this.value;
    const manopole = (metodo === 'gradiente' ? 3 : 2) * nNeuroni + 1;
    d3.select('#ua-neuroni-out').text(
      `${nNeuroni} ${nNeuroni === 1 ? 'neurone' : 'neuroni'} — ${manopole} manopole`);
    if (metodo === 'gradiente') riavviaAllenamento(); else aggiorna();
  });

  d3.select('#ua-metodo').on('change', function () {
    metodo = this.value;
    document.getElementById('ua-allenamento').hidden = (metodo !== 'gradiente');
    d3.select('#ua-neuroni-out').text(
      `${nNeuroni} ${nNeuroni === 1 ? 'neurone' : 'neuroni'} — ` +
      `${(metodo === 'gradiente' ? 3 : 2) * nNeuroni + 1} manopole`);
    if (metodo === 'gradiente') riavviaAllenamento(); else { fermaAllenamento(); aggiorna(); }
  });

  d3.select('#ua-vai').on('click', function () {
    if (timerAll) { fermaAllenamento(); return; }
    d3.select(this).text('❚❚ Ferma');
    timerAll = d3.timer(() => {
      let perdita = 0;
      /* quattro passi per fotogramma: abbastanza lenti da vedere i pezzetti
         spostarsi, abbastanza veloci da arrivare in fondo in una ventina di secondi */
      for (let i = 0; i < 4; i++) { perdita = passoAllenamento(reteViva()); iterAll++; }
      storiaPerdita.push(Math.sqrt(perdita));
      if (iterAll >= 6000) fermaAllenamento();
      aggiorna();
    });
  });
  d3.select('#ua-reset').on('click', riavviaAllenamento);
  L.allUscita('approssimatore', fermaAllenamento);
  d3.select('#ua-pezzi').on('change', function () { mostraPezzi = this.checked; aggiorna(); });

  d3.select('#ua-neuroni-out').text('3 neuroni — 7 manopole');
  aggiorna();
});

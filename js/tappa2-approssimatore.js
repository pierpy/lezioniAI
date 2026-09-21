/* ═══════════════════════════════════════════════════════════════════════
   Tappa 2 — l'approssimatore universale.
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

  function aggiorna() {
    const rete = costruisciRete(nNeuroni);

    lineaObiettivo.attr('d', generatore(griglia.map(xv => [xv, valoreObiettivo(xv)])));
    lineaRete.attr('d', generatore(griglia.map(xv => [xv, rete.f(xv)])));

    gPezzi.selectAll('path')
      .data(mostraPezzi ? d3.range(nNeuroni) : [])
      .join('path')
      .attr('fill', 'none').attr('stroke', C.errore)
      .attr('stroke-width', 1.5).attr('stroke-opacity', .55)
      .attr('d', k => generatore(griglia.map(xv => [xv, rete.pezzo(k, xv)])));

    gCentri.selectAll('circle').data(rete.centri).join('circle')
      .attr('cx', d => x(d)).attr('cy', t.h + 12).attr('r', 3.5)
      .attr('fill', C.errore).attr('fill-opacity', .8);

    const errori = griglia.map(xv => Math.abs(rete.f(xv) - valoreObiettivo(xv)));
    const emax = d3.max(errori);
    const erms = Math.sqrt(d3.mean(errori.map(e => e * e)));

    d3.select('#ua-punteggi').html(
      `<div class="punteggio studio"><span class="etichetta">Errore medio</span>` +
      `<span class="valore">${L.num(erms, 3)}</span></div>` +
      `<div class="punteggio verifica"><span class="etichetta">Errore massimo</span>` +
      `<span class="valore">${L.num(emax, 3)}</span></div>`);

    const manopole = 2 * nNeuroni + 1;
    let testo;
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
    aggiorna();
  });
  d3.select('#ua-neuroni').on('input', function () {
    nNeuroni = +this.value;
    d3.select('#ua-neuroni-out').text(
      `${nNeuroni} ${nNeuroni === 1 ? 'neurone' : 'neuroni'} — ${2 * nNeuroni + 1} manopole`);
    aggiorna();
  });
  d3.select('#ua-pezzi').on('change', function () { mostraPezzi = this.checked; aggiorna(); });

  d3.select('#ua-neuroni-out').text('3 neuroni — 7 manopole');
  aggiorna();
});

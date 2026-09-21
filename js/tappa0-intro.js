/* ═══════════════════════════════════════════════════════════════════════
   Tappa 0 — apertura: «guardate le manopole mentre si aggiustano».
   Una vera discesa del gradiente sui quattro coefficienti di un polinomio
   di grado 3 scritto nella base normalizzata in [−1, 1].

   Tre viste sincronizzate, perché si veda il meccanismo e non solo il
   risultato:
     A) i punti, la curva e gli errori (i segmenti arancioni);
     B) le quattro manopole, con la freccia che indica da che parte
        conviene girarle (è il gradiente, senza chiamarlo così);
     C) la storia dell'errore, che scende.
   Il pulsante «Un passo alla volta» percorre le quattro fasi della
   ricetta una per una, evidenziandole nell'elenco accanto al grafico.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('copertina', function () {
  const L = LEZIONE, C = L.colori;
  const GRADO = 3, PASSI_MAX = 400;

  /* i tre passi possibili del cursore: piccolo, giusto, troppo grande.
     Il valore 0,95 diverge davvero (verificato numericamente): la curva
     rimbalza e schizza via, ed è esattamente quello che si vuole mostrare. */
  const PASSI = [
    { lr: 0.06, nome: 'un passettino: impara, ma lentissimamente' },
    { lr: 0.40, nome: 'il passo giusto' },
    { lr: 0.95, nome: 'un passo troppo grande: rimbalza e peggiora' }
  ];

  const NOMI_MANOPOLE = ['altezza', 'inclinazione', 'curvatura', 'ondulazione'];

  let punti = [], coeff = [], gradiente = [0, 0, 0, 0];
  let iter = 0, storia = [], timer = null, lr = PASSI[1].lr, fase = 0, esplosa = false;

  /* ═══════════ A) punti, curva, errori ═══════════ */

  const W = 620, H = 330;
  const t = L.tela('#intro-animazione', W, H, { t: 22, d: 24, b: 34, s: 44 });
  const x = d3.scaleLinear().domain([0, 10]).range([0, t.w]);
  const y = d3.scaleLinear().domain([-1.8, 1.8]).range([t.h, 0]);

  t.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${t.h})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(() => ''));
  t.g.append('g').attr('class', 'asse')
    .call(d3.axisLeft(y).ticks(5).tickFormat(() => ''));

  t.svg.append('defs').append('clipPath').attr('id', 'ritaglio-intro')
    .append('rect').attr('width', t.w).attr('height', t.h);
  const gRitaglio = t.g.append('g').attr('clip-path', 'url(#ritaglio-intro)');
  const gResidui = gRitaglio.append('g');
  const linea = gRitaglio.append('path')
    .attr('fill', 'none').attr('stroke', C.modello).attr('stroke-width', 3)
    .attr('stroke-linecap', 'round');
  const gPunti = t.g.append('g');
  const avvisoFuori = t.g.append('text')
    .attr('x', t.w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .attr('font-size', 14).attr('fill', C.errore).attr('opacity', 0)
    .text('↑ la curva è schizzata fuori dal grafico');
  const generatore = d3.line().x(d => x(d[0])).y(d => y(Math.max(-9, Math.min(9, d[1]))));

  /* ═══════════ B) le quattro manopole ═══════════ */

  const Wm = 360, Hm = 262;
  const tm = L.tela('#intro-manopole', Wm, Hm, { t: 26, d: 8, b: 8, s: 8 });
  tm.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
    .text('Le quattro manopole');

  const RAGGIO = 30, ANG = 135 * Math.PI / 180, SCALA_MANOPOLA = 3;
  const angolo = v => Math.max(-ANG, Math.min(ANG, (v / SCALA_MANOPOLA) * ANG));
  const arcoFondo = d3.arc().innerRadius(RAGGIO).outerRadius(RAGGIO + 6)
    .startAngle(-ANG).endAngle(ANG);
  const arcoValore = d3.arc().innerRadius(RAGGIO).outerRadius(RAGGIO + 6);

  const manopole = tm.g.selectAll('g.manopola')
    .data(d3.range(GRADO + 1))
    .join('g')
    .attr('class', 'manopola')
    .attr('transform', d => `translate(${88 + (d % 2) * 180},${48 + Math.floor(d / 2) * 128})`);

  manopole.append('path').attr('d', arcoFondo).attr('fill', C.superficie2);
  manopole.append('path').attr('class', 'settore').attr('fill', C.modello);
  manopole.append('circle').attr('r', RAGGIO)
    .attr('fill', C.superficie).attr('stroke', C.bordo).attr('stroke-width', 1.5);
  manopole.append('line').attr('class', 'lancetta')
    .attr('x1', 0).attr('y1', 0)
    .attr('stroke', C.dati).attr('stroke-width', 3.5).attr('stroke-linecap', 'round');
  manopole.append('circle').attr('r', 4).attr('fill', C.dati);
  manopole.append('text').attr('class', 'freccia')
    .attr('y', -RAGGIO - 14).attr('text-anchor', 'middle')
    .attr('font-size', 20).attr('fill', C.errore).attr('opacity', 0);
  manopole.append('text').attr('y', RAGGIO + 20).attr('text-anchor', 'middle')
    .attr('font-size', 12).attr('fill', C.inchiostro2)
    .text(d => `${d + 1}. ${NOMI_MANOPOLE[d]}`);
  manopole.append('text').attr('class', 'valore')
    .attr('y', RAGGIO + 35).attr('text-anchor', 'middle')
    .attr('font-size', 12).attr('fill', C.inchiostro3);

  /* ═══════════ C) la storia dell'errore ═══════════ */

  const We = 360, He = 158;
  const te = L.tela('#intro-errore', We, He, { t: 34, d: 14, b: 26, s: 42 });
  te.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
    .text('Quanto sbaglia, passo dopo passo');
  const xe = d3.scaleLinear().range([0, te.w]);
  const ye = d3.scaleLinear().range([te.h, 0]);
  const asseXe = te.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${te.h})`);
  const asseYe = te.g.append('g').attr('class', 'asse');
  const curvaErrore = te.g.append('path')
    .attr('fill', 'none').attr('stroke', C.errore).attr('stroke-width', 2.5);
  const puntoErrore = te.g.append('circle').attr('r', 4).attr('fill', C.errore);

  /* ═══════════ il modello e la sua discesa ═══════════ */

  const u = xv => xv / 5 - 1;
  const base = xv => { const b = []; let v = 1; const t0 = u(xv); for (let k = 0; k <= GRADO; k++) { b.push(v); v *= t0; } return b; };
  const valuta = (c, xv) => base(xv).reduce((s, b, k) => s + c[k] * b, 0);
  const erroreMedio = () => Math.sqrt(d3.mean(punti, d => (valuta(coeff, d[0]) - d[1]) ** 2));

  /** Calcola, per ogni manopola, da che parte conviene girarla. */
  function calcolaGradiente() {
    const g = new Array(GRADO + 1).fill(0);
    for (const [xv, yv] of punti) {
      const b = base(xv);
      const err = b.reduce((s, bk, k) => s + coeff[k] * bk, 0) - yv;
      for (let k = 0; k <= GRADO; k++) g[k] += 2 * err * b[k] / punti.length;
    }
    return g;
  }

  function giraManopole() {
    for (let k = 0; k <= GRADO; k++) {
      coeff[k] = Math.max(-80, Math.min(80, coeff[k] - lr * gradiente[k]));
    }
    iter++;
    storia.push(erroreMedio());
    if (storia.length > 3 && storia[storia.length - 1] > 12) esplosa = true;
  }

  /* ═══════════ disegno ═══════════ */

  function disegnaPunti() {
    gPunti.selectAll('circle').data(punti).join('circle')
      .attr('cx', d => x(d[0])).attr('cy', d => y(d[1])).attr('r', 5)
      .attr('fill', C.dati).attr('stroke', C.superficie).attr('stroke-width', 2);
  }

  function disegnaCurva() {
    const campioni = d3.range(0, 10.01, 0.1).map(xv => [xv, valuta(coeff, xv)]);
    linea.attr('d', generatore(campioni));
    const dentro = campioni.some(d => d[1] > y.domain()[0] && d[1] < y.domain()[1]);
    avvisoFuori.attr('opacity', dentro ? 0 : 1);
  }

  function disegnaResidui(evidenzia) {
    gResidui.selectAll('line').data(punti).join('line')
      .attr('x1', d => x(d[0])).attr('x2', d => x(d[0]))
      .attr('y1', d => y(d[1]))
      .attr('y2', d => y(Math.max(-9, Math.min(9, valuta(coeff, d[0])))))
      .attr('stroke', C.errore)
      .attr('stroke-width', evidenzia ? 4 : 2)
      .attr('stroke-opacity', evidenzia ? 1 : .6);
  }

  function disegnaManopole(mostraFrecce) {
    manopole.select('path.settore')
      .attr('d', k => arcoValore({
        startAngle: Math.min(0, angolo(coeff[k])),
        endAngle: Math.max(0, angolo(coeff[k]))
      }));
    manopole.select('line.lancetta')
      .attr('x2', k => (RAGGIO - 8) * Math.sin(angolo(coeff[k])))
      .attr('y2', k => -(RAGGIO - 8) * Math.cos(angolo(coeff[k])));
    manopole.select('text.valore').text(k => L.num(coeff[k], 2));

    /* la freccia dice da che parte girare: il segno del gradiente cambiato,
       l'intensità è quanto conviene girare (normalizzata sulla più grande) */
    const massimo = Math.max(1e-6, d3.max(gradiente, Math.abs));
    manopole.select('text.freccia')
      .attr('opacity', k => (mostraFrecce ? 0.25 + 0.75 * Math.abs(gradiente[k]) / massimo : 0))
      .text(k => (gradiente[k] > 0 ? '↺ a sinistra' : '↻ a destra'))
      .attr('font-size', 12);
  }

  function disegnaErrore() {
    xe.domain([0, Math.max(30, storia.length)]);
    ye.domain([0, Math.max(0.3, d3.max(storia) || 1)]).nice();
    asseXe.call(d3.axisBottom(xe).ticks(4));
    asseYe.call(d3.axisLeft(ye).ticks(3).tickFormat(d => L.num(d, 1)));
    curvaErrore.attr('d', d3.line().x((d, i) => xe(i)).y(d => ye(Math.min(d, ye.domain()[1])))(storia));
    if (storia.length) {
      puntoErrore.attr('opacity', 1)
        .attr('cx', xe(storia.length - 1))
        .attr('cy', ye(Math.min(storia[storia.length - 1], ye.domain()[1])));
    } else {
      puntoErrore.attr('opacity', 0);
    }
  }

  function evidenziaRicetta(n) {
    d3.selectAll('#intro-ricetta li')
      .classed('attiva', function () { return +this.dataset.fase === n; });
  }

  function narrazione() {
    const err = storia.length ? storia[storia.length - 1] : erroreMedio();
    const d = d3.select('#intro-didascalia');
    if (esplosa) {
      d.html('<strong>Ecco che cosa succede se si gira troppo.</strong> ' +
             'Il passo è così grande che la curva supera il bersaglio ogni volta e peggiora. ' +
             'Rimettete il cursore sul passo giusto e premete «Nuovi punti».');
      return;
    }
    if (iter === 0) {
      d.html('Le manopole sono girate a caso e la curva passa lontano dai punti: ' +
             `sbaglia in media <strong>${L.num(err, 3)}</strong>. Premete il pulsante.`);
    } else if (iter >= PASSI_MAX) {
      d.html(`<strong>Finito.</strong> Dopo ${iter} passi l'errore è ${L.num(err, 3)}: ` +
             'la curva ha trovato i punti. Ha «imparato» girando quattro manopole — ' +
             'la rete della Tappa 4 fa la stessa cosa con 50.890.');
    } else {
      d.html(`Passo ${iter} — errore medio <strong>${L.num(err, 3)}</strong>. ` +
             'Le manopole si stanno ancora aggiustando: guardate le lancette.');
    }
  }

  function disegnaTutto(evidenziaResidui, mostraFrecce) {
    disegnaCurva();
    disegnaResidui(evidenziaResidui);
    disegnaManopole(mostraFrecce);
    disegnaErrore();
    narrazione();
  }

  /* ═══════════ comandi ═══════════ */

  function nuoviPunti() {
    fermare();
    const rnd = L.casuale((Date.now() & 0xffff) + 1);
    const fase0 = rnd() * 6, amp = 0.8 + rnd() * 0.45;
    punti = d3.range(24)
      .map(i => 0.2 + 9.6 * (i + 0.4 * rnd()) / 23)
      .map(xv => [xv, amp * Math.sin(xv / 1.7 + fase0) + (rnd() - 0.5) * 0.28]);
    coeff = d3.range(GRADO + 1).map(() => (rnd() - 0.5) * 2.6);
    gradiente = calcolaGradiente();
    iter = 0; storia = [erroreMedio()]; esplosa = false;
    evidenziaRicetta(0);
    disegnaPunti();
    disegnaTutto(false, false);
  }

  function fermare() {
    if (timer) { timer.stop(); timer = null; }
    d3.select('#intro-vai').text(iter >= PASSI_MAX || esplosa ? '▶ Ricomincia' : '▶ Fai imparare la curva');
  }

  function avvia() {
    if (timer) { fermare(); return; }
    if (iter >= PASSI_MAX || esplosa) { nuoviPunti(); }
    d3.select('#intro-vai').text('❚❚ Ferma');
    timer = d3.interval(() => {
      gradiente = calcolaGradiente();
      giraManopole();
      /* la ricetta scorre insieme all'animazione, così si legge il ciclo */
      evidenziaRicetta((iter % 4) + 1);
      disegnaTutto(false, true);
      if (iter >= PASSI_MAX || esplosa) fermare();
    }, 40);
  }

  /** Un passo solo, ma raccontato: le quattro fasi una alla volta. */
  function unPassoLento() {
    fermare();
    if (iter >= PASSI_MAX || esplosa) { nuoviPunti(); }

    // fase 1 — guardo di quanto sbaglio
    evidenziaRicetta(1);
    disegnaResidui(true);
    d3.select('#intro-didascalia').html(
      `<strong>1.</strong> Misuro la distanza fra la curva e ogni punto: ` +
      `in media sbaglio <strong>${L.num(erroreMedio(), 3)}</strong>.`);

    setTimeout(() => {
      // fase 2 — da che parte conviene girare ogni manopola
      gradiente = calcolaGradiente();
      evidenziaRicetta(2);
      disegnaManopole(true);
      d3.select('#intro-didascalia').html(
        '<strong>2.</strong> Per ogni manopola provo a chiedermi: se la giro a destra, ' +
        'sbaglio di più o di meno? La freccia arancione è la risposta.');
    }, 900);

    setTimeout(() => {
      // fase 3 — le giro di un pochino
      evidenziaRicetta(3);
      giraManopole();
      disegnaTutto(false, true);
      d3.select('#intro-didascalia').html(
        `<strong>3.</strong> Le giro tutte di un pochino in quella direzione. ` +
        `Adesso l'errore è <strong>${L.num(storia[storia.length - 1], 3)}</strong>: un filo meno di prima.`);
    }, 1800);

    setTimeout(() => {
      // fase 4 — ricomincio
      evidenziaRicetta(4);
      d3.select('#intro-didascalia').html(
        `<strong>4.</strong> E ricomincio. Questo era il passo n. ${iter}: ` +
        'ne servono qualche centinaio. Premete «Fai imparare la curva» per vederli tutti di fila.');
    }, 2700);
  }

  d3.select('#intro-vai').on('click', avvia);
  d3.select('#intro-passo').on('click', unPassoLento);
  d3.select('#intro-nuovi').on('click', nuoviPunti);
  d3.select('#intro-lr').on('input', function () {
    const scelta = PASSI[+this.value - 1];
    lr = scelta.lr;
    d3.select('#intro-lr-out').text(scelta.nome);
  });

  nuoviPunti();
});

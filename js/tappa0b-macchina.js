/* ═══════════════════════════════════════════════════════════════════════
   Tappa 0-bis — le tre domande che uno si fa davvero.

   A) PERCHÉ SERVE: quattro sette scritti da quattro persone, e il pubblico
      prova a dettare la regola che li riconosce. Non esiste: è il motivo
      per cui si è passati dalle regole agli esempi.
   B) CHE COS'È: una scatola con due manopole che il pubblico gira a mano
      finché la macchina non azzecca i prezzi. Imparare è questo, fatto
      milioni di volte al secondo. Il termometro «acqua/fuochino/fuoco»
      è la funzione di costo, chiamata col nome del gioco dei bambini.
   C) QUANTO È GRANDE: le manopole delle tre macchine della lezione su una
      riga a potenze di dieci.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('copertina', function () {
  const L = LEZIONE, C = L.colori;

  /* ═════════════ A) i sette che non stanno in una regola ═════════════ */

  const tCifre = L.tela('#regole-cifre', 760, 210, { t: 10, d: 10, b: 34, s: 10 });
  const scalaCifra = d3.scaleSequential(d3.interpolateRgbBasis(C.bluRampa)).domain([0, 1]);
  let cifreCaricate = null;

  function mostraCifre(elenco, didascalie) {
    const LATO = 5.6;                       // pixel per puntino: 28 × 5,6 ≈ 157
    const gruppi = tCifre.g.selectAll('g.cifra').data(elenco).join(
      entra => entra.append('g').attr('class', 'cifra'));
    gruppi.attr('transform', (d, i) => `translate(${i * 190},0)`);
    gruppi.each(function (d, i) {
      const g = d3.select(this);
      g.selectAll('rect.p').data(d3.range(784)).join('rect').attr('class', 'p')
        .attr('x', j => (j % 28) * LATO).attr('y', j => Math.floor(j / 28) * LATO)
        .attr('width', LATO).attr('height', LATO)
        .attr('shape-rendering', 'crispEdges')
        .attr('fill', j => scalaCifra(d[j]));
      g.selectAll('rect.cornice').data([0]).join('rect').attr('class', 'cornice')
        .attr('width', 28 * LATO).attr('height', 28 * LATO)
        .attr('fill', 'none').attr('stroke', C.bordo).attr('rx', 4);
      g.selectAll('text').data([didascalie[i]]).join('text')
        .attr('x', 14 * LATO).attr('y', 28 * LATO + 22).attr('text-anchor', 'middle')
        .attr('font-size', 14).attr('fill', C.inchiostro2).text(t => t);
    });
  }

  function quattroA(caso, quante) {
    const indici = [];
    const rnd = () => Math.floor(Math.random() * cifreCaricate.n);
    while (indici.length < quante) {
      const i = rnd();
      if (cifreCaricate.y[i] === caso && !indici.includes(i)) indici.push(i);
    }
    return indici.map(i => cifreCaricate.X.subarray(i * 784, i * 784 + 784));
  }

  function mostraSette() {
    mostraCifre(quattroA(7, 4), ['un sette', 'un sette', 'un sette', 'un sette']);
    d3.select('#regole-stato').text('Quattro persone diverse, quattro sette diversi.');
  }

  function mostraConfronto() {
    const cifre = quattroA(1, 2).concat(quattroA(9, 2));
    mostraCifre(cifre, ['un uno', 'un uno', 'un nove', 'un nove']);
    d3.select('#regole-stato')
      .text('La regola deve valere per tutti i sette e per nessuno di questi. Buona fortuna.');
  }

  d3.select('#regole-altri').on('click', () => { if (cifreCaricate) mostraSette(); });
  d3.select('#regole-confronto').on('click', () => { if (cifreCaricate) mostraConfronto(); });
  d3.select('#regole-stato').text('Sto caricando le cifre…');
  L.cifreStudio(c => { cifreCaricate = c; mostraSette(); });

  /* ═════════════ B) la macchina a manopole ═════════════ */

  /* la regola vera, che la macchina non conosce: prezzo = 20 + 1,6 × m² */
  const BASE_VERA = 20, MQ_VERO = 1.6;
  const CASE = [50, 70, 90, 110, 140].map(m => ({ m, prezzo: BASE_VERA + MQ_VERO * m }));

  const MANOPOLE = [
    { nome: 'prezzo di base', unita: 'mila €', min: 0, max: 80, passo: 2, valore: 62 },
    { nome: 'prezzo al metro quadro', unita: 'mila €/m²', min: 0, max: 3, passo: 0.1, valore: 0.4 }
  ];

  let sceltaCasa = 2, aggiustamenti = 0, inizio = null, erroreScorso = null, timerAuto = null;

  const prezzoMacchina = m => MANOPOLE[0].valore + MANOPOLE[1].valore * m;
  const erroreMedio = () => d3.mean(CASE, c => Math.abs(prezzoMacchina(c.m) - c.prezzo));

  /* ── la scatola, disegnata ─────────────────────────────────────────── */

  const tm = L.tela('#macchina-scatola', 920, 440, { t: 6, d: 6, b: 6, s: 6 });
  const ANG = 135 * Math.PI / 180, RAG = 46;
  const angolo = mp => {
    const t = (mp.valore - mp.min) / (mp.max - mp.min);
    return -ANG + 2 * ANG * t;
  };

  /* selettore della casa da mettere nella fessura */
  const gScelta = tm.g.append('g');
  gScelta.append('text').attr('x', 0).attr('y', 14).attr('font-size', 13)
    .attr('fill', C.inchiostro3).text('la casa da valutare:');
  const bottoniCasa = gScelta.selectAll('g.casa').data(CASE).join('g').attr('class', 'casa')
    .attr('transform', (d, i) => `translate(${145 + i * 78},0)`)
    .style('cursor', 'pointer')
    .on('click', (ev, d) => { sceltaCasa = CASE.indexOf(d); disegnaMacchina(); });
  bottoniCasa.append('rect').attr('width', 70).attr('height', 26).attr('rx', 13)
    .attr('stroke', C.bordo);
  bottoniCasa.append('text').attr('x', 35).attr('y', 18).attr('text-anchor', 'middle')
    .attr('font-size', 13).text(d => d.m + ' m²');

  /* il biglietto con la domanda */
  const gIngresso = tm.g.append('g').attr('transform', 'translate(0,120)');
  gIngresso.append('text').attr('x', 80).attr('y', -12).attr('text-anchor', 'middle')
    .attr('font-size', 13).attr('fill', C.inchiostro3).text('la domanda');
  gIngresso.append('rect').attr('width', 160).attr('height', 110).attr('rx', 10)
    .attr('fill', C.superficie).attr('stroke', C.bordo).attr('stroke-width', 2);
  const testoIngresso = gIngresso.append('text').attr('x', 80).attr('y', 68)
    .attr('text-anchor', 'middle').attr('font-size', 30).attr('fill', C.dati);

  tm.g.append('path').attr('d', 'M170,175 L205,175 M195,167 L205,175 L195,183')
    .attr('fill', 'none').attr('stroke', C.inchiostro3).attr('stroke-width', 2.5);

  /* la scatola vera e propria */
  const gScatola = tm.g.append('g').attr('transform', 'translate(215,50)');
  gScatola.append('rect').attr('width', 420).attr('height', 330).attr('rx', 16)
    .attr('fill', '#f7f5f0').attr('stroke', C.dati).attr('stroke-width', 2.5);
  gScatola.append('rect').attr('width', 420).attr('height', 44).attr('rx', 16)
    .attr('fill', C.dati);
  gScatola.append('text').attr('x', 210).attr('y', 29).attr('text-anchor', 'middle')
    .attr('font-size', 15).attr('fill', '#f6f3ea').attr('letter-spacing', '.14em')
    .text('LA MACCHINA');

  const gManopole = gScatola.selectAll('g.manopola').data(MANOPOLE).join('g')
    .attr('class', 'manopola')
    .attr('transform', (d, i) => `translate(${112 + i * 196},170)`);

  gManopole.append('text').attr('class', 'nome').attr('y', -74).attr('text-anchor', 'middle')
    .attr('font-size', 13).attr('fill', C.inchiostro2)
    .each(function (d) {                                   // nome su due righe
      const parole = d.nome.split(' ');
      const meta = d.nome === 'prezzo di base' ? [d.nome] : ['prezzo al', 'metro quadro'];
      d3.select(this).selectAll('tspan').data(meta).join('tspan')
        .attr('x', 0).attr('dy', (t, i) => (i === 0 ? 0 : 15)).text(t => t);
    });

  const arcoFondo = d3.arc().innerRadius(RAG).outerRadius(RAG + 8).startAngle(-ANG).endAngle(ANG);
  gManopole.append('path').attr('d', arcoFondo).attr('fill', '#e6e2d8');
  gManopole.append('circle').attr('r', RAG).attr('fill', '#fff')
    .attr('stroke', C.bordo).attr('stroke-width', 2);
  gManopole.append('line').attr('class', 'lancetta')
    .attr('stroke', C.modello).attr('stroke-width', 5).attr('stroke-linecap', 'round');
  gManopole.append('circle').attr('r', 6).attr('fill', C.dati);
  gManopole.append('text').attr('class', 'valore').attr('y', RAG + 30).attr('text-anchor', 'middle')
    .attr('font-size', 17).attr('font-weight', 700).attr('fill', C.dati);
  gManopole.append('text').attr('class', 'unita').attr('y', RAG + 48).attr('text-anchor', 'middle')
    .attr('font-size', 12).attr('fill', C.inchiostro3).text(d => d.unita);

  /* pulsanti − e + accanto a ogni manopola, per chi col mouse fatica */
  [['meno', -1, -RAG - 26], ['piu', 1, RAG + 26]].forEach(([classe, verso, dx]) => {
    const g = gManopole.append('g').attr('class', classe)
      .attr('transform', `translate(${dx},0)`).style('cursor', 'pointer')
      .on('click', (ev, d) => {
        d.valore = Math.max(d.min, Math.min(d.max, d.valore + verso * d.passo));
        registraMossa();
        disegnaMacchina();
      });
    g.append('circle').attr('r', 17).attr('fill', C.superficie).attr('stroke', C.bordo).attr('stroke-width', 1.5);
    g.append('text').attr('y', 7).attr('text-anchor', 'middle').attr('font-size', 22)
      .attr('fill', C.inchiostro2).text(verso > 0 ? '+' : '−');
  });

  /* trascinamento circolare della manopola */
  gManopole.call(d3.drag()
    .container(function () { return this; })
    .filter(ev => !ev.target.closest('.piu') && !ev.target.closest('.meno'))
    .on('start drag', function (ev, d) {
      const a = Math.atan2(ev.x, -ev.y);                   // 0 = in alto, positivo a destra
      const t = (Math.max(-ANG, Math.min(ANG, a)) + ANG) / (2 * ANG);
      d.valore = d.min + t * (d.max - d.min);
      registraMossa();
      disegnaMacchina();
    }));

  tm.g.append('path').attr('d', 'M645,175 L680,175 M670,167 L680,175 L670,183')
    .attr('fill', 'none').attr('stroke', C.inchiostro3).attr('stroke-width', 2.5);

  /* la formula: le manopole sono i due numeri che ci stanno dentro */
  const gFormula = tm.g.append('g').attr('transform', 'translate(215,398)');
  gFormula.append('text').attr('x', 210).attr('y', -6).attr('text-anchor', 'middle')
    .attr('font-size', 12).attr('fill', C.inchiostro3)
    .text('la formula che c\'è dentro la scatola:');
  const testoFormula = gFormula.append('text').attr('x', 210).attr('y', 22)
    .attr('text-anchor', 'middle').attr('font-size', 21).attr('fill', C.dati);

  /* la finestrella con la risposta */
  const gUscita = tm.g.append('g').attr('transform', 'translate(690,120)');
  gUscita.append('text').attr('x', 110).attr('y', -12).attr('text-anchor', 'middle')
    .attr('font-size', 13).attr('fill', C.inchiostro3).text('la risposta della macchina');
  gUscita.append('rect').attr('width', 220).attr('height', 110).attr('rx', 10)
    .attr('fill', C.dati);
  const testoUscita = gUscita.append('text').attr('x', 110).attr('y', 68)
    .attr('text-anchor', 'middle').attr('font-size', 34).attr('fill', '#ffd9a8');
  const testoVero = gUscita.append('text').attr('x', 110).attr('y', 142)
    .attr('text-anchor', 'middle').attr('font-size', 16);

  /* ── il termometro: acqua, fuochino, fuoco ─────────────────────────── */

  const MAX_TERM = 60;
  const ZONE = [
    { da: 0, fino: 3, nome: 'fuoco fuoco!', emoji: '🔥🔥', colore: '#c0392b' },
    { da: 3, fino: 8, nome: 'fuoco', emoji: '🔥', colore: '#eb6834' },
    { da: 8, fino: 20, nome: 'fuochino', emoji: '🌡️', colore: '#eda100' },
    { da: 20, fino: 40, nome: 'acquetta', emoji: '💧', colore: '#86b6ef' },
    { da: 40, fino: Infinity, nome: 'acqua', emoji: '❄️', colore: '#2a78d6' }
  ];

  const tt = L.tela('#macchina-termometro', 420, 128, { t: 30, d: 14, b: 40, s: 14 });
  tt.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
    .text('Quanto sbaglia, in media, sulle cinque case');
  const xt = d3.scaleLinear().domain([MAX_TERM, 0]).range([0, tt.w]);   // rovesciata: a destra si scalda
  const gZone = tt.g.append('g');
  gZone.selectAll('rect').data(ZONE).join('rect')
    .attr('x', d => xt(Math.min(MAX_TERM, d.fino)))
    .attr('y', 0).attr('height', 26)
    .attr('width', d => xt(d.da) - xt(Math.min(MAX_TERM, d.fino)))
    .attr('fill', d => d.colore).attr('fill-opacity', .85);
  gZone.selectAll('text').data(ZONE).join('text')
    .attr('x', d => (xt(d.da) + xt(Math.min(MAX_TERM, d.fino))) / 2)
    .attr('y', 18).attr('text-anchor', 'middle')
    .attr('font-size', 11).attr('fill', '#fff')
    .text(d => (xt(d.da) - xt(Math.min(MAX_TERM, d.fino)) > 46 ? d.nome : ''));
  const segnalino = tt.g.append('path')
    .attr('d', d3.symbol(d3.symbolTriangle, 130)())
    .attr('fill', C.dati);
  const testoZona = tt.g.append('text').attr('x', 0).attr('y', 58)
    .attr('font-size', 17).attr('font-weight', 700);
  const testoVerso = tt.g.append('text').attr('x', 0).attr('y', 78)
    .attr('font-size', 13).attr('fill', C.inchiostro3);

  /* ── la mappa dell'errore: dove stanno i numeri giusti ──────────────── */

  const tmap = L.tela('#macchina-mappa', 420, 250, { t: 28, d: 16, b: 40, s: 54 });
  tmap.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
    .text('La mappa: ogni punto è una coppia di manopole');
  const xm = d3.scaleLinear().domain([0, 80]).range([0, tmap.w]);
  const ym = d3.scaleLinear().domain([0, 3]).range([tmap.h, 0]);
  const gContorniM = tmap.g.append('g');
  const gCamminoM = tmap.g.append('g');
  tmap.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${tmap.h})`)
    .call(d3.axisBottom(xm).ticks(4));
  tmap.g.append('g').attr('class', 'asse').call(d3.axisLeft(ym).ticks(4).tickFormat(d => L.num(d, 1)));
  tmap.g.append('text').attr('class', 'etichetta-asse').attr('x', tmap.w).attr('y', tmap.h + 34)
    .attr('text-anchor', 'end').text('manopola 1: prezzo di base');
  tmap.g.append('text').attr('class', 'etichetta-asse')
    .attr('transform', `translate(-40,${tmap.h / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .text('manopola 2: al m²');

  /* le curve di livello dell'errore: si calcolano una volta sola */
  (function disegnaContorni() {
    const n = 70;
    const valori = new Array(n * n);
    for (let j = 0; j < n; j++) {
      const mq = ym.invert((j + 0.5) * tmap.h / n);
      for (let i = 0; i < n; i++) {
        const base = xm.invert((i + 0.5) * tmap.w / n);
        valori[j * n + i] = d3.mean(CASE, c => Math.abs(base + mq * c.m - c.prezzo));
      }
    }
    const minV = d3.min(valori), maxV = d3.max(valori);
    const soglie = d3.range(9).map(k => minV + (maxV - minV) * Math.pow((k + 1) / 9, 2));
    const colore = d3.scaleSequential(d3.interpolateRgbBasis(C.bluRampa.slice().reverse()))
      .domain([maxV, minV]);
    gContorniM.attr('transform', `scale(${tmap.w / n},${tmap.h / n})`);
    gContorniM.selectAll('path').data(d3.contours().size([n, n]).thresholds(soglie)(valori))
      .join('path')
      .attr('d', d3.geoPath())
      .attr('fill', d => colore(d.value))
      .attr('stroke', 'rgba(255,255,255,.5)').attr('stroke-width', 0.6 * n / tmap.w);
    tmap.g.append('path').attr('class', 'ottimo')
      .attr('d', d3.symbol(d3.symbolStar, 170)())
      .attr('transform', `translate(${xm(BASE_VERA)},${ym(MQ_VERO)})`)
      .attr('fill', '#ffd9a8').attr('stroke', C.dati).attr('stroke-width', 1.2);
    tmap.g.append('text').attr('x', xm(BASE_VERA) + 12).attr('y', ym(MQ_VERO) + 4)
      .attr('font-size', 12).attr('fill', C.dati).text('qui è perfetta');
  })();

  let cammino = [];

  function disegnaMappa() {
    gCamminoM.selectAll('path.traccia').data([cammino]).join('path').attr('class', 'traccia')
      .attr('fill', 'none').attr('stroke', C.errore).attr('stroke-width', 2)
      .attr('stroke-opacity', .8)
      .attr('d', d3.line().x(d => xm(d[0])).y(d => ym(d[1]))(cammino));
    gCamminoM.selectAll('circle').data([[MANOPOLE[0].valore, MANOPOLE[1].valore]]).join('circle')
      .attr('cx', d => xm(d[0])).attr('cy', d => ym(d[1])).attr('r', 6)
      .attr('fill', C.errore).attr('stroke', '#fff').attr('stroke-width', 2);
  }

  /* ── le cinque case, con i loro errori ─────────────────────────────── */

  const te = L.tela('#macchina-esempi', 420, 190, { t: 26, d: 90, b: 10, s: 78 });
  te.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
    .text('I cinque prezzi veri, e quanto ci va vicino');
  const ye = d3.scaleBand().domain(CASE.map(c => c.m)).range([0, te.h]).padding(.25);
  const xe = d3.scaleLinear().domain([0, 60]).range([0, te.w]);

  /* ── disegno ───────────────────────────────────────────────────────── */

  const secondiScritti = s => (s === 1 ? 'un secondo' : `${s} secondi`);

  function registraMossa() {
    if (inizio === null) inizio = Date.now();
    aggiustamenti++;
  }

  function disegnaMacchina() {
    const casa = CASE[sceltaCasa];
    bottoniCasa.select('rect')
      .attr('fill', d => (d === casa ? C.modello : C.superficie))
      .attr('stroke', d => (d === casa ? C.modello : C.bordo));
    bottoniCasa.select('text').attr('fill', d => (d === casa ? '#fff' : C.inchiostro2));

    testoIngresso.text(casa.m + ' m²');
    const stima = prezzoMacchina(casa.m);
    testoUscita.text(Math.round(stima) + ' mila €');
    const scarto = Math.abs(stima - casa.prezzo);
    testoVero.attr('fill', scarto < 5 ? C.verifica : C.errore)
      .text(scarto < 5 ? `giusto! (vero: ${Math.round(casa.prezzo)})`
                       : `sbaglia di ${Math.round(scarto)} (vero: ${Math.round(casa.prezzo)})`);

    gManopole.select('line.lancetta')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', d => (RAG - 12) * Math.sin(angolo(d)))
      .attr('y2', d => -(RAG - 12) * Math.cos(angolo(d)));
    gManopole.select('path').attr('d', d => d3.arc().innerRadius(RAG).outerRadius(RAG + 8)
      .startAngle(-ANG).endAngle(angolo(d))());
    gManopole.select('text.valore').text(d => L.num(d.valore, d.passo < 1 ? 1 : 0));

    testoFormula.html(
      'prezzo = <tspan font-weight="700" fill="' + C.modello + '">' +
      L.num(MANOPOLE[0].valore, 0) + '</tspan>' +
      ' + <tspan font-weight="700" fill="' + C.errore + '">' +
      L.num(MANOPOLE[1].valore, 1) + '</tspan> × metri quadri');

    /* termometro */
    const err = erroreMedio();
    const zona = ZONE.find(z => err < z.fino);
    segnalino.attr('transform', `translate(${xt(Math.min(MAX_TERM, err))},38)`);
    testoZona.attr('fill', zona.colore)
      .text(`${zona.emoji} ${zona.nome} — sbaglia ${L.num(err, 1)} mila € a casa`);
    if (erroreScorso !== null && Math.abs(err - erroreScorso) > 0.05) {
      testoVerso.text(err < erroreScorso ? '↑ vi state scaldando' : '↓ vi state raffreddando');
    }
    erroreScorso = err;

    /* la mappa */
    const ultimo = cammino[cammino.length - 1];
    if (!ultimo || Math.abs(ultimo[0] - MANOPOLE[0].valore) > 0.4 ||
        Math.abs(ultimo[1] - MANOPOLE[1].valore) > 0.02) {
      cammino.push([MANOPOLE[0].valore, MANOPOLE[1].valore]);
      if (cammino.length > 400) cammino.shift();
    }
    disegnaMappa();

    /* le cinque case */
    te.g.selectAll('text.et').data(CASE).join('text').attr('class', 'et')
      .attr('x', -8).attr('y', c => ye(c.m) + ye.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end').attr('font-size', 13).attr('fill', C.inchiostro2)
      .text(c => `${c.m} m² → ${Math.round(c.prezzo)}`);
    te.g.selectAll('rect').data(CASE).join('rect')
      .attr('x', 0).attr('y', c => ye(c.m)).attr('height', ye.bandwidth()).attr('rx', 3)
      .attr('width', c => Math.max(2, xe(Math.min(60, Math.abs(prezzoMacchina(c.m) - c.prezzo)))))
      .attr('fill', c => (Math.abs(prezzoMacchina(c.m) - c.prezzo) < 5 ? C.verifica : C.errore));
    te.g.selectAll('text.val').data(CASE).join('text').attr('class', 'val')
      .attr('x', c => Math.max(2, xe(Math.min(60, Math.abs(prezzoMacchina(c.m) - c.prezzo)))) + 6)
      .attr('y', c => ye(c.m) + ye.bandwidth() / 2 + 4)
      .attr('font-size', 12).attr('fill', C.inchiostro2)
      .text(c => `dice ${Math.round(prezzoMacchina(c.m))}`);

    aggiornaVerdettoMacchina(err);
  }

  function aggiornaVerdettoMacchina(err) {
    const secondi = inizio ? Math.round((Date.now() - inizio) / 1000) : 0;
    const v = d3.select('#macchina-verdetto');
    if (err < 3) {
      v.attr('class', 'verdetto buono').html(
        `<strong>Ci siete riusciti!</strong> ${aggiustamenti} aggiustamenti in ${secondiScritti(secondi)}. ` +
        'La regola vera era: 20 mila € di base più 1,6 mila € al metro quadro — ' +
        'ma voi non l\'avete mai saputa: avete solo guardato se l\'errore scendeva. ' +
        '<strong>Ecco, imparare è questo.</strong>');
    } else if (aggiustamenti === 0) {
      v.attr('class', 'verdetto').html(
        'Le manopole sono messe a caso. Giratele e guardate il termometro: ' +
        'quando l\'errore scende vi state scaldando.');
    } else {
      v.attr('class', 'verdetto').html(
        `${aggiustamenti} aggiustamenti${secondi > 4 ? ' in ' + secondiScritti(secondi) : ''}. ` +
        'Continuate: l\'obiettivo è arrivare sotto 3 mila € di errore, cioè al «fuoco fuoco».');
    }
  }

  /* ── «lascia fare a lei»: la discesa del gradiente sulle due manopole ─ */

  function passoAutomatico() {
    /* si lavora su (A, B) con u = (m² − 100)/50: le due manopole hanno scale
       molto diverse e la discesa, così com'è, andrebbe a sbattere */
    const u = m => (m - 100) / 50;
    let A = MANOPOLE[0].valore + 100 * MANOPOLE[1].valore;
    let B = 50 * MANOPOLE[1].valore;
    let gA = 0, gB = 0;
    for (const c of CASE) {
      const e = A + B * u(c.m) - c.prezzo;
      gA += 2 * e / CASE.length;
      gB += 2 * e * u(c.m) / CASE.length;
    }
    A -= 0.35 * gA;
    B -= 0.35 * gB;
    MANOPOLE[1].valore = Math.max(0, Math.min(3, B / 50));
    MANOPOLE[0].valore = Math.max(0, Math.min(80, A - 100 * MANOPOLE[1].valore));
  }

  d3.select('#macchina-auto').on('click', function () {
    if (timerAuto) return;
    const suoiPassi = { n: 0 };
    const partita = Date.now();
    const miei = aggiustamenti, secondi = inizio ? Math.round((Date.now() - inizio) / 1000) : 0;
    d3.select(this).text('sta girando…');
    timerAuto = d3.interval(() => {
      for (let i = 0; i < 3; i++) { passoAutomatico(); suoiPassi.n++; }
      disegnaMacchina();
      if (suoiPassi.n >= 240 || erroreMedio() < 0.4) {
        timerAuto.stop();
        timerAuto = null;
        d3.select('#macchina-auto').text('Lascia fare a lei');
        const suoiSecondi = (Date.now() - partita) / 1000;
        d3.select('#macchina-verdetto').attr('class', 'verdetto buono').html(
          `<strong>Lei ci ha messo ${suoiPassi.n} aggiustamenti, ` +
          `${suoiSecondi < 1.2 ? 'meno di un secondo' : L.num(suoiSecondi, 0) + ' secondi'}.</strong> ` +
          (miei > 0
            ? `Voi ne avevate fatti ${miei}${secondi > 4 ? ' in ' + secondiScritti(secondi) : ''}. `
            : '') +
          'Non è più intelligente di voi: fa la stessa cosa, guardare l\'errore e correggere, ' +
          'ma la fa <strong>migliaia di volte al secondo</strong>. ' +
          'Tutta l\'intelligenza artificiale sta in questa differenza.');
      }
    }, 40);
  });

  d3.select('#macchina-reset').on('click', () => {
    if (timerAuto) { timerAuto.stop(); timerAuto = null; d3.select('#macchina-auto').text('Lascia fare a lei'); }
    MANOPOLE[0].valore = 10 + Math.random() * 60;
    MANOPOLE[1].valore = 0.2 + Math.random() * 2.4;
    aggiustamenti = 0; inizio = null; erroreScorso = null;
    cammino = [];
    testoVerso.text('');
    disegnaMacchina();
  });

  L.allUscita('copertina', () => {
    if (timerAuto) { timerAuto.stop(); timerAuto = null; d3.select('#macchina-auto').text('Lascia fare a lei'); }
  });

  disegnaMacchina();

  /* ═════════════ C) quante manopole: una riga a potenze di dieci ═════════════ */

  const ts = L.tela('#scala-manopole', 900, 150, { t: 46, d: 30, b: 34, s: 30 });
  const xs = d3.scaleLog().domain([1, 2e12]).range([0, ts.w]);
  ts.g.append('line').attr('x1', 0).attr('x2', ts.w).attr('y1', 40).attr('y2', 40)
    .attr('stroke', C.bordo).attr('stroke-width', 2);
  ts.g.selectAll('line.tacca').data(d3.range(0, 13)).join('line').attr('class', 'tacca')
    .attr('x1', d => xs(Math.pow(10, d))).attr('x2', d => xs(Math.pow(10, d)))
    .attr('y1', 34).attr('y2', 46).attr('stroke', C.bordo);

  const TAPPE_SCALA = [
    { n: 2, testo: 'la retta della Tappa 1', dettaglio: '2 manopole', colore: C.modello },
    { n: 50890, testo: 'la rete che legge le cifre', dettaglio: '50.890', colore: C.verifica },
    { n: 1e12, testo: 'i modelli come ChatGPT', dettaglio: 'mille miliardi (stime)', colore: C.lingua }
  ];
  const gScala = ts.g.selectAll('g.tappa-scala').data(TAPPE_SCALA).join('g').attr('class', 'tappa-scala')
    .attr('transform', d => `translate(${xs(d.n)},0)`);
  gScala.append('circle').attr('cy', 40).attr('r', 7).attr('fill', d => d.colore)
    .attr('stroke', C.superficie).attr('stroke-width', 2);
  gScala.append('line').attr('y1', 33).attr('y2', 14).attr('stroke', d => d.colore).attr('stroke-width', 2);
  gScala.append('text').attr('y', 2).attr('text-anchor', (d, i) => (i === 2 ? 'end' : i === 0 ? 'start' : 'middle'))
    .attr('font-size', 13).attr('font-weight', 700).attr('fill', C.dati).text(d => d.dettaglio);
  gScala.append('text').attr('y', 62).attr('text-anchor', (d, i) => (i === 2 ? 'end' : i === 0 ? 'start' : 'middle'))
    .attr('font-size', 12).attr('fill', C.inchiostro2).text(d => d.testo);
  ts.svg.append('text').attr('class', 'etichetta-asse').attr('x', 6).attr('y', 16)
    .text('quante manopole ha la macchina');
});

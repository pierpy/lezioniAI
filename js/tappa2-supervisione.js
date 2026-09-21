/* ═══════════════════════════════════════════════════════════════════════
   Tappa 2 — Con o senza risposte giuste.
   Quattro pezzi:
     A) un piccolo gioco: questo lavoro ha bisogno delle risposte o no?
     B) la stessa nuvola di punti con tre rette diverse — due supervisionate
        (una per ogni "risposta" possibile) e una non supervisionata
        (la retta di minima distanza perpendicolare, Pearson 1901).
        Cambia il costo, cambia la retta: è la lezione sulle funzioni di costo.
     C) le k-medie animate: raggruppare senza che nessuno abbia detto i gruppi.
     D) costo quadratico contro costo assoluto, con un punto sballato da
        trascinare: la scelta del costo è una scelta umana, non matematica.

   Nota sui dati: le altezze sono simulate con le statistiche pubblicate da
   Pearson & Lee (1903) — correlazione ~0,5, deviazione ~7 cm; le case sono
   inventate per l'esempio. Nessun dato personale, nessun dato reale.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('supervisione', function () {
  const L = LEZIONE, C = L.colori;

  /* ═════════════════ A) il gioco: con o senza risposte ═════════════════ */

  const LAVORI = [
    {
      testo: 'Riconoscere se in una fotografia c\'è un gatto',
      risposta: 'con',
      perche: 'Qualcuno ha dovuto guardare migliaia di foto e scrivere «qui c\'è un gatto, qui no». ' +
              'Senza quelle etichette non si parte.'
    },
    {
      testo: 'Dividere i clienti di un supermercato in gruppi che si somigliano',
      risposta: 'senza',
      perche: 'Nessuno sa in anticipo quali gruppi esistono: è proprio quello che si vuole scoprire.'
    },
    {
      testo: 'Prevedere quanto gas consumeremo domani, vista la temperatura',
      risposta: 'con',
      perche: 'Le risposte giuste sono i consumi degli anni passati: li abbiamo già, scritti in bolletta.'
    },
    {
      testo: 'Scoprire di quali argomenti parlano diecimila lettere di un archivio',
      risposta: 'senza',
      perche: 'Gli argomenti non sono stati scritti da nessuno: si cercano i gruppi di parole che tornano insieme.'
    },
    {
      testo: 'Capire se una email è pubblicità indesiderata',
      risposta: 'con',
      perche: 'Le risposte le hanno date gli utenti, un messaggio alla volta, premendo il tasto «segnala».'
    },
    {
      testo: 'Accorgersi che un pagamento con la carta è insolito',
      risposta: 'senza',
      perche: 'Il caso classico è senza risposte: si impara com\'è fatta la spesa normale e si segnala ' +
              'ciò che se ne allontana. Con un elenco di frodi già viste si può fare anche con le risposte: ' +
              'i due modi convivono, ed è la domanda più difficile del gruppo.'
    }
  ];

  let risposteDate = 0, risposteGiuste = 0;

  const righe = d3.select('#sup-gioco').selectAll('div.quiz').data(LAVORI).join('div')
    .attr('class', 'quiz');
  righe.append('div').attr('class', 'quiz-testo').text(d => d.testo);
  const bottoni = righe.append('div').attr('class', 'quiz-bottoni');
  ['con', 'senza'].forEach(scelta => {
    bottoni.append('button')
      .attr('class', 'bottone')
      .text(scelta === 'con' ? 'Con le risposte' : 'Senza risposte')
      .on('click', function (ev, d) {
        const riga = d3.select(this.parentNode.parentNode);
        if (riga.classed('risposto')) return;
        riga.classed('risposto', true).classed(scelta === d.risposta ? 'giusto' : 'sbagliato', true);
        riga.append('div').attr('class', 'quiz-spiegazione')
          .html(`<strong>${d.risposta === 'con' ? 'Con le risposte.' : 'Senza risposte.'}</strong> ${d.perche}`);
        risposteDate++;
        if (scelta === d.risposta) risposteGiuste++;
        d3.select('#sup-gioco-esito')
          .attr('class', 'verdetto ' + (risposteGiuste === risposteDate ? 'buono' : ''))
          .html(risposteDate < LAVORI.length
            ? `${risposteGiuste} su ${risposteDate}. Continuate.`
            : `<strong>${risposteGiuste} su ${LAVORI.length}.</strong> La regola è sempre la stessa: ` +
              'esiste qualcuno che ha preparato le risposte giuste, oppure no?');
      });
  });

  /* ═════════════════ B) tre rette sulla stessa nuvola ══════════════════ */

  /* generatore normale (Box–Muller) con seme fisso: la lezione è ripetibile */
  function normali(seme, quanti) {
    const rnd = L.casuale(seme), out = [];
    for (let i = 0; i < quanti; i++) {
      const u = Math.max(1e-9, rnd()), v = rnd();
      out.push(Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
    }
    return out;
  }

  const N_ALTEZZE = 200, R_ATTESA = 0.5, DEV = 7;
  const z1 = normali(1867, N_ALTEZZE), z2 = normali(1903, N_ALTEZZE);
  const altezze = d3.range(N_ALTEZZE).map(i => ({
    padre: 172 + DEV * z1[i],
    figlio: 174.5 + R_ATTESA * DEV * z1[i] + DEV * Math.sqrt(1 - R_ATTESA * R_ATTESA) * z2[i]
  }));

  const mx = d3.mean(altezze, d => d.padre), my = d3.mean(altezze, d => d.figlio);
  const cxx = d3.mean(altezze, d => (d.padre - mx) ** 2);
  const cyy = d3.mean(altezze, d => (d.figlio - my) ** 2);
  const cxy = d3.mean(altezze, d => (d.padre - mx) * (d.figlio - my));

  /* le tre rette, tutte passanti per il punto medio della nuvola */
  /* Due sole rette: l'esperienza in aula dice che la terza (indovinare il
     padre dal figlio) confonde più di quanto aggiunga. Resta citata nella nota. */
  const RETTE = {
    /* minimi quadrati verticali: figlio da padre — supervisionata */
    figlio: { pendenza: cxy / cxx, colore: C.modello, nome: 'per indovinare il figlio' },
    /* retta di minima distanza perpendicolare (prima componente principale) */
    nuvola: { pendenza: Math.tan(0.5 * Math.atan2(2 * cxy, cxx - cyy)), colore: C.lingua, nome: 'per descrivere la nuvola' }
  };
  const valutaRetta = (r, x) => my + r.pendenza * (x - mx);

  /* i tre costi: verticale, orizzontale, perpendicolare */
  function costi(r) {
    let v = 0, o = 0, p = 0;
    for (const d of altezze) {
      const ev = d.figlio - valutaRetta(r, d.padre);
      v += ev * ev;
      const eo = d.padre - (mx + (d.figlio - my) / r.pendenza);
      o += eo * eo;
      p += (ev * ev) / (1 + r.pendenza * r.pendenza);
    }
    const n = altezze.length;
    return { verticale: Math.sqrt(v / n), orizzontale: Math.sqrt(o / n), perpendicolare: Math.sqrt(p / n) };
  }

  const COSTO_DI = { figlio: 'verticale', nuvola: 'perpendicolare' };
  let scopo = 'figlio';

  const LATO = 430;
  const tr = L.tela('#sup-rette', LATO + 80, LATO + 62, { t: 16, d: 18, b: 46, s: 62 });
  const xr = d3.scaleLinear().domain([150, 196]).range([0, tr.w]);
  const yr = d3.scaleLinear().domain([150, 196]).range([tr.h, 0]);   // stessa scala: le perpendicolari si vedono davvero

  tr.g.append('g').attr('class', 'griglia')
    .call(d3.axisLeft(yr).ticks(5).tickSize(-tr.w).tickFormat('')).select('.domain').remove();
  tr.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${tr.h})`)
    .call(d3.axisBottom(xr).ticks(5).tickFormat(d => d + ' cm'));
  tr.g.append('g').attr('class', 'asse').call(d3.axisLeft(yr).ticks(5).tickFormat(d => d + ' cm'));
  tr.g.append('text').attr('class', 'etichetta-asse').attr('x', tr.w).attr('y', tr.h + 36)
    .attr('text-anchor', 'end').text('altezza del padre');
  tr.g.append('text').attr('class', 'etichetta-asse')
    .attr('transform', `translate(-50,${tr.h / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .text('altezza del figlio');

  tr.svg.append('defs').append('clipPath').attr('id', 'ritaglio-sup')
    .append('rect').attr('width', tr.w).attr('height', tr.h);
  const gSup = tr.g.append('g').attr('clip-path', 'url(#ritaglio-sup)');
  const gSegmenti = gSup.append('g');
  const gRette = gSup.append('g');
  gSup.append('g').selectAll('circle').data(altezze).join('circle')
    .attr('cx', d => xr(d.padre)).attr('cy', d => yr(d.figlio)).attr('r', 3)
    .attr('fill', C.dati).attr('fill-opacity', .45);

  const tCosti = L.tela('#sup-costi', 360, 150, { t: 30, d: 60, b: 24, s: 116 });

  function disegnaRette() {
    const chiavi = ['figlio', 'nuvola'];

    gRette.selectAll('line').data(chiavi).join('line')
      .attr('x1', xr(140)).attr('y1', k => yr(valutaRetta(RETTE[k], 140)))
      .attr('x2', xr(206)).attr('y2', k => yr(valutaRetta(RETTE[k], 206)))
      .attr('stroke', k => RETTE[k].colore)
      .attr('stroke-width', k => (k === scopo ? 3.5 : 1.5))
      .attr('stroke-opacity', k => (k === scopo ? 1 : .35));

    /* i segmenti dell'errore: verticali, orizzontali o perpendicolari */
    const r = RETTE[scopo];
    const mostrati = altezze.filter((d, i) => i % 3 === 0);
    gSegmenti.selectAll('line').data(mostrati).join('line')
      .attr('stroke', r.colore).attr('stroke-opacity', .5).attr('stroke-width', 1.5)
      .attr('x1', d => xr(d.padre)).attr('y1', d => yr(d.figlio))
      .attr('x2', d => {
        if (scopo === 'figlio') return xr(d.padre);
        if (scopo === 'padre') return xr(mx + (d.figlio - my) / r.pendenza);
        const t = (d.padre - mx + r.pendenza * (d.figlio - my)) / (1 + r.pendenza * r.pendenza);
        return xr(mx + t);
      })
      .attr('y2', d => {
        if (scopo === 'figlio') return yr(valutaRetta(r, d.padre));
        if (scopo === 'padre') return yr(d.figlio);
        const t = (d.padre - mx + r.pendenza * (d.figlio - my)) / (1 + r.pendenza * r.pendenza);
        return yr(my + r.pendenza * t);
      });

    /* Etichette dirette sulle rette (l'identità non sta mai nel solo colore).
       Ogni etichetta si appoggia dove la sua retta esce dal riquadro: con
       pendenze molto diverse, metterle tutte alla stessa ascissa le manderebbe
       fuori dal grafico. */
    const [x0, x1] = xr.domain(), [y0, y1] = yr.domain();
    const posizione = k => {
      const b = RETTE[k].pendenza;
      let x = x1 - 1;                                   // prova il bordo destro
      let y = valutaRetta(RETTE[k], x);
      if (y > y1 - 2) { y = y1 - 2; x = mx + (y - my) / b; }   // esce dall'alto
      if (y < y0 + 2) { y = y0 + 2; x = mx + (y - my) / b; }   // esce dal basso
      return [x, y];
    };
    gRette.selectAll('text').data(chiavi).join('text')
      .attr('x', k => xr(posizione(k)[0]) - 6)
      .attr('y', k => yr(posizione(k)[1]) + 16)
      .attr('text-anchor', 'end').attr('font-size', 12)
      .attr('fill', k => RETTE[k].colore)
      .attr('stroke', C.superficie).attr('stroke-width', 3).attr('paint-order', 'stroke')
      .attr('font-weight', k => (k === scopo ? 700 : 400))
      .attr('opacity', k => (k === scopo ? 1 : .55))
      .text(k => RETTE[k].nome);

    disegnaCosti();
    disegnaVerdettoRette();
  }

  function disegnaCosti() {
    const misura = COSTO_DI[scopo];
    const dati = ['figlio', 'nuvola'].map(k => ({ k, v: costi(RETTE[k])[misura] }));
    tCosti.g.selectAll('*').remove();
    tCosti.svg.selectAll('text.titolo-grafico').data([0]).join('text')
      .attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
      .text(misura === 'verticale'
        ? 'Errore misurato in verticale: vince la retta blu'
        : 'Errore misurato in perpendicolare: vince la viola');
    const x = d3.scaleLinear().domain([0, d3.max(dati, d => d.v) * 1.15]).range([0, tCosti.w]);
    const y = d3.scaleBand().domain(dati.map(d => d.k)).range([0, tCosti.h]).padding(.25);
    tCosti.g.selectAll('rect').data(dati).join('rect')
      .attr('x', 0).attr('y', d => y(d.k)).attr('height', y.bandwidth()).attr('rx', 4)
      .attr('width', d => x(d.v))
      .attr('fill', d => (d.k === scopo ? RETTE[d.k].colore : '#d9d5cb'));
    tCosti.g.selectAll('text.et').data(dati).join('text').attr('class', 'et')
      .attr('x', -8).attr('y', d => y(d.k) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end').attr('font-size', 12).attr('fill', C.inchiostro2)
      .text(d => RETTE[d.k].nome);
    tCosti.g.selectAll('text.val').data(dati).join('text').attr('class', 'val')
      .attr('x', d => x(d.v) + 6).attr('y', d => y(d.k) + y.bandwidth() / 2 + 4)
      .attr('font-size', 12).attr('fill', C.inchiostro2)
      .attr('font-weight', d => (d.k === scopo ? 700 : 400))
      .text(d => L.num(d.v, 2) + ' cm');
  }

  function disegnaVerdettoRette() {
    const testi = {
      figlio: `<strong>Con la risposta: supervisionata.</strong> La risposta da indovinare è ` +
              `l'altezza del figlio, quindi l'errore si misura <em>in verticale</em> — quanto sbaglio ` +
              `sulla risposta. Questa retta dice: ogni centimetro in più nel padre vale ` +
              `<strong>${L.num(RETTE.figlio.pendenza, 2)} cm</strong> nel figlio. Meno di uno: ` +
              `è la «regressione verso la media» di Galton.`,
      nuvola: `<strong>Senza risposta: non supervisionata.</strong> Qui non c'è niente da indovinare, ` +
              `quindi l'errore è la distanza <em>perpendicolare</em>, che tratta le due altezze allo ` +
              `stesso modo. Questa retta non predice niente: descrive come si allunga la nuvola. ` +
              `Notate che è più inclinata dell'altra, sugli stessi identici punti.`
    };
    d3.select('#sup-rette-verdetto').attr('class', 'verdetto').html(testi[scopo]);
  }

  d3.select('#sup-scopo').on('change', function () { scopo = this.value; disegnaRette(); });
  disegnaRette();

  /* ═════════════════ C) le k-medie: gruppi senza risposte ══════════════ */

  const FORME = [d3.symbolCircle, d3.symbolTriangle, d3.symbolSquare, d3.symbolDiamond, d3.symbolCross];
  const COLORI_GRUPPI = [C.modello, C.errore, C.verifica, C.lingua, C.rosso];

  /* tre tipi di casa: nessuno lo dirà mai alla macchina */
  function generaCase() {
    const rnd = L.casuale(4242);
    const gauss = () => {
      const u = Math.max(1e-9, rnd()), v = rnd();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const mucchi = [[48, 152, 9, 16], [96, 128, 13, 18], [158, 296, 19, 30]];
    const punti = [];
    mucchi.forEach(([sm, pm, sd, pd]) => {
      for (let i = 0; i < 30; i++) punti.push({ s: sm + sd * gauss(), p: pm + pd * gauss() });
    });
    return punti;
  }

  const CASE = generaCase();
  const sMedia = d3.mean(CASE, d => d.s), sDev = d3.deviation(CASE, d => d.s);
  const pMedia = d3.mean(CASE, d => d.p), pDev = d3.deviation(CASE, d => d.p);
  /* le distanze si misurano su misure normalizzate: metri quadri ed euro
     non sono confrontabili così come sono (è la trappola classica) */
  const normalizza = d => [(d.s - sMedia) / sDev, (d.p - pMedia) / pDev];

  let k = 3, centri = [], assegnati = [], fase = 1, mosse = 0, storiaCosto = [], timerK = null, fermo = false;

  const tk = L.tela('#sup-gruppi', 560, 420);
  const xk = d3.scaleLinear().domain([20, 200]).range([0, tk.w]);
  const yk = d3.scaleLinear().domain([80, 380]).range([tk.h, 0]);
  tk.g.append('g').attr('class', 'griglia')
    .call(d3.axisLeft(yk).ticks(5).tickSize(-tk.w).tickFormat('')).select('.domain').remove();
  tk.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${tk.h})`)
    .call(d3.axisBottom(xk).ticks(6).tickFormat(d => d + ' m²'));
  tk.g.append('g').attr('class', 'asse').call(d3.axisLeft(yk).ticks(5).tickFormat(d => d + 'k'));
  tk.g.append('text').attr('class', 'etichetta-asse').attr('x', tk.w).attr('y', tk.h + 36)
    .attr('text-anchor', 'end').text('superficie');
  tk.g.append('text').attr('class', 'etichetta-asse')
    .attr('transform', `translate(-38,${tk.h / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .text('prezzo (migliaia di €)');
  const gCase = tk.g.append('g');
  const gCentri = tk.g.append('g');

  const tkc = L.tela('#sup-gruppi-costo', 340, 130, { t: 28, d: 14, b: 26, s: 42 });

  function reimpostaGruppi() {
    if (timerK) { timerK.stop(); timerK = null; }
    d3.select('#sup-gruppi-vai').text('▶ Trova i gruppi');
    const rnd = L.casuale(Date.now() & 0xffff);
    /* centri iniziali: k case a caso (inizializzazione di Forgy) */
    const scelti = new Set();
    while (scelti.size < k) scelti.add(Math.floor(rnd() * CASE.length));
    centri = [...scelti].map(i => normalizza(CASE[i]));
    assegnati = CASE.map(() => -1);
    fase = 1; mosse = 0; storiaCosto = []; fermo = false;
    disegnaGruppi();
    d3.select('#sup-gruppi-verdetto').attr('class', 'verdetto')
      .html('Centri messi a caso. Premete «Trova i gruppi» oppure «Una mossa» per vedere le due mosse una alla volta.');
  }

  function costoGruppi() {
    let s = 0, n = 0;
    CASE.forEach((d, i) => {
      if (assegnati[i] < 0) return;
      const [a, b] = normalizza(d), c = centri[assegnati[i]];
      s += (a - c[0]) ** 2 + (b - c[1]) ** 2;
      n++;
    });
    return n ? s / n : NaN;
  }

  function unaMossa() {
    if (fermo) return;
    if (fase === 1) {
      /* mossa 1: ogni casa al centro più vicino */
      let cambi = 0;
      CASE.forEach((d, i) => {
        const [a, b] = normalizza(d);
        let migliore = 0, distanza = Infinity;
        centri.forEach((c, j) => {
          const dd = (a - c[0]) ** 2 + (b - c[1]) ** 2;
          if (dd < distanza) { distanza = dd; migliore = j; }
        });
        if (assegnati[i] !== migliore) cambi++;
        assegnati[i] = migliore;
      });
      if (cambi === 0 && mosse > 1) fermo = true;
      fase = 2;
    } else {
      /* mossa 2: ogni centro in mezzo alle sue case */
      centri = centri.map((c, j) => {
        const suoi = CASE.filter((d, i) => assegnati[i] === j).map(normalizza);
        if (!suoi.length) return c;
        return [d3.mean(suoi, d => d[0]), d3.mean(suoi, d => d[1])];
      });
      fase = 1;
    }
    mosse++;
    storiaCosto.push(costoGruppi());
    disegnaGruppi();
  }

  function disegnaGruppi() {
    gCase.selectAll('path').data(CASE).join('path')
      .attr('transform', d => `translate(${xk(d.s)},${yk(d.p)})`)
      .attr('d', (d, i) => d3.symbol(assegnati[i] < 0 ? d3.symbolCircle : FORME[assegnati[i] % 5], 70)())
      .attr('fill', (d, i) => (assegnati[i] < 0 ? '#9b978c' : COLORI_GRUPPI[assegnati[i] % 5]))
      .attr('fill-opacity', .85)
      .attr('stroke', C.superficie).attr('stroke-width', 1);

    gCentri.selectAll('path').data(centri).join('path')
      .attr('transform', c => `translate(${xk(c[0] * sDev + sMedia)},${yk(c[1] * pDev + pMedia)})`)
      .attr('d', d3.symbol(d3.symbolStar, 260)())
      .attr('fill', (c, j) => COLORI_GRUPPI[j % 5])
      .attr('stroke', C.dati).attr('stroke-width', 1.8);

    d3.selectAll('#sup-ricetta li')
      .classed('attiva', function () { return +this.dataset.fase === fase; });

    /* il costo che scende, mossa dopo mossa */
    tkc.g.selectAll('*').remove();
    tkc.svg.selectAll('text.titolo-grafico').data([0]).join('text')
      .attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
      .text('Quanto sono lontane le case dal loro centro');
    if (storiaCosto.length) {
      const x = d3.scaleLinear().domain([0, Math.max(6, storiaCosto.length)]).range([0, tkc.w]);
      const y = d3.scaleLinear().domain([0, d3.max(storiaCosto)]).nice().range([tkc.h, 0]);
      tkc.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${tkc.h})`)
        .call(d3.axisBottom(x).ticks(4));
      tkc.g.append('g').attr('class', 'asse').call(d3.axisLeft(y).ticks(3).tickFormat(d => L.num(d, 1)));
      tkc.g.append('path').attr('fill', 'none').attr('stroke', C.errore).attr('stroke-width', 2.5)
        .attr('d', d3.line().x((d, i) => x(i)).y(d => y(d))(storiaCosto));
    }

    if (fermo) {
      const dimensioni = d3.range(k).map(j => assegnati.filter(a => a === j).length);
      d3.select('#sup-gruppi-verdetto').attr('class', 'verdetto buono')
        .html(`<strong>Si è fermato dopo ${mosse} mosse</strong>: nessuna casa cambia più gruppo. ` +
              `Gruppi da ${dimensioni.sort((a, b) => b - a).join(', ')} case. ` +
              'Nessuno gli ha detto che gruppi cercare: ha solo avvicinato ogni casa a un centro.');
    } else if (mosse > 0) {
      d3.select('#sup-gruppi-verdetto').attr('class', 'verdetto')
        .html(fase === 1
          ? `Mossa ${mosse} fatta: i centri si sono spostati in mezzo alle loro case.`
          : `Mossa ${mosse} fatta: ogni casa è andata al centro più vicino (guardate i colori cambiare).`);
    }
  }

  d3.select('#sup-k').on('input', function () {
    k = +this.value;
    d3.select('#sup-k-out').text(`${k} gruppi`);
    reimpostaGruppi();
  });
  d3.select('#sup-gruppi-passo').on('click', () => {
    if (timerK) { timerK.stop(); timerK = null; d3.select('#sup-gruppi-vai').text('▶ Trova i gruppi'); }
    unaMossa();
  });
  d3.select('#sup-gruppi-vai').on('click', function () {
    if (timerK) { timerK.stop(); timerK = null; d3.select(this).text('▶ Trova i gruppi'); return; }
    /* se ha già finito, un nuovo tentativo riparte da altri centri: è il modo
       più semplice per far vedere che il risultato dipende da dove si parte */
    if (fermo) reimpostaGruppi();
    d3.select(this).text('❚❚ Ferma');
    timerK = d3.interval(() => {
      unaMossa();
      if (fermo) { timerK.stop(); timerK = null; d3.select('#sup-gruppi-vai').text('▶ Un altro tentativo'); }
    }, 700);
  });
  d3.select('#sup-gruppi-reset').on('click', reimpostaGruppi);
  L.allUscita('supervisione', () => {
    if (timerK) { timerK.stop(); timerK = null; d3.select('#sup-gruppi-vai').text('▶ Trova i gruppi'); }
  });
  reimpostaGruppi();

  /* ═════════════════ D) due costi, due rette ═══════════════════════════ */

  const CASE_COSTO = [
    [45, 96], [52, 108], [58, 127], [62, 118], [70, 149], [74, 141],
    [80, 168], [88, 176], [95, 199], [101, 188], [110, 214], [118, 206],
    [126, 231], [134, 219], [142, 244]
  ].map(([s, p]) => ({ s, p }));
  let strana = { s: 150, p: 262 };

  const tc = L.tela('#sup-costo', 560, 420);
  const xc = d3.scaleLinear().domain([30, 170]).range([0, tc.w]);
  const yc = d3.scaleLinear().domain([60, 520]).range([tc.h, 0]);
  tc.g.append('g').attr('class', 'griglia')
    .call(d3.axisLeft(yc).ticks(6).tickSize(-tc.w).tickFormat('')).select('.domain').remove();
  tc.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${tc.h})`)
    .call(d3.axisBottom(xc).ticks(6).tickFormat(d => d + ' m²'));
  tc.g.append('g').attr('class', 'asse').call(d3.axisLeft(yc).ticks(6).tickFormat(d => d + 'k'));
  tc.g.append('text').attr('class', 'etichetta-asse')
    .attr('transform', `translate(-40,${tc.h / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .text('prezzo (migliaia di €)');
  const gRetteCosto = tc.g.append('g');
  const gCaseCosto = tc.g.append('g');
  const legendaCosto = tc.g.append('g').attr('transform', 'translate(8,6)');
  [['costo al quadrato', C.modello], ['costo assoluto', C.errore]].forEach((d, i) => {
    const g = legendaCosto.append('g').attr('transform', `translate(0,${i * 20})`);
    g.append('line').attr('x1', 0).attr('x2', 18).attr('y1', 0).attr('y2', 0)
      .attr('stroke', d[1]).attr('stroke-width', 3);
    g.append('text').attr('x', 24).attr('y', 4).attr('font-size', 12).attr('fill', C.inchiostro2).text(d[0]);
  });

  function tutteLeCase() { return CASE_COSTO.concat([strana]); }

  /** Minimi quadrati: formula chiusa. */
  function rettaQuadratica() {
    const dati = tutteLeCase();
    const m = d3.mean(dati, d => d.s), q = d3.mean(dati, d => d.p);
    const num = d3.sum(dati, d => (d.s - m) * (d.p - q));
    const den = d3.sum(dati, d => (d.s - m) ** 2);
    return { m, q, b: num / den };
  }

  /** Minimi valori assoluti: ricerca su griglia, raffinata due volte.
   *  Niente formula chiusa (il valore assoluto non è derivabile in zero),
   *  ma con quindici punti la ricerca è istantanea ed è esatta a sufficienza. */
  function rettaAssoluta() {
    const dati = tutteLeCase();
    const m = d3.mean(dati, d => d.s), q = d3.mean(dati, d => d.p);
    let centroB = 1.5, centroA = q, ampiezzaB = 3, ampiezzaA = 120, migliore = null;
    for (let passo = 0; passo < 3; passo++) {
      migliore = { costo: Infinity };
      for (let i = 0; i <= 40; i++) {
        const b = centroB - ampiezzaB + 2 * ampiezzaB * i / 40;
        for (let j = 0; j <= 40; j++) {
          const a = centroA - ampiezzaA + 2 * ampiezzaA * j / 40;
          let costo = 0;
          for (const d of dati) costo += Math.abs(d.p - (a + b * (d.s - m)));
          if (costo < migliore.costo) migliore = { costo, a, b };
        }
      }
      centroB = migliore.b; centroA = migliore.a;
      ampiezzaB /= 8; ampiezzaA /= 8;
    }
    return { m, q: migliore.a, b: migliore.b };
  }

  const trascinaStrana = d3.drag().on('drag', function (ev) {
    strana = {
      s: Math.max(35, Math.min(165, xc.invert(ev.x))),
      p: Math.max(70, Math.min(505, yc.invert(ev.y)))
    };
    disegnaCosto();
  });

  function disegnaCosto() {
    const q = rettaQuadratica(), a = rettaAssoluta();
    const linea = r => [[30, r.q + r.b * (30 - r.m)], [170, r.q + r.b * (170 - r.m)]];
    const gen = d3.line().x(d => xc(d[0])).y(d => yc(d[1]));

    gRetteCosto.selectAll('path').data([q, a]).join('path')
      .attr('fill', 'none').attr('stroke-width', 3).attr('stroke-linecap', 'round')
      .attr('stroke', (d, i) => (i === 0 ? C.modello : C.errore))
      .attr('d', r => gen(linea(r)));

    gCaseCosto.selectAll('circle.normale').data(CASE_COSTO).join('circle').attr('class', 'normale')
      .attr('cx', d => xc(d.s)).attr('cy', d => yc(d.p)).attr('r', 5)
      .attr('fill', C.dati).attr('stroke', C.superficie).attr('stroke-width', 2);

    gCaseCosto.selectAll('circle.strana').data([strana]).join('circle').attr('class', 'strana')
      .attr('cx', d => xc(d.s)).attr('cy', d => yc(d.p)).attr('r', 9)
      .attr('fill', '#ffd9a8').attr('stroke', C.dati).attr('stroke-width', 2.5)
      .style('cursor', 'grab')
      .call(trascinaStrana);

    const prezzoQ = q.q + q.b * (100 - q.m), prezzoA = a.q + a.b * (100 - a.m);
    const scarto = Math.abs(prezzoQ - prezzoA);
    let testo = `Su una casa di 100 m² la retta blu dice <strong>${Math.round(prezzoQ)} mila €</strong>, ` +
                `l'arancione <strong>${Math.round(prezzoA)} mila €</strong>.`;
    if (scarto < 6) {
      testo += ' Finché tutti i punti sono in fila, le due rette dicono quasi la stessa cosa. ' +
               '<strong>Trascinate in alto la casa cerchiata</strong> e guardate che succede.';
    } else {
      testo += ` <strong>Scarto: ${Math.round(scarto)} mila €</strong>, sugli stessi identici dati. ` +
               'La retta blu insegue la casa strana perché il suo costo eleva gli errori al quadrato; ' +
               'l\'arancione la lascia dov\'è.';
    }
    d3.select('#sup-costo-verdetto').attr('class', 'verdetto ' + (scarto < 6 ? '' : 'attenzione')).html(testo);
  }

  disegnaCosto();
});

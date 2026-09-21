/* ═══════════════════════════════════════════════════════════════════════
   Tappa 5-a — anatomia di un modello linguistico.

   1) COM'È FATTO: la catena di montaggio in cinque caselle, ognuna con i
      dati veri della frase scritta dal pubblico — pezzetti, numeri per
      ogni pezzetto, blocchi impilati, punteggi su tutto il vocabolario,
      sorteggio.
   2) COME IMPARA: il gioco della parola coperta. Un modello neurale vero
      (due parole di contesto → una previsione su tutto il vocabolario)
      allenato qui dentro: si copre la parola successiva, si indovina, si
      scopre, si corregge. Le risposte non le prepara nessuno: sono già
      nel testo. È l'auto-supervisione, il motivo per cui questi modelli
      hanno potuto studiare su tutto il web.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('llm', function () {
  const L = LEZIONE, C = L.colori;

  /* ── testo di studio: lo stesso scelto nel menù della tappa ─────────── */

  function corpusScelto() {
    const sel = document.getElementById('lm-corpus');
    return window.CORPORA[sel && sel.value ? +sel.value : 0];
  }

  function tokenizza(testo) {
    return testo.toLowerCase()
      .replace(/[’]/g, "'").replace(/'/g, "' ")
      .replace(/([.,;:!?«»])/g, ' $1 ')
      .split(/\s+/).filter(Boolean);
  }

  /* ═══════════ il modello: due parole → la parola dopo ═══════════ */

  const DIM = 6, NASC = 24;
  let vocab = [], indice = new Map(), token = [], coppie = [];
  let E, W1, b1, W2, b2;                    // immersioni, strato nascosto, uscita
  let passi = 0, storiaErrore = [], azzeccate = [], timerCoperta = null, posizione = 0;

  function preparaModello() {
    token = tokenizza(corpusScelto().testo);
    vocab = [];
    indice = new Map();
    token.forEach(p => { if (!indice.has(p)) { indice.set(p, vocab.length); vocab.push(p); } });
    coppie = [];
    for (let i = 2; i < token.length; i++) {
      coppie.push([indice.get(token[i - 2]), indice.get(token[i - 1]), indice.get(token[i]), i]);
    }
    inizializzaPesi();
  }

  function inizializzaPesi() {
    const rnd = L.casuale(31);
    const g = (s) => (rnd() - 0.5) * s;
    E = vocab.map(() => d3.range(DIM).map(() => g(0.8)));
    W1 = d3.range(NASC).map(() => d3.range(2 * DIM).map(() => g(0.6)));
    b1 = d3.range(NASC).map(() => 0);
    W2 = vocab.map(() => d3.range(NASC).map(() => g(0.4)));
    b2 = vocab.map(() => 0);
    passi = 0;
    storiaErrore = [];
    azzeccate = [];
  }

  function prevedi(a, b) {
    const x = E[a].concat(E[b]);
    const h = W1.map((w, j) => Math.tanh(d3.sum(w.map((v, i) => v * x[i])) + b1[j]));
    const logiti = W2.map((w, k) => d3.sum(w.map((v, j) => v * h[j])) + b2[k]);
    return { p: L.softmax(logiti), h, x };
  }

  function correggi(a, b, vero, lr = 0.12) {
    const { p, h, x } = prevedi(a, b);
    const dLog = p.map((v, k) => v - (k === vero ? 1 : 0));
    const dh = new Array(NASC).fill(0);
    for (let k = 0; k < vocab.length; k++) {
      const d = dLog[k];
      if (Math.abs(d) < 1e-6) continue;
      for (let j = 0; j < NASC; j++) { dh[j] += d * W2[k][j]; W2[k][j] -= lr * d * h[j]; }
      b2[k] -= lr * d;
    }
    const dx = new Array(2 * DIM).fill(0);
    for (let j = 0; j < NASC; j++) {
      const d = dh[j] * (1 - h[j] * h[j]);
      for (let i = 0; i < 2 * DIM; i++) { dx[i] += d * W1[j][i]; W1[j][i] -= lr * d * x[i]; }
      b1[j] -= lr * d;
    }
    for (let i = 0; i < DIM; i++) { E[a][i] -= lr * dx[i]; E[b][i] -= lr * dx[DIM + i]; }
    passi++;
    return -Math.log(p[vero] + 1e-9);
  }

  /* ═══════════ 1) la catena di montaggio ═══════════ */

  const FASI = [
    { n: 1, titolo: 'il testo', sotto: 'a pezzetti' },
    { n: 2, titolo: 'ogni pezzetto', sotto: 'diventa numeri' },
    { n: 3, titolo: 'i blocchi', sotto: 'tutti uguali' },
    { n: 4, titolo: 'un punteggio', sotto: 'per ogni parola' },
    { n: 5, titolo: 'si sceglie', sotto: 'la parola dopo' }
  ];
  let faseAttiva = 1, nBlocchi = 6;

  const tc = L.tela('#catena-schema', 900, 130, { t: 10, d: 10, b: 10, s: 10 });
  const LARG = 158, SALTO = 176;
  const gFasi = tc.g.selectAll('g.fase').data(FASI).join('g').attr('class', 'fase')
    .attr('transform', (d, i) => `translate(${i * SALTO},10)`)
    .style('cursor', 'pointer')
    .on('click', (ev, d) => { faseAttiva = d.n; disegnaCatena(); });
  gFasi.append('rect').attr('width', LARG).attr('height', 82).attr('rx', 12)
    .attr('stroke-width', 2);
  gFasi.append('text').attr('x', LARG / 2).attr('y', 24).attr('text-anchor', 'middle')
    .attr('font-size', 13).attr('fill', C.inchiostro3).text((d, i) => 'passo ' + d.n);
  gFasi.append('text').attr('x', LARG / 2).attr('y', 48).attr('text-anchor', 'middle')
    .attr('font-size', 15).attr('font-weight', 700).text(d => d.titolo);
  gFasi.append('text').attr('x', LARG / 2).attr('y', 68).attr('text-anchor', 'middle')
    .attr('font-size', 13).attr('fill', C.inchiostro2).text(d => d.sotto);
  tc.g.selectAll('path.freccia').data(d3.range(4)).join('path').attr('class', 'freccia')
    .attr('d', i => `M${i * SALTO + LARG + 3},51 L${(i + 1) * SALTO - 5},51 ` +
                    `M${(i + 1) * SALTO - 14},44 L${(i + 1) * SALTO - 5},51 L${(i + 1) * SALTO - 14},58`)
    .attr('fill', 'none').attr('stroke', C.inchiostro3).attr('stroke-width', 2);

  /* i numeri di ogni pezzetto (passo 2) */
  const tNum = L.tela('#catena-numeri', 620, 150, { t: 24, d: 10, b: 10, s: 86 });
  /* la pila dei blocchi (passo 3) */
  const tBlo = L.tela('#catena-blocchi', 620, 200, { t: 10, d: 10, b: 10, s: 10 });
  /* i punteggi su tutto il vocabolario (passo 4) */
  const tPun = L.tela('#catena-punteggi', 620, 210, { t: 24, d: 30, b: 24, s: 100 });
  /* il sorteggio (passo 5) */
  const tSce = L.tela('#catena-scelta', 620, 120, { t: 20, d: 10, b: 10, s: 10 });

  function paroleDellaFrase() {
    const testo = d3.select('#tok-testo').property('value') || '';
    return tokenizza(testo).filter(p => indice.has(p));
  }

  function contestoCorrente() {
    const p = paroleDellaFrase();
    if (p.length >= 2) return [indice.get(p[p.length - 2]), indice.get(p[p.length - 1])];
    if (p.length === 1) return [indice.get(p[0]), indice.get(p[0])];
    return [0, Math.min(1, vocab.length - 1)];
  }

  function disegnaCatena() {
    gFasi.select('rect')
      .attr('fill', d => (d.n === faseAttiva ? '#ece9f7' : C.superficie))
      .attr('stroke', d => (d.n === faseAttiva ? C.lingua : C.bordo));
    gFasi.select('text:nth-child(3)').attr('fill', d => (d.n === faseAttiva ? C.lingua : C.dati));
    d3.selectAll('#catena-dettaglio > div').each(function () {
      this.hidden = (+this.dataset.fase !== faseAttiva);
    });

    if (faseAttiva === 2) disegnaNumeri();
    if (faseAttiva === 3) disegnaBlocchi();
    if (faseAttiva === 4 || faseAttiva === 5) disegnaPunteggi();
  }

  function disegnaNumeri() {
    const parole = paroleDellaFrase().slice(-4);
    const scala = d3.scaleDiverging(t => d3.interpolateRgbBasis(['#c0392b', '#f0efec', '#4a3aa7'])(t))
      .domain([-1, 0, 1]);
    tNum.svg.selectAll('text.titolo-grafico').data([0]).join('text')
      .attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
      .text('le ultime parole della frase, e i sei numeri di ciascuna');
    const righe = tNum.g.selectAll('g.riga').data(parole).join('g').attr('class', 'riga')
      .attr('transform', (d, i) => `translate(0,${i * 28})`);
    righe.selectAll('text.nome').data(d => [d]).join('text').attr('class', 'nome')
      .attr('x', -10).attr('y', 18).attr('text-anchor', 'end')
      .attr('font-size', 14).attr('fill', C.dati).text(d => d);
    righe.each(function (parola) {
      const v = E[indice.get(parola)];
      const g = d3.select(this);
      g.selectAll('g.cella').data(v).join(
        entra => {
          const c = entra.append('g').attr('class', 'cella');
          c.append('rect').attr('width', 62).attr('height', 24).attr('rx', 4);
          c.append('text').attr('x', 31).attr('y', 17).attr('text-anchor', 'middle').attr('font-size', 12);
          return c;
        })
        .attr('transform', (d, i) => `translate(${i * 68},0)`)
        .each(function (d) {
          d3.select(this).select('rect').attr('fill', scala(Math.max(-1, Math.min(1, d))));
          d3.select(this).select('text').attr('fill', Math.abs(d) > 0.6 ? '#fff' : C.dati)
            .text(L.num(d, 2));
        });
    });
  }

  function disegnaBlocchi() {
    const mostrati = Math.min(nBlocchi, 8);
    const alt = 20, gap = 4;
    const gb = tBlo.g.selectAll('g.blocco').data(d3.range(mostrati)).join('g').attr('class', 'blocco')
      .attr('transform', (d, i) => `translate(0,${i * (alt + gap)})`);
    gb.selectAll('rect').data([0]).join('rect')
      .attr('width', 420).attr('height', alt).attr('rx', 5)
      .attr('fill', '#ece9f7').attr('stroke', C.lingua).attr('stroke-opacity', .5);
    gb.selectAll('text').data([0]).join('text')
      .attr('x', 12).attr('y', 14).attr('font-size', 12).attr('fill', C.lingua)
      .text('guarda le altre parole  →  rimescola i numeri');
    tBlo.g.selectAll('text.coda').data([nBlocchi > 8 ? nBlocchi - 8 : 0]).join('text').attr('class', 'coda')
      .attr('x', 12).attr('y', mostrati * (alt + gap) + 18)
      .attr('font-size', 13).attr('fill', C.inchiostro2)
      .text(d => (d > 0 ? `… e altri ${d} blocchi identici` : ''));
    tBlo.g.selectAll('text.nota-blocchi').data([0]).join('text').attr('class', 'nota-blocchi')
      .attr('x', 450).attr('y', 20).attr('font-size', 13).attr('fill', C.inchiostro2)
      .text(nBlocchi >= 96 ? 'come GPT-3' : '');
  }

  function disegnaPunteggi() {
    const [a, b] = contestoCorrente();
    const { p } = prevedi(a, b);
    const ordinate = p.map((v, i) => ({ parola: vocab[i], p: v }))
      .sort((x, y) => y.p - x.p).slice(0, 7);

    tPun.svg.selectAll('text.titolo-grafico').data([0]).join('text')
      .attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
      .text(`dopo «${vocab[a]} ${vocab[b]}» il modello dà questi punteggi`);
    const x = d3.scaleLinear().domain([0, d3.max(ordinate, d => d.p)]).range([0, tPun.w]);
    const y = d3.scaleBand().domain(ordinate.map(d => d.parola)).range([0, tPun.h]).padding(.2);
    tPun.g.selectAll('rect').data(ordinate).join('rect')
      .attr('x', 0).attr('y', d => y(d.parola)).attr('height', y.bandwidth()).attr('rx', 4)
      .attr('fill', (d, i) => (i === 0 ? C.lingua : '#d7d1ee'))
      .attr('width', d => Math.max(2, x(d.p)));
    tPun.g.selectAll('text.et').data(ordinate).join('text').attr('class', 'et')
      .attr('x', -8).attr('y', d => y(d.parola) + y.bandwidth() / 2 + 5)
      .attr('text-anchor', 'end').attr('font-size', 13).attr('fill', C.dati).text(d => d.parola);
    tPun.g.selectAll('text.val').data(ordinate).join('text').attr('class', 'val')
      .attr('x', d => Math.max(2, x(d.p)) + 6).attr('y', d => y(d.parola) + y.bandwidth() / 2 + 5)
      .attr('font-size', 12).attr('fill', C.inchiostro2).text(d => L.perc(d.p, 0));

    /* passo 5: il sorteggio */
    const scelto = ordinate[L.estrai(ordinate.map(d => d.p / d3.sum(ordinate, o => o.p)))];
    tSce.g.selectAll('text').data([scelto]).join('text')
      .attr('x', 0).attr('y', 30).attr('font-size', 20).attr('fill', C.dati)
      .html(d => `questa volta esce: <tspan font-weight="700" fill="${C.lingua}">${d.parola}</tspan>`);
    tSce.g.selectAll('text.sotto').data([0]).join('text').attr('class', 'sotto')
      .attr('x', 0).attr('y', 58).attr('font-size', 13).attr('fill', C.inchiostro2)
      .text('premete di nuovo il passo 5: spesso esce una parola diversa.');
  }

  d3.select('#catena-nblocchi').on('input', function () {
    nBlocchi = +this.value;
    d3.select('#catena-nblocchi-out').text(
      nBlocchi === 96 ? '96 blocchi — come GPT-3' : `${nBlocchi} blocc${nBlocchi === 1 ? 'o' : 'hi'}`);
    disegnaBlocchi();
  });
  d3.select('#tok-testo').on('input.catena', () => { if (faseAttiva >= 2) disegnaCatena(); });

  /* ═══════════ 2) il gioco della parola coperta ═══════════ */

  const tp = L.tela('#coperta-previsioni', 520, 230, { t: 26, d: 40, b: 10, s: 110 });
  const terr = L.tela('#coperta-errore', 340, 130, { t: 26, d: 14, b: 26, s: 42 });
  let scoperta = false;

  function frasePosizione(i) {
    /* mostra qualche parola prima della parola coperta */
    const [, , , pos] = coppie[i];
    const da = Math.max(0, pos - 8);
    return { prima: token.slice(da, pos), vera: token[pos] };
  }

  function disegnaCoperta() {
    const c = coppie[posizione % coppie.length];
    const { prima, vera } = frasePosizione(posizione % coppie.length);
    const { p } = prevedi(c[0], c[1]);

    let html = '';
    prima.forEach((w, i) => {
      const senzaSpazio = i === 0 || /^[.,;:!?»]$/.test(w) || prima[i - 1].endsWith("'");
      html += (senzaSpazio ? '' : ' ') + w;
    });
    html += ' ' + (scoperta
      ? `<span class="nuova">${vera}</span>`
      : '<span class="coperta">███</span>');
    d3.select('#coperta-frase').html(html);

    const ordinate = p.map((v, i) => ({ parola: vocab[i], p: v, vera: i === c[2] }))
      .sort((a, b) => b.p - a.p).slice(0, 6);
    if (!ordinate.some(d => d.vera)) {
      ordinate[5] = { parola: vera, p: p[c[2]], vera: true };
    }

    tp.svg.selectAll('text.titolo-grafico').data([0]).join('text')
      .attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
      .text('che cosa si aspetta il modello sotto la macchia nera');
    const x = d3.scaleLinear().domain([0, Math.max(0.02, d3.max(ordinate, d => d.p))]).range([0, tp.w]);
    const y = d3.scaleBand().domain(ordinate.map(d => d.parola)).range([0, tp.h]).padding(.2);
    tp.g.selectAll('rect').data(ordinate).join('rect')
      .attr('x', 0).attr('y', d => y(d.parola)).attr('height', y.bandwidth()).attr('rx', 4)
      .attr('fill', d => (d.vera ? C.verifica : '#d7d1ee'))
      .attr('width', d => Math.max(2, x(d.p)));
    tp.g.selectAll('text.et').data(ordinate).join('text').attr('class', 'et')
      .attr('x', -8).attr('y', d => y(d.parola) + y.bandwidth() / 2 + 5)
      .attr('text-anchor', 'end').attr('font-size', 13)
      .attr('font-weight', d => (d.vera && scoperta ? 700 : 400))
      .attr('fill', d => (d.vera && scoperta ? C.verifica : C.dati))
      .text(d => (scoperta || !d.vera ? d.parola : '???'));
    tp.g.selectAll('text.val').data(ordinate).join('text').attr('class', 'val')
      .attr('x', d => Math.max(2, x(d.p)) + 6).attr('y', d => y(d.parola) + y.bandwidth() / 2 + 5)
      .attr('font-size', 12).attr('fill', C.inchiostro2).text(d => L.perc(d.p, 0));

    aggiornaStatCoperta(p[c[2]], vera);
  }

  function aggiornaStatCoperta(probVera, vera) {
    const colpi = azzeccate.length
      ? azzeccate.filter(Boolean).length / azzeccate.length : 0;
    d3.select('#coperta-statistiche').html([
      ['parole coperte finora', passi.toLocaleString('it-IT'), false],
      ['indovinate al primo colpo', L.perc(colpi, 0), false],
      ['manopole del modello', (vocab.length * DIM + NASC * 2 * DIM + NASC + vocab.length * NASC + vocab.length)
        .toLocaleString('it-IT'), true]
    ].map(([et, v, av]) => `<div class="statistica"${av ? ' data-avanzato' : ''}>` +
      `<span class="valore">${v}</span><span class="etichetta">${et}</span></div>`).join(''));

    const v = d3.select('#coperta-verdetto');
    if (scoperta) {
      v.attr('class', 'verdetto ' + (probVera > 0.3 ? 'buono' : 'attenzione'))
        .html(`La parola era <strong>«${vera}»</strong>, e il modello le dava ` +
              `<strong>${L.perc(probVera, 1)}</strong>. ` +
              (probVera > 0.3
                ? 'Ci era andato vicino: poco da correggere.'
                : 'Pochissimo — ed è esattamente da questo scarto che si calcola ' +
                  'di quanto girare ognuna delle manopole.'));
    } else if (passi === 0) {
      v.attr('class', 'verdetto').html(
        'Manopole a caso: il modello non ha idea. Premete «Scopri la parola» per vedere ' +
        'quanto ci andava vicino, poi «Allena il modello».');
    } else {
      v.attr('class', 'verdetto').html(
        `Ha visto <strong>${passi.toLocaleString('it-IT')}</strong> parole coperte. ` +
        'Ogni volta: indovina, scopre, si corregge. Sempre la stessa cosa, ' +
        'per miliardi di parole nei modelli veri.');
    }
  }

  function disegnaErroreCoperta() {
    terr.svg.selectAll('text.titolo-grafico').data([0]).join('text')
      .attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
      .text('quanto si stupisce della parola vera');
    if (!storiaErrore.length) return;
    const x = d3.scaleLinear().domain([0, Math.max(20, storiaErrore.length)]).range([0, terr.w]);
    const y = d3.scaleLinear().domain([0, d3.max(storiaErrore)]).nice().range([terr.h, 0]);
    terr.g.selectAll('g.asse').remove();
    terr.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${terr.h})`)
      .call(d3.axisBottom(x).ticks(4));
    terr.g.append('g').attr('class', 'asse').call(d3.axisLeft(y).ticks(3).tickFormat(d => L.num(d, 1)));
    terr.g.selectAll('path.curva').data([storiaErrore]).join('path').attr('class', 'curva')
      .attr('fill', 'none').attr('stroke', C.errore).attr('stroke-width', 2.5)
      .attr('d', d3.line().x((d, i) => x(i)).y(d => y(d))(storiaErrore));
  }

  d3.select('#coperta-scopri').on('click', () => { scoperta = true; disegnaCoperta(); });
  d3.select('#coperta-altra').on('click', () => {
    posizione = Math.floor(Math.random() * coppie.length);
    scoperta = false;
    disegnaCoperta();
  });
  d3.select('#coperta-reset').on('click', () => {
    if (timerCoperta) { timerCoperta.stop(); timerCoperta = null; d3.select('#coperta-allena').text('▶ Allena il modello'); }
    inizializzaPesi();
    scoperta = false;
    disegnaCoperta();
    disegnaErroreCoperta();
  });

  d3.select('#coperta-allena').on('click', function () {
    if (timerCoperta) {
      timerCoperta.stop(); timerCoperta = null;
      d3.select(this).text('▶ Continua');
      return;
    }
    d3.select(this).text('❚❚ Ferma');
    let accumulo = [];
    timerCoperta = d3.interval(() => {
      for (let i = 0; i < 40; i++) {
        const c = coppie[Math.floor(Math.random() * coppie.length)];
        const { p } = prevedi(c[0], c[1]);
        azzeccate.push(p.indexOf(Math.max(...p)) === c[2]);
        if (azzeccate.length > 400) azzeccate.shift();
        accumulo.push(correggi(c[0], c[1], c[2]));
      }
      storiaErrore.push(d3.mean(accumulo));
      accumulo = [];
      posizione = (posizione + 1) % coppie.length;
      scoperta = false;
      disegnaCoperta();
      disegnaErroreCoperta();
      if (passi > 24000) { timerCoperta.stop(); timerCoperta = null; d3.select('#coperta-allena').text('▶ Continua'); }
    }, 90);
  });

  L.allUscita('llm', () => {
    if (timerCoperta) { timerCoperta.stop(); timerCoperta = null; d3.select('#coperta-allena').text('▶ Allena il modello'); }
  });

  /* ── avvio, e riavvio quando cambia il testo di studio ──────────────── */

  function avvia() {
    preparaModello();
    posizione = Math.floor(coppie.length / 3);
    scoperta = false;
    disegnaCatena();
    disegnaCoperta();
    disegnaErroreCoperta();
  }

  d3.select('#lm-corpus').on('change.anatomia', () => {
    if (timerCoperta) { timerCoperta.stop(); timerCoperta = null; d3.select('#coperta-allena').text('▶ Allena il modello'); }
    avvia();
  });

  avvia();
});

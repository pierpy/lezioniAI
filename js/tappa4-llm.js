/* ═══════════════════════════════════════════════════════════════════════
   Tappa 4 — la macchina che scrive.
   Tre livelli, in ordine di complessità crescente:
     a) tokenizzazione: il testo diventa numeri;
     b) modello a n-grammi costruito dal vivo sul testo scelto
        (conteggi + campionamento con temperatura) — l'idea di Shannon 1948;
     c) piccolo modello neurale (Bengio et al., 2003) allenato nel browser:
        ogni parola diventa un punto nel piano e i punti si spostano.
   Più uno schema illustrativo del meccanismo di attenzione.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('llm', function () {
  const L = LEZIONE, C = L.colori;

  /* ── tokenizzazione ──────────────────────────────────────────────────── */

  function tokenizza(testo) {
    return testo.toLowerCase()
      .replace(/[’]/g, "'")
      .replace(/'/g, "' ")
      .replace(/([.,;:!?«»])/g, ' $1 ')
      .split(/\s+/)
      .filter(Boolean);
  }

  let corpus = window.CORPORA[0];
  let token = [], vocabolario = new Map(), modelli = {};

  function preparaCorpus() {
    token = tokenizza(corpus.testo);
    vocabolario = new Map();
    token.forEach(p => { if (!vocabolario.has(p)) vocabolario.set(p, vocabolario.size); });
    modelli = {};
    for (let n = 1; n <= 3; n++) {
      const tavola = new Map();
      for (let i = n; i < token.length; i++) {
        const ctx = token.slice(i - n, i).join(' ');
        if (!tavola.has(ctx)) tavola.set(ctx, new Map());
        const m = tavola.get(ctx);
        m.set(token[i], (m.get(token[i]) || 0) + 1);
      }
      modelli[n] = tavola;
    }
    d3.select('#lm-statistiche').html([
      ['parole nel testo', token.length],
      ['parole diverse', vocabolario.size],
      ['coppie diverse', modelli[1].size ? d3.sum([...modelli[1].values()], m => m.size) : 0]
    ].map(([et, v]) => `<div class="statistica"><span class="valore">${v}</span>` +
                       `<span class="etichetta">${et}</span></div>`).join(''));
    aggiornaGettoni();
    disegnaMatrice();
    reimpostaEmbedding();
  }

  function aggiornaGettoni() {
    const parole = tokenizza(d3.select('#tok-testo').property('value'));
    d3.select('#tok-uscita').selectAll('div.gettone').data(parole).join('div')
      .attr('class', 'gettone')
      .html(p => `<span class="parola">${p}</span>` +
                 `<span class="numero">${vocabolario.has(p) ? vocabolario.get(p) : '?'}</span>`);
  }

  /* ── generazione a n-grammi ──────────────────────────────────────────── */

  let memoria = 2, temperatura = 0.8, scritte = [], timerLm = null;

  function candidate(contesto) {
    for (let k = Math.min(memoria, contesto.length); k >= 1; k--) {
      const m = modelli[k].get(contesto.slice(-k).join(' '));
      if (m && m.size) return { ordine: k, voci: [...m.entries()] };
    }
    return null;
  }

  function probabilita(voci) {
    const pesi = voci.map(([, c]) => Math.pow(c, 1 / temperatura));
    const somma = d3.sum(pesi);
    return pesi.map(p => p / somma);
  }

  function inizioFrase() {
    const inizi = [];
    for (let i = 0; i < token.length - 2; i++) {
      if (i === 0 || token[i - 1] === '.') inizi.push(i);
    }
    const i = inizi[Math.floor(Math.random() * inizi.length)] || 0;
    return token.slice(i, i + Math.max(1, memoria));
  }

  function unaParola() {
    if (!scritte.length) scritte = inizioFrase();
    const c = candidate(scritte);
    if (!c) { scritte = inizioFrase(); disegnaTesto(); return; }
    const prob = probabilita(c.voci);
    const k = L.estrai(prob);
    scritte.push(c.voci[k][0]);
    disegnaTesto();
    disegnaCandidate(c, prob, k);
    if (scritte.length > 90) fermaLm();
  }

  function disegnaTesto() {
    /* ricompone il testo: niente spazio prima della punteggiatura né dopo
       un apostrofo (l' acqua → l'acqua) */
    let html = '';
    const ultimo = scritte.length - 1;
    scritte.forEach((p, i) => {
      const senzaSpazio = i === 0 || /^[.,;:!?»]$/.test(p) || scritte[i - 1].endsWith("'");
      const testo = (i === ultimo && i > 0) ? `<span class="nuova">${p}</span>` : p;
      html += (senzaSpazio ? '' : ' ') + testo;
    });
    d3.select('#lm-testo').html(html + '<span style="opacity:.4">▍</span>');
  }

  function disegnaCandidate(c, prob, scelta) {
    const ordinate = c.voci.map((v, i) => ({ parola: v[0], p: prob[i], scelta: i === scelta }))
      .sort((a, b) => b.p - a.p).slice(0, 8);
    const W = 460, H = Math.max(120, 46 + ordinate.length * 26);
    const t = L.tela('#lm-candidate', W, H, { t: 26, d: 60, b: 22, s: 120 });
    const x = d3.scaleLinear().domain([0, d3.max(ordinate, d => d.p)]).range([0, t.w]);
    const y = d3.scaleBand().domain(ordinate.map(d => d.parola)).range([0, t.h]).padding(.2);

    t.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
      .text(`Dopo «${scritte.slice(-1 - c.ordine, -1).join(' ')}» può venire…`);

    t.g.selectAll('rect').data(ordinate).join('rect')
      .attr('x', 0).attr('y', d => y(d.parola)).attr('height', y.bandwidth()).attr('rx', 4)
      .attr('fill', d => (d.scelta ? C.lingua : '#d7d1ee'))
      .attr('width', d => Math.max(2, x(d.p)));
    t.g.selectAll('text.et').data(ordinate).join('text').attr('class', 'et')
      .attr('x', -8).attr('y', d => y(d.parola) + y.bandwidth() / 2 + 5)
      .attr('text-anchor', 'end').attr('font-size', 14)
      .attr('font-weight', d => (d.scelta ? 700 : 400))
      .attr('fill', C.dati).text(d => d.parola);
    t.g.selectAll('text.val').data(ordinate).join('text').attr('class', 'val')
      .attr('x', d => Math.max(2, x(d.p)) + 6).attr('y', d => y(d.parola) + y.bandwidth() / 2 + 5)
      .attr('font-size', 12).attr('fill', C.inchiostro2).text(d => L.perc(d.p, 0));

    if (ordinate.length === 1) {
      t.svg.append('text').attr('x', 6).attr('y', H - 8)
        .attr('font-size', 12).attr('fill', C.inchiostro3)
        .text('Una sola continuazione possibile: qui il modello sta ripetendo a memoria.');
    }
  }

  function fermaLm() {
    if (timerLm) { timerLm.stop(); timerLm = null; }
    d3.select('#lm-frase').text('▶ Scrivi da solo');
  }

  /* ── tabella delle probabilità (bigrammi) ────────────────────────────── */

  /** Disegna la tabella dei bigrammi. `tavola` può essere quella completa
   *  oppure quella parziale costruita durante l'animazione del conteggio. */
  function disegnaMatrice(tavola, letto) {
    tavola = tavola || modelli[1];
    const frequenze = new Map();
    token.forEach(p => frequenze.set(p, (frequenze.get(p) || 0) + 1));
    const top = [...frequenze.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(d => d[0]);

    const celle = [];
    top.forEach(a => {
      const m = tavola.get(a) || new Map();
      const tot = d3.sum([...m.values()]) || 1;
      top.forEach(b => celle.push({ a, b, p: (m.get(b) || 0) / tot, n: m.get(b) || 0 }));
    });

    const W = 900, H = 420;
    const t = L.tela('#lm-matrice', W, H, { t: 58, d: 20, b: 20, s: 130 });
    const x = d3.scaleBand().domain(top).range([0, t.w]).padding(.06);
    const y = d3.scaleBand().domain(top).range([0, t.h]).padding(.06);
    const colore = d3.scaleSequential(d3.interpolateRgbBasis(C.bluRampa)).domain([0, 0.6]);
    const sugg = L.suggerimento();

    t.g.selectAll('rect').data(celle).join('rect')
      .attr('x', d => x(d.b)).attr('y', d => y(d.a))
      .attr('width', x.bandwidth()).attr('height', y.bandwidth()).attr('rx', 2)
      .attr('fill', d => (d.n ? colore(Math.min(0.6, d.p)) : C.superficie2))
      .on('mousemove', (ev, d) => sugg.mostra(
        `«${d.a}» → «${d.b}»<br>${d.n} volte su ${Math.round(d.n / (d.p || 1))} · ${L.perc(d.p, 0)}`, ev))
      .on('mouseleave', sugg.nascondi);

    t.g.selectAll('text.riga').data(top).join('text').attr('class', 'riga')
      .attr('x', -10).attr('y', d => y(d) + y.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end').attr('font-size', 12).attr('fill', C.inchiostro2).text(d => d);
    t.g.selectAll('text.col').data(top).join('text').attr('class', 'col')
      .attr('transform', d => `translate(${x(d) + x.bandwidth() / 2},-8) rotate(-45)`)
      .attr('font-size', 12).attr('fill', C.inchiostro2).text(d => d);
    t.svg.append('text').attr('class', 'etichetta-asse').attr('x', 8).attr('y', 16)
      .text('riga = parola di adesso · colonna = parola successiva');

    if (letto) {                       // evidenzia la coppia appena letta
      t.g.selectAll('rect.appena').data([letto]).join('rect').attr('class', 'appena')
        .attr('x', d => x(d[1])).attr('y', d => y(d[0]))
        .attr('width', x.bandwidth()).attr('height', y.bandwidth())
        .attr('fill', 'none').attr('stroke', C.errore).attr('stroke-width', 3)
        .attr('opacity', (x(letto[1]) === undefined || y(letto[0]) === undefined) ? 0 : 1);
    }
  }

  /* ── il conteggio, guardato mentre avviene ───────────────────────────── */

  let timerConta = null, parzialeIndice = 0, tavolaParziale = new Map();

  function fermaConta() {
    if (timerConta) { timerConta.stop(); timerConta = null; }
    d3.select('#lm-conta').text(parzialeIndice > 0 ? '▶ Continua a leggere' : '▶ Guardalo mentre impara');
  }

  function contaTutto() {
    fermaConta();
    parzialeIndice = 0;
    tavolaParziale = new Map();
    d3.select('#lm-conta-stato').text('');
    d3.select('#lm-conta').text('▶ Guardalo mentre impara');
    disegnaMatrice();
  }

  function unaLettura() {
    if (parzialeIndice >= token.length - 1) { fermaConta(); return null; }
    const a = token[parzialeIndice], b = token[parzialeIndice + 1];
    if (!tavolaParziale.has(a)) tavolaParziale.set(a, new Map());
    const m = tavolaParziale.get(a);
    m.set(b, (m.get(b) || 0) + 1);
    parzialeIndice++;
    return [a, b];
  }

  function avviaConta() {
    if (timerConta) { fermaConta(); return; }
    if (parzialeIndice >= token.length - 1) { parzialeIndice = 0; tavolaParziale = new Map(); }
    d3.select('#lm-conta').text('❚❚ Ferma');
    timerConta = d3.interval(() => {
      const coppia = unaLettura();
      if (!coppia) return;
      disegnaMatrice(tavolaParziale, coppia);
      d3.select('#lm-conta-stato').html(
        `ha letto <strong>${parzialeIndice}</strong> parole su ${token.length} · ` +
        `ultima coppia: «${coppia[0]}» → «${coppia[1]}»`);
      if (parzialeIndice >= token.length - 1) {
        fermaConta();
        d3.select('#lm-conta-stato').html(
          `<strong>Finito.</strong> Ha letto tutte le ${token.length} parole: ` +
          'la tabella qui sopra è tutto quello che ha imparato.');
      }
    }, 100);
  }

  /* ── modello neurale: le parole diventano punti ──────────────────────── */

  const D = 2;                          // due dimensioni, così si può disegnare
  let vocEmb = [], coppie = [], E = [], Wu = [], bu = [], storiaPerdita = [], epoca = 0, timerEmb = null;

  const tEmb = L.tela('#emb-scatter', 560, 460, { t: 28, d: 40, b: 24, s: 24 });
  const tPer = L.tela('#emb-perdita', 440, 200, { t: 28, d: 20, b: 34, s: 46 });

  function reimpostaEmbedding() {
    if (timerEmb) { timerEmb.stop(); timerEmb = null; d3.select('#emb-vai').text('▶ Allena la rete'); }
    const frequenze = new Map();
    token.forEach(p => { if (!/^[.,;:!?«»]$/.test(p)) frequenze.set(p, (frequenze.get(p) || 0) + 1); });
    vocEmb = [...frequenze.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(d => d[0]);
    const indice = new Map(vocEmb.map((p, i) => [p, i]));
    coppie = [];
    for (let i = 1; i < token.length; i++) {
      if (indice.has(token[i - 1]) && indice.has(token[i])) {
        coppie.push([indice.get(token[i - 1]), indice.get(token[i])]);
      }
    }
    const rnd = L.casuale(7);
    E = vocEmb.map(() => d3.range(D).map(() => (rnd() - .5) * 0.6));
    Wu = vocEmb.map(() => d3.range(D).map(() => (rnd() - .5) * 0.6));
    bu = vocEmb.map(() => 0);
    storiaPerdita = [];
    epoca = 0;
    disegnaEmbedding();
    disegnaPerdita();
    d3.select('#emb-stato').text(`${vocEmb.length} parole, ${coppie.length} coppie di allenamento`);
  }

  /** Una passata completa di discesa del gradiente stocastica. */
  function epocaEmbedding(lr = 0.25) {
    let perdita = 0;
    const ordine = d3.shuffle(d3.range(coppie.length));
    for (const idx of ordine) {
      const [pre, suc] = coppie[idx];
      const h = E[pre];
      const logiti = Wu.map((w, k) => w[0] * h[0] + w[1] * h[1] + bu[k]);
      const p = L.softmax(logiti);
      perdita -= Math.log(p[suc] + 1e-9);
      const dh = [0, 0];
      for (let k = 0; k < vocEmb.length; k++) {
        const d = p[k] - (k === suc ? 1 : 0);
        dh[0] += d * Wu[k][0];
        dh[1] += d * Wu[k][1];
        Wu[k][0] -= lr * d * h[0];
        Wu[k][1] -= lr * d * h[1];
        bu[k] -= lr * d;
      }
      E[pre][0] -= lr * dh[0];
      E[pre][1] -= lr * dh[1];
    }
    epoca++;
    storiaPerdita.push(perdita / coppie.length);
  }

  function disegnaEmbedding() {
    const ex = d3.extent(E, d => d[0]), ey = d3.extent(E, d => d[1]);
    const marg = 0.15 * Math.max(ex[1] - ex[0], ey[1] - ey[0], 0.2);
    const x = d3.scaleLinear().domain([ex[0] - marg, ex[1] + marg]).range([0, tEmb.w]);
    const y = d3.scaleLinear().domain([ey[0] - marg, ey[1] + marg]).range([tEmb.h, 0]);

    tEmb.g.selectAll('g.parola').data(vocEmb).join(
      entra => {
        const g = entra.append('g').attr('class', 'parola');
        g.append('circle').attr('r', 4.5).attr('fill', C.lingua).attr('fill-opacity', .85);
        g.append('text').attr('x', 7).attr('y', 4).attr('font-size', 12)
          .attr('fill', C.inchiostro2)
          .attr('stroke', '#ffffff').attr('stroke-width', 3).attr('paint-order', 'stroke');
        return g;
      })
      .attr('transform', (d, i) => `translate(${x(E[i][0])},${y(E[i][1])})`)
      .select('text').text((d, i) => (i < 20 ? d : ''));
  }

  function disegnaPerdita() {
    tPer.svg.selectAll('text.titolo-grafico').data([0]).join('text')
      .attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
      .text('Errore medio (più scende, meglio prevede)');
    const x = d3.scaleLinear().domain([0, Math.max(40, storiaPerdita.length)]).range([0, tPer.w]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(storiaPerdita) || Math.log(Math.max(2, vocEmb.length))]).nice()
      .range([tPer.h, 0]);

    tPer.g.selectAll('g.asse').remove();
    tPer.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${tPer.h})`)
      .call(d3.axisBottom(x).ticks(5));
    tPer.g.append('g').attr('class', 'asse').call(d3.axisLeft(y).ticks(4));

    tPer.g.selectAll('path.curva').data([storiaPerdita]).join('path').attr('class', 'curva')
      .attr('fill', 'none').attr('stroke', C.modello).attr('stroke-width', 2.5)
      .attr('d', d3.line().x((d, i) => x(i)).y(d => y(d))(storiaPerdita));
  }

  /* ── schema illustrativo dell'attenzione ─────────────────────────────── */

  function disegnaAttenzione(scelta = 6) {
    const frase = ['Il', 'gatto', 'insegue', 'il', 'topo', 'perché', 'ha', 'fame'];
    const pesiNoti = {
      6: { 1: .55, 2: .18, 4: .13, 5: .09, 0: .05 },
      7: { 1: .42, 6: .28, 4: .18, 2: .12 },
      4: { 2: .45, 1: .30, 3: .15, 0: .10 },
      2: { 1: .62, 0: .20, 4: .18 }
    };
    const pesi = pesiNoti[scelta] || Object.fromEntries(
      d3.range(scelta).map(i => [i, 1 / Math.max(1, scelta)]));

    const W = 900, H = 230;
    const t = L.tela('#att-figura', W, H, { t: 110, d: 20, b: 40, s: 20 });
    const passo = t.w / frase.length;
    const px = i => passo * (i + .5);

    t.svg.append('text').attr('class', 'titolo-grafico').attr('x', 8).attr('y', 20)
      .text('Cliccate una parola: a quali parole precedenti "guarda" per essere capita');

    t.g.selectAll('path').data(Object.entries(pesi)).join('path')
      .attr('fill', 'none').attr('stroke', C.lingua).attr('stroke-opacity', .55)
      .attr('stroke-width', d => 1 + 12 * d[1])
      .attr('stroke-linecap', 'round')
      .attr('d', d => {
        const x0 = px(+d[0]), x1 = px(scelta), h = 30 + 60 * Math.abs(x1 - x0) / t.w;
        return `M${x0},0 C${x0},${-h} ${x1},${-h} ${x1},0`;
      });

    t.g.selectAll('text.parola').data(frase).join('text').attr('class', 'parola')
      .attr('x', (d, i) => px(i)).attr('y', 24).attr('text-anchor', 'middle')
      .attr('font-size', 21)
      .attr('font-weight', (d, i) => (i === scelta ? 700 : 400))
      .attr('fill', (d, i) => (i === scelta ? C.lingua : C.dati))
      .style('cursor', 'pointer')
      .text(d => d)
      .on('click', (ev, d) => disegnaAttenzione(frase.indexOf(d)));

    t.g.selectAll('text.peso').data(Object.entries(pesi)).join('text').attr('class', 'peso')
      .attr('x', d => px(+d[0])).attr('y', 44).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('fill', C.inchiostro3)
      .text(d => L.perc(d[1], 0));
  }

  /* ── comandi ─────────────────────────────────────────────────────────── */

  d3.select('#lm-corpus').selectAll('option').data(window.CORPORA).join('option')
    .attr('value', (d, i) => i).text(d => d.nome);

  d3.select('#lm-corpus').on('change', function () {
    fermaLm();
    corpus = window.CORPORA[+this.value];
    scritte = [];
    parzialeIndice = 0;
    tavolaParziale = new Map();
    d3.select('#lm-conta-stato').text('');
    preparaCorpus();
    d3.select('#lm-testo').html('<span style="opacity:.5">Premete «Una parola» oppure «Scrivi da solo».</span>');
    L.tela('#lm-candidate', 460, 120);
  });

  d3.select('#tok-testo').on('input', aggiornaGettoni);

  d3.select('#lm-memoria').on('input', function () {
    memoria = +this.value;
    d3.select('#lm-memoria-out').text(
      memoria === 1 ? '1 parola — scrive sciocchezze divertenti'
        : memoria === 2 ? '2 parole — frasi quasi sensate'
        : '3 parole — ripete il testo a memoria');
    scritte = [];
    disegnaTesto();
  });

  d3.select('#lm-temperatura').on('input', function () {
    temperatura = +this.value;
    d3.select('#lm-temperatura-out').text(
      L.num(temperatura, 1) + (temperatura < 0.5 ? ' — prevedibile'
        : temperatura < 1.05 ? ' — equilibrata' : ' — fantasiosa e sconclusionata'));
  });

  d3.select('#lm-passo').on('click', () => { fermaLm(); unaParola(); });
  d3.select('#lm-frase').on('click', function () {
    if (timerLm) { fermaLm(); return; }
    d3.select(this).text('❚❚ Ferma');
    timerLm = d3.interval(unaParola, 320);
  });
  d3.select('#lm-pulisci').on('click', () => { fermaLm(); scritte = []; disegnaTesto(); });

  d3.select('#emb-vai').on('click', function () {
    if (timerEmb) {
      timerEmb.stop(); timerEmb = null;
      d3.select(this).text('▶ Allena la rete');
      return;
    }
    d3.select(this).text('❚❚ Ferma');
    timerEmb = d3.interval(() => {
      epocaEmbedding();
      disegnaEmbedding();
      disegnaPerdita();
      d3.select('#emb-stato').html(
        `passata n. ${epoca} · errore ${L.num(storiaPerdita[storiaPerdita.length - 1], 2)}`);
      if (epoca >= 150) { timerEmb.stop(); timerEmb = null; d3.select('#emb-vai').text('▶ Continua'); }
    }, 40);
  });
  d3.select('#emb-reset').on('click', reimpostaEmbedding);
  d3.select('#lm-conta').on('click', avviaConta);
  d3.select('#lm-conta-tutto').on('click', contaTutto);

  /* uscendo dalla tappa si spegne tutto ciò che sta animando */
  L.allUscita('llm', () => { fermaLm(); fermaConta();
    if (timerEmb) { timerEmb.stop(); timerEmb = null; d3.select('#emb-vai').text('▶ Allena la rete'); } });

  /* ── avvio ───────────────────────────────────────────────────────────── */

  preparaCorpus();
  d3.select('#lm-testo').html('<span style="opacity:.5">Premete «Una parola» oppure «Scrivi da solo».</span>');
  L.tela('#lm-candidate', 460, 120);
  disegnaAttenzione(6);
});

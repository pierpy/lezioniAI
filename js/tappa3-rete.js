/* ═══════════════════════════════════════════════════════════════════════
   Tappa 3 — la rete che legge le cifre scritte a mano.
   Rete 784 → 64 (ReLU) → 10 (softmax) addestrata davvero su 8.000 cifre
   dell'archivio MNIST (tools/export-mnist.js + tools/train-mlp.py).
   Qui si esegue solo il passaggio in avanti: moltiplicazioni e somme.

   Il preprocessamento dell'immagine disegnata ricalca quello di MNIST
   (LeCun et al., 1998): si ritaglia la cifra, la si riduce a 20×20
   mantenendo le proporzioni e la si centra sul baricentro dell'inchiostro
   dentro un quadrato 28×28.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.reteMnist = (function () {
  const L = LEZIONE, C = L.colori;
  const M = window.MODELLO_MNIST;

  /* ── disegno su tela ─────────────────────────────────────────────────── */

  function collegaTela(selettore, alCambio) {
    const tela = document.querySelector(selettore);
    const ctx = tela.getContext('2d', { willReadFrequently: true });

    function pulisci() {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tela.width, tela.height);
      alCambio();
    }

    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#15140f';

    let giu = false, sospeso = false;
    const posizione = ev => {
      const r = tela.getBoundingClientRect();
      return [(ev.clientX - r.left) * tela.width / r.width,
              (ev.clientY - r.top) * tela.height / r.height];
    };
    const programma = () => {
      if (sospeso) return;
      sospeso = true;
      requestAnimationFrame(() => { sospeso = false; alCambio(); });
    };

    tela.addEventListener('pointerdown', ev => {
      giu = true;
      tela.setPointerCapture(ev.pointerId);
      const [px, py] = posizione(ev);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 0.1, py + 0.1);
      ctx.stroke();
      programma();
      ev.preventDefault();
    });
    tela.addEventListener('pointermove', ev => {
      if (!giu) return;
      const [px, py] = posizione(ev);
      ctx.lineTo(px, py);
      ctx.stroke();
      programma();
      ev.preventDefault();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(e =>
      tela.addEventListener(e, () => { if (giu) { giu = false; alCambio(); } }));

    pulisci();
    return { tela, ctx, pulisci };
  }

  /* ── dall'immagine 280×280 ai 784 numeri ─────────────────────────────── */

  const piccola = document.createElement('canvas');
  piccola.width = piccola.height = 28;
  const ctxPiccola = piccola.getContext('2d', { willReadFrequently: true });

  function estraiVettore(tela) {
    const lato = tela.width;
    const dati = tela.getContext('2d').getImageData(0, 0, lato, lato).data;
    let x0 = lato, y0 = lato, x1 = -1, y1 = -1;
    for (let r = 0; r < lato; r++) {
      for (let c = 0; c < lato; c++) {
        if (255 - dati[(r * lato + c) * 4] > 40) {
          if (c < x0) x0 = c; if (c > x1) x1 = c;
          if (r < y0) y0 = r; if (r > y1) y1 = r;
        }
      }
    }
    if (x1 < 0) return null;                       // foglio bianco

    const lx = x1 - x0 + 1, ly = y1 - y0 + 1;
    const fattore = 20 / Math.max(lx, ly);
    const lw = Math.max(1, Math.round(lx * fattore));
    const lh = Math.max(1, Math.round(ly * fattore));

    ctxPiccola.fillStyle = '#ffffff';
    ctxPiccola.fillRect(0, 0, 28, 28);
    ctxPiccola.imageSmoothingEnabled = true;
    ctxPiccola.drawImage(tela, x0, y0, lx, ly, (28 - lw) / 2, (28 - lh) / 2, lw, lh);

    const p = ctxPiccola.getImageData(0, 0, 28, 28).data;
    const grezzo = new Float32Array(784);
    let massa = 0, cx = 0, cy = 0;
    for (let i = 0; i < 784; i++) {
      const v = (255 - p[i * 4]) / 255;
      grezzo[i] = v;
      massa += v;
      cx += v * (i % 28);
      cy += v * Math.floor(i / 28);
    }
    if (massa < 1e-6) return null;

    /* traslazione intera che porta il baricentro al centro (come in MNIST) */
    const dx = Math.round(13.5 - cx / massa), dy = Math.round(13.5 - cy / massa);
    const vettore = new Float32Array(784);
    for (let r = 0; r < 28; r++) {
      for (let c = 0; c < 28; c++) {
        const rs = r - dy, cs = c - dx;
        if (rs >= 0 && rs < 28 && cs >= 0 && cs < 28) vettore[r * 28 + c] = grezzo[rs * 28 + cs];
      }
    }
    return vettore;
  }

  /* ── passaggio in avanti ─────────────────────────────────────────────── */

  function prevedi(vettore) {
    const nascosti = new Float32Array(M.architettura[1]);
    for (let j = 0; j < nascosti.length; j++) {
      let s = M.b1[j];
      const w = M.W1[j];
      for (let i = 0; i < 784; i++) s += w[i] * vettore[i];
      nascosti[j] = s > 0 ? s : 0;
    }
    const logiti = new Array(10);
    for (let k = 0; k < 10; k++) {
      let s = M.b2[k];
      const w = M.W2[k];
      for (let j = 0; j < nascosti.length; j++) s += w[j] * nascosti[j];
      logiti[k] = s;
    }
    return { nascosti, probabilita: L.softmax(logiti) };
  }

  /* ── disegni riutilizzabili ──────────────────────────────────────────── */

  const scalaGrigi = d3.scaleSequential(d3.interpolateRgbBasis(C.bluRampa)).domain([0, 1]);

  function disegnaImmagine(gruppo, vettore, lato) {
    const celle = d3.range(784);
    gruppo.selectAll('rect').data(celle).join('rect')
      .attr('x', i => (i % 28) * lato).attr('y', i => Math.floor(i / 28) * lato)
      .attr('width', lato).attr('height', lato)
      .attr('fill', i => (vettore ? scalaGrigi(vettore[i]) : '#ffffff'))
      .attr('shape-rendering', 'crispEdges');
  }

  /** Barre orizzontali delle dieci probabilità. */
  function disegnaBarre(selettore, prob) {
    const W = 380, H = 360;
    const t = L.tela(selettore, W, H, { t: 26, d: 56, b: 20, s: 30 });
    const x = d3.scaleLinear().domain([0, 1]).range([0, t.w]);
    const y = d3.scaleBand().domain(d3.range(10)).range([0, t.h]).padding(0.22);
    const vincitore = prob ? prob.indexOf(Math.max(...prob)) : -1;

    t.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
      .text('Quanto è convinta che sia…');

    t.g.selectAll('text.cifra').data(d3.range(10)).join('text').attr('class', 'cifra')
      .attr('x', -10).attr('y', d => y(d) + y.bandwidth() / 2 + 6)
      .attr('text-anchor', 'end').attr('font-size', 16)
      .attr('font-weight', d => (d === vincitore ? 700 : 400))
      .attr('fill', C.dati).text(d => d);

    t.g.selectAll('rect.fondo').data(d3.range(10)).join('rect').attr('class', 'fondo')
      .attr('x', 0).attr('y', d => y(d)).attr('width', t.w).attr('height', y.bandwidth())
      .attr('rx', 4).attr('fill', C.superficie2);

    t.g.selectAll('rect.barra').data(d3.range(10)).join('rect').attr('class', 'barra')
      .attr('x', 0).attr('y', d => y(d)).attr('height', y.bandwidth()).attr('rx', 4)
      .attr('fill', d => (d === vincitore ? C.modello : '#86b6ef'))
      .attr('width', d => (prob ? Math.max(1, x(prob[d])) : 0));

    t.g.selectAll('text.valore').data(d3.range(10)).join('text').attr('class', 'valore')
      .attr('x', t.w + 6).attr('y', d => y(d) + y.bandwidth() / 2 + 5)
      .attr('font-size', 13).attr('fill', C.inchiostro2)
      .attr('font-weight', d => (d === vincitore ? 700 : 400))
      .text(d => (prob ? L.perc(prob[d], prob[d] > 0.005 && prob[d] < 0.1 ? 1 : 0) : ''));
  }

  return { collegaTela, estraiVettore, prevedi, disegnaBarre, disegnaImmagine, scalaGrigi, modello: M };
})();


LEZIONE.registra('rete', function () {
  const L = LEZIONE, C = L.colori, R = LEZIONE.reteMnist, M = R.modello;
  const NASC = M.architettura[1];

  /* ── pannello "quello che vede la rete" ──────────────────────────────── */
  const tIn = L.tela('#rete-ingresso', 260, 260, { t: 6, d: 6, b: 6, s: 6 });
  const gImmagine = tIn.g.append('g');
  tIn.g.append('rect').attr('width', 248).attr('height', 248)
    .attr('fill', 'none').attr('stroke', C.bordo).attr('stroke-width', 1.5).attr('rx', 4);

  /* ── pannello dei neuroni nascosti + "lente" ─────────────────────────── */
  const tNa = L.tela('#rete-nascosti', 400, 246, { t: 10, d: 8, b: 8, s: 10 });
  const LATO_GRIGLIA = Math.sqrt(NASC) | 0;          // 8×8 per 64 neuroni
  const CELLA = 26;
  tNa.g.append('rect')
    .attr('x', -5).attr('y', -5)
    .attr('width', LATO_GRIGLIA * CELLA + 7).attr('height', LATO_GRIGLIA * CELLA + 7)
    .attr('fill', C.superficie).attr('stroke', C.bordo).attr('rx', 6);
  const gNeuroni = tNa.g.append('g');
  const gLente = tNa.g.append('g').attr('transform', `translate(${LATO_GRIGLIA * CELLA + 26},6)`);
  gLente.append('text').attr('class', 'titolo-grafico').attr('x', 0).attr('y', -6)
    .text('che cosa cerca');
  const gLenteImg = gLente.append('g');
  const testoLente = gLente.append('text').attr('font-size', 12).attr('fill', C.inchiostro3)
    .attr('x', 0).attr('y', 130).text('passa sopra un neurone');

  const scalaPesi = d3.scaleDiverging(t => d3.interpolateRgbBasis(['#c0392b', '#f0efec', '#2a78d6'])(t));
  const sugg = L.suggerimento();

  function disegnaLente(j) {
    const w = M.W1[j];
    const max = d3.max(w, Math.abs);
    scalaPesi.domain([-max, 0, max]);
    gLenteImg.selectAll('rect').data(d3.range(784)).join('rect')
      .attr('x', i => (i % 28) * 4).attr('y', i => Math.floor(i / 28) * 4)
      .attr('width', 4).attr('height', 4)
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', i => scalaPesi(w[i]));
    testoLente.text(`neurone n. ${j + 1}`);
  }

  /* ── stato corrente ──────────────────────────────────────────────────── */

  let vettore = null, tela = null;

  function aggiorna() {
    if (!tela) return;
    vettore = R.estraiVettore(tela.tela);
    R.disegnaImmagine(gImmagine, vettore, 248 / 28);

    const esito = vettore ? R.prevedi(vettore) : null;
    const att = esito ? esito.nascosti : null;
    const maxAtt = att ? Math.max(1e-6, d3.max(att)) : 1;

    gNeuroni.selectAll('rect').data(d3.range(NASC)).join('rect')
      .attr('x', j => (j % LATO_GRIGLIA) * CELLA)
      .attr('y', j => Math.floor(j / LATO_GRIGLIA) * CELLA)
      .attr('width', CELLA - 3).attr('height', CELLA - 3).attr('rx', 3)
      .attr('stroke', C.bordo).attr('stroke-width', .5)
      .attr('fill', j => (att ? R.scalaGrigi(att[j] / maxAtt) : C.superficie2))
      .style('cursor', 'pointer')
      .on('mouseenter', (ev, j) => disegnaLente(j))
      .on('mousemove', (ev, j) => sugg.mostra(
        `neurone n. ${j + 1}<br>attivazione ${att ? L.num(att[j], 2) : '—'}`, ev))
      .on('mouseleave', sugg.nascondi);

    R.disegnaBarre('#rete-uscita', esito ? esito.probabilita : null);

    const v = d3.select('#rete-verdetto');
    if (!esito) {
      v.attr('class', 'verdetto verdetto-grande').html('Disegnate una cifra qui a sinistra.');
      return;
    }
    const p = esito.probabilita;
    const vincitore = p.indexOf(Math.max(...p));
    const secondo = p.map((x, i) => [x, i]).sort((a, b) => b[0] - a[0])[1];
    const sicura = p[vincitore] > 0.9;
    v.attr('class', 'verdetto verdetto-grande ' + (sicura ? 'buono' : 'attenzione'))
      .html(`La rete dice: <strong style="font-size:1.6em">${vincitore}</strong><br>` +
            `<span style="font-size:.95rem">sicurezza ${L.perc(p[vincitore], 1)}` +
            (sicura ? '' : ` — ma esita fra ${vincitore} e ${secondo[1]}`) + '</span>');
  }

  tela = R.collegaTela('#rete-tela', aggiorna);

  d3.select('#rete-pulisci').on('click', tela.pulisci);
  d3.select('#rete-esempio').on('click', () => {
    const E = window.MNIST_ESEMPI;
    const k = Math.floor(Math.random() * E.etichette.length);
    const byte = atob(E.immagini[k]);
    const img = tela.ctx.createImageData(28, 28);
    for (let i = 0; i < 784; i++) {
      const g = 255 - byte.charCodeAt(i);
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = g;
      img.data[i * 4 + 3] = 255;
    }
    const app = document.createElement('canvas');
    app.width = app.height = 28;
    app.getContext('2d').putImageData(img, 0, 0);
    tela.ctx.fillStyle = '#ffffff';
    tela.ctx.fillRect(0, 0, 280, 280);
    tela.ctx.imageSmoothingEnabled = true;
    tela.ctx.drawImage(app, 0, 0, 280, 280);
    aggiorna();
  });

  /* ── statistiche del modello ─────────────────────────────────────────── */

  d3.select('#rete-statistiche').html([
    ['n. manopole', M.n_parametri.toLocaleString('it-IT')],
    ['esempi di studio', M.n_esempi_train.toLocaleString('it-IT')],
    ['risposte esatte sugli esempi di studio', L.perc(M.accuratezza_train, 1)],
    ['risposte esatte su cifre mai viste', L.perc(M.accuratezza_test, 1)]
  ].map(([et, v]) => `<div class="statistica"><span class="valore">${v}</span>` +
                     `<span class="etichetta">${et}</span></div>`).join(''));

  disegnaLente(0);
  aggiorna();
});

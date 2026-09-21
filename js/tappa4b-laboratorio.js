/* ═══════════════════════════════════════════════════════════════════════
   Tappa 4-bis — «guardala imparare»: una seconda rete 784-24-10 che parte
   da manopole casuali e viene allenata DAL VIVO nel browser su 1.200 cifre
   MNIST vere (data/mnist-allenamento.js).

   È la stessa discesa del gradiente dell'apertura, con 19.090 manopole
   invece di quattro. Si vedono tre cose insieme:
     • le maschere dei 24 neuroni che emergono dal rumore;
     • le risposte esatte che salgono, su cifre di studio e su cifre mai viste;
     • la risposta della rete sulla cifra disegnata dal pubblico, che cambia
       mentre la rete studia.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('rete', function () {
  const L = LEZIONE, C = L.colori, R = LEZIONE.reteMnist;

  const H = 24, LOTTO = 32, PASSO = 0.12, MOMENTO = 0.9;
  const N_PARAMETRI = 784 * H + H + H * 10 + 10;

  let studio = null, verifica = null;           // {X: Float32Array, y: Uint8Array, n}
  let W1, b1, W2, b2, vW1, vb1, vW2, vb2;       // manopole e loro velocità
  let viste = 0, storia = [], timer = null, lottiPerFrame = 1, prontoADisegnare = false;

  /* ═════════ dati: due PNG con una cifra per riquadro 28×28 ═════════ */

  function caricaInsieme(pacchetto, poi) {
    const img = new Image();
    img.onload = function () {
      const tela = document.createElement('canvas');
      tela.width = 28;
      tela.height = 28 * pacchetto.n;
      const ctx = tela.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const dati = ctx.getImageData(0, 0, 28, 28 * pacchetto.n).data;
      const X = new Float32Array(pacchetto.n * 784);
      for (let i = 0; i < X.length; i++) X[i] = dati[i * 4] / 255;
      const y = new Uint8Array(pacchetto.n);
      for (let i = 0; i < pacchetto.n; i++) y[i] = +pacchetto.etichette[i];
      poi({ X, y, n: pacchetto.n });
    };
    img.src = pacchetto.png;
  }

  /* ═════════ la rete ═════════ */

  function inizializza() {
    const rnd = L.casuale(11);
    const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
    W1 = new Float32Array(784 * H);
    W2 = new Float32Array(10 * H);
    for (let i = 0; i < W1.length; i++) W1[i] = gauss() * Math.sqrt(2 / 784);
    for (let i = 0; i < W2.length; i++) W2[i] = gauss() * Math.sqrt(2 / H);
    b1 = new Float32Array(H);
    b2 = new Float32Array(10);
    vW1 = new Float32Array(W1.length); vb1 = new Float32Array(H);
    vW2 = new Float32Array(W2.length); vb2 = new Float32Array(10);
    viste = 0;
    storia = [];
  }

  const a1 = new Float32Array(H), z1 = new Float32Array(H);
  const prob = new Float32Array(10), dz1 = new Float32Array(H), dz2 = new Float32Array(10);

  /** Passaggio in avanti su un singolo esempio (X è l'insieme, k l'indice). */
  function avanti(X, k) {
    const off = k * 784;
    for (let j = 0; j < H; j++) {
      let s = b1[j];
      const w = j * 784;
      for (let i = 0; i < 784; i++) s += W1[w + i] * X[off + i];
      z1[j] = s;
      a1[j] = s > 0 ? s : 0;
    }
    let max = -Infinity;
    for (let c = 0; c < 10; c++) {
      let s = b2[c];
      const w = c * H;
      for (let j = 0; j < H; j++) s += W2[w + j] * a1[j];
      prob[c] = s;
      if (s > max) max = s;
    }
    let somma = 0;
    for (let c = 0; c < 10; c++) { prob[c] = Math.exp(prob[c] - max); somma += prob[c]; }
    for (let c = 0; c < 10; c++) prob[c] /= somma;
  }

  /** Un lotto: gradiente mediato su LOTTO esempi e aggiornamento con momento. */
  function unLotto() {
    const gW1 = new Float32Array(W1.length), gb1 = new Float32Array(H);
    const gW2 = new Float32Array(W2.length), gb2 = new Float32Array(10);

    for (let b = 0; b < LOTTO; b++) {
      const k = (Math.random() * studio.n) | 0;
      avanti(studio.X, k);
      const vero = studio.y[k];

      for (let c = 0; c < 10; c++) dz2[c] = (prob[c] - (c === vero ? 1 : 0)) / LOTTO;
      for (let j = 0; j < H; j++) dz1[j] = 0;
      for (let c = 0; c < 10; c++) {
        const w = c * H, d = dz2[c];
        gb2[c] += d;
        for (let j = 0; j < H; j++) { gW2[w + j] += d * a1[j]; dz1[j] += d * W2[w + j]; }
      }
      const off = k * 784;
      for (let j = 0; j < H; j++) {
        if (z1[j] <= 0) { dz1[j] = 0; continue; }     // derivata della ReLU
        const d = dz1[j], w = j * 784;
        gb1[j] += d;
        if (d === 0) continue;
        for (let i = 0; i < 784; i++) gW1[w + i] += d * studio.X[off + i];
      }
    }

    for (let i = 0; i < W1.length; i++) { vW1[i] = MOMENTO * vW1[i] - PASSO * gW1[i]; W1[i] += vW1[i]; }
    for (let j = 0; j < H; j++)         { vb1[j] = MOMENTO * vb1[j] - PASSO * gb1[j]; b1[j] += vb1[j]; }
    for (let i = 0; i < W2.length; i++) { vW2[i] = MOMENTO * vW2[i] - PASSO * gW2[i]; W2[i] += vW2[i]; }
    for (let c = 0; c < 10; c++)        { vb2[c] = MOMENTO * vb2[c] - PASSO * gb2[c]; b2[c] += vb2[c]; }
    viste += LOTTO;
  }

  function accuratezza(insieme, quanti) {
    let esatte = 0;
    const n = Math.min(quanti, insieme.n);
    for (let k = 0; k < n; k++) {
      avanti(insieme.X, k);
      let migliore = 0;
      for (let c = 1; c < 10; c++) if (prob[c] > prob[migliore]) migliore = c;
      if (migliore === insieme.y[k]) esatte++;
    }
    return esatte / n;
  }

  /* ═════════ le maschere, disegnate su tela (veloce anche a 20 disegni/s) ═════════ */

  const telaMaschere = document.getElementById('lab-maschere');
  telaMaschere.style.cursor = 'pointer';
  telaMaschere.addEventListener('click', ev => {
    const r = telaMaschere.getBoundingClientRect();
    const col = Math.floor((ev.clientX - r.left) / (r.width / 6));
    const rig = Math.floor((ev.clientY - r.top) / (r.height / 4));
    neuroneScelto = Math.max(0, Math.min(H - 1, rig * 6 + col));
    disegnaMaschere();
    disegnaLente();
  });
  const ctxMaschere = telaMaschere.getContext('2d');
  const mosaico = document.createElement('canvas');
  mosaico.width = 6 * 28; mosaico.height = 4 * 28;
  const ctxMosaico = mosaico.getContext('2d');
  const immagine = ctxMosaico.createImageData(6 * 28, 4 * 28);

  function coloreDivergente(v) {          // v in [-1, 1]: rosso ← bianco → blu
    if (v >= 0) return [Math.round(255 - 213 * v), Math.round(255 - 135 * v), Math.round(255 - 41 * v)];
    return [Math.round(255 + 63 * v), Math.round(255 + 198 * v), Math.round(255 + 212 * v)];
  }

  function disegnaMaschere() {
    const d = immagine.data;
    for (let j = 0; j < H; j++) {
      const rigaTassello = Math.floor(j / 6), colTassello = j % 6;
      let massimo = 1e-6;
      for (let i = 0; i < 784; i++) { const a = Math.abs(W1[j * 784 + i]); if (a > massimo) massimo = a; }
      for (let p = 0; p < 784; p++) {
        const [r, g, bl] = coloreDivergente(W1[j * 784 + p] / massimo);
        const px = colTassello * 28 + (p % 28);
        const py = rigaTassello * 28 + Math.floor(p / 28);
        const o = (py * 6 * 28 + px) * 4;
        d[o] = r; d[o + 1] = g; d[o + 2] = bl; d[o + 3] = 255;
      }
    }
    ctxMosaico.putImageData(immagine, 0, 0);
    ctxMaschere.imageSmoothingEnabled = false;
    ctxMaschere.clearRect(0, 0, telaMaschere.width, telaMaschere.height);
    ctxMaschere.drawImage(mosaico, 0, 0, telaMaschere.width, telaMaschere.height);
    /* righe di separazione fra i 24 riquadri */
    if (neuroneScelto >= 0) {            // riquadro sul neurone scelto
      const c = neuroneScelto % 6, r = Math.floor(neuroneScelto / 6);
      ctxMaschere.strokeStyle = '#eb6834';
      ctxMaschere.lineWidth = 4;
      ctxMaschere.strokeRect(c * 56 + 2, r * 56 + 2, 52, 52);
    }
    ctxMaschere.strokeStyle = 'rgba(255,255,255,.9)';
    ctxMaschere.lineWidth = 2;
    for (let c = 1; c < 6; c++) {
      ctxMaschere.beginPath();
      ctxMaschere.moveTo(c * 56, 0); ctxMaschere.lineTo(c * 56, 224); ctxMaschere.stroke();
    }
    for (let r = 1; r < 4; r++) {
      ctxMaschere.beginPath();
      ctxMaschere.moveTo(0, r * 56); ctxMaschere.lineTo(336, r * 56); ctxMaschere.stroke();
    }
  }

  /* ═════════ la lente: che cos'è, esattamente, una maschera ═════════ */

  const tLente = L.tela('#lab-lente', 520, 252, { t: 26, d: 8, b: 8, s: 8 });
  let neuroneScelto = -1;

  const scalaIngresso = d3.scaleSequential(d3.interpolateRgbBasis(C.bluRampa)).domain([0, 1]);
  const scalaPeso = d3.scaleDiverging(t => d3.interpolateRgbBasis(['#c0392b', '#f0efec', '#2a78d6'])(t));

  function quadretti(gruppo, valori, colore, lato) {
    gruppo.selectAll('rect').data(d3.range(784)).join('rect')
      .attr('x', i => (i % 28) * lato).attr('y', i => Math.floor(i / 28) * lato)
      .attr('width', lato).attr('height', lato)
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', i => colore(valori[i]));
  }

  function disegnaLente() {
    if (neuroneScelto < 0 || !studio) {
      tLente.g.selectAll('*').remove();
      tLente.svg.selectAll('text.titolo-grafico').data([0]).join('text')
        .attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
        .text('cliccate una maschera qui sopra per vedere come si usa');
      return;
    }
    const j = neuroneScelto;
    const ingresso = R.vettoreCorrente || verifica.X.subarray(0, 784);
    const w = W1.subarray(j * 784, j * 784 + 784);
    const massimo = Math.max(1e-6, d3.max(w, Math.abs));
    scalaPeso.domain([-massimo, 0, massimo]);

    const LATO = 4.2, PASSO = 150;
    let somma = 0;
    const prodotto = new Float32Array(784);
    for (let i = 0; i < 784; i++) { prodotto[i] = ingresso[i] * w[i]; somma += prodotto[i]; }
    const massimoP = Math.max(1e-6, d3.max(prodotto, Math.abs));
    const scalaProdotto = d3.scaleDiverging(t => d3.interpolateRgbBasis(['#c0392b', '#f0efec', '#2a78d6'])(t))
      .domain([-massimoP, 0, massimoP]);

    tLente.svg.selectAll('text.titolo-grafico').data([0]).join('text')
      .attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
      .text(`il neurone n. ${j + 1}, sulla cifra qui sopra`);

    const pezzi = [
      { g: 'a', x: 0, valori: ingresso, colore: scalaIngresso, sotto: 'la cifra' },
      { g: 'b', x: PASSO, valori: w, colore: scalaPeso, sotto: 'la sua maschera' },
      { g: 'c', x: 2 * PASSO, valori: prodotto, colore: scalaProdotto, sotto: 'blu: conferma · rosso: smentisce' }
    ];
    const gruppi = tLente.g.selectAll('g.pezzo').data(pezzi).join(
      entra => {
        const g = entra.append('g').attr('class', 'pezzo');
        g.append('g').attr('class', 'quadretti');
        g.append('rect').attr('class', 'cornice').attr('width', 28 * LATO).attr('height', 28 * LATO)
          .attr('fill', 'none').attr('stroke', C.bordo).attr('rx', 3);
        g.append('text').attr('class', 'sotto').attr('x', 14 * LATO).attr('y', 28 * LATO + 18)
          .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', C.inchiostro2);
        return g;
      })
      .attr('transform', d => `translate(${d.x},6)`);
    gruppi.each(function (d) {
      quadretti(d3.select(this).select('g.quadretti'), d.valori, d.colore, LATO);
      d3.select(this).select('text.sotto').text(d.sotto);
    });

    tLente.g.selectAll('text.segno').data(['×', '=']).join('text').attr('class', 'segno')
      .attr('x', (d, k) => PASSO * (k + 1) - 16).attr('y', 6 + 14 * LATO + 6)
      .attr('text-anchor', 'middle').attr('font-size', 22).attr('fill', C.inchiostro2).text(d => d);

    /* il conto sotto la terza immagine, così non esce dalla colonna */
    const xConto = 2 * PASSO + 14 * LATO;
    tLente.g.selectAll('text.conto').data([0]).join('text').attr('class', 'conto')
      .attr('x', xConto).attr('y', 6 + 28 * LATO + 44).attr('text-anchor', 'middle')
      .attr('font-size', 16).attr('fill', C.dati)
      .html(`somma di tutti i quadretti = <tspan font-weight="700">${L.num(somma, 1)}</tspan>`);
    tLente.g.selectAll('text.conto2').data([0]).join('text').attr('class', 'conto2')
      .attr('x', xConto).attr('y', 6 + 28 * LATO + 66).attr('text-anchor', 'middle')
      .attr('font-size', 13).attr('fill', somma > 0 ? C.verifica : C.inchiostro3)
      .text(somma > 0 ? '→ positiva: questo neurone si accende' : '→ negativa: questo neurone resta spento');
  }

  /* ═════════ il grafico delle risposte esatte ═════════ */

  const ta = L.tela('#lab-accuratezza', 400, 240, { t: 30, d: 74, b: 40, s: 48 });
  ta.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
    .text('Risposte esatte, mentre studia');
  const xa = d3.scaleSqrt().domain([0, 20000]).range([0, ta.w]);
  const ya = d3.scaleLinear().domain([0, 1]).range([ta.h, 0]);
  const asseXa = ta.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${ta.h})`);
  ta.g.append('g').attr('class', 'asse').call(d3.axisLeft(ya).ticks(5).tickFormat(d => L.perc(d, 0)));
  ta.g.append('text').attr('class', 'etichetta-asse')
    .attr('x', ta.w).attr('y', ta.h + 34).attr('text-anchor', 'end')
    .text('cifre guardate');
  const lineaStudio = ta.g.append('path').attr('fill', 'none')
    .attr('stroke', C.modello).attr('stroke-width', 2.5);
  const lineaVerifica = ta.g.append('path').attr('fill', 'none')
    .attr('stroke', C.verifica).attr('stroke-width', 2.5);
  const etichette = ta.g.append('g');

  function disegnaAccuratezza() {
    const ultimo = storia.length ? storia[storia.length - 1].viste : 0;
    xa.domain([0, Math.max(20000, ultimo)]);
    asseXa.call(d3.axisBottom(xa).ticks(4).tickFormat(d => (d >= 1000 ? d / 1000 + ' mila' : d)));
    lineaStudio.attr('d', d3.line().x(d => xa(d.viste)).y(d => ya(d.studio))(storia));
    lineaVerifica.attr('d', d3.line().x(d => xa(d.viste)).y(d => ya(d.verifica))(storia));

    /* etichette dirette in fondo alle curve: l'identità non è solo il colore */
    const ultime = storia.length ? [storia[storia.length - 1]] : [];
    etichette.selectAll('text.studio').data(ultime).join('text').attr('class', 'studio')
      .attr('x', d => xa(d.viste) + 6).attr('y', d => ya(d.studio) + 4)
      .attr('font-size', 12).attr('fill', C.modello).text('studio');
    etichette.selectAll('text.verifica').data(ultime).join('text').attr('class', 'verifica')
      .attr('x', d => xa(d.viste) + 6).attr('y', d => ya(d.verifica) + 16)
      .attr('font-size', 12).attr('fill', C.verifica).text('mai viste');
  }

  /* ═════════ la risposta sulla cifra del pubblico ═════════ */

  function disegnaPrevisione() {
    const v = R.vettoreCorrente || (verifica ? verifica.X.subarray(0, 784) : null);
    if (!v) return;
    /* passaggio in avanti "a mano" su un vettore isolato */
    for (let j = 0; j < H; j++) {
      let s = b1[j];
      const w = j * 784;
      for (let i = 0; i < 784; i++) s += W1[w + i] * v[i];
      a1[j] = s > 0 ? s : 0;
    }
    const logiti = [];
    for (let c = 0; c < 10; c++) {
      let s = b2[c];
      const w = c * H;
      for (let j = 0; j < H; j++) s += W2[w + j] * a1[j];
      logiti.push(s);
    }
    R.disegnaBarre('#lab-previsione', L.softmax(logiti));
  }

  /* ═════════ resoconto ═════════ */

  function aggiornaStatistiche() {
    const ultimo = storia.length ? storia[storia.length - 1] : { studio: 0.1, verifica: 0.1 };
    d3.select('#lab-statistiche').html([
      ['cifre guardate', viste.toLocaleString('it-IT'), false],
      ['giri sul materiale', studio ? L.num(viste / studio.n, 1) : '0', true],
      ['esatte su cifre mai viste', L.perc(ultimo.verifica, 0), false]
    ].map(([et, v, avanzato]) =>
      `<div class="statistica"${avanzato ? ' data-avanzato' : ''}><span class="valore">${v}</span>` +
      `<span class="etichetta">${et}</span></div>`).join(''));

    const a = ultimo.verifica;
    let testo, classe = '';
    if (viste === 0) {
      testo = 'Manopole a caso: la rete non sa niente. Adesso indovinerebbe una cifra su dieci, come un dado.';
    } else if (a < 0.4) {
      testo = '<strong>Sta ancora tirando a indovinare</strong>, ma le maschere cominciano a non essere più rumore puro.';
      classe = 'attenzione';
    } else if (a < 0.8) {
      testo = `<strong>${L.perc(a, 0)}</strong>: ha imparato le cifre più facili. Guardate le maschere: ` +
              'stanno comparendo tratti e archi.';
    } else if (a < 0.9) {
      testo = `<strong>${L.perc(a, 0)}</strong> di risposte esatte su cifre mai viste, in meno di un minuto ` +
              `e con 1.200 esempi. Sulle cifre di studio è già al ${L.perc(ultimo.studio, 0)}: ` +
              'il solito imparare a memoria.';
      classe = 'buono';
    } else {
      testo = `<strong>${L.perc(a, 0)}</strong>. Con 8.000 esempi e una rete più grande si arriva al 96,5% ` +
              '— la rete qui sopra. Notate che le risposte esatte sul materiale di studio sono più alte: ' +
              'è il solito imparare a memoria.';
      classe = 'buono';
    }
    d3.select('#lab-verdetto').attr('class', 'verdetto ' + classe).html(testo);
  }

  function misura() {
    storia.push({
      viste,
      studio: accuratezza(studio, 200),
      verifica: accuratezza(verifica, 400)
    });
  }

  function disegnaTutto() {
    disegnaMaschere();
    disegnaLente();
    disegnaAccuratezza();
    disegnaPrevisione();
    aggiornaStatistiche();
  }

  /* ═════════ comandi ═════════ */

  function ferma() {
    if (timer) { timer.stop(); timer = null; }
    d3.select('#lab-vai').text(viste > 0 ? '▶ Continua' : '▶ Allena');
  }

  function avvia() {
    if (!prontoADisegnare) return;
    if (timer) { ferma(); return; }
    d3.select('#lab-vai').text('❚❚ Ferma');
    let frame = 0;
    timer = d3.timer(() => {
      const inizio = performance.now();
      for (let i = 0; i < lottiPerFrame; i++) unLotto();
      const durata = performance.now() - inizio;
      /* Si adatta al portatile dell'aula, ma senza correre: il punto della
         tappa è *vedere* l'apprendimento, non finirlo in due secondi.
         Il tetto di 2 lotti per fotogramma dà una ventina di secondi di
         trasformazione visibile sulle maschere. */
      if (durata < 6 && lottiPerFrame < 2) lottiPerFrame++;
      else if (durata > 16 && lottiPerFrame > 1) lottiPerFrame--;

      if (frame % 2 === 0) { disegnaMaschere(); disegnaPrevisione(); disegnaLente(); }
      if (frame % 12 === 0) { misura(); disegnaAccuratezza(); aggiornaStatistiche(); }
      frame++;
      if (viste >= 120000) ferma();
    });
  }

  function ricomincia() {
    ferma();
    inizializza();
    misura();
    disegnaTutto();
  }

  d3.select('#lab-vai').on('click', avvia).attr('disabled', 'disabled');
  d3.select('#lab-reset').on('click', ricomincia);
  L.allUscita('rete', ferma);

  /* ═════════ avvio ═════════ */

  inizializza();
  disegnaMaschere();
  d3.select('#lab-verdetto').attr('class', 'verdetto')
    .html('Sto caricando le 1.600 cifre dell\'esercitazione…');

  L.cifreStudio(s => {
    studio = s;
    caricaInsieme(window.MNIST_ALLENAMENTO.verifica, v => {
      verifica = v;
      prontoADisegnare = true;
      d3.select('#lab-vai').attr('disabled', null);
      misura();
      disegnaTutto();
    });
  });
});

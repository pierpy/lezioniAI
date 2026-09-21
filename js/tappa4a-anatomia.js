/* ═══════════════════════════════════════════════════════════════════════
   Tappa 4-a — anatomia di una rete neurale.

   1) UN NEURONE: una decisione a punteggi. Ingressi accesi o spenti, un
      peso per ciascuno (anche negativo), una somma, una soglia, una
      lampadina. È il neurone formale di McCulloch & Pitts (1943).
   2) UNA RETE: 9 → 4 → 2, con tutti i 44 fili in vista, il segnale che
      scorre e i neuroni che si accendono.
   3) COME IMPARA: la stessa rete, con la colpa che torna indietro filo
      per filo e le correzioni visibili — la retropropagazione (1986).

   La rete è vera: impara davvero a distinguere barre verticali e
   orizzontali in una griglia 3×3, con 58 manopole in tutto.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('rete', function () {
  const L = LEZIONE, C = L.colori;

  /* ═══════════════ 1) un neurone solo ═══════════════ */

  const SITUAZIONI = [
    { testo: 'C\'è il sole', acceso: true, peso: 2.5 },
    { testo: 'Il frigo è vuoto', acceso: true, peso: 3 },
    { testo: 'Mi fanno male le gambe', acceso: false, peso: -4 }
  ];
  let soglia = 2;

  const tn = L.tela('#neurone-schema', 600, 330, { t: 20, d: 20, b: 20, s: 20 });
  const gFili = tn.g.append('g');
  const gIngressi = tn.g.append('g');
  const gCorpo = tn.g.append('g').attr('transform', 'translate(330,120)');
  gCorpo.append('circle').attr('r', 54).attr('fill', C.superficie2)
    .attr('stroke', C.dati).attr('stroke-width', 2.5);
  const testoSomma = gCorpo.append('text').attr('text-anchor', 'middle').attr('y', 6)
    .attr('font-size', 26).attr('font-weight', 700);
  gCorpo.append('text').attr('text-anchor', 'middle').attr('y', 28)
    .attr('font-size', 12).attr('fill', C.inchiostro3).text('totale');
  gCorpo.append('text').attr('text-anchor', 'middle').attr('y', -70)
    .attr('font-size', 13).attr('fill', C.inchiostro2).text('il neurone: somma e decide');

  tn.g.append('path').attr('d', 'M392,120 L428,120 M418,112 L428,120 L418,128')
    .attr('fill', 'none').attr('stroke', C.inchiostro3).attr('stroke-width', 2.5);

  const gLampada = tn.g.append('g').attr('transform', 'translate(470,70)');
  gLampada.append('rect').attr('width', 110).attr('height', 100).attr('rx', 12)
    .attr('stroke', C.bordo).attr('stroke-width', 2);
  const testoLampada = gLampada.append('text').attr('x', 55).attr('y', 44)
    .attr('text-anchor', 'middle').attr('font-size', 34);
  const testoEsito = gLampada.append('text').attr('x', 55).attr('y', 74)
    .attr('text-anchor', 'middle').attr('font-size', 15).attr('font-weight', 700);

  /* la bilancia: totale contro soglia */
  const xb = d3.scaleLinear().domain([-12, 12]).range([0, 520]);
  const gBilancia = tn.g.append('g').attr('transform', 'translate(20,250)');
  gBilancia.append('rect').attr('width', 520).attr('height', 22).attr('rx', 11)
    .attr('fill', C.superficie2);
  const barraSomma = gBilancia.append('rect').attr('height', 22).attr('rx', 4);
  const lineaSoglia = gBilancia.append('line').attr('y1', -8).attr('y2', 30)
    .attr('stroke', C.dati).attr('stroke-width', 2.5).attr('stroke-dasharray', '4 3');
  gBilancia.append('text').attr('y', 46).attr('font-size', 12).attr('fill', C.inchiostro3)
    .text('il totale, e la soglia oltre la quale il neurone si accende');

  /* comandi HTML: interruttori grandi e cursori dei pesi */
  const contIngressi = d3.select('#neurone-ingressi');
  contIngressi.selectAll('label').data(SITUAZIONI).join('label')
    .attr('class', 'interruttore-grande')
    .html(d => `<input type="checkbox" ${d.acceso ? 'checked' : ''}><span>${d.testo}</span>`)
    .select('input').on('change', function (ev, d) { d.acceso = this.checked; disegnaNeurone(); });

  const contPesi = d3.select('#neurone-pesi');
  contPesi.selectAll('div').data(SITUAZIONI).join('div').attr('class', 'controllo')
    .html((d, i) => `<label for="peso-${i}">Quanto conta «${d.testo.toLowerCase()}»</label>` +
                    `<input type="range" id="peso-${i}" min="-5" max="5" step="0.5" value="${d.peso}">` +
                    `<output id="peso-out-${i}"></output>`)
    .select('input').on('input', function (ev, d) { d.peso = +this.value; disegnaNeurone(); });

  contPesi.append('div').attr('class', 'controllo')
    .html('<label for="neurone-soglia">Quanto è difficile convincermi (la soglia)</label>' +
          '<input type="range" id="neurone-soglia" min="-6" max="6" step="0.5" value="2">' +
          '<output id="soglia-out"></output>')
    .select('input').on('input', function () { soglia = +this.value; disegnaNeurone(); });

  function disegnaNeurone() {
    const contributi = SITUAZIONI.map(d => (d.acceso ? d.peso : 0));
    const totale = d3.sum(contributi);
    const acceso = totale >= soglia;

    gIngressi.selectAll('g').data(SITUAZIONI).join(
      entra => {
        const g = entra.append('g');
        g.append('rect').attr('width', 170).attr('height', 44).attr('rx', 10)
          .attr('stroke', C.bordo).attr('stroke-width', 2);
        g.append('text').attr('class', 'stato').attr('x', 18).attr('y', 28).attr('font-size', 15);
        return g;
      })
      .attr('transform', (d, i) => `translate(0,${40 + i * 72})`)
      .each(function (d, i) {
        const g = d3.select(this);
        g.select('rect').attr('fill', d.acceso ? '#eaf2fd' : C.superficie)
          .attr('stroke', d.acceso ? C.modello : C.bordo);
        g.select('text.stato').attr('fill', d.acceso ? C.modello : C.inchiostro3)
          .text((d.acceso ? '● ' : '○ ') + d.testo);
      });

    gFili.selectAll('g').data(SITUAZIONI).join(
      entra => {
        const g = entra.append('g');
        g.append('line').attr('stroke-linecap', 'round');
        g.append('text').attr('font-size', 12).attr('font-weight', 700);
        return g;
      })
      .each(function (d, i) {
        const g = d3.select(this);
        const y = 62 + i * 72;
        g.select('line')
          .attr('x1', 172).attr('y1', y).attr('x2', 276).attr('y2', 120)
          .attr('stroke', d.peso >= 0 ? C.modello : C.rosso)
          .attr('stroke-opacity', d.acceso ? .95 : .2)
          .attr('stroke-width', 1 + Math.abs(d.peso) * 1.1);
        /* l'etichetta del peso si appoggia sul filo, non sulla scatola */
        const t = 0.36;
        g.select('text')
          .attr('x', 172 + (276 - 172) * t).attr('y', y + (120 - y) * t - 8)
          .attr('fill', d.peso >= 0 ? C.modello : C.rosso)
          .attr('fill-opacity', d.acceso ? 1 : .35)
          .text((d.peso >= 0 ? '+' : '') + L.num(d.peso, 1));
      });

    testoSomma.attr('fill', acceso ? C.verifica : C.inchiostro2)
      .text((totale >= 0 ? '+' : '') + L.num(totale, 1));
    testoLampada.text(acceso ? '💡' : '🌑');
    testoEsito.attr('fill', acceso ? C.verifica : C.inchiostro3)
      .text(acceso ? 'ESCO' : 'RESTO A CASA');
    gLampada.select('rect').attr('fill', acceso ? '#eaf7f1' : C.superficie2);

    barraSomma
      .attr('x', Math.min(xb(0), xb(totale)))
      .attr('width', Math.abs(xb(totale) - xb(0)))
      .attr('fill', totale >= 0 ? C.modello : C.rosso);
    lineaSoglia.attr('x1', xb(soglia)).attr('x2', xb(soglia));

    SITUAZIONI.forEach((d, i) => d3.select(`#peso-out-${i}`)
      .text(d.peso > 0 ? `conta ${L.num(d.peso, 1)} a favore`
        : d.peso < 0 ? `conta ${L.num(-d.peso, 1)} contro` : 'non conta niente'));
    d3.select('#soglia-out').text(soglia <= 0 ? 'basta poco' : `serve un totale di almeno ${L.num(soglia, 1)}`);

    d3.select('#neurone-verdetto').attr('class', 'verdetto ' + (acceso ? 'buono' : ''))
      .html(`Totale <strong>${L.num(totale, 1)}</strong> contro una soglia di ${L.num(soglia, 1)}: ` +
            `<strong>${acceso ? 'esco' : 'resto a casa'}</strong>. ` +
            'Cambiate i pesi e cambia il carattere della persona: le manopole sono queste.');
  }

  d3.select('#neurone-pigro').on('click', () => {
    SITUAZIONI[0].peso = 1; SITUAZIONI[1].peso = 1.5; SITUAZIONI[2].peso = -5; soglia = 3.5;
    sincronizzaCursori(); disegnaNeurone();
  });
  d3.select('#neurone-attivo').on('click', () => {
    SITUAZIONI[0].peso = 4; SITUAZIONI[1].peso = 3; SITUAZIONI[2].peso = -1; soglia = 1;
    sincronizzaCursori(); disegnaNeurone();
  });
  function sincronizzaCursori() {
    SITUAZIONI.forEach((d, i) => d3.select(`#peso-${i}`).property('value', d.peso));
    d3.select('#neurone-soglia').property('value', soglia);
  }
  disegnaNeurone();

  /* ═══════════════ 2 e 3) la rete piccola, vera ═══════════════ */

  const NASC = 4;
  let W1, b1, W2, b2;                      // 9→4 e 4→2: 58 manopole in tutto
  let griglia = new Array(9).fill(0);
  let att1 = new Array(NASC).fill(0), usc = [0.5, 0.5];
  let passi = 0, timerImpara = null, indiceEsempio = 0;

  const ESEMPI = [
    { celle: [1, 0, 0, 1, 0, 0, 1, 0, 0], classe: 0 },
    { celle: [0, 1, 0, 0, 1, 0, 0, 1, 0], classe: 0 },
    { celle: [0, 0, 1, 0, 0, 1, 0, 0, 1], classe: 0 },
    { celle: [1, 1, 1, 0, 0, 0, 0, 0, 0], classe: 1 },
    { celle: [0, 0, 0, 1, 1, 1, 0, 0, 0], classe: 1 },
    { celle: [0, 0, 0, 0, 0, 0, 1, 1, 1], classe: 1 }
  ];
  const NOMI_CLASSI = ['barra verticale', 'barra orizzontale'];

  function inizializzaRete() {
    const rnd = L.casuale(99);
    const g = () => (rnd() - 0.5) * 1.6;
    W1 = d3.range(NASC).map(() => d3.range(9).map(g));
    b1 = d3.range(NASC).map(() => 0);
    W2 = d3.range(2).map(() => d3.range(NASC).map(g));
    b2 = [0, 0];
    passi = 0;
  }

  function avanti(celle) {
    att1 = W1.map((w, j) => Math.tanh(d3.sum(w.map((v, i) => v * celle[i])) + b1[j]));
    const logiti = W2.map((w, k) => d3.sum(w.map((v, j) => v * att1[j])) + b2[k]);
    usc = L.softmax(logiti);
    return usc;
  }

  function unaCorrezione(esempio, lr = 0.5) {
    avanti(esempio.celle);
    const dz2 = usc.map((p, k) => p - (k === esempio.classe ? 1 : 0));
    const dz1 = att1.map((a, j) =>
      d3.sum(dz2.map((d, k) => d * W2[k][j])) * (1 - a * a));
    for (let k = 0; k < 2; k++) {
      for (let j = 0; j < NASC; j++) W2[k][j] -= lr * dz2[k] * att1[j];
      b2[k] -= lr * dz2[k];
    }
    for (let j = 0; j < NASC; j++) {
      for (let i = 0; i < 9; i++) W1[j][i] -= lr * dz1[j] * esempio.celle[i];
      b1[j] -= lr * dz1[j];
    }
    passi++;
    return { dz2, dz1 };
  }

  function quantiGiusti() {
    let n = 0;
    for (const e of ESEMPI) {
      const p = avanti(e.celle);
      if ((p[0] > p[1] ? 0 : 1) === e.classe) n++;
    }
    return n;                      // attenzione: lascia `usc` sull'ultimo esempio
  }

  /* ── il disegno della rete, condiviso dai due pannelli ─────────────── */

  const PX = { ingresso: 70, nascosto: 370, uscita: 580 };
  const posIngresso = i => [PX.ingresso + (i % 3) * 44, 60 + Math.floor(i / 3) * 44];
  const posNascosto = j => [PX.nascosto, 46 + j * 66];
  const posUscita = k => [PX.uscita, 90 + k * 110];

  function creaTelaRete(selettore) {
    const t = L.tela(selettore, 780, 330, { t: 16, d: 160, b: 10, s: 10 });
    t.gArchi = t.g.append('g');
    t.gNodi = t.g.append('g');
    t.gPunti = t.g.append('g');
    t.g.append('text').attr('x', PX.ingresso + 44).attr('y', 24).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('fill', C.inchiostro3).text('i 9 quadretti');
    t.g.append('text').attr('x', PX.nascosto).attr('y', 24).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('fill', C.inchiostro3).text('4 neuroni');
    t.g.append('text').attr('x', PX.uscita).attr('y', 24).attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('fill', C.inchiostro3).text('2 risposte');
    return t;
  }

  const teleRete = [creaTelaRete('#rete-piccola'), creaTelaRete('#impara-rete')];

  function disegnaRete(mostraAttivazioni) {
    const archi = [];
    W1.forEach((w, j) => w.forEach((v, i) => archi.push({ da: posIngresso(i), a: posNascosto(j), v })));
    W2.forEach((w, k) => w.forEach((v, j) => archi.push({ da: posNascosto(j), a: posUscita(k), v })));

    teleRete.forEach(t => {
      t.gArchi.selectAll('line').data(archi).join('line')
        .attr('x1', d => d.da[0]).attr('y1', d => d.da[1])
        .attr('x2', d => d.a[0]).attr('y2', d => d.a[1])
        .attr('stroke', d => (d.v >= 0 ? C.modello : C.rosso))
        .attr('stroke-opacity', d => Math.min(.85, .12 + Math.abs(d.v) / 3))
        .attr('stroke-width', d => Math.min(5, 0.4 + Math.abs(d.v) * 1.5));

      const nodi = d3.range(9).map(i => ({ p: posIngresso(i), v: griglia[i], r: 15, tipo: 'in' }))
        .concat(d3.range(NASC).map(j => ({ p: posNascosto(j), v: mostraAttivazioni ? (att1[j] + 1) / 2 : 0.5, r: 20, tipo: 'nas' })))
        .concat(d3.range(2).map(k => ({ p: posUscita(k), v: mostraAttivazioni ? usc[k] : 0.5, r: 26, tipo: 'out' })));

      t.gNodi.selectAll('circle').data(nodi).join('circle')
        .attr('cx', d => d.p[0]).attr('cy', d => d.p[1]).attr('r', d => d.r)
        .attr('fill', d => d3.interpolateRgbBasis(C.bluRampa)(Math.max(0, Math.min(1, d.v))))
        .attr('stroke', C.dati).attr('stroke-width', d => (d.tipo === 'out' ? 2 : 1.2));

      t.gNodi.selectAll('text.etichetta').data(d3.range(2)).join('text').attr('class', 'etichetta')
        .attr('x', PX.uscita + 34).attr('y', k => posUscita(k)[1] + 5)
        .attr('font-size', 13).attr('fill', C.inchiostro2)
        .attr('font-weight', k => (mostraAttivazioni && usc[k] > 0.5 ? 700 : 400))
        .text(k => NOMI_CLASSI[k] + (mostraAttivazioni ? ` ${L.perc(usc[k], 0)}` : ''));
    });
  }

  /** Pallini che scorrono lungo i fili: avanti (segnale) o indietro (colpa). */
  function animaFlusso(tela, indietro, poi) {
    const archi = [];
    W1.forEach((w, j) => w.forEach((v, i) => archi.push({ a: posIngresso(i), b: posNascosto(j), v, fase: 0 })));
    W2.forEach((w, k) => w.forEach((v, j) => archi.push({ a: posNascosto(j), b: posUscita(k), v, fase: 1 })));

    const durata = 520;
    archi.forEach(arco => {
      const da = indietro ? arco.b : arco.a;
      const a = indietro ? arco.a : arco.b;
      const ritardo = (indietro ? (1 - arco.fase) : arco.fase) * durata;
      tela.gPunti.append('circle')
        .attr('cx', da[0]).attr('cy', da[1]).attr('r', 4)
        .attr('fill', indietro ? C.errore : (arco.v >= 0 ? C.modello : C.rosso))
        .attr('opacity', Math.min(1, 0.25 + Math.abs(arco.v) / 2))
        .transition().delay(ritardo).duration(durata).ease(d3.easeLinear)
        .attr('cx', a[0]).attr('cy', a[1])
        .remove();
    });
    setTimeout(poi, durata * 2 + 80);
  }

  /* ── la griglia 3×3 da disegnare ───────────────────────────────────── */

  const tg = L.tela('#rete-griglia', 240, 180, { t: 20, d: 10, b: 10, s: 10 });
  tg.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 14)
    .text('disegnate qui (cliccate i quadretti)');
  tg.g.selectAll('rect').data(d3.range(9)).join('rect')
    .attr('x', i => (i % 3) * 52).attr('y', i => Math.floor(i / 3) * 52)
    .attr('width', 48).attr('height', 48).attr('rx', 6)
    .attr('stroke', C.bordo).attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('click', (ev, i) => { griglia[i] = griglia[i] ? 0 : 1; aggiornaGriglia(); });

  function aggiornaGriglia() {
    tg.g.selectAll('rect').attr('fill', i => (griglia[i] ? C.dati : C.superficie));
    disegnaRete(false);
    d3.select('#piccola-verdetto').attr('class', 'verdetto')
      .html(d3.sum(griglia) === 0
        ? 'Accendete qualche quadretto, poi premete «Manda il segnale».'
        : 'Pronti. Premete «Manda il segnale» e guardate i pallini percorrere i fili.');
  }

  d3.select('#piccola-pulisci').on('click', () => { griglia = new Array(9).fill(0); aggiornaGriglia(); });

  d3.select('#piccola-segnale').on('click', function () {
    if (d3.sum(griglia) === 0) return;
    d3.select(this).attr('disabled', 'disabled');
    disegnaRete(false);
    animaFlusso(teleRete[0], false, () => {
      avanti(griglia);
      disegnaRete(true);
      const vincitore = usc[0] > usc[1] ? 0 : 1;
      d3.select('#piccola-verdetto')
        .attr('class', 'verdetto ' + (passi > 0 ? 'buono' : 'attenzione'))
        .html(`La rete dice: <strong>${NOMI_CLASSI[vincitore]}</strong> al ${L.perc(usc[vincitore], 0)}. ` +
              (passi === 0
                ? 'Ma non ha ancora studiato niente: sta tirando a indovinare. Continuate qui sotto.'
                : `Ha studiato ${passi} esempi.`));
      d3.select(this).attr('disabled', null);
    });
  });

  /* ── i sei esempi di studio ────────────────────────────────────────── */

  const te = L.tela('#impara-esempi', 420, 120, { t: 18, d: 6, b: 6, s: 6 });
  te.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 12)
    .text('i sei esempi, con la risposta giusta');
  const gEsempi = te.g.selectAll('g').data(ESEMPI).join('g')
    .attr('transform', (d, i) => `translate(${i * 68},0)`);
  gEsempi.selectAll('rect').data(d => d.celle.map((v, i) => ({ v, i })))
    .join('rect')
    .attr('x', d => (d.i % 3) * 17).attr('y', d => Math.floor(d.i / 3) * 17)
    .attr('width', 15).attr('height', 15).attr('rx', 2)
    .attr('fill', d => (d.v ? C.dati : C.superficie2));
  gEsempi.append('rect').attr('class', 'bordo')
    .attr('x', -4).attr('y', -4).attr('width', 59).attr('height', 78).attr('rx', 6)
    .attr('fill', 'none').attr('stroke', 'none').attr('stroke-width', 2.5);
  gEsempi.append('text').attr('x', 24).attr('y', 68).attr('text-anchor', 'middle')
    .attr('font-size', 11).attr('fill', C.inchiostro3)
    .text(d => (d.classe === 0 ? 'verticale' : 'orizzontale'));

  function evidenziaEsempio(i) {
    gEsempi.select('rect.bordo').attr('stroke', (d, j) => (j === i ? C.errore : 'none'));
  }

  function aggiornaVerdettoImpara(testo, classe) {
    d3.select('#impara-verdetto').attr('class', 'verdetto ' + (classe || '')).html(testo);
  }

  function evidenziaFase(n) {
    d3.selectAll('#impara-ricetta li')
      .classed('attiva', function () { return +this.dataset.fase === n; });
  }

  /* ── un esempio al rallentatore: le quattro fasi ────────────────────── */

  d3.select('#impara-passo').on('click', function () {
    if (timerImpara) return;
    d3.select(this).attr('disabled', 'disabled');
    const esempio = ESEMPI[indiceEsempio % ESEMPI.length];
    indiceEsempio++;
    griglia = esempio.celle.slice();
    aggiornaGriglia();
    evidenziaEsempio(ESEMPI.indexOf(esempio));

    evidenziaFase(1);
    aggiornaVerdettoImpara('<strong>1.</strong> Il segnale attraversa i fili: ogni neurone somma quello ' +
                           'che gli arriva e passa il risultato avanti.');
    animaFlusso(teleRete[1], false, () => {
      avanti(esempio.celle);
      disegnaRete(true);
      evidenziaFase(2);
      const p = usc[esempio.classe];
      aggiornaVerdettoImpara(
        `<strong>2.</strong> La rete dice <strong>${NOMI_CLASSI[usc[0] > usc[1] ? 0 : 1]}</strong>, ` +
        `ma la risposta giusta è <strong>${NOMI_CLASSI[esempio.classe]}</strong>: ` +
        `ci ha creduto solo al ${L.perc(p, 0)}. Questo pezzo che manca è l'errore.`,
        p > 0.8 ? 'buono' : 'attenzione');

      setTimeout(() => {
        evidenziaFase(3);
        aggiornaVerdettoImpara('<strong>3.</strong> L\'errore torna indietro lungo gli stessi fili: ' +
                               'ogni filo riceve la parte che gli spetta, tanta quanta ne ha causata.');
        animaFlusso(teleRete[1], true, () => {
          evidenziaFase(4);
          unaCorrezione(esempio);
          avanti(esempio.celle);
          disegnaRete(true);
          const dopo = usc[esempio.classe];
          aggiornaVerdettoImpara(
            `<strong>4.</strong> Ogni filo si è spostato di un pochino. Adesso sullo stesso esempio ` +
            `la rete ci crede al ${L.perc(dopo, 0)} invece che al ${L.perc(p, 0)}. ` +
            'Un pochino meglio. Moltiplicate per qualche migliaio di volte.',
            dopo > p ? 'buono' : '');
          d3.select('#impara-passo').attr('disabled', null);
        });
      }, 900);
    });
  });

  /* ── allenamento veloce ────────────────────────────────────────────── */

  d3.select('#impara-vai').on('click', function () {
    if (timerImpara) {
      timerImpara.stop(); timerImpara = null;
      d3.select(this).text('▶ Allena');
      return;
    }
    d3.select(this).text('❚❚ Ferma');
    evidenziaFase(0);
    timerImpara = d3.interval(() => {
      for (let i = 0; i < 4; i++) unaCorrezione(ESEMPI[(indiceEsempio++) % ESEMPI.length]);
      const giusti = quantiGiusti();
      if (d3.sum(griglia) > 0) avanti(griglia);
      disegnaRete(d3.sum(griglia) > 0);
      aggiornaVerdettoImpara(
        `<strong>${passi} correzioni.</strong> Adesso indovina <strong>${giusti} esempi su 6</strong>. ` +
        (giusti === 6
          ? 'Guardate i fili: alcuni si sono ingrossati, altri sono spariti. ' +
            'Quelli che contano li ha scelti da sola.'
          : 'Guardate i fili cambiare spessore: sono le manopole che si regolano.'),
        giusti === 6 ? 'buono' : '');
      if (passi > 400) { timerImpara.stop(); timerImpara = null; d3.select('#impara-vai').text('▶ Continua'); }
    }, 60);
  });

  d3.select('#impara-reset').on('click', () => {
    if (timerImpara) { timerImpara.stop(); timerImpara = null; d3.select('#impara-vai').text('▶ Allena'); }
    inizializzaRete();
    avanti(griglia);
    disegnaRete(false);
    aggiornaVerdettoImpara('Manopole rimesse a caso: la rete ha dimenticato tutto.');
  });

  L.allUscita('rete', () => {
    if (timerImpara) { timerImpara.stop(); timerImpara = null; d3.select('#impara-vai').text('▶ Allena'); }
  });

  inizializzaRete();
  griglia = [0, 1, 0, 0, 1, 0, 0, 1, 0];
  avanti(griglia);
  aggiornaGriglia();
  aggiornaVerdettoImpara('Premete «Un esempio, al rallentatore» per vedere le quattro fasi una per una.');
});

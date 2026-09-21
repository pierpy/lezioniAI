/* ═══════════════════════════════════════════════════════════════════════
   Tappa 0-c — le due strade, con un esempio vero per ciascuna.

   A sinistra un algoritmo scritto da una persona (ordinamento a bolle su
   sei carte): si esegue passo passo, la regola illuminata a lato, e
   funziona sempre. A destra un problema per cui la regola non esiste:
   la rete già addestrata riconosce una cifra MNIST mai vista.

   Il confronto è il punto: esecuzione contro apprendimento.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('copertina', function () {
  const L = LEZIONE, C = L.colori;

  /* ═══════════ a sinistra: la regola che si esegue ═══════════ */

  let carte = [], i = 0, scambiato = false, finito = false, timerOrdina = null;

  const tc = L.tela('#ordina-carte', 520, 110, { t: 14, d: 10, b: 10, s: 10 });
  const LARG = 74, ALT = 74;

  function mischia() {
    if (timerOrdina) { timerOrdina.stop(); timerOrdina = null; d3.select('#ordina-vai').text('▶ Esegui la regola'); }
    const numeri = d3.shuffle([3, 12, 7, 21, 5, 16]).slice();
    carte = numeri.map((n, k) => ({ n, id: k }));
    i = 0; scambiato = false; finito = false;
    disegnaCarte();
    d3.select('#ordina-verdetto').attr('class', 'verdetto')
      .html('Sei carte in disordine. Premete «Un passo» e seguite la regola illuminata a sinistra.');
  }

  function unPassoOrdina() {
    if (finito) return;
    if (i >= carte.length - 1) {                    // fine di una passata
      if (!scambiato) { finito = true; }
      i = 0; scambiato = false;
      if (finito) {
        evidenziaRegola(0);
        disegnaCarte();
        d3.select('#ordina-verdetto').attr('class', 'verdetto buono')
          .html('<strong>In ordine.</strong> Nessuno ha dovuto «imparare» niente: ' +
                'la regola era già scritta, e funziona con qualsiasi mazzo di carte. ' +
                'Questo è un <em>algoritmo</em>: il modo in cui si è programmato per settant\'anni.');
        return;
      }
    }
    evidenziaRegola(carte[i].n > carte[i + 1].n ? 2 : 1);
    if (carte[i].n > carte[i + 1].n) {
      const t = carte[i]; carte[i] = carte[i + 1]; carte[i + 1] = t;
      scambiato = true;
    }
    i++;
    disegnaCarte();
    if (!finito) {
      d3.select('#ordina-verdetto').attr('class', 'verdetto')
        .html(`Confronto la carta n. ${i} con quella dopo: ` +
              (scambiato ? 'scambiate.' : 'erano già in ordine, vado avanti.'));
    }
  }

  function evidenziaRegola(n) {
    d3.selectAll('#ordina-ricetta li')
      .classed('attiva', function () { return +this.dataset.fase === n; });
  }

  function disegnaCarte() {
    const g = tc.g.selectAll('g.carta').data(carte, d => d.id).join(
      entra => {
        const c = entra.append('g').attr('class', 'carta');
        c.append('rect').attr('width', LARG - 8).attr('height', ALT).attr('rx', 8)
          .attr('stroke', C.bordo).attr('stroke-width', 2);
        c.append('text').attr('x', (LARG - 8) / 2).attr('y', ALT / 2 + 11)
          .attr('text-anchor', 'middle').attr('font-size', 30).attr('fill', C.dati);
        return c;
      });
    g.transition().duration(260)
      .attr('transform', (d, k) => `translate(${k * LARG},0)`);
    g.select('rect')
      .attr('fill', (d, k) => (finito ? '#eaf7f1' : (k === i || k === i - 1 ? '#fdf0e9' : C.superficie)))
      .attr('stroke', (d, k) => (finito ? C.verifica : (k === i || k === i - 1 ? C.errore : C.bordo)));
    g.select('text').text(d => d.n);
  }

  d3.select('#ordina-passo').on('click', () => {
    if (timerOrdina) { timerOrdina.stop(); timerOrdina = null; d3.select('#ordina-vai').text('▶ Esegui la regola'); }
    unPassoOrdina();
  });
  d3.select('#ordina-vai').on('click', function () {
    if (timerOrdina) { timerOrdina.stop(); timerOrdina = null; d3.select(this).text('▶ Esegui la regola'); return; }
    if (finito) mischia();
    d3.select(this).text('❚❚ Ferma');
    timerOrdina = d3.interval(() => {
      unPassoOrdina();
      if (finito) { timerOrdina.stop(); timerOrdina = null; d3.select('#ordina-vai').text('▶ Rifallo'); }
    }, 420);
  });
  d3.select('#ordina-mischia').on('click', mischia);
  L.allUscita('copertina', () => {
    if (timerOrdina) { timerOrdina.stop(); timerOrdina = null; d3.select('#ordina-vai').text('▶ Esegui la regola'); }
  });
  mischia();

  /* ═══════════ a destra: la regola che non esiste ═══════════ */

  const te = L.tela('#esempi-cifre', 520, 210, { t: 16, d: 10, b: 10, s: 10 });
  const scalaCifra = d3.scaleSequential(d3.interpolateRgbBasis(C.bluRampa)).domain([0, 1]);
  let cifre = null;

  function disegnaCifra(gruppo, vettore, lato) {
    gruppo.selectAll('rect.p').data(d3.range(784)).join('rect').attr('class', 'p')
      .attr('x', j => (j % 28) * lato).attr('y', j => Math.floor(j / 28) * lato)
      .attr('width', lato).attr('height', lato)
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', j => scalaCifra(vettore[j]));
  }

  function mostraEsempi(nuovaCifra) {
    if (!cifre) return;
    const LATO = 3.6, PASSO = 120;

    /* tre esempi di studio, con l'etichetta scritta da una persona */
    const scelti = [];
    while (scelti.length < 3) {
      const k = Math.floor(Math.random() * cifre.n);
      if (!scelti.includes(k)) scelti.push(k);
    }
    const gruppi = te.g.selectAll('g.esempio').data(scelti).join(
      entra => {
        const g = entra.append('g').attr('class', 'esempio');
        g.append('g').attr('class', 'immagine');
        g.append('rect').attr('class', 'cornice').attr('width', 28 * LATO).attr('height', 28 * LATO)
          .attr('fill', 'none').attr('stroke', C.bordo).attr('rx', 4);
        g.append('text').attr('class', 'sotto').attr('x', 14 * LATO).attr('y', 28 * LATO + 20)
          .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', C.inchiostro2);
        return g;
      })
      .attr('transform', (d, k) => `translate(${k * PASSO},14)`);
    gruppi.each(function (k) {
      disegnaCifra(d3.select(this).select('g.immagine'), cifre.X.subarray(k * 784, k * 784 + 784), LATO);
      d3.select(this).select('text.sotto').text(`«è un ${cifre.y[k]}»`);
    });
    te.g.selectAll('text.titoletto').data([0]).join('text').attr('class', 'titoletto')
      .attr('x', 0).attr('y', 6).attr('font-size', 13).attr('fill', C.inchiostro3)
      .text('tre dei 8.000 esempi, con la risposta scritta da una persona');

    /* la cifra nuova, che la rete non ha mai visto */
    const gN = te.g.selectAll('g.nuova').data(nuovaCifra ? [nuovaCifra] : []).join(
      entra => {
        const g = entra.append('g').attr('class', 'nuova').attr('transform', `translate(${3 * PASSO + 40},14)`);
        g.append('g').attr('class', 'immagine');
        g.append('rect').attr('class', 'cornice').attr('width', 28 * LATO).attr('height', 28 * LATO)
          .attr('fill', 'none').attr('stroke', C.verifica).attr('stroke-width', 2.5).attr('rx', 4);
        g.append('text').attr('class', 'sotto').attr('x', 14 * LATO).attr('y', 28 * LATO + 20)
          .attr('text-anchor', 'middle').attr('font-size', 13).attr('font-weight', 700);
        g.append('text').attr('class', 'sopra').attr('x', 14 * LATO).attr('y', -8)
          .attr('text-anchor', 'middle').attr('font-size', 12).attr('fill', C.verifica)
          .text('mai vista');
        return g;
      });
    gN.each(function (d) {
      disegnaCifra(d3.select(this).select('g.immagine'), d.vettore, LATO);
      d3.select(this).select('text.sotto').attr('fill', C.verifica)
        .text(`la macchina dice «${d.risposta}»`);
    });
  }

  d3.select('#esempi-nuova').on('click', () => {
    if (!cifre) return;
    const k = Math.floor(Math.random() * cifre.n);
    const vettore = cifre.X.subarray(k * 784, k * 784 + 784);
    const esito = LEZIONE.reteMnist.prevedi(vettore);
    const risposta = esito.probabilita.indexOf(Math.max(...esito.probabilita));
    mostraEsempi({ vettore, risposta, vero: cifre.y[k] });
    d3.select('#esempi-verdetto')
      .attr('class', 'verdetto ' + (risposta === cifre.y[k] ? 'buono' : 'attenzione'))
      .html(risposta === cifre.y[k]
        ? `Ha risposto <strong>${risposta}</strong>, ed era giusto — su una cifra che non aveva ` +
          'mai visto. Nessuno le ha spiegato com\'è fatto un ' + risposta + ': ' +
          'l\'ha capito guardando gli esempi.'
        : `Ha risposto <strong>${risposta}</strong>, ma era un <strong>${cifre.y[k]}</strong>. ` +
          'Capita: sbaglia circa tre volte su cento. Anche questo fa parte della strada nuova, ' +
          'e ne riparliamo alla fine.');
  });

  d3.select('#esempi-verdetto').attr('class', 'verdetto')
    .html('Premete il pulsante: la macchina vedrà una cifra che non le è mai stata mostrata.');
  L.cifreStudio(c => { cifre = c; mostraEsempi(null); });
});

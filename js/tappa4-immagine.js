/* ═══════════════════════════════════════════════════════════════════════
   Tappa 4 — «un'immagine è una fila di numeri».
   Una cifra MNIST vera viene srotolata riga per riga in una striscia di
   784 caselle: è il passaggio che nessuno racconta mai e senza il quale
   «la rete guarda l'immagine» resta una frase magica.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('rete', function () {
  const L = LEZIONE, C = L.colori;

  const W = 1180, H = 392;
  const t = L.tela('#srotola-schema', W, H, { t: 26, d: 10, b: 12, s: 10 });
  const scala = d3.scaleSequential(d3.interpolateRgbBasis(C.bluRampa)).domain([0, 1]);

  const LATO = 7;                       // pixel per quadretto nella griglia
  const X_GRIGLIA = 190, Y_GRIGLIA = 8;
  const Y_FILA = 240;
  const LARG_FILA = 1160 / 784;         // la striscia occupa quasi tutta la larghezza

  let cifre = null, vettore = null, srotolata = false, animazione = null;

  /* il «binario»: si vede da subito dove andranno a finire i numeri */
  const binario = t.g.append('rect')
    .attr('x', -2).attr('y', Y_FILA - 2).attr('width', 1164).attr('height', 30)
    .attr('rx', 4).attr('fill', C.superficie2).attr('stroke', C.bordo).attr('stroke-dasharray', '4 3');
  /* una copia ferma dell'immagine di partenza, così il confronto resta in vista */
  const gPartenza = t.g.append('g');
  const gGriglia = t.g.append('g');
  const gNumeri = t.g.append('g');
  const gFila = t.g.append('g');
  const gEtichette = t.g.append('g');

  t.svg.append('text').attr('class', 'titolo-grafico').attr('x', 6).attr('y', 16)
    .text('la cifra, quadretto per quadretto');

  function posGriglia(i) {
    return [X_GRIGLIA + (i % 28) * LATO, Y_GRIGLIA + Math.floor(i / 28) * LATO];
  }
  function posFila(i) {
    return [i * LARG_FILA, Y_FILA];
  }

  function disegna(inFila) {
    const LATO_P = 5;
    gPartenza.selectAll('rect').data(d3.range(784)).join('rect')
      .attr('x', i => (i % 28) * LATO_P).attr('y', i => 8 + Math.floor(i / 28) * LATO_P)
      .attr('width', LATO_P).attr('height', LATO_P)
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', i => scala(vettore[i]));
    gPartenza.selectAll('text').data([0]).join('text')
      .attr('x', 0).attr('y', 8 + 28 * LATO_P + 18)
      .attr('font-size', 12).attr('fill', C.inchiostro3).text("l'immagine di partenza");

    gGriglia.selectAll('rect').data(d3.range(784)).join('rect')
      .attr('x', i => (inFila ? posFila(i)[0] : posGriglia(i)[0]))
      .attr('y', i => (inFila ? posFila(i)[1] : posGriglia(i)[1]))
      .attr('width', inFila ? Math.max(1, LARG_FILA) : LATO)
      .attr('height', inFila ? 26 : LATO)
      .attr('shape-rendering', 'crispEdges')
      .attr('fill', i => scala(vettore[i]));
    etichette(inFila);
  }

  /** L'animazione, in due tempi per ogni riga: prima scende dritta,
   *  poi scivola a destra e si stringe fino a entrare nel binario.
   *  In un colpo solo si vedrebbero soltanto dei trattini che volano. */
  function srotola() {
    if (!vettore || animazione) return;
    srotolata = true;
    gNumeri.selectAll('*').remove();
    animazione = true;
    let fatte = 0;

    for (let r = 0; r < 28; r++) {
      const righe = gGriglia.selectAll('rect').filter(i => Math.floor(i / 28) === r);
      righe.transition().delay(r * 110).duration(260).ease(d3.easeCubicOut)
        .attr('y', Y_FILA).attr('height', 26)
        .transition().duration(340).ease(d3.easeCubicInOut)
        .attr('x', i => posFila(i)[0])
        .attr('width', Math.max(1, LARG_FILA))
        .on('end', () => {
          fatte++;
          if (fatte >= 784) { animazione = null; etichette(true); }
        });
      setTimeout(() => {
        gGriglia.selectAll('rect')
          .attr('stroke', i => (Math.floor(i / 28) === r ? C.errore : 'none'))
          .attr('stroke-width', 0.6);
        d3.select('#srotola-stato').html(
          `la riga ${r + 1} scende e si mette in coda → <strong>${(r + 1) * 28}</strong> numeri in fila`);
      }, r * 110);
    }
    setTimeout(() => {
      gGriglia.selectAll('rect').attr('stroke', 'none');
      etichette(true);
    }, 28 * 110 + 700);
  }

  function etichette(inFila) {
    const dati = inFila
      ? [
          { x: 0, y: Y_FILA - 14, testo: 'i primi 28 numeri = la prima riga dell\'immagine', ancora: 'start' },
          { x: 1160, y: Y_FILA - 14, testo: '…fino al numero 784', ancora: 'end' },
          { x: 580, y: Y_FILA + 54, testo: 'questa fila di 784 numeri è tutto ciò che la rete riceve', ancora: 'middle' }
        ]
      : [{ x: X_GRIGLIA + 210, y: 110, testo: '28 righe da 28 quadretti', ancora: 'start' }];

    gEtichette.selectAll('text').data(dati).join('text')
      .attr('x', d => d.x).attr('y', d => d.y)
      .attr('text-anchor', d => d.ancora)
      .attr('font-size', 13).attr('fill', C.inchiostro2)
      .text(d => d.testo);

    /* parentesi sotto i primi 28, per far vedere dov'è finita la prima riga */
    gEtichette.selectAll('path').data(inFila ? [0] : []).join('path')
      .attr('d', `M0,${Y_FILA + 32} L0,${Y_FILA + 38} L${28 * LARG_FILA},${Y_FILA + 38} L${28 * LARG_FILA},${Y_FILA + 32}`)
      .attr('fill', 'none').attr('stroke', C.errore).attr('stroke-width', 2);

    /* i valori dei primi otto numeri, scritti per esteso */
    if (inFila && vettore) {
      const primi = d3.range(10).map(i => ({ i, v: vettore[i + 13 * 28 + 8] }));
      gNumeri.selectAll('text.n').data(primi).join('text').attr('class', 'n')
        .attr('x', (d, k) => 320 + k * 58).attr('y', Y_FILA + 84)
        .attr('font-size', 14).attr('fill', C.inchiostro2)
        .text(d => L.num(d.v, 2));
      gNumeri.selectAll('text.eti').data([0]).join('text').attr('class', 'eti')
        .attr('x', 0).attr('y', Y_FILA + 84)
        .attr('font-size', 13).attr('fill', C.inchiostro3)
        .text('dieci numeri presi in mezzo alla fila:');
    } else {
      gNumeri.selectAll('*').remove();
    }
  }

  function nuovaCifra() {
    if (!cifre) return;
    let k = Math.floor(Math.random() * cifre.n);
    vettore = cifre.X.subarray(k * 784, k * 784 + 784);
    srotolata = false;
    animazione = null;
    gGriglia.selectAll('rect').interrupt();
    disegna(false);
    gGriglia.selectAll('rect').attr('stroke', 'none');
    d3.select('#srotola-stato').text('');
  }

  d3.select('#srotola-vai').on('click', () => { if (srotolata) { nuovaCifra(); } srotola(); });
  d3.select('#srotola-altra').on('click', nuovaCifra);

  d3.select('#srotola-stato').text('sto caricando una cifra…');
  L.cifreStudio(c => { cifre = c; nuovaCifra(); });
});

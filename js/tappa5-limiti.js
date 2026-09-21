/* ═══════════════════════════════════════════════════════════════════════
   Tappa 5 — i limiti. Riusa la stessa rete della Tappa 3, ma la invita a
   rispondere su qualcosa che non ha mai visto: un disegno qualsiasi.
   La rete risponde comunque, spesso con grande sicurezza: è la versione
   in miniatura delle "allucinazioni" dei modelli linguistici.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('limiti', function () {
  const L = LEZIONE, R = LEZIONE.reteMnist;
  let tela = null;

  function aggiorna() {
    if (!tela) return;
    const vettore = R.estraiVettore(tela.tela);
    const esito = vettore ? R.prevedi(vettore) : null;
    R.disegnaBarre('#lim-uscita', esito ? esito.probabilita : null);

    const v = d3.select('#lim-verdetto');
    if (!esito) {
      v.attr('class', 'verdetto verdetto-grande').html('Disegnate qualcosa: un fiore, una casa, uno scarabocchio.');
      return;
    }
    const p = esito.probabilita;
    const vincitore = p.indexOf(Math.max(...p));
    const sicurezza = p[vincitore];
    let commento;
    if (sicurezza > 0.9) {
      commento = 'ed è <strong>sicurissima</strong>. Eppure potrebbe non esserci nessuna cifra qui.';
    } else if (sicurezza > 0.6) {
      commento = 'con discreta sicurezza. Non ha alcun modo di dire «questo non è un numero».';
    } else {
      commento = 'ma è incerta: le dieci risposte si somigliano. Anche l\'incertezza, però, è solo un numero.';
    }
    v.attr('class', 'verdetto verdetto-grande attenzione')
      .html(`Risponde <strong style="font-size:1.5em">${vincitore}</strong> al ${L.perc(sicurezza, 0)} ` +
            `<br><span style="font-size:.95rem">${commento}</span>`);
  }

  tela = R.collegaTela('#lim-tela', aggiorna);
  d3.select('#lim-pulisci').on('click', tela.pulisci);
  aggiorna();
});

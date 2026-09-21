/* ═══════════════════════════════════════════════════════════════════════
   Tappa 1 — regressione interattiva su dati immobiliari.
   Due visualizzazioni:
     A) nuvola di punti + polinomio di grado scelto, con errori e verifica;
     B) la "collina dell'errore" (curve di livello della funzione costo)
        percorsa dalla discesa del gradiente per il caso a due manopole.
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('regressione', function () {
  const L = LEZIONE, C = L.colori;

  /* dati iniziali: metri quadri → prezzo in migliaia di euro.
     L'andamento vero è leggermente curvo (il prezzo al metro cala con la taglia). */
  const DATI_INIZIALI = [
    [45, 96], [52, 108], [58, 127], [62, 118], [70, 149], [74, 141],
    [80, 168], [88, 176], [95, 199], [101, 188], [110, 214], [118, 206],
    [126, 231], [134, 219], [142, 244]
  ];

  const DOMINIO_X = [30, 155], DOMINIO_Y = [40, 290];
  let punti = DATI_INIZIALI.map(([x, y], i) => ({ x, y, id: i }));
  let prossimoId = punti.length;
  let grado = 1, mostraErrori = true, conVerifica = false;

  /* ═════════════ A) grafico principale ═════════════ */

  const W = 720, H = 460;
  const t = L.tela('#reg-grafico', W, H);
  const x = d3.scaleLinear().domain(DOMINIO_X).range([0, t.w]);
  const y = d3.scaleLinear().domain(DOMINIO_Y).range([t.h, 0]);

  t.g.append('g').attr('class', 'griglia')
    .call(d3.axisLeft(y).ticks(6).tickSize(-t.w).tickFormat(''))
    .select('.domain').remove();

  t.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${t.h})`)
    .call(d3.axisBottom(x).ticks(7).tickFormat(d => d + ' m²'));
  t.g.append('g').attr('class', 'asse')
    .call(d3.axisLeft(y).ticks(6).tickFormat(d => d + 'k'));
  t.g.append('text').attr('class', 'etichetta-asse')
    .attr('x', t.w).attr('y', t.h + 36).attr('text-anchor', 'end')
    .text('superficie dell\'appartamento');
  t.g.append('text').attr('class', 'etichetta-asse')
    .attr('transform', `translate(-42,${t.h / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .text('prezzo (migliaia di €)');

  /* sfondo cliccabile: aggiunge un punto */
  t.g.append('rect')
    .attr('width', t.w).attr('height', t.h)
    .attr('fill', 'transparent')
    .style('cursor', 'copy')
    .on('click', function (ev) {
      const [px, py] = d3.pointer(ev, this);
      punti.push({ x: Math.round(x.invert(px)), y: Math.round(y.invert(py)), id: prossimoId++ });
      aggiorna();
    });

  t.svg.append('defs').append('clipPath').attr('id', 'ritaglio-reg')
    .append('rect').attr('width', t.w).attr('height', t.h);
  const gRitagliato = t.g.append('g').attr('clip-path', 'url(#ritaglio-reg)');
  const gErrori = gRitagliato.append('g');
  const curva = gRitagliato.append('path').attr('fill', 'none')
    .attr('stroke', C.modello).attr('stroke-width', 3).attr('stroke-linecap', 'round');
  const gPunti = t.g.append('g');
  const legenda = t.g.append('g').attr('transform', `translate(10,10)`);
  legenda.append('rect').attr('class', 'sfondo-legenda')
    .attr('x', -6).attr('y', -12).attr('width', 200).attr('height', 24)
    .attr('rx', 6).attr('fill', 'rgba(255,255,255,.82)');

  const generatore = d3.line().x(d => x(d[0])).y(d => y(d[1]));
  const sugg = L.suggerimento();

  /* i punti "di verifica" sono quelli in posizione 1, 4, 7… una volta ordinati */
  function partiziona() {
    const ordinati = punti.slice().sort((a, b) => a.x - b.x);
    const verifica = new Set();
    if (conVerifica) ordinati.forEach((p, i) => { if (i % 3 === 1) verifica.add(p.id); });
    return {
      studio: punti.filter(p => !verifica.has(p.id)),
      verifica: punti.filter(p => verifica.has(p.id))
    };
  }

  const trascina = d3.drag()
    .on('start', function () { d3.select(this).attr('stroke-width', 4); })
    .on('drag', function (ev, d) {
      d.x = Math.max(DOMINIO_X[0], Math.min(DOMINIO_X[1], x.invert(ev.x)));
      d.y = Math.max(DOMINIO_Y[0], Math.min(DOMINIO_Y[1], y.invert(ev.y)));
      aggiorna();
    })
    .on('end', function () { d3.select(this).attr('stroke-width', 2); });

  function aggiorna() {
    const { studio, verifica } = partiziona();
    const modello = L.adattaPolinomio(studio, grado, DOMINIO_X);
    const f = modello.f;

    /* curva */
    const campioni = d3.range(DOMINIO_X[0], DOMINIO_X[1] + 0.5, 0.5)
      .map(xv => [xv, Math.max(DOMINIO_Y[0] - 400, Math.min(DOMINIO_Y[1] + 400, f(xv)))]);
    curva.attr('d', generatore(campioni));

    /* errori (residui) */
    gErrori.selectAll('line')
      .data(mostraErrori ? studio : [], d => d.id)
      .join('line')
      .attr('x1', d => x(d.x)).attr('x2', d => x(d.x))
      .attr('y1', d => y(d.y)).attr('y2', d => y(f(d.x)))
      .attr('stroke', C.errore).attr('stroke-width', 2).attr('stroke-opacity', .75);

    /* punti: cerchi = studio, rombi = verifica */
    gPunti.selectAll('path')
      .data(punti, d => d.id)
      .join('path')
      .attr('transform', d => `translate(${x(d.x)},${y(d.y)})`)
      .attr('d', d => (verifica.some(v => v.id === d.id)
        ? d3.symbol(d3.symbolDiamond, 150)()
        : d3.symbol(d3.symbolCircle, 110)()))
      .attr('fill', d => (verifica.some(v => v.id === d.id) ? C.verifica : C.dati))
      .attr('stroke', C.superficie).attr('stroke-width', 2)
      .style('cursor', 'grab')
      .on('click', (ev, d) => {
        if (!ev.shiftKey) return;
        ev.stopPropagation();
        if (punti.length > 3) { punti = punti.filter(p => p.id !== d.id); aggiorna(); }
      })
      .on('mousemove', (ev, d) => sugg.mostra(
        `${Math.round(d.x)} m² → ${Math.round(d.y)} mila €<br>` +
        `<span style="opacity:.75">previsione: ${Math.round(f(d.x))} mila €</span>`, ev))
      .on('mouseleave', sugg.nascondi)
      .call(trascina);

    /* legenda (sempre presente: l'identità non è affidata al solo colore) */
    const voci = [{ c: C.dati, t: 'dati di studio', s: 'circle' }]
      .concat(conVerifica ? [{ c: C.verifica, t: 'dati di verifica (mai visti)', s: 'diamond' }] : [])
      .concat([{ c: C.modello, t: 'modello', s: 'line' }])
      .concat(mostraErrori ? [{ c: C.errore, t: 'errore', s: 'line' }] : []);
    legenda.select('rect.sfondo-legenda').attr('height', voci.length * 20 + 6);
    const g = legenda.selectAll('g').data(voci).join('g')
      .attr('transform', (d, i) => `translate(0,${i * 20})`);
    g.selectAll('*').remove();
    g.each(function (d) {
      const s = d3.select(this);
      if (d.s === 'line') s.append('line').attr('x1', 0).attr('x2', 16).attr('y1', 0).attr('y2', 0)
        .attr('stroke', d.c).attr('stroke-width', 3);
      else s.append('path').attr('transform', 'translate(8,0)')
        .attr('d', d3.symbol(d.s === 'diamond' ? d3.symbolDiamond : d3.symbolCircle, 90)())
        .attr('fill', d.c);
      s.append('text').attr('x', 22).attr('y', 4).attr('font-size', 12)
        .attr('fill', C.inchiostro2).text(d.t);
    });

    /* punteggi */
    const eStudio = L.rmse(studio, f);
    const eVerifica = verifica.length ? L.rmse(verifica, f) : NaN;
    const schede = [{ cl: 'studio', et: 'Errore sui dati di studio', v: eStudio }]
      .concat(conVerifica ? [{ cl: 'verifica', et: 'Errore sui dati mai visti', v: eVerifica }] : []);
    d3.select('#reg-punteggi').selectAll('div.punteggio').data(schede).join('div')
      .attr('class', d => 'punteggio ' + d.cl)
      .html(d => `<span class="etichetta">${d.et}</span>` +
                 `<span class="valore">${L.num(d.v, 1)}<span style="font-size:.7em"> mila €</span></span>`);

    d3.select('#reg-verdetto').attr('class', 'verdetto ' + classeVerdetto(grado, eStudio, eVerifica))
      .html(verdetto(grado, eStudio, eVerifica, studio.length));

    aggiornaCollina();
  }

  function classeVerdetto(g, es, ev) {
    if (conVerifica && isFinite(ev) && ev > 2.2 * es + 4) return 'attenzione';
    if (g >= 8) return 'attenzione';
    return 'buono';
  }

  function verdetto(g, es, ev, n) {
    const manopole = g + 1;
    if (conVerifica && isFinite(ev)) {
      if (ev > 2.2 * es + 4) {
        return `<strong>Impara a memoria.</strong> Con ${manopole} manopole la curva passa quasi esattamente ` +
               `per le case che ha studiato (sbaglia ${L.num(es, 1)} mila €), ma su quelle mai viste ` +
               `sbaglia ${L.num(ev, 1)} mila €: <em>più del triplo</em>. ` +
               `<span class="tecnico">In gergo: sovradattamento (<em>overfitting</em>).</span>`;
      }
      return `<strong>Equilibrio ragionevole.</strong> Sbaglia quasi uguale sulle case mai viste ` +
             `(${L.num(ev, 1)}) e su quelle studiate (${L.num(es, 1)}): ha imparato la regola, non i dettagli.`;
    }
    if (g === 1) {
      return `<strong>Una retta: 2 manopole.</strong> Dice che ogni metro quadro in più vale ` +
             `circa <strong>${L.num(pendenzaAttuale(), 1)} mila €</strong>. Semplice, chiara, un po' rigida: ` +
             `sbaglia in media ${L.num(es, 1)} mila € a casa.`;
    }
    if (g >= 8) {
      return `<strong>Attenzione.</strong> ${manopole} manopole per ${n} case: la curva comincia a inseguire ` +
             `ogni singolo punto. Accendete la verifica qui sopra e guardate che succede.`;
    }
    return `Con ${manopole} manopole sbaglia ${L.num(es, 1)} mila € sulle case che ha studiato. ` +
           `Finché la curva resta calma fra un punto e l'altro, va bene così.`;
  }

  function pendenzaAttuale() {
    const { studio } = partiziona();
    const m = L.adattaPolinomio(studio, 1, DOMINIO_X);
    return (m.f(DOMINIO_X[1]) - m.f(DOMINIO_X[0])) / (DOMINIO_X[1] - DOMINIO_X[0]);
  }

  /* ═════════════ B) la collina dell'errore ═════════════ */

  const Wc = 480, Hc = 400;
  const tc = L.tela('#gd-mappa', Wc, Hc, { t: 36, d: 22, b: 52, s: 62 });
  const tr = L.tela('#gd-retta', Wc, Hc, { t: 36, d: 22, b: 52, s: 56 });

  const xr = d3.scaleLinear().domain(DOMINIO_X).range([0, tr.w]);
  const yr = d3.scaleLinear().domain(DOMINIO_Y).range([tr.h, 0]);
  tr.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${tr.h})`)
    .call(d3.axisBottom(xr).ticks(5).tickFormat(d => d + ' m²'));
  tr.g.append('g').attr('class', 'asse').call(d3.axisLeft(yr).ticks(5).tickFormat(d => d + 'k'));
  tr.svg.append('text').attr('class', 'titolo-grafico').attr('x', 8).attr('y', 18)
    .text('La retta che ne esce');
  const gPuntiR = tr.g.append('g');
  const lineaR = tr.g.append('line')
    .attr('stroke', C.modello).attr('stroke-width', 3).attr('stroke-linecap', 'round');
  const gResidui = tr.g.append('g');

  tc.svg.append('text').attr('class', 'titolo-grafico').attr('x', 8).attr('y', 16)
    .text('La collina dell\'errore');

  /* parametri: retta scritta come  y = a + b·u,  u = x normalizzata in [−1,1] */
  const uNorm = xv => 2 * (xv - DOMINIO_X[0]) / (DOMINIO_X[1] - DOMINIO_X[0]) - 1;
  let par = { a: 0, b: 0 }, passi = 0, cammino = [], timerGd = null, ottimo = { a: 0, b: 0 };

  const xa = d3.scaleLinear().range([0, tc.w]);
  const yb = d3.scaleLinear().range([tc.h, 0]);
  const gContorni = tc.g.append('g');
  const gCammino = tc.g.append('g');
  const asseX = tc.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${tc.h})`);
  const asseY = tc.g.append('g').attr('class', 'asse');
  tc.g.append('text').attr('class', 'etichetta-asse').attr('x', tc.w).attr('y', tc.h + 38)
    .attr('text-anchor', 'end').text('manopola 1: altezza della retta');
  tc.g.append('text').attr('class', 'etichetta-asse')
    .attr('transform', `translate(-42,${tc.h / 2}) rotate(-90)`).attr('text-anchor', 'middle')
    .text('manopola 2: inclinazione');

  function costo(a, b) {
    const { studio } = partiziona();
    let s = 0;
    for (const p of studio) { const d = a + b * uNorm(p.x) - p.y; s += d * d; }
    return s / studio.length;
  }

  function aggiornaCollina() {
    const { studio } = partiziona();
    const m = L.adattaPolinomio(studio, 1, DOMINIO_X);
    ottimo = { a: m.coeff[0] || 0, b: m.coeff[1] || 0 };

    const ra = 120, rb = 120;
    xa.domain([ottimo.a - ra, ottimo.a + ra]);
    yb.domain([ottimo.b - rb, ottimo.b + rb]);

    /* griglia dei valori del costo per le curve di livello */
    const n = 80;
    const valori = new Array(n * n);
    for (let j = 0; j < n; j++) {
      const bv = yb.invert((j + .5) * tc.h / n);
      for (let i = 0; i < n; i++) {
        valori[j * n + i] = Math.sqrt(costo(xa.invert((i + .5) * tc.w / n), bv));
      }
    }
    const minV = d3.min(valori), maxV = d3.max(valori);
    const soglie = d3.range(10).map(k => minV + (maxV - minV) * Math.pow((k + 1) / 10, 2));
    const colore = d3.scaleSequential(d3.interpolateRgbBasis(C.bluRampa.slice().reverse()))
      .domain([maxV, minV]);

    asseX.call(d3.axisBottom(xa).ticks(5).tickFormat(d => L.num(d, 0)));
    asseY.call(d3.axisLeft(yb).ticks(5).tickFormat(d => L.num(d, 0)));

    const contorni = d3.contours().size([n, n]).thresholds(soglie)(valori);
    gContorni.attr('transform', `scale(${tc.w / n},${tc.h / n})`);
    gContorni.selectAll('path').data(contorni).join('path')
      .attr('d', d3.geoPath())
      .attr('stroke-width', .7 * n / tc.w)
      .attr('fill', d => colore(d.value))
      .attr('stroke', 'rgba(255,255,255,.55)');

    tc.g.selectAll('.minimo').data([ottimo]).join('path').attr('class', 'minimo')
      .attr('d', d3.symbol(d3.symbolStar, 150)())
      .attr('transform', d => `translate(${xa(d.a)},${yb(d.b)})`)
      .attr('fill', '#ffd9a8').attr('stroke', C.dati).attr('stroke-width', 1.2)
      .raise();

    disegnaCammino();
  }

  function disegnaCammino() {
    gCammino.selectAll('path.traccia').data([cammino]).join('path').attr('class', 'traccia')
      .attr('fill', 'none').attr('stroke', C.errore).attr('stroke-width', 2.5)
      .attr('d', d3.line().x(d => xa(d.a)).y(d => yb(d.b))(cammino));
    gCammino.selectAll('circle.corrente').data([par]).join('circle').attr('class', 'corrente')
      .attr('cx', d => xa(d.a)).attr('cy', d => yb(d.b)).attr('r', 6)
      .attr('fill', C.errore).attr('stroke', '#fff').attr('stroke-width', 2);

    /* pannello di destra: la retta corrispondente */
    const { studio } = partiziona();
    gPuntiR.selectAll('circle').data(studio, d => d.id).join('circle')
      .attr('cx', d => xr(d.x)).attr('cy', d => yr(d.y)).attr('r', 4.5)
      .attr('fill', C.dati).attr('stroke', '#fff').attr('stroke-width', 1.5);
    const retta = xv => par.a + par.b * uNorm(xv);
    lineaR.attr('x1', xr(DOMINIO_X[0])).attr('y1', yr(retta(DOMINIO_X[0])))
      .attr('x2', xr(DOMINIO_X[1])).attr('y2', yr(retta(DOMINIO_X[1])));
    gResidui.selectAll('line').data(studio, d => d.id).join('line')
      .attr('x1', d => xr(d.x)).attr('x2', d => xr(d.x))
      .attr('y1', d => yr(d.y)).attr('y2', d => yr(retta(d.x)))
      .attr('stroke', C.errore).attr('stroke-width', 1.5).attr('stroke-opacity', .6);

    d3.select('#gd-stato').html(
      `passo ${passi} · errore medio <strong>${L.num(Math.sqrt(costo(par.a, par.b)), 1)}</strong> mila €`);
  }

  function passoGd() {
    const { studio } = partiziona();
    let ga = 0, gb = 0;
    for (const p of studio) {
      const u = uNorm(p.x), e = par.a + par.b * u - p.y;
      ga += 2 * e / studio.length;
      gb += 2 * e * u / studio.length;
    }
    const lr = 0.35;
    par = { a: par.a - lr * ga, b: par.b - lr * gb };
    cammino.push({ ...par });
    passi++;
    disegnaCammino();
  }

  function resetGd() {
    if (timerGd) { timerGd.stop(); timerGd = null; d3.select('#gd-vai').text('▶ Scendi lungo la collina'); }
    par = { a: ottimo.a - 95, b: ottimo.b + 95 };
    cammino = [{ ...par }];
    passi = 0;
    disegnaCammino();
  }

  d3.select('#gd-vai').on('click', () => {
    if (timerGd) { timerGd.stop(); timerGd = null; d3.select('#gd-vai').text('▶ Scendi lungo la collina'); return; }
    if (passi > 200) resetGd();
    d3.select('#gd-vai').text('❚❚ Ferma');
    timerGd = d3.interval(() => {
      passoGd();
      if (passi > 200) { timerGd.stop(); timerGd = null; d3.select('#gd-vai').text('▶ Ricomincia'); }
    }, 60);
  });
  d3.select('#gd-passo').on('click', passoGd);
  d3.select('#gd-reset').on('click', resetGd);

  /* ═════════════ comandi della tappa ═════════════ */

  /** In aula «grado 7» non dice niente a nessuno: si descrive la forma, e il
   *  termine tecnico resta per la modalità completa. */
  function descriviComplessita(g) {
    const forma = g === 1 ? 'una retta'
      : g === 2 ? 'una curva semplice'
      : g <= 4 ? 'una curva morbida'
      : g <= 7 ? 'una curva che si piega molto'
      : 'una curva liberissima';
    return `${forma} — ${g + 1} manopole <span class="tecnico">(grado ${g})</span>`;
  }

  d3.select('#reg-grado-out').html(descriviComplessita(1));
  d3.select('#reg-grado').on('input', function () {
    grado = +this.value;
    d3.select('#reg-grado-out').html(descriviComplessita(grado));
    aggiorna();
  });
  d3.select('#reg-errori').on('change', function () { mostraErrori = this.checked; aggiorna(); });
  d3.select('#reg-verifica').on('change', function () { conVerifica = this.checked; aggiorna(); });
  d3.select('#reg-reset').on('click', () => {
    punti = DATI_INIZIALI.map(([x, y], i) => ({ x, y, id: i }));
    prossimoId = punti.length;
    aggiorna();
    resetGd();
  });

  aggiorna();
  resetGd();
});

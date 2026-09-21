/* ═══════════════════════════════════════════════════════════════════════
   Tappa 0 — animazione di apertura: una curva che "scende" verso i punti.
   È una vera discesa del gradiente sui coefficienti di un polinomio di
   grado 3 scritto nella base normalizzata in [−1, 1].
   ═══════════════════════════════════════════════════════════════════════ */

LEZIONE.registra('copertina', function () {
  const L = LEZIONE, C = L.colori;
  const W = 900, H = 340;
  const GRADO = 3, PASSI = 320, PASSO_LR = 0.35;

  let punti = [], coeff = [], iter = 0, timer = null;

  const t = L.tela('#intro-animazione', W, H, { t: 20, d: 24, b: 40, s: 48 });
  const x = d3.scaleLinear().domain([0, 10]).range([0, t.w]);
  const y = d3.scaleLinear().domain([-1.6, 1.6]).range([t.h, 0]);

  t.g.append('g').attr('class', 'asse').attr('transform', `translate(0,${t.h})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(() => ''));
  t.g.append('g').attr('class', 'asse')
    .call(d3.axisLeft(y).ticks(5).tickFormat(() => ''));

  const linea = t.g.append('path')
    .attr('fill', 'none').attr('stroke', C.modello).attr('stroke-width', 3)
    .attr('stroke-linecap', 'round');
  const gruppoPunti = t.g.append('g');

  const generatore = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveCatmullRom);

  /* ── modello: p(x) = Σ c_k · u^k,  u = x normalizzata in [−1, 1] ─────── */
  const u = xv => xv / 5 - 1;
  const base = xv => { const b = [], t0 = u(xv); let v = 1; for (let k = 0; k <= GRADO; k++) { b.push(v); v *= t0; } return b; };
  const valuta = (c, xv) => base(xv).reduce((s, b, k) => s + c[k] * b, 0);

  function nuoviPunti() {
    const rnd = L.casuale(Date.now() & 0xffff);
    const fase = rnd() * 6, amp = 0.7 + rnd() * 0.5;
    punti = d3.range(24)
      .map(i => 0.2 + 9.6 * (i + 0.4 * rnd()) / 23)
      .map(xv => [xv, amp * Math.sin(xv / 1.7 + fase) + (rnd() - 0.5) * 0.28]);
    coeff = new Array(GRADO + 1).fill(0).map(() => (rnd() - 0.5) * 2.4);
    iter = 0;
    disegna();
  }

  function unPasso() {
    const grad = new Array(GRADO + 1).fill(0);
    for (const [xv, yv] of punti) {
      const b = base(xv);
      const err = b.reduce((s, bk, k) => s + coeff[k] * bk, 0) - yv;
      for (let k = 0; k <= GRADO; k++) grad[k] += 2 * err * b[k] / punti.length;
    }
    for (let k = 0; k <= GRADO; k++) coeff[k] -= PASSO_LR * grad[k];
    iter++;
  }

  function erroreMedio() {
    return Math.sqrt(d3.mean(punti, d => (valuta(coeff, d[0]) - d[1]) ** 2));
  }

  function disegna() {
    gruppoPunti.selectAll('circle').data(punti).join('circle')
      .attr('cx', d => x(d[0])).attr('cy', d => y(d[1])).attr('r', 5)
      .attr('fill', C.dati).attr('stroke', C.superficie).attr('stroke-width', 2);

    const campioni = d3.range(0, 10.01, 0.1).map(xv => [xv, valuta(coeff, xv)]);
    linea.attr('d', generatore(campioni));

    d3.select('#intro-didascalia').html(
      iter === 0
        ? 'La macchina non sa nulla di case, di cifre o di parole: sa solo avvicinarsi ai punti.'
        : `Passo ${iter} — errore medio <strong>${L.num(erroreMedio(), 3)}</strong>. ` +
          (iter >= PASSI ? 'Ecco: ha finito. Ha “imparato” girando 4 manopole.' : 'Sta girando le manopole.')
    );
  }

  function avvia() {
    if (timer) { timer.stop(); timer = null; d3.select('#intro-vai').text('▶ Fai imparare la curva'); return; }
    if (iter >= PASSI) { nuoviPunti(); }
    d3.select('#intro-vai').text('❚❚ Ferma');
    timer = d3.interval(() => {
      for (let i = 0; i < 2; i++) if (iter < PASSI) unPasso();
      disegna();
      if (iter >= PASSI) { timer.stop(); timer = null; d3.select('#intro-vai').text('▶ Ricomincia'); }
    }, 30);
  }

  d3.select('#intro-vai').on('click', avvia);
  d3.select('#intro-nuovi').on('click', () => {
    if (timer) { timer.stop(); timer = null; }
    d3.select('#intro-vai').text('▶ Fai imparare la curva');
    nuoviPunti();
  });

  nuoviPunti();
});

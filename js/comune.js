/* ═══════════════════════════════════════════════════════════════════════
   comune.js — strumenti condivisi da tutte le tappe.
   Niente moduli ES: la lezione deve funzionare anche aprendo index.html
   con un doppio clic, senza server e senza rete.
   ═══════════════════════════════════════════════════════════════════════ */

window.LEZIONE = (function () {

  const colori = {
    dati:      '#15140f',
    modello:   '#2a78d6',
    errore:    '#eb6834',
    verifica:  '#1baf7a',
    lingua:    '#4a3aa7',
    rosso:     '#c0392b',
    bordo:     '#ddd8cd',
    inchiostro2: '#4f4d45',
    inchiostro3: '#7a776c',
    superficie: '#ffffff',
    superficie2: '#f3f1eb',
    bluRampa:  ['#ffffff', '#cde2fb', '#86b6ef', '#3987e5', '#1c5cab', '#0d366b']
  };

  /* ── numeri all'italiana ─────────────────────────────────────────────── */

  function num(x, decimali = 2) {
    if (!isFinite(x)) return '—';
    return x.toFixed(decimali).replace('.', ',');
  }

  function perc(x, decimali = 0) {
    return num(100 * x, decimali) + '%';
  }

  /* ── algebra lineare minima (sistemi piccoli, fino a ~60 incognite) ──── */

  /** Risolve A·x = b con eliminazione di Gauss e pivot parziale.
   *  A viene modificata sul posto. Restituisce null se singolare. */
  function risolviSistema(A, b) {
    const n = b.length;
    const M = A.map((riga, i) => riga.slice().concat(b[i]));
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      if (Math.abs(M[piv][c]) < 1e-12) return null;
      [M[c], M[piv]] = [M[piv], M[c]];
      for (let r = 0; r < n; r++) {
        if (r === c) continue;
        const f = M[r][c] / M[c][c];
        if (f === 0) continue;
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    return M.map((riga, i) => riga[n] / riga[i]);
  }

  /** Minimi quadrati regolarizzati (ridge):  min ‖H·a − y‖² + λ‖a‖².
   *  H è la matrice di progetto (righe = esempi, colonne = funzioni di base).
   *  λ > 0 serve solo a tenere a bada i casi mal condizionati.
   *  Rif.: Hoerl & Kennard, Technometrics 12(1), 1970. */
  function minimiQuadrati(H, y, lambda = 1e-8) {
    const m = H.length, p = H[0].length;
    const A = Array.from({ length: p }, () => new Array(p).fill(0));
    const b = new Array(p).fill(0);
    for (let i = 0; i < p; i++) {
      for (let j = i; j < p; j++) {
        let s = 0;
        for (let k = 0; k < m; k++) s += H[k][i] * H[k][j];
        A[i][j] = A[j][i] = s;
      }
      A[i][i] += lambda;
      let s = 0;
      for (let k = 0; k < m; k++) s += H[k][i] * y[k];
      b[i] = s;
    }
    return risolviSistema(A, b) || new Array(p).fill(0);
  }

  /* ── polinomi ────────────────────────────────────────────────────────── */

  /** Adatta un polinomio di grado `grado` ai punti {x, y}.
   *  Le x vengono normalizzate in [−1, 1] per non rovinare il condizionamento
   *  della matrice di Vandermonde. Restituisce una funzione pronta all'uso. */
  function adattaPolinomio(punti, grado, dominio, lambda = 1e-7) {
    const [x0, x1] = dominio;
    const norm = x => 2 * (x - x0) / (x1 - x0) - 1;
    if (punti.length === 0) return { f: () => 0, coeff: [] };
    const gradoEff = Math.min(grado, Math.max(1, punti.length - 1));
    const H = punti.map(p => {
      const riga = [];
      let v = 1, t = norm(p.x);
      for (let k = 0; k <= gradoEff; k++) { riga.push(v); v *= t; }
      return riga;
    });
    const coeff = minimiQuadrati(H, punti.map(p => p.y), lambda);
    const f = x => {
      let v = 1, s = 0, t = norm(x);
      for (let k = 0; k < coeff.length; k++) { s += coeff[k] * v; v *= t; }
      return s;
    };
    return { f, coeff, gradoEff };
  }

  /** Scarto quadratico medio fra previsione e realtà. */
  function rmse(punti, f) {
    if (!punti.length) return NaN;
    let s = 0;
    for (const p of punti) { const d = p.y - f(p.x); s += d * d; }
    return Math.sqrt(s / punti.length);
  }

  /* ── funzioni di attivazione ─────────────────────────────────────────── */

  const sigmoide = z => 1 / (1 + Math.exp(-z));
  const relu = z => (z > 0 ? z : 0);

  function softmax(v, temperatura = 1) {
    const max = Math.max(...v);
    const e = v.map(x => Math.exp((x - max) / temperatura));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map(x => x / s);
  }

  /* ── generatore casuale riproducibile (mulberry32) ───────────────────── */

  function casuale(seme = 2024) {
    let t = seme >>> 0;
    return function () {
      t += 0x6D2B79F5;
      let x = t;
      x = Math.imul(x ^ (x >>> 15), x | 1);
      x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Estrae un indice secondo le probabilità date. */
  function estrai(prob, rnd = Math.random) {
    let r = rnd(), acc = 0;
    for (let i = 0; i < prob.length; i++) { acc += prob[i]; if (r <= acc) return i; }
    return prob.length - 1;
  }

  /* ── disegno ─────────────────────────────────────────────────────────── */

  /** Crea (o riusa) un SVG responsivo dentro un contenitore.
   *  Restituisce il gruppo interno già traslato dei margini. */
  function tela(selettore, larghezza, altezza, margini = { t: 24, d: 20, b: 42, s: 54 }) {
    const cont = d3.select(selettore);
    cont.selectAll('svg').remove();
    const svg = cont.append('svg')
      .attr('viewBox', `0 0 ${larghezza} ${altezza}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img');
    const g = svg.append('g').attr('transform', `translate(${margini.s},${margini.t})`);
    return {
      svg, g,
      w: larghezza - margini.s - margini.d,
      h: altezza - margini.t - margini.b,
      margini
    };
  }

  /* suggerimento (tooltip) unico per tutta la pagina */
  let _sugg = null;
  function suggerimento() {
    if (!_sugg) {
      _sugg = d3.select('body').append('div').attr('class', 'suggerimento');
    }
    return {
      mostra(html, evento) {
        _sugg.html(html)
          .style('left', (evento.pageX + 14) + 'px')
          .style('top', (evento.pageY - 12) + 'px')
          .style('opacity', 1);
      },
      nascondi() { _sugg.style('opacity', 0); }
    };
  }

  /* ── registro delle tappe ────────────────────────────────────────────── */

  const _tappe = {};
  function registra(id, avvia) {
    if (!_tappe[id]) _tappe[id] = [];
    _tappe[id].push({ avvia, pronta: false });
  }
  function accendi(id) {
    (_tappe[id] || []).forEach(t => {
      if (!t.pronta) { t.pronta = true; t.avvia(); }
    });
  }

  /* Le tappe che animano qualcosa (allenamenti, discese del gradiente)
     registrano qui come fermarsi: lasciare un allenamento acceso in
     sottofondo scalda il portatile e rallenta le tappe successive. */
  const _uscite = {};
  function allUscita(id, ferma) {
    if (!_uscite[id]) _uscite[id] = [];
    _uscite[id].push(ferma);
  }
  function spegni(id) {
    (_uscite[id] || []).forEach(f => f());
  }

  return {
    colori, num, perc, risolviSistema, minimiQuadrati, adattaPolinomio, rmse,
    sigmoide, relu, softmax, casuale, estrai, tela, suggerimento,
    registra, accendi, allUscita, spegni
  };
})();

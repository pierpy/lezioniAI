/* ═══════════════════════════════════════════════════════════════════════
   presentazione.js — la stessa pagina, in forma di diapositive.

   Nessun contenuto duplicato: ogni pannello diventa una diapositiva e le
   dimostrazioni restano vive e cliccabili. Ogni tappa è preceduta da una
   diapositiva di titolo, e in basso scorre la nota per chi parla
   (l'attributo data-nota di ciascun pannello).

   Tasti:  →  spazio  pagina giù   avanti
           ←  pagina su            indietro
           N                       note sì/no
           Esc                     esci
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  const barra = document.getElementById('presentazione-barra');
  const titolo = document.getElementById('presentazione-titolo');
  const banda = document.getElementById('presentazione-note-banda');
  const riempi = document.getElementById('presentazione-progresso-riempi');

  let diapositive = [], corrente = 0, attiva = false, conNote = true;

  /* ── costruzione dell'elenco: titolo di tappa + pannelli visibili ───── */

  function costruisci() {
    diapositive = [];
    const essenziale = document.body.classList.contains('essenziale');
    document.querySelectorAll('.tappa').forEach((sezione, i) => {
      const h1 = sezione.querySelector(':scope > h1');
      const sommario = sezione.querySelector(':scope > .sommario');
      diapositive.push({
        tipo: 'titolo',
        tappa: sezione.id,
        numero: i === 0 ? 'Apertura' : `Tappa ${i}`,
        testo: h1 ? h1.textContent.replace(/^Tappa \d+\s*/, '').trim() : sezione.id,
        sotto: sommario ? sommario.textContent.trim() : ''
      });
      sezione.querySelectorAll(':scope > .pannello, :scope > .lavagna').forEach(el => {
        if (essenziale && el.hasAttribute('data-avanzato')) return;
        diapositive.push({ tipo: 'pannello', tappa: sezione.id, el });
      });
    });
  }

  /* ── mostrare una diapositiva ───────────────────────────────────────── */

  function mostra(i) {
    corrente = Math.max(0, Math.min(diapositive.length - 1, i));
    const d = diapositive[corrente];

    LEZIONE.vaiATappa(d.tappa);          // accende la tappa se è la prima volta

    document.querySelectorAll('.slide-attiva').forEach(el => {
      el.classList.remove('slide-attiva');
      el.style.transform = '';
      el.style.overflow = '';
    });
    if (d.tipo === 'pannello') {
      d.el.classList.add('slide-attiva');
      d.el.scrollTop = 0;
      adattaAllaPagina(d.el);
      titolo.hidden = true;
      banda.textContent = d.el.dataset.nota || '';
    } else {
      titolo.hidden = false;
      titolo.querySelector('.numero').textContent = d.numero;
      titolo.querySelector('h2').textContent = d.testo;
      titolo.querySelector('p').textContent = d.sotto;
      banda.textContent = 'Diapositiva di titolo: dite il titolo e passate avanti.';
    }

    const indiceTappa = document.querySelectorAll('.tappa').length;
    document.getElementById('presentazione-tappa').textContent =
      diapositive[corrente].numero ||
      (diapositive.find(x => x.tappa === d.tappa && x.tipo === 'titolo') || {}).numero || '';
    document.getElementById('presentazione-contatore').textContent =
      `${corrente + 1} / ${diapositive.length}`;
    riempi.style.width = ((corrente + 1) / diapositive.length * 100) + '%';
    banda.hidden = !conNote || !banda.textContent;
    document.body.classList.toggle('con-note', !banda.hidden);
    void indiceTappa;
  }

  /** Rimpicciolisce la diapositiva quanto basta perché ci stia tutta:
   *  in una presentazione non si scorre. Sotto il 55% si rinuncia e si
   *  lascia scorrere, altrimenti diventerebbe illeggibile. */
  function adattaAllaPagina(el) {
    el.style.transform = '';
    el.style.overflow = 'auto';
    requestAnimationFrame(() => {
      const disponibile = el.clientHeight;
      const contenuto = el.scrollHeight;
      if (!disponibile || contenuto <= disponibile + 4) return;
      const k = Math.max(0.55, disponibile / contenuto);
      el.style.transformOrigin = 'top center';
      el.style.transform = `scale(${k})`;
      el.style.overflow = (contenuto * k <= disponibile + 4) ? 'hidden' : 'auto';
    });
  }

  const avanti = () => mostra(corrente + 1);
  const indietro = () => mostra(corrente - 1);

  /* ── entrare e uscire ───────────────────────────────────────────────── */

  function entra() {
    costruisci();
    attiva = true;
    document.body.classList.add('presentazione');
    barra.hidden = false;
    /* la partenza è la diapositiva di titolo della tappa in cui si era */
    const idSezione = (document.querySelector('.tappa.attiva') || {}).id;
    const primo = diapositive.findIndex(d => d.tappa === idSezione);
    mostra(primo < 0 ? 0 : primo);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => { /* niente schermo intero: pazienza */ });
    }
  }

  function esci() {
    attiva = false;
    document.body.classList.remove('presentazione', 'con-note');
    barra.hidden = true;
    titolo.hidden = true;
    banda.hidden = true;
    document.querySelectorAll('.slide-attiva').forEach(el => el.classList.remove('slide-attiva'));
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  /* ── comandi ────────────────────────────────────────────────────────── */

  document.getElementById('avvia-presentazione').addEventListener('click', entra);
  document.getElementById('presentazione-avanti').addEventListener('click', avanti);
  document.getElementById('presentazione-indietro').addEventListener('click', indietro);
  document.getElementById('presentazione-esci').addEventListener('click', esci);
  document.getElementById('presentazione-note').addEventListener('click', () => {
    conNote = !conNote;
    mostra(corrente);
  });

  document.addEventListener('keydown', ev => {
    if (!attiva) {
      /* P avvia la presentazione, se non si sta scrivendo in un campo */
      if ((ev.key === 'p' || ev.key === 'P') && !ev.target.matches('input, select, textarea')) entra();
      return;
    }
    if (ev.target.matches('input, select, textarea')) return;
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown' || ev.key === ' ') { avanti(); ev.preventDefault(); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { indietro(); ev.preventDefault(); }
    else if (ev.key === 'Escape') { esci(); }
    else if (ev.key === 'n' || ev.key === 'N') { conNote = !conNote; mostra(corrente); }
    else if (ev.key === 'Home') { mostra(0); }
  }, true);

  /* cambiando livello di dettaglio cambia anche l'elenco delle diapositive */
  document.querySelectorAll('.bottone-modo[data-modo]').forEach(b =>
    b.addEventListener('click', () => {
      if (!attiva) return;
      const prima = diapositive[corrente];
      costruisci();
      const nuovo = diapositive.findIndex(d => d.el === prima.el && d.tipo === prima.tipo);
      mostra(nuovo < 0 ? corrente : nuovo);
    }));

  /* uscendo dallo schermo intero con F11 o Esc del browser */
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && attiva) esci();
  });
})();

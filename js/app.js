/* ═══════════════════════════════════════════════════════════════════════
   app.js — navigazione fra le tappe.
   Ogni tappa viene inizializzata solo la prima volta che la si apre:
   così l'apertura della pagina è immediata anche sul portatile dell'aula.
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  const tappe = Array.from(document.querySelectorAll('.tappa')).map(s => s.id);
  let corrente = 0;

  function vai(id, aggiornaIndirizzo = true) {
    const i = tappe.indexOf(id);
    if (i < 0) return;
    if (tappe[corrente] !== id) LEZIONE.spegni(tappe[corrente]);
    corrente = i;
    document.querySelectorAll('.tappa').forEach(s => s.classList.toggle('attiva', s.id === id));
    document.querySelectorAll('.passo').forEach(b =>
      b.setAttribute('aria-current', b.dataset.vai === id ? 'step' : 'false'));
    document.getElementById('nav-indietro').disabled = (i === 0);
    document.getElementById('nav-avanti').disabled = (i === tappe.length - 1);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    if (aggiornaIndirizzo) history.replaceState(null, '', '#' + id);
    LEZIONE.accendi(id);
  }

  document.querySelectorAll('[data-vai]').forEach(b =>
    b.addEventListener('click', () => vai(b.dataset.vai)));
  document.getElementById('nav-indietro').addEventListener('click', () => vai(tappe[corrente - 1]));
  document.getElementById('nav-avanti').addEventListener('click', () => vai(tappe[corrente + 1]));

  document.addEventListener('keydown', ev => {
    const campo = ev.target.matches('input, select, textarea');
    if (campo || document.body.classList.contains('presentazione')) return;
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { vai(tappe[Math.min(tappe.length - 1, corrente + 1)]); }
    if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { vai(tappe[Math.max(0, corrente - 1)]); }
  });

  /* ── livello di dettaglio: essenziale (predefinito) o completa ─────────
     In aula si parte sempre dall'essenziale: una cosa per schermata, due
     comandi al massimo. «Completa» rimette in vista tutto — la collina
     dell'errore, l'allenamento della Tappa 3, le parole-punti — per chi
     fa domande o per una seconda lezione. */
  function impostaModo(modo, ricorda) {
    document.body.classList.toggle('essenziale', modo !== 'completa');
    document.querySelectorAll('.bottone-modo[data-modo]').forEach(b =>
      b.setAttribute('aria-pressed', b.dataset.modo === modo ? 'true' : 'false'));
    if (ricorda) {
      try { localStorage.setItem('lezione-modo', modo); } catch (e) { /* file:// senza permessi */ }
    }
  }

  document.querySelectorAll('.bottone-modo[data-modo]').forEach(b =>
    b.addEventListener('click', () => impostaModo(b.dataset.modo, true)));

  let modoIniziale = 'essenziale';
  try {
    modoIniziale = localStorage.getItem('lezione-modo') === 'completa' ? 'completa' : 'essenziale';
  } catch (e) { /* ignora */ }
  impostaModo(modoIniziale, false);

  LEZIONE.vaiATappa = id => vai(id);

  vai((location.hash || '').replace('#', '') || tappe[0], false);
})();

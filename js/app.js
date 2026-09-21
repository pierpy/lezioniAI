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
    if (campo) return;
    if (ev.key === 'ArrowRight' || ev.key === 'PageDown') { vai(tappe[Math.min(tappe.length - 1, corrente + 1)]); }
    if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { vai(tappe[Math.max(0, corrente - 1)]); }
  });

  vai((location.hash || '').replace('#', '') || tappe[0], false);
})();

/* ═══════════════════════════════════════════════════════════════════════
   Testi di studio per la Tappa 4.
   Sono volutamente brevi e ripetitivi: con poche centinaia di parole il
   modello a n-grammi produce frasi riconoscibili, e si vede benissimo
   che cosa vuol dire "imparare dalle frequenze".
   Testi originali scritti per questa lezione.
   ═══════════════════════════════════════════════════════════════════════ */

window.CORPORA = [
  {
    nome: 'Bollettino del tempo',
    testo: `
Oggi il cielo è sereno sulla costa e poco nuvoloso sulle valli interne.
Domani il cielo sarà nuvoloso sulle valli interne e sereno sulla costa.
La temperatura massima di oggi è di ventidue gradi sulla costa e di diciotto gradi sulle valli interne.
La temperatura minima della notte scende a undici gradi nelle zone interne.
Il vento soffia debole da nord sulla costa e moderato da ovest sulle montagne.
Il mare è poco mosso al mattino e mosso nel pomeriggio.
Nel pomeriggio sono possibili rovesci sparsi sulle montagne, in attenuazione dalla sera.
Dalla sera il tempo migliora su tutta la regione e le nuvole si diradano.
Domani mattina nebbia nelle valli interne, in dissolvimento nel corso della mattinata.
Le piogge della notte hanno lasciato le strade bagnate nelle zone interne.
La settimana prossima il tempo resta stabile su tutta la regione, con cielo sereno e temperatura in lieve aumento.
Attenzione ai temporali del pomeriggio sulle montagne, come spesso accade in questa stagione.
Il sole tramonta alle venti e undici minuti, il mare resta calmo per tutta la sera.
Sulla costa la temperatura non scende sotto i quindici gradi e il vento cala nella notte.
Nelle valli interne la nebbia si forma al mattino presto e si dissolve verso le dieci.
`
  },
  {
    nome: 'La cucina di casa',
    testo: `
Per preparare la pasta al pomodoro mettete l'acqua sul fuoco e aspettate che bolla.
Quando l'acqua bolle aggiungete il sale grosso e buttate la pasta.
In una padella scaldate due cucchiai di olio di oliva con uno spicchio d'aglio.
Aggiungete i pomodori pelati e lasciate cuocere a fuoco basso per venti minuti.
Aggiustate di sale e aggiungete qualche foglia di basilico fresco alla fine.
Scolate la pasta al dente e saltatela in padella con il sugo per un minuto.
Servite ben calda con una spolverata di formaggio grattugiato.
Per preparare il minestrone tagliate le verdure a pezzi piccoli e mettetele in una pentola.
Coprite le verdure con acqua fredda, aggiungete un filo di olio e lasciate cuocere a fuoco basso per un'ora.
Aggiustate di sale alla fine della cottura e servite ben caldo con il pane.
Per preparare la frittata sbattete quattro uova in una scodella con un pizzico di sale.
Scaldate una padella con un filo di olio e versate le uova.
Lasciate cuocere a fuoco basso per cinque minuti, poi girate la frittata e cuocete dall'altra parte.
La cucina di casa non ha bisogno di fretta: ha bisogno di fuoco basso e di pazienza.
Il pane raffermo non si butta: si mette nel minestrone oppure si bagna con un filo di olio.
`
  },
  {
    nome: 'Proverbi e modi di dire',
    testo: `
Chi va piano va sano e va lontano.
Chi va con lo zoppo impara a zoppicare.
Chi dorme non piglia pesci.
Chi semina vento raccoglie tempesta.
Chi trova un amico trova un tesoro.
Rosso di sera bel tempo si spera, rosso di mattina la pioggia si avvicina.
Il mattino ha l'oro in bocca.
L'ospite è come il pesce: dopo tre giorni puzza.
Non è tutto oro quel che luccica.
Non rimandare a domani quel che puoi fare oggi.
A caval donato non si guarda in bocca.
Tanto va la gatta al lardo che ci lascia lo zampino.
Meglio un uovo oggi che una gallina domani.
Chi ha tempo non aspetti tempo.
Tra il dire e il fare c'è di mezzo il mare.
Una rondine non fa primavera.
Il lupo perde il pelo ma non il vizio.
Ride bene chi ride ultimo.
Paese che vai usanza che trovi.
Chi fa da sé fa per tre.
`
  },
  {
    nome: 'Cronaca di paese',
    testo: `
La festa del paese comincia sabato mattina in piazza con la banda musicale.
La banda musicale suona in piazza sabato mattina e domenica pomeriggio.
Il sindaco ha annunciato che la piazza sarà chiusa al traffico per tutta la giornata di sabato.
I ragazzi della scuola hanno preparato un piccolo spettacolo per la domenica pomeriggio.
Le signore del quartiere hanno preparato le torte per la festa del paese.
Alla fine della giornata il sindaco ha ringraziato tutti quelli che hanno lavorato per la festa.
La biblioteca resta aperta anche sabato mattina, con una mostra di fotografie del paese di cinquant'anni fa.
Le fotografie mostrano la piazza di cinquant'anni fa, con la banda musicale e i ragazzi della scuola.
Molti hanno riconosciuto i parenti nelle fotografie della mostra in biblioteca.
Domenica pomeriggio in piazza ci sarà il ballo, come tutti gli anni.
Il parroco ha chiesto ai ragazzi della scuola di aiutare le signore del quartiere a sistemare le sedie.
La festa del paese finisce domenica sera con i fuochi d'artificio sul fiume.
Tutti gli anni i fuochi d'artificio sul fiume chiudono la festa del paese.
`
  }
];

# L'intelligenza artificiale spiegata con una curva

Lezione interattiva in cinque tappe per l'Università della Terza Età.
Il filo conduttore è uno solo: **l'intelligenza artificiale è una regressione
con moltissime manopole**. Lo si mostra tre volte, sempre più in grande —
una retta, una rete che legge le cifre scritte a mano, un modello che scrive.

Tutto gira nel browser, **senza rete e senza installare niente**: si apre
`index.html` con un doppio clic e la lezione parte.

## Le cinque tappe

| | Tappa | Che cosa si tocca con mano |
|---|---|---|
| 0 | Apertura | Tre risposte prima di ogni formula. **Perché serve**: quattro cifre «sette» vere, sempre diverse, che nessuna regola scritta riesce a descrivere (pulsante «altri quattro»). **Che cos'è**: una scatola con due manopole che *il pubblico gira a mano* per far azzeccare alla macchina cinque prezzi, con il termometro «acqua–fuochino–fuoco» al posto della funzione di costo, e il confronto finale con la discesa automatica. **Quanto è grande**: la riga a potenze di dieci con le manopole delle tre macchine della lezione (2 → 50.890 → mille miliardi). Poi una curva con **quattro manopole visibili**: si vedono gli errori misurati, la freccia che dice da che parte girare ogni manopola, le lancette che si spostano e l'errore che scende. Modalità «un passo alla volta» che racconta le quattro fasi, e cursore del passo di apprendimento (troppo grande = la curva schizza via). |
| 1 | La retta che indovina | Regressione polinomiale interattiva: si aggiungono punti col mouse, si alza la complessità, si nascondono dati per verificare. Sovradattamento e discesa del gradiente sulla «collina dell'errore» (curve di livello). |
| 2 | Con o senza risposte giuste | Un gioco per smistare sei lavori fra supervisionato e non supervisionato; **la stessa nuvola di punti (altezze di padri e figli) con tre rette diverse** — due supervisionate, una per ogni «risposta» possibile, e una non supervisionata che minimizza le distanze perpendicolari (Pearson 1901); le **k-medie animate** che trovano i gruppi di case senza che nessuno glieli abbia detti; e un punto sballato da trascinare per vedere che **la funzione di costo decide la risposta** (quadratico contro assoluto). |
| 3 | Da una retta a qualsiasi curva | Somma di sigmoidi: da 1 a 40 neuroni, con i singoli pezzetti in vista. Si può disegnare la curva obiettivo a mano libera. Due modi di trovare le manopole: **la formula** (minimi quadrati, istantanea) oppure **a tentoni come una rete vera** — allenamento dal vivo di pesi, pendenze e centri con Adam, curva dell'errore inclusa. Teorema di approssimazione universale. |
| 4 | Le cifre scritte a mano | Rete 784–64–10 **addestrata davvero** su 8.000 cifre MNIST (96,5 % su cifre mai viste). Si disegna una cifra, si vedono i 64 neuroni accendersi e le maschere che hanno imparato. In fondo, il **laboratorio**: una seconda rete 784–24–10 parte da zero e si allena **dal vivo nel browser** su 1.200 cifre vere — le maschere emergono dal rumore, le risposte esatte salgono, e la previsione sulla cifra disegnata dal pubblico cambia mentre studia. |
| 5 | La macchina che scrive | Tokenizzazione; modello a n-grammi costruito dal vivo sul testo scelto, con temperatura e tabella delle probabilità che **si riempie sotto gli occhi** mentre il modello legge il testo, parola per parola; piccolo modello neurale (Bengio 2003) allenato nel browser, con le parole che diventano punti; schema dell'attenzione. |
| 6 | Limiti e domande | La stessa rete della Tappa 4 chiamata a giudicare uno scarabocchio: risponde «0 al 99 %». Da lì, le allucinazioni. |

## Due livelli di dettaglio

In alto a destra c'è l'interruttore **Essenziale / Completa**.

- **Essenziale** (predefinito, ed è il livello con cui si tiene la lezione): una cosa per
  schermata, al massimo due comandi, niente gergo. Restano nascosti la collina dell'errore,
  l'allenamento della Tappa 3, i 64 neuroni nascosti, la curva del laboratorio e le parole-punti.
- **Completa**: rimette in vista tutto, approfondimenti e termini tecnici fra parentesi
  («sovradattamento», «temperatura», «grado 7»).

Nessuno dei due livelli cambia i conti, i numeri o le citazioni: «essenziale» mostra
**meno cose per volta**, non cose più semplici. La scelta resta memorizzata nel browser.

## Come si usa

```bash
# il modo più semplice: doppio clic su index.html
# (oppure, per stare tranquilli con qualsiasi browser)
python3 -m http.server 8000     # poi http://localhost:8000
```

- Tasti `←` e `→` per cambiare tappa, oppure la barra in alto.
- Interruttore **Essenziale / Completa** in alto a destra (si parte sempre da «essenziale»).
- `F11` per lo schermo intero, `Ctrl` `+` per ingrandire il testo (la pagina regge il 150 %).
- Niente connessione internet richiesta: D3 (v7.9.0) e i pesi della rete sono nel repository.

Prima di andare in aula, leggete **[`docs/guida-lezione.md`](docs/guida-lezione.md)**:
scaletta con i tempi, che cosa dire e che cosa cliccare tappa per tappa, le domande
che arrivano sempre con le risposte pronte, e gli errori da non fare.
Tutte le fonti sono in **[`docs/bibliografia.md`](docs/bibliografia.md)**.

## Gli stessi conti in MATLAB

La cartella `matlab/` contiene la versione MATLAB (provata anche con Octave 9)
di tutto ciò che accade nella pagina — utile per preparare la lezione, per
controllare i numeri o per mostrare il codice a chi lo chiede:

| File | Contenuto |
|---|---|
| `tappa1_regressione.m` | Minimi quadrati, curva errore-contro-complessità, discesa del gradiente con la mappa dell'errore. |
| `tappa3_approssimatore.m` | Somma di sigmoidi, errore contro numero di neuroni (scala logaritmica). |
| `tappa4_rete_mnist.m` | Carica i pesi della pagina web, ricalcola l'accuratezza (96,1 % sul sottoinsieme incluso), matrice di confusione, maschere dei 64 neuroni. |
| `tappa4b_allena_rete.m` | Retropropagazione scritta a mano: allena la rete da zero su 3.000 cifre. |
| `tappa5_modello_linguistico.m` | Modello a n-grammi con temperatura e tabella dei bigrammi. |

```matlab
cd matlab
tappa1_regressione
tappa4_rete_mnist
```

## Com'è fatto

```
index.html              una pagina sola, cinque sezioni
css/stile.css           testo grande e contrasto alto, pensato per il proiettore
js/comune.js            minimi quadrati, softmax, sigmoide, aiuti per i grafici
js/tappa0…tappa6        una tappa per file, ognuna si accende alla prima apertura
js/tappa4b-laboratorio  la rete che si allena dal vivo nel browser
data/mnist-mlp.js       i 50.890 pesi della rete (JSON dentro una variabile globale)
data/mnist-esempi.js    40 cifre vere dell'archivio MNIST
data/mnist-allenamento  1.600 cifre per l'allenamento dal vivo (due PNG in base64)
data/corpora.js         quattro testi italiani scritti per la lezione
data/mnist-sottoinsieme.mat  3.000 + 1.000 cifre per gli script MATLAB
vendor/d3.v7.min.js     D3 7.9.0, in locale
tools/                  come sono stati preparati i dati (vedi sotto)
```

Scelte tecniche, per chi volesse metterci le mani:

- **Niente moduli ES e niente `fetch`**: i dati sono file `.js` che definiscono una
  variabile globale. È l'unico modo perché la pagina funzioni anche aperta da `file://`,
  cioè con un doppio clic sul portatile dell'aula.
- **Le 1.600 cifre dell'allenamento dal vivo** viaggiano come due PNG in base64 (una cifra
  per riquadro 28×28): il PNG comprime MNIST circa quattro volte meglio del base64 dei byte
  grezzi, e il browser lo decodifica da solo anche da `file://`.
- **Gli allenamenti si fermano da soli** quando si cambia tappa, e si adattano alla velocità
  del portatile: puntano a un numero di lotti per fotogramma che tenga l'animazione fluida.
- **Colori** presi da una tavolozza verificata per il daltonismo (blu = modello,
  arancio = errore, verde = verifica, viola = linguaggio); rosso/blu divergente per i pesi.
  Ogni serie ha sempre anche un'etichetta scritta: il colore non è mai l'unica informazione.
- **Modalità chiara soltanto**: in aula si proietta su schermo bianco.

## Rigenerare i dati

```bash
npm install mnist                          # 10.000 cifre MNIST vere
node tools/export-mnist.js /tmp/mnist      # → file binari uint8
pip install numpy
python3 tools/train-mlp.py /tmp/mnist data/mnist-mlp.js

pip install pillow                         # per l'allenamento dal vivo (Tappa 4)
python3 tools/export-allenamento.py /tmp/mnist data/mnist-allenamento.js
```

L'allenamento dura una ventina di secondi e, con il seme 42, è **riproducibile
bit per bit**: 99,9 % sugli esempi di studio, 96,5 % sulle cifre mai viste.

## Licenza e crediti

- Testi, codice e corpora italiani: scritti per questa lezione, riusabili liberamente
  citando la fonte.
- [D3.js](https://d3js.org) — ISC License, © Mike Bostock.
- Archivio MNIST — Y. LeCun, C. Cortes, C. Burges; qui distribuito attraverso il
  pacchetto npm [`mnist`](https://www.npmjs.com/package/mnist).

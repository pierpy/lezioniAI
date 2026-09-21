# Guida per chi tiene la lezione

Università della Terza Età — *L'intelligenza artificiale spiegata con una curva*

---

## L'idea che tiene insieme tutto

Una sola frase, ripetuta cinque volte in cinque contesti diversi:

> **Un programma di intelligenza artificiale è una funzione con molte manopole.
> Gli mostriamo esempi di «domanda → risposta giusta» e lui gira le manopole
> finché non sbaglia quasi più.**

Tutto il resto — reti, strati, attenzione, miliardi di parametri — è *quanto*,
non *cosa*. Se alla fine il pubblico ricorda solo questa frase, la lezione ha funzionato.

Le tre parole da far entrare nel lessico, in quest'ordine: **manopole** (parametri),
**errore** (funzione costo), **imparare a memoria** (sovradattamento).
Non servono altri termini tecnici; se ne serve uno, si introduce dopo aver mostrato la cosa,
mai prima.

## Scaletta

| Tempo | Tappa | Cosa succede sullo schermo |
|---|---|---|
| 0–12 min | **0. Apertura** | La frase-chiave. Poi «Un passo alla volta»: si vedono gli errori, le frecce sulle manopole e le manopole che girano. Infine «Fai imparare la curva» a velocità piena. |
| 12–27 min | **1. La retta che indovina** | Prezzi delle case. Il pubblico detta dove mettere i punti. Cursore della complessità, spunta «nascondi 1/3 dei dati». La collina dell'errore. |
| 27–40 min | **2. Da una retta a qualsiasi curva** | Cursore dei neuroni da 1 a 40, con «mostra i singoli pezzetti». Poi si passa da «la formula» a «le cerca a tentoni» e la si guarda allenarsi. Si finisce disegnando una curva col mouse e facendola copiare alla rete. |
| 40–62 min | **3. Le cifre scritte a mano** | Qualcuno del pubblico scrive una cifra. Si guardano i neuroni che si accendono e le maschere imparate. Poi il laboratorio: una rete che parte da zero e impara dal vivo, in venti secondi. |
| 62–80 min | **4. La macchina che scrive** | Tokenizzazione, generazione parola per parola, cursore della memoria e della fantasia, la tabella che si riempie mentre legge, allenamento dal vivo della rete linguistica. |
| 80–90 min | **5. Limiti e domande** | Lo scarabocchio che la rete chiama «zero al 99 %». Le quattro cose da ricordare. Domande. |

### Il filo dell'apprendimento

La stessa scena — *misuro l'errore, calcolo da che parte girare le manopole, le giro, ricomincio* —
torna **cinque volte**, ed è la spina dorsale della lezione. Nominatela ogni volta:

| Dove | Che cosa impara | Quante manopole |
|---|---|---|
| Apertura | una curva su 24 punti | 4 |
| Tappa 1, la collina | una retta sui prezzi delle case | 2 |
| Tappa 2, «a tentoni» | pesi, pendenze e centri dei neuroni | fino a 121 |
| Tappa 3, il laboratorio | a leggere le cifre, da zero, dal vivo | 19.090 |
| Tappa 4, le parole-punti | dove mettere ogni parola nel piano | qualche migliaio |

**Se avete solo 60 minuti**: tagliate la Tappa 2 (bastano due minuti a voce: «più pezzetti,
più dettagli — ed è un teorema del 1989») e la parte di allenamento dal vivo della Tappa 4.
Non tagliate mai la verifica su dati mai visti della Tappa 1: è il concetto più prezioso di tutta l'ora.

## Che cosa fare, tappa per tappa

### Tappa 0 — Apertura (12 min)

Aprite con una domanda al pubblico: *«Secondo voi, quando il telefono riconosce una faccia,
che cosa sta facendo?»* Raccogliete due o tre risposte, non correggetele.

Poi la lavagna nera con la frase-chiave, e scendete al pannello delle manopole.
**Non premete subito «Fai imparare la curva»: quella è la fine, non l'inizio.**
L'ordine giusto è questo.

1. **Presentate le quattro manopole.** Sono a destra, con la lancetta e il numero sotto.
   *«Questa curva è governata da quattro numeri. Altezza, inclinazione, curvatura, ondulazione.
   Adesso sono messi a caso, ed è per questo che la curva passa lontano dai punti.»*
   Se qualcuno chiede perché proprio quattro: perché questa curva è semplice; la rete della Tappa 3
   ne ha cinquantamila, ma la storia è identica.
2. **Premete «Un passo alla volta»** e lasciate parlare lo schermo: la ricetta in quattro punti
   si illumina una riga per volta.
   - *fase 1* — si accendono i segmenti arancioni: **quanto sbaglia**, punto per punto.
     *«Questo è l'unico giudizio che la macchina riceve: un numero che dice quanto è lontana.»*
   - *fase 2* — compaiono le frecce sopra le manopole: **da che parte conviene girarle**.
     *«Non lo indovina: lo calcola. Per ogni manopola si chiede se, girandola a destra,
     l'errore salirebbe o scenderebbe. La freccia più marcata è la manopola che conviene toccare di più.»*
   - *fase 3* — le lancette si spostano e la curva si muove: **le gira di un pochino**.
     Fate notare che l'errore in basso a destra è sceso appena appena.
   - *fase 4* — *«e adesso ricomincia da capo. Trecento volte.»*
3. **Ripetete «Un passo alla volta» due o tre volte.** Ci vogliono venti secondi e servono:
   alla terza ripetizione il pubblico anticipa da solo quello che sta per succedere.
4. **Ora sì: «Fai imparare la curva».** La curva scende sui punti e la curva dell'errore precipita.
   > «Guardate: non sta capendo niente. Sta solo girando quattro manopole per avvicinarsi ai punti.
   > Quando avrà finito saprà dirmi un valore anche dove il punto non c'è.
   > Questo, e nient'altro, è quello che fa un'intelligenza artificiale.»
5. **Il colpo di scena, se avete due minuti.** Portate il cursore «Di quanto le giro ogni volta»
   su *un passo troppo grande* e premete «Nuovi punti», poi «Fai imparare la curva»:
   la curva schizza fuori dal grafico e l'errore esplode.
   *«Anche il come si gira conta. Troppo piano non arriva mai, troppo forte manda tutto a monte:
   chi fa questo mestiere passa metà del tempo a regolare questa cosa qui.»*
   Rimettete il cursore al centro prima di proseguire.

Chi vorrà il nome tecnico lo avrà nella Tappa 1 («discesa del gradiente») e vedrà lo stesso
procedimento dall'alto, come una collina. Qui non serve: qui si guardano le manopole.

### Tappa 1 — La retta che indovina (17 min)

L'esempio delle case funziona perché tutti hanno un'opinione sul prezzo di un appartamento.

1. **Fate dettare un punto al pubblico.** «Un bilocale di 60 metri quadri, quanto costa dalle vostre parti?»
   Cliccate dove vi dicono. Il punto entra nel calcolo immediatamente: questo li convince che non è un video.
2. **Trascinate un punto lontano da tutti.** La retta si sposta: «un dato sbagliato sposta la regola.
   Tenetelo a mente per quando parleremo dei dati con cui si allenano i modelli veri».
3. **Alzate il cursore della complessità fino a 10.** L'errore scende a quasi zero:
   *«sembra bravissima, no?»* — pausa — *«adesso però verifichiamo».*
4. **Spuntate «nascondi 1/3 dei dati».** I rombi verdi sono case che il modello non ha mai visto.
   L'errore in verifica schizza. Questo è il momento più importante dell'ora: lasciatelo respirare.
   *«Non ha imparato il mercato immobiliare. Ha imparato a memoria quindici case.»*
5. **Tornate a grado 2 o 3.** I due errori si riavvicinano. Regola d'oro pronunciata ad alta voce:
   *«il modello giusto non è quello che sbaglia meno su quello che ha già visto».*
6. **La collina dell'errore.** Premete «Scendi lungo la collina».
   Collegatela esplicitamente all'apertura: *«le frecce sulle manopole che avete visto all'inizio
   sono la pendenza di questa collina»*. Metafora:
   *«è come scendere una collina nella nebbia: si guarda solo la pendenza sotto i piedi e si fa un passo in giù.
   Con due manopole è una collina. Con cento miliardi è la stessa cosa, ma non possiamo disegnarla.»*

### Tappa 2 — Qualsiasi curva (10 min)

Il concetto da consegnare: *un neurone è un interruttore morbido; sommandone abbastanza si ottiene qualsiasi forma.*

- Partite da **1 neurone** (la rete può solo fare uno scalino), poi 3, poi 8, poi 40.
- Accendete **«mostra i singoli pezzetti»**: si vede la somma prendere forma. È la diapositiva più bella della lezione.
- Scegliete **«il battito cardiaco»** e restate a 8 neuroni: la rete ignora i picchi.
  Salite a 40: i picchi compaiono. *«Ecco perché i modelli sono diventati grandi: i dettagli costano manopole.»*
- **Il momento chiave della tappa**: cambiate «Come trova le manopole» da *la scorciatoia* a
  *le cerca a tentoni* e premete «Allena». La curva parte da manopole casuali e si avvicina
  da sola, mentre l'errore scende.
  *«Fin qui avevamo barato: per un modello così semplice esiste una formula che dà la risposta
  in un colpo solo. Una rete vera quella formula non ce l'ha, e deve fare così: a tentoni,
  guidata dall'errore. Come nell'apertura, ma con cento manopole invece di quattro.»*
  Fate notare i **pallini arancioni sotto l'asse**: sono i centri dei neuroni, e con il «battito
  cardiaco» si spostano da soli dove la curva ha i picchi. *«Nessuno gliel'ha detto: hanno
  scoperto da soli dove serve dettaglio.»*
  Se dopo qualche secondo l'errore non scende più, è un regalo: premete «Ricomincia da manopole
  a caso» e dite che *esiste* una soluzione ma non è detto che la si trovi — è la differenza
  fra il teorema e la pratica.
- Chiudete con **«disegnatela voi col mouse»**: fate disegnare una curva a una persona del pubblico
  e fatela copiare alla rete. Nessuno dimentica di aver fatto imparare qualcosa a una macchina.
- La citazione da dire a voce: *«che questo funzioni sempre è un teorema del 1989, di George Cybenko.
  Non è un'opinione degli informatici.»*

### Tappa 3 — Le cifre scritte a mano (20 min)

- **Fate scrivere la cifra a qualcuno del pubblico**, non fatelo voi. Con il dito su un tablet, se c'è.
- Mostrate il riquadro «quello che vede la rete»: *«non vede un sette. Vede 784 numeri fra 0 e 1.»*
- Passate il mouse sui neuroni nascosti: compaiono le maschere. *«Questo neurone si accende se trova
  inchiostro dove c'è blu e non ne trova dove c'è rosso. Nessuno gliel'ha insegnato: l'ha trovato da solo,
  girando le manopole.»*
- Guardate insieme le quattro statistiche: **99,9 % contro 96,5 %**.
  Richiamo esplicito alla Tappa 1: *«ve lo ricordate il problema di prima? Eccolo di nuovo, identico.»*
- Chi chiede «e per riconoscere una faccia?»: stessa cosa, più strati e milioni di esempi.
  Chi chiede «e le lastre mediche?»: stessa cosa, e il punto delicato diventa *di chi* sono gli esempi.

**Il laboratorio: guardarla imparare da zero** (6-8 minuti, in fondo alla tappa)

1. Prima di premere niente, fate guardare il riquadro delle **24 maschere**: è rumore puro.
   *«Queste sono le manopole di una rete nuova, messe a caso. Non sa niente.»*
2. **Chiedete a qualcuno di disegnare una cifra** nel riquadro qui sopra: le barre in basso
   mostrano che cosa risponde la rete nuova — una risposta a caso.
3. Premete **«Allena»** e state zitti per dieci secondi. Poi commentate quello che succede:
   le maschere che prendono forma, le risposte esatte che salgono dal 10 % all'80 % in pochi
   secondi, le barre della cifra disegnata che si spostano sulla risposta giusta.
4. Quando si stabilizza, indicate le **due curve**: *studio* è sopra *mai viste*.
   *«Ve lo ricordate? È la stessa cosa della Tappa 1: sul materiale di studio è perfetta,
   su quello che non ha mai visto un po' meno. Con 1.200 cifre si arriva qui; con 8.000,
   come la rete qui sopra, al 96,5 %.»*
5. Se qualcuno chiede quanto ci vuole per i modelli veri: questa rete guarda circa duemila
   cifre al secondo su un portatile; per un modello linguistico servono migliaia di schede
   grafiche per settimane.

### Tappa 4 — La macchina che scrive (20 min)

L'obiettivo è smontare il mistero senza sminuire il risultato.

1. **Tokenizzazione**: fate scrivere una frase dal pubblico nel riquadro. Le parole diventano numeri.
2. **Generazione con memoria = 1**: escono sciocchezze, e il pubblico ride. Bene: l'imbarazzo è finito.
3. **Memoria = 2**: escono frasi quasi sensate. *«Notate: non ha un'idea da esprimere. Sceglie una parola alla volta.»*
4. **Memoria = 3**: recita il testo a memoria. Terzo incontro con il sovradattamento — nominatelo.
5. **Temperatura**: a 0,2 ripete sempre la stessa frase, a 1,5 delira.
   *«Quando un modello vi sembra "creativo", spesso qualcuno ha solo alzato questo cursore.»*
6. **Tabella delle probabilità — premete «Guardalo mentre impara»**: la tabella si riempie
   una casella alla volta mentre il modello legge il testo, e la coppia appena letta viene
   cerchiata in arancione.
   *«Ecco che cosa vuol dire "studiare" per questo modello: leggere e contare. Non c'è
   comprensione, c'è contabilità.»* Dopo dieci secondi premete «Mostra la tabella completa».
   *«tutta la conoscenza di questo modellino sta in questo quadrato.
   Con 50.000 parole servirebbero due miliardi e mezzo di caselle: per questo servono le reti.»*
7. **Allenamento dal vivo**: premete «Allena la rete» e commentate la curva che scende.
   *«È la stessa collina della Tappa 1. Stessa identica idea, un'ora dopo.»*
8. **Le tre differenze con ChatGPT** (attenzione, scala, correzioni umane) e la figura dell'attenzione.
   Dite sempre che quella figura è uno schema, non un calcolo.

### Tappa 5 — Limiti (15 min)

- Disegnate una **casetta** o un **fiore** nel riquadro. La rete risponde «0 al 99 %».
  *«Non ha nessun modo di dire "questo non lo so". Le abbiamo insegnato a scegliere fra dieci cifre,
  e lei sceglie fra dieci cifre. Sempre.»*
- Collegate alle allucinazioni: *«quando un modello vi inventa una sentenza o un articolo di legge
  che non esiste, sta facendo esattamente questo.»*
- Chiudete tornando alla lavagna: tre regressioni, una piccola, una media, una gigantesca.

## Domande che arrivano sempre (e risposte pronte)

**«Ma allora pensa o no?»**
No. Non c'è nessun luogo in cui accada qualcosa che somigli al pensare: c'è una funzione che calcola.
Detto questo, una funzione abbastanza grande può produrre comportamenti che *sembrano* pensiero,
e la discussione su che cosa significhi davvero «pensare» è aperta da prima dei computer.

**«Può diventare cosciente?»**
Nulla di quello che abbiamo visto oggi va in quella direzione: aggiungere manopole non produce coscienza,
produce previsioni migliori. Quello che invece cambia davvero è quante decisioni siamo disposti a delegarle.

**«Ci ruberà il lavoro?»**
Automatizza *compiti*, non mestieri: quelli in cui esistono molti esempi e la risposta giusta è difficile
da scrivere come regola. Chi fa quei compiti per lavoro deve cambiare qualcosa; chi decide e si assume
responsabilità meno.

**«Perché sbaglia cose facilissime?»**
Perché non ha il nostro modello del mondo: ha una superficie di risposte costruita sugli esempi.
Appena esce da lì, sbaglia — e sbaglia con la stessa faccia sicura di quando ha ragione (Tappa 5).

**«Come fa a sapere quello che sa?»**
Non lo sa: lo ricostruisce ogni volta. Tutto ciò che ha imparato è un enorme insieme di numeri,
non un archivio di fatti che si possa consultare.

**«Da dove vengono i dati?»**
Domanda giusta, e scomoda: dal web, da libri, da immagini caricate da qualcuno, spesso senza che
l'autore l'abbia deciso. È il tema legale più caldo del settore.

## Errori da non fare

- **Non dire «il computer impara come un bambino».** Un bambino impara da pochi esempi e chiede perché;
  la rete ha bisogno di ottomila cifre per imparare a leggere un 7.
- **Non dire «la rete funziona come il cervello».** Ha preso in prestito un'immagine dalla neurofisiologia degli anni '40
  e poco altro. Se qualcuno insiste: i neuroni veri non fanno moltiplicazioni di matrici.
- **Non usare la parola «algoritmo» come spiegazione.** Non spiega nulla e fa sembrare tutto più oscuro.
- **Non promettere che l'incertezza mostrata sia una probabilità vera.** Il 99 % della Tappa 5 è un numero
  che esce dal calcolo, non una misura di verità.
- **Non nascondere quello che non si sa.** Dire «su questo gli esperti non sono d'accordo» aumenta la fiducia,
  non la diminuisce.

## Prima di entrare in aula (5 minuti di controlli)

1. Aprire `index.html` sul portatile che userete davvero, **senza rete**: deve funzionare lo stesso
   (D3 e i pesi della rete sono nel repository, non su internet).
2. Provare a disegnare una cifra con il mouse del proiettore: il tratto deve essere spesso e la cifra grande.
3. Portare il browser a schermo intero (`F11`) e regolare lo zoom (`Ctrl` + `+`) finché il testo si legge
   dall'ultima fila. La pagina è pensata per reggere zoom fino al 150 %.
4. Verificare che i tasti `←` e `→` cambino tappa: è il modo più comodo per non perdere il filo.
5. Se c'è un tablet o uno schermo touch, usatelo per la Tappa 3: il dito funziona.
6. Piano B senza computer: la stessa lezione si tiene con una lavagna, quindici puntini,
   un righello e la domanda «e se la retta la facessi passare *esattamente* per tutti i punti?».

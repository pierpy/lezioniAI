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

## Due livelli: «essenziale» e «completa»

In alto a destra c'è un interruttore. **La lezione si tiene in «essenziale»**: è il livello
predefinito, si riapre da solo la volta dopo, e mostra una cosa per schermata con due comandi
al massimo. «Completa» rimette in vista tutto, senza togliere né semplificare nulla di ciò
che resta: è la stessa lezione con gli approfondimenti accesi.

| Cosa resta nascosto in «essenziale» | Perché | Quando accenderlo |
|---|---|---|
| Il cursore «di quanto le giro» (apertura) | un secondo parametro da spiegare | se qualcuno chiede «e se sbaglia a girare?» |
| La collina dell'errore (Tappa 1) | è uno spazio astratto: gli assi non sono più metri quadri ed euro | con un pubblico che ha fatto matematica, o su richiesta |
| La spunta «mostra gli errori» (Tappa 1) | resta accesa comunque | mai, serve solo a spegnerla |
| «Come trova le manopole» + allenamento (Tappa 3) | due modi invece di uno | quando c'è tempo: è il momento più bello della tappa |
| La formula del neurone (Tappa 3) | una formula in aula perde metà sala | se qualcuno chiede «ma in pratica cos'è?» |
| Il confronto numerico dei tre costi (Tappa 2) | un grafico in più mentre si parla | quando qualcuno chiede «e chi dice che sia la migliore?» |
| Il grafico del costo delle k-medie (Tappa 2) | basta vedere i gruppi assestarsi | per mostrare che il costo scende sempre |
| I 64 neuroni nascosti (Tappa 4) | un quarto riquadro da guardare | dopo che la cifra è stata riconosciuta, come bis |
| La curva delle risposte esatte (laboratorio, Tappa 4) | bastano le maschere e un numero | per far vedere il divario studio/mai-viste |
| Il grafico dello «stupore» nella parola coperta (Tappa 5) | basta la percentuale di parole indovinate | per chi vuole vedere l'errore scendere |
| Le parole-punti (Tappa 5) | il passaggio più astratto di tutta la lezione | con un pubblico curioso, o in una seconda lezione |

Tutti i numeri, le citazioni e i comportamenti restano gli stessi nei due livelli: «essenziale»
non dice cose più semplici, ne dice **meno per volta**. Anche il gergo tra parentesi
(«sovradattamento», «temperatura», «grado 7») compare solo in «completa».

### Le cinque regole che tengono semplice il racconto

1. **Una cosa per schermata.** Se sullo schermo ci sono due cose che si muovono, il pubblico
   ne guarda una e perde l'altra. Fermate un'animazione prima di avviarne un'altra.
2. **Sempre le stesse tre parole**: *manopole*, *errore*, *imparare a memoria*. Mai sinonimi:
   «parametri», «costo», «sovradattamento» confondono chi sta seguendo a fatica.
3. **Ogni numero va ancorato.** Non «errore 24,8», ma «sbaglia venticinque mila euro su una casa
   da centocinquanta: un sesto del prezzo».
4. **Prima si guarda, poi si spiega.** Fate partire l'animazione, tacete, e commentate dopo.
5. **Le citazioni non si leggono ad alta voce.** Stanno lì perché la lezione sia verificabile,
   non per essere recitate: basta dire «è un teorema del 1989, c'è scritto lì sotto chi l'ha dimostrato».

## Scaletta

| Tempo | Tappa | Cosa succede sullo schermo |
|---|---|---|
| 0–18 min | **0. Apertura** | I quattro sette che nessuna regola riesce a descrivere; la scatola a due manopole che gira il pubblico; la stessa cosa fatta da sola sulla curva; la riga delle manopole da 2 a mille miliardi. |
| 18–30 min | **1. La retta che indovina** | Prezzi delle case. Il pubblico detta dove mettere i punti. Cursore della complessità, spunta «nascondi 1/3 dei dati». |
| 30–43 min | **2. Con o senza risposte giuste** | Il gioco dei sei lavori; la stessa nuvola con tre rette; i gruppi trovati dalle k-medie; la casa sballata da trascinare. |
| 43–51 min | **3. Da una retta a qualsiasi curva** | Cursore dei neuroni da 1 a 40, con «mostra i singoli pezzetti». Si finisce disegnando una curva col mouse e facendola copiare alla rete. |
| 51–77 min | **4. La rete neurale** | Un neurone solo (pesi, somma, soglia). Una rete piccola con tutti i fili in vista. La colpa all'indietro, al rallentatore. Poi la cifra scritta dal pubblico e il laboratorio che impara da zero. |
| 77–99 min | **5. Il modello linguistico** | La catena di montaggio in cinque caselle. La generazione parola per parola con memoria e fantasia. Il gioco della parola coperta: com'è fatto l'addestramento, visto funzionare. |
| 99–110 min | **6. Limiti e domande** | Lo scarabocchio che la rete chiama «zero al 99 %». Le quattro cose da ricordare. Domande. |

> **Centodieci minuti sono tanti.** La lezione completa è pensata come **due incontri**:
> il primo fino alla Tappa 3 compresa (circa 50 minuti: che cos'è, la regressione, con o senza
> risposte, qualsiasi curva), il secondo dalla Tappa 4 in poi (le due macchine grandi e i limiti).
> Se avete un incontro solo, usate la scaletta essenziale qui sotto.

### Il filo dell'apprendimento

La stessa scena — *misuro l'errore, calcolo da che parte girare le manopole, le giro, ricomincio* —
torna **sei volte**, ed è la spina dorsale della lezione. Vale anche per i metodi non
supervisionati della Tappa 2: le k-medie non hanno risposte giuste da imitare, ma hanno
un costo da far scendere — la distanza delle case dal proprio centro. Nominatela ogni volta:

| Dove | Che cosa impara | Quante manopole |
|---|---|---|
| Apertura, la scatola | il prezzo di una casa — **le manopole le girate voi** | 2 |
| Apertura, la curva | una curva su 24 punti | 4 |
| *(le righe in corsivo sono visibili solo in «completa»)* | | |
| *Tappa 1, la collina* | *una retta sui prezzi delle case* | *2* |
| *Tappa 3, «a tentoni»* | *pesi, pendenze e centri dei neuroni* | *fino a 121* |
| Tappa 4, il laboratorio | a leggere le cifre, da zero, dal vivo | 19.090 |
| *Tappa 5, le parole-punti* | *dove mettere ogni parola nel piano* | *qualche migliaio* |

### Lezione essenziale da 70 minuti (il formato consigliato per la prima volta)

| Tempo | Che cosa |
|---|---|
| 0–15 | Apertura: i quattro sette, la scatola a due manopole girata dal pubblico, poi la curva che impara da sola. |
| 15–26 | Tappa 1: i prezzi delle case, il cursore della complessità, la verifica sui dati nascosti. |
| 26–37 | Tappa 2: il gioco dei sei lavori, le tre rette, i gruppi. (Se siete stretti, saltate il pannello sulla funzione di costo.) |
| 37–44 | Tappa 3: da 1 a 40 neuroni, «mostra i pezzetti», la curva disegnata a mano. |
| 44–58 | Tappa 4: un neurone solo, la rete con tutti i fili, la colpa all'indietro; poi la cifra scritta dal pubblico. |
| 58–70 | Tappa 5: la catena di montaggio, la generazione, il gioco della parola coperta; poi le quattro cose da ricordare della Tappa 6. |

Con questo taglio non si perde nessun concetto: si perdono gli approfondimenti.
La Tappa 5 completa, la collina dell'errore e le parole-punti diventano la seconda lezione.

**Se avete 90 minuti e volete tutto**: mettete l'interruttore su «completa» e seguite la scaletta
qui sopra. **Se avete solo 60 minuti**: tagliate la Tappa 3 (bastano due minuti a voce: «più pezzetti,
più dettagli — ed è un teorema del 1989») e la parte di allenamento dal vivo della Tappa 5.
Non tagliate mai la verifica su dati mai visti della Tappa 1: è il concetto più prezioso di tutta l'ora.

## Che cosa fare, tappa per tappa

### Tappa 0 — Apertura (18 min)

Quattro momenti, in quest'ordine. Rispondono alle tre domande che uno si fa davvero:
*perché serve?*, *che cos'è?*, *quanto è grande?*

**1. «Perché non basta scrivere le regole» (4 min).**
Aprite con una sfida, non con una definizione: *«ditemi voi una regola per riconoscere un sette.
Una regola precisa, che un computer possa seguire alla lettera.»* Lasciate che qualcuno la dica
ad alta voce — arriverà qualcosa come «un trattino sopra e una linea obliqua che scende».
Poi indicate i quattro sette sullo schermo, scritti da quattro persone vere: uno ha il taglio,
uno è tondo, uno è storto. Premete **«Altri quattro»**: ne arrivano altri quattro, diversi.
Ripetetelo due volte, in silenzio. Poi premete **«E questi sono degli uno e dei nove»**:
la regola deve escludere anche quelli.
> «Per trent'anni si è provato a scrivere quella regola, e non ci è riuscito nessuno.
> Poi si è cambiata strada: non dire com'è fatto un sette, ma far vedere ottomila sette.
> Questo è il passaggio che chiamiamo intelligenza artificiale.»

**2. «Adesso la macchina siete voi» (7 min). È il cuore dell'apertura.**
Mostrate la scatola: un biglietto entra da sinistra (i metri quadri), esce una risposta a destra
(il prezzo), e dentro non c'è nessuna regola scritta — ci sono **due manopole**.
Poi fate salire qualcuno, o girate voi seguendo i suggerimenti della sala:
- il termometro dice **acqua, acquetta, fuochino, fuoco** — è il gioco dei bambini, ed è
  esattamente quello che guarda un computer mentre impara;
- sotto, le cinque case con la loro barra d'errore: le barre si accorciano mentre vi avvicinate;
- l'obiettivo è arrivare al «fuoco fuoco», sotto 3 mila € di errore.
Fateli faticare: un minuto buono di tentativi, con la sala che dice «più su!», «troppo!».
Quando ci arrivano (o quando si stancano), **rivelate la regola vera**: 20 mila € più 1,6 mila €
al metro quadro. *«Non l'avete mai saputa. Avete solo guardato se l'errore scendeva.»*
Infine premete **«Lascia fare a lei»** e leggete il confronto: la macchina fa la stessa identica
cosa, ma qualche migliaio di volte al secondo.
> «Non è più intelligente di voi. È più veloce a girare le manopole. Tutta l'intelligenza
> artificiale sta in questa differenza.»

**3. «E adesso lasciatela fare da sola» (5 min).**
Stessa storia, un problema un po' più difficile (una curva invece di una retta) e quattro manopole
invece di due. Premete **«Un passo alla volta»** due o tre volte e commentate la ricetta che si
illumina: misuro l'errore, guardo da che parte conviene girare, giro un pochino, ricomincio.
Poi **«Fai imparare la curva»** a velocità piena.
Se avete due minuti, il colpo di scena: cursore su *«un passo troppo grande»*, «Nuovi punti»,
e guardate la curva schizzare fuori dal grafico.

**4. «La stessa idea, tre volte» (2 min).**
Le tre schede e la riga delle manopole. Dite ad alta voce che **ogni tacca vale dieci volte
la precedente**, altrimenti i tre pallini non starebbero sullo schermo.
> «Oggi costruiamo tutte e tre queste macchine. Sono la stessa macchina: cambia solo
> quante manopole ha e che cosa scriviamo sul biglietto che le infiliamo dentro.»

### Tappa 1 — La retta che indovina (14 min)

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
6. **La collina dell'errore** *(solo in modalità «completa»)*. Premete «Scendi lungo la collina».
   Collegatela esplicitamente all'apertura: *«le frecce sulle manopole che avete visto all'inizio
   sono la pendenza di questa collina»*. Metafora:
   *«è come scendere una collina nella nebbia: si guarda solo la pendenza sotto i piedi e si fa un passo in giù.
   Con due manopole è una collina. Con cento miliardi è la stessa cosa, ma non possiamo disegnarla.»*

### Tappa 2 — Con o senza risposte giuste (14 min)

È la tappa che dà i nomi alle cose. Attenzione a un punto di rigore: **non esiste una
«regressione non supervisionata»** — la regressione ha bisogno delle risposte per definizione.
Quello che si mostra è la stessa nuvola con *due domande diverse*, ed è più onesto e più bello.

1. **Il gioco dei sei lavori.** Leggete il primo ad alta voce e fate rispondere *a voce* prima di
   cliccare: «alzi la mano chi dice con le risposte». Poi cliccate e leggete la spiegazione.
   Il sesto (il pagamento insolito) è volutamente ambiguo e la spiegazione lo dice: serve a far
   capire che il confine non è sempre netto.
2. **Le tre rette.** Partite da «indovinare l'altezza del figlio»: i segmenti sono verticali,
   perché l'errore è solo sulla risposta.
   *«La retta dice: ogni centimetro in più del padre vale mezzo centimetro nel figlio.»*
   Qui raccontate Galton: **la parola "regressione" nasce da questa nuvola** — i figli dei padri
   altissimi sono alti, ma meno del padre, «regrediscono» verso la media. È il 1886.
   Poi passate a «indovinare l'altezza del padre»: **stessi punti, retta diversa**. Fermatevi un
   momento su questo: *«non esiste la retta dei dati; esiste la retta di una domanda»*.
   Infine «descrivere la nuvola»: i segmenti diventano perpendicolari, nessuna delle due misure
   è la risposta. *«Questa non predice niente: descrive. Ed è l'unica che resta la stessa se
   scambiate i due assi.»* In modalità completa, il grafico a barre mostra che ogni retta vince
   con il proprio metro: è la dimostrazione che il costo *è* la domanda.
3. **I gruppi.** Premete «Una mossa» tre o quattro volte, commentando le due mosse
   (ogni casa al centro più vicino / ogni centro in mezzo alle sue case), poi «Trova i gruppi».
   Quando si ferma: *«nessuno gli ha detto che esistono monolocali e ville: ha solo avvicinato
   ogni casa a un centro»*. Poi due esperimenti da trenta secondi l'uno:
   portate il cursore a 2 e a 5 gruppi (*«non c'è una risposta giusta: il numero lo decidiamo noi»*)
   e premete «Un altro tentativo» un paio di volte (*«se i centri partono da un'altra parte,
   qualche volta il risultato cambia»*).
4. **La casa sballata.** Trascinatela verso l'alto lentamente: la retta blu la insegue, l'arancione
   no. *«Ho cambiato solo la domanda — che cosa vuol dire sbagliare — e la risposta è cambiata.
   Nessuna delle due è sbagliata: dipende se quel prezzo è un errore di battitura o una villa vera.
   Questa scelta la fa una persona, non la matematica.»*
5. **Chiusura.** Le tre schede in fondo collegano la tappa al resto della lezione: le cifre hanno
   bisogno di etichette scritte da qualcuno; i gruppi no; il testo è la risposta di se stesso.
   Quest'ultima — l'auto-supervisione — è la ragione per cui i modelli linguistici hanno potuto
   studiare su tutto il web senza che nessuno preparasse le risposte.

### Tappa 3 — Qualsiasi curva (10 min)

Il concetto da consegnare: *un neurone è un interruttore morbido; sommandone abbastanza si ottiene qualsiasi forma.*

- Partite da **1 neurone** (la rete può solo fare uno scalino), poi 3, poi 8, poi 40.
- Accendete **«mostra i singoli pezzetti»**: si vede la somma prendere forma. È la diapositiva più bella della lezione.
- Scegliete **«il battito cardiaco»** e restate a 8 neuroni: la rete ignora i picchi.
  Salite a 40: i picchi compaiono. *«Ecco perché i modelli sono diventati grandi: i dettagli costano manopole.»*
- **Il momento chiave della tappa** *(solo in modalità «completa»)*: cambiate «Come trova le manopole» da *la scorciatoia* a
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

### Tappa 4 — La rete neurale (26 min)

La tappa risponde a tre domande in fila: **com'è fatta**, **come impara**, **che cosa sa fare**.

**1. Un neurone (5 min).** Prima di ogni disegno di rete, un neurone solo, con una decisione che
conoscono tutti: *esco a fare la spesa?* Accendete e spegnete le tre situazioni e fate notare che
il peso può essere **negativo** — «mi fanno male le gambe» spinge dall'altra parte.
Poi i due pulsanti: *una persona pigra*, *una persona attiva*.
> «Le manopole non sono il carattere di una macchina: sono il carattere di questa decisione.
> Cambiando i pesi, la stessa identica macchina diventa un'altra persona.»
Se qualcuno dice «ma allora è come un neurone del cervello»: no, e conviene dirlo subito.
È un'immagine presa in prestito nel 1943; un neurone vero non fa moltiplicazioni.

**2. Una rete intera, con tutti i fili (6 min).** Nove quadretti, quattro neuroni, due risposte.
Fate accendere qualche quadretto dal pubblico e premete **«Manda il segnale»**: i pallini
percorrono i fili. Prima dell'allenamento la risposta è a caso — ditelo, altrimenti sembra che
funzioni per magia.
> «Questa rete ha 58 manopole e le vedete tutte. Quella delle cifre ne ha 50.890:
> è lo stesso disegno, solo che i fili non ci starebbero sullo schermo.»

**3. La colpa all'indietro (8 min). È il cuore della tappa.**
Premete **«Un esempio, al rallentatore»** e state zitti: la ricetta si illumina da sola, una fase
alla volta, e la didascalia racconta che cosa sta succedendo. Fatelo **due o tre volte**: la terza
volta il pubblico anticipa le fasi. Fate notare il numero che cambia alla fine
(«ci crede al 62 % invece che al 41 %»): *un pochino* meglio, ed è tutto lì.
Poi **«Allena»** e guardate i fili: alcuni si ingrossano, altri spariscono.
> «Nessuno ha detto a quel filo di ingrossarsi. Ha ricevuto la sua parte di colpa e si è spostato.
> Ripetuto qualche centinaio di volte, questo è "la rete impara".»

**4. E adesso in grande (7 min).** Il resto della tappa come prima: la cifra scritta dal pubblico,
le maschere, il laboratorio che impara da zero.

### Tappa 4 — Le cifre scritte a mano (dentro la stessa tappa)

- **Fate scrivere la cifra a qualcuno del pubblico**, non fatelo voi. Con il dito su un tablet, se c'è.
- Mostrate il riquadro «quello che vede la rete»: *«non vede un sette. Vede 784 numeri fra 0 e 1.»*
- *(in modalità «completa»)* Passate il mouse sui neuroni nascosti: compaiono le maschere. *«Questo neurone si accende se trova
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

### Tappa 5 — Il modello linguistico (22 min)

Stessa struttura: com'è fatto, come impara, che cosa sa fare.

**1. La catena di montaggio (6 min).** Fate scrivere una frase a qualcuno del pubblico, poi
cliccate le cinque caselle **in ordine**, commentando una riga ciascuna. Le due che valgono il
prezzo del biglietto: il **passo 2** («queste sono manopole: all'inizio sono numeri a caso, e
imparando diventano la carta d'identità della parola — qui sei per parola, in GPT-3 dodicimila»)
e il **passo 3**, dove portate il cursore da 6 a 96 blocchi:
> «Non c'è nessun trucco nuovo nei blocchi alti: è sempre lo stesso blocco, ripetuto novantasei
> volte. Quasi tutto quello che chiamiamo intelligenza artificiale oggi è questo: la stessa cosa,
> impilata tante volte.»
Chiudete col passo 5, premendolo due volte: esce una parola diversa. Da lì si capisce perché la
stessa domanda dà risposte diverse.

**2. Il gioco della parola coperta (8 min). È il cuore della tappa.**
Prima di allenare, premete **«Scopri la parola»** con le manopole a caso: la parola vera prendeva
l'1 %. Poi **«Allena il modello»** e lasciate correre una decina di secondi guardando la
percentuale di parole indovinate salire. Fermate, premete di nuovo «Scopri»: ora la parola vera
prende il 90 e passa per cento.
> «Chi gli ha dato le risposte giuste? Nessuno. La risposta era già scritta nel testo: è la parola
> che veniva dopo. Ecco perché questi modelli hanno potuto studiare su tutto il web senza che
> nessuno preparasse niente — e perché sono cresciuti così in fretta.»
Se avete fatto la Tappa 2, richiamatela: è l'**auto-supervisione** di cui si parlava lì.

**3. E adesso il resto (8 min).** La generazione con memoria e fantasia, la tabella che si riempie:
come prima.

### Tappa 5 — La macchina che scrive (dentro la stessa tappa)

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
7. **Allenamento dal vivo** *(solo in modalità «completa»)*: premete «Allena la rete» e commentate la curva che scende.
   *«È la stessa collina della Tappa 1. Stessa identica idea, un'ora dopo.»*
8. **Le tre differenze con ChatGPT** (attenzione, scala, correzioni umane) e la figura dell'attenzione.
   Dite sempre che quella figura è uno schema, non un calcolo.

### Tappa 6 — Limiti (8 min)

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

**«Allora può imparare da sola, senza di noi?»**
No, e la Tappa 2 lo mostra bene: anche senza risposte giuste qualcuno deve scegliere i dati,
decidere che cosa misurare, stabilire quanti gruppi cercare e soprattutto **dire che cosa
significano** i gruppi trovati. La macchina trova mucchi di punti; che quel mucchio sia
«famiglie giovani» lo decidiamo noi.

**«Perché sbaglia cose facilissime?»**
Perché non ha il nostro modello del mondo: ha una superficie di risposte costruita sugli esempi.
Appena esce da lì, sbaglia — e sbaglia con la stessa faccia sicura di quando ha ragione (Tappa 6).

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
- **Non promettere che l'incertezza mostrata sia una probabilità vera.** Il 99 % della Tappa 6 è un numero
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
   Controllare che l'interruttore in alto a destra sia su **Essenziale** (il browser ricorda
   l'ultima scelta fatta su quel computer).
5. Se c'è un tablet o uno schermo touch, usatelo per la Tappa 4: il dito funziona.
6. Piano B senza computer: la stessa lezione si tiene con una lavagna, quindici puntini,
   un righello e la domanda «e se la retta la facessi passare *esattamente* per tutti i punti?».

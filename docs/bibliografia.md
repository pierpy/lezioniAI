# Bibliografia e verifiche

Ogni affermazione quantitativa della lezione è ricondotta qui alla sua fonte.
Le voci contrassegnate con ✔ sono state **verificate online il 21 settembre 2026**
(titolo, rivista, volume, pagine, anno, DOI); quelle con ○ sono citazioni standard
riportate a memoria, controllabili ma non ricontrollate in quell'occasione.

---

## 1. L'idea di fondo: imparare = regressione

| | Riferimento | Che cosa sostiene la lezione |
|---|---|---|
| ○ | A.-M. Legendre, *Nouvelles méthodes pour la détermination des orbites des comètes*, Courcier, Paris 1805 — appendice sul *méthode des moindres carrés*. | Prima pubblicazione del metodo dei minimi quadrati. |
| ○ | C. F. Gauss, *Theoria motus corporum coelestium*, Perthes & Besser, Hamburg 1809. | Trattazione probabilistica dei minimi quadrati (Gauss ne rivendica l'uso dal 1795). |
| ✔ | S. Geman, E. Bienenstock, R. Doursat, «Neural Networks and the Bias/Variance Dilemma», *Neural Computation* **4**(1), 1–58 (1992). DOI 10.1162/neco.1992.4.1.1 | Il compromesso fra modello troppo semplice e modello troppo furbo. Sta dietro alla Tappa 1 e al grafico errore-contro-grado. |
| ○ | A. E. Hoerl, R. W. Kennard, «Ridge Regression: Biased Estimation for Nonorthogonal Problems», *Technometrics* **12**(1), 55–67 (1970). | La regolarizzazione usata (λ piccolo) per stabilizzare i minimi quadrati ai gradi alti. |
| ○ | H. Robbins, S. Monro, «A Stochastic Approximation Method», *Annals of Mathematical Statistics* **22**(3), 400–407 (1951). | L'antenato della discesa del gradiente stocastica. |
| ○ | C. M. Bishop, *Pattern Recognition and Machine Learning*, Springer 2006, capp. 1 e 3. | Testo di riferimento per tutta la Tappa 1. |

## 1-bis. Con o senza risposte giuste (Tappa 2)

| | Riferimento | Che cosa sostiene la lezione |
|---|---|---|
| ✔ | F. Galton, «Regression towards Mediocrity in Hereditary Stature», *Journal of the Anthropological Institute* **15**, 246–263 (1886). | Da qui viene la parola «regressione»: i figli dei padri altissimi sono alti, ma *meno* del padre. La retta blu della Tappa 2 è meno inclinata della diagonale proprio per questo. |
| ✔ | K. Pearson, A. Lee, «On the Laws of Inheritance in Man: I», *Biometrika* **2**(4), 357–462 (1903). | Le statistiche con cui sono simulate le altezze mostrate: correlazione padre-figlio ≈ 0,5, deviazione standard ≈ 7 cm. **I punti sullo schermo sono simulati**, non sono dati di persone reali: va detto se qualcuno lo chiede. |
| ✔ | K. Pearson, «On lines and planes of closest fit to systems of points in space», *Philosophical Magazine* **2**(11), 559–572 (1901). | La retta «non supervisionata»: quella che minimizza le distanze **perpendicolari**. È l'antenata dell'analisi delle componenti principali. |
| ○ | H. Hotelling, *Journal of Educational Psychology* **24**, 417–441 e 498–520 (1933). | La formulazione moderna delle componenti principali. |
| ○ | H. Steinhaus, «Sur la division des corps matériels en parties», *Bull. Acad. Polon. Sci.* **4**(12), 801–804 (1956). | Prima formulazione del problema delle k-medie. |
| ○ | S. P. Lloyd, «Least squares quantization in PCM», *IEEE Trans. on Information Theory* **28**(2), 129–137 (1982) — scritto nei Bell Labs nel 1957. | L'algoritmo delle due mosse che si vede animato: assegna, sposta, ripeti. Converge sempre, ma a un minimo locale: dipende da dove partono i centri. |
| ○ | J. MacQueen, «Some methods for classification and analysis of multivariate observations», *Proc. 5th Berkeley Symposium* **1**, 281–297 (1967). | Il nome «k-means». |
| ○ | R. J. Boscovich (1757); P.-S. Laplace, *Mémoire sur…* (1793). | La retta che minimizza i valori **assoluti** degli errori: più vecchia dei minimi quadrati e più robusta ai dati sballati. |
| ○ | P. J. Huber, «Robust estimation of a location parameter», *Annals of Mathematical Statistics* **35**(1), 73–101 (1964). | La teoria moderna della robustezza: perché la scelta del costo cambia tutto. |
| ○ | C. M. Bishop, *PRML*, Springer 2006, cap. 9 (k-medie) e cap. 12 (componenti principali). | Trattazione di riferimento dei due metodi non supervisionati usati nella tappa. |

> **Un punto di rigore da non sbagliare in aula.** «Regressione non supervisionata» non esiste:
> la regressione ha bisogno delle risposte per definizione. Quello che la tappa mette a confronto
> è **la stessa nuvola con due domande diverse**: predire una misura dall'altra (supervisionato,
> distanze verticali od orizzontali) oppure descrivere la forma della nuvola (non supervisionato,
> distanze perpendicolari). La differenza fra le due rette *è* la differenza fra le due famiglie.

## 2. Perché una rete può imparare *qualsiasi* funzione

| | Riferimento | Che cosa sostiene la lezione |
|---|---|---|
| ✔ | G. Cybenko, «Approximation by superpositions of a sigmoidal function», *Mathematics of Control, Signals and Systems* **2**, 303–314 (1989). DOI 10.1007/BF02551274 | **Teorema di approssimazione universale**: combinazioni finite di sigmoidi approssimano uniformemente qualsiasi funzione continua sul cubo unitario. È la frase-chiave della Tappa 3. |
| ✔ | K. Hornik, M. Stinchcombe, H. White, «Multilayer feedforward networks are universal approximators», *Neural Networks* **2**(5), 359–366 (1989). DOI 10.1016/0893-6080(89)90020-8 | Stesso risultato, ipotesi più generali (funzioni misurabili secondo Borel). |
| ○ | K. Hornik, «Approximation capabilities of multilayer feedforward networks», *Neural Networks* **4**(2), 251–257 (1991). | Il risultato non dipende dalla scelta della sigmoide. |
| ○ | A. R. Barron, «Universal approximation bounds for superpositions of a sigmoidal function», *IEEE Trans. on Information Theory* **39**(3), 930–945 (1993). | Velocità di convergenza O(1/n) indipendente dalla dimensione: il motivo per cui le reti reggono dati ad alta dimensione. |
| ○ | K. Weierstrass (1885); A. N. Kolmogorov, *Dokl. Akad. Nauk SSSR* **114**, 953–956 (1957). | Antenati matematici dell'idea di approssimazione universale. |

> ⚠️ **Avvertenza da ripetere in aula.** Il teorema dice che *esiste* una rete che approssima
> la funzione voluta, non che l'allenamento la *troverà*. Il divario fra i due enunciati è
> gran parte della ricerca degli ultimi trent'anni.

## 3. Le reti che leggono le cifre

| | Riferimento | Che cosa sostiene la lezione |
|---|---|---|
| ○ | W. S. McCulloch, W. Pitts, «A logical calculus of the ideas immanent in nervous activity», *Bulletin of Mathematical Biophysics* **5**, 115–133 (1943). | Il «neurone formale» del primo pannello della Tappa 4: pesi, somma, soglia. |
| ○ | F. Rosenblatt, «The Perceptron: a probabilistic model for information storage and organization in the brain», *Psychological Review* **65**(6), 386–408 (1958). | Il primo neurone artificiale costruito davvero, con motorini che giravano i potenziometri: le manopole, letteralmente. |
| ○ | D. E. Rumelhart, G. E. Hinton, R. J. Williams, «Learning representations by back-propagating errors», *Nature* **323**, 533–536 (1986). | La retropropagazione: come si calcolano i gradienti in una rete a più strati. È la «colpa all'indietro» animata nella Tappa 4: la rete 9–4–2 con 58 manopole la esegue davvero, filo per filo. |
| ✔ | Y. LeCun, L. Bottou, Y. Bengio, P. Haffner, «Gradient-based learning applied to document recognition», *Proceedings of the IEEE* **86**(11), 2278–2324 (1998). DOI 10.1109/5.726791 | Origine dell'archivio **MNIST** e del preprocessamento (cifra riportata a 20×20, centrata sul baricentro in 28×28) che la pagina replica sul disegno fatto col mouse. |
| ✔ | D. Cireşan, U. Meier, J. Schmidhuber, «Multi-column deep neural networks for image classification», *CVPR 2012*. | Errore dello **0,23 %** su MNIST, «vicino allo ≈0,2 % degli esseri umani». È la frase citata nella Tappa 4. |
| ○ | K. He, X. Zhang, S. Ren, J. Sun, «Delving Deep into Rectifiers», *ICCV 2015*, arXiv:1502.01852. | L'inizializzazione dei pesi usata da `tools/train-mlp.py`. |
| ○ | A. Krizhevsky, I. Sutskever, G. E. Hinton, «ImageNet Classification with Deep CNNs», *NIPS 2012*. | Il momento in cui il metodo esce dai laboratori. |

**Numeri della rete della lezione** (riproducibili con `tools/train-mlp.py`, seme 42):
50.890 manopole, 8.000 cifre di studio, 1.756 di verifica, 90 epoche,
**99,9 %** di risposte esatte sugli esempi di studio e **96,5 %** su cifre mai viste.
Il divario fra i due numeri è il sovradattamento della Tappa 1, e va mostrato.

## 4. I modelli linguistici

| | Riferimento | Che cosa sostiene la lezione |
|---|---|---|
| ✔ | C. E. Shannon, «A Mathematical Theory of Communication», *Bell System Technical Journal* **27**, 379–423 e 623–656 (1948). | Nel §3 della prima parte Shannon genera testo inglese campionando da statistiche di lettere e di parole: è, letteralmente, il modello della Tappa 5. |
| ○ | C. E. Shannon, «Prediction and Entropy of Printed English», *BSTJ* **30**, 50–64 (1951). | Misura quanto è prevedibile una lingua: ~1 bit per lettera. |
| ✔ | Y. Bengio, R. Ducharme, P. Vincent, C. Jauvin, «A Neural Probabilistic Language Model», *Journal of Machine Learning Research* **3**, 1137–1155 (2003). | Il modello neurale della Tappa 5: ogni parola diventa un punto e la rete impara insieme i punti e le probabilità. |
| ○ | T. Mikolov, K. Chen, G. Corrado, J. Dean, «Efficient Estimation of Word Representations in Vector Space», arXiv:1301.3781 (2013). | *word2vec*: le parole-come-punti diventano di uso comune. |
| ○ | A. Vaswani et al., «Attention Is All You Need», *NeurIPS 2017*, arXiv:1706.03762. | Il meccanismo di attenzione: la figura illustrativa in fondo alla Tappa 5. |
| ✔ | T. Brown et al., «Language Models are Few-Shot Learners», arXiv:2005.14165 (2020). | GPT-3: 175 miliardi di parametri — l'unico numero di parametri *ufficiale* fra i modelli citati. Dalla stessa fonte i numeri della «catena di montaggio» della Tappa 5: **96 blocchi** impilati, **12.288** numeri per ogni pezzetto, 96 teste di attenzione; addestrato su circa **300 miliardi** di pezzetti di testo. |
| ○ | J. Kaplan et al., arXiv:2001.08361 (2020); J. Hoffmann et al., arXiv:2203.15556 (2022). | Le «leggi di scala»: la qualità migliora in modo prevedibile con parametri e dati. |
| ○ | L. Ouyang et al., «Training language models to follow instructions with human feedback», arXiv:2203.02155 (2022). | Le correzioni umane dopo l'allenamento (RLHF). |

> ⚠️ **Sulle dimensioni di GPT-4 e dei modelli recenti**: non esistono cifre ufficiali.
> La pagina dice «dell'ordine di mille miliardi di manopole, **secondo le stime pubbliche**»
> e va detto proprio così. Dato ufficiale sicuro da citare: i 175 miliardi di GPT-3.

## 5. Limiti

| | Riferimento | Che cosa sostiene la lezione |
|---|---|---|
| ○ | C. Zhang, S. Bengio, M. Hardt, B. Recht, O. Vinyals, «Understanding deep learning requires rethinking generalization», *ICLR 2017* (poi *CACM* 64(3), 2021). | Le reti possono imparare a memoria anche etichette casuali: la memorizzazione non è un incidente. |
| ○ | M. Belkin, D. Hsu, S. Ma, S. Mandal, «Reconciling modern machine-learning practice and the classical bias–variance trade-off», *PNAS* **116**(32), 15849–15854 (2019). | La storia della Tappa 1 è vera ma non è tutta la storia (*double descent*): utile se in aula c'è qualcuno del mestiere. |
| ○ | E. M. Bender, T. Gebru, A. McMillan-Major, S. Shmitchell, «On the Dangers of Stochastic Parrots», *FAccT 2021*. | Dati, costi e pregiudizi dei grandi modelli linguistici. |
| ○ | Z. Ji et al., «Survey of Hallucination in Natural Language Generation», *ACM Computing Surveys* **55**(12), 2023. | Le «allucinazioni» come proprietà del metodo, non come difetto occasionale. |

## Per approfondire (divulgativi, adatti a chi ha seguito la lezione)

- M. Nielsen, *Neural Networks and Deep Learning* (gratuito, online) — la rete della Tappa 4, spiegata passo passo.
- I. Goodfellow, Y. Bengio, A. Courville, *Deep Learning*, MIT Press 2016 (gratuito, online).
- S. Wolfram, *What Is ChatGPT Doing… and Why Does It Work?*, Wolfram Media 2023.
- 3Blue1Brown, serie video *Neural networks* — ottima come compito a casa visivo.

## Dati usati

- **MNIST**: distribuito attraverso il pacchetto npm `mnist` (10.000 campioni 28×28 in scala di grigi,
  già normalizzati come nell'archivio originale). Archivio originale: LeCun, Cortes, Burges.
- **Testi italiani della Tappa 5**: scritti apposta per questa lezione (`data/corpora.js`),
  quindi liberi da vincoli di licenza e volutamente ripetitivi.

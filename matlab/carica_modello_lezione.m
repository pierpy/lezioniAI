function modello = carica_modello_lezione(percorso)
%CARICA_MODELLO_LEZIONE Legge i pesi della rete usati dalla pagina web.
%   Il file data/mnist-mlp.js contiene, dopo un commento, l'assegnazione
%   "window.MODELLO_MNIST = { ... };". Qui si estrae la parte JSON fra la
%   prima graffa aperta e l'ultima chiusa e la si converte in struct.
%
%   Campi restituiti: architettura, W1 (64x784), b1, W2 (10x64), b2,
%   accuratezza_train, accuratezza_test, n_parametri.

    if nargin < 1
        percorso = fullfile('..', 'data', 'mnist-mlp.js');
    end
    fid = fopen(percorso, 'r');
    if fid < 0
        error('carica_modello_lezione:file', 'File non trovato: %s', percorso);
    end
    testo = fread(fid, Inf, 'char=>char')';
    fclose(fid);

    inizio = find(testo == '{', 1, 'first');
    fine   = find(testo == '}', 1, 'last');
    modello = jsondecode(testo(inizio:fine));
end

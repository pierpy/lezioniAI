%% TAPPA 4 — La rete che legge le cifre scritte a mano
%
% Carica i pesi della rete 784-64-10 usata nella pagina web (addestrata da
% tools/train-mlp.py su 8.000 cifre MNIST) e li usa qui: passaggio in
% avanti, accuratezza, matrice di confusione, e le "maschere" imparate dai
% neuroni nascosti.
%
% Riferimenti:
%   LeCun, Bottou, Bengio & Haffner, Proc. IEEE 86(11):2278-2324, 1998
%   Rumelhart, Hinton & Williams, Nature 323:533-536, 1986 (retropropagazione)

clear; close all;

modello = carica_modello_lezione(fullfile('..','data','mnist-mlp.js'));
fprintf('Architettura: %d - %d - %d   (%d manopole)\n', ...
        modello.architettura, modello.n_parametri);
fprintf('Accuratezza dichiarata: studio %.1f%%, mai viste %.1f%%\n', ...
        100*modello.accuratezza_train, 100*modello.accuratezza_test);

S = load(fullfile('..','data','mnist-sottoinsieme.mat'));
X = double(S.Ximmagini_verifica) / 255;      % N x 784, valori in [0,1]
y = double(S.etichette_verifica);            % N x 1, cifre 0-9

%% Passaggio in avanti (tutto il lotto in una moltiplicazione di matrici)
[probabilita, nascosti] = rete_avanti(X, modello);
[~, previste] = max(probabilita, [], 2);
previste = previste - 1;

accuratezza = mean(previste == y);
fprintf('\nAccuratezza ricalcolata qui: %.2f%% su %d cifre\n', ...
        100*accuratezza, numel(y));

%% Matrice di confusione: dove sbaglia?
confusione = zeros(10);
for k = 1:numel(y)
    confusione(y(k)+1, previste(k)+1) = confusione(y(k)+1, previste(k)+1) + 1;
end
fprintf('\nMatrice di confusione (righe = vero, colonne = previsto):\n');
disp(confusione);

[~, peggiore] = max(sum(confusione, 2) - diag(confusione));
fprintf('La cifra che le riesce peggio è il %d.\n', peggiore-1);

figure('Name', 'Tappa 4 — matrice di confusione');
imagesc(0:9, 0:9, confusione); axis square; colorbar;
xlabel('cifra prevista'); ylabel('cifra vera');
title('Dove sbaglia la rete');

%% Le maschere dei neuroni nascosti: "che cosa cerca" ciascuno
% Colori divergenti: rosso = pesi negativi (lì NON deve esserci inchiostro),
% bianco = indifferente, blu = pesi positivi.
meta = linspace(0, 1, 32)';
mappa_divergente = [ [0.75+0.25*meta, 0.20+0.80*meta, 0.15+0.85*meta]; ...
                     [1-0.84*meta,    1-0.53*meta,    1-0.16*meta   ] ];

figure('Name', 'Tappa 4 — che cosa cercano i 64 neuroni');
for j = 1:64
    subplot(8, 8, j);
    imagesc(reshape(modello.W1(j,:), 28, 28)');
    axis image off;
    caxis([-max(abs(modello.W1(j,:))) max(abs(modello.W1(j,:)))]);
end
colormap(mappa_divergente);

%% Un esempio singolo, con le dieci probabilità
k = find(previste ~= y, 1);          % il primo errore, che è più istruttivo
if isempty(k), k = 1; end
figure('Name', 'Tappa 4 — un caso difficile');
subplot(1,2,1);
imagesc(reshape(X(k,:), 28, 28)'); axis image off; colormap(gray);
title(sprintf('cifra vera: %d', y(k)));
subplot(1,2,2);
barh(0:9, probabilita(k,:));
xlabel('probabilità'); ylabel('cifra');
title(sprintf('la rete dice %d (%.0f%%)', previste(k), 100*max(probabilita(k,:))));

fprintf('\nNeuroni nascosti accesi su questo esempio: %d su 64\n', sum(nascosti(k,:) > 0));

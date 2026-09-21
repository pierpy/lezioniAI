%% TAPPA 3-bis — Allenare la rete da zero, in MATLAB
%
% Stessa rete della Tappa 3, ma qui le manopole partono a caso e vengono
% regolate con la retropropagazione dell'errore: è la versione MATLAB di
% tools/train-mlp.py. Serve a mostrare che "imparare" è esattamente la
% discesa del gradiente della Tappa 1, ripetuta su 25.000 manopole.
%
% Dati: data/mnist-sottoinsieme.mat (3.000 cifre di studio, 1.000 di verifica,
% estratte dall'archivio MNIST).
%
% Riferimenti:
%   Rumelhart, Hinton & Williams, Nature 323:533-536, 1986
%   Robbins & Monro, Ann. Math. Statist. 22(3):400-407, 1951 (approssimazione stocastica)
%   He et al., ICCV 2015, arXiv:1502.01852 (inizializzazione dei pesi)

clear; close all;
rand('seed', 42); randn('seed', 42);     % riproducibilità (MATLAB: rng(42))

S = load(fullfile('..','data','mnist-sottoinsieme.mat'));
X  = double(S.Ximmagini_studio) / 255;    y  = double(S.etichette_studio);
Xv = double(S.Ximmagini_verifica) / 255;  yv = double(S.etichette_verifica);

n = size(X, 1);
H = 32;                 % neuroni nascosti
epoche = 25;
lotto = 64;
passo = 0.25;           % velocità di apprendimento
momento = 0.9;

Y = zeros(n, 10);                          % codifica "uno su dieci"
Y(sub2ind(size(Y), (1:n)', y+1)) = 1;

% inizializzazione di He
W1 = randn(784, H) * sqrt(2/784);  b1 = zeros(1, H);
W2 = randn(H, 10)  * sqrt(2/H);    b2 = zeros(1, 10);
vW1 = zeros(size(W1)); vb1 = zeros(size(b1));
vW2 = zeros(size(W2)); vb2 = zeros(size(b2));

fprintf('\n epoca    errore    studio   verifica\n');
fprintf('----------------------------------------\n');

for ep = 1:epoche
    ordine = randperm(n);
    perdita = 0;
    for i = 1:lotto:n
        idx = ordine(i:min(i+lotto-1, n));
        Xb = X(idx,:);  Yb = Y(idx,:);  m = numel(idx);

        % avanti
        Z1 = Xb*W1 + b1;   A1 = max(Z1, 0);
        Z2 = A1*W2 + b2;   Z2 = Z2 - max(Z2, [], 2);
        P  = exp(Z2);      P = P ./ sum(P, 2);
        perdita = perdita - sum(sum(Yb .* log(P + 1e-9)));

        % indietro (retropropagazione)
        dZ2 = (P - Yb) / m;
        gW2 = A1' * dZ2;          gb2 = sum(dZ2, 1);
        dZ1 = (dZ2 * W2') .* (Z1 > 0);
        gW1 = Xb' * dZ1;          gb1 = sum(dZ1, 1);

        % aggiornamento con momento
        vW1 = momento*vW1 - passo*gW1;   W1 = W1 + vW1;
        vb1 = momento*vb1 - passo*gb1;   b1 = b1 + vb1;
        vW2 = momento*vW2 - passo*gW2;   W2 = W2 + vW2;
        vb2 = momento*vb2 - passo*gb2;   b2 = b2 + vb2;
    end

    acc_studio   = accuratezza(X,  y,  W1, b1, W2, b2);
    acc_verifica = accuratezza(Xv, yv, W1, b1, W2, b2);
    if mod(ep, 5) == 0 || ep == 1
        fprintf('%6d %9.4f %9.3f %10.3f\n', ep, perdita/n, acc_studio, acc_verifica);
    end
end

fprintf('\nCon %d cifre di studio: %.1f%% sulle cifre mai viste.\n', ...
        n, 100*acc_verifica);
fprintf(['La rete della pagina web usa 8.000 cifre e aumento dei dati ' ...
         '(traslazioni), e arriva al 96,5%%.\n']);

figure('Name', 'Tappa 3-bis — maschere imparate qui');
meta = linspace(0, 1, 32)';
mappa_divergente = [ [0.75+0.25*meta, 0.20+0.80*meta, 0.15+0.85*meta]; ...
                     [1-0.84*meta,    1-0.53*meta,    1-0.16*meta   ] ];
for j = 1:min(H, 32)
    subplot(4, 8, j);
    imagesc(reshape(W1(:,j), 28, 28)');
    axis image off;
    caxis([-max(abs(W1(:,j))) max(abs(W1(:,j)))]);
end
colormap(mappa_divergente);

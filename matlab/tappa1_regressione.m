%% TAPPA 1 — Regressione polinomiale, sovradattamento, discesa del gradiente
%
% Versione MATLAB della prima tappa della lezione: gli stessi dati e gli
% stessi conti che girano nel browser, ma in un ambiente dove si possono
% ispezionare numeri e matrici.
%
% Riferimenti:
%   Legendre (1805), Gauss (1809)  — metodo dei minimi quadrati
%   Geman, Bienenstock & Doursat, Neural Computation 4(1):1-58, 1992
%                                  — dilemma distorsione/varianza
%   Bishop, "Pattern Recognition and Machine Learning", Springer 2006, cap. 1 e 3
%
% Testato con Octave 9; scritto per essere compatibile con MATLAB.

clear; close all;

%% 1. I dati: superficie (m²) e prezzo (migliaia di €)
dati = [ 45  96;  52 108;  58 127;  62 118;  70 149;  74 141; ...
         80 168;  88 176;  95 199; 101 188; 110 214; 118 206; ...
        126 231; 134 219; 142 244];
x = dati(:,1);
y = dati(:,2);

dominio = [30 155];

%% 2. Divisione in dati di studio e dati di verifica (1 su 3)
idx_verifica = 2:3:numel(x);
idx_studio   = setdiff(1:numel(x), idx_verifica);

%% 3. Adattamento per gradi crescenti + curva distorsione/varianza
gradi = 1:10;
err_studio   = zeros(size(gradi));
err_verifica = zeros(size(gradi));

for k = 1:numel(gradi)
    c = adatta_polinomio(x(idx_studio), y(idx_studio), gradi(k), dominio);
    err_studio(k)   = errore_medio(y(idx_studio),   valuta_polinomio(c, x(idx_studio),   dominio));
    err_verifica(k) = errore_medio(y(idx_verifica), valuta_polinomio(c, x(idx_verifica), dominio));
end

fprintf('\n grado   errore studio   errore verifica\n');
fprintf('-------------------------------------------\n');
for k = 1:numel(gradi)
    fprintf('%5d %14.2f %16.2f\n', gradi(k), err_studio(k), err_verifica(k));
end
[~, migliore] = min(err_verifica);
fprintf('\nIl grado che generalizza meglio è %d.\n', gradi(migliore));

figure('Name', 'Tappa 1 — distorsione e varianza');
plot(gradi, err_studio, '-o', 'LineWidth', 2); hold on;
plot(gradi, err_verifica, '-s', 'LineWidth', 2);
xlabel('grado del polinomio (complessità del modello)');
ylabel('errore medio [migliaia di €]');
legend('dati di studio', 'dati di verifica (mai visti)', 'Location', 'northwest');
title('Più manopole = meno errore in studio, non in verifica');
grid on;

%% 4. Confronto visivo fra un modello semplice e uno troppo furbo
xg = linspace(dominio(1), dominio(2), 400)';
c1  = adatta_polinomio(x(idx_studio), y(idx_studio), 1,  dominio);
c10 = adatta_polinomio(x(idx_studio), y(idx_studio), 10, dominio);

figure('Name', 'Tappa 1 — retta contro curva troppo furba');
plot(x(idx_studio), y(idx_studio), 'ko', 'MarkerFaceColor', 'k'); hold on;
plot(x(idx_verifica), y(idx_verifica), 'd', 'MarkerSize', 9, 'LineWidth', 2);
plot(xg, valuta_polinomio(c1,  xg, dominio), 'LineWidth', 2);
plot(xg, valuta_polinomio(c10, xg, dominio), 'LineWidth', 2);
ylim([40 300]);
xlabel('superficie [m²]'); ylabel('prezzo [migliaia di €]');
legend('studio', 'verifica', 'grado 1', 'grado 10', 'Location', 'northwest');
grid on;

%% 5. Discesa del gradiente sulle due manopole della retta
% Retta scritta come  y = a + b*u,  con u = x normalizzata in [-1, 1].
u = 2 * (x(idx_studio) - dominio(1)) / (dominio(2) - dominio(1)) - 1;
t = y(idx_studio);
n = numel(t);

% soluzione esatta, per sapere dove si deve arrivare
H = [ones(n,1) u];
ottimo = H \ t;

par   = ottimo + [-95; 95];      % partenza lontana dal minimo
passo = 0.35;
n_passi = 200;
cammino = zeros(n_passi+1, 2);
cammino(1,:) = par';

for k = 1:n_passi
    residuo = H * par - t;
    grad = 2 * (H' * residuo) / n;
    par = par - passo * grad;
    cammino(k+1,:) = par';
end

fprintf('\nDiscesa del gradiente: a = %.2f, b = %.2f\n', par(1), par(2));
fprintf('Soluzione esatta:      a = %.2f, b = %.2f\n', ottimo(1), ottimo(2));

% mappa dell'errore (la "collina")
av = linspace(ottimo(1)-120, ottimo(1)+120, 120);
bv = linspace(ottimo(2)-120, ottimo(2)+120, 120);
[A, B] = meshgrid(av, bv);
COSTO = zeros(size(A));
for i = 1:numel(A)
    COSTO(i) = sqrt(mean((A(i) + B(i)*u - t).^2));
end

figure('Name', 'Tappa 1 — la collina dell''errore');
contourf(A, B, COSTO, 18, 'LineColor', 'none'); hold on;
plot(cammino(:,1), cammino(:,2), 'r-', 'LineWidth', 2);
plot(ottimo(1), ottimo(2), 'p', 'MarkerSize', 14, 'MarkerFaceColor', 'y');
xlabel('manopola 1: altezza'); ylabel('manopola 2: inclinazione');
title('Imparare = scendere fino al fondo della conca');
colorbar;

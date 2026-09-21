%% TAPPA 2 — L'approssimatore universale
%
% Una rete con un solo strato nascosto di sigmoidi:
%       f(x) = a0 + sum_i a_i * sigma(w*(x - c_i))
% I centri c_i sono equispaziati, la pendenza w cresce col numero di
% neuroni, i pesi di uscita a_i si ottengono con i minimi quadrati.
% Si vede l'errore crollare all'aumentare dei neuroni: è la traduzione
% numerica del teorema di approssimazione universale.
%
% Riferimenti:
%   Cybenko, Math. Control Signals Systems 2:303-314, 1989 (DOI 10.1007/BF02551274)
%   Hornik, Stinchcombe & White, Neural Networks 2(5):359-366, 1989
%   Barron, IEEE Trans. Inf. Theory 39(3):930-945, 1993 (velocità di convergenza)

clear; close all;

X0 = 0; X1 = 10;
xg = linspace(X0, X1, 220)';

obiettivi = struct( ...
    'nome',    {'onda', 'gradino', 'montagna', 'battito'}, ...
    'funzione', {@(x) sin(0.95*x), ...
                 @(x) -0.65 + 1.40*(x >= 4.4), ...
                 @(x) 1.15*exp(-((x-3.2).^2)/1.1) - 0.85*exp(-((x-7.1).^2)/2.2), ...
                 @(x) battito(x)});

numeri_neuroni = [1 2 3 5 8 12 20 30 40 60];

fprintf('\n errore medio al variare dei neuroni\n');
fprintf('%-10s', 'neuroni'); fprintf('%10d', numeri_neuroni); fprintf('\n');

errori = zeros(numel(obiettivi), numel(numeri_neuroni));
for io = 1:numel(obiettivi)
    yg = obiettivi(io).funzione(xg);
    for k = 1:numel(numeri_neuroni)
        [~, stima] = rete_sigmoidi(xg, yg, numeri_neuroni(k), [X0 X1]);
        errori(io, k) = errore_medio(yg, stima);
    end
    fprintf('%-10s', obiettivi(io).nome);
    fprintf('%10.4f', errori(io,:));
    fprintf('\n');
end

figure('Name', 'Tappa 2 — errore contro numero di neuroni');
semilogy(numeri_neuroni, errori', '-o', 'LineWidth', 2);
xlabel('numero di neuroni nascosti');
ylabel('errore medio (scala logaritmica)');
legend({obiettivi.nome}, 'Location', 'southwest');
title('Più pezzetti si sommano, meglio si approssima');
grid on;

%% Come è fatta la somma: i singoli pezzetti
n_mostrati = 8;
yg = obiettivi(1).funzione(xg);
[pesi, stima, pezzi] = rete_sigmoidi(xg, yg, n_mostrati, [X0 X1]);

figure('Name', 'Tappa 2 — la somma dei pezzetti');
plot(xg, yg, 'k--', 'LineWidth', 2); hold on;
plot(xg, stima, 'LineWidth', 2.5);
plot(xg, pezzi, 'LineWidth', 0.8);
xlabel('x'); ylabel('f(x)');
legend('obiettivo', 'rete', 'singoli neuroni', 'Location', 'northeast');
title(sprintf('%d neuroni, %d manopole, errore %.4f', ...
      n_mostrati, 2*n_mostrati+1, errore_medio(yg, stima)));
grid on;

fprintf('\nCoefficienti di uscita (le "manopole" a_i):\n');
disp(pesi(:)');

function [probabilita, nascosti] = rete_avanti(X, modello)
%RETE_AVANTI Passaggio in avanti della rete 784 - H (ReLU) - 10 (softmax).
%   X: N x 784 con valori in [0,1].
%   probabilita: N x 10 (ogni riga somma a 1); nascosti: N x H.
%
%   Tutta la "intelligenza" della rete sta in queste quattro righe:
%   due moltiplicazioni di matrici, una soglia e una normalizzazione.

    Z1 = X * modello.W1' + modello.b1(:)';
    nascosti = max(Z1, 0);                        % ReLU
    Z2 = nascosti * modello.W2' + modello.b2(:)';
    Z2 = Z2 - max(Z2, [], 2);                     % stabilità numerica
    E = exp(Z2);
    probabilita = E ./ sum(E, 2);                 % softmax
end

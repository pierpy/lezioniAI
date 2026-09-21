function [pesi, stima, pezzi] = rete_sigmoidi(x, y, n_neuroni, dominio)
%RETE_SIGMOIDI Rete a uno strato nascosto con pesi di uscita ai minimi quadrati.
%   [pesi, stima, pezzi] = RETE_SIGMOIDI(x, y, n, dominio)
%   costruisce n sigmoidi con centri equispaziati su `dominio` e risolve
%   esattamente (minimi quadrati regolarizzati) i soli pesi di uscita.
%   È il modello della Tappa 2: nella rete "vera" anche centri e pendenze
%   sono manopole, imparate con la discesa del gradiente.
%
%   pezzi(:,i) è il contributo del singolo neurone i, utile per mostrare
%   che la curva finale è una somma di gradini morbidi.

    x = x(:); y = y(:);
    ampiezza = dominio(2) - dominio(1);
    pendenza = max(1.2, 4 * n_neuroni / ampiezza);
    centri = dominio(1) + ampiezza * ((1:n_neuroni) - 0.5) / n_neuroni;

    H = [ones(numel(x), 1), 1 ./ (1 + exp(-pendenza * (x - centri)))];

    lambda = 1e-6;
    pesi = (H'*H + lambda*eye(size(H,2))) \ (H'*y);
    stima = H * pesi;
    pezzi = H(:, 2:end) .* pesi(2:end)';
end

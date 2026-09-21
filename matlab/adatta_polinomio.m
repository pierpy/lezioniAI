function c = adatta_polinomio(x, y, grado, dominio)
%ADATTA_POLINOMIO Minimi quadrati (ridge) su base di Vandermonde normalizzata.
%   c = ADATTA_POLINOMIO(x, y, grado, dominio) restituisce i coefficienti del
%   polinomio di grado `grado` che minimizza la somma dei quadrati degli
%   scarti. La variabile x viene riportata in [-1, 1] usando `dominio`:
%   senza questa normalizzazione la matrice di Vandermonde diventa
%   pessimamente condizionata già dal grado 6-7.
%
%   Rif.: Legendre (1805), Gauss (1809); Hoerl & Kennard, Technometrics
%   12(1):55-67, 1970 per il termine di regolarizzazione.

    u = 2 * (x(:) - dominio(1)) / (dominio(2) - dominio(1)) - 1;
    H = ones(numel(u), grado + 1);
    for k = 1:grado
        H(:, k+1) = u.^k;
    end
    lambda = 1e-7;
    c = (H'*H + lambda*eye(grado+1)) \ (H' * y(:));
end

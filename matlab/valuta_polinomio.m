function v = valuta_polinomio(c, x, dominio)
%VALUTA_POLINOMIO Valuta il polinomio prodotto da ADATTA_POLINOMIO.
    u = 2 * (x(:) - dominio(1)) / (dominio(2) - dominio(1)) - 1;
    v = zeros(size(u));
    for k = 1:numel(c)
        v = v + c(k) * u.^(k-1);
    end
end

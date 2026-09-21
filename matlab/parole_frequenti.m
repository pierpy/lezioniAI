function elenco = parole_frequenti(parole, quante)
%PAROLE_FREQUENTI Le `quante` parole più frequenti, in ordine decrescente.
    [uniche, ~, indici] = unique(parole);
    conteggi = accumarray(indici(:), 1);
    [~, ordine] = sort(conteggi, 'descend');
    elenco = uniche(ordine(1:min(quante, numel(uniche))));
end

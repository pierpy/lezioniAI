function parole = tokenizza_testo(testo)
%TOKENIZZA_TESTO Spezza un testo in parole e segni di punteggiatura.
%   Stessa regola usata nella pagina web: tutto minuscolo, punteggiatura
%   separata, apostrofo attaccato alla parola che lo precede.
    testo = lower(testo);
    % apostrofo tipografico (') nella sua forma UTF-8, byte per byte:
    % funziona sia in MATLAB sia in Octave quando il file è letto con fread
    testo = strrep(testo, char([226 128 153]), '''');
    testo = regexprep(testo, '''', ''' ');
    testo = regexprep(testo, '([.,;:!?])', ' $1 ');
    parole = regexp(strtrim(testo), '\s+', 'split');
    parole = parole(~cellfun(@isempty, parole));
end

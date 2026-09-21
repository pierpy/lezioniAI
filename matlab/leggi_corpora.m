function [testi, nomi] = leggi_corpora(percorso)
%LEGGI_CORPORA Estrae i testi di studio dal file data/corpora.js.
    fid = fopen(percorso, 'r');
    if fid < 0
        error('leggi_corpora:file', 'File non trovato: %s', percorso);
    end
    contenuto = fread(fid, Inf, 'char=>char')';
    fclose(fid);
    testi = regexp(contenuto, 'testo:\s*`([^`]*)`', 'tokens');
    testi = cellfun(@(c) c{1}, testi, 'UniformOutput', false);
    nomi = regexp(contenuto, 'nome:\s*''([^'']*)''', 'tokens');
    nomi = cellfun(@(c) c{1}, nomi, 'UniformOutput', false);
end

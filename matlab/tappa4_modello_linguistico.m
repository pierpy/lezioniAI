%% TAPPA 4 — Il modello linguistico a n-grammi
%
% Legge uno dei testi di data/corpora.js, conta quali parole seguono quali
% e genera frasi campionando dalla distribuzione stimata, con temperatura.
% È lo stesso modellino che gira nella pagina web ed è, nella sostanza,
% l'esperimento di Shannon del 1948: la differenza con un modello moderno
% è la scala e il fatto che lì i conteggi sono sostituiti da una rete.
%
% Riferimenti:
%   Shannon, Bell Syst. Tech. J. 27:379-423 e 623-656, 1948 (§3, "approssimazioni")
%   Bengio, Ducharme, Vincent & Jauvin, JMLR 3:1137-1155, 2003
%   Vaswani et al., "Attention Is All You Need", NeurIPS 2017, arXiv:1706.03762

clear; close all;

quale = 1;                    % 1 = bollettino, 2 = cucina, 3 = proverbi, 4 = paese
memoria = 2;                  % quante parole di contesto (1, 2 o 3)
temperatura = 0.8;            % < 1 prevedibile, > 1 fantasioso
n_parole = 40;

[testi, nomi] = leggi_corpora(fullfile('..','data','corpora.js'));
fprintf('Testo di studio: %s\n', nomi{quale});

parole = tokenizza_testo(testi{quale});
vocabolario = unique(parole);
fprintf('%d parole, %d parole diverse\n', numel(parole), numel(vocabolario));

%% Tabella dei conteggi per ogni ordine fino a `memoria`
tavole = cell(1, memoria);
for n = 1:memoria
    tavole{n} = containers.Map();
    for i = n+1:numel(parole)
        contesto = strjoin(parole(i-n:i-1), ' ');
        if isKey(tavole{n}, contesto)
            voci = tavole{n}(contesto);
        else
            voci = struct('parola', {}, 'conteggio', {});
        end
        posizione = find(strcmp({voci.parola}, parole{i}), 1);
        if isempty(posizione)
            voci(end+1) = struct('parola', parole{i}, 'conteggio', 1); %#ok<SAGROW>
        else
            voci(posizione).conteggio = voci(posizione).conteggio + 1;
        end
        tavole{n}(contesto) = voci;
    end
end

%% Generazione, una parola alla volta
scritte = parole(1:memoria);
for k = 1:n_parole
    voci = [];
    for n = min(memoria, numel(scritte)):-1:1        % ripiego su contesti più corti
        contesto = strjoin(scritte(end-n+1:end), ' ');
        if isKey(tavole{n}, contesto)
            voci = tavole{n}(contesto);
            break;
        end
    end
    if isempty(voci), break; end

    pesi = double([voci.conteggio]) .^ (1/temperatura);
    prob = pesi / sum(pesi);
    scelta = find(cumsum(prob) >= rand(), 1);
    scritte{end+1} = voci(scelta).parola; %#ok<SAGROW>

    if k == 1
        fprintf('\nPrimo passo — dopo "%s" le candidate sono:\n', contesto);
        for j = 1:numel(voci)
            fprintf('   %-14s %5.1f%%\n', voci(j).parola, 100*prob(j));
        end
    end
end

frase = strjoin(scritte, ' ');
frase = regexprep(frase, ' ([.,;:!?])', '$1');
frase = regexprep(frase, '(\w'') ', '$1');
fprintf('\nTesto generato (memoria = %d, temperatura = %.1f):\n%s\n', ...
        memoria, temperatura, frase);

%% La tabella delle probabilità dei bigrammi, come immagine
frequenti = parole_frequenti(parole, 14);
M = zeros(numel(frequenti));
for i = 1:numel(frequenti)
    if ~isKey(tavole{1}, frequenti{i}), continue; end
    voci = tavole{1}(frequenti{i});
    totale = sum([voci.conteggio]);
    for j = 1:numel(frequenti)
        p = find(strcmp({voci.parola}, frequenti{j}), 1);
        if ~isempty(p)
            M(i,j) = voci(p).conteggio / totale;
        end
    end
end

figure('Name', 'Tappa 4 — tabella delle probabilità');
imagesc(M); colorbar; axis square;
set(gca, 'XTick', 1:numel(frequenti), 'XTickLabel', frequenti, ...
         'YTick', 1:numel(frequenti), 'YTickLabel', frequenti);
xlabel('parola successiva'); ylabel('parola di adesso');
title('Tutta la "conoscenza" del modello sta qui dentro');

fprintf('\nDensità della tabella: %.1f%% di caselle non vuote.\n', ...
        100 * mean(M(:) > 0));
fprintf(['Con 50.000 parole di vocabolario le caselle sarebbero 2,5 miliardi: ' ...
         'ecco perché servono le reti neurali.\n']);

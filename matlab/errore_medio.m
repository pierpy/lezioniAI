function e = errore_medio(vero, previsto)
%ERRORE_MEDIO Scarto quadratico medio (RMSE) fra valori veri e previsti.
    e = sqrt(mean((vero(:) - previsto(:)).^2));
end

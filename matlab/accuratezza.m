function a = accuratezza(X, y, W1, b1, W2, b2)
%ACCURATEZZA Frazione di cifre classificate correttamente dalla rete.
    A1 = max(X*W1 + b1, 0);
    Z2 = A1*W2 + b2;
    [~, previste] = max(Z2, [], 2);
    a = mean((previste - 1) == y(:));
end

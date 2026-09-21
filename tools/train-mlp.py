#!/usr/bin/env python3
"""Allena la rete neurale 784-64-10 usata nella tappa 3 della lezione.

Architettura: input 784 (28x28) -> nascosto 64 (ReLU) -> uscita 10 (softmax).
Ottimizzatore: SGD con momento (Rumelhart, Hinton & Williams, 1986;
Robbins & Monro, 1951). Aumento dati: traslazioni casuali +/-2 px, cosi'
la rete tollera le cifre disegnate a mano libera col mouse.

uso:  python3 tools/train-mlp.py <cartella-dati-u8> <file-js-output>

Il file prodotto è direttamente data/mnist-mlp.js (JSON avvolto in
"window.MODELLO_MNIST = ...;") così la pagina funziona anche aperta con un
doppio clic, senza server: fetch() di un .json sarebbe bloccato da file://.
"""
import json
import sys

import numpy as np

rng = np.random.default_rng(42)
src = sys.argv[1] if len(sys.argv) > 1 else "."
dst = sys.argv[2] if len(sys.argv) > 2 else "data/mnist-mlp.js"

H, EPOCHS, BATCH, LR, MOM, WD = 64, 90, 64, 0.06, 0.9, 1e-5


def carica(nome):
    X = np.fromfile(f"{src}/{nome}-X.u8", dtype=np.uint8).reshape(-1, 784) / 255.0
    y = np.fromfile(f"{src}/{nome}-y.u8", dtype=np.uint8).astype(int)
    return X.astype(np.float32), y


Xtr, ytr = carica("train")
Xte, yte = carica("test")
print(f"train {Xtr.shape}  test {Xte.shape}")

Ytr = np.eye(10, dtype=np.float32)[ytr]


def trasla(X):
    """Traslazioni casuali di +/-2 pixel (aumento dati)."""
    img = X.reshape(-1, 28, 28).copy()
    for i in range(img.shape[0]):
        if rng.random() < 0.25:
            continue
        dy, dx = rng.integers(-2, 3, size=2)
        img[i] = np.roll(np.roll(img[i], dy, axis=0), dx, axis=1)
        if dy > 0:
            img[i, :dy] = 0
        elif dy < 0:
            img[i, dy:] = 0
        if dx > 0:
            img[i, :, :dx] = 0
        elif dx < 0:
            img[i, :, dx:] = 0
    return img.reshape(-1, 784)


# inizializzazione He (He et al., 2015)
W1 = (rng.normal(0, np.sqrt(2 / 784), (784, H))).astype(np.float32)
b1 = np.zeros(H, dtype=np.float32)
W2 = (rng.normal(0, np.sqrt(2 / H), (H, 10))).astype(np.float32)
b2 = np.zeros(10, dtype=np.float32)
vel = [np.zeros_like(p) for p in (W1, b1, W2, b2)]


def avanti(X):
    Z1 = X @ W1 + b1
    A1 = np.maximum(Z1, 0)
    Z2 = A1 @ W2 + b2
    Z2 -= Z2.max(axis=1, keepdims=True)
    P = np.exp(Z2)
    P /= P.sum(axis=1, keepdims=True)
    return A1, P


def accuratezza(X, y):
    return float((avanti(X)[1].argmax(axis=1) == y).mean())


n = Xtr.shape[0]
for ep in range(EPOCHS):
    Xa = trasla(Xtr)
    lr = LR * 0.5 * (1 + np.cos(np.pi * ep / EPOCHS))   # decadimento a coseno
    perm = rng.permutation(n)
    tot = 0.0
    for i in range(0, n, BATCH):
        idx = perm[i:i + BATCH]
        X, Y = Xa[idx], Ytr[idx]
        m = len(idx)
        A1, P = avanti(X)
        tot += float(-np.sum(Y * np.log(P + 1e-9)))
        dZ2 = (P - Y) / m
        gW2 = A1.T @ dZ2 + WD * W2
        gb2 = dZ2.sum(axis=0)
        dA1 = dZ2 @ W2.T
        dZ1 = dA1 * (A1 > 0)
        gW1 = X.T @ dZ1 + WD * W1
        gb1 = dZ1.sum(axis=0)
        for p, g, v in zip((W1, b1, W2, b2), (gW1, gb1, gW2, gb2), vel):
            v *= MOM
            v -= lr * g
            p += v
    if ep % 10 == 9 or ep == 0:
        print(f"epoca {ep+1:3d}  loss {tot/n:.4f}  "
              f"train {accuratezza(Xtr, ytr):.4f}  test {accuratezza(Xte, yte):.4f}")

acc_tr, acc_te = accuratezza(Xtr, ytr), accuratezza(Xte, yte)
print(f"FINALE  train {acc_tr:.4f}  test {acc_te:.4f}")

modello = {
    "architettura": [784, H, 10],
    "attivazione": "relu",
    "n_parametri": int(W1.size + b1.size + W2.size + b2.size),
    "n_esempi_train": int(n),
    "n_esempi_test": int(Xte.shape[0]),
    "accuratezza_train": round(acc_tr, 4),
    "accuratezza_test": round(acc_te, 4),
    "epoche": EPOCHS,
    "W1": [[round(float(v), 4) for v in r] for r in W1.T],   # H x 784
    "b1": [round(float(v), 4) for v in b1],
    "W2": [[round(float(v), 4) for v in r] for r in W2.T],   # 10 x H
    "b2": [round(float(v), 4) for v in b2],
}
with open(dst, "w") as f:
    f.write("/* Pesi della rete 784-%d-10 addestrata su MNIST (vedi tools/train-mlp.py).\n"
            "   Generato automaticamente: non modificare a mano. */\n"
            "window.MODELLO_MNIST = " % H)
    json.dump(modello, f, separators=(",", ":"))
    f.write(";\n")
print(f"scritto {dst}")

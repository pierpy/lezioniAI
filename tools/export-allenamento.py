#!/usr/bin/env python3
"""Prepara i dati per l'allenamento dal vivo nel browser (Tappa 4).

1.600 cifre MNIST vere (1.200 di studio + 400 di verifica, bilanciate fra le
dieci cifre) impacchettate come due immagini PNG in colonna: ogni riquadro
28x28 è una cifra. Il PNG comprime MNIST molto bene (circa 4 volte meglio
del base64 dei byte grezzi) e il browser lo decodifica da solo, anche
aprendo la pagina con un doppio clic.

uso:  python3 tools/export-allenamento.py <cartella-dati-u8> <file-js-output>
"""
import base64
import io
import sys

import numpy as np
from PIL import Image

src = sys.argv[1] if len(sys.argv) > 1 else "."
dst = sys.argv[2] if len(sys.argv) > 2 else "data/mnist-allenamento.js"
rng = np.random.default_rng(3)


def carica(nome):
    X = np.fromfile(f"{src}/{nome}-X.u8", dtype=np.uint8).reshape(-1, 784)
    y = np.fromfile(f"{src}/{nome}-y.u8", dtype=np.uint8)
    return X, y


def scegli(X, y, per_cifra):
    idx = np.concatenate([rng.choice(np.where(y == d)[0], per_cifra, replace=False)
                          for d in range(10)])
    rng.shuffle(idx)
    return X[idx], y[idx]


def impacchetta(X, y):
    n = X.shape[0]
    sprite = X.reshape(n * 28, 28)
    buf = io.BytesIO()
    Image.fromarray(sprite, mode="L").save(buf, format="PNG", optimize=True)
    return {
        "n": n,
        "etichette": "".join(str(int(v)) for v in y),
        "png": "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode(),
    }


Xtr, ytr = carica("train")
Xte, yte = carica("test")
studio = impacchetta(*scegli(Xtr, ytr, 120))
verifica = impacchetta(*scegli(Xte, yte, 40))

with open(dst, "w") as f:
    f.write("/* 1.600 cifre MNIST per l'allenamento dal vivo della Tappa 4.\n"
            "   Ogni PNG è una colonna di riquadri 28x28, una cifra per riquadro.\n"
            "   Generato da tools/export-allenamento.py: non modificare a mano. */\n"
            "window.MNIST_ALLENAMENTO = ")
    import json
    json.dump({"studio": studio, "verifica": verifica}, f, separators=(",", ":"))
    f.write(";\n")

print(f"scritto {dst}: {studio['n']} di studio, {verifica['n']} di verifica")

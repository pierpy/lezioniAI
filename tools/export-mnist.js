// Esporta il dataset MNIST (pacchetto npm "mnist", 10.000 campioni reali 28x28)
// in un file binario uint8 leggibile da numpy.
//   uso:  npm install mnist && node tools/export-mnist.js <cartella-output>
const fs = require('fs');
const path = require('path');
const mnist = require('mnist');

const out = process.argv[2] || '.';
const set = mnist.set(8000, 2000);

function dump(samples, nome) {
  const n = samples.length;
  const X = Buffer.alloc(n * 784);
  const y = Buffer.alloc(n);
  samples.forEach((s, i) => {
    for (let k = 0; k < 784; k++) X[i * 784 + k] = Math.round(s.input[k] * 255);
    y[i] = s.output.indexOf(1);
  });
  fs.writeFileSync(path.join(out, `${nome}-X.u8`), X);
  fs.writeFileSync(path.join(out, `${nome}-y.u8`), y);
  console.log(`${nome}: ${n} campioni`);
}

dump(set.training, 'train');
dump(set.test, 'test');

import * as tf from "@tensorflow/tfjs";

let modelPromise;
let labelsPromise;

export function loadModel() {
  if (!modelPromise) {
    modelPromise = tf.loadLayersModel("/model/model.json").catch((err) => {
      modelPromise = null;
      throw err;
    });
  }
  return modelPromise;
}

async function loadLabels() {
  if (!labelsPromise) {
    labelsPromise = fetch("/model/labels.json")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load model labels");
        return r.json();
      })
      .catch((err) => {
        labelsPromise = null;
        throw err;
      });
  }
  return labelsPromise;
}

export async function predictImage(file) {
  const [model, labels] = await Promise.all([loadModel(), loadLabels()]);
  const bitmap = await createImageBitmap(file);
  const input = tf.tidy(() => tf.browser.fromPixels(bitmap)
    .resizeBilinear([224, 224])
    .toFloat()
    .div(127.5)
    .sub(1)
    .expandDims(0));
  bitmap.close?.();
  try {
    const output = model.predict(input);
    const values = await output.data();
    output.dispose();
    const ranked = Array.from(values)
      .map((confidence, index) => ({ label: labels[index] ?? `class_${index}`, confidence }))
      .sort((a, b) => b.confidence - a.confidence);
    return ranked.slice(0, 3);
  } finally {
    input.dispose();
  }
}

importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@dev/dist/';

let session = null;
let busy = false;

onmessage = async (e) => {
  const { type } = e.data;
  try {
    if (type === "initModel") {
      if (busy) {
        postMessage({ error: "Model initialization in progress." });
        return;
      };
      busy = true;
      const modelBuffer = new Uint8Array(e.data.modelBuffer);
      session = await ort.InferenceSession.create(modelBuffer);
      postMessage({ type: "initModelDone" });
      busy = false;
    } else if (type === "computeFeatures") {
      if (!session) throw new Error("Model session not initialized.");
      if (busy) {
        postMessage({ error: "Model computation in progress." });
        return;
      };
      busy = true;
      const { tensorData, dims } = e.data;
      const floatData = new Float32Array(tensorData);
      const tensor = new ort.Tensor("float32", floatData, dims);
      const results = await session.run({ input0: tensor });
      postMessage(
        { type: "computeDone", feats: results["output0"].data.buffer },
        [results["output0"].data.buffer]
      );
      busy = false;
    }
  } catch (err) {
    postMessage({ error: err.message });
  }
};

importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@dev/dist/';

let session = null;
console.log("Worker initialized");

onmessage = async (e) => {
  try {
    const { tensorData, dims } = e.data;
    const floatData = new Float32Array(tensorData);
    const tensor = new ort.Tensor('float32', floatData, dims);
    if (!session) {
      const modelUrl = location.origin + '/smalldino.onnx';
      console.log("Worker: loading model from", modelUrl);
      session = await ort.InferenceSession.create(modelUrl);
    }
    console.log("Worker: running inference...");
    const results = await session.run({ input0: tensor });
    const outputBuffer = results['output0'].data.buffer;
    postMessage({ feats: outputBuffer }, [outputBuffer]);
  } catch (err) {
    console.error("Worker error:", err);
    postMessage({ error: err.message });
  }
};

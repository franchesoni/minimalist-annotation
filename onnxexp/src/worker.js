// Set the bundle URL globally BEFORE loading ort.min.js:
importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');
ort.env.wasm.wasmPaths =  'https://cdn.jsdelivr.net/npm/onnxruntime-web@dev/dist/';


onmessage = async function(e) {
  try {
    const { tensorData, dims } = e.data;
    const floatData = new Float32Array(tensorData);
    const tensor = new ort.Tensor('float32', floatData, dims);
    const modelUrl = location.origin + '/smalldino.onnx';
    console.log("Worker: Loading model from", modelUrl);
    const session = await ort.InferenceSession.create(modelUrl);
    console.log("Worker: Running inference...");
    const results = await session.run({ input0: tensor });
    postMessage({ feats: results['output0'].data.buffer }, [results['output0'].data.buffer]);
  } catch (err) {
    console.error("Worker error:", err);
    postMessage({ error: err.message });
  }
};

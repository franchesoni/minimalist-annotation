importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@dev/dist/';

let session = null;
console.log("Worker initialized");

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("modelCache", 1);
    request.onupgradeneeded = (event) => {
      event.target.result.createObjectStore("models");
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = reject;
  });
}

async function getCachedModel() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const txn = db.transaction("models", "readonly");
    const store = txn.objectStore("models");
    const getReq = store.get("smalldino.onnx");
    getReq.onsuccess = () => resolve(getReq.result ? new Uint8Array(getReq.result) : null);
    getReq.onerror = reject;
  });
}

async function cacheModel(modelBuffer) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const txn = db.transaction("models", "readwrite");
    const store = txn.objectStore("models");
    store.put(modelBuffer, "smalldino.onnx");
    txn.oncomplete = resolve;
    txn.onerror = reject;
  });
}

async function loadModel() {
  let modelBuffer = await getCachedModel();
  if (!modelBuffer) {
    console.log("Downloading ONNX model...");
    const response = await fetch(location.origin + "/smalldino.onnx");
    modelBuffer = new Uint8Array(await response.arrayBuffer());
    await cacheModel(modelBuffer);
  } else {
    console.log("Loaded model from IndexedDB!");
  }
  return ort.InferenceSession.create(modelBuffer);
}

onmessage = async (e) => {
  try {
    const { tensorData, dims } = e.data;
    const floatData = new Float32Array(tensorData);
    const tensor = new ort.Tensor("float32", floatData, dims);

    if (!session) {
      session = await loadModel(); // Download model only once
    }

    console.log("Worker: running inference...");
    const results = await session.run({ input0: tensor });
    postMessage({ feats: results["output0"].data.buffer }, [results["output0"].data.buffer]);

  } catch (err) {
    console.error("Worker error:", err);
    postMessage({ error: err.message });
  }
};

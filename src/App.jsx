import React, { useEffect, useState } from "react";
import { Camera, ImagePlus, Leaf, WifiOff, RefreshCw, ShieldAlert } from "lucide-react";
import { loadModel, predictImage } from "./model";
import { prettyClass } from "./classes";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [modelStatus, setModelStatus] = useState("Checking model…");
  const [error, setError] = useState("");

  useEffect(() => {
    loadModel()
      .then(() => setModelStatus("Offline model ready"))
      .catch(() => setModelStatus("Model not installed yet"));
  }, []);

  function chooseFile(next) {
    if (!next) return;
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setResult(null);
    setError("");
  }

  async function scan() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const predictions = await predictImage(file);
      setResult(predictions);
      setModelStatus("Offline model ready");
    } catch (e) {
      setError("The trained model is missing or could not be loaded. Follow the README training steps, then rebuild the app.");
      setModelStatus("Model unavailable");
    } finally {
      setBusy(false);
    }
  }

  const best = result?.[0];
  const isFresh = best?.label.startsWith("fresh_");

  return <main className="shell">
    <header className="top">
      <div className="brand"><span className="logo"><Leaf size={23}/></span><div><p className="eyebrow">SMART FOOD CHECK</p><h1>Produce Check</h1></div></div>
      <div className="offline"><WifiOff size={15}/> Offline capable</div>
    </header>

    <section className="intro">
      <p className="eyebrow">A QUICK VISUAL CHECK</p>
      <h2>Is it fresh or<br/><em>spoiled?</em></h2>
      <p className="sub">Take a clear photo of one fruit or vegetable. The on-device model estimates its visible condition.</p>
    </section>

    <section className="scanner">
      <div className="status"><span className={`dot ${modelStatus.includes("ready") ? "ok" : ""}`}></span>{modelStatus}</div>
      <label className="drop" htmlFor="photo">
        {preview ? <img src={preview} alt="Selected produce"/> : <div className="placeholder"><Camera size={36}/><strong>Choose a photo</strong><span>Use your camera or select from gallery</span></div>}
      </label>
      <input id="photo" type="file" accept="image/*" capture="environment" onChange={e => chooseFile(e.target.files?.[0])}/>
      <div className="actions">
        <label className="secondary" htmlFor="photo"><ImagePlus size={18}/> {preview ? "Change photo" : "Camera / Gallery"}</label>
        <button className="primary" onClick={scan} disabled={!file || busy || modelStatus === "Model not installed yet"}>{busy ? <RefreshCw className="spin" size={18}/> : <Leaf size={18}/>} {busy ? "Checking…" : "Check freshness"}</button>
      </div>
      {error && <p className="error">{error}</p>}
    </section>

    {best && <section className={`result ${isFresh ? "fresh" : "rotten"}`}>
      <p className="eyebrow">IMAGE ESTIMATE</p>
      <h2>{isFresh ? "Looks fresh" : "Possible spoilage"}</h2>
      <p className="prediction">{prettyClass(best.label)}</p>
      <div className="confidence"><span>Model confidence</span><strong>{(best.confidence * 100).toFixed(1)}%</strong></div>
      <div className="bar"><span style={{width: `${best.confidence * 100}%`}}/></div>
      <details><summary>Other possible results</summary>{result.slice(1).map(x=><p key={x.label}>{prettyClass(x.label)} — {(x.confidence*100).toFixed(1)}%</p>)}</details>
    </section>}

    <section className="notice"><ShieldAlert size={19}/><p><strong>Important food-safety note</strong><br/>This is an experimental visual estimate, not a food-safety test. It cannot detect internal decay, bacteria, toxins, or contamination. If food smells unusual, has mould, leaks, or seems unsafe, do not eat it.</p></section>
    <footer>Runs on your device after installation and the first model download. Your selected photo is processed locally.</footer>
  </main>;
}
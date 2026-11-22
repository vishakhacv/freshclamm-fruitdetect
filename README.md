# Produce Check — Offline Android-friendly freshness scanner

An installable Progressive Web App (PWA) for estimating visible freshness from a photo. It uses TensorFlow.js in the browser, so inference runs on the phone after the app and model have been cached. No Android Studio is required.

## Scope and limitations

The starter dataset has 20 labels: fresh and rotten versions of apple, banana, orange, mango, strawberry, potato, cucumber, carrot, tomato and bell pepper. It cannot recognise every possible fruit or vegetable. An unfamiliar item may be misclassified. This is a visual estimate, not a food-safety test; it cannot detect bacteria, toxins, internal decay or contamination.

## 1. Requirements

- Windows 10/11, macOS or Linux
- Python 3.10 (recommended) and pip
- Node.js 18 or newer and npm
- Internet for one-time dataset/model setup and initial app installation

## 2. Download training and test images

From this project folder:

```bash
python tools/prepare_dataset.py
```

This downloads the public dataset repository and copies its images into:

```text
dataset/
  train/
    fresh_apple/
    rotten_apple/
    ... (20 class folders)
  test/
    fresh_apple/
    rotten_apple/
    ... (same 20 class folders)
```

The images are downloaded into this project folder. The dataset is not embedded in the source ZIP because the image archive is large; the script fetches the train/test files for you. Keep the dataset source attribution and check the original Kaggle terms before redistribution.

## 3. Set up Python and train/export the model

Windows PowerShell:

```powershell
py -3.10 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r training/requirements.txt
python training/train.py --data dataset --output public/model --epochs 12
```

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and activate again.

The training script uses MobileNetV2 transfer learning, evaluates against the separate test folder, and exports TensorFlow.js files into `public/model/` (`model.json`, weight shard(s), and `labels.json`). First training may download ImageNet backbone weights. A GPU is helpful but not required; training can take a while on CPU.

## 4. Install JavaScript libraries and run

Open a second terminal in the project folder:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## 5. Build for Android offline use

```bash
npm run build
```

Deploy the `dist/` folder to an HTTPS static host. Open that HTTPS address in Chrome on Android, allow the app and model to finish loading once, then use Chrome menu → **Install app** or **Add to Home screen**. Launch it once while online so the PWA service worker caches the app shell and model. After that, predictions run offline. For a local network test, the development server must be reachable from the phone; production install requires HTTPS.

## 6. Verify offline

1. Open the installed app while online and wait until it says **Offline model ready**.
2. Scan a sample image once.
3. Turn on airplane mode.
4. Reopen the installed app and scan another image.

If model files are too large for the service worker cache, reduce the model size or adjust `maximumFileSizeToCacheInBytes` in `vite.config.js`.

## Dataset source

`C241-PS021/Fruits-Vegetables-Dataset` on GitHub, which documents separate train/test folders and 20 fresh/rotten fruit and vegetable classes. Original data is sourced from Kaggle; retain attribution and review the source terms for your intended use.

## Troubleshooting

- `Dataset not found`: run `python tools/prepare_dataset.py` first.
- Missing class folders: inspect `dataset/train` and `dataset/test`; both must contain matching folders.
- `Model not installed yet`: complete training and check for `public/model/model.json` and `.bin` weight shards.
- TensorFlow install errors: use a fresh Python 3.10 virtual environment; do not mix this environment with other TensorFlow projects.
- Browser camera: use the file chooser/camera on HTTPS or localhost; camera permissions are controlled by Android/Chrome.

## Project layout

```text
src/                 React app and offline prediction code
public/model/        trained TensorFlow.js model goes here
training/            Python dependencies and model training/export
tools/               one-time dataset downloader/organiser
dataset/             downloaded train and test image folders
```

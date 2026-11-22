"""
Downloads the public 20-class train/test dataset repository and normalises its
folder names into dataset/train and dataset/test.
Requires internet for this one-time setup only.
"""
import io, re, shutil, urllib.request, zipfile
from pathlib import Path

URL = "https://codeload.github.com/C241-PS021/Fruits-Vegetables-Dataset/zip/refs/heads/main"
ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "dataset"
CANON = {
 "apple":"apple", "banana":"banana", "orange":"orange", "mango":"mango",
 "strawberry":"strawberry", "potato":"potato", "cucumber":"cucumber",
 "carrot":"carrot", "tomato":"tomato", "bellpepper":"bell_pepper",
 "bell pepper":"bell_pepper", "capsicum":"bell_pepper"
}

def class_name(folder):
    s = re.sub(r"[^a-z]", "", folder.lower())
    condition = "fresh" if "fresh" in s else ("rotten" if "rotten" in s else None)
    if not condition: return None
    for key, val in CANON.items():
        if re.sub(r"[^a-z]", "", key) in s:
            return f"{condition}_{val}"
    return None

def main():
    print("Downloading dataset archive...")
    req = urllib.request.Request(URL, headers={"User-Agent":"Mozilla/5.0"})
    data = urllib.request.urlopen(req, timeout=120).read()
    print(f"Downloaded {len(data)/1024/1024:.1f} MB. Extracting...")
    temp = ROOT / "_dataset_download"
    shutil.rmtree(temp, ignore_errors=True)
    temp.mkdir()
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        z.extractall(temp)
    image_ext = {".jpg",".jpeg",".png",".webp"}
    found = 0
    for split in ("train","test"):
        split_dirs = [p for p in temp.rglob("*") if p.is_dir() and p.name.lower() == split]
        if not split_dirs:
            continue
        # Choose the split folder with the most immediate class subfolders.
        src = max(split_dirs, key=lambda p: sum(x.is_dir() for x in p.iterdir()))
        for folder in src.iterdir():
            if not folder.is_dir(): continue
            label = class_name(folder.name)
            if not label: continue
            target = DEST / split / label
            target.mkdir(parents=True, exist_ok=True)
            for img in folder.rglob("*"):
                if img.is_file() and img.suffix.lower() in image_ext:
                    shutil.copy2(img, target / img.name)
                    found += 1
    shutil.rmtree(temp, ignore_errors=True)
    counts = {s: sum(1 for p in (DEST/s).glob("*/*") if p.is_file()) for s in ("train","test")}
    print(f"Copied {found} images. Counts: {counts}")
    classes = sorted(p.name for p in (DEST/"train").iterdir() if p.is_dir()) if (DEST/"train").exists() else []
    print("Classes found:", classes)
    if len(classes) < 10:
        print("WARNING: Fewer than 10 classes detected. Inspect the source folder names and README before training.")
    else:
        print("Dataset ready at", DEST)

if __name__ == "__main__":
    main()

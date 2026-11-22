import argparse, json, os
from pathlib import Path
import tensorflow as tf
from tensorflow.keras import layers

IMG_SIZE = (224, 224)
BATCH = 32

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="dataset")
    parser.add_argument("--output", default="public/model")
    parser.add_argument("--epochs", type=int, default=12)
    args = parser.parse_args()
    root = Path(args.data)
    train_dir, test_dir = root / "train", root / "test"
    if not train_dir.exists() or not test_dir.exists():
        raise SystemExit("Dataset not found. Run: python tools/prepare_dataset.py")

    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir, image_size=IMG_SIZE, batch_size=BATCH, label_mode="categorical",
        shuffle=True, seed=42
    )
    test_ds = tf.keras.utils.image_dataset_from_directory(
        test_dir, image_size=IMG_SIZE, batch_size=BATCH, label_mode="categorical",
        shuffle=False
    )
    class_names = train_ds.class_names
    if len(class_names) < 2:
        raise SystemExit(f"Expected multiple class folders; found {class_names}")
    if set(class_names) != set(test_ds.class_names):
        raise SystemExit("Train and test class folders do not match.")
    (Path(args.output)).mkdir(parents=True, exist_ok=True)

    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(autotune)
    test_ds = test_ds.prefetch(autotune)

    base = tf.keras.applications.MobileNetV2(
        input_shape=(224,224,3), include_top=False, weights="imagenet"
    )
    base.trainable = False
    inputs = tf.keras.Input(shape=(224,224,3))
    x = layers.Rescaling(1./127.5, offset=-1)(inputs)
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.25)(x)
    outputs = layers.Dense(len(class_names), activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs)
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True, monitor="val_loss")
    ]
    model.fit(train_ds, validation_data=test_ds, epochs=args.epochs, callbacks=callbacks)
    loss, accuracy = model.evaluate(test_ds, verbose=1)
    print(f"TEST accuracy: {accuracy:.4f} | test loss: {loss:.4f}")
    out = Path(args.output)
    model.save(out / "freshness_model.keras")

    (Path(args.output) / "labels.json").write_text(
        json.dumps(class_names, indent=2)
    )

    print("Training and testing completed!")
    print(f"Keras model saved to: {out / 'freshness_model.keras'}")
    print(f"Labels saved to: {out / 'labels.json'}")
    print("Next: convert the model to TensorFlow.js format.")

if __name__ == "__main__":
    main()

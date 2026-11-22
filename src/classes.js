export const CLASSES = [
  "fresh_apple", "rotten_apple",
  "fresh_banana", "rotten_banana",
  "fresh_orange", "rotten_orange",
  "fresh_mango", "rotten_mango",
  "fresh_strawberry", "rotten_strawberry",
  "fresh_potato", "rotten_potato",
  "fresh_cucumber", "rotten_cucumber",
  "fresh_carrot", "rotten_carrot",
  "fresh_tomato", "rotten_tomato",
  "fresh_bell_pepper", "rotten_bell_pepper"
];

export function prettyClass(name) {
  const [condition, ...produce] = name.split("_");
  return `${condition === "fresh" ? "Fresh / good" : "Rotten / spoiled"} ${produce.join(" ")}`;
}
import pandas as pd

df = pd.read_csv("dataset.csv")

print("Label distribution:")
print(df["label"].value_counts())

print("\nAttack samples:")
print((df["label"] == 1).sum())

print("\nNormal samples:")
print((df["label"] == 0).sum())
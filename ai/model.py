"""
model.py — The ANN architecture, matching Table 1 of the paper:

    Layers:            3 (input, hidden, output)  -> here: input -> 64 -> 128 -> 64 -> output
    Neurons per layer:  [64, 128, 64]
    Activation:         ReLU
    Optimizer:          Adam
    Learning rate:       0.001
    Batch size:          32
    Epochs:              50
    Loss:                Cross-Entropy (binary, via BCEWithLogitsLoss)
    Dropout:             0.5
    Early stopping:      patience = 10 epochs

Note: the paper lists "3 layers" but also gives 3 neuron counts [64,128,64]
for what reads as 3 *hidden* layers. We implement 3 hidden layers with those
widths, which is the more common reading in this literature and gives the
network enough capacity to be worth tuning with the Aquila Optimizer.
"""

import torch
import torch.nn as nn


class IntrusionANN(nn.Module):
    def __init__(self, n_features: int, hidden=(64, 128, 64), dropout=0.5):
        super().__init__()
        layers = []
        in_dim = n_features
        for h in hidden:
            layers += [nn.Linear(in_dim, h), nn.ReLU(), nn.Dropout(dropout)]
            in_dim = h
        layers += [nn.Linear(in_dim, 1)]  # single logit: binary attack/normal
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x).squeeze(-1)  # logits, shape (batch,)


def count_params(model: nn.Module) -> int:
    return sum(p.numel() for p in model.parameters())


if __name__ == "__main__":
    m = IntrusionANN(n_features=10)
    print(m)
    print("Total trainable parameters:", count_params(m))
    x = torch.randn(4, 10)
    print("Sample forward output shape:", m(x).shape)
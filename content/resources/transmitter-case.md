---
id: transmitter-case
title: RC Transmitter — 3D-Printed Case
description: Print-ready STL files for the RC transmitter's case, control sticks,
  handle, and buttons, plus the Fusion design. Fits transmitter boards V3 and V4.
topic: fabrication
kind: CAD model
status: Available
permalink: /resources/transmitter-case/
audience:
- Students
- Faculty Mentors
- Pod Leads
assetIds:
- tx-3d-print-controller-top
- tx-3d-print-controller-bottom
- tx-3d-print-handle
- tx-3d-print-left-stick1
- tx-3d-print-right-stick
- tx-3d-print-bind-button
- tx-3d-print-back-buttons
- tx-3d-print-rl-trim-button
- tx-3d-print-rr-trim-button
- tx-3d-print-v4-trasmitter-case
updated: '2026-11-08'
format: STL, F3Z
related:
- transmitter-v4-pcb
- transmitter-configurator
delivery: download
origin: contributed
subjects:
- UAS
activities:
- Building & Integration
platforms:
- Fixed-Wing UAS
keywords:
- transmitter
- case
- enclosure
- 3D printing
- STL
---

## About these files

The printed case for the Altitude Unknown RC transmitter. It fits both the V3 and V4 transmitter boards. Build the circuit board from the [RC Transmitter V4 PCB design](/resources/transmitter-v4-pcb/), then print these parts to house it.

## What to print

| File | Part | Print |
|---|---|---|
| `Controller Top.stl` | Top half of the case | 1 |
| `Controller Bottom.stl` | Bottom half of the case | 1 |
| `Handle.stl` | Handle | 1 |
| `Left Stick1.stl` | Left control stick | 1 |
| `Right Stick.stl` | Right control stick | 1 |
| `Back Buttons.stl` | Caps for the right-angle buttons along the top | 5 |
| `BIND Button.stl` | Bind button | 1 |
| `RL-TRIM Button.stl` | Rudder trim, left | 1 |
| `RR-TRIM Button.stl` | Rudder trim, right | 1 |

## Print settings

- **Material:** PLA works best. PETG also works.
- **Orientation:** the default orientation your slicer chooses. Mike uses Bambu Studio's default.
- **Supports:** on.

## Fusion design

`v4 Trasmitter Case.f3z` is the complete case assembly in Autodesk Fusion. It includes models of the circuit board, battery, LCD, and joysticks, so you can check the fit before you change a part. It is a large file (136 MiB).

These downloads preserve the original file contents and filenames. See the [Electronic Designs](/electronics/) section for the transmitter's circuit board and other ASCEND boards.

---
id: transmitter-v4-pcb
title: RC Transmitter V4 — PCB Design
description: The complete circuit-board design for the Altitude Unknown RC transmitter,
  Version 4, with Fusion, schematic, board, BOM, and Gerber files.
topic: electronics
kind: PCB design
status: Available
permalink: /resources/transmitter-v4-pcb/
audience:
- Students
- Faculty Mentors
- Pod Leads
assetIds:
- ecad-transmitter-v4-transmitter-v4-f3z
- ecad-transmitter-v4-transmitter-v4-sch
- ecad-transmitter-v4-transmitter-v4-brd
- ecad-transmitter-v4-transmitter-v4-bom
- ecad-transmitter-v4-transmitter-v4-manufacturing-output
updated: '2026-11-07'
format: F3Z, SCH, BRD, XLSX, ZIP
related:
- transmitter-configurator
- transmitter-case
- flight-controller-v4-pcb
delivery: download
origin: contributed
subjects:
- UAS
activities:
- Building & Integration
platforms:
- Fixed-Wing UAS
keywords:
- PCB
- circuit board
- schematic
- Gerber
- EAGLE
- LoRa
- transmitter
---

## About this board

Version 4 of the Altitude Unknown RC transmitter, the radio used to fly ASCEND aircraft. The board carries:

- An **ATSAMD21G** microcontroller.
- An **RFM95W LoRa radio** (915 MHz) for the control link.
- An **ESP32-C3** module and **FRAM** memory for stored model settings.
- A **LiPo charge controller**, with micro-USB connectors.
- **Two control gimbals** (aileron/elevator and throttle/rudder), trim and menu buttons, a speaker, status LEDs, and a header for an LCD.

Print its case from the [RC Transmitter 3D-printed case](/resources/transmitter-case/) files, then configure the finished transmitter with the [Altitude Unknown RC Transmitter Configurator](/resources/transmitter-configurator/).

## The files

- **Fusion design** (`Transmitter_V4.f3z`): the full electronics design. Open it in Autodesk Fusion.
- **Schematic** (`Transmitter_V4.sch`) and **board layout** (`Transmitter_V4.brd`): EAGLE files. Open them in Fusion or EAGLE, or import them into KiCad.
- **Bill of materials** (`Transmitter V4 BOM.xlsx`): reference designators, values, and part numbers. Open it in Excel or any spreadsheet program.
- **Manufacturing files** (`Transmitter_V4_Manufacturing_Output.zip`): Gerber and drill files for making the board, plus pick-and-place files for assembly. Upload it to a PCB manufacturer.

## Having your own boards made

1. Upload `Transmitter_V4_Manufacturing_Output.zip` to a PCB manufacturer's website. It contains the Gerber and drill files they need.
2. Order the parts listed in the BOM. Part numbers ending in `-ND` are Digi-Key numbers; the two gimbals are listed by their JLCPCB part numbers.
3. Solder the parts, or ask the manufacturer to assemble the board using the pick-and-place files in the ZIP.

Leave **JP2** empty. It is the programming header, and the BOM marks it *Do not Solder*.

These downloads preserve the original file contents and filenames. See the [Electronic Designs](/electronics/) section for the other ASCEND boards.

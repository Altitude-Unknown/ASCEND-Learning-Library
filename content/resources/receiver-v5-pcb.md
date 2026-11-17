---
id: receiver-v5-pcb
title: ASCEND RC Receiver V5 — PCB Design
description: The circuit-board design for the ASCEND RC receiver, a LoRa receiver
  with servo outputs, an IMU and a pressure sensor, with Fusion, schematic, board,
  and Gerber files.
topic: electronics
kind: PCB design
status: Available
permalink: /resources/receiver-v5-pcb/
audience:
- Students
- Faculty Mentors
- Pod Leads
assetIds:
- ecad-receiver-v5-receiver-f3z
- ecad-receiver-v5-rx-rev-1
- ecad-receiver-v5-receiver-brd
- ecad-receiver-v5-receiver-v233-manufacturing-output
updated: '2026-11-16'
format: F3Z, SCH, BRD, ZIP
related:
- transmitter-v4-pcb
- flight-controller-v4-pcb
- servo-receiver-connection-video
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
- receiver
- LoRa
- servo
- SAMD21
- IMU
---

## About this board

Version 5 of the ASCEND RC receiver, the board in the aircraft that receives the pilot's commands from the [RC Transmitter V4](/resources/transmitter-v4-pcb/) and drives the servos:

- An **ATSAMD21G** microcontroller with a **micro-USB** connector for programming and power.
- An **RFM95W LoRa radio** (915 MHz) with an SMA antenna connector.
- Flight sensors: an **LSM6DSO32** IMU (accelerometer and gyroscope) and an **MS5607** pressure sensor, plus **FRAM** memory.
- A servo header for throttle, aileron, elevator, and rudder, powered by 5 V from the ESC's BEC.
- A header with a serial port and the I2C bus, and a circuit that measures the servo-rail voltage.
- A 3.3 V regulator, a reset button, a bind button, and power and status LEDs.

## The files

- **Fusion design** (`Receiver.f3z`): the full electronics design. Open it in Autodesk Fusion.
- **Schematic** (`Rx-Rev-1.sch`) and **board layout** (`Receiver.brd`): EAGLE files. Open them in Fusion or EAGLE, or import them into KiCad.
- **Manufacturing files** (`Receiver_v233_Manufacturing_Output.zip`): Gerber and drill files for making the board, plus pick-and-place files for assembly. Upload it to a PCB manufacturer.

A bill of materials with part numbers is coming soon. Until then, the schematic lists every part and its value.

## Having your own boards made

1. Upload `Receiver_v233_Manufacturing_Output.zip` to a PCB manufacturer's website. It contains the Gerber and drill files they need.
2. Order the parts shown in the schematic.
3. Solder the parts, or ask the manufacturer to assemble the board using the pick-and-place files in the ZIP.

Leave **JP1** empty unless you are programming the microcontroller directly. It is the programming header.

These downloads preserve the original file contents and filenames. See the [Electronic Designs](/electronics/) section for the other ASCEND boards.

---
id: flight-controller-v4-pcb
title: ASCEND Flight Controller V4 — PCB Design
description: The complete circuit-board design for the ASCEND flight controller, an
  ArduPlane-compatible autopilot with a built-in LoRa receiver, with Fusion, schematic,
  board, BOM, and Gerber files.
topic: electronics
kind: PCB design
status: Available
permalink: /resources/flight-controller-v4-pcb/
audience:
- Students
- Faculty Mentors
- Pod Leads
assetIds:
- ecad-flight-controller-v4-ascend-flight-controllerv4
- ecad-flight-controller-v4-ascend-flight-controllerv4-sch
- ecad-flight-controller-v4-ascend-flight-controllerv4-brd
- ecad-flight-controller-v4-bom-flight-controller-v4
- ecad-flight-controller-v4-ascend-flight-controller-v241-manufacturing-output
updated: '2026-11-11'
format: F3Z, SCH, BRD, XLSX, ZIP
related:
- transmitter-v4-pcb
- flight-controller-rx-video
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
- flight controller
- autopilot
- ArduPilot
- ArduPlane
- STM32
- LoRa
---

## About this board

Version 4 of the ASCEND flight controller, the autopilot board for ASCEND fixed-wing aircraft. It combines an ArduPlane-compatible flight controller and a LoRa radio receiver on one board:

- An **STM32H743** microcontroller runs the autopilot. It has its own **USB-C** connector.
- Flight sensors: an **LSM6DSO32** IMU (accelerometer and gyroscope), an **MS5611** barometer, an **MMC5983MA** magnetometer, and a **u-blox NEO-M9N** GPS with a chip antenna.
- A built-in receiver: an **ATSAMD21G** microcontroller with an **RFM95W LoRa radio** (915 MHz) and **FRAM** memory. It passes the pilot's commands to the autopilot as SBUS. It has its own **micro-USB** connector and works with the [RC Transmitter V4](/resources/transmitter-v4-pcb/).
- A servo header for throttle, aileron, elevator, rudder, and two auxiliary outputs, plus two I2C headers.
- A 3.3 V regulator, push buttons (including arming and bind), status and sensor-health LEDs, and a speaker.

## The files

- **Fusion design** (`ASCEND_Flight_ControllerV4.f3z`): the full electronics design. Open it in Autodesk Fusion.
- **Schematic** (`ASCEND-Flight_ControllerV4.sch`) and **board layout** (`ASCEND-Flight_ControllerV4.brd`): EAGLE files. Open them in Fusion or EAGLE, or import them into KiCad.
- **Build guide** (`BOM-Flight-controller-V4.xlsx`): use the *Build* sheet. It lists every part with its Digi-Key number, the reference designators where it goes on the board, and whether it must be placed the right way around.
- **Manufacturing files** (`ASCEND-Flight_Controller_v241_Manufacturing_Output.zip`): Gerber and drill files for making the board, plus pick-and-place files for assembly. Upload it to a PCB manufacturer.

## Having your own boards made

1. Upload `ASCEND-Flight_Controller_v241_Manufacturing_Output.zip` to a PCB manufacturer's website. It contains the Gerber and drill files they need.
2. Order the parts listed on the *Build* sheet, using its Digi-Key numbers.
3. Solder the parts, or ask the manufacturer to assemble the board using the pick-and-place files in the ZIP. The *Build* sheet marks the parts that must be placed the right way around.

Leave **JP3** empty. It is the programming header, and the build guide marks it *Do not Solder*.

This page publishes the hardware design. Firmware and setup instructions for this board are not on the site yet.

These downloads preserve the original file contents and filenames. See the [Electronic Designs](/electronics/) section for the other ASCEND boards.

---
id: transmitter-configurator
title: Altitude Unknown RC Transmitter Configurator
description: Configure model settings and instructor/student options for the Altitude Unknown RC transmitter.
topic: uas
kind: Software / firmware
audience:
- Students
- Faculty Mentors
- Pod Leads
status: Available
delivery: external
origin: external
updated: '2026-11-09'
subjects:
- UAS
platforms:
- Fixed-Wing UAS
actionLabel: View release on GitHub
format: ZIP
version: '2026.11.09'
permalink: /resources/transmitter-configurator/
externalUrl: https://github.com/Altitude-Unknown/RC-Airplane/releases/tag/transmitter-gui-v2026.11.09
related:
- flight-lab-rc
---

## Download the application

Install the desktop application that matches your computer. Downloads are hosted on GitHub.

- [Download for macOS — Apple Silicon / ARM64](https://github.com/Altitude-Unknown/RC-Airplane/releases/download/transmitter-gui-v2026.11.09/Altitude-Unknown-RC-Configurator-macOS-ARM64.zip)
- [Download for Windows — x64](https://github.com/Altitude-Unknown/RC-Airplane/releases/download/transmitter-gui-v2026.11.09/Altitude-Unknown-RC-Configurator-Windows-x64.zip)
- [Download for Raspberry Pi — ARM64](https://github.com/Altitude-Unknown/RC-Airplane/releases/download/transmitter-gui-v2026.11.09/Altitude-Unknown-RC-Configurator-Raspberry-Pi-ARM64.zip)

These links download version 2026.11.09. [Check GitHub for newer releases](https://github.com/Altitude-Unknown/RC-Airplane/releases).

The Mac package is for Apple Silicon; this release does not include an Intel Mac application package.

## Connect your transmitter

Extract the ZIP and open the application. Follow the [RC system manual](https://github.com/Altitude-Unknown/RC-Airplane/blob/main/MANUAL.md#desktop-transmitter-configurator) to put your supported transmitter into USB configuration mode, connect it using a USB data cable, and select its serial port in the configurator.

The configurator manages transmitter model settings and instructor/student setup. Its Firmware Update tab supports the project's hardware update workflow. Follow the release notes and manual when selecting firmware for a particular board.

Recent releases added:

- **Flight controller updates** (2026.11.01). The Firmware Update tab can flash ArduPlane onto the ASCEND flight controller Rev.2 from GitHub, keeping its parameters and calibrations.
- **Sensor orientation built in** (2026.11.09). The ASCEND flight controller Rev.2 firmware now knows how its sensors are mounted, so the standard mounting is `AHRS_ORIENTATION=0`. Boards set up with 2026.11.01 used `AHRS_ORIENTATION=14`: after updating, set it to 0 and redo the accelerometer and compass calibrations before flight.
- **One receiver firmware** (2026.11.01). The same receiver firmware drives servos on the Rx V4 and sends SBUS to the ASCEND flight controller. Its Rx V4 servo outputs have not been tested yet, so bench-check a Rx V4 before flight. Updating a receiver clears its bind code, so rebind and check every control, the throttle safety, and the failsafe with the propeller removed.
- **Speaker Test tab** (2026.10.19), for checking the transmitter's flight-timer alarms. It needs the transmitter firmware from that release or later.

## Documentation and source

- [Read the RC system manual](https://github.com/Altitude-Unknown/RC-Airplane/blob/main/MANUAL.md). It describes release 2026.11.09 and also covers flying through the BOREALIS V2 and ASCEND flight controllers.
- [Read this release's notes and firmware information](https://github.com/Altitude-Unknown/RC-Airplane/releases/tag/transmitter-gui-v2026.11.09).
- [Browse the source code and hardware project](https://github.com/Altitude-Unknown/RC-Airplane).
- [Download Flight Lab RC for simulator practice](/resources/flight-lab-rc/).

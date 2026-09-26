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
updated: '2026-09-26'
subjects:
- UAS
platforms:
- Fixed-Wing UAS
actionLabel: View release on GitHub
format: ZIP
version: '2026.09.22.1'
permalink: /resources/transmitter-configurator/
externalUrl: https://github.com/Altitude-Unknown/RC-Airplane/releases/tag/transmitter-gui-v2026.09.22.1
related:
- flight-lab-rc
---

## Download the application

Install the desktop application that matches your computer. Downloads are hosted on GitHub.

- [Download for macOS — Apple Silicon / ARM64](https://github.com/Altitude-Unknown/RC-Airplane/releases/download/transmitter-gui-v2026.09.22.1/Altitude-Unknown-RC-Configurator-macOS-ARM64.zip)
- [Download for Windows — x64](https://github.com/Altitude-Unknown/RC-Airplane/releases/download/transmitter-gui-v2026.09.22.1/Altitude-Unknown-RC-Configurator-Windows-x64.zip)
- [Download for Raspberry Pi — ARM64](https://github.com/Altitude-Unknown/RC-Airplane/releases/download/transmitter-gui-v2026.09.22.1/Altitude-Unknown-RC-Configurator-Raspberry-Pi-ARM64.zip)

These links download version 2026.09.22.1. [Check GitHub for newer releases](https://github.com/Altitude-Unknown/RC-Airplane/releases).

The Mac package is for Apple Silicon; this release does not include an Intel Mac application package.

## Connect your transmitter

Extract the ZIP and open the application. Follow the [RC system manual](https://github.com/Altitude-Unknown/RC-Airplane/blob/transmitter-gui-v2026.09.22.1/MANUAL.md#desktop-transmitter-configurator) to put your supported transmitter into USB configuration mode, connect it using a USB data cable, and select its serial port in the configurator.

The configurator manages transmitter model settings and instructor/student setup. Its Firmware Update tab supports the project's hardware update workflow. Follow the release notes and manual when selecting firmware for a particular board.

Version 2026.09.22.1 adds scrolling throughout the configurator so controls remain reachable on smaller screens. Installing this application update alone does not require reflashing the transmitter or receiver.

## Documentation and source

- [Read the RC system manual](https://github.com/Altitude-Unknown/RC-Airplane/blob/transmitter-gui-v2026.09.22.1/MANUAL.md). Its main instructions describe the September 14 release; use the newer release notes for subsequent changes.
- [Read this release's notes and firmware information](https://github.com/Altitude-Unknown/RC-Airplane/releases/tag/transmitter-gui-v2026.09.22.1).
- [Browse the source code and hardware project](https://github.com/Altitude-Unknown/RC-Airplane).
- [Download Flight Lab RC for simulator practice](/resources/flight-lab-rc/).

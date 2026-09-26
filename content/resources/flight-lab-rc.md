---
id: flight-lab-rc
title: Flight Lab RC Simulator
description: Practice RC aircraft control with simulated flying sites, wind, thermals, and transmitter or gamepad input.
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
format: DMG / ZIP / AppImage
version: '1.0.4'
permalink: /resources/flight-lab-rc/
externalUrl: https://github.com/Altitude-Unknown/Flight-Lab-RC/releases/tag/v1.0.4
related:
- transmitter-configurator
---

## Download the application

Install the desktop application that matches your computer. Downloads are hosted on GitHub.

- [Download for macOS — Apple Silicon and Intel](https://github.com/Altitude-Unknown/Flight-Lab-RC/releases/download/v1.0.4/Flight-Lab-RC-macOS-1.0.4.dmg)
- [Download for Windows — x64](https://github.com/Altitude-Unknown/Flight-Lab-RC/releases/download/v1.0.4/Flight-Lab-RC-Windows-x64-1.0.4.zip)
- [Download for Raspberry Pi — ARM64](https://github.com/Altitude-Unknown/Flight-Lab-RC/releases/download/v1.0.4/Flight-Lab-RC-Raspberry-Pi-1.0.4-aarch64.AppImage)

These links download version 1.0.4. [Check GitHub for newer releases](https://github.com/Altitude-Unknown/Flight-Lab-RC/releases).

## Start practicing

Connect your transmitter or gamepad before launching the simulator. In **Settings → Joystick**, configure the connected controller. For the Altitude Unknown transmitter preset, choose **Load → Altitude Unknown RC Tx**. Verify control directions and throttle response before practicing.

Raspberry Pi requires a 64-bit Raspberry Pi OS desktop with OpenGL. Make the downloaded AppImage executable before opening it:

```sh
chmod +x Flight-Lab-RC-Raspberry-Pi-*.AppImage
```

[Read the Flight Lab guide](https://github.com/Altitude-Unknown/Flight-Lab-RC/blob/main/FLIGHT_LAB.md) for installation and controller setup. The [transmitter configurator resource](/resources/transmitter-configurator/) links to the hardware manual and transmitter setup tools.

## About the simulator

Flight Lab RC is derived from **PicaSim**, created by Danny Chapman and contributors. It includes simulated RC aircraft, flying sites, wind, thermals, and challenges. It is available for noncommercial use under PolyForm Noncommercial 1.0.0; bundled assets retain their individual permissions.

[Browse the source code](https://github.com/Altitude-Unknown/Flight-Lab-RC) or [read the license](https://github.com/Altitude-Unknown/Flight-Lab-RC/blob/main/LICENSE.txt).

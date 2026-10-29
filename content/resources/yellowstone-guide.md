---
id: yellowstone-guide
title: YELLOWSTONE PCB Guide
description: YELLOWSTONE, the LoRa tracking PCB that high-altitude balloon teams use for flight tracking and flight termination.
topic: ballooning
kind: Equipment guide
format: PDF / DOCX
audience:
- Students
- Faculty Mentors
- Pod Leads
status: Available
delivery: download
origin: contributed
author: Mike Walach
updated: '2026-09-26'
permalink: /resources/yellowstone-guide/
subjects:
- Sensors & Instrumentation
- High-Altitude Balloons
- UAS
- Data Collection
assetIds:
- yellowstone-guide-pdf
- yellowstone-yellowstone-pcb
platforms:
- High-Altitude Balloons
- Fixed-Wing UAS
- Multirotor UAS
related:
- yellowstone-io-map
- yellowstone-buildsheet
- yellowstone-design-files
---

## About this resource

Illustrated board guide covering connectors, schematics, initial checks, bootloader installation, and hardware test examples.

<h2 id="platform-roles">Role in ASCEND</h2>

YELLOWSTONE is used by **high-altitude balloon teams** for flight tracking and flight termination, with LoRa telemetry to the ASCEND ground station program.

Air-quality and atmospheric data are recorded by a separate board, the **ASCEND Logger**, which every team flies. Earlier plans to use YELLOWSTONE as the UAS data logger have been replaced by the ASCEND Logger.

Use this guide with the I/O map, parts list, and design files when building a balloon tracking payload.

## Firmware

Firmware downloads and setup instructions for balloon tracking and termination will be added here. The documents below describe the hardware and include example code; they are not a separately identified firmware release.

## Notes for using the supplied material

The supplied guide describes a balloon/UAS testbed in a CubeSat-sized format, not orbital-flight hardware. Match connector labels and procedures to your board revision. This import preserves the guide and its code examples; it is not a new hardware or firmware validation.

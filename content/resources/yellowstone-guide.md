---
id: yellowstone-guide
title: YELLOWSTONE PCB Guide
description: Shared YELLOWSTONE hardware for balloon tracking, flight termination, and data logging, and for UAS data logging and ground-station telemetry.
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

<h2 id="platform-roles">Platform roles</h2>

YELLOWSTONE will use the same PCB on both high-altitude balloons (HAB) and UAS, with slightly different firmware for each platform.

- **HAB YELLOWSTONE:** tracking, flight termination, and data logging.
- **UAS YELLOWSTONE:** primarily data logging, with telemetry transmitted to a ground station.

Use the shared PCB guide, I/O map, parts list, and design files when planning either platform. The mission role determines which firmware variant is appropriate.

## Firmware variants

The planned variants are **HAB YELLOWSTONE firmware** and **UAS YELLOWSTONE firmware**. Future firmware downloads and setup instructions will identify the intended platform. The documents below describe the shared hardware and include example code; they do not provide a separately identified release for each variant.

## Notes for using the supplied material

The supplied guide describes a balloon/UAS testbed in a CubeSat-sized format, not orbital-flight hardware. Match connector labels and procedures to your board revision. This import preserves the guide and its code examples; it is not a new hardware or firmware validation.

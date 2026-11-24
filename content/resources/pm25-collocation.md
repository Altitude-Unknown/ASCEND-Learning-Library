---
id: pm25-collocation
title: "Lab: Collocate and Calibrate Your Sensors"
description: "Run your PM2.5 sensors next to a regulatory monitor for three to seven days, fit your own correction, and compare it with the EPA U.S.-wide correction."
topic: air-quality
kind: Activity
format: Web
audience:
- Students
- Faculty Mentors
- Pod Leads
status: Available
delivery: web
origin: contributed
author: ASCEND-BOREALIS
updated: '2026-11-23'
permalink: /resources/pm25-collocation/
subjects:
- Sensors & Instrumentation
- Data Analysis & Visualization
platforms:
- Surface Instruments
activities:
- Sensor Evaluation
- Data Analysis
courseUnit: 4
keywords:
- collocation
- calibration
- regression
- RMSE
- EPA correction
- FEM
---
## About this lab

**Goal:** turn your sensors’ readings into calibrated PM2.5 with a known uncertainty.

**Time:** three to seven days, mostly unattended.

**Materials:** your sensors with weatherproof housing and power, a regulatory (FEM) PM2.5 monitor you can place them beside, and a spreadsheet or Python/R. Find monitors near you on [AirNow](https://www.airnow.gov/) and ask the state or local air agency that runs one for permission to collocate; many will help student projects.

Read [Calibration](/pm25/textbook/measuring-pm25-from-the-sky/#calibration) first.

## Procedure

1. Mount the sensors within a few meters of the monitor’s inlet, at about the same height, in open air.
2. Sync clocks and log PM2.5 (the CF=1 “standard” output), RH, and temperature for three to seven days.
3. Download the monitor’s hourly PM2.5 for the same period from the agency or EPA [Outdoor Air Quality Data](https://www.epa.gov/outdoor-air-quality-data).

## Analysis

1. Average your sensor data to hourly values and line them up with the monitor’s hours.
2. Make a scatter plot of reference PM2.5 against sensor PM2.5.
3. Fit a linear regression: reference = <var>a</var> × sensor + <var>b</var> × RH + <var>c</var>. Record <var>a</var>, <var>b</var>, <var>c</var>, R², and the RMSE.
4. Apply the EPA U.S.-wide correction (0.524 × sensor − 0.0862 × RH + 5.75) to the same data and find its RMSE against the reference. Remember that the EPA developed it on 24-hour averages; also try it on your data averaged to 24 hours if you have enough days.

## Deliverable

The scatter plot with your regression line, your coefficients, R², and RMSE, the EPA correction’s RMSE, and the correction you chose for your flights, with one sentence on why.

<ol class="activity-questions">
<li>Which correction fit your data better? By how much?</li>
<li>Were the collocation days like your flight days (humidity, smoke)? If not, how might that affect your flight data?</li>
<li>What uncertainty will you state for calibrated readings?</li>
</ol>

<p class="small muted">Part of the <a href="/pm25/">Measuring PM2.5 from the Sky</a> course, Unit 4.</p>

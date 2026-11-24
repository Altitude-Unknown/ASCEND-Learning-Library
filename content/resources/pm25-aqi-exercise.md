---
id: pm25-aqi-exercise
title: "Activity: Calculating the AQI"
description: "Practice converting 24-hour PM2.5 averages to the Air Quality Index with the 2024 breakpoints, then calculate the AQI for three real days near you and compare with the reported values."
topic: air-quality
kind: Worksheet
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
permalink: /resources/pm25-aqi-exercise/
subjects:
- Aerosols & Air Quality
- Data Analysis & Visualization
platforms:
- Surface Instruments
activities:
- Data Analysis
courseUnit: 2
keywords:
- AQI
- Air Quality Index
- PM2.5
- breakpoints
- NAAQS
---
## About this activity

**Goal:** calculate the AQI from a 24-hour PM2.5 average and interpret it.

**Materials:** a calculator. For Part 2, internet access to [AirNow](https://www.airnow.gov/) or EPA [Outdoor Air Quality Data](https://www.epa.gov/outdoor-air-quality-data) (AirData), which has daily PM2.5 averages and daily AQI values for monitors across the country.

Read [The Air Quality Index](/pm25/textbook/measuring-pm25-from-the-sky/#the-aqi) first. For each value: truncate it to one decimal place, find its category in the breakpoint table, apply the equation, and round to the nearest whole number.

## Part 1: Practice

Find the AQI and category for each 24-hour PM2.5 average.

<ol class="activity-questions">
<li>7.4 µg/m³</li>
<li>35.47 µg/m³</li>
<li>62.0 µg/m³</li>
<li>9.05 µg/m³</li>
<li>150.0 µg/m³</li>
</ol>

<details>
<summary>Check your answers</summary>
<ol>
<li><strong>41, Good.</strong> (50 − 0) ÷ (9.0 − 0.0) × (7.4 − 0.0) + 0 = 41.1.</li>
<li><strong>100, Moderate.</strong> Truncate to 35.4 first. (100 − 51) ÷ (35.4 − 9.1) × (35.4 − 9.1) + 51 = 100. Without truncating, 35.47 would look like it belongs in the next category.</li>
<li><strong>156, Unhealthy.</strong> (200 − 151) ÷ (125.4 − 55.5) × (62.0 − 55.5) + 151 = 155.6.</li>
<li><strong>50, Good.</strong> Truncate to 9.0, the top of Good.</li>
<li><strong>225, Very Unhealthy.</strong> (300 − 201) ÷ (225.4 − 125.5) × (150.0 − 125.5) + 201 = 225.3.</li>
</ol>
</details>

## Part 2: Real days near you

Download a month of daily PM2.5 data for the monitor nearest your launch site. Choose three days: one clean, one average, and the worst day of the month.

<div class="table-wrap" tabindex="0" role="region" aria-label="Your three days"><table>
<caption>Your three days.</caption>
<thead><tr><th scope="col">Date</th><th scope="col">24-hour PM2.5 (µg/m³)</th><th scope="col">Your AQI and category</th><th scope="col">Reported AQI</th></tr></thead>
<tbody>
<tr><th scope="row">Clean day</th><td></td><td></td><td></td></tr>
<tr><th scope="row">Average day</th><td></td><td></td><td></td></tr>
<tr><th scope="row">Worst day</th><td></td><td></td><td></td></tr>
</tbody>
</table></div>

<ol class="activity-questions" start="6">
<li>Show your calculation for each day.</li>
<li>Do your values match the reported AQI? If not, why might they differ? (Think about truncation, which monitor is used, and whether the reported value is a daily AQI or a NowCast.)</li>
<li>On your worst day, what was happening (smoke, an inversion, a holiday)? How could you check?</li>
</ol>

<p class="small muted">Part of the <a href="/pm25/">Measuring PM2.5 from the Sky</a> course, Unit 2.</p>

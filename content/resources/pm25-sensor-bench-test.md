---
id: pm25-sensor-bench-test
title: "Lab: PM2.5 Sensor Bench Test"
description: "Run two or three PM2.5 sensors side by side indoors, create a short particle event, and measure the sensors' precision, response, and recovery."
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
permalink: /resources/pm25-sensor-bench-test/
subjects:
- Sensors & Instrumentation
- Aerosols & Air Quality
platforms:
- Surface Instruments
activities:
- Sensor Evaluation
courseUnit: 4
keywords:
- PM2.5
- sensor precision
- response time
- ASCEND Logger
- Plantower
---
## About this lab

**Goal:** find out how closely your sensors agree and how fast they respond, before you trust them in flight.

**Time:** one class session.

**Materials:** two or three PM2.5 sensors (for example ASCEND Loggers with their PM2.5 sensors), a laptop or SD cards to record data, a table in a room with steady air, and a small particle source: an extinguished match or a pan of food cooking. Ask first: smoke can set off smoke alarms, and an adult or instructor should handle any flame.

Read [How the sensor works](/pm25/textbook/measuring-pm25-from-the-sky/#how-sensors-work) and [Main error sources](/pm25/textbook/measuring-pm25-from-the-sky/#error-sources) first.

## Procedure

1. Place the sensors side by side, inlets facing the same way, at least a few centimeters apart.
2. Sync their clocks, start logging, and let them warm up for at least 5 minutes.
3. Record 10 minutes of background air.
4. Create one short particle event about 2 m from the sensors, such as blowing out a match. Note the exact time.
5. Keep logging until all readings are back near the background level, then for 5 more minutes.

## Analysis

1. Plot PM2.5 from every sensor against time on one graph, and mark the event time.
2. **Precision:** during the background period, find each sensor’s mean and the difference between sensors, in µg/m³ and as a percent.
3. **Response:** how many seconds after the event did each sensor start to rise, and when did it peak?
4. **Recovery:** how long did each sensor take to return to background?

## Deliverable

The time-series plot and a short table of each sensor’s background mean, the difference between sensors, and response and recovery times.

<ol class="activity-questions">
<li>How far apart did your sensors read in clean air? That spread is your baseline precision.</li>
<li>Did the sensors agree better or worse during the event? Why might that be?</li>
<li>Based on the response time, how slowly would a drone need to climb to give the sensor time to respond to a 10 m layer?</li>
</ol>

<p class="small muted">Part of the <a href="/pm25/">Measuring PM2.5 from the Sky</a> course, Unit 4.</p>

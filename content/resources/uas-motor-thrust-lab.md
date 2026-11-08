---
id: uas-motor-thrust-lab
title: "Lab Activity: Motors, ESCs, Batteries, Propellers, and Ohm’s Law"
description: "Measure the thrust and current of a brushless motor with different batteries and propellers, and check that each combination stays within the motor and ESC limits."
topic: uas
kind: Activity
format: Web
audience:
- Students
- Faculty Mentors
- Pod Leads
status: Available
delivery: web
origin: contributed
author: Mike Walach, Ph.D.
updated: '2026-11-08'
permalink: /resources/uas-motor-thrust-lab/
subjects:
- UAS
activities:
- Building & Integration
courseUnit: 3
related:
- remote-aircraft-textbook
keywords:
- thrust
- brushless motor
- ESC
- propeller
- current
---
## About this activity

**Goal:** gain basic proficiency in the theory and operation of motors, electronic speed controls (ESCs), propellers, batteries, multimeters, and the electrical units of voltage, current, resistance, and power.

**Materials:** brushless motor, ESC, 3-cell battery, 4-cell battery, receiver, transmitter, test fixture, propellers (3 different sizes or pitches), clamps, fish scale, and a DC amp meter or DC clamp amp meter.

<p class="notice"><strong>Spinning propellers can cause serious injury</strong>Wear safety glasses, clamp the test fixture securely, keep clear of the propeller's arc, and confirm the motor's direction with your instructor before applying full power.</p>

## Setting up the motor thrust test

{% include "lab-manual/motor-thrust-guide.html" %}

## Lab sheet

Write your answers on paper or in your own notes.

**Step 1. Identify and measure listed and actual battery voltages.**

<ol class="activity-questions">
<li value="1">What is the listed voltage of a 3-cell LiPo battery?</li>
<li value="2">What is the measured voltage of a fully charged 3-cell LiPo battery?</li>
<li value="3">What is the listed voltage of a 4-cell LiPo battery?</li>
<li value="4">What is the measured voltage of a fully charged 4-cell LiPo battery?</li>
</ol>

**Step 2.** Assemble your motor, ESC, battery, and receiver (do not put a propeller on yet!) as demonstrated by the instructor, using the test fixture provided. Demonstrate the operation of your motor and transmitter to the instructor when complete. Instructor signature ________

**Step 3.** Install a propeller onto your test-fixtured motor. Make sure everything is secure. Do not connect a battery until the instructor has had a chance to evaluate your setup. Install a current meter in series with your battery and ESC, or use a clamp meter that can measure DC current. Once the instructor has approved your setup, slowly bring your motor to full power and record the current for each propeller you are provided with, and the pull force on the fish scale.

**3-cell battery**

<ol class="activity-questions">
<li value="5">Propeller 1: ________ amps, ________ force</li>
<li value="6">Propeller 2: ________ amps, ________ force</li>
<li value="7">Propeller 3: ________ amps, ________ force</li>
<li value="8">What is the max current rating for your ESC?</li>
<li value="9">What is the max current rating of your motor?</li>
<li value="10">Are there any propellers that draw more current than your ESC can handle?</li>
<li value="11">Are there any propellers that draw more current than your motor can handle?</li>
</ol>

**4-cell battery**

<ol class="activity-questions">
<li value="12">Propeller 1: ________ amps, ________ force</li>
<li value="13">Propeller 2: ________ amps, ________ force</li>
<li value="14">Propeller 3: ________ amps, ________ force</li>
<li value="15">What is the max current rating for your ESC?</li>
<li value="16">Are there any propellers that draw more current than your ESC can handle?</li>
<li value="17">Are there any propellers that draw more current than your motor can handle?</li>
<li value="18">Given the motor and ESC you were provided with, which battery and propeller combinations work best in regard to operating within the current limits of your motor and ESC?</li>
<li value="19">If you needed more thrust from your aircraft, what components can you change to increase thrust? List all that apply.</li>
</ol>

## Wrap-up

Now that you have experimented with different motor and propeller combinations, answer these wrap-up questions:

<ol class="activity-questions">
<li>As battery voltage increases, and all other components (motor, ESC, propeller) stay the same, will current increase or decrease?</li>
<li>As you increase the pitch of a propeller but change no other components in your system, would you see an increase or a decrease in current?</li>
<li>Why is it so important to understand the relationship between batteries, motors, propellers, and ESCs?</li>
</ol>

<p class="small muted">From Chapter 2 of the <a href="/resources/remote-aircraft-textbook/">Remote and Autonomous Aircraft Systems lab manual</a>. Read the chapter online in the <a href="/uas-hardware/">UAS Hardware and Electronics</a> course.</p>

---
id: multirotor-betaflight-lab
title: "Lab Activity: Betaflight Introduction"
description: "Connect a quadcopter to Betaflight, set its flight modes, check its control axes and motor directions, and make a short test flight."
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
updated: '2026-11-09'
permalink: /resources/multirotor-betaflight-lab/
subjects:
- UAS
activities:
- Building & Integration
courseUnit: 3
related:
- remote-aircraft-textbook
keywords:
- Betaflight
- quadcopter
- flight modes
- motor direction
---
## About this activity

**Goal:** demonstrate proficiency connecting a quadcopter flight controller to Betaflight and setting basic configurations.

**Materials:** a quadcopter assembled with a flight controller, ESC, motors, frame, and receiver; a transmitter compatible with the receiver on the quadcopter; a USB cable; and a computer running Betaflight.

The [Betaflight sections of Chapter 5](/build-multirotor/textbook/building-a-multirotor-aircraft/#basic-setup-in-betaflight) show each step with screenshots.

<p class="notice"><strong>Caution</strong>Remove all propellers from the motors before you start this lab. Spinning propellers are dangerous and should not be installed until an aircraft is ready to go outside and fly.</p>

## Steps

<ol class="activity-questions">
<li>If you have not already done so, go to <a href="https://betaflight.com">betaflight.com</a>, then download and install the latest version of Betaflight.</li>
<li>Open Betaflight and connect your quadcopter to your computer with a USB cable. If it is connected, the quadcopter on your computer screen moves as you move the actual quadcopter.</li>
<li>Complete the following tasks:
<ol type="a">
<li>Check all motor rotation directions. Reverse any motors that are spinning the wrong way. If all motors are spinning correctly, change a few to make sure you understand how to reverse a motor.</li>
<li>Assign flight modes to a switch on your transmitter. At least one mode should be a stabilized mode that allows for smooth, stable flight.</li>
<li>Check that the quadcopter pictured in Betaflight moves the same way the actual quadcopter moves. If it does not, change the incorrect axes. If all are correct, change a few to make sure you know how to fix an incorrect flight control axis.</li>
<li>Move the control sticks on your transmitter and make sure the transmitter is bound to the quadcopter. You should see the quadcopter in Betaflight move as you move your transmitter controls. If the controls are incorrect, fix them. If they are correct, change a few so you know how to fix incorrect control inputs.</li>
</ol>
</li>
<li>Once complete, disconnect from the computer, install a 3-cell (or appropriately sized) battery, and test your motor directions with your radio. Make sure you have no propellers on for these tests.</li>
<li>Once you have demonstrated that everything is set up correctly, install the propellers and make a short test flight of your quadcopter.</li>
</ol>

Fly the test flight outdoors with your instructor, and follow the FAA rules that apply to your flight. The [Learning to Fly a UAS](/learn-to-fly/) course covers multirotor flying, and the [FAA Part 107](/part107/) course explains the rules.

<p class="small muted">From Chapter 5 of the <a href="/resources/remote-aircraft-textbook/">Remote and Autonomous Aircraft Systems lab manual</a>. Read the chapter online in the <a href="/build-multirotor/">Building a Multirotor UAS</a> course.</p>

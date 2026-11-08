---
id: pid-controller-lab
title: "Lab Activity: Implementing a Sample PID Controller"
description: "Tune a PID control system on a test fixture until it reaches and holds a stable setpoint."
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
permalink: /resources/pid-controller-lab/
subjects:
- UAS
activities:
- Building & Integration
courseUnit: 2
related:
- remote-aircraft-textbook
keywords:
- PID
- tuning
- flight controller
- control systems
---
## About this activity

**Goal:** tune a PID control system to achieve a stable setpoint.

**Materials:** a microcontroller, an electro-mechanical test fixture, one or more sensors, and PID tuning software.

## Procedure

Tune the gains in the order the chapter recommends, and write down the gains you try and how the system responds to each.

1. **Tune Kp.** Start with Ki and Kd at zero and a low Kp. Follow [How to Tune Kp](/pid-controllers/textbook/pid-controllers/#how-to-tune-kp).
2. **Tune Ki.** With Kp stable, follow [How to Tune Ki](/pid-controllers/textbook/pid-controllers/#how-to-tune-ki).
3. **Tune Kd.** Follow [How to Tune Kd](/pid-controllers/textbook/pid-controllers/#how-to-tune-kd).
4. **Compare.** Use the chapter's Kp, Ki, and Kd settings tables to describe each gain's response as too low, just right, or too high.

When the system reaches its setpoint and holds it without oscillating, show your instructor and record your final gains.

<p class="small muted">From Chapter 9 of the <a href="/resources/remote-aircraft-textbook/">Remote and Autonomous Aircraft Systems lab manual</a>, which gives this lab's goal and materials; the procedure follows the chapter's tuning steps. Read the chapter online in the <a href="/pid-controllers/">PID Controllers</a> course.</p>

---
id: flight-controller-v4-setup
title: ASCEND Flight Controller V4 — Setup Guide
description: Set up the ASCEND V4 flight controller in the ASCEND airplane, from flashing the
  firmware through calibration, radio setup, trim-save and pre-flight checks.
topic: uas
kind: Tutorial
status: Available
permalink: /resources/flight-controller-v4-setup/
delivery: web
origin: contributed
author: ASCEND-BOREALIS
updated: '2026-11-14'
version: '2026.11.14'
audience:
- Students
- Faculty Mentors
- Pod Leads
subjects:
- UAS
- Field Operations & Safety
activities:
- Building & Integration
platforms:
- Fixed-Wing UAS
related:
- flight-controller-v4-pcb
- transmitter-configurator
- flight-controller-rx-video
keywords:
- flight controller
- autopilot
- ArduPilot
- ArduPlane
- QGroundControl
- calibration
- Level Horizon
- FBWA
- trim
- trim-save
- bind
- pre-flight
---

## About this guide

This guide is for teams setting up the ASCEND V4 flight controller in the standard ASCEND airplane. Every team flies the same airframe, so the firmware ships with the board settings and the tuned gains already in place. Your job is limited to the steps that differ from board to board: flashing, three calibrations, radio setup and pre-flight checks.

The firmware in release **2026.11.14** carries the setup flown on 2026-11-14: mode switch, limits, response, AUTOTUNE gains and Bind trim-save. Steps marked *not yet confirmed* still need a detail checked; ask your pod lead.

## 1. What you need

- The ASCEND airplane with the V4 flight controller installed: components up, I2C header facing forward, servo header (J3) facing aft.
- An ASCEND transmitter.
- A USB-C data cable at least 1 m long. A short cable keeps the board next to the laptop, and the compass calibration fails there.
- A laptop with a ground control station, either [QGroundControl](/software/#software-rc) or [Mission Planner](https://ardupilot.org/planner/) (Windows only), and the [Altitude Unknown RC Configurator](/resources/transmitter-configurator/) installed. This guide shows QGroundControl; Mission Planner works with the board as it is.
- A level surface or fixture that holds the airplane at its cruise attitude.
- Remove the propeller before any powered bench work.

## 2. Flash the firmware

Use the Configurator's firmware update, and update all three parts: the **transmitter**, the **receiver** (the flight controller's onboard receiver, through J1) and the **flight controller**. Older receiver firmware does not pass Channel 7, so the Bind trim-save button would do nothing. Updating the receiver clears its bind code, so bind again afterward (section 5). The flight controller update writes only to a board whose bootloader reports board ID 65093.

1. Connect the flight controller with USB-C at **J2**. The micro-USB port **J1** belongs to the onboard receiver (SAMD21), not the flight controller.
2. In the Configurator, run the flight controller update. It reboots the board into its bootloader, writes the image (about 25 s), and then the board reconnects.
3. If the board doesn't reconnect, unplug USB and plug it back in.
4. If the board has never been flashed: hold **SW3 (BOOT0)**, press and release **SW4 (NRST)**, then release SW3. Then flash it as above. *Not yet confirmed as the first-flash path for teams.*

**Do not** update the onboard receiver with an older receiver firmware that has no SBUS output. Without SBUS the flight controller gets no RC input.

**Flash the flight controller only with the Configurator.** QGroundControl's **Firmware** page and Mission Planner's **Install Firmware** page can also write ArduPlane to a board, but the ArduPilot firmware server has no build for the ASCEND flight controller, and a stock or other board's ArduPlane would not have the ASCEND changes: the pin mapping for the servo outputs, the onboard GPS driver, the flight-tested setup and the Bind trim-save. Use those apps to connect, calibrate and plan missions, never to load firmware. If someone has flashed other firmware, run the Configurator's flight controller update to put the ASCEND firmware back.

**New board vs. existing board.** A new board comes up with the flight-tested setup already in place. A board that was set up before keeps its own saved settings after an update; firmware defaults apply only to settings that were never saved. On such a board, check in QGroundControl that `RC7_OPTION` is 155 (trim-save). The [RC system manual](https://github.com/Altitude-Unknown/RC-Airplane/blob/main/MANUAL.md#ascend-flight-controller-rev2) lists every built-in value if you want the full setup on an existing board.

## 3. Connect in QGroundControl

These steps use QGroundControl. If your team uses Mission Planner instead, select the board's COM port and **Connect**; the calibrations in section 4 are under **Setup → Mandatory Hardware**.

1. Close the Configurator, because only one program can use the USB port at a time. Then open QGroundControl and plug the board in at J2. It connects automatically.
2. Click the **Q** icon, then **Vehicle Setup**. The vehicle type should read ArduPlane.
3. Take the airplane outdoors with a clear view of the sky. The toolbar GPS icon should show a 3D fix within a few minutes; the first V4 board had 12 satellites. The board's GPS LED shows the same thing: off = no 3D fix, blinking = fix but not yet ready to arm, solid = GPS will not block arming.
4. Messages that are normal before calibration: "Compass not calibrated", "Accels calibrated requires reboot", and "Waiting for GPS" or "GPS 1: Bad fix" until a fix is acquired. Indoors you may also see "EKF3 Yaw inconsistent"; it clears outdoors once GPS is in use.

## 4. Calibrate the sensors

Do these in order, every time a board is installed or replaced. All three are in **Vehicle Setup → Sensors**. Leave the orientation at its default (ROTATION_NONE): the board's sensor rotations are already built into the firmware.

1. **Accelerometer.** Click **Accelerometer** and follow the prompts to place the airplane level, on its left side, on its right side, nose down, nose up and on its back. Hold each position still until the prompt changes. Reboot when asked.
2. **Compass.** Use the long USB cable and move away from the laptop and any metal. Click **Compass**, then rotate the airplane slowly through every orientation until the progress bar fills. A good result ends with "good orientation: 0" and is saved. If it fails, move farther from metal and try again.
3. **Level Horizon.** Put the airplane in the fixture at its **cruise attitude**, with the wings level (no roll) and the nose at its normal cruise angle. Click **Level Horizon**, keep the default orientation, click OK, and don't touch the airplane until it finishes.

**Check it:** with the airplane still in the fixture, the horizon on the Fly view should read roll and pitch within about ±0.5°. In **Parameters**, AHRS_TRIM_X and AHRS_TRIM_Y should be small (under 0.1). If you redo the accelerometer calibration, do Level Horizon again afterward.

*Not yet confirmed: the cruise pitch angle for the ASCEND airplane, so every team levels it the same way.*

## 5. Radio, flight modes and arming

1. **Bind.** Turn the transmitter on, then hold **SW1** and press **SW2** on the flight controller board. The receiver LED shows when it's linked. *Not yet confirmed: the exact bind sequence and the LED pattern.*
2. **Radio calibration.** Go to **Vehicle Setup → Radio** and move every stick and switch through its full range. With the sticks centered and the transmitter trims centered, the channels should read about 1500.
3. **Flight mode switch.** The mode switch is Aux 1 (channel 5), a two-position switch: **low = FBWA, high = MANUAL**. This is built into the firmware, and every team starts with it. In the transmitter model, turn on full surface rates at CH5 low (`ch5_rate_mode 1`), so FBWA gets full surface travel and MANUAL keeps your selected rates.
4. **AUTO switch.** Firmware 2026.11.19.1 and later also has an AUTO switch on channel 6. In the [RC Configurator](/resources/transmitter-configurator/), set **D10 / Trainer** to **Channel 5 — Toggle** and **D7 / Aux** to **Channel 6 — Toggle**. Press D7 to enter AUTO, and press D7 again to return to the mode channel 5 selects. Both buttons start low at power-up, so the airplane starts in FBWA, not AUTO.
   - **Leave AUTO with D7.** Pressing D10 in AUTO also leaves AUTO, but it toggles channel 5 as well, so you end up in the other mode (MANUAL instead of FBWA, or the reverse). Channel 6 is still high after that, so the next D7 press does nothing. Press D7 once more to enter AUTO.
   - **AUTO doesn't wait for GPS.** The flight controller switches to AUTO even without a GPS fix or a loaded mission, so you can check D7 on the bench indoors. The protection is arming (next step): the airplane won't arm without a 3D GPS fix. With no mission loaded, AUTO ends at once and the airplane switches to Return to Launch.
   - As your team progresses, you can change the modes on channel 5, channel 6 or both. The [QGroundControl mission example](/flight-controllers/textbook/flight-controllers/#example-plan-a-mission-in-qgroundcontrol) in Chapter 6 flies a mission with the AUTO switch.
5. **Arming.** Arm with the board's ARM button: throttle at zero, mode MANUAL or FBWA, hold 2 s. The button does nothing in other modes. The GPS must have a 3D fix before the airplane will arm, so that Return to Launch knows where home is. The sticks must also read neutral: a transmitter trim the flight controller doesn't know about blocks arming with "Roll (RC1) is not neutral" (or Pitch, Yaw). Save your trims with the Bind button (next step).
6. **Trims (Bind trim-save).** Trim with the transmitter as usual, then save the trims to the flight controller: in **MANUAL**, sticks released and the airplane still (or in level flight), hold **Bind for 1 second**. The transmitter plays two short chirps. When the flight controller accepts the save, its **status LED blinks fast for about 3 seconds**. **Leave the transmitter trims where they are afterward; do not zero them.** The save is rejected, and nothing changes, outside MANUAL, with a stick more than 20% off center, while the airplane rotates fast or in radio failsafe. On the ground before a first flight: set the surfaces neutral with the trims in MANUAL, then save. In the air: trim in MANUAL until it flies straight hands-off, then save. Each save replaces the last.
7. **Failsafe.** If the radio link is lost, the airplane returns to launch at 100 m. Test this on the bench with the propeller removed: arm, turn the transmitter off, and confirm QGroundControl reports a radio failsafe.

## 6. Pre-flight checks

Do every check with the propeller removed, except the last one.

- **MANUAL stick directions:** right stick → right aileron up, left aileron down. Pull back → elevator up. Right rudder stick → rudder right.
- **Stabilization directions (FBWA):** roll the airplane right by hand and the ailerons should push it back left (right aileron down). Tilt the nose down and the elevator should go up.
- **Trims:** saved with the Bind button (section 5). The airplane arms without a "not neutral" message, and in FBWA with the sticks centered the control surfaces sit at neutral.
- **Sensors:** QGroundControl shows no red pre-arm messages and the GPS has a 3D fix.
- **Horizon:** the airplane sitting level reads close to 0° roll and pitch.
- **Failsafe:** tested as in section 5.
- **Range check:** walk out about 30 m and confirm all control surfaces still respond.
- **Propeller on:** throttle runs up smoothly and the motor spins the correct direction.

## Where to go next

The [Flight Controller V4 PCB design](/resources/flight-controller-v4-pcb/) has the board files and build guide. The [Flight Controllers](/flight-controllers/) units explain what the autopilot is doing, including flight modes and failsafes.

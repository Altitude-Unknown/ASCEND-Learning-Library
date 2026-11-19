---
id: transmitter-configurator
title: Altitude Unknown RC Configurator — User Guide
description: Download the RC Configurator and use each of its tabs to set up transmitter models, assign instructor and student radios, update firmware, and test the transmitter speaker.
topic: uas
kind: Software / firmware
audience:
- Students
- Faculty Mentors
- Pod Leads
status: Available
delivery: external
origin: external
updated: '2026-11-19'
subjects:
- UAS
platforms:
- Fixed-Wing UAS
actionLabel: View latest release on GitHub
format: ZIP
version: '2026.11.15'
permalink: /resources/transmitter-configurator/
externalUrl: https://github.com/Altitude-Unknown/RC-Airplane/releases/latest
related:
- flight-controller-v4-setup
- flight-lab-rc
- flight-lab-rc-setup-video
keywords:
- configurator
- transmitter
- receiver
- model
- bind
- rates
- expo
- subtrim
- endpoints
- V-tail
- elevons
- instructor
- student
- buddy box
- trainer
- firmware update
- speaker test
---

## About this guide

The **Altitude Unknown RC Configurator** is the desktop app for the ASCEND transmitter. Use it to:

- set up **models**: rates, expo, trims, endpoints, reversing, and the aircraft type for each airplane;
- assign a transmitter as the **instructor** or the **student** radio for buddy-box training;
- **update firmware** on the transmitter, the receiver, and the ASCEND flight controller;
- **test the speaker** that sounds the flight-timer alarms.

The app has four tabs, one for each job. This guide walks through them in order. It describes release **2026.11.15**; newer releases may add features.

<p class="notice"><strong>Safety first</strong>Keep the aircraft powered off and remove the propeller whenever the transmitter is connected to the configurator. After any change to a model or any firmware update, check every control direction, the throttle safety, and the failsafe before flight.</p>

## 1. Download and install

Download the version for your computer. The links always fetch the latest release from GitHub.

- [Windows (x64)](https://github.com/Altitude-Unknown/RC-Airplane/releases/latest/download/Altitude-Unknown-RC-Configurator-Windows-x64.zip)
- [macOS (Apple Silicon)](https://github.com/Altitude-Unknown/RC-Airplane/releases/latest/download/Altitude-Unknown-RC-Configurator-macOS-ARM64.zip)
- [Raspberry Pi (64-bit)](https://github.com/Altitude-Unknown/RC-Airplane/releases/latest/download/Altitude-Unknown-RC-Configurator-Raspberry-Pi-ARM64.zip)

Extract the ZIP and open **Altitude Unknown RC Configurator**. You don't need the Arduino IDE or Python; everything the app needs, including the firmware flashing tools, is built in. The Mac version runs on Apple Silicon Macs only; there is no Intel Mac version.

You also need a **USB data cable**. Some cables carry power only; if the transmitter never appears in the port list, try another cable.

## 2. Know your transmitter's two USB ports

The ASCEND transmitter has two processors, and each has its own USB connector:

| Processor | What it does | Used in the configurator for |
| --- | --- | --- |
| **M0** | Reads the sticks, stores your models, and sends controls to the airplane | **Models** and **Speaker Test** tabs; M0 firmware updates |
| **ESP32-C3** (the small **ESP** connector) | Links the instructor and student radios wirelessly | **Instructor / Student** tab; ESP32-C3 firmware updates |

When this guide says "connect the M0" or "connect the ESP," use that processor's connector.

<h2 id="connect">3. Connect the transmitter</h2>

The **Models** and **Speaker Test** tabs talk to the transmitter's M0 through the **Serial Port** bar at the top of the window. The M0 only accepts the configurator while it is in **USB Config Mode**. In this mode the transmitter does not send controls to the airplane.

1. **Start the transmitter in USB Config Mode.** With the transmitter off, hold the **Bind** button and the **right aileron trim** button, switch the transmitter on, then release both buttons.
2. **Plug a USB data cable** into the transmitter's M0 connector and into your computer.
3. **Click Refresh**, then choose the transmitter in the **Serial Port** list.
4. **Click Connect.** The status in the top right corner changes from **Not connected** to **Connected**, followed by where the transmitter stores its models (`fram` or `internal flash`).

If the only port in the list is a built-in computer port, such as the "Intel(R) Active Management Technology - SOL (COM3)" port that appears on many Windows laptops, the computer cannot see the transmitter yet. Check that it is in USB Config Mode and that the cable carries data, then click **Refresh**.

When you finish, close the configurator or disconnect, then switch the transmitter off and on again normally, with the throttle stick all the way down, before flying.

## 4. Models tab

A **model** is the set of transmitter settings for one airplane. The transmitter holds up to 16 models and flies whichever one is **active**.

<figure class="textbook-figure"><a href="/assets/resources/rc-configurator/01-models.png"><img src="/assets/resources/rc-configurator/01-models.png" alt="The Models tab of the Altitude Unknown RC Configurator. On the left, an empty Model Slots list with New, Rename, Delete and Set Active buttons below it. On the right, fields for Model Name, Bind Code with a New Bind button, DR Switch and a High Rates Active checkbox; an Aircraft Type list set to Conventional / T-tail; a Reverse rudder input (V-tail only) checkbox; a Button channels box with D10 / Trainer set to Trainer, D7 / Aux set to Disabled, and Mode-linked rates set to Off — use selected rates; a Control Mixing box with a Mix aileron into rudder checkbox and Rudder amount of 30 percent; and a channel table listing Throttle, Aileron, Elevator and Rudder at Rate 100, Expo 0, Subtrim 0, Min 1000, Max 2000, Reverse No. Along the bottom are Load From Radio, Save To Radio, Export Model (.json) and Import Model (.json) buttons." width="1917" height="1031" loading="lazy"></a><figcaption>The Models tab before connecting. Once connected, the Model Slots list on the left fills with the transmitter's models.</figcaption></figure>

### The model list

After you connect, each slot in **Model Slots** shows its number, the model name, and a check result, for example `* [0] Trainer  (OK)`.

- The `*` marks the **active** model, the one the transmitter flies.
- `(OK)` means the stored model passed its data check. `(BADCRC)` means it is damaged: load it, check every value, and save it again, or import it from a backup.
- `(empty)` marks an unused slot.

Use the buttons under the list to manage models:

| Button | What it does |
| --- | --- |
| **New** | Creates a model with default settings in the first empty slot and asks for its name |
| **Rename** | Changes the selected model's name |
| **Delete** | Clears the selected slot. If it was the active model, slot 0 becomes active |
| **Set Active** | Makes the selected model the one the transmitter flies |

### Edit a model

1. **Select a model** in the list and click **Load From Radio**. Its settings fill the editor.
2. **Make your changes** (each setting is described below).
3. **Click Save To Radio.** This saves the selected slot but does *not* make it active.
4. **Click Set Active** if this is the model you want to fly.

Changes in the editor are not stored until you click **Save To Radio**.

### Model settings

| Setting | What it does |
| --- | --- |
| **Model Name** | The model's name in the list |
| **Bind Code** | The code this model shares with its receiver. The receiver only accepts controls carrying its bind code |
| **New Bind** | Generates a new bind code. Save the model, then rebind the receiver (see below) |
| **DR Switch** | Stored with the model but not used by the current transmitter firmware. Leave it at 0 |
| **High Rates Active** | Sets all four rates to 100% while checked. Expo still applies |

#### Rebinding after a new bind code

A new bind code means the receiver no longer recognizes the transmitter until you bind them again:

1. Save the model, make it active, and switch the transmitter off. Remove the propeller.
2. Put the receiver in bind mode: hold its Bind button, or fit a bind plug, while you power it on.
3. Hold the transmitter's **Bind** button while you switch it on.
4. When the receiver confirms the bind, release the Bind button. Check every control before flight.

The [RC system manual](https://github.com/Altitude-Unknown/RC-Airplane/blob/main/MANUAL.md) has the full binding details for each receiver.

### Aircraft type

Choose how the transmitter mixes the tail or wing surfaces:

| Aircraft Type | Servo plugs | Mixing |
| --- | --- | --- |
| **Conventional / T-tail** | RUD: rudder, AIL: aileron, ELE: elevator | Each stick drives its own surface |
| **V-tail (ruddervators)** | RUD and ELE: one ruddervator each | Mixes elevator and rudder onto both surfaces |
| **Flying wing (elevons)** | AIL and ELE: one elevon each | Mixes elevator and aileron onto both surfaces |

Use the labels printed on the receiver, not the position of the connectors.

**Reverse rudder input (V-tail only)** fixes a V-tail where pitch moves the right way but yaw is backward. Get pitch correct first with the **Reverse** column, then check this box if yaw is still backward. Don't swap servo plugs instead.

<h3 id="button-channels">Button channels</h3>

Two buttons on the transmitter can be assigned per model.

**D10 / Trainer** is the blue button on the bottom edge of the transmitter:

- **Trainer**: the button hands control to the student radio and takes it back. Choose this on the instructor's transmitter for buddy-box training.
- **Channel 5 — Momentary** or **Channel 5 — Toggle**: the button drives channel 5, usually to switch flight modes on the flight controller. Choosing Channel 5 turns off student control for this model.

**D7 / Aux** can be **Disabled** or drive channel 6 as **Channel 6 — Momentary** or **Channel 6 — Toggle**.

*Momentary* sends high while you hold the button and low when you release it. *Toggle* changes between low and high each time you press it. Both start low when the transmitter switches on.

**Mode-linked rates** only works when D10 is set to Channel 5. It gives the flight controller full stick travel in FBWA mode while keeping your reduced rates for manual flying:

- **Off — use selected rates**: the table's rates always apply.
- **FBWA at CH5 low — full surface rates** or **FBWA at CH5 high — full surface rates**: in that channel 5 position the rudder, aileron and elevator rates go to 100%; in the other position your selected rates come back. Throttle, trims and expo don't change.

Pick the option that matches how channel 5 is set up on your flight controller. The transmitter cannot see which mode the flight controller is really in, so check on the bench that the mode and the rates change together. The [Flight Controller V4 Setup Guide](/resources/flight-controller-v4-setup/) has the ASCEND flight controller's mode settings.

### Control mixing

**Mix aileron into rudder** adds rudder whenever you move the aileron stick, to help coordinate turns. **Rudder amount** sets how much, from −100% to +100%. A negative value reverses the direction of the added rudder. Leave this off while you set up the control directions, then turn it on with a small amount and check which way the rudder moves.

### Channel table

Double-click a value to edit it. Double-clicking a channel name only renames its label on this computer; it does not change which receiver output it drives.

| Column | Range | What it does |
| --- | --- | --- |
| **Rate%** | 0 to 100 | How far the surface moves at full stick. Lower values make the airplane gentler |
| **Expo%** | −100 to 100 | Positive values soften response near center stick while keeping full travel at the ends |
| **Subtrim** | −500 to 500 µs | Shifts the center position. The transmitter's trim buttons change this value in 5 µs steps |
| **Min us / Max us** | 1000 to 2000 µs | The output's end points. Keep Min below Max |
| **Reverse** | Yes / No | Reverses the direction the surface moves |

<p class="notice"><strong>Keep end points between 1000 and 2000 µs</strong>The configurator allows a wider range, but the ASCEND receiver rejects every control packet that contains a value outside 1000–2000 µs. One out-of-range end point stops the whole airplane from responding.</p>

### Back up and share models

- **Export Model (.json)** saves the selected slot to a file. It saves what is stored on the radio, not unsaved edits, so click **Save To Radio** first.
- **Import Model (.json)** writes a file into the selected slot, replacing what is there, including the bind code. Choose the slot carefully, then click **Load From Radio** to check the result. Importing does not make the model active.

Export every model before a firmware update. A transmitter that stores models in internal flash can lose them during an M0 update.

### Example: set up a new airplane

1. Remove the propeller and keep the airplane powered off. Connect the transmitter in USB Config Mode.
2. Click **New**, name the model, and select it in the list. Click **Load From Radio**.
3. Choose the **Aircraft Type**. Leave **Mix aileron into rudder** off for now.
4. Set **D10 / Trainer** to **Trainer** for buddy-box training, or to a Channel 5 option if the button switches flight modes.
5. Start with modest rates, for example 70%, and leave expo at 0. Check that every end point is between 1000 and 2000 µs.
6. Click **Save To Radio**, then **Set Active**.
7. If you clicked **New Bind**, or this is a new receiver, rebind the receiver.
8. Restart the transmitter normally with the throttle down. Move each stick and fix any backward surface with the **Reverse** column, saving and restarting after each change.
9. Center the surfaces with the trim buttons or **Subtrim**, then export the finished model as a backup.

## 5. Instructor / Student tab

For buddy-box training, one transmitter is the **Instructor (Master)** and the other is the **Student**. The student's controls travel to the instructor's transmitter, and the instructor's transmitter is the only one that talks to the airplane. The instructor presses the D10 button to hand control to the student and presses it again to take control back. Moving an instructor stick also takes control back, as does losing the link to the student radio.

The role is stored in the transmitter's ESP32-C3, so this tab has its own connection to the **ESP** USB connector. You only need to set a role once; it stays set after power-off and firmware updates.

<figure class="textbook-figure"><a href="/assets/resources/rc-configurator/02-instructor-student.png"><img src="/assets/resources/rc-configurator/02-instructor-student.png" alt="The Instructor / Student tab, titled Transmitter Role. An ESP32-C3 connection box holds an ESP Port list with Refresh and Connect buttons. A Detected transmitter box lists ESP MAC address, Current role, M0 operating mode, Current authority, Student link (last read) and Link counters, all showing dashes. An Assign role box reads Connect to the ESP32-C3 to read its role before making changes, above grayed-out Set as Instructor (Master) and Set as Student buttons and a Read Status Again button." width="1915" height="1020" loading="lazy"></a><figcaption>The Instructor / Student tab before connecting. The role buttons stay grayed out until the configurator has read the transmitter's current role.</figcaption></figure>

1. **Keep the aircraft powered off.** Start the transmitter in USB Config Mode (Bind + right aileron trim at power-on). The role can only be changed while the transmitter is not flying.
2. **Plug the USB cable into the small ESP connector.**
3. **Click Refresh**, choose the transmitter in **ESP Port**, and click **Connect**.
4. **Read the Detected transmitter box.** It shows the radio's **ESP MAC address** (its unique ID), its **Current role**, the **M0 operating mode**, which radio has control (**Current authority**), and the student link status.
5. **Click Set as Instructor (Master) or Set as Student**, then confirm the warning. The configurator writes the role and reads it back to check it.
6. **Restart the transmitter** before normal use.
7. Repeat for the other transmitter with the opposite role.

Never set both transmitters to the same role. For the hand-off to work, the instructor's active model must have **D10 / Trainer** set to **Trainer** (see [Button channels](#button-channels)).

Write each radio's MAC address and role on a label on the transmitter so you can tell the pair apart. Click **Read Status Again** to refresh the readings; the link counters are useful for checking the student link on the bench.

## 6. Firmware Update tab

Use this tab to install new firmware on:

- the transmitter (both processors),
- the receiver: the Receiver V4, or the receiver built into the ASCEND flight controller, which has its own USB connector,
- the ASCEND flight controller (ArduPlane).

The configurator downloads firmware from the latest Altitude Unknown release on GitHub and checks each file against its published checksum before writing it.

<figure class="textbook-figure"><a href="/assets/resources/rc-configurator/03-firmware-top.png"><img src="/assets/resources/rc-configurator/03-firmware-top.png" alt="The top of the Firmware Update tab, titled RC and Flight Controller Firmware Update. Firmware source offers Latest GitHub release (recommended), which is selected, and Local file on this computer. Latest release reads Not checked, with a Check GitHub button on the right. Processors to update offers Transmitter — both processors (recommended), which is selected, Transmitter M0 only, Transmitter ESP32-C3 only, Receiver (Rx V4 or ASCEND flight controller built-in receiver), and Flight controller (ArduPlane). Below is the start of the Transmitter M0 or receiver USB port section." width="1909" height="1017" loading="lazy"></a><figcaption>The top of the Firmware Update tab: choose where the firmware comes from, check GitHub, and choose what to update.</figcaption></figure>

<figure class="textbook-figure"><a href="/assets/resources/rc-configurator/04-firmware-ports.png"><img src="/assets/resources/rc-configurator/04-firmware-ports.png" alt="The Firmware Update tab scrolled down. Three port sections each have a list and a Refresh Ports button: Transmitter M0 or receiver USB port, noting it is used for automatic bootloader entry with manual RESET as a fallback; Transmitter ESP32-C3 USB port, noting to use the small ESP USB connector; and Flight controller USB port, noting only ArduPilot flight controllers are listed and only firmware built for that board is written. A Connection guide box explains the SAMD21 and ESP32-C3 connections. At the bottom are a Download and Flash Latest button and the text Check GitHub to begin." width="1912" height="1020" loading="lazy"></a><figcaption>Scroll down for the USB port lists, the connection guide, and the Download and Flash Latest button.</figcaption></figure>

### Before you update

- Power off the aircraft and remove the propeller.
- **Export your models** from the Models tab.
- Click **Disconnect** or close any other app that is using the same USB port, including QGroundControl or Mission Planner.
- Don't unplug the USB cable while firmware is being written.

### Update from GitHub

1. Under **Firmware source**, keep **Latest GitHub release (recommended)**.
2. Click **Check GitHub**. The **Latest release** box shows the version it found.
3. Under **Processors to update**, choose what you are updating:

| Choose | When |
| --- | --- |
| **Transmitter — both processors (recommended)** | Updating a transmitter. This keeps the M0 and ESP32-C3 matched |
| **Transmitter M0 only** / **Transmitter ESP32-C3 only** | Only when the release notes say the other processor did not change |
| **Receiver (Rx V4 or ASCEND flight controller built-in receiver)** | Updating a receiver |
| **Flight controller (ArduPlane)** | Updating the ASCEND flight controller |

4. Scroll down and select the USB port for each part you are updating:
   - **Transmitter M0 or receiver USB port**: the transmitter's M0 connector, or the receiver's USB connector.
   - **Transmitter ESP32-C3 USB port**: the transmitter's small ESP connector. A both-processor update needs both ports selected before it starts, so plug in two USB cables, one to each connector.
   - **Flight controller USB port**: the flight controller's own USB connector. Only ArduPilot boards appear here.

   Click **Refresh Ports** if a port is missing.
5. Click **Download and Flash Latest** and follow the prompts. The configurator puts each processor into its update mode automatically.

If automatic update mode fails, the **Connection guide** box gives the manual method:

- **Transmitter M0 or receiver:** double-tap the board's **RESET** button, then try again.
- **ESP32-C3:** hold **BOOT**, tap **RESET**, release **BOOT**, then try again.
- **Flight controller:** unplug and reconnect its USB cable, then try again. If the receiver's USB is also plugged in and the flight controller doesn't appear, unplug and reconnect both.

The flight controller update checks which board is connected and only writes firmware built for it. It keeps your parameters and calibrations. Use only the configurator to update the ASCEND flight controller, not the firmware pages in QGroundControl or Mission Planner.

### Flash a file from this computer

Choose **Local file on this computer** under **Firmware source** to flash a firmware file you already have, such as an older release or a build from your instructor. Select one processor (the both-processors option is not available in this mode), click **Choose File…**, and pick the file:

| Processor | File type |
| --- | --- |
| Transmitter M0 | `.uf2` |
| Transmitter ESP32-C3 | `.bin` |
| Receiver | `.uf2`, or `.bin` for an original Receiver V4 |
| Flight controller | `.apj` |

The configurator refuses files built for a different processor or board. A local file has no published checksum, so only use files from a source you trust.

### After an update

- **Transmitter:** switch it off and on. Connect in USB Config Mode, click **Load From Radio** on your active model, and check its settings. Then check the instructor/student roles and the hand-off.
- **Receiver:** an update can clear the bind code. Rebind the receiver, then check every control, the throttle safety, and the failsafe with the propeller removed.
- **Flight controller:** read the release notes for any setting you must change by hand, then follow the pre-flight checks in the [Flight Controller V4 Setup Guide](/resources/flight-controller-v4-setup/).

## 7. Speaker Test tab

The transmitter beeps to remind you of flight time: a five-minute alarm after five minutes with the throttle above idle, then a one-minute reminder every minute after that. Use this tab to check the speaker works without waiting five minutes.

<figure class="textbook-figure"><a href="/assets/resources/rc-configurator/05-speaker-test.png"><img src="/assets/resources/rc-configurator/05-speaker-test.png" alt="The Speaker Test tab, titled Transmitter speaker test. Instructions say to keep the aircraft powered off and connect the transmitter M0 in USB Config Mode, that the tests play the flight alarm sounds without changing model settings or the flight timer, and to listen to confirm the speaker works. Three buttons follow: Play five-minute alarm (~6 seconds), Play one-minute reminder (~2 seconds), and Stop sound. The status line reads Ready. Requires TX firmware with speaker-test support." width="1918" height="1032" loading="lazy"></a><figcaption>The Speaker Test tab plays the real alarm sounds without changing any settings.</figcaption></figure>

1. Keep the aircraft powered off. Connect the transmitter M0 in USB Config Mode using **Connect** at the top of the window (see [Connect the transmitter](#connect)).
2. Click **Play five-minute alarm (~6 seconds)** or **Play one-minute reminder (~2 seconds)**.
3. **Listen.** The status line only confirms that the transmitter received the command; you have to hear the sound to know the speaker works.
4. Click **Stop sound** to end it early.

If the status says the command is not supported, update the transmitter firmware. If the test runs but you hear nothing, the speaker circuit needs checking; ask your pod lead.

## Troubleshooting

| Problem | Try this |
| --- | --- |
| The transmitter isn't in the port list | Use a USB data cable, start the transmitter in USB Config Mode, and click **Refresh**. On Windows, ports such as "Intel(R) Active Management Technology - SOL" belong to the computer, not the transmitter |
| **Connect** fails | Close other apps using the port, check you plugged into the M0 connector (not ESP), and restart the transmitter in USB Config Mode |
| A model shows `(BADCRC)` | Load it, check every value, and save it again, or import a backup |
| Saved changes don't appear when flying | Make sure you clicked **Save To Radio** and **Set Active**, then restart the transmitter normally |
| The airplane doesn't respond after editing a model | Check every **Min us** and **Max us** is between 1000 and 2000, and that the bind code matches the receiver |
| Role buttons are grayed out | Connect to the ESP port first so the configurator can read the current role |
| The role change is refused | Restart the transmitter in USB Config Mode; roles can't change in flight or bind mode |
| A firmware update can't enter update mode | Follow the **Connection guide**: double-tap RESET (M0 or receiver), or hold BOOT and tap RESET (ESP32-C3) |
| The flight controller isn't listed | Unplug and reconnect its USB cable, close QGroundControl or Mission Planner, and click **Refresh Ports** |

## Recent releases

- **Flash a local file** (2026.11.15). The Firmware Update tab can flash a firmware file from your computer.
- **Bind trim-save and the flight-tested setup** (2026.11.14). Hold the transmitter's Bind button for 1 second to save your trims to the ASCEND flight controller. Update the transmitter, receiver and flight controller together, then rebind. See the [Flight Controller V4 Setup Guide](/resources/flight-controller-v4-setup/).
- **Sensor orientation built in** (2026.11.09). Boards set up with 2026.11.01 used `AHRS_ORIENTATION=14`: after updating, set it to 0 and redo the accelerometer and compass calibrations before flight.
- **Flight controller updates and one receiver firmware** (2026.11.01). The Firmware Update tab can update the ASCEND flight controller, and one receiver firmware serves both the Receiver V4 and the flight controller's built-in receiver.

## Documentation and source

- [All releases and release notes](https://github.com/Altitude-Unknown/RC-Airplane/releases)
- [RC system manual](https://github.com/Altitude-Unknown/RC-Airplane/blob/main/MANUAL.md): full technical details for the transmitter, receiver, and configurator
- [Button channel setup](https://github.com/Altitude-Unknown/RC-Airplane/blob/main/BUTTON_CHANNELS.md)
- [Source code and hardware](https://github.com/Altitude-Unknown/RC-Airplane)
- [Flight Lab RC](/resources/flight-lab-rc/) for simulator practice with your transmitter

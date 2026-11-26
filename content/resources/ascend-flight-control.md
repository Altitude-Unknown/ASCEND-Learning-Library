---
id: ascend-flight-control
title: ASCEND Flight Control — User Manual
description: Install ASCEND Flight Control and use each of its tabs to plan and upload missions, check airspace, lay out survey grids, watch a flight, change settings, and calibrate the ASCEND flight controller.
topic: uas
kind: Software / firmware
audience:
- Students
- Faculty Mentors
- Pod Leads
status: Available
delivery: external
origin: external
updated: '2026-11-25'
subjects:
- UAS
platforms:
- Fixed-Wing UAS
actionLabel: Download from GitHub
format: ZIP
version: '2026.11.24.2'
permalink: /resources/ascend-flight-control/
externalUrl: https://github.com/Altitude-Unknown/RC-Airplane/releases/tag/flight-control-v2026.11.24.2
related:
- transmitter-configurator
- flight-controller-v4-setup
- mission-planning-lab
keywords:
- ground control station
- GCS
- mission planner
- waypoint
- mission
- loiter
- survey grid
- mapping
- camera
- airspace
- LAANC
- UAS Facility Map
- TFR
- sectional
- satellite
- MAVLink
- ArduPilot
- ArduPlane
- parameters
- failsafe
- geofence
- calibration
- accelerometer
- compass
- radio calibration
---

## About this manual

**ASCEND Flight Control** is the ground station for the ASCEND flight controller, which runs ArduPlane. It is built for ASCEND teams, so it shows the settings you are likely to change and explains them in plain English. Use it to:

- **plan missions** on a map, with satellite imagery, the VFR sectional chart, and FAA airspace layers;
- **lay out survey grids** that take photos by distance;
- **upload** a mission and confirm the flight controller stored it correctly;
- **watch a flight** with an attitude indicator, live readouts, and the airplane's track on the map;
- **change settings** and back them up;
- **calibrate** the accelerometer, level, compass, and radio;
- **set up the transmitter and update firmware**, using the built-in RC Configurator.

The app has six tabs: **Mission**, **Flight**, **Aircraft Settings**, **Calibration**, **All Parameters**, and **RC Configurator**. This manual walks through them in that order. It describes release **2026.11.24.2**; newer releases may add features. The screenshots were taken with the app connected to the ArduPilot simulator (SITL), so the numbers come from a simulated airplane.

<p class="notice"><strong>This is a beta</strong>ASCEND Flight Control has been tested against the ArduPlane simulator but not yet on many real airplanes. Save a backup of your settings (<strong>Aircraft Settings → Save Backup…</strong>) before you change anything, and tell your pod lead if something goes wrong.</p>

<p class="notice"><strong>Safety first</strong>Remove the propeller whenever the airplane is powered on the bench. After any settings change or calibration, check every control direction, the flight modes, and the failsafe before flight. The airspace layers are for planning only: you must still check NOTAMs and get LAANC or DroneZone authorization where it is required.</p>

## 1. Download and install

ASCEND Flight Control is released separately from the RC Configurator, so download it from its own release page:

- [Mac (Apple silicon: M1 or newer)](https://github.com/Altitude-Unknown/RC-Airplane/releases/download/flight-control-v2026.11.24.2/ASCEND-Flight-Control-macOS-ARM64.zip)
- [Windows 10 or 11 (64-bit)](https://github.com/Altitude-Unknown/RC-Airplane/releases/download/flight-control-v2026.11.24.2/ASCEND-Flight-Control-Windows-x64.zip)
- [Raspberry Pi 4 or 5 (64-bit Raspberry Pi OS)](https://github.com/Altitude-Unknown/RC-Airplane/releases/download/flight-control-v2026.11.24.2/ASCEND-Flight-Control-Raspberry-Pi-ARM64.zip)

| Computer | How to install |
| --- | --- |
| **Mac** | Unzip, drag **ASCEND Flight Control** into Applications, and open it. The first time you open the map, macOS asks whether the app may use your location; allow it if you want the map to open where you are |
| **Windows** | Unzip and run **ASCEND-Flight-Control.exe**. If Windows shows "Windows protected your PC," click **More info**, then **Run anyway** |
| **Raspberry Pi** | Unzip, open a terminal in that folder, and run `./install.sh`. Open **ASCEND Flight Control** from the Programming menu. To use USB, your user must be in the `dialout` group; the installer tells you if it is not |

The background map needs an internet connection. Without one, your waypoints, the route, and the airplane still appear, on a blank background.

You also need a **USB data cable** for the flight controller, or a telemetry radio. Some cables carry power only; if the flight controller never appears in the port list, try another cable.

<h2 id="connect">2. Connect to the flight controller</h2>

The connection bar across the top of the window is shared by every tab.

1. **Plug in the flight controller** by USB, or plug in the ground telemetry radio.
2. **Click Refresh**, then choose the flight controller's port in the **Flight controller** list.
3. **Choose the speed.** For USB, leave it at **115200**; the speed doesn't matter over USB. A telemetry radio usually needs **57600**.
4. **Click Connect.** The button changes to **Disconnect**, and the status shows whether the airplane is armed, its flight mode, the GPS fix and number of satellites, and the battery voltage, for example `Disarmed  MANUAL  GPS 3D (10 sats)  12.6 V`.

The settings load automatically once you are connected, which takes a few seconds. If the flight controller has only just powered on, wait about 20 seconds before uploading a mission; it refuses uploads while it is still starting up.

While ASCEND Flight Control is connected, it has the flight controller's port to itself. Disconnect, or close the app, before you use QGroundControl, Mission Planner, or the standalone RC Configurator with the same flight controller.

### Units

Click **Units…** at the top right to choose how speeds, altitudes, and climb rates are shown: **Metric**, **US (mph / ft)**, or **Aviation (knots / ft)**, or set each one separately. Your choice applies to missions, Aircraft Settings, and the Flight tab, and is saved for next time. The All Parameters tab always shows ArduPilot's own units, and missions are always stored in meters.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/02-units.png"><img src="/assets/resources/ascend-flight-control/02-units.png" alt="The Units window, titled Display units. It explains that the units are used for missions, Aircraft Settings and the Flight tab, and that All Parameters always shows ArduPilot's own units. Three buttons offer Metric, US (mph / ft) and Aviation (knots / ft). Below are lists for Speed, set to Meters per second (m/s); Altitude and distance, set to Meters (m); and Climb rate, set to Meters per second (m/s). Apply and Cancel buttons are at the bottom." width="462" height="325" loading="lazy"></a><figcaption>The Units window. Choose a preset, or set speed, altitude, and climb rate separately.</figcaption></figure>

## 3. Mission tab

A **mission** is the list of waypoints and actions the airplane flies in **AUTO** mode. You plan it on the map, then upload it to the flight controller.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/01-mission.jpg"><img src="/assets/resources/ascend-flight-control/01-mission.jpg" alt="The Mission tab connected to a flight controller. The toolbar has New, Open, Save, Save As, Survey Grid…, Set Home From First WP, Validate, Upload to FC and Download from FC buttons. A satellite map shows a lake, woods and roads, with five numbered waypoints joined by a route line; waypoint 4 is highlighted in orange with a dashed circle around it showing its loiter, and a blue arrow marks the airplane at home. Above the map are a Follow aircraft checkbox and Fit Mission, Layers, Map and Go to Aircraft buttons. Below the map, the mission name reads Field survey practice, with Move Up, Move Down and Delete buttons, and a table lists each waypoint's number, ID, latitude, longitude, altitude in meters, speed in meters per second, action and event. Waypoint 4 reads loiter 2 laps. On the right, the Waypoint Editor shows Home latitude, longitude and altitude with an Apply Home button, and the selected waypoint's Alt 80, Speed 15, Action loiter, and a Loiter box set to A number of laps, Laps 2, Radius 70 m, Direction Clockwise." width="1600" height="967" loading="lazy"></a><figcaption>The Mission tab. Waypoint 4 is selected: it circles twice at a 70 m radius, and the dashed circle on the map shows the path the airplane will fly.</figcaption></figure>

### Plan a mission

1. **Find your field.** Drag the map to move it. Zoom with the scroll wheel or two-finger scroll, the **+** and **−** buttons, or the + and − keys; the arrow keys pan. Trackpad pinch works on Mac and on Windows precision touchpads.
2. **Click the map** to add a waypoint. Each click adds the next one at the end of the route.
3. **Click a waypoint** on the map, or its row in the table, to select it. Its settings appear in the **Waypoint Editor** on the right.
4. **Set its altitude, speed, and action**, then click **Apply Waypoint Changes**. Changes in the editor are not kept until you click it.
5. **Drag a waypoint** to move it: click, hold, and drag.
6. **Reorder or remove** waypoints with **Move Up**, **Move Down**, and **Delete** below the map.
7. **Name the mission** in **Mission Name**, then click **Save** or **Save As**. Missions are saved as `.json` files that you can **Open** later or share with your team.

Altitudes are **above home**, the point where the airplane was armed. **Speed** is the airspeed the airplane flies toward that waypoint; **0** keeps the speed it is already flying.

### Home

The **Home** box sets where the mission starts. Until you change it, home follows the first waypoint. Enter a latitude and longitude and click **Apply Home**, or click **Set Home From First WP**. Once the flight controller has a GPS fix, ArduPilot sets its own home where the airplane arms, and the mission altitudes are measured from there.

### Waypoint actions

The **Action** list sets what the airplane does at a waypoint.

| Action | What the airplane does |
| --- | --- |
| `waypoint` | Flies to the point and carries on to the next one |
| `takeoff` | Climbs out to this waypoint's altitude. Make it the first waypoint |
| `loiter` | Circles the point (see below) |
| `set_servo` | Flies to the point, then moves a servo: enter its **Servo Ch** (channel) and **Servo PWM** (position, about 1000 to 2000) |
| `camera_trigger` | Flies to the point, then takes one photo |
| `return_home` | Flies back to home and circles there |
| `land` | Lands at the point |

Airplanes can't hover, so they ignore a hold time at an ordinary waypoint. To wait somewhere, use a `loiter` waypoint.

### Loiter waypoints

When the action is `loiter`, a **Loiter** box appears. In **Loiter for**, choose how long to circle:

| Loiter for | Settings | Notes |
| --- | --- | --- |
| **A set time** | **Time (s)**, **Direction** | ArduPlane always circles timed loiters at the default radius (`WP_LOITER_RAD`), so the radius can't be changed. The timer starts once the airplane reaches the circle |
| **A number of laps** | **Laps** (1 to 255), **Radius**, **Direction** | |
| **Until the mode changes** | **Radius**, **Direction** | The airplane circles until you switch out of AUTO |

A radius of **0** uses the flight controller's default loiter radius; the editor tells you what that is. To circle **counter-clockwise**, enter a radius. The map draws each loiter circle at the radius the airplane will actually fly.

### Events

An **event** is something the airplane does when it reaches the waypoint, after it arrives, without changing where it flies next.

| Event | What it does | Fields used |
| --- | --- | --- |
| `none` | Nothing | |
| `servo` / `payload` | Moves a servo, for example to drop a payload | **Servo Ch**, **Servo PWM** |
| `camera` | Takes one photo | |
| `camera_distance` | Takes a photo every so many meters from here on. Enter **0** to stop | **Photo every** |
| `relay` | Turns a relay on or off | **Servo Ch** is the relay number (1 = RELAY1); **Servo PWM** 0 is off |

**Notes** and **Event Notes** are for your team; they are saved in the mission file but are not sent to the flight controller.

The camera fires only if **Aircraft Settings → Camera → Shutter trigger** is set. If a mission takes photos and it isn't, the upload warns you.

### Check, upload, and download

- **Validate** checks the mission for problems, such as a missing altitude or an impossible loiter, and lists them.
- **Upload to FC** converts the mission to ArduPlane mission items and asks you to confirm, because it **replaces the mission on the flight controller**. It then reads the mission back and checks every item matches. Wait for **Mission uploaded and verified** before you fly.
- **Download from FC** loads the mission stored on the flight controller into the editor, replacing the one on screen.

You can upload only while connected. If the airplane is armed, the confirmation warns you that a new mission takes effect immediately if it is flying in AUTO.

### Map tools

The buttons above the map:

| Control | What it does |
| --- | --- |
| **Follow aircraft** | Keeps the airplane in view as it moves |
| **Fit Mission** | Zooms to show the whole mission |
| **Layers ▾** | Chooses the base map and turns the FAA airspace layers on and off (see below) |
| **Map ▾** | **Go to My Location**, **Go to Map Home**, **Set Map Home to This View**, and **Clear Map Home** |
| **Go to Aircraft** | Centers the map on the airplane (while connected) |

**Set Map Home to This View** saves the current view, and the map opens there every time. Without a map home, the map opens at your computer's location on Mac and Windows (on Windows, Location must be turned on in Settings). On Raspberry Pi, set a map home.

## 4. Check the airspace

**Layers ▾** chooses one base map:

- **Street map**: OpenStreetMap.
- **VFR sectional chart**: the FAA chart pilots use, with airports and airspace boundaries. It is sharpest at zoom 12; closer in, it is enlarged.
- **Satellite imagery (US only)**: USDA and USGS aerial photos, so you can place waypoints on the real field. Sharp to zoom 16, softer at 17 and 18.

It also turns on any of the FAA airspace layers for the United States, drawn on top of the base map:

| Layer | What it shows |
| --- | --- |
| **TFRs (temporary flight restrictions)** | Live from tfr.faa.gov |
| **UAS Facility Map ceilings (LAANC)** | A grid near airports; the number in each square is the highest altitude, in feet above the ground, the FAA may authorize there through LAANC. 0 means no automatic authorization |
| **Controlled airspace (Class B, C, D, E surface)** | Where Part 107 flights need authorization |
| **Special use airspace (prohibited, restricted, MOA)** | Military and other restricted areas |
| **National security UAS restrictions** | Areas closed to drones |

A legend in the corner of the map shows which layers are on and what they found. Right-click the map and choose **What airspace is here?** to check one spot against every layer. **Layers ▾ → About These Layers…** explains where the data comes from.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/05-airspace-layers.jpg"><img src="/assets/resources/ascend-flight-control/05-airspace-layers.jpg" alt="The Mission tab with the VFR sectional chart as the base map. The chart shows Mineral Wells Regional Airport (MWL) with its runways and its Class D airspace ring, and nearby private airports. Over the airport, the UAS Facility Map draws a grid of squares outlined in red, orange, yellow and green, and the mission's waypoints sit just northeast of the runways inside it. A legend in the lower left reads Planning only, not for navigation; TFR: none here; UAS Facility Map (ft): 313 in view; Controlled airspace: 1 in view; and a color key for ceilings of 0, 50, 100, 200, 300 and 400 feet." width="1600" height="967" loading="lazy"></a><figcaption>The practice mission on the sectional chart, with the UAS Facility Map and controlled-airspace layers on. The field is inside the Mineral Wells (MWL) Class D airspace, so this flight would need LAANC authorization, and the grid shows the highest altitude the FAA may approve in each square.</figcaption></figure>

The layers come from FAA services and can be out of date or incomplete. They help you plan; they don't replace checking NOTAMs and getting authorization. The [Airspace](/part107/) unit of the Part 107 course explains the airspace classes.

## 5. Survey grids

**Survey Grid…** on the Mission toolbar lays out back-and-forth passes over an area, for mapping photos or sensor surveys.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/03-survey-grid-map.jpg"><img src="/assets/resources/ascend-flight-control/03-survey-grid-map.jpg" alt="The Mission tab while the Survey Grid window is open. On the satellite map, an orange rectangle with draggable corner handles marks the survey area, and purple lines inside it show ten parallel back-and-forth passes running east and west. The existing mission waypoints are still visible beneath it." width="1600" height="967" loading="lazy"></a><figcaption>A survey area (orange) and the planned passes (purple). Drag a corner to reshape the area; the passes update as you go.</figcaption></figure>

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/04-survey-grid-window.png"><img src="/assets/resources/ascend-flight-control/04-survey-grid-window.png" alt="The Survey Grid window. An Area section offers Box or Polygon, with the hint Drag a corner to resize the box, and Box Around Map View, Undo Corner and Clear buttons. A Flight section has Altitude 100 m and Speed 15 m/s. A Pass Spacing and Overlap section offers From camera and overlap, which is selected, or Fixed spacing, with Side overlap 60 percent, Front overlap 70 percent, Camera view across 60 degrees and Camera view along. Below, a summary reads: Photo covers 115 m across at this altitude. 10 passes, 46 m apart, heading 90 degrees. 20 waypoints, 12.05 km of flying, about 14 min. Area 47.29 hectares. Photo every 25 m, every 1.7 s at this speed, about 470 photos. Two warnings in orange follow: the flight controller has no camera trigger set up, so set it in Aircraft Settings, Camera; and the passes are closer together than the plane's turn, so it will swing wide at each end. Show Area, Cancel and Add Grid to Mission buttons are at the bottom." width="505" height="788" loading="lazy"></a><figcaption>The Survey Grid window. The summary at the bottom updates as you change the settings and warns about anything that won't work.</figcaption></figure>

1. **Draw the area.** Choose **Box** and click two opposite corners on the map, or click **Box Around Map View**. Or choose **Polygon** and click each corner in order around the area. Drag any corner to adjust it; **Undo Corner** and **Clear** start over.
2. **Set the flight**: the **Altitude** and **Speed** for the passes.
3. **Set the pass spacing.** With **From camera and overlap**, enter how much each pass overlaps the next (**Side overlap**), how much each photo overlaps the next one along a pass (**Front overlap**), and your camera's field of view across and along the passes. With **Fixed spacing**, enter the distance between passes.
4. **Set the pattern**: the pass heading (or **Fly along the area's longest edge (fewest turns)**), the **Run-out** past each edge so the airplane is flying straight before it reaches the area, and the corner to **Start at**.
5. **Set the photos.** With **Take photos by distance** on, the flight controller fires the camera every so many meters, worked out from the front overlap or typed in. By default it takes photos only on the passes, not in the turns.
6. **Check the summary**: the photo footprint, number of passes, flight distance and time, the area, and the photo interval. Read any warnings.
7. **Choose where the grid goes** (**After the current waypoints** or **Replace all waypoints**) and click **Add Grid to Mission**.

On a concave area, some passes cross the notch. If passes are closer together than the airplane's turn, it swings wide at the end of each pass; leave room around the area.

## 6. Flight tab

The Flight tab shows a flight in progress. Connect over a telemetry radio to watch the airplane in the air, or over USB on the bench.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/12-flight.jpg"><img src="/assets/resources/ascend-flight-control/12-flight.jpg" alt="The Flight tab during a simulated flight. The connection status reads ARMED AUTO GPS RTK (10 sats) 12.2 V. On the left, a satellite map shows the mission's six waypoints, a purple trail of the path the airplane has flown, and a blue arrow for the airplane heading toward waypoint 5. On the right, a glass-cockpit display shows AUTO and ARMED, an attitude indicator banked steeply to the right, an airspeed tape reading 22 m/s with ground speed 23.2, an altitude tape reading 81 m above home, and a heading of 111 degrees. Below are tiles for Ground speed 23.2 m/s, Airspeed 22.4 m/s, Climb rate +0.1 m/s, Altitude above home 81 m, Altitude sea level 361 m, Throttle 50 percent, Distance to home 311 m, Target WP 5 at 85 m, Flight time 1:38, GPS RTK 10, Heading 111 degrees and Battery 12.2 V. A Flight controller messages box lists Reached waypoint #3, #4 and #5 and the mission items that followed." width="1600" height="967" loading="lazy"></a><figcaption>The Flight tab during a simulated AUTO flight: the airplane is banking toward waypoint 5, and the purple trail shows where it has flown.</figcaption></figure>

| Part | What it shows |
| --- | --- |
| **Attitude indicator** | Bank and pitch, with the flight mode and armed state across the top |
| **Airspeed tape** (left) | Airspeed, with ground speed (**GS**) below it. If no airspeed sensor is set up, airspeed is the flight controller's estimate and is marked with an asterisk |
| **Altitude tape** (right) | Altitude above home, with the vertical speed beside it |
| **Heading** | The compass heading along the bottom |
| **Readout tiles** | Ground speed, airspeed, climb rate, altitude above home and above sea level, throttle, distance to home, the target waypoint and how far away it is, flight time, GPS fix and satellites, heading, and battery voltage |
| **Flight controller messages** | What the flight controller reports, such as waypoints reached, mode changes, and pre-arm problems |
| **Map** | The airplane, the mission, and a trail of where the airplane has been. **Follow aircraft** is on by default; **Clear Trail** erases the trail |

ASCEND Flight Control watches the flight; it doesn't arm the airplane or change flight modes. Fly with your transmitter, and keep it in your hands in every mode.

## 7. Aircraft Settings tab

The Aircraft Settings tab holds about 30 of the flight controller's settings that ASCEND teams change most, in plain-English groups. Each setting shows its description, its allowed range, and its ArduPilot name (for example `RTL_ALTITUDE`) in small gray letters.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/06-aircraft-settings.png"><img src="/assets/resources/ascend-flight-control/06-aircraft-settings.png" alt="The Aircraft Settings tab. The header reads 1,419 parameters loaded from the flight controller at 22:04, with Load from Flight Controller, Save Backup… and Restore Backup… buttons. On the left, a list of groups: Flight Modes, Return Home (selected, marked with a dot and 1), Speed and Throttle, Flight Limits, Takeoff and Landing, Failsafes, Camera, Geofence and Arming. The Return Home page explains how the plane comes back when it switches to RTL. Return altitude is highlighted in amber with the value 120 m, a range of -1 to 400, the name RTL_ALTITUDE, the note was 100 m, and an Undo link. Below it are Circle size at home 0 m, Loiter radius 80 m and Waypoint reached distance 50 m. A bar at the bottom reads 1 unsaved change, with Discard Changes and Write to Flight Controller buttons." width="1600" height="967" loading="lazy"></a><figcaption>Aircraft Settings with one staged change. Return altitude is marked in amber until you write it to the flight controller.</figcaption></figure>

| Group | What it covers |
| --- | --- |
| **Flight Modes** | The flight mode for each position of the CH5 mode switch, and what the CH6 switch does |
| **Return Home** | Return altitude, the circle flown over home, the loiter radius, and how close counts as reaching a waypoint |
| **Speed & Throttle** | Cruise throttle, throttle limits, and the cruise, minimum, and maximum airspeeds |
| **Flight Limits** | The steepest bank, climb, and dive the autopilot will use |
| **Takeoff & Landing** | Launch detection, motor start delay, takeoff throttle and altitude, and flare height |
| **Failsafes** | What the airplane does when it loses the radio or the telemetry link |
| **Camera** | How the camera shutter is triggered and when photos are taken |
| **Geofence** | A boundary around home: radius, ceiling, shape, and what happens on a breach |
| **Arming** | How the airplane is armed |

### Change a setting

1. **Connect.** The settings load automatically; **Load from Flight Controller** loads them again.
2. **Change a value.** It turns amber, shows what it **was**, and gets an **Undo** link. The group's name in the list shows how many changes it holds. Nothing has been sent yet.
3. **Click Write to Flight Controller.** Review the list of changes and confirm.
4. **Wait for the result.** The app reads back each setting to check the flight controller kept it, and tells you if any didn't. If a change only takes effect after a restart, it offers to restart the flight controller.

**Discard Changes** throws away everything you haven't written. Writing is blocked while the airplane is armed. If you quit with unwritten changes, the app asks first.

### Back up and restore

- **Save Backup…** saves every setting on the flight controller to a `.param` file (the same format Mission Planner uses). Do this before you change anything, and after the airplane flies well.
- **Restore Backup…** compares a `.param` file with the flight controller and stages the differences as unsaved changes, so you can review them before writing. Calibration values (accelerometer, compass, level, and radio) are restored only if you confirm the file came from the **same board**, because each board's calibration is different.

## 8. Calibration tab

Calibrate a new or rebuilt airplane in this order: **accelerometer**, **level**, **compass**, then **radio**. The airplane must be connected and disarmed. Pick each step from the list on the left; a check mark appears once it succeeds.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/08-calibration-accel.png"><img src="/assets/resources/ascend-flight-control/08-calibration-accel.png" alt="The Calibration tab. The header says to do these in order on a new or rebuilt plane: accelerometer, level, compass, then radio, and that the plane must be connected and disarmed. A list on the left shows 1. Accelerometer (selected), 2. Level, 3. Compass and 4. Radio. The Accelerometer (IMU) card explains that it teaches the flight controller which way is down, with three numbered steps and a Start Accelerometer Calibration button. Below, a Gyroscopes card explains that the gyroscopes calibrate themselves at every start-up, with a Calibrate Gyroscopes button." width="1600" height="967" loading="lazy"></a><figcaption>The Calibration tab, on the accelerometer step.</figcaption></figure>

### 1. Accelerometer

This teaches the flight controller which way is down.

1. Set the airplane on a flat table, with room to turn it in every direction.
2. Click **Start Accelerometer Calibration**. A picture shows each of the six positions: level, on its left wingtip, on its right wingtip, nose down, nose up, and upside down.
3. Hold the airplane in the position shown and click **The plane is in position**. Hold it still until the next position appears; each one takes a few seconds.
4. When all six are done, click **Restart Flight Controller**.

The **gyroscopes** calibrate themselves every time the flight controller starts, so keep the airplane still while it powers up. To redo them, set the airplane down, keep it completely still, and click **Calibrate Gyroscopes**.

### 2. Level

This tells the flight controller what level flight looks like, so FBWA and the automatic modes fly wings-level without the stick. Do it after the accelerometer.

1. Put the airplane on a flat surface in the attitude it flies level at: wings level and the nose at its cruise angle. Prop the tail up if it sits nose-high on its wheels.
2. Keep it completely still and click **Calibrate Level**. The page shows the old and new level trim.

### 3. Compass

This measures the magnetic field around the airplane so its heading is right. Metal, magnets, and electronics nearby spoil it, so do it outdoors.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/09-calibration-compass.png"><img src="/assets/resources/ascend-flight-control/09-calibration-compass.png" alt="The Calibration tab on step 3, Compass. The card explains that it measures the magnetic field around the plane so the heading is right, and that metal, magnets and electronics nearby spoil it, so do it outdoors. Three numbered steps say to take the plane outside away from cars, metal benches, phones and speakers; connect over USB or the telemetry radio and click Start; and rotate the plane slowly in every direction until the bar fills. A Start Compass Calibration button follows." width="1600" height="967" loading="lazy"></a><figcaption>The compass step. Do it outdoors, away from cars and metal.</figcaption></figure>

1. Take the airplane outside, at least a few steps from cars, metal benches, phones, and speakers.
2. Connect over USB or the telemetry radio and click **Start Compass Calibration**.
3. Rotate the airplane slowly through every direction: nose up, nose down, and to every side; roll it onto each wingtip and upside down. Keep going until each compass's bar is full. Smooth, slow movements work best.
4. The flight controller saves the result itself. Click **Restart Flight Controller** to start using it.

### 4. Radio

This records how far each stick and switch on your transmitter moves, so full stick means full control. Channels 1 to 6 are calibrated.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/10-calibration-radio.png"><img src="/assets/resources/ascend-flight-control/10-calibration-radio.png" alt="The Calibration tab on step 4, Radio. The card explains that it records how far each stick and switch on the transmitter moves, and that CH1 to CH6 are calibrated. Three numbered steps say to remove the propeller and turn on the transmitter with the receiver bound and powered; click Start and move every stick and switch to both ends; then center the sticks with the throttle all the way down and click Finish. A note says stick centers are not changed here: on ASCEND planes they are saved with the transmitter's Bind button in MANUAL, and CH7 is that Bind button and is left alone. A Start Radio Calibration button follows." width="1600" height="967" loading="lazy"></a><figcaption>The radio step. Stick centers are saved with the Bind button instead.</figcaption></figure>

1. **Remove the propeller.** Turn on the transmitter and make sure the receiver is bound and powered.
2. Click **Start Radio Calibration**. Bars show each channel live. Move every stick and switch to both ends of its travel, a few times. Don't press the Bind button.
3. Center the sticks, put the throttle all the way down, and click **Finish**.
4. **Review the new ranges.** Channels that didn't move, or had no signal, are left unchanged and listed. Click **Write N Settings to Flight Controller** (N is the number of changes) to save the new ranges, or **Discard**.

Stick centers are not changed here. On ASCEND airplanes they are saved with the transmitter's **Bind** button in MANUAL, which updates the servo trims at the same time. CH7 is that Bind button, and the radio calibration leaves it alone. The [Flight Controller V4 Setup Guide](/resources/flight-controller-v4-setup/) explains trim-save.

## 9. All Parameters tab

The All Parameters tab lists every setting on the flight controller, more than 1,400 of them, with ArduPilot's own descriptions, ranges, and units. Use it for settings that aren't on the Aircraft Settings tab.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/07-all-parameters.png"><img src="/assets/resources/ascend-flight-control/07-all-parameters.png" alt="The All Parameters tab. The Search box contains LOITER, next to a Changed only checkbox, and a count on the right reads Showing 3 of 1,419. The table lists NAVL1_LIM_BANK, RTL_RADIUS and WP_LOITER_RAD with their values, units and descriptions; WP_LOITER_RAD, Waypoint Loiter Radius, is selected. The panel on the right shows its full description, its range of -32767 to 32767 m, the flight controller value of 80 m, an edit box holding 80, and a Stage Change button. A bar at the bottom reads Matches the flight controller, with the Discard Changes and Write to Flight Controller buttons grayed out." width="1600" height="967" loading="lazy"></a><figcaption>Searching All Parameters for LOITER. The panel on the right explains the selected parameter.</figcaption></figure>

1. **Type in Search** to filter by name or description. **Changed only** shows just your unsaved changes.
2. **Select a parameter** to see what it does, its range or options, and its current value.
3. **Enter a new value** and click **Stage Change**. Changes here are staged and written the same way as on the Aircraft Settings tab, with **Write to Flight Controller**.

Some parameters are protected. **RC7_OPTION** is the Bind-button trim-save on every ASCEND transmitter; don't give CH7 another function. The app asks you to confirm before changing a protected parameter.

## 10. RC Configurator tab

The RC Configurator tab is the full **Altitude Unknown RC Configurator**, built in: transmitter **Models**, **Instructor / Student**, **Firmware Update**, and **Speaker Test**. It works exactly like the standalone app; see the [RC Configurator User Guide](/resources/transmitter-configurator/) for each tab.

<figure class="textbook-figure"><a href="/assets/resources/ascend-flight-control/11-rc-configurator.png"><img src="/assets/resources/ascend-flight-control/11-rc-configurator.png" alt="The RC Configurator tab inside ASCEND Flight Control. Its own Serial Port bar has Refresh and Connect buttons and reads Not connected. Below are the Models, Instructor / Student, Firmware Update and Speaker Test tabs, with the Models tab showing the Model Slots list, model settings, aircraft type, button channels, control mixing and the channel table." width="1600" height="967" loading="lazy"></a><figcaption>The built-in RC Configurator has its own port selector, separate from the flight controller connection at the top of the window.</figcaption></figure>

The RC Configurator tab has its own **Serial Port** bar for the transmitter, separate from the flight controller connection at the top of the window. Don't choose the transmitter's port in the **Flight controller** list; the app warns you if you do.

When the configurator updates the flight controller's firmware, ASCEND Flight Control first closes its own connection to the flight controller so the two don't fight over the port. Connect again when the update finishes.

## Troubleshooting

| Problem | Try this |
| --- | --- |
| The flight controller isn't in the port list | Use a USB data cable and click **Refresh**. Close QGroundControl, Mission Planner, or the standalone RC Configurator if one has the port open |
| **Connect** fails with "No heartbeat" | Check you chose the flight controller's port, not the transmitter's. For a telemetry radio, try **57600**. Wait for the flight controller to finish starting up |
| The upload is refused because the flight controller is still starting up | Wait about 20 seconds after it powers on, then try again |
| The map is blank | The background map needs the internet. Your waypoints and the airplane still show without it |
| The map doesn't open at your field | Move the map there and choose **Map ▾ → Set Map Home to This View** |
| **Go to My Location** doesn't work | On a Mac, allow location for ASCEND Flight Control in System Settings → Privacy & Security → Location Services. On Windows, turn on Location in Settings. Raspberry Pi doesn't provide a location; use a map home |
| The airspace layers are slow or missing | The FAA services limit how fast data can be fetched, so the app waits and tries again. Zoom in, and give it a few seconds |
| The camera doesn't fire | Set **Aircraft Settings → Camera → Shutter trigger**, and check the camera's servo positions |
| A setting won't write | Disarm the airplane. If the app says a setting didn't take effect, check its range and try again |
| After a calibration, the airplane still reads wrong | Restart the flight controller, then redo **Level** |
| Trackpad pinch doesn't zoom on Raspberry Pi | Raspberry Pi doesn't pass pinch gestures to the app; use the scroll wheel, the + and − buttons, or the keys |

## Recent releases

- **Satellite imagery map** (2026.11.24.2). **Layers ▾ → Satellite imagery (US only)** shows aerial photos under your mission.
- **pid.codes USB IDs** (2026.11.24.1). The RC Configurator tab recognizes transmitters and receivers with their new USB IDs.
- **Survey grids and dragging waypoints** (2026.11.23.2). Drag waypoints to move them; lay out survey grids that take photos by distance; new Camera group in Aircraft Settings.
- **FAA map layers** (2026.11.23.1). VFR sectional chart, TFRs, UAS Facility Maps, and airspace layers; the map opens at your location or a saved map home.

## Documentation and source

- [All ASCEND Flight Control releases and release notes](https://github.com/Altitude-Unknown/RC-Airplane/releases?q=flight-control&expanded=true)
- [Source code and technical README](https://github.com/Altitude-Unknown/RC-Airplane/tree/main/ascend_flight_control), including how each mission action maps to ArduPlane mission items
- [RC Configurator User Guide](/resources/transmitter-configurator/)
- [Flight Controller V4 Setup Guide](/resources/flight-controller-v4-setup/)
- [ArduPlane documentation](https://ardupilot.org/plane/) for the full details of every flight mode and parameter

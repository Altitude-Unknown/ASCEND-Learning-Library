---
id: fly-weight-and-balance-lab
title: "Lab Activity: Weight & Balance"
description: "Calculate moments and the center of gravity, then use a weight and balance chart to decide whether an aircraft is safe to fly."
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
updated: '2026-11-02'
permalink: /resources/fly-weight-and-balance-lab/
subjects:
- UAS
activities:
- Flight Training
courseUnit: 3
related:
- fly-forces-of-flight-lab
---
## About this activity

**Goal:** in this activity, you will determine if your airplane is within its CG (center of gravity) envelope. Using some basic calculations and simple physics, you will determine if your aircraft is safe for flight.

Work through this activity on your own or with your team, then show your results to your instructor. Write your answers on paper or in your own notes.

<figure class="textbook-figure"><a href="/assets/learn-to-fly/wb-airplane-outline.jpg"><img src="/assets/learn-to-fly/wb-airplane-outline.jpg" alt="Side-view line drawing of a single-engine high-wing airplane." loading="lazy"></a><figcaption><p>Weight and balance applies to every aircraft, crewed or uncrewed.</p></figcaption></figure>

## Background information

During the flight planning and pre-flight stages of a UAS operation, a pilot must determine if their airplane is safe to fly. One of the things a pilot must do is determine the center of gravity, or CG. Because an airplane can carry varying battery sizes, sensors, and other payloads, the CG may shift with each flight. There are limits to how heavy a plane can be, as well as how far forward or aft the center of gravity can be.

In your last experiment, you flew some paper airplanes, located the center of gravity, and experimented with moving the center of gravity forward and aft by adding weights to the airplane. You should have found that at some point the plane became difficult or impossible to control. Imagine if a pilot took off in an airplane only to find out after takeoff that the CG was too far forward or aft! It has happened, and it is a serious problem.

To understand weight and balance, you need to first understand how objects balance on a fulcrum (balance point). Assume for these examples that the front of the airplane is on the left, and the rear of the airplane is on the right.

<figure class="textbook-figure"><a href="/assets/learn-to-fly/seesaw-balanced.jpg"><img src="/assets/learn-to-fly/seesaw-balanced.jpg" alt="A level see-saw with equal boxes on each end, balanced on a triangle fulcrum in the middle." loading="lazy"></a><figcaption><p>Balanced: the forces are equal on each side of the fulcrum.</p></figcaption></figure>

The see-saw above is balanced, because the forces are equal on each side of the balance point (the fulcrum). On an airplane, this balance point is somewhere under the wings. In the next picture, the see-saw is out of balance. In this case the CG is too far forward (left).

<figure class="textbook-figure"><a href="/assets/learn-to-fly/seesaw-forward-cg.jpg"><img src="/assets/learn-to-fly/seesaw-forward-cg.jpg" alt="A see-saw tipped down on the left side." loading="lazy"></a><figcaption><p>CG too far forward (left).</p></figcaption></figure>

<figure class="textbook-figure"><a href="/assets/learn-to-fly/seesaw-aft-cg.jpg"><img src="/assets/learn-to-fly/seesaw-aft-cg.jpg" alt="A see-saw tipped down on the right side under a larger box." loading="lazy"></a><figcaption><p>CG too far aft (right), because of a heavy weight in the rear of the airplane.</p></figcaption></figure>

We can apply the same principles to our airplane. The balance point on the airplane needs to fall within a range. Just as with your paper airplane experiment, you can have a CG forward or aft of the empty plane’s balance point, and still control the airplane. The same is true of a real airplane: there is a range of forward and aft CG limits. We locate the CG in reference to a datum. The datum is a fixed point on the aircraft. It is usually the front of the plane, the firewall, or the windscreen, but each manufacturer sets a different datum. In the examples used here, we will use the firewall of the airplane as the datum.

The **arms** are the distances of the loaded weights from the datum. Payloads, batteries, cameras, fuel, oil, and so on all have an arm, based on how far they are from the datum. These arms are measured from the datum to the location where the weights are placed in the airplane. These locations are fixed locations such as the battery bay, camera mounts, the cargo area, and the fuel tanks on gas-powered UAS. In this activity, you will use the arms provided to calculate the moments.

**Moments** are the downward forces, in inch-pounds, that loads in the aircraft represent. A moment is simply the weight of the object in pounds multiplied by the arm.

In order to determine the center of gravity of your airplane, you will calculate all the moments, add up all the moments, then all the weights, and divide to get the CG.

<figure class="textbook-figure"><a href="/assets/learn-to-fly/cg-limits-diagram.jpg"><img src="/assets/learn-to-fly/cg-limits-diagram.jpg" alt="Side-view airplane drawing with labels for the datum at the firewall, the maximum forward CG, and the maximum aft CG, noting that the CG must fall somewhere between the forward and aft limits." loading="lazy"></a><figcaption><p>The CG must fall between the forward and aft CG limits. The limits shown are for illustration only.</p></figcaption></figure>

The next drawing shows the location of the pilot, passengers, and baggage (payloads). The distance of these points from the datum plane is called the arm. These arms will be used to calculate the moments.

<figure class="textbook-figure"><a href="/assets/learn-to-fly/loading-arms-diagram.jpg"><img src="/assets/learn-to-fly/loading-arms-diagram.jpg" alt="Side-view airplane drawing with vertical lines marking, from front to back, the datum, the pilot and front passenger, the rear passengers, and the baggage." loading="lazy"></a><figcaption><p>Each load has an arm: its distance behind the datum.</p></figcaption></figure>

## Sample calculation

Now we will do a sample CG calculation based on some sample data for a crewed aircraft. The same process applies to an uncrewed aircraft system. The moment has been divided by 1000 to keep the numbers small; the final answer is then multiplied by 1000 to return it to normal units. If you don’t mind working with the larger numbers, you can skip the divide-by-1000 and multiply-by-1000 steps. However, most aircraft handbooks use the divide-by-100 or divide-by-1000 method.

<div class="textbook-table activity-table" role="region" aria-label="Sample calculation" tabindex="0"><table><caption>Sample calculation</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>340 lb</td><td>37</td><td>12.58</td></tr><tr><th scope="row">Fuel: 53 gallons (maximum)</th><td>318 lb</td><td>48</td><td>15.26</td></tr><tr><th scope="row">Rear passenger</th><td>80 lb</td><td>72</td><td>5.76</td></tr><tr><th scope="row">Baggage</th><td>30 lb</td><td>76</td><td>2.28</td></tr><tr><th scope="row">Total</th><td>2,407 lb</td><td></td><td>100.28</td></tr></tbody></table></div>

Center of gravity = total moment ÷ total weight = 100.28 ÷ 2,407 × 1000 = **41.66 inches from datum**.

Next, we need to determine if the center of gravity and total weight are within the limits of the aircraft. Using the weight and balance chart, locate 41.6 inches on the bottom (x axis) and 2,407 lb on the left side (y axis). Draw a line from both locations and see where they intersect. In this case, the two points intersect in the normal category range. This airplane is within its weight and balance limits.

<figure class="textbook-figure"><a href="/assets/learn-to-fly/wb-chart-sample.jpg"><img src="/assets/learn-to-fly/wb-chart-sample.jpg" alt="Weight and balance chart plotting loaded airplane weight from 1,500 to 2,500 pounds against CG location from 34 to 48 inches aft of datum. A dark utility category area sits inside a larger light normal category area. Red lines mark the sample: 41.6 inches and 2,407 pounds, which meet inside the normal category." loading="lazy"></a><figcaption><p>The sample loading plotted on the weight and balance chart.</p></figcaption></figure>

When you plot your weight and balance, any point that does not fall within the normal category or the utility category is out of limits. When your airplane’s weight and balance falls within the utility category, the aircraft can typically handle higher positive and negative load factors than in the normal category. In order to make it into the utility category, any non-essential weight is removed from the aircraft, and often a minimum load of fuel is carried to keep the weight down. Most general aviation aircraft fall within the normal category for most flights. However, during flight training an instructor might want to perform spin training with a student, or other high-load maneuvers. In such a case, the airplane is typically loaded so that it falls within the utility category. Aerobatic aircraft are built to different tolerances, so they have different limits: much higher positive and negative load limits for the aggressive maneuvers such an aircraft is put through in flight. A weight and balance chart like this one can be found in each aircraft’s approved operating handbook.

<figure class="textbook-figure"><a href="/assets/learn-to-fly/wb-chart.jpg"><img src="/assets/learn-to-fly/wb-chart.jpg" alt="Blank weight and balance chart: loaded airplane weight from 1,500 to 2,500 pounds against CG location from 34 to 48 inches aft of datum, with utility and normal category areas." loading="lazy"></a><figcaption><p>Use this chart for the problems below. Select it to open it full size for printing.</p></figcaption></figure>

<div class="textbook-table activity-table" role="region" aria-label="Weight and balance envelope" tabindex="0"><table><caption>Weight and balance envelope (read from the chart above)</caption><thead><tr><th scope="col">Category</th><th scope="col">Maximum weight</th><th scope="col">Forward CG limit</th><th scope="col">Aft CG limit</th></tr></thead><tbody><tr><th scope="row">Normal</th><td>2,450 lb</td><td>35.0 in up to 1,950 lb, then moving aft in a straight line to 40.0 in at 2,450 lb</td><td>About 47.4 in</td></tr><tr><th scope="row">Utility</th><td>2,150 lb</td><td>35.0 in up to 1,950 lb, then moving aft to about 37.0 in at 2,150 lb</td><td>About 40.4 in</td></tr></tbody></table></div>

## Weight and balance problems

Fuel weighs 6 lb per gallon in these problems (53 gallons = 318 lb). For each problem, complete the table, calculate the CG, and use the chart to decide whether the airplane is within limits.

### Problem 1

<div class="textbook-table activity-table" role="region" aria-label="Problem 1" tabindex="0"><table><caption>Problem 1</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>180 lb</td><td>37</td><td></td></tr><tr><th scope="row">Fuel: 53 gallons (maximum)</th><td></td><td>48</td><td></td></tr><tr><th scope="row">Rear passenger</th><td>150 lb</td><td>72</td><td></td></tr><tr><th scope="row">Baggage</th><td>40 lb</td><td>76</td><td></td></tr><tr><th scope="row">Total</th><td></td><td></td><td></td></tr></tbody></table></div><p>Center of gravity = total moment ÷ total weight × 1000 = ________ inches from datum. Is this airplane within its weight and balance limits?</p>

### Problem 2

<div class="textbook-table activity-table" role="region" aria-label="Problem 2" tabindex="0"><table><caption>Problem 2</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>350 lb</td><td>37</td><td></td></tr><tr><th scope="row">Fuel: 53 gallons (maximum)</th><td></td><td>48</td><td></td></tr><tr><th scope="row">Rear passenger</th><td>none</td><td>72</td><td></td></tr><tr><th scope="row">Baggage</th><td>none</td><td>76</td><td></td></tr><tr><th scope="row">Total</th><td></td><td></td><td></td></tr></tbody></table></div><p>Center of gravity = total moment ÷ total weight × 1000 = ________ inches from datum. Is this airplane within its weight and balance limits?</p>

### Problem 3

<div class="textbook-table activity-table" role="region" aria-label="Problem 3" tabindex="0"><table><caption>Problem 3</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>190 lb</td><td>37</td><td></td></tr><tr><th scope="row">Fuel: 30 gallons</th><td></td><td>48</td><td></td></tr><tr><th scope="row">Rear passenger</th><td>none</td><td>72</td><td></td></tr><tr><th scope="row">Baggage</th><td>60 lb</td><td>76</td><td></td></tr><tr><th scope="row">Total</th><td></td><td></td><td></td></tr></tbody></table></div><p>Center of gravity = total moment ÷ total weight × 1000 = ________ inches from datum. Is this airplane within its weight and balance limits?</p>

### Problem 4

<div class="textbook-table activity-table" role="region" aria-label="Problem 4" tabindex="0"><table><caption>Problem 4</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>180 lb</td><td>37</td><td></td></tr><tr><th scope="row">Fuel: 53 gallons (maximum)</th><td></td><td>48</td><td></td></tr><tr><th scope="row">Rear passenger</th><td>220 lb</td><td>72</td><td></td></tr><tr><th scope="row">Baggage</th><td>100 lb</td><td>76</td><td></td></tr><tr><th scope="row">Total</th><td></td><td></td><td></td></tr></tbody></table></div><p>Center of gravity = total moment ÷ total weight × 1000 = ________ inches from datum. Is this airplane within its weight and balance limits?</p>

### Problem 5

<div class="textbook-table activity-table" role="region" aria-label="Problem 5" tabindex="0"><table><caption>Problem 5</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>360 lb</td><td>37</td><td></td></tr><tr><th scope="row">Fuel: 53 gallons (maximum)</th><td></td><td>48</td><td></td></tr><tr><th scope="row">Rear passenger</th><td>190 lb</td><td>72</td><td></td></tr><tr><th scope="row">Baggage</th><td>100 lb</td><td>76</td><td></td></tr><tr><th scope="row">Total</th><td></td><td></td><td></td></tr></tbody></table></div><p>Center of gravity = total moment ÷ total weight × 1000 = ________ inches from datum. Is this airplane within its weight and balance limits?</p>

## Answer key

Try every problem before you open its answer.

<details class="answer-key"><summary>Show the answer to problem 1</summary><div class="textbook-table activity-table" role="region" aria-label="Problem 1 answer" tabindex="0"><table><caption>Problem 1 answer</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>180 lb</td><td>37</td><td>6.66</td></tr><tr><th scope="row">Fuel: 53 gallons</th><td>318 lb</td><td>48</td><td>15.26</td></tr><tr><th scope="row">Rear passenger</th><td>150 lb</td><td>72</td><td>10.80</td></tr><tr><th scope="row">Baggage</th><td>40 lb</td><td>76</td><td>3.04</td></tr><tr><th scope="row">Total</th><td>2,327 lb</td><td></td><td>100.16</td></tr></tbody></table></div><p>CG = 100.16 ÷ 2,327 × 1000 = 43.04 inches from datum. Within limits: normal category. The printed answer key gives the baggage moment as 30.4 and the CG as 54.8 inches; 40 lb × 76 in ÷ 1000 is 3.04, so the corrected CG is 43.04 inches.</p><p class="small muted">The lab manual’s key gives the CG; the within-limits reading is from the chart above.</p></details>

<details class="answer-key"><summary>Show the answer to problem 2</summary><div class="textbook-table activity-table" role="region" aria-label="Problem 2 answer" tabindex="0"><table><caption>Problem 2 answer</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>350 lb</td><td>37</td><td>12.95</td></tr><tr><th scope="row">Fuel: 53 gallons</th><td>318 lb</td><td>48</td><td>15.26</td></tr><tr><th scope="row">Rear passenger</th><td>none</td><td>72</td><td>0</td></tr><tr><th scope="row">Baggage</th><td>none</td><td>76</td><td>0</td></tr><tr><th scope="row">Total</th><td>2,307 lb</td><td></td><td>92.61</td></tr></tbody></table></div><p>CG = 92.61 ÷ 2,307 × 1000 = 40.14 inches from datum. Within limits: normal category.</p><p class="small muted">The lab manual’s key gives the CG; the within-limits reading is from the chart above.</p></details>

<details class="answer-key"><summary>Show the answer to problem 3</summary><div class="textbook-table activity-table" role="region" aria-label="Problem 3 answer" tabindex="0"><table><caption>Problem 3 answer</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>190 lb</td><td>37</td><td>7.03</td></tr><tr><th scope="row">Fuel: 30 gallons</th><td>180 lb</td><td>48</td><td>8.64</td></tr><tr><th scope="row">Rear passenger</th><td>none</td><td>72</td><td>0</td></tr><tr><th scope="row">Baggage</th><td>60 lb</td><td>76</td><td>4.56</td></tr><tr><th scope="row">Total</th><td>2,069 lb</td><td></td><td>84.63</td></tr></tbody></table></div><p>CG = 84.63 ÷ 2,069 × 1000 = 40.90 inches from datum. Within limits: normal category.</p><p class="small muted">The lab manual’s key gives the CG; the within-limits reading is from the chart above.</p></details>

<details class="answer-key"><summary>Show the answer to problem 4</summary><div class="textbook-table activity-table" role="region" aria-label="Problem 4 answer" tabindex="0"><table><caption>Problem 4 answer</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>180 lb</td><td>37</td><td>6.66</td></tr><tr><th scope="row">Fuel: 53 gallons</th><td>318 lb</td><td>48</td><td>15.26</td></tr><tr><th scope="row">Rear passenger</th><td>220 lb</td><td>72</td><td>15.84</td></tr><tr><th scope="row">Baggage</th><td>100 lb</td><td>76</td><td>7.6</td></tr><tr><th scope="row">Total</th><td>2,457 lb</td><td></td><td>109.76</td></tr></tbody></table></div><p>CG = 109.76 ÷ 2,457 × 1000 = 44.67 inches from datum. Out of limits: 2,457 lb is over the 2,450 lb maximum weight.</p><p class="small muted">The lab manual’s key gives the CG; the within-limits reading is from the chart above.</p></details>

<details class="answer-key"><summary>Show the answer to problem 5</summary><div class="textbook-table activity-table" role="region" aria-label="Problem 5 answer" tabindex="0"><table><caption>Problem 5 answer</caption><thead><tr><th scope="col">Item</th><th scope="col">Weight</th><th scope="col">Arm (in)</th><th scope="col">Moment ÷ 1000 (in-lb)</th></tr></thead><tbody><tr><th scope="row">Aircraft empty weight</th><td>1,639 lb</td><td>39.29</td><td>64.4</td></tr><tr><th scope="row">Pilot and front passenger</th><td>360 lb</td><td>37</td><td>13.32</td></tr><tr><th scope="row">Fuel: 53 gallons</th><td>318 lb</td><td>48</td><td>15.26</td></tr><tr><th scope="row">Rear passenger</th><td>190 lb</td><td>72</td><td>13.68</td></tr><tr><th scope="row">Baggage</th><td>100 lb</td><td>76</td><td>7.6</td></tr><tr><th scope="row">Total</th><td>2,607 lb</td><td></td><td>114.26</td></tr></tbody></table></div><p>CG = 114.26 ÷ 2,607 × 1000 = 43.82 inches from datum. Out of limits: 2,607 lb is over the 2,450 lb maximum weight.</p><p class="small muted">The lab manual’s key gives the CG; the within-limits reading is from the chart above.</p></details>

## Terms

<dl class="key-terms">
<dt>Firewall</dt><dd>Section of the aircraft that separates the crew and passenger cabin from the engine.</dd>
<dt>Datum</dt><dd>Point from which weight and balance is measured. Typically the firewall or the front of the airplane is used.</dd>
<dt>Center of gravity</dt><dd>The point at which an airplane balances.</dd>
<dt>Moment</dt><dd>The force, in inch-pounds, of items placed in an airplane such as passengers, crew, fuel, and baggage.</dd>
<dt>Arm</dt><dd>The distance of cargo, passengers, and fuel from the datum plane, measured in inches.</dd>
</dl>

<p class="small muted">From Chapter 3 of the <a href="/resources/remote-aircraft-textbook/">Remote and Autonomous Aircraft Systems lab manual</a>. Read the chapter online: <a href="/learn-to-fly/textbook/piloting-remote-aircraft/">Chapter 3: Piloting Remote Aircraft</a>.</p>

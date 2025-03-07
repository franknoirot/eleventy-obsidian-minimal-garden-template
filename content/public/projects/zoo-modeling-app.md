---
title: Zoo Modeling App
organization: Zoo
role: design engineer
created: 2023-02-01
updated: 2024-01-11
tools: React, Tauri, XState, KittyCAD API
image: zoo-modeling-app.webp
color:
  h: 71
  s: 100
  l: 50
---
This is the flagship app for Zoo, where I work. Our company's offerings are APIs for building software for hardware design, and ZMA is our demonstration of how to build sophisticated tools on top of our APIs. Most of the people on our team touch this app in one way or another, and I've gotten to contribute in a few key ways that I'm proud of.

First I helped guide our state management system over to using XState along with my colleague [Kurt](https://kurthutten.com/), which has proven to be very helpful as our app grows dramatically in complexity. Almost everything in ZMA is now a state machine with an easy-to-read and easy-to-debug state diagram.

Second is our command bar system, which builds upon the XState migration. Our Cmd + K bar follows the [UX patterns found in a lot of other software](https://maggieappleton.com/command-bar), but we have the benefit of building with it in mind from the start. In addition to designing and implementing the frontend UX which is already feeling pretty fast, I architected our bar to be very easy to augment, because all it does is show the next events available in any state machines given to it. This is why it was so powerful to make every complex user flow powered by a state machine. Now every time we add steps in our state diagrams, they are made available to command bar users with very little development effort. I'll write about this project in its own right soon.

In addition to these major lifts I've done all frontend styling and UX for the app, built the project system, the file and folder system, the settings system, and the onboarding flow.
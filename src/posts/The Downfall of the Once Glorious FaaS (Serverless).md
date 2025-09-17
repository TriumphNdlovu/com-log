---
title: "The Downfall of the Once Glorious FaaS (Serverless)"
date: 2025-09-17
description: "A critical look at the challenges and limitations of Function as a Service (FaaS) in modern application development."
author: "Triumph Ndlovu"
---

## The Rise and Fall of FaaS
When FaaS first emerged, it was praised as the future of cloud applications. The promise was simple: write small functions, let the cloud provider scale them for you, and only pay for what you use. No servers, no infrastructure headaches, just code.

A few years later, the hype has cooled (and yes, AI hype might follow 😅). While FaaS still has its place, it hasn’t lived up to its billing as the _default_ model of modern application development. Here’s why

---
## Cold Start and Latency Issues
This is the most straight forward and the biggest pain point for an end user, Since the functions are not always running, spinning them up introduces unpredictable latency. and for user-facing applications where performance is critical these delays can be unacceptable. and can sometimes be difference between converting a costumer and losing one in split seconds. 
## State Management  is Hard
Most real-world applications need to maintain state, manage sessions, or persist data across requests, however FaaS was designed to be stateless , ephemeral functions. To account for this developers often end up gluing together multiple cloud services just to simulate state and this adds more complexity and cost

## Vendor Lock-In
FaaS platforms are tightly coupled with their cloud providers.
- AWS Lambda
- Azure Functions
- Google Cloud Functions
All of these platforms have their own quirks, APIs and integration.
Once you commit to a vendor, it is very hard to migrate away at a later stage because all the these systems are coupled together and for good reasons. However now companies are very cautious  about locking themself into one ecosystem.
## The Complexity Trade-Off
The architectural design that allows you to write a ton of small function and be able to stitch them to work together with databases, APIs and etc is often very complex so as much as it may be simplified at a function level, the trade off is complexity at a System level. which actually defeats the whole purpose.

## FaaS Isn’t Dead, But It’s Not the Future Either
FaaS is not dead and I can even argue it will never die as it has it's place and use cases that is fantastic on like event-driven tasks and backend automation but the dream of building entire application on FaaS has been proven unrealistic for most Organizations.

The industry is moving towards hybrid models , combining containers, microservices, and sometimes FaaS for specific tasks. The downfall of cloud is not that it actually failed completely but it is that it never became the all that it was hyped to be.

---

If you found this interesting please
let me know if you want to know more about the **hybrid models** that are being adopted by many companies now.
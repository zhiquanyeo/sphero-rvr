# sphero-rvr-base
API for the Sphero RVR

## Introduction
This is an API for interacting with a Sphero RVR over serial. It takes ideas from the official Sphero Node JS API, without the HTTP front end, making it suitable for embedding directly in JavaScript based robot code.

## Usage
To install: `npm install --save sphero-rvr-base`

To use:

```typescript
const transport: SerialTransport = new  SerialTransport("/dev/ttys1");
const rvr: RVR = new RVR(transport);
```

Upon instantiation, the `RVR` class will attempt to open a serial connection to the RVR robot. Once this is done, you are ready to interact with the RVR.

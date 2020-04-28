import { SpheroRVR } from "./rvr";
import { SerialTransport, MockTransport } from "./transport/serial-transport";
import { RawMotorModes, LED, TargetsAndSources } from "./api/constants";
import Color = require("color");

const serialTransport = new SerialTransport("COM3");
const mockTransport = new MockTransport();
const RVR = new SpheroRVR(serialTransport);

mockTransport.setMockDataWrittenCallback((data: number[]) => {
    console.log(data);
});

const forward: boolean = true;

let lightOn: boolean = false;

RVR.wake();
RVR.getBatteryPercentage()
    .then(percentage => {
        console.log("Battery Percent: ", percentage);
    });
RVR.setAllLeds(0, 0, 0);

const colors: Color[] = [
    Color("red"),
    Color("green"),
    Color("blue"),
    Color("orange"),
    Color("purple"),
    Color("cyan")
];

const numColors = colors.length;
let currIdx = 0;

RVR.clearStreamingService(TargetsAndSources.robotNordicTarget);
RVR.clearStreamingService(TargetsAndSources.robotStTarget);

RVR.enableColorDetection(true);
// RVR.sensorControl.startStreaming(["Accelerometer", "ColorDetection"], 500);

RVR.enableSensor("Accelerometer", (sensorData) => {
    // console.log("Accel: ", JSON.stringify(sensorData));
});

RVR.enableSensor("ColorDetection", (sensorData) => {
    const data: any = (sensorData as any);
    if (data.Index !== 255) {
        RVR.setSingleLed(LED.LEFT_BRAKELIGHT, data.R, data.G, data.B);
        RVR.setSingleLed(LED.RIGHT_BRAKELIGHT, data.R, data.G, data.B);
    }
    else {
        RVR.setSingleLed(LED.LEFT_BRAKELIGHT, 0, 0, 0);
        RVR.setSingleLed(LED.RIGHT_BRAKELIGHT, 0, 0, 0);
    }
});


RVR.startSensorStreaming([], 100);

setInterval(() => {

    const currColor = colors[currIdx];
    currIdx++;
    if (currIdx >= numColors) {
        currIdx = 0;
    }

    RVR.setSingleLedColor(LED.LEFT_HEADLIGHT, currColor);

    // let red: number = 0;
    // let green: number = 0;
    // let blue: number = 0;

    // if (lightOn) {
    //     red = 255;
    //     green = 0;
    //     blue = 255;

    // }

    // RVR.setSingleLed(LED.LEFT_HEADLIGHT, red, green, blue);

    lightOn = !lightOn;


}, 1000);
// setInterval(() => {
//     let direction: RawMotorModes;
//     if (forward) {
//         direction = RawMotorModes.forward;
//     }
//     else {
//         direction = RawMotorModes.reverse;
//     }

//     forward = !forward;
//     RVR.setRawMotors(direction, 100, direction, 100);
// }, 1000);

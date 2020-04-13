import { TransportBase } from "./transport/serial-transport";
import { MessageParser, MessageParserFactory } from "./api/message-parser";
import { IMessage, IResponseMessage, ICommandMessage, makeCommandMessageWithDefaultFlags } from "./api/messages";
import { DeferredPromise } from "./utils/deferred-promise";
import { ByteUtils } from "./utils/byte-utils";
import { TargetsAndSources, RawMotorModes, LED } from "./api/constants";
import { makeEchoRequest, parseEchoResponse } from "./api/devices/api-shell/api-shell-commands";
import { makeWakeRequest, makeSleepRequest, makeGetBatteryPercentageRequest, parseGetBatteryPercentageResponse } from "./api/devices/power/power-commands";
import { makeRawMotorsRequest, makeResetYawRequest, makeDriveWithHeadingRequest } from "./api/devices/drive/drive-commands";
import { makeSetAllLedsRequest, makeSetSingleRgbLedRequest } from "./api/devices/io/io-commands";
import Color = require("color");
import { RobotLink } from "./api/robot-link";
import { getCommandParserFactory } from "./api/command-parser-factory";
import { makeEnableGyroMaxRequest, makeResetLocatorXYRequest, makeSetLocatorFlagsRequest, makeGetRgbcSensorValuesRequest, IGetRgbcSensorValuesResponse, parseGetRgbcSensorValuesResponse, makeGetAmbientLightSensorValueRequest, parseGetAmbientLightSensorValueResponse, makeEnableColorDetectionNotifyRequest, makeGetCurrentDetectedColorReadingRequest, makeEnableColorDetectionRequest, makeConfigureStreamingServiceRequest, makeStartStreamingServiceRequest, makeStopStreamingServiceRequest, makeClearStreamingServiceRequest, parseGyroMaxNotifyResponse, parseColorDetectionNotifyResponse } from "./api/devices/sensor/sensor-commands";
import { SensorControl } from "./api/controls/sensor-control";
import { IMessageLite } from "./api/message-lite";
import { ISensorStreamSlotData } from "./api/streaming/sensor-stream-slot";

export type ISensorDataHandler = (sensorData: object) => any;

export class SpheroRVR {
    private readonly _robotLink: RobotLink;

    private readonly _sensorControl: SensorControl;

    private readonly _sensorDataHandlersByName: Map<string, ISensorDataHandler>;

    constructor(transport: TransportBase) {

        this._robotLink = new RobotLink(transport);

        this._sensorControl = new SensorControl(this._robotLink);

        this._sensorDataHandlersByName = new Map<string, ISensorDataHandler>();

        // Hook up the command response parsers
        const commandParserFactory = getCommandParserFactory();

        commandParserFactory.addParser(2, 0x18, 0x10, parseGyroMaxNotifyResponse);
        commandParserFactory.addParser(1, 0x18, 0x36, parseColorDetectionNotifyResponse);

        this._robotLink.registerMessageNotificationObserver(cmdMsg => {
            // only do this for sensor stream data
            if (cmdMsg.commandId === 0x3D) {
                const data = (cmdMsg.data as ISensorStreamSlotData);

                Object.keys(data).forEach(sensorName => {
                    const handler = this._sensorDataHandlersByName.get(sensorName);
                    if (handler) {
                        handler(data[sensorName]);
                    }
                });
            }
            // TODO handle other Notify type events here
        });
    }

    // === API ===
    // API and Shell (Device 0x10)
    public echo(message: number[]): Promise<number[] | Error> {
        const cmdMessage = makeEchoRequest(message, TargetsAndSources.robotStTarget);

        return this._robotLink.sendCommandMessage(cmdMessage)
        .then(response => {
            const respPayload = parseEchoResponse(response.dataRawBytes);
            return respPayload.data;
        })
        .catch(ex => {
            console.log("Problem with echo request: ", ex);
            return ex;
        });
    }

    // Power (Device 0x13)
    public wake(): Promise<void | Error> {
        const message = makeWakeRequest();

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            console.log("Received error from WAKE: ", err);
            return err;
        });
    }

    public sleep(): Promise<void | Error> {
        const message = makeSleepRequest();

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            console.log("Received error from SLEEP: ", err);
            return err;
        })
    }

    public getBatteryPercentage(): Promise<number | Error> {
        const message = makeGetBatteryPercentageRequest();

        return this._robotLink.sendCommandMessage(message)
        .then(response => {
            const respPayload = parseGetBatteryPercentageResponse(response.dataRawBytes);
            return respPayload.percentage;
        })
        .catch(err => {
            return err;
        });
    }

    // Drive (Device 0x16)
    public setRawMotors(leftMode: RawMotorModes, leftSpeed: number,
                        rightMode: RawMotorModes, rightSpeed: number): Promise<void | Error> {
        const message = makeRawMotorsRequest(leftMode, leftSpeed, rightMode, rightSpeed);

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public resetYaw(): Promise<void | Error> {
        const message = makeResetYawRequest();

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public driveWithHeading(speed: number, heading: number): Promise<void | Error> {
        if (speed < -255) {
            speed = -255;
        }
        if (speed > 255) {
            speed = 255;
        }

        if (heading < 0) {
            heading = 0;
        }
        if (heading > 359) {
            heading = 359;
        }

        const message = makeDriveWithHeadingRequest(speed, heading);

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    // IO (Device 0x1A)
    public setAllLeds(red: number, green: number, blue: number): Promise<void | Error> {
        const message = makeSetAllLedsRequest(red, green, blue);

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public setAllLedsColor(color: Color): Promise<void | Error> {
        const [r, g, b] = color.rgb().array();

        return this.setAllLeds(r, g, b);
    }

    public setSingleLed(ledGroup: LED, red: number, green: number, blue: number): Promise<void | Error> {
        const message = makeSetSingleRgbLedRequest(ledGroup, red, green, blue);
        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public setSingleLedColor(ledGroup: LED, color: Color): Promise<void | Error> {
        const [r, g, b] = color.rgb().array();
        return this.setSingleLed(ledGroup, r, g, b);
    }

    // Sensors (0x18)
    public enableGyroMaxNotify(enable: boolean): Promise<void | Error> {
        const message = makeEnableGyroMaxRequest(enable);
        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public resetLocatorXY(): Promise<void | Error> {
        const message = makeResetLocatorXYRequest();
        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public setLocatorFlags(flags: number): Promise<void | Error> {
        const message = makeSetLocatorFlagsRequest(flags);
        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public getRbgcSensorValues(): Promise<IGetRgbcSensorValuesResponse | Error> {
        const message = makeGetRgbcSensorValuesRequest();

        return this._robotLink.sendCommandMessage(message)
        .then(response => {
            return parseGetRgbcSensorValuesResponse(response.dataRawBytes);
        })
        .catch(err => {
            return err;
        });
    }

    public getAmbientLightSensorValue(): Promise<number | Error> {
        const message = makeGetAmbientLightSensorValueRequest();

        return this._robotLink.sendCommandMessage(message)
        .then(response => {
            const payload = parseGetAmbientLightSensorValueResponse(response.dataRawBytes);
            return payload.ambientLightValue;
        })
        .catch(err => {
            return err;
        });
    }

    public enableColorDetectionNotify(enabled: boolean,
                                      interval: number,
                                      minConfidenceThresh: number): Promise<void | Error> {
        const message = makeEnableColorDetectionNotifyRequest(enabled, interval, minConfidenceThresh);

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public getCurrentDetectedColorReading(): Promise<void | Error> {
        const message = makeGetCurrentDetectedColorReadingRequest();

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public enableColorDetection(enable: boolean): Promise<void | Error> {
        const message = makeEnableColorDetectionRequest(enable);

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public configureStreamingService(targetId: number, token: number, config: number[]): Promise<void | Error> {
        const message = makeConfigureStreamingServiceRequest(targetId, token, config);

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public startStreamingService(targetId: number, period: number): Promise<void | Error> {
        const message = makeStartStreamingServiceRequest(targetId, period);

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public stopStreamingService(targetId: number): Promise<void | Error> {
        const message = makeStopStreamingServiceRequest(targetId);

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    public clearStreamingService(targetId: number): Promise<void | Error> {
        const message = makeClearStreamingServiceRequest(targetId);

        return this._robotLink.sendCommandMessage(message)
        .catch(err => {
            return err;
        });
    }

    // Sensor Control
    public getAvailableSensorsToStream(): string[] {
        return this._sensorControl.getSupportedStreamingServices();
    }

    public startSensorStreaming(sensors: string[], interval: number) {
        this._sensorControl.startStreaming(sensors, interval);
    }

    public stopSensorStreaming() {
        this._sensorControl.stopStreaming();
    }

    public enableSensor(streamingServiceName: string, handler: ISensorDataHandler): void {
        this._sensorControl.enableSensor(streamingServiceName);
        this._sensorDataHandlersByName.set(streamingServiceName, handler);
    }

    public disableSensor(streamingServiceName: string): void {
        if (this._sensorDataHandlersByName.has(streamingServiceName)) {
            this._sensorDataHandlersByName.delete(streamingServiceName);
        }

        this._sensorControl.disableSensor(streamingServiceName);
    }

    // === END API ===

    private configureResponseParsers(): void {
        const commandParserFactory = getCommandParserFactory();

    }
}

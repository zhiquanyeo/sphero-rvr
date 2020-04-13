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


export class SpheroRVR {
    private readonly _transport: TransportBase;
    private readonly _parser: MessageParser;
    private readonly _commandPendingResponseMap: Map<string, DeferredPromise<IResponseMessage>>;
    private readonly _robotLink: RobotLink;

    constructor(transport: TransportBase) {

        this._transport = transport;
        this._robotLink = new RobotLink(transport);

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

    // === END API ===

}

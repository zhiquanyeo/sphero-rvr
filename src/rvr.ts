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


export class SpheroRVR {
    private readonly _transport: TransportBase;
    private readonly _parser: MessageParser;
    private readonly _commandPendingResponseMap: Map<string, DeferredPromise<IResponseMessage>>;

    constructor(transport: TransportBase) {

        this._transport = transport;
        this._parser = MessageParserFactory.getMessageParser();

        // Hook up the parser events
        this._parser.on("messageParsed", this.onMessageParsed.bind(this));

        this._transport.on("data", (chunk) => {
            this._parser.processIncomingBytes(chunk);
        });

        this._transport.on("error", (err) => {
            console.log("Error from transport: ", err);
        })

        this._commandPendingResponseMap = new Map<string, DeferredPromise<IResponseMessage>>();
    }

    // === API ===
    // API and Shell (Device 0x10)
    public echo(message: number[]): Promise<number[] | Error> {
        const cmdMessage = makeEchoRequest(message, TargetsAndSources.robotStTarget);

        return this.sendCommandMessageInternal(cmdMessage)
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

        return this.sendCommandMessageInternal(message)
        .catch(err => {
            console.log("Received error from WAKE: ", err);
            return err;
        });
    }

    public sleep(): Promise<void | Error> {
        const message = makeSleepRequest();

        return this.sendCommandMessageInternal(message)
        .catch(err => {
            console.log("Received error from SLEEP: ", err);
            return err;
        })
    }

    public getBatteryPercentage(): Promise<number | Error> {
        const message = makeGetBatteryPercentageRequest();

        return this.sendCommandMessageInternal(message)
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

        return this.sendCommandMessageInternal(message)
        .catch(err => {
            return err;
        });
    }

    public resetYaw(): Promise<void | Error> {
        const message = makeResetYawRequest();

        return this.sendCommandMessageInternal(message)
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

        return this.sendCommandMessageInternal(message)
        .catch(err => {
            return err;
        });
    }

    // IO (Device 0x1A)
    public setAllLeds(red: number, green: number, blue: number): Promise<void | Error> {
        const message = makeSetAllLedsRequest(red, green, blue);

        return this.sendCommandMessageInternal(message)
        .catch(err => {
            return err;
        });
    }

    public setSingleLed(index: LED, red: number, green: number, blue: number): Promise<void | Error> {
        const message = makeSetSingleRgbLedRequest(index, red, green, blue);
        return this.sendCommandMessageInternal(message)
        .catch(err => {
            return err;
        });
    }

    // === END API ===

    private onMessageParsed(message: IMessage): void {
        // Check if the message is a command from the robot (e.g. an async)
        if (message.isCommand && !message.isResponse) {
            let parsedData: object | null;
            if (message.dataRawBytes.length > 0) {
                // TODO implement handler
            }
            else {
                parsedData = null;
            }

            return;
        }

        // Handle response messages
        const mapKey: string = this.getMessageMapKey(message);
        if (!this._commandPendingResponseMap.has(mapKey)) {
            // TODO: error?
        }

        const responsePromise: DeferredPromise<IResponseMessage> | undefined =
            this._commandPendingResponseMap.get(mapKey);
        if (responsePromise) {
            if (message.hasError) {
                const errorMsg = `Response has error code ${message.errorCode} (${message.errorMessage})`;
                responsePromise.reject(errorMsg);
            }
            else {
                responsePromise.resolve(message);
            }

            this._commandPendingResponseMap.delete(mapKey);
            return;
        }
    }

    private getMessageMapKey(message: IMessage): string {
        const mapKey: string = `${message.sequence}.${message.deviceId}.${message.commandId}`;
        return mapKey;
    }

    private async sendCommandMessageInternal(message: ICommandMessage): Promise<IResponseMessage> {
        const responsePromise: DeferredPromise<IResponseMessage> = new DeferredPromise<IResponseMessage>();

        if (message.isRequestingResponse) {
            const mapKey: string = this.getMessageMapKey(message);
            this._commandPendingResponseMap.set(mapKey, responsePromise);
        }
        else {
            responsePromise.resolve();
        }

        this._transport.write(message.messageRawBytes, (err: Error, bytesWritten: number) => {
            if (err) {
                console.log("Error sending: ", err);
            }
        });

        return responsePromise.promise;
    }
}

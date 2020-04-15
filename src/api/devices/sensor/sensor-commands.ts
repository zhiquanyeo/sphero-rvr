import { ByteUtils } from "../../../utils/byte-utils";
import { ICommandMessage, makeCommandMessageWithDefaultFlags } from "../../messages";
import { makeCommandMessageWithNoResponseDefaultFlags } from "../../messages";
import { TargetsAndSources } from "../../constants";

const deviceId: number = 0x18;
const deviceName: string = "Sensor (0x18)";

export function makeEnableGyroMaxRequest(enable: boolean): ICommandMessage {
    const commandId: number = 0x0F;

    let dataRawBytes: number[] = [];

    const isEnabled: boolean = enable;
    const isEnabledBytes: number[] = ByteUtils.boolToByteArray(isEnabled);
    dataRawBytes = dataRawBytes.concat(isEnabledBytes);

    const targetId = TargetsAndSources.robotStTarget;
    const sourceId = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "EnableGyroMax",
        dataRawBytes
    );

    message.serialize();
    return message;
}

export function makeResetLocatorXYRequest(): ICommandMessage {
    const commandId: number = 0x13;

    const targetId = TargetsAndSources.robotStTarget;
    const sourceId = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "ResetLocatorXY",
        null
    );

    message.serialize();
    return message;
}

export function makeSetLocatorFlagsRequest(flags: number): ICommandMessage {
    const commandId: number = 0x17;

    const targetId = TargetsAndSources.robotStTarget;
    const sourceId = TargetsAndSources.serviceSource;

    let dataRawBytes: number[] = [];
    const flagsBytes: number[] = ByteUtils.int8ToByteArray(flags);
    dataRawBytes = dataRawBytes.concat(flagsBytes);

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "SetLocatorFlags",
        dataRawBytes
    );

    message.serialize();
    return message;
}

export function makeGetRgbcSensorValuesRequest(): ICommandMessage {
    const commandId: number = 0x23;

    const targetId = TargetsAndSources.robotNordicTarget;
    const sourceId = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "GetRgbcSensorValues",
        null
    );

    message.serialize();
    return message;
}

export interface IGetRgbcSensorValuesResponse {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly clear: number;
}

export function parseGetRgbcSensorValuesResponse(dataRawBytes: number[]): IGetRgbcSensorValuesResponse {
    let currIdx = 0;

    const redValueBytes: number[] = ByteUtils.getInt16Bytes(dataRawBytes, currIdx);
    const redValue: number = ByteUtils.byteArrayToInt16(redValueBytes.reverse());
    currIdx += redValueBytes.length;

    const greenValueBytes: number[] = ByteUtils.getInt16Bytes(dataRawBytes, currIdx);
    const greenValue: number = ByteUtils.byteArrayToInt16(greenValueBytes.reverse());
    currIdx += greenValueBytes.length;

    const blueValueBytes: number[] = ByteUtils.getInt16Bytes(dataRawBytes, currIdx);
    const blueValue: number = ByteUtils.byteArrayToInt16(blueValueBytes.reverse());
    currIdx += blueValueBytes.length;

    const clearValueBytes: number[] = ByteUtils.getInt16Bytes(dataRawBytes, currIdx);
    const clearValue: number = ByteUtils.byteArrayToInt16(clearValueBytes.reverse());
    currIdx += clearValueBytes.length;

    const result: IGetRgbcSensorValuesResponse = {
        red: redValue,
        green: greenValue,
        blue: blueValue,
        clear: clearValue
    };

    return result;
}

export function makeGetAmbientLightSensorValueRequest(): ICommandMessage {
    const commandId = 0x30;

    const targetId = TargetsAndSources.robotNordicTarget;
    const sourceId = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "GetAmbientLightSensorValue",
        null
    );

    message.serialize();
    return message;
}

export interface IGetAmbientLightSensorValueResponse {
    readonly ambientLightValue: number;
}

export function parseGetAmbientLightSensorValueResponse(dataRawBytes: number[]): IGetAmbientLightSensorValueResponse {
    let currIdx: number = 0;

    const lightValueBytes: number[] = ByteUtils.getFloatBytes(dataRawBytes, currIdx);
    const lightValue: number = ByteUtils.byteArrayToFloat(lightValueBytes.reverse());
    currIdx += lightValueBytes.length;

    const result: IGetAmbientLightSensorValueResponse = {
        ambientLightValue: lightValue
    };

    return result;
}

export function makeEnableColorDetectionNotifyRequest(
                enabled: boolean,
                interval: number,
                minConfidenceThreshold: number): ICommandMessage {
    const commandId = 0x35;
    const targetId = TargetsAndSources.robotNordicTarget;
    const sourceId = TargetsAndSources.serviceSource;

    let dataRawBytes: number[] = [];

    const isEnabledBytes: number[] = ByteUtils.boolToByteArray(enabled);
    dataRawBytes = dataRawBytes.concat(isEnabledBytes);

    const intervalBytes: number[] = ByteUtils.int16ToByteArray(interval).reverse();
    dataRawBytes = dataRawBytes.concat(intervalBytes);

    const minConfidenceBytes: number[] = ByteUtils.int8ToByteArray(minConfidenceThreshold);
    dataRawBytes = dataRawBytes.concat(minConfidenceBytes);

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "EnableColorDetectionNotify",
        dataRawBytes
    );

    message.serialize();
    return message;
}

export function makeGetCurrentDetectedColorReadingRequest(): ICommandMessage {
    const commandId = 0x37;
    const targetId = TargetsAndSources.robotNordicTarget;
    const sourceId = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "GetCurrentDetectedColorReading",
        null
    );

    message.serialize();
    return message;
}

export function makeEnableColorDetectionRequest(enable: boolean): ICommandMessage {
    const commandId: number = 0x38;

    let dataRawBytes: number[] = [];

    const isEnabled: boolean = enable;
    const isEnabledBytes: number[] = ByteUtils.boolToByteArray(isEnabled);
    dataRawBytes = dataRawBytes.concat(isEnabledBytes);

    const targetId = TargetsAndSources.robotNordicTarget;
    const sourceId = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "EnableColorDetection",
        dataRawBytes
    );

    message.serialize();
    return message;
}

export function makeConfigureStreamingServiceRequest(
                targetId: number,
                token: number,
                config: number[]): ICommandMessage {
    const commandId = 0x39;
    const sourceId = TargetsAndSources.serviceSource;

    let dataRawBytes: number[] = [];

    const tokenBytes: number[] = ByteUtils.int8ToByteArray(token);
    dataRawBytes = dataRawBytes.concat(tokenBytes);

    for (let i = 0; i < config.length && i < 15; i++) {
        const configItem: number = config[i];
        const configBytes: number[] = ByteUtils.int8ToByteArray(configItem);
        dataRawBytes = dataRawBytes.concat(configBytes);
    }

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "ConfigureStreamingService",
        dataRawBytes
    );

    message.serialize();
    return message;
}

export function makeStartStreamingServiceRequest(targetId: number, period: number): ICommandMessage {
    const commandId: number = 0x3A;
    const sourceId: number = TargetsAndSources.serviceSource;

    let dataRawBytes: number[] = [];
    const periodBytes: number[] = ByteUtils.int16ToByteArray(period).reverse();
    dataRawBytes = dataRawBytes.concat(periodBytes);

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "StartStreamingService",
        dataRawBytes
    );

    message.serialize();
    return message;
}

export function makeStopStreamingServiceRequest(targetId: number): ICommandMessage {
    const commandId: number = 0x3B;
    const sourceId: number = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "StopStreamingService",
        null
    );

    message.serialize();
    return message;
}

export function makeClearStreamingServiceRequest(targetId: number): ICommandMessage {
    const commandId: number = 0x3C;
    const sourceId: number = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "ClearStreamingService",
        null
    );

    message.serialize();
    return message;
}

export interface IColorDetectionNotifyResponse {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly confidence: number;
    readonly colorClassificationId: number;
}

export function parseColorDetectionNotifyResponse(dataRawBytes: number[]): IColorDetectionNotifyResponse {
    let currIdx = 0;

    const redBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, currIdx);
    const red: number = ByteUtils.byteArrayToInt8(redBytes);
    currIdx += redBytes.length;

    const greenBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, currIdx);
    const green: number = ByteUtils.byteArrayToInt8(greenBytes);
    currIdx += greenBytes.length;

    const blueBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, currIdx);
    const blue: number = ByteUtils.byteArrayToInt8(blueBytes);
    currIdx += blueBytes.length;

    const confidenceBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, currIdx);
    const confidence: number = ByteUtils.byteArrayToInt8(confidenceBytes);
    currIdx += confidenceBytes.length;

    const classificationBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, currIdx);
    const colorClassificationId: number = ByteUtils.byteArrayToInt8(classificationBytes);
    currIdx += classificationBytes.length;

    const result: IColorDetectionNotifyResponse = {
        red,
        green,
        blue,
        confidence,
        colorClassificationId
    };

    return result;
}

export function parseStreamingServiceDataNotifyResponse(
                dataRawBytes: number[]): ISensorStreamServiceDataNotifyResponse {
    let currIdx: number = 0;

    const tokenBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, currIdx);
    const token: number = ByteUtils.byteArrayToInt8(tokenBytes);
    currIdx += tokenBytes.length;

    const sensorDataValues: number[] = [];
    for (let i = 0; i < 9999; i++) {
        if (currIdx >= dataRawBytes.length) {
            break;
        }

        const sensorDataBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, currIdx);
        const sensorData: number = ByteUtils.byteArrayToInt8(sensorDataBytes);
        currIdx += sensorDataBytes.length;
        sensorDataValues.push(sensorData);
    }

    const resp: ISensorStreamServiceDataNotifyResponse = {
        token,
        sensorData: sensorDataValues
    };

    return resp;
}

export interface IGyroMaxNotifyResponse {
    flags: number;
}

export function parseGyroMaxNotifyResponse(dataRawBytes: number[]): IGyroMaxNotifyResponse {
    let currIdx: number = 0;

    const flagBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, currIdx);
    const flags: number = ByteUtils.byteArrayToInt8(flagBytes);
    currIdx += flagBytes.length;

    const response: IGyroMaxNotifyResponse = {
        flags
    };

    return response;
}

export interface ISensorStreamServiceDataNotifyResponse {
    readonly token: number;
    readonly sensorData: number[];
}

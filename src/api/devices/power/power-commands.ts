import { ICommandMessage, makeCommandMessageWithDefaultFlags, makeCommandMessageWithNoResponseDefaultFlags } from "../../messages";
import { TargetsAndSources } from "../../constants";
import { ByteUtils } from "../../../utils/byte-utils";

const deviceId = 0x13;
const deviceName = "Power (0x13)";

export interface IGetBatteryPercentageResponse {
    readonly percentage: number;
}

export function makeSleepRequest(): ICommandMessage {
    const commandId: number = 0x01;
    const targetId: number = TargetsAndSources.robotNordicTarget;
    const sourceId: number = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "Sleep",
        null
    );

    message.serialize();
    return message;
}

export function makeWakeRequest(): ICommandMessage {
    const commandId: number = 0x0D;
    const targetId: number = TargetsAndSources.robotNordicTarget;
    const sourceId: number = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "Wake",
        null
    );

    message.serialize();
    return message;
}

/**
 * Command: GetBatteryPercentage (0x10)
 */
export function makeGetBatteryPercentageRequest(): ICommandMessage {
    const commandId: number = 0x10;
    const targetId: number = TargetsAndSources.robotNordicTarget;
    const sourceId: number = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "GetBatteryPercentage",
        null
    );

    message.serialize();
    return message;
}

export function parseGetBatteryPercentageResponse(dataRawBytes: number[]): IGetBatteryPercentageResponse {
    let currentIdx: number = 0;
    const percentageBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, currentIdx);
    const percentage: number = ByteUtils.byteArrayToInt8(percentageBytes);
    currentIdx += percentageBytes.length;

    const response: IGetBatteryPercentageResponse = {
        percentage
    };

    return response;
}

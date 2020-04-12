import { RawMotorModes, TargetsAndSources } from "../../constants";
import { ICommandMessage, makeCommandMessageWithNoResponseDefaultFlags } from "../../messages";
import { ByteUtils } from "../../../utils/byte-utils";

const deviceId = 0x16;
const deviceName = "Drive (0x16)";

export function makeRawMotorsRequest(leftMode: RawMotorModes,
                                     leftSpeed: number,
                                     rightMode: RawMotorModes,
                                     rightSpeed: number): ICommandMessage {

    const commandId: number = 0x01;

    const dataRawBytes: number[] = [leftMode, leftSpeed, rightMode, rightSpeed];

    const targetId = TargetsAndSources.robotStTarget;
    const sourceId = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "RawMotors",
        dataRawBytes
    );

    message.serialize();
    return message;
}

export function makeResetYawRequest(): ICommandMessage {
    const commandId: number = 0x06;
    const targetId: number = TargetsAndSources.robotStTarget;
    const sourceId: number = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "ResetYaw",
        null
    );

    message.serialize();
    return message;
}

export function makeDriveWithHeadingRequest(speed: number, heading: number): ICommandMessage {
    const commandId: number = 0x07;
    const targetId: number = TargetsAndSources.robotStTarget;
    const sourceId: number = TargetsAndSources.serviceSource;

    let flags: number = 0x00;
    if (speed < 0) {
        flags = 0x01;
    }
    speed = Math.abs(speed);

    let dataRawBytes: number[] = [];

    const speedBytes: number[] = ByteUtils.int8ToByteArray(speed);
    dataRawBytes = dataRawBytes.concat(speedBytes);

    const headingBytes: number[] = ByteUtils.int16ToByteArray(heading).reverse();
    dataRawBytes = dataRawBytes.concat(headingBytes);

    const flagBytes: number[] = ByteUtils.int8ToByteArray(flags);
    dataRawBytes = dataRawBytes.concat(flagBytes);

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "DriveWithHeading",
        dataRawBytes
    );

    message.serialize();
    return message;
}

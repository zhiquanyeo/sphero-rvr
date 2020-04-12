import { ICommandMessage, makeCommandMessageWithNoResponseDefaultFlags } from "../../messages";
import { TargetsAndSources, LED } from "../../constants";
import { ByteUtils } from "../../../utils/byte-utils";

const deviceId = 0x1A;
const deviceName = "IO (0x1A)";

export function makeSetAllLedsRequest(red: number, green: number, blue: number): ICommandMessage {
    const commandId: number = 0x1A;

    const ledBitmask: number[] = [0x3F, 0xFF, 0xFF, 0xFF];
    const dataRawBytes: number[] = ledBitmask;

    for (let i = 0; i < 30; i += 3) {
        dataRawBytes.push(red);
        dataRawBytes.push(green);
        dataRawBytes.push(blue);
    }

    const targetId = TargetsAndSources.robotNordicTarget;
    const sourceId = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "SetLEDs",
        dataRawBytes
    );

    message.serialize();
    return message;
}

export function makeSetSingleRgbLedRequest(index: LED, red: number, green: number, blue: number): ICommandMessage {
    const commandId = 0x1A;

    const ledBitValue: number = (0x07 << index);
    const ledBitmask: number[] = ByteUtils.int32ToByteArray(ledBitValue);
    const ledData: number[] = [red, green, blue];

    const dataRawBytes: number[] = ledBitmask;
    ledData.forEach((d) => {
        dataRawBytes.push(d);
    });

    const targetId = TargetsAndSources.robotNordicTarget;
    const sourceId = TargetsAndSources.serviceSource;

    const message = makeCommandMessageWithNoResponseDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "SetLEDs",
        dataRawBytes
    );

    message.serialize();
    return message;
}

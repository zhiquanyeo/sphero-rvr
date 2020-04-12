import { ByteUtils } from "../../../utils/byte-utils";
import { TargetsAndSources } from "../../constants";
import { ICommandMessage, makeCommandMessageWithDefaultFlags } from "../../messages";

const deviceId = 0x10;
const deviceName = "ApiAndShell (0x10)";

export function makeEchoRequest(message: number[], target: number): ICommandMessage {
    const commandId: number = 0x00;

    let dataRawBytes: number[] = [];
    for (let i = 0; i < message.length && i < 16; i++) {
        const data: number = message[i];
        const dataBytes: number[] = ByteUtils.int8ToByteArray(data);
        dataRawBytes = dataRawBytes.concat(dataBytes);
    }

    const targetId = target;
    const sourceId = TargetsAndSources.serviceSource;

    const cmdMessage: ICommandMessage = makeCommandMessageWithDefaultFlags(
        targetId, sourceId,
        deviceId, deviceName,
        commandId, "Echo",
        dataRawBytes
    );

    cmdMessage.serialize();

    return cmdMessage;
}

export function parseEchoResponse(dataRawBytes: number[]): IEchoResponse {
    let currentIdx = 0;

    const dataValues: number[] = [];
    for (let i = 0; i < 16; i++) {
        if (currentIdx >= dataRawBytes.length) {
            break;
        }

        const dataBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, currentIdx);
        const data: number = ByteUtils.byteArrayToInt8(dataBytes);
        currentIdx += dataBytes.length;
        dataValues.push(data);
    }

    const echoResponse: IEchoResponse = {
        data: dataValues
    };

    return echoResponse;
}

export interface IEchoResponse {
    readonly data: number[];
}

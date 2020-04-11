import { MessageFlags, MessageParserFlags } from "./constants";
import { BaseMessage, makeCommandMessage, makeResponseMessage } from "./messages";


describe("Command Message", () => {
    test("Generates byte buffer correctly", () => {
        const flags = MessageFlags.defaultRequestWithNoResponseFlags;
        const sequence = 3;
        const targetId = 1;
        const sourceId = 2;
        const deviceId = 0;
        const deviceName = "test-device";
        const commandId = 6;
        const commandName = "test-command";

        const dataBytes: Array<number> = [0x01, 0x02, 0x03, 0x04];

        const message: BaseMessage = makeCommandMessage(flags, sequence,
                                                        targetId, sourceId,
                                                        deviceId, deviceName,
                                                        commandId, commandName,
                                                        dataBytes);

        let expected: Array<number> =
            [MessageParserFlags.startOfPacket,
             flags,
             targetId,
             sourceId,
             deviceId,
             commandId,
             sequence
            ];

        expected = expected.concat(dataBytes);
        expected.push(177); // precalcualted CRC
        expected.push(MessageParserFlags.endOfPacket);

        expect(message.messageRawBytes).toEqual(expected);
    });

    test("Generates byte buffer with escaped bytes correctly", () => {
        const flags = MessageFlags.defaultRequestWithNoResponseFlags;
        const sequence = 3;
        const targetId = 1;
        const sourceId = 2;
        const deviceId = 0;
        const deviceName = "test-device";
        const commandId = 6;
        const commandName = "test-command";

        const dataBytes: Array<number> = [MessageParserFlags.startOfPacket, 0x02, 0x03, 0x04];

        const message: BaseMessage = makeCommandMessage(flags, sequence,
                                                        targetId, sourceId,
                                                        deviceId, deviceName,
                                                        commandId, commandName,
                                                        dataBytes);

        let expected: Array<number> =
            [MessageParserFlags.startOfPacket,
             flags,
             targetId,
             sourceId,
             deviceId,
             commandId,
             sequence,
             MessageParserFlags.escape,
             MessageParserFlags.escapedStartOfPacket,
             0x02, 0x03, 0x04
            ];

        expected.push(37); // precalcualted CRC
        expected.push(MessageParserFlags.endOfPacket);

        expect(message.messageRawBytes).toEqual(expected);
    });
});

describe("Response Message", () => {
    test("Generates byte buffer correctly", () => {
        const flags = MessageFlags.defaultResponseFlags;
        const sequence = 3;
        const targetId = 1;
        const sourceId = 2;
        const deviceId = 0;
        const deviceName = "test-device";
        const commandId = 6;
        const commandName = "test-command";
        const errorCode = 0;

        const dataBytes: Array<number> = [0x01, 0x02, 0x03, 0x04];

        const message: BaseMessage = makeResponseMessage(flags, sequence,
                                                        targetId, sourceId,
                                                        deviceId, deviceName,
                                                        commandId, commandName,
                                                        errorCode,
                                                        dataBytes);

        let expected: Array<number> =
            [MessageParserFlags.startOfPacket,
             flags,
             targetId,
             sourceId,
             deviceId,
             commandId,
             sequence,
             errorCode
            ];

        expected = expected.concat(dataBytes);
        expected.push(184); // precalcualted CRC
        expected.push(MessageParserFlags.endOfPacket);

        expect(message.messageRawBytes).toEqual(expected);
    });

    test("Generates byte buffer with escaped bytes correctly", () => {
        const flags = MessageFlags.defaultResponseFlags;
        const sequence = 3;
        const targetId = 1;
        const sourceId = 2;
        const deviceId = 0;
        const deviceName = "test-device";
        const commandId = 6;
        const commandName = "test-command";
        const errorCode = 0;

        const dataBytes: Array<number> = [MessageParserFlags.startOfPacket, 0x02, 0x03, 0x04];

        const message: BaseMessage = makeResponseMessage(flags, sequence,
                                                        targetId, sourceId,
                                                        deviceId, deviceName,
                                                        commandId, commandName,
                                                        errorCode,
                                                        dataBytes);

        let expected: Array<number> =
            [MessageParserFlags.startOfPacket,
             flags,
             targetId,
             sourceId,
             deviceId,
             commandId,
             sequence,
             errorCode,
             MessageParserFlags.escape,
             MessageParserFlags.escapedStartOfPacket,
             0x02, 0x03, 0x04
            ];

        expected.push(44); // precalcualted CRC
        expected.push(MessageParserFlags.endOfPacket);

        expect(message.messageRawBytes).toEqual(expected);
    });
});

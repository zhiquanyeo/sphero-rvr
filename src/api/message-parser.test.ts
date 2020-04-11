import { MessageFlags, MessageParserFlags, ProtocolErrorCodes } from "./constants";
import { BaseMessage, makeCommandMessage } from "./messages";
import { MessageParserFactory } from "./message-parser";

describe("Message Parser", () => {
    beforeEach(() => {
        MessageParserFactory.getMessageParser().removeAllListeners();
        MessageParserFactory.getMessageParser().setMessageParsedCallback(undefined);
        MessageParserFactory.getMessageParser().setProtocolErrorCallback(undefined);
    })
    test("Parses a byte buffer correctly (callback)", done => {
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

        MessageParserFactory
            .getMessageParser()
            .setMessageParsedCallback((message) => {
                expect(message.flags).toBe(flags);
                expect(message.sequence).toBe(sequence);
                expect(message.targetId).toBe(targetId);
                expect(message.sourceId).toBe(sourceId);
                expect(message.deviceId).toBe(deviceId);
                expect(message.commandId).toBe(commandId);
                expect(message.dataRawBytes).toEqual(dataBytes);
                done();
            });

        MessageParserFactory
            .getMessageParser()
            .processIncomingBytes(message.messageRawBytes);
    });

    test("Parses a byte buffer correctly (event)", done => {
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

        MessageParserFactory
            .getMessageParser()
            .once("messageParsed", (message) => {
                expect(message.flags).toBe(flags);
                expect(message.sequence).toBe(sequence);
                expect(message.targetId).toBe(targetId);
                expect(message.sourceId).toBe(sourceId);
                expect(message.deviceId).toBe(deviceId);
                expect(message.commandId).toBe(commandId);
                expect(message.dataRawBytes).toEqual(dataBytes);
                done();
            });

        MessageParserFactory
            .getMessageParser()
            .processIncomingBytes(message.messageRawBytes);
    });

    test("Invalid packet (multiple start packets)", done => {
        const buffer: Array<number> = [MessageParserFlags.startOfPacket, 0x01, MessageParserFlags.startOfPacket];

        MessageParserFactory
            .getMessageParser()
            .once("protocolError", (errCode) => {
                expect(errCode).toBe(ProtocolErrorCodes.earlyStartOfPacket);
                done();
            });

        MessageParserFactory
            .getMessageParser()
            .processIncomingBytes(buffer);
    });

    test("Skipped data", done => {
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

        let buffer: Array<number> = [0x01, 0x02, 0x03];
        buffer = buffer.concat(message.messageRawBytes);

        let errorOccured: boolean = false;

        MessageParserFactory
            .getMessageParser()
            .once("protocolError", (errCode) => {
                expect(errCode).toBe(ProtocolErrorCodes.skippedData);
                errorOccured = true;
            });

        MessageParserFactory
            .getMessageParser()
            .once("messageParsed", (message) => {
                if (errorOccured) {
                    done();
                }
                else {
                    done(new Error("Expected a protocol error to have occured"));
                }
            });

        MessageParserFactory
            .getMessageParser().processIncomingBytes(buffer);
    });
})

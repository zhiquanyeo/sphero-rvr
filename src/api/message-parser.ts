import { IMessage, makeResponseMessage, makeCommandMessage } from "./messages";
import { EventEmitter } from "events";
import StrictEventEmitter from "strict-event-emitter-types";
import { MessageParserFlags, MessageFlags, ProtocolErrorCodes } from "./constants";
import { ByteUtils } from "../utils/byte-utils";

interface MessageParserEvents {
    messageParsed: (message: IMessage) => void,
    protocolError: (errCode: number) => void
}

type MessageParserEventEmitter = StrictEventEmitter<EventEmitter, MessageParserEvents>;

export type MessageParsedCallback = (message: IMessage) => void;
export type ProtocolErrorCallback = (errCode: number) => void;

enum ParserState {
    WAITING_FOR_PACKET_START = 0,
    WAITING_FOR_PACKET_END = 1
};

export class MessageParser extends (EventEmitter as new() => MessageParserEventEmitter) {
    private _state: ParserState = ParserState.WAITING_FOR_PACKET_START;
    private _activeBuffer: number[] = [];

    private _messageParsedCallback: MessageParsedCallback;
    private _protocolErrorCallback: ProtocolErrorCallback;

    private _runningChecksum: number = 0;
    private _isEscaped: boolean = false;
    private _hasSkippedData: boolean = false;

    private readonly _minPacketLength = 7;

    constructor() {
        super();
    }

    public setMessageParsedCallback(cb: MessageParsedCallback): void {
        this._messageParsedCallback = cb;
    }

    public setProtocolErrorCallback(cb: ProtocolErrorCallback): void {
        this._protocolErrorCallback = cb;
    }

    public processIncomingBytes(bytes: number[]): void {
        if (!bytes || bytes.length === 0) {
            return;
        }

        for (const i of bytes) {
            const byte: number = bytes[i];
            this.processByte(byte);
        }

    }

    public makeRawBufferForMessage(message: IMessage): number[] {
        return this.makeBufferForMessagePacket(
            message.flags,
            message.targetId,
            message.sourceId,
            message.deviceId,
            message.commandId,
            message.sequence,
            message.errorCode,
            message.dataRawBytes
        );
    }

    private processByte(byte: number): void {
        if (this._activeBuffer.length === 0 &&
            byte !== MessageParserFlags.startOfPacket) {

            this._hasSkippedData = true;
            // The current buffer is empty and we don't have a
            // start of packet byte, so we drop this byte
            return;
        }

        switch(byte) {
            case MessageParserFlags.startOfPacket:
                if (this._state !== ParserState.WAITING_FOR_PACKET_START) {
                   this.broadcastProtocolError(ProtocolErrorCodes.earlyStartOfPacket);
                    this.resetParser();
                    return;
                }

                if (this._hasSkippedData) {
                    this._hasSkippedData = false;
                    this.broadcastProtocolError(ProtocolErrorCodes.skippedData);
                }

                this._state = ParserState.WAITING_FOR_PACKET_END;
                this._runningChecksum = 0;
                this._activeBuffer.push(byte);

                return;

            case MessageParserFlags.endOfPacket:
                this._activeBuffer.push(byte);

                if (this._state !== ParserState.WAITING_FOR_PACKET_END) {
                    this.broadcastProtocolError(ProtocolErrorCodes.earlyEndOfPacket);
                    this.resetParser();
                    return;
                }

                if (this._runningChecksum !== 0xFF) {
                    this.broadcastProtocolError(ProtocolErrorCodes.badChecksum);
                    this.resetParser();
                    return;
                }

                const isRequestingResponse: boolean =
                        (this._activeBuffer[1] & MessageFlags.requestsResponse) === (MessageFlags.requestsResponse);
                const isResponse: boolean =
                        (this._activeBuffer[1] & MessageFlags.isResponse) === MessageFlags.isResponse;

                if (isRequestingResponse && isResponse) {
                    this.broadcastProtocolError(ProtocolErrorCodes.badFlags);
                    this.resetParser();
                    return;
                }

                const bufCopy: number[] = this._activeBuffer.slice();
                this.resetParser();

                const message: IMessage = this.makeMessageFromBuffer(bufCopy);
                this.broadcastMessageParsed(message);

                return;

            case MessageParserFlags.escape:
                if (this._isEscaped) {
                    this.broadcastProtocolError(ProtocolErrorCodes.badEscapeValue);
                    this.resetParser();
                    return;
                }

                this._isEscaped = true;
                return;

            case MessageParserFlags.escapedEscape:
            case MessageParserFlags.escapedStartOfPacket:
            case MessageParserFlags.escapedEndOfPacket:
                if (this._isEscaped) {
                    byte = this.slipDecode(byte);
                    this._isEscaped = false;
                }

                break;
        }

        if (this._isEscaped) {
            this.broadcastProtocolError(ProtocolErrorCodes.badEscapeValue);
            this.resetParser();
            return;
        }

        this._activeBuffer.push(byte);
        this._runningChecksum = ByteUtils.incrementByteValue(this._runningChecksum, byte);
    }

    private makeMessageFromBuffer(bytes: number[]): IMessage {
        let flags: number = 0x00;
        let sequence: number = 0x00;

        let targetId: number = 0xFF;
        let sourceId: number = 0xFF;

        let isResponse: boolean = false;

        let did: number = 0x00;
        let cid: number = 0x00;

        const dataRawBytes: number[] = [];

        let errorCode: number = 0;

        try {

            let index: number = 1; // Skip start marker

            flags = bytes[index++];

            if ((flags & MessageFlags.packetHasTargetId) > 0x00) {
                targetId = bytes[index++];
            }

            if ((flags & MessageFlags.packetHasSourceId) > 0x00) {
                sourceId = bytes[index++];
            }

            const endingBytesToIgnore: number = 2;

            // +3 to account for device id, command id and sequence
            if ((index + 3) > bytes.length - endingBytesToIgnore) {
                throw new Error("Invalid length");
            }

            did = bytes[index++];
            cid = bytes[index++];
            sequence = bytes[index++];

            if ((flags & MessageFlags.isResponse) > 0x00) {
                errorCode = bytes[index++];
            }

            for (let i = index; i < bytes.length - endingBytesToIgnore; i++) {
                const rawByte: number = bytes[i];
                dataRawBytes.push(rawByte);
            }

            isResponse = (bytes[1] & MessageFlags.isResponse) === MessageFlags.isResponse;

        }
        catch (e) {
            console.log(e);
        }

        const message: IMessage = isResponse
            ? makeResponseMessage(flags, sequence, targetId, sourceId, did, "", cid, "", errorCode, dataRawBytes)
            : makeCommandMessage(flags, sequence, targetId, sourceId, did, "", cid, "", dataRawBytes);

        return message;
    }

    // Generate a raw byte buffer given packet specifics
    private makeBufferForMessagePacket(flags: number, targetId: number,
                                       sourceId: number, deviceId: number,
                                       commandId: number, sequence: number,
                                       errorCode: number | null,
                                       dataRawBytes: number[]): number[] {

        let runningChecksum = 0;
        const rawBytes = [];
        rawBytes.push(MessageParserFlags.startOfPacket);

        this.encodeByteInBytes(rawBytes, flags);
        runningChecksum += flags;

        if ((flags & MessageFlags.packetHasTargetId) > 0x00) {
            this.encodeByteInBytes(rawBytes, targetId);
            runningChecksum += targetId;
        }

        if ((flags & MessageFlags.packetHasSourceId) > 0x00) {
            this.encodeByteInBytes(rawBytes, sourceId);
            runningChecksum += sourceId;
        }

        this.encodeByteInBytes(rawBytes, deviceId);
        runningChecksum += deviceId;

        this.encodeByteInBytes(rawBytes, commandId);
        runningChecksum += commandId;

        this.encodeByteInBytes(rawBytes, sequence);
        runningChecksum += sequence;

        if (errorCode != null) {
            this.encodeByteInBytes(rawBytes, errorCode);
            runningChecksum += errorCode;
        }

        if (!dataRawBytes) {
            dataRawBytes = [];
        }

        for (const i of dataRawBytes) {
            const dataByte = dataRawBytes[i];
            this.encodeByteInBytes(rawBytes, dataByte);
            runningChecksum += dataByte;
        }

        runningChecksum = ~(runningChecksum % 256);
        if (runningChecksum < 0) {
            runningChecksum = 256 + runningChecksum;
        }

        this.encodeByteInBytes(rawBytes, runningChecksum);

        rawBytes.push(MessageParserFlags.endOfPacket);

        return rawBytes;
    }

    private slipEncode(byte: number): number {
        return ((byte) & ~MessageParserFlags.slipEscapeMask);
    }

    private slipDecode(byte: number): number {
        return ((byte) | MessageParserFlags.slipEscapeMask);
    }

    private encodeByteInBytes(bytes: number[], byte: number): void {
        switch (byte) {
            case MessageParserFlags.startOfPacket:
                bytes.push(MessageParserFlags.escape);
                bytes.push(MessageParserFlags.escapedStartOfPacket);
                break;
            case MessageParserFlags.endOfPacket:
                bytes.push(MessageParserFlags.escape);
                bytes.push(MessageParserFlags.escapedEndOfPacket);
                break;
            case MessageParserFlags.escape:
                bytes.push(MessageParserFlags.escape);
                bytes.push(MessageParserFlags.escapedEscape);
                break;
            default:
                bytes.push(byte);
        }
    }

    private resetParser(): void {
        this._state = ParserState.WAITING_FOR_PACKET_START;
        this._isEscaped = false;
        this._activeBuffer.length = 0;
    }

    private broadcastMessageParsed(message: IMessage): void {
        if (this._messageParsedCallback) {
            this._messageParsedCallback(message);
        }

        this.emit("messageParsed", message);
    }

    private broadcastProtocolError(errorCode: number): void {
        if (this._protocolErrorCallback) {
            this._protocolErrorCallback(errorCode);
        }

        this.emit("protocolError", errorCode);
    }
}

export class MessageParserFactory {
    private static _parser: MessageParser | null = null;

    public static getMessageParser(): MessageParser {
        if (this._parser === null) {
            this._parser = new MessageParser();
        }

        return this._parser;
    }
}

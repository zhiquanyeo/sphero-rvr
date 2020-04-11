import { MessageFlags } from "./constants";
import { MessageParserFactory } from "./message-parser";

export interface IMessage {
    readonly flags: number;
    readonly sequence: number;

    readonly isCommand: boolean;
    readonly isResponse: boolean;
    readonly isRequestingResponse: boolean;

    readonly targetId: number;
    readonly sourceId: number;

    readonly deviceId: number;
    readonly deviceName: string;

    readonly commandId: number;
    readonly commandName: string;

    readonly dataRawBytes: Array<number>; // Payload
    readonly messageRawBytes: Array<number>; // Full message

    readonly data: object | null;

    readonly errorCode: number | null;
    readonly errorMessage: string | null;
    readonly hasError: boolean;

    serialize(): void;
}

export abstract class BaseMessage implements IMessage {
    protected _flags: number = 0x00;
    public get flags(): number {
        return this._flags;
    }

    protected _sequence: number = 0x00;
    public get sequence(): number {
        return this._sequence;
    }

    public get isCommand(): boolean {
        return !this.isResponse;
    }

    public get isResponse(): boolean {
        return (this.flags & MessageFlags.isResponse) == MessageFlags.isResponse;
    }

    public get isRequestingResponse(): boolean {
        return (this.flags & MessageFlags.requestsResponse) == MessageFlags.requestsResponse;
    }

    protected _targetId: number = 0x00;
    public get targetId(): number {
        return this._targetId;
    }

    protected _sourceId: number = 0x00;
    public get sourceId(): number {
        return this._sourceId;
    }

    protected _deviceId: number = 0x00;
    public get deviceId(): number {
        return this._deviceId;
    }

    protected _deviceName: string = "";
    public get deviceName(): string {
        return this._deviceName;
    }

    protected _commandId: number = 0x00;
    public get commandId(): number {
        return this._commandId;
    }

    protected _commandName: string = "";
    public get commandName(): string {
        return this._commandName;
    }

    protected _dataRawBytes: Array<number> = [];
    public get dataRawBytes(): Array<number> {
        return this._dataRawBytes;
    }

    protected _messageRawBytes: Array<number> = [];
    public get messageRawBytes(): Array<number> {
        return this._messageRawBytes;
    }

    protected _data: object | null = null;
    public get data(): object | null {
        return this._data;
    }

    protected _errorCode: number | null = null;
    public get errorCode(): number | null {
        return this._errorCode;
    }

    protected _errorMessage: string | null = null;
    public get errorMessage(): string | null {
        return this._errorMessage;
    }

    protected _hasError: boolean = false;
    public get hasError(): boolean {
        return this._hasError;
    }

    protected constructor(flags: number, sequence: number,
                          targetId: number, sourceId: number,
                          deviceId: number, deviceName: string,
                          commandId: number, commandName: string,
                          dataRawBytes: Array<number> | null = null) {

        this._flags = flags;
        this._sequence = sequence;

        this._targetId = targetId;
        this._sourceId = sourceId;

        this._deviceId = deviceId;
        this._deviceName = deviceName;

        this._commandId = commandId;
        this._commandName = commandName;

        if (dataRawBytes != null) {
            this._dataRawBytes = dataRawBytes;
        }
    }

    public serialize(): void {
        this._messageRawBytes =
            MessageParserFactory.getMessageParser().makeRawBufferForMessage(this);
    }
}

// === COMMAND MESSAGES ===
let _sequence: number = 0;
function getNextSequenceNumber(): number {
    return _sequence++ % 256;
}

class CommandMessage extends BaseMessage {
    constructor(flags: number, sequence: number,
                targetId: number, sourceId: number,
                deviceId: number, deviceName: string,
                commandId: number, commandName: string,
                dataRawBytes: Array<number> | null = null) {

        super(flags, sequence,
              targetId, sourceId,
              deviceId, deviceName,
              commandId, commandName,
              dataRawBytes);
    }
}

export function makeCommandMessage(flags: number, sequence: number | null,
                          targetId: number, sourceId: number,
                          deviceId: number, deviceName: string,
                          commandId: number, commandName: string,
                          dataRawBytes: Array<number> | null = null): CommandMessage {

    if (sequence == null) {
        sequence = 0x00;
    }

    const message: CommandMessage = new CommandMessage(
        flags, sequence,
        targetId, sourceId,
        deviceId, deviceName,
        commandId, commandName,
        dataRawBytes
    );

    message.serialize();
    return message;
}

export function makeCommandMessageWithDefaultFlags(targetId: number, sourceId: number,
                                                   deviceId: number, deviceName: string,
                                                   commandId: number, commandName: string,
                                                   dataRawBytes: Array<number> | null = null): CommandMessage {

    let flags: number = MessageFlags.defaultRequestWithResponseFlags;
    let sequence: number = getNextSequenceNumber();

    return makeCommandMessage(flags, sequence,
                              targetId, sourceId,
                              deviceId, deviceName,
                              commandId, commandName,
                              dataRawBytes);
}

export function makeCommandMessageWithNoResponseDefaultFlags(targetId: number, sourceId: number,
                                                             deviceId: number, deviceName: string,
                                                             commandId: number, commandName: string,
                                                             dataRawBytes: Array<number> | null = null): CommandMessage {

    let flags: number = MessageFlags.defaultRequestWithNoResponseFlags;
    let sequence: number = getNextSequenceNumber();

    return makeCommandMessage(flags, sequence,
        targetId, sourceId,
        deviceId, deviceName,
        commandId, commandName,
        dataRawBytes);
}

// === RESPONSE MESSAGES ===
class ResponseMessage extends BaseMessage {
    constructor(flags: number, sequence: number,
                targetId: number, sourceId: number,
                deviceId: number, deviceName: string,
                commandId: number, commandName: string,
                errorCode: number,
                dataRawBytes: Array<number> | null = null) {

        super(flags, sequence,
              targetId, sourceId,
              deviceId, deviceName,
              commandId, commandName,
              dataRawBytes);

        this._errorCode = errorCode;
        this._hasError = false; // TODO
        this._errorMessage = "";
    }
}

export function makeResponseMessage(flags: number, sequence: number | null,
                          targetId: number, sourceId: number,
                          deviceId: number, deviceName: string,
                          commandId: number, commandName: string,
                          errorCode: number,
                          dataRawBytes: Array<number> | null = null): ResponseMessage {

    if (sequence == null) {
        sequence = 0x00;
    }

    const message: ResponseMessage = new ResponseMessage(
        flags, sequence,
        targetId, sourceId,
        deviceId, deviceName,
        commandId, commandName,
        errorCode,
        dataRawBytes
    );

    message.serialize();
    return message;
}

export function makeResponseMessageWithDefaultFlags(targetId: number, sourceId: number,
                                                   deviceId: number, deviceName: string,
                                                   commandId: number, commandName: string,
                                                   errorCode: number,
                                                   dataRawBytes: Array<number> | null = null): ResponseMessage {

    let flags: number = MessageFlags.defaultRequestWithResponseFlags;
    let sequence: number = 0x00;

    return makeResponseMessage(flags, sequence,
                              targetId, sourceId,
                              deviceId, deviceName,
                              commandId, commandName,
                              errorCode,
                              dataRawBytes);
}

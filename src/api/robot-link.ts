import { TransportBase } from "../transport/serial-transport";
import { MessageParser, MessageParserFactory } from "./message-parser";
import { DeferredPromise } from "../utils/deferred-promise";
import { IResponseMessage, IMessage, ICommandMessage } from "./messages";
import { ICommandParserHandler, getCommandParserFactory } from "./command-parser-factory";
import { IMessageLite, MessageLite } from "./message-lite";

export type MessageNotificationObserver = (cmdMsg: IMessageLite) => void;

export class RobotLink {
    private readonly _transport: TransportBase;
    private readonly _parser: MessageParser;
    private readonly _commandPendingResponseMap: Map<string, DeferredPromise<IResponseMessage>>;

    private readonly _messageNotificationObservers: MessageNotificationObserver[] = [];

    constructor(transport: TransportBase) {
        this._transport = transport;
        this._parser = MessageParserFactory.getMessageParser();

        this._parser.on("messageParsed", this.onMessageParsed.bind(this));

        this._transport.on("data", (chunk) => {
            this._parser.processIncomingBytes(chunk);
        });

        this._transport.on("error", (err) => {
            console.log("Error from transport: ", err);
        });

        this._commandPendingResponseMap = new Map<string, DeferredPromise<IResponseMessage>>();
    }

    private onMessageParsed(message: IMessage): void {
        // Check if the message is a command from the robot (e.g. an async)
        if (message.isCommand && !message.isResponse) {
            let parsedData: object | null;
            if (message.dataRawBytes.length > 0) {
                const commandParserHandler: ICommandParserHandler | null =
                    this.getCommandParserHandler(message.sourceId, message.deviceId, message.commandId);
                if (!commandParserHandler) {
                    console.log(`Unable to retrieve command parser for given command (${message.sourceId}, ${message.deviceId}, ${message.commandId})`);
                    return;
                }

                parsedData = commandParserHandler(message.dataRawBytes);
            }
            else {
                parsedData = null;
            }

            const messageLite: IMessageLite = new MessageLite(
                message.deviceId,
                message.deviceName,
                message.commandId,
                message.commandName,
                message.sourceId,
                parsedData
            );

            this.broadcastReceivedCommandMessageCallback(messageLite);
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

    public async sendCommandMessage(message: ICommandMessage): Promise<IResponseMessage> {
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

    public registerMessageNotificationObserver(observer: MessageNotificationObserver): void {
        this._messageNotificationObservers.push(observer);
    }

    protected broadcastReceivedCommandMessageCallback(msg: IMessageLite): void {
        for (const observer of this._messageNotificationObservers) {
            observer(msg);
        }
    }

    public getCommandParserHandler(sourceId: number,
                                   deviceId: number,
                                   commandId: number): ICommandParserHandler | null {
        return getCommandParserFactory().getParser(sourceId, deviceId, commandId);
    }
}

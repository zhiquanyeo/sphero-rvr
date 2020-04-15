import { RobotLink } from "../robot-link";
import { ISensorStreamSlot, ISensorStreamSlotData } from "./sensor-stream-slot";
import { ICommandParserHandler, getCommandParserFactory } from "../command-parser-factory";
import { parseStreamingServiceDataNotifyResponse } from "../devices/sensor/sensor-commands";
import { ByteUtils } from "../../utils/byte-utils";
import { ICommandMessage, makeCommandMessageWithDefaultFlags } from "../messages";
import { TargetsAndSources } from "../constants";

const sensorDeviceId: number = 0x18;
const sensorDeviceName: string = "Sensor (0x18)";

export interface ISensorStreamProvider {
    readonly processorId: number;
    readonly hasEnabledStreamingServices: boolean;
    readonly isStreaming: boolean;

    startStreaming(streamingInterval: number): void;
    stopStreaming(): void;
}

export class SensorStreamProvider implements ISensorStreamProvider {
    private static readonly _configureCommandId: number = 0x39;
    private static readonly _configureCommandName: string = "Configure Streaming Services";

    private static readonly _startCommandId: number = 0x3A;
    private static readonly _startCommandName: string = "Start streaming services";

    private static readonly _stopCommandId: number = 0x3B;
    private static readonly _stopCommandName: string = "Stop streaming services";

    private static readonly _clearCommandId: number = 0x3C;
    private static readonly _clearCommandName: string = "Clear streaming services";

    private static readonly _sensorDataCommandId: number = 0x3D;
    private static readonly _sensorDataCommandName: string = "Streaming service data";

    private readonly _robotLink: RobotLink;

    private _streamingInterval: number = 0;

    private readonly _streamingSlots: ISensorStreamSlot[] = [];
    private readonly _streamingSlotByToken: Map<number, ISensorStreamSlot> =
                            new Map<number, ISensorStreamSlot>();

    private readonly _processorId: number = 0;
    public get processorId() {
        return this._processorId;
    }

    private readonly _streamingDataCommandParser: ICommandParserHandler =
                            this._buildStreamingServiceDataCommandParser();

    public get hasEnabledStreamingServices(): boolean {
        for (const slot of this._streamingSlots) {
            if (slot.hasEnabledStreamingServices) {
                return true;
            }
        }
        return false;
    }

    protected _isStreaming: boolean = false;
    public get isStreaming(): boolean {
        return this._isStreaming;
    }

    constructor(processorId: number, streamingSlots: ISensorStreamSlot[], robotLink: RobotLink) {
        this._processorId = processorId;
        this._streamingSlots = streamingSlots;

        for (const slot of this._streamingSlots) {
            this._streamingSlotByToken.set(slot.tokenId, slot);
        }

        this._robotLink = robotLink;
    }

    public startStreaming(streamingInterval: number): void {
        if (!this.hasEnabledStreamingServices) {
            throw new Error("Streaming provider has no sensors configured to be streamed");
        }

        if (this.isStreaming) {
            throw new Error("Streaming provider is already streaming. Stop current stream first");
        }

        this._streamingInterval = streamingInterval;
        this._configureStreamingForEnabledSlots();

        const commandParserFactory = getCommandParserFactory();
        commandParserFactory.addParser(this._processorId,
                                       sensorDeviceId,
                                       SensorStreamProvider._sensorDataCommandId,
                                       this._streamingDataCommandParser);

        this._sendStartStreamingCommandToProcessor();
        this._isStreaming = true;
    }

    public stopStreaming(): void {
        if (!this.isStreaming) {
            throw new Error("Cannot stop stream because provider is not currently streaming");
        }

        this._sendStopStreamingCommandToProcessor();

        const commandParserFactory = getCommandParserFactory();
        commandParserFactory.addParser(this._processorId,
                                       sensorDeviceId,
                                       SensorStreamProvider._sensorDataCommandId,
                                       parseStreamingServiceDataNotifyResponse);

        this._sendClearStreamingCommandToProcessor();
        this._disableStreamingForEnabledSlots();
        this._isStreaming = false;
    }

    private _sendStartStreamingCommandToProcessor(): void {
        let dataRawBytes: number[] = [];
        const periodBytes: number[] = ByteUtils.int16ToByteArray(this._streamingInterval).reverse();
        dataRawBytes = dataRawBytes.concat(periodBytes);

        const message: ICommandMessage = makeCommandMessageWithDefaultFlags(
            this._processorId, TargetsAndSources.serviceSource,
            sensorDeviceId, sensorDeviceName,
            SensorStreamProvider._startCommandId, SensorStreamProvider._startCommandName,
            dataRawBytes
        );

        message.serialize();

        this._robotLink.sendCommandMessage(message)
        .catch(err => {
            const errorDetail: string = `Error in startStreaming while sending API command: ${err}`;
            throw new Error(errorDetail);
        });
    }

    private _sendStopStreamingCommandToProcessor(): void {
        const message: ICommandMessage = makeCommandMessageWithDefaultFlags(
            this._processorId, TargetsAndSources.serviceSource,
            sensorDeviceId, sensorDeviceName,
            SensorStreamProvider._stopCommandId, SensorStreamProvider._stopCommandName,
            null
        );

        message.serialize();

        this._robotLink.sendCommandMessage(message)
        .catch(err => {
            const errorDetail: string = `Error in stopStreaming while sending API command: ${err}`;
            throw new Error(errorDetail);
        });
    }

    private _sendClearStreamingCommandToProcessor(): void {
        const message: ICommandMessage = makeCommandMessageWithDefaultFlags(
            this._processorId, TargetsAndSources.serviceSource,
            sensorDeviceId, sensorDeviceName,
            SensorStreamProvider._clearCommandId, SensorStreamProvider._clearCommandName,
            null
        );

        message.serialize();

        this._robotLink.sendCommandMessage(message)
        .catch(err => {
            const errorDetail: string = `Error in clearStreaming while sending API command: ${err}`;
            throw new Error(errorDetail);
        });
    }

    private _sendConfigureStreamingSlotCommandToProcessor(slot: ISensorStreamSlot): void {
        const dataRawBytes: number[] = slot.getConfigBytes();

        const message: ICommandMessage = makeCommandMessageWithDefaultFlags(
            this._processorId, TargetsAndSources.serviceSource,
            sensorDeviceId, sensorDeviceName,
            SensorStreamProvider._configureCommandId, SensorStreamProvider._configureCommandName,
            dataRawBytes
        );

        message.serialize();

        this._robotLink.sendCommandMessage(message)
        .catch(err => {
            const errorDetail: string = `Error in configureStreamingServices while sending API command: ${err}`;
            throw new Error(errorDetail);
        });
    }

    private _disableStreamingForEnabledSlots(): void {
        for (const slot of this._streamingSlots) {
            if (!slot.hasEnabledStreamingServices) {
                continue;
            }

            slot.disableStreamingServices();
        }
    }

    private _configureStreamingForEnabledSlots(): void {
        for (const slot of this._streamingSlots) {
            if (!slot.hasEnabledStreamingServices) {
                continue;
            }

            this._sendConfigureStreamingSlotCommandToProcessor(slot);
        }
    }

    private _buildStreamingServiceDataCommandParser(): ICommandParserHandler {
        return (dataRawBytes: number[]): ISensorStreamSlotData => {
            const tokenBytes: number[] = ByteUtils.getInt8Bytes(dataRawBytes, 0);

            const tokenData: number[] = ByteUtils.byteToNibbles(ByteUtils.byteArrayToInt8(tokenBytes));
            const tokenId: number = tokenData[0];
            const tokenFlags: number = tokenData[1];

            const slot: ISensorStreamSlot | undefined = this._streamingSlotByToken.get(tokenId);
            if (slot === undefined) {
                throw new Error(`Unable to parse streaming data with token ID ${tokenId}`);
            }

            const data = slot.parseSensorStreamSlotDataToObject(dataRawBytes.slice(1));

            return data;
        }
    }
}

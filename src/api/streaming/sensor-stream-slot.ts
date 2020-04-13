import { ISensorStreamServiceData, ISensorStreamService } from "./sensor-stream-service";
import { ByteUtils } from "../../utils/byte-utils";

export interface ISensorStreamSlot {
    readonly tokenId: number;
    readonly hasEnabledStreamingServices: boolean;

    disableStreamingServices(): void;
    getConfigBytes(): number[];
    parseSensorStreamSlotDataToObject(dataRawBytes: number[]): ISensorStreamSlotData;
}

export interface ISensorStreamSlotData {
    [streamingSvcName: string]: ISensorStreamServiceData;
}

export class SensorStreamSlot implements ISensorStreamSlot {
    protected _tokenId: number = 0;
    public get tokenId(): number {
        return this._tokenId;
    }

    private readonly _supportedStreamingServices: ISensorStreamService[] = [];

    public get hasEnabledStreamingServices(): boolean {
        for (const svc of this._supportedStreamingServices) {
            if (svc.isEnabled) {
                return true;
            }
        }

        return false;
    }

    constructor(token: number, supportedStreamingSvcs: ISensorStreamService[]) {
        this._tokenId = token;
        this._supportedStreamingServices = supportedStreamingSvcs;
    }

    public disableStreamingServices(): void {
        for (const svc of this._supportedStreamingServices) {
            svc.disable();
        }
    }

    public getConfigBytes(): number[] {
        if (!this.hasEnabledStreamingServices) {
            throw new Error("No enabled streaming services to configure");
        }

        let dataRawBytes: number[] = [];

        const tokenBytes = ByteUtils.int8ToByteArray(this._tokenId);
        dataRawBytes = dataRawBytes.concat(tokenBytes);

        for (const svc of this._enabledStreamingServices()) {
            dataRawBytes = dataRawBytes.concat(ByteUtils.int16ToByteArray(svc.id).reverse());
            dataRawBytes = dataRawBytes.concat(ByteUtils.int8ToByteArray(svc.dataSizeEnum));
        }

        return dataRawBytes;
    }

    public parseSensorStreamSlotDataToObject(sensorDataRawBytes: number[]): ISensorStreamSlotData {
        const slotData: ISensorStreamSlotData = {};

        let currIdx: number = 0;
        for (const svc of this._enabledStreamingServices()) {
            const svcDataBytes: number[] = ByteUtils.sliceBytes(sensorDataRawBytes,
                                                                currIdx,
                                                                svc.bytesPerSensorStreamServiceData);
            slotData[svc.name] = svc.parseSensorStreamServiceBytesToObject(svcDataBytes);
            currIdx += svcDataBytes.length;
        }

        return slotData;
    }

    private _enabledStreamingServices(): ISensorStreamService[] {
        const enabledSvcs: ISensorStreamService[] = [];
        for (const svc of this._supportedStreamingServices) {
            if (svc.isEnabled) {
                enabledSvcs.push(svc);
            }
        }
        return enabledSvcs;
    }
}

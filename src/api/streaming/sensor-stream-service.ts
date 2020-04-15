import { ISensorStreamServiceAttribute } from "./sensor-stream-service-attribute";
import { ByteUtils } from "../../utils/byte-utils";

export interface ISensorStreamService {
    readonly id: number;
    readonly name: string;
    readonly isEnabled: boolean;

    readonly dataSizeEnum: number;
    readonly bytesPerSensorStreamServiceData: number;

    parseSensorStreamServiceBytesToObject(dataRawytes: number[]): ISensorStreamServiceData;
    enable(): void;
    disable(): void;
}

export class SensorStreamService implements ISensorStreamService {
    private readonly _sensorStreamServiceAttributes: ISensorStreamServiceAttribute[];

    protected _id: number = 0;
    public get id(): number {
        return this._id;
    }

    protected _name: string = "";
    public get name(): string {
        return this._name;
    }

    private _isEnabled: boolean = false;
    public get isEnabled(): boolean {
        return this._isEnabled;
    }

    protected _dataSizeEnum: number = 0;
    public get dataSizeEnum(): number {
        return this._dataSizeEnum;
    }

    public get bytesPerSensorStreamServiceData(): number {
        return this._bytesPerSensorStreamServiceAttributeData * this._sensorStreamServiceAttributes.length;
    }

    constructor(id: number, name: string, sensorStreamAttrs: ISensorStreamServiceAttribute[], dataSizeEnum: number) {
        this._id = id;
        this._name = name;
        this._sensorStreamServiceAttributes = sensorStreamAttrs;
        this._dataSizeEnum = dataSizeEnum;
    }

    public enable(): void {
        this._isEnabled = true;
    }

    public disable(): void {
        this._isEnabled = false;
    }

    public parseSensorStreamServiceBytesToObject(dataRawBytes: number[]): ISensorStreamServiceData {
        if (dataRawBytes.length !== this.bytesPerSensorStreamServiceData) {
            throw new Error("Input and expected byte lengths mismatch");
        }

        const sensorStreamServiceData: ISensorStreamServiceData = {};

        let currIdx: number = 0;
        for (const sensorStreamServiceAttr of this._sensorStreamServiceAttributes) {
            const attrDataBytes: number[] =
                        ByteUtils.sliceBytes(dataRawBytes, currIdx, this._bytesPerSensorStreamServiceAttributeData);
            sensorStreamServiceData[sensorStreamServiceAttr.name] =
                    sensorStreamServiceAttr.parseAttributeBytesToFloatValues(attrDataBytes, 0,
                                                                            this._dataSizeMaximum);
            currIdx += attrDataBytes.length;
        }

        return sensorStreamServiceData;
    }

    private get _bytesPerSensorStreamServiceAttributeData(): number {
        const bitSize: number | undefined = SensorStreamService.dataSizeToBits.get(this._dataSizeEnum);
        if (bitSize === undefined) {
            return 0;
        }

        return bitSize / 8;
    }

    private get _dataSizeMaximum(): number {
        const maxValue: number | undefined = SensorStreamService.dataSizeToMaxValue.get(this._dataSizeEnum);
        if (maxValue === undefined) {
            return 0;
        }

        return maxValue;
    }

    private static readonly dataSizeToBits: Map<number, number> =
            new Map<number, number>([[0x00, 8], [0x01, 16], [0x02, 32]]);

    private static readonly dataSizeToMaxValue: Map<number, number> = new Map<number, number>(
        [
            [0x00, ByteUtils.uint8MaxValue],
            [0x01, ByteUtils.uint16MaxValue],
            [0x02, ByteUtils.uint32MaxValue]
        ]
    );
}

export interface ISensorStreamServiceData {
    [sensorStreamServiceAttrName: string]: number;
}

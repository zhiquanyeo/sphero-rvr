import { ByteUtils } from "../../utils/byte-utils";

/**
 * Represents a raw data point
 */
export interface ISensorStreamServiceAttribute {
    readonly name: string;
    readonly minValue: number;
    readonly maxValue: number;

    parseAttributeBytesToFloatValues(dataRawBytes: number[], previousMin: number, previousMax: number): number;
}

export class SensorStreamServiceAttribute implements ISensorStreamServiceAttribute {
    protected _name: string = "";
    public get name(): string {
        return this._name;
    }

    protected _minVal: number;
    public get minValue(): number {
        return this._minVal;
    }

    protected _maxVal: number;
    public get maxValue(): number {
        return this._maxVal;
    }

    constructor(name: string, minVal: number, maxVal: number) {
        this._name = name;
        this._minVal = minVal;
        this._maxVal = maxVal;
    }

    public parseAttributeBytesToFloatValues(dataRawBytes: number[], minIn: number, maxIn: number): number {
        const sensorStreamSvcAttrData: number = ByteUtils.byteArrayToNumber(dataRawBytes.reverse());
        return ByteUtils.normalize(sensorStreamSvcAttrData, minIn, maxIn, this._minVal, this._maxVal);
    }
}

export class ByteUtils {

    /**
     *
     * @param value Input value
     * @param min Input minimum
     * @param max Input maximum
     * @param newMin Output minimum
     * @param newMax Output maximum
     */
    public static normalize(value: number, min: number, max: number, newMin: number, newMax: number): number {
        return (((value - min) / (max - min)) * (newMax - newMin)) + newMin;
    }

    /**
     * Convert a number into an array of bytes
     * @param value Number to convert
     * @param size Number of bytes to use
     */
    public static numberToByteArray(value: number, size: number): number[] {
        const bytes: number[] = [];

        for (let i = 0; i < size; i++) {
            bytes.push(0);
        }

        if (value === undefined || value === null) {
            return bytes;
        }

        for (let i = 0; i < bytes.length; i++) {
            const byte: number = value & 0xFF;
            bytes[i] = byte;
            value = (value - byte) / 256;
        }

        return bytes;
    }

    public static boolToByteArray(value: boolean): number[] {
        const bytes: number[] = [0];

        if (value === undefined || value === null) {
            return bytes;
        }

        bytes[0] = !value ? 0 : 1;

        return bytes;
    }

    public static int8ToByteArray(value: number): number[] {
        return this.numberToByteArray(value, 1);
    }

    public static int16ToByteArray(value: number): number[] {
        return this.numberToByteArray(value, 2);
    }

    public static int32ToByteArray(value: number): number[] {
        return this.numberToByteArray(value, 4);
    }

    public static int64ToByteArray(value: number): number[] {
        return this.numberToByteArray(value, 8);
    }

    public static floatToByteArray(value: number): number[] {
        if (value === undefined || value === null) {
            return [];
        }

        const floatArray: Float32Array = new Float32Array(1);
        floatArray[0] = value;
        const uint8Array: Uint8Array = new Uint8Array(floatArray.buffer);

        const bytes: number[] = [];
        for (let i = 0; i < uint8Array.byteLength; i++) {
            bytes.push(uint8Array[i]);
        }

        return bytes;
    }

    public static doubleToByteArray(value: number): number[] {
        if (value === undefined || value === null) {
            return [];
        }

        const floatArray: Float64Array = new Float64Array(1);
        floatArray[0] = value;
        const uint8Array: Uint8Array = new Uint8Array(floatArray.buffer);

        const bytes: number[] = [];
        for (let i = 0; i < uint8Array.byteLength; i++) {
            bytes.push(uint8Array[i]);
        }

        return bytes;
    }

    public static stringToByteArray(value: string): number[] {
        const bytes: number[] = [];

        if (value === undefined || value === null || value.length === 0) {
            return bytes;
        }

        // Add null character
        if (value[value.length - 1] !== "\0") {
            value += "\0";
        }

        for (let i = 0; i < value.length; i++) {
            bytes.push(value.charCodeAt(i));
        }

        return bytes;
    }

    public static sliceBytes(bytes: number[], startingIdx: number, count: number): number[] {
        const slicedBytes: number[] = [];

        if (!bytes || bytes.length === 0) {
            return slicedBytes;
        }

        const endingIdx = startingIdx + count;
        if (endingIdx > bytes.length) {
            return slicedBytes;
        }

        return bytes.slice(startingIdx, endingIdx);
    }

    public static getBoolBytes(bytes: number[], currentIdx: number): number[] {
        return this.sliceBytes(bytes, currentIdx, 1);
    }

    public static getInt8Bytes(bytes: number[], currentIdx: number): number[] {
        return this.sliceBytes(bytes, currentIdx, 1);
    }

    public static getInt16Bytes(bytes: number[], currentIdx: number): number[] {
        return this.sliceBytes(bytes, currentIdx, 2);
    }

    public static getInt32Bytes(bytes: number[], currentIdx: number): number[] {
        return this.sliceBytes(bytes, currentIdx, 4);
    }

    public static getInt64Bytes(bytes: number[], currentIdx: number): number[] {
        return this.sliceBytes(bytes, currentIdx, 8);
    }

    public static getFloatBytes(bytes: number[], currentIdx: number): number[] {
        return this.sliceBytes(bytes, currentIdx, 4);
    }

    public static getDoubleBytes(bytes: number[], currentIdx: number): number[] {
        return this.sliceBytes(bytes, currentIdx, 8);
    }

    public static getStringBytes(bytes: number[], currentIdx: number): number[] {
        const slicedBytes: number[] = [];

        if (!bytes || bytes.length === 0) {
            return slicedBytes;
        }

        const nullTerm = "\0".charCodeAt(0);
        for (let i = currentIdx; i < bytes.length; i++) {
            const byte = bytes[i];

            if (byte === nullTerm) {
                if (slicedBytes.length === 0) {
                    continue;
                }

                break;
            }

            slicedBytes.push(byte);
        }

        return slicedBytes;
    }

    public static byteArrayToNumber(bytes: number[]): number {
        let value: number = 0;

        if (!bytes || bytes.length === 0) {
            return value;
        }

        for (let i = bytes.length - 1; i >= 0; i--) {
            value = (value * 256) + bytes[i];
        }

        return value;
    }

    public static byteArrayToBool(bytes: number[]): boolean {
        if (!bytes) {
            return false;
        }

        if (bytes.length !== 1) {
            return false;
        }

        return bytes[0] === 1 ? true : false;
    }

    public static byteArrayToInt8(bytes: number[]): number {
        if (!bytes) {
            return 0;
        }

        if (bytes.length !== 1) {
            return 0;
        }

        return this.byteArrayToNumber(bytes);
    }

    public static byteArrayToInt16(bytes: number[]): number {
        if (!bytes) {
            return 0;
        }

        if (bytes.length !== 2) {
            return 0;
        }

        return this.byteArrayToNumber(bytes);
    }

    public static byteArrayToInt32(bytes: number[]): number {
        if (!bytes) {
            return 0;
        }

        if (bytes.length !== 4) {
            return 0;
        }

        return this.byteArrayToNumber(bytes);
    }

    public static byteArrayToInt64(bytes: number[]): number {
        if (!bytes) {
            return 0;
        }

        if (bytes.length !== 8) {
            return 0;
        }

        return this.byteArrayToNumber(bytes);
    }

    public static byteArrayToFloat(bytes: number[]): number {
        if (!bytes) {
            return 0;
        }

        if (bytes.length !== 4) {
            return 0;
        }

        const byteArray: Uint8Array = new Uint8Array(bytes);
        const floatArray: Float32Array = new Float32Array(byteArray.buffer);
        return floatArray[0];
    }

    public static byteArrayToDouble(bytes: number[]): number {
        if (!bytes) {
            return 0;
        }

        if (bytes.length !== 8) {
            return 0;
        }

        const byteArray: Uint8Array = new Uint8Array(bytes);
        const floatArray: Float64Array = new Float64Array(byteArray.buffer);
        return floatArray[0];
    }


    public static byteToNibbles(byte: number): number[] {
        const bytes: number[] = [0, 0];

        for (let i = 0; i < bytes.length; i++) {
            const temp = byte & 0x0F;
            bytes[i] = temp;
            byte = (byte - temp) / 16;
        }

        return bytes;
    }

    public static nibblesToByte(nibbles: number[]): number {
        let value = 0;
        if (!nibbles) {
            return value;
        }

        for (let i = nibbles.length - 1; i >= 0; i--) {
            value = (value * 16) + nibbles[i];
        }

        return value;
    }

    public static incrementByteValue(byte: number, increment: number): number {
        byte += increment;
        if (byte >= 256) {
            byte = byte - 256;
        }

        return byte;
    }

    private static _uint8MinValue: number = 0;
    public static get uint8MinValue(): number {
        return this._uint8MinValue;
    }

    private static _uint8MaxValue: number = 255;
    public static get uint8MaxValue(): number {
        return this._uint8MaxValue;
    }

    private static _int8MinValue: number = -128;
    public static get int8MinValue(): number {
        return this._int8MinValue;
    }

    private static _int8MaxValue: number = 127;
    public static get int8MaxValue(): number {
        return this._int8MaxValue;
    }

    private static _uint16MinValue: number = 0;
    public static get uint16MinValue(): number {
        return this._uint16MinValue;
    }

    private static _uint16MaxValue: number = 65535;
    public static get uint16MaxValue(): number {
        return this._uint16MaxValue;
    }

    private static _int16MinValue: number = -32768;
    public static get int16MinValue(): number {
        return this._int16MinValue;
    }

    private static _int16MaxValue: number = 32767;
    public static get int16MaxValue(): number {
        return this._int16MaxValue;
    }

    private static _uint32MinValue: number = 0;
    public static get uint32MinValue(): number {
        return this._uint32MinValue;
    }

    private static _uint32MaxValue: number = 4294967295;
    public static get uint32MaxValue(): number {
        return this._uint32MaxValue;
    }

    private static _int32MinValue: number = -2147483648;
    public static get int32MinValue(): number {
        return this._int32MinValue;
    }

    private static _int32MaxValue: number = 2147483647;
    public static get int32MaxValue(): number {
        return this._int32MaxValue;
    }
}

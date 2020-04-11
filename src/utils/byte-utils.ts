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
    public static numberToByteArray(value: number, size: number): Array<number> {
        let bytes: Array<number> = [];

        for (let i = 0; i < size; i++) {
            bytes.push(0);
        }

        if (value === undefined || value === null) {
            return bytes;
        }

        for (let i = 0; i < bytes.length; i++) {
            let byte: number = value & 0xFF;
            bytes[i] = byte;
            value = (value - byte) / 256;
        }

        return bytes;
    }

    public static boolToByteArray(value: boolean): Array<number> {
        let bytes: Array<number> = [0];

        if (value === undefined || value === null) {
            return bytes;
        }

        bytes[0] = !value ? 0 : 1;

        return bytes;
    }

    public static int8ToByteArray(value: number): Array<number> {
        return this.numberToByteArray(value, 1);
    }

    public static int16ToByteArray(value: number): Array<number> {
        return this.numberToByteArray(value, 2);
    }

    public static int32ToByteArray(value: number): Array<number> {
        return this.numberToByteArray(value, 4);
    }

    public static int64ToByteArray(value: number): Array<number> {
        return this.numberToByteArray(value, 8);
    }

    public static floatToByteArray(value: number): Array<number> {
        if (value === undefined || value === null) {
            return [];
        }

        const floatArray: Float32Array = new Float32Array(1);
        floatArray[0] = value;
        const uint8Array: Uint8Array = new Uint8Array(floatArray.buffer);

        let bytes: Array<number> = [];
        for (let i = 0; i < uint8Array.byteLength; i++) {
            bytes.push(uint8Array[i]);
        }

        return bytes;
    }

    public static doubleToByteArray(value: number): Array<number> {
        if (value === undefined || value === null) {
            return [];
        }

        const floatArray: Float64Array = new Float64Array(1);
        floatArray[0] = value;
        const uint8Array: Uint8Array = new Uint8Array(floatArray.buffer);

        let bytes: Array<number> = [];
        for (let i = 0; i < uint8Array.byteLength; i++) {
            bytes.push(uint8Array[i]);
        }

        return bytes;
    }

    public static stringToByteArray(value: string): Array<number> {
        let bytes: Array<number> = [];

        if (value === undefined || value === null || value.length === 0) {
            return bytes;
        }

        // Add null character
        if (value[value.length - 1] != "\0") {
            value += "\0";
        }

        for (let i = 0; i < value.length; i++) {
            bytes.push(value.charCodeAt(i));
        }

        return bytes;
    }

    public static sliceBytes(bytes: Array<number>, startingIdx: number, count: number): Array<number> {
        let slicedBytes: Array<number> = [];

        if (!bytes || bytes.length === 0) {
            return slicedBytes;
        }

        let endingIdx = startingIdx + count;
        if (endingIdx > bytes.length) {
            return slicedBytes;
        }

        return bytes.slice(startingIdx, endingIdx);
    }

    public static getBoolBytes(bytes: Array<number>, currentIdx: number): Array<number> {
        return this.sliceBytes(bytes, currentIdx, 1);
    }

    public static getInt8Bytes(bytes: Array<number>, currentIdx: number): Array<number> {
        return this.sliceBytes(bytes, currentIdx, 1);
    }

    public static getInt16Bytes(bytes: Array<number>, currentIdx: number): Array<number> {
        return this.sliceBytes(bytes, currentIdx, 2);
    }

    public static getInt32Bytes(bytes: Array<number>, currentIdx: number): Array<number> {
        return this.sliceBytes(bytes, currentIdx, 4);
    }

    public static getInt64Bytes(bytes: Array<number>, currentIdx: number): Array<number> {
        return this.sliceBytes(bytes, currentIdx, 8);
    }

    public static getFloatBytes(bytes: Array<number>, currentIdx: number): Array<number> {
        return this.sliceBytes(bytes, currentIdx, 4);
    }

    public static getDoubleBytes(bytes: Array<number>, currentIdx: number): Array<number> {
        return this.sliceBytes(bytes, currentIdx, 8);
    }

    public static getStringBytes(bytes: Array<number>, currentIdx: number): Array<number> {
        let slicedBytes: Array<number> = [];

        if (!bytes || bytes.length === 0) {
            return slicedBytes;
        }

        const nullTerm = "\0".charCodeAt(0);
        for (let i = currentIdx; i < bytes.length; i++) {
            let byte = bytes[i];

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




    public static byteToNibbles(byte: number): Array<number> {
        let bytes: Array<number> = [0, 0];

        for (let i = 0; i < bytes.length; i++) {
            let temp = byte & 0x0F;
            bytes[i] = temp;
            byte = (byte - temp) / 16;
        }

        return bytes;
    }

    public static nibblesToByte(nibbles: Array<number>): number {
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
}

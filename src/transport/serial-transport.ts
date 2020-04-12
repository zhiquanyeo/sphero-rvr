import StrictEventEmitter from "strict-event-emitter-types";
import SerialPort from "serialport";
import { EventEmitter } from "events";

interface TransportEvents {
    data: (chunk: Buffer|string|any) => void,
    end: void,
    error: (err: Error) => void,
    close: (err?: Error) => void,
    open: void,
}

type TransportEventEmitter = StrictEventEmitter<EventEmitter, TransportEvents>;

export abstract class TransportBase extends (EventEmitter as new() => TransportEventEmitter) {
    public abstract write(data: string|Buffer|number[],
                          callback?: (error: Error, bytesWritten: number) => void): boolean;
    public abstract read(size?: number): string|Buffer|null;
    public abstract close(callback?: (err?: Error) => void): void;
    public abstract flush(callback?: (err?: Error) => void): void;
    public abstract drain(callback?: (err?: Error) => void): void;
    public abstract pause(): this;
    public abstract resume(): this;
}

/**
 * A concrete transport implementation using a Serial port
 */
export class SerialTransport extends TransportBase {
    protected _serialPort: SerialPort;

    constructor(path: string, openCallback?: SerialPort.ErrorCallback) {
        super();

        this._serialPort = new SerialPort(path, {
            baudRate: 115200
        }, openCallback);

        this._serialPort.on("open", () => {
            this.emit("open");
        });

        this._serialPort.on("close", (err?: Error) => {
            this.emit("close", err);
        });

        this._serialPort.on("error", (err?: Error) => {
            this.emit("error", err);
        });

        this._serialPort.on("data", (data) => {
            this.emit("data", data);
        });

        this._serialPort.on("end", () => {
            this.emit("end");
        })
    }

    public write(data: string | Buffer | number[],
                 callback?: (error: Error, bytesWritten: number) => void): boolean {
        return this._serialPort.write(data, callback);
    }

    public read(size?: number): string | Buffer {
        return this._serialPort.read(size);
    }

    public close(callback?: (error?: Error) => void): void {
        this._serialPort.close(callback);
    }

    public flush(callback?: SerialPort.ErrorCallback): void {
        this._serialPort.flush(callback);
    }

    public drain(callback?: SerialPort.ErrorCallback): void {
        this._serialPort.drain(callback);
    }

    public pause(): this {
        this._serialPort.pause();
        return this;
    }

    public resume(): this {
        this._serialPort.resume();
        return this;
    }
}

export class MockTransport extends TransportBase {
    protected _lastWrite: Buffer;
    protected _dataForNextRead: Buffer;

    protected _shouldTriggerErrorOnNextAction: boolean = false;

    protected _mockDataWrittenCallback: (data: Buffer | number[]) => void;

    public get lastWrittenBuffer() {
        return this._lastWrite;
    }

    public setMockDataWrittenCallback(cb: (data: Buffer | number[]) => void) : void {
        this._mockDataWrittenCallback = cb;
    }

    public setDataForNextRead(buf: Buffer): void {
        this._dataForNextRead = Buffer.from(buf);
    }

    public setShouldTriggerErrorOnNextAction(val: boolean): void {
        this._shouldTriggerErrorOnNextAction = val;
    }

    public triggerDataEvent(): void {
        this.emit("data", this._dataForNextRead);
    }

    public write(data: string | Buffer | number[], callback?: (error: Error, bytesWritten: number) => void): boolean {
        this._lastWrite = Buffer.from(data);

        if (callback) {
            callback(this._shouldTriggerErrorOnNextAction ? new Error() : undefined, data.length);
        }

        this._shouldTriggerErrorOnNextAction = false;

        if (this._mockDataWrittenCallback) {
            this._mockDataWrittenCallback(this._lastWrite);
        }

        return true;
    }

    public read(size?: number): string | Buffer {
        if (this._dataForNextRead === undefined ||
            this._dataForNextRead.length === 0) {
            return null;
        }

        if (size) {
            if (this._dataForNextRead.length < size) {
                return null;
            }
            else {
                return this._dataForNextRead.slice(0, size);
            }
        }

        return this._dataForNextRead.slice(0);
    }
    public close(callback?: (err?: Error) => void): void {
        // no-op
    }
    public flush(callback?: (err?: Error) => void): void {
        // no-op
    }
    public drain(callback?: (err?: Error) => void): void {
        // no-op
    }
    public pause(): this {
        return this;
    }
    public resume(): this {
        return this;
    }
}

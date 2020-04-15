export interface ICommandParserFactory {
    addParser(processorId: number,
              deviceId: number,
              commandId: number,
              commandParserHandler: ICommandParserHandler): void;
    getParser(processorId: number,
              deviceId: number,
              commandId: number): ICommandParserHandler | null;
}

export type ICommandParserHandler = (dataRawBytes: number[]) => object;

class CommandParserFactory implements ICommandParserFactory {
    private _commandParserMap: Map<string, ICommandParserHandler>;

    constructor() {
        this._commandParserMap = new Map<string, ICommandParserHandler>();
    }

    public addParser(sourceId: number, deviceId: number, commandId: number, handler: ICommandParserHandler): void {
        const key: string = this.getMapKey(sourceId, deviceId, commandId);
        this._commandParserMap.set(key, handler);
    }

    public getParser(sourceId: number, deviceId: number, commandId: number): ICommandParserHandler | null {
        const key: string = this.getMapKey(sourceId, deviceId, commandId);

        let handler: ICommandParserHandler | undefined | null = null;
        if (this._commandParserMap.has(key)) {
            handler = this._commandParserMap.get(key);
        }

        if (!handler) {
            console.log("could not find parser");
        }

        return !handler ? null : handler;
    }

    private getMapKey(sourceId: number, deviceId: number, commandId: number): string {
        return `${sourceId}, ${deviceId}, ${commandId}`;
    }
}

let _commandParserFactory: ICommandParserFactory | null = null;
export function getCommandParserFactory(): ICommandParserFactory {
    if (_commandParserFactory == null) {
        _commandParserFactory = new CommandParserFactory();
    }

    return _commandParserFactory;
}

export class DeferredPromise<T> {
    private _fate: "resolved" | "unresolved";
    private _state: "pending" | "fulfilled" | "rejected";

    private _resolve: (value?: T | PromiseLike<T>) => void;
    private _reject: (reason?: any) => void;

    private readonly _promise: Promise<T>;

    public get promise(): Promise<T> {
        return this._promise;
    }

    public get isResolved(): boolean {
        return this._fate === "resolved";
    }

    public get isPending(): boolean {
        return this._state === "pending";
    }

    public get isFulfilled(): boolean {
        return this._state === "fulfilled";
    }

    public get isRejected(): boolean {
        return this._state === "rejected";
    }

    constructor() {
        this._fate = "unresolved";
        this._state = "pending";

        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        this.promise.then(
            () => this._state = "fulfilled",
            () => this._state = "rejected"
        );
    }

    public resolve(value?: any) {
        if (this.isResolved) {
            throw new Error("Promise is already resolved");
        }

        this._fate = "resolved";
        this._resolve(value);
    }

    public reject(reason?: any) {
        if (this.isResolved) {
            throw new Error("Promise is already resolved");
        }

        this._fate = "resolved";
        this._reject(reason);
    }
}

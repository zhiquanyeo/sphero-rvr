import { MockTransport } from "./serial-transport";


describe("MockTransport", () => {
    let transport: MockTransport;

    beforeEach(() => {
        transport = new MockTransport();
    });

    test("Writes to buffer", done => {
        const buffer = Buffer.from([0xAB, 0xCD, 0xEF, 0x00, 0x01, 0x02]);
        transport.write(buffer, (err, bytesWritten) => {
            expect(err).toBeUndefined();
            expect(bytesWritten).toBe(buffer.length);
            expect(transport.lastWrittenBuffer).toEqual(buffer);
            done();
        });
    });

    test("Writes to buffer and throws an error", done => {
        const buffer = Buffer.from([0xAB, 0xCD, 0xEF, 0x00, 0x01, 0x02]);
        transport.setShouldTriggerErrorOnNextAction(true);
        transport.write(buffer, (err, bytesWritten) => {
            expect(err).toBeInstanceOf(Error);
            done();
        });
    });

    test("Reads from buffer", () => {
        const buffer = Buffer.from([0xAB, 0xCD, 0xEF, 0x00, 0x01, 0x02]);
        transport.setDataForNextRead(buffer);
        const result = transport.read();
        expect(result).toEqual(buffer);
    });

    test("Eimts the 'data' event", done => {
        const buffer = Buffer.from([0xAB, 0xCD, 0xEF, 0x00, 0x01, 0x02]);
        transport.on("data", (chunk) => {
            expect(chunk).toEqual(buffer);
            done();
        });

        transport.setDataForNextRead(buffer);
        transport.triggerDataEvent();
    });
});

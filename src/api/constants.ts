import { ByteUtils } from "../utils/byte-utils";

export class MessageErrorCodes {
    public static readonly success: number = 0x00;
    public static readonly badDeviceId: number = 0x01;
    public static readonly badCommandId: number = 0x02;
    public static readonly notYetImplemented: number = 0x03;
    public static readonly commandIsRestricted: number = 0x04;
    public static readonly badDataLength: number = 0x05;
    public static readonly commandFailed: number = 0x06;
    public static readonly badParameterValue: number = 0x07;
    public static readonly busy: number = 0x08;
    public static readonly badTargetId: number = 0x09;
    public static readonly targetUnavailable: number = 0x0A;

    public static getErrorMessageFromCode(errCode: number): string {
        let errorMessage = "Unknown";

        switch (errCode) {
            case this.success:
                errorMessage = "Success";
                break;
            case this.badDeviceId:
                errorMessage = "Bad Device ID";
                break;
            case this.badCommandId:
                errorMessage = "Bad Command ID";
                break;
            case this.notYetImplemented:
                errorMessage = "Command Not Implemented";
                break;
            case this.commandIsRestricted:
                errorMessage = "Restricted Command";
                break;
            case this.badDataLength:
                errorMessage = "Bad Data Length";
                break;
            case this.commandFailed:
                errorMessage = "Command Failed";
                break;
            case this.badParameterValue:
                errorMessage = "Bad Parameter Value";
                break;
            case this.busy:
                errorMessage = "Busy";
                break;
            case this.badTargetId:
                errorMessage = "Bad Target ID";
                break;
            case this.targetUnavailable:
                errorMessage = "Target Unavailable";
                break;
        }

        return errorMessage;
    }
}

export class ProtocolErrorCodes {
    public static readonly badEscapeValue: number = 0x00;
    public static readonly badChecksum = 0x01;
    public static readonly earlyEndOfPacket: number = 0x02;
    public static readonly earlyStartOfPacket: number = 0x03;
    public static readonly badFlags: number = 0x04;
    public static readonly skippedData: number = 0x05;

    public static getProtocolErrorMessageFromCode(errorCode: number): string {
        let errorMessage = "Unknown";

        switch (errorCode) {
            case this.badEscapeValue:
                errorMessage = "Bad Escape Value";
                break;
            case this.badChecksum:
                errorMessage = "Bad Checksum";
                break;
            case this.earlyEndOfPacket:
                errorMessage = "Early End of Packet";
                break;
            case this.earlyStartOfPacket:
                errorMessage = "Early Start of Packet";
                break;
            case this.badFlags:
                errorMessage = "Bad Flags";
                break;
            case this.skippedData:
                errorMessage = "Skipped Data";
                break;
        }

        return errorMessage;
    }
}

export class MessageFlags {
    public static readonly isResponse: number = 1 << 0;
    public static readonly requestsResponse: number = 1 << 1;
    public static readonly requestOnlyErrorResponse: number = 1 << 2;
    public static readonly resetInactivityTimeout: number = 1 << 3;
    public static readonly packetHasTargetId: number = 1 << 4;
    public static readonly packetHasSourceId: number = 1 << 5;
    public static readonly extendedFlags: number = 1 << 7;

    public static readonly defaultRequestWithResponseFlags: number =
        MessageFlags.requestsResponse |
        MessageFlags.resetInactivityTimeout |
        MessageFlags.packetHasTargetId |
        MessageFlags.packetHasSourceId;

    public static readonly defaultRequestWithNoResponseFlags: number =
        MessageFlags.resetInactivityTimeout |
        MessageFlags.packetHasTargetId |
        MessageFlags.packetHasSourceId;

    public static readonly defaultResponseFlags: number =
        MessageFlags.isResponse |
        MessageFlags.packetHasTargetId |
        MessageFlags.packetHasSourceId;
}

export class TargetsAndSources {
    public static readonly robotNordicTarget: number = ByteUtils.nibblesToByte([1, 1].reverse());
    public static readonly robotStTarget: number = ByteUtils.nibblesToByte([1, 2].reverse());
    public static readonly serviceSource: number = ByteUtils.nibblesToByte([0, 1].reverse());
}

export class MessageParserFlags {
    public static readonly escape: number = 0xAB;
    public static readonly startOfPacket: number = 0x8D;
    public static readonly endOfPacket: number = 0xD8;
    public static readonly escapedEscape: number = 0x23;
    public static readonly escapedStartOfPacket: number = 0x05;
    public static readonly escapedEndOfPacket: number = 0x50;
    public static readonly slipEscapeMask: number = 0x88;
}

export enum RawMotorModes {
    OFF = 0,
    FORWARD = 1,
    REVERSE = 2
}

export enum LED {
    RIGHT_HEADLIGHT = 0,
    LEFT_HEADLIGHT = 3,
    LEFT_STATUS = 6,
    RIGHT_STATUS = 9,
    BATTERY_DOOR_REAR = 12,
    BATTERY_DOOR_FRONT = 15,
    POWER_BUTTON_FRONT = 18,
    POWER_BUTTON_REAR = 21,
    LEFT_BRAKELIGHT = 24,
    RIGHT_BRAKELIGHT = 27
}


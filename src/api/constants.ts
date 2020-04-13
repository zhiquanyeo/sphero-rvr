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

class LedBitmasks {
    public static readonly rightHeadlightRed: number = 0x00000001;
    public static readonly rightHeadlightGreen: number = 0x00000002;
    public static readonly rightHeadlightBlue: number = 0x00000004;
    public static readonly leftHeadlightRed: number = 0x00000008;
    public static readonly leftHeadlightGreen: number = 0x00000010;
    public static readonly leftHeadlightBlue: number = 0x00000020;
    public static readonly leftStatusIndicationRed: number = 0x00000040;
    public static readonly leftStatusIndicationGreen: number = 0x00000080;
    public static readonly leftStatusIndicationBlue: number = 0x00000100;
    public static readonly rightStatusIndicationRed: number = 0x00000200;
    public static readonly rightStatusIndicationGreen: number = 0x00000400;
    public static readonly rightStatusIndicationBlue: number = 0x00000800;
    public static readonly batteryDoorFrontRed: number = 0x00001000;
    public static readonly batteryDoorFrontGreen: number = 0x00002000;
    public static readonly batteryDoorFrontBlue: number = 0x00004000;
    public static readonly batteryDoorRearRed: number = 0x00008000;
    public static readonly batteryDoorRearGreen: number = 0x00010000;
    public static readonly batteryDoorRearBlue: number = 0x00020000;
    public static readonly powerButtonFrontRed: number = 0x00040000;
    public static readonly powerButtonFrontGreen: number = 0x00080000;
    public static readonly powerButtonFrontBlue: number = 0x00100000;
    public static readonly powerButtonRearRed: number = 0x00200000;
    public static readonly powerButtonRearGreen: number = 0x00400000;
    public static readonly powerButtonRearBlue: number = 0x00800000;
    public static readonly leftBrakelightRed: number = 0x01000000;
    public static readonly leftBrakelightGreen: number = 0x02000000;
    public static readonly leftBrakelightBlue: number = 0x04000000;
    public static readonly rightBrakelightRed: number = 0x08000000;
    public static readonly rightBrakelightGreen: number = 0x10000000;
    public static readonly rightBrakelightBlue: number = 0x20000000;
    public static readonly undercarriageWhite: number = 0x40000000;
}

export enum LED {
    LEFT_BRAKELIGHT = LedBitmasks.leftBrakelightRed |
                      LedBitmasks.leftBrakelightGreen |
                      LedBitmasks.leftBrakelightBlue,
    RIGHT_BRAKELIGHT = LedBitmasks.rightBrakelightRed |
                       LedBitmasks.rightBrakelightGreen |
                       LedBitmasks.rightBrakelightBlue,
    LEFT_STATUS = LedBitmasks.leftStatusIndicationRed |
                  LedBitmasks.leftStatusIndicationGreen |
                  LedBitmasks.leftStatusIndicationBlue,
    RIGHT_STATUS = LedBitmasks.rightStatusIndicationRed |
                   LedBitmasks.rightStatusIndicationGreen |
                   LedBitmasks.rightStatusIndicationBlue,
    BATTERY_DOOR_FRONT = LedBitmasks.batteryDoorFrontRed |
                         LedBitmasks.batteryDoorFrontGreen |
                         LedBitmasks.batteryDoorFrontBlue,
    BATTERY_DOOR_REAR = LedBitmasks.batteryDoorRearRed |
                        LedBitmasks.batteryDoorRearGreen |
                        LedBitmasks.batteryDoorRearBlue,
    POWER_BUTTON_FRONT = LedBitmasks.powerButtonFrontRed |
                         LedBitmasks.powerButtonFrontGreen |
                         LedBitmasks.powerButtonFrontBlue,
    POWER_BUTTON_REAR = LedBitmasks.powerButtonRearRed |
                        LedBitmasks.powerButtonRearGreen |
                        LedBitmasks.powerButtonRearBlue,
    LEFT_HEADLIGHT = LedBitmasks.leftHeadlightRed |
                     LedBitmasks.leftHeadlightGreen |
                     LedBitmasks.leftHeadlightBlue,
    RIGHT_HEADLIGHT = LedBitmasks.rightHeadlightRed |
                      LedBitmasks.rightHeadlightGreen |
                      LedBitmasks.rightHeadlightBlue,

}


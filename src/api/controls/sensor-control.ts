import { RobotLink } from "../robot-link";
import { ISensorStreamService, SensorStreamService } from "../streaming/sensor-stream-service";
import { ISensorStreamProvider, SensorStreamProvider } from "../streaming/sensor-stream-provider";
import { ISensorStreamServiceAttribute, SensorStreamServiceAttribute } from "../streaming/sensor-stream-service-attribute";
import { ByteUtils } from "../../utils/byte-utils";
import { ISensorStreamSlot, SensorStreamSlot } from "../streaming/sensor-stream-slot";


export class SensorControl {
    private readonly _eightBitEnum = 0x00;
    private readonly _sixteenBitEnum = 0x01;
    private readonly _thirtyTwoBitEnum = 0x02;

    private readonly _robotLink: RobotLink;

    private _isCurrentlyStreaming: boolean;

    private readonly _supportedStreamingServices: Map<string, ISensorStreamService> =
        new Map<string, ISensorStreamService>();
    private readonly _streamingProviders: ISensorStreamProvider[] = [];


    constructor(robotLink: RobotLink) {
        this._robotLink = robotLink;

        const quaternionW: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("W", -1.0, 1.0);
        const quaternionX: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("X", -1.0, 1.0);
        const quaternionY: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Y", -1.0, 1.0);
        const quaternionZ: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Z", -1.0, 1.0);
        const quaternion: ISensorStreamService =
            new SensorStreamService(0x00, "Quaternion",
                [quaternionW, quaternionX, quaternionY, quaternionZ], this._thirtyTwoBitEnum);

        const attitudePitch: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Pitch", -180.0, 180.0);
        const attitudeRoll: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Roll", -90.0, 90.0);
        const attitudeYaw: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Yaw", -180.0, 180.0);
        const attitude: ISensorStreamService =
            new SensorStreamService(0x01, "IMU",
                [attitudePitch, attitudeRoll, attitudeYaw], this._sixteenBitEnum);

        const accelX: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("X", -16.0, 16.0);
        const accelY: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Y", -16.0, 16.0);
        const accelZ: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Z", -16.0, 16.0);
        const accelerometer: ISensorStreamService =
            new SensorStreamService(0x02, "Accelerometer",
                [accelX, accelY, accelZ], this._sixteenBitEnum);

        const colorR: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("R", 0, ByteUtils.uint8MaxValue);
        const colorG: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("G", 0, ByteUtils.uint8MaxValue);
        const colorB: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("B", 0, ByteUtils.uint8MaxValue);
        const colorIndex: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Index", 0, ByteUtils.uint8MaxValue);
        const colorConfidence: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Confidence", 0.0, 1.0);
        const colorDetection: ISensorStreamService =
            new SensorStreamService(0x03, "ColorDetection",
                [colorR, colorG, colorB, colorIndex, colorConfidence], this._eightBitEnum);

        const gyroX: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("X", -2000.0, 2000.0);
        const gyroY: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Y", -2000.0, 2000.0);
        const gyroZ: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Z", -2000.0, 2000.0);
        const gyro: ISensorStreamService =
            new SensorStreamService(0x04, "Gyroscope",
                [gyroX, gyroY, gyroZ], this._sixteenBitEnum);

        const locatorX: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("X", -16000, 16000);
        const locatorY: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Y", -16000, 16000);
        const locator: ISensorStreamService =
            new SensorStreamService(0x06, "Locator",
                [locatorX, locatorY], this._thirtyTwoBitEnum);

        const veloX: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("X", -5.0, 5.0);
        const veloY: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Y", -5.0, 5.0);
        const velocity: ISensorStreamService =
            new SensorStreamService(0x07, "Velocity",
                [veloX, veloY], this._thirtyTwoBitEnum);

        const speedMPS: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("MPS", 0, 5.0);
        const speed: ISensorStreamService =
            new SensorStreamService(0x08, "Velocity",
                [speedMPS], this._thirtyTwoBitEnum);

        const coreTimeLowerTime: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Time", 0, ByteUtils.uint32MaxValue);
        const coreTimeLower: ISensorStreamService =
            new SensorStreamService(0x05, "CoreTimeLower",
                [coreTimeLowerTime], this._thirtyTwoBitEnum);

        const coreTimeUpperTime: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Time", 0, ByteUtils.uint32MaxValue);
        const coreTimeUpper: ISensorStreamService =
            new SensorStreamService(0x09, "CoreTimeUpper",
                [coreTimeUpperTime], this._thirtyTwoBitEnum);

        const ambientLightValue: ISensorStreamServiceAttribute =
            new SensorStreamServiceAttribute("Light", 0, 120000.0);
        const ambientLight: ISensorStreamService =
            new SensorStreamService(0x0A, "AmbientLight",
                [ambientLightValue], this._sixteenBitEnum);

        // Add to services
        this._supportedStreamingServices.set(quaternion.name, quaternion);
        this._supportedStreamingServices.set(attitude.name, attitude);
        this._supportedStreamingServices.set(accelerometer.name, accelerometer);
        this._supportedStreamingServices.set(colorDetection.name, colorDetection);
        this._supportedStreamingServices.set(gyro.name, gyro);
        this._supportedStreamingServices.set(locator.name, locator);
        this._supportedStreamingServices.set(velocity.name, velocity);
        this._supportedStreamingServices.set(speed.name, speed);
        this._supportedStreamingServices.set(coreTimeLower.name, coreTimeLower);
        this._supportedStreamingServices.set(coreTimeUpper.name, coreTimeUpper);
        this._supportedStreamingServices.set(ambientLight.name, ambientLight);

        const slotNordic1: ISensorStreamSlot = new SensorStreamSlot(1, [colorDetection]);
        const slotNordic2: ISensorStreamSlot = new SensorStreamSlot(2, [coreTimeLower, coreTimeUpper]);
        const slotNordic3: ISensorStreamSlot = new SensorStreamSlot(3, [ambientLight]);

        const slotST1: ISensorStreamSlot =
            new SensorStreamSlot(1, [quaternion, attitude, accelerometer, gyro]);
        const slotST2: ISensorStreamSlot =
            new SensorStreamSlot(2, [locator, velocity, speed]);

        const nordicStreamingProvider: ISensorStreamProvider =
            new SensorStreamProvider(0x01, [slotNordic1, slotNordic2, slotNordic3], this._robotLink);
        const stStreamingProvider: ISensorStreamProvider =
            new SensorStreamProvider(0x02, [slotST1, slotST2], this._robotLink);

        this._streamingProviders.push(nordicStreamingProvider);
        this._streamingProviders.push(stStreamingProvider);

        this._isCurrentlyStreaming = false;
    }

    /**
     * Get sensors supported as a list of sensor names
     */
    public getSupportedStreamingServices(): string[] {
        return Array.from(this._supportedStreamingServices.keys());
    }

    public enableSensor(streamingServiceName: string): void {
        const sensor: ISensorStreamService | undefined = this._supportedStreamingServices.get(streamingServiceName);
        if (sensor === undefined) {
            throw new Error(`Invalid sensor: ${streamingServiceName}`);
        }
        sensor.enable();

    }

    public disableSensor(streamingServiceName: string): void {
        const sensor: ISensorStreamService | undefined = this._supportedStreamingServices.get(streamingServiceName);
        if (sensor === undefined) {
            throw new Error(`Invalid sensor: ${streamingServiceName}`);
        }
        sensor.disable();
    }

    private hasEnabledSensors(): boolean {
        for (const provider of this._streamingProviders) {
            if (provider.hasEnabledStreamingServices) {
                return true;
            }
        }

        return false;
    }

    /**
     * Start sensor streaming for given sensors and streaming interval
     * If no stream names are provided, then we should at least have some
     * enabled sensors
     * @param streamSvcNames
     * @param streamInterval
     */
    public startStreaming(streamSvcNames: string[], streamInterval: number): void {
        if (this._isCurrentlyStreaming) {
            throw new Error("Already streaming! Stop current stream first");
        }

        if (streamSvcNames.length === 0 && !this.hasEnabledSensors()) {
            throw new Error("Parameter streamSvcNames must contain at least one valid streaming service name");
        }

        for (const svcName of streamSvcNames) {
            const sensor: ISensorStreamService | undefined = this._supportedStreamingServices.get(svcName);
            if (sensor === undefined) {
                throw new Error(`Invalid sensor name: ${svcName}`);
            }
            sensor.enable();
        }

        for (const streamProvider of this._streamingProviders) {
            if (!streamProvider.hasEnabledStreamingServices) {
                continue;
            }

            streamProvider.startStreaming(streamInterval);
        }

        this._isCurrentlyStreaming = true;
    }

    public stopStreaming(): void {
        if (!this._isCurrentlyStreaming) {
            throw new Error("Not currently streaming");
        }

        for (const streamProvider of this._streamingProviders) {
            if (!streamProvider.isStreaming) {
                continue;
            }
            streamProvider.stopStreaming();
        }

        this._isCurrentlyStreaming = false;
    }
}

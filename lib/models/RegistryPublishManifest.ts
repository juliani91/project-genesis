import {
    RegistryPublishEntry
} from "./RegistryPublishEntry";

export interface RegistryPublishManifest {

    registryId: string;

    generatedAt: Date;

    packages:
        readonly RegistryPublishEntry[];

}
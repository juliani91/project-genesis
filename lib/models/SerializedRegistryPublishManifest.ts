import {
    SerializedRegistryPublishEntry
} from "./SerializedRegistryPublishEntry";

export interface SerializedRegistryPublishManifest {

    registryId:
        string;

    generatedAt:
        string;

    packages:
        readonly SerializedRegistryPublishEntry[];

}
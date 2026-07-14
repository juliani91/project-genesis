import {
    SerializedInstalledTemplatePackage
} from "./SerializedInstalledTemplatePackage";

/**
 * JSON-safe InstalledTemplateCollection.
 */
export interface SerializedInstalledTemplateCollection {

    packages:
        SerializedInstalledTemplatePackage[];

}
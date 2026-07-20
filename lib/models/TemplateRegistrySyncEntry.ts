import {
    RemoteRegistryLoadSource
} from "./RemoteRegistryLoadResult";

export interface TemplateRegistrySyncEntry {

    registryId:
        string;

    registryName:
        string;

    source:
        RemoteRegistryLoadSource;

    templateCount:
        number;

    cachePath?:
        string;

    cachedAt?:
        Date;

}

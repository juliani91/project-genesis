export interface PackagePublishCommandOptions {

    templateId:
        string;

    version:
        string;

    packagePath:
        string;

    registryId:
        string;

    /**
     * Optional custom location for the registry's
     * publish-manifest.json file.
     *
     * When omitted, RegistryPublishManifestStore
     * uses its standard .genesis directory.
     */
    manifestPath?:
        string;

}
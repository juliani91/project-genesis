import {
    RegistryIndexTemplate,
    RegistryIndexTemplateVersion,
    TemplateRegistryIndex,
    TemplateRegistryManifest
} from "../models";

/**
 * Internal mutable representation used while assembling
 * the final readonly registry index.
 */
interface MutableRegistryIndexTemplate {

    templateId:
        string;

    name:
        string;

    description?:
        string;

    registryId:
        string;

    source:
        string;

    versions:
        RegistryIndexTemplateVersion[];

}

export class TemplateRegistryIndexService {

    public build(
        manifests:
            readonly TemplateRegistryManifest[]
    ): TemplateRegistryIndex {

        const templates =
            new Map<
                string,
                MutableRegistryIndexTemplate
            >();

        for (
            const manifest
            of manifests
        ) {

            const registryId =
                manifest.registry.id;

            const source =
                manifest.registry.location;

            for (
                const template
                of manifest.templates
            ) {

                /*
                 * Registry index entries must be installable.
                 * Local registry entries may omit package download
                 * metadata, so they are not added to this remote
                 * package index.
                 */
                if (
                    !template.downloadUrl ||
                    !template.archiveFormat
                ) {

                    continue;

                }

                const key =
                    [
                        registryId,
                        template.templateId
                    ].join(
                        ":"
                    );

                const version:
                    RegistryIndexTemplateVersion = {

                    version:
                        template.version,

                    downloadUrl:
                        template.downloadUrl,

                    archiveFormat:
                        template.archiveFormat,

                    sha256:
                        template.sha256
                };

                const existing =
                    templates.get(
                        key
                    );

                if (existing) {

                    const duplicateVersion =
                        existing.versions.some(
                            (existingVersion) =>
                                existingVersion.version ===
                                version.version
                        );

                    if (
                        !duplicateVersion
                    ) {

                        existing.versions.push(
                            version
                        );

                    }

                    continue;

                }

                templates.set(
                    key,
                    {
                        templateId:
                            template.templateId,

                        name:
                            template.name,

                        description:
                            template.description,

                        registryId,

                        source,

                        versions: [
                            version
                        ]
                    }
                );

            }

        }

        const indexed:
            RegistryIndexTemplate[] =
            Array.from(
                templates.values()
            ).map(
                (template) => {

                    const versions =
                        [
                            ...template.versions
                        ].sort(
                            (
                                left,
                                right
                            ) =>
                                right.version.localeCompare(
                                    left.version,
                                    undefined,
                                    {
                                        numeric:
                                            true
                                    }
                                )
                        );

                    const latestVersion =
                        versions[0];

                    if (!latestVersion) {

                        throw new Error(
                            [
                                "Registry index template has no versions:",
                                template.templateId
                            ].join(" ")
                        );

                    }

                    return {
                        templateId:
                            template.templateId,

                        name:
                            template.name,

                        description:
                            template.description,

                        registryId:
                            template.registryId,

                        source:
                            template.source,

                        latestVersion:
                            latestVersion.version,

                        versions
                    };

                }
            );

        indexed.sort(
            (
                left,
                right
            ) => {

                const idComparison =
                    left.templateId.localeCompare(
                        right.templateId
                    );

                if (
                    idComparison !==
                    0
                ) {

                    return idComparison;

                }

                return left.registryId.localeCompare(
                    right.registryId
                );

            }
        );

        return {
            generatedAt:
                new Date(),

            templates:
                indexed
        };

    }

}
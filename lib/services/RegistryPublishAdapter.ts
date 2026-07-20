import {
    RegistryPublishEntry,
    RegistryPublishManifest,
    RegistryIndexTemplate,
    RegistryIndexTemplateVersion,
    TemplateRegistryIndex
} from "../models";

export class RegistryPublishAdapter {

    public buildIndex(
        manifest:
            RegistryPublishManifest
    ): TemplateRegistryIndex {

        const templates =
            this.groupTemplates(
                manifest.packages
            );

        return {
            generatedAt: new Date(),
            templates
        };

    }

    private groupTemplates(
        entries:
            readonly RegistryPublishEntry[]
    ): RegistryIndexTemplate[] {

        const grouped =
            new Map<
                string,
                RegistryPublishEntry[]
            >();

        for (const entry of entries) {

            const existing =
                grouped.get(
                    entry.templateId
                );

            if (existing) {

                existing.push(
                    entry
                );

                continue;

            }

            grouped.set(
                entry.templateId,
                [
                    entry
                ]
            );

        }

        return [
            ...grouped.entries()
        ]
            .map(
                (
                    [
                        templateId,
                        packages
                    ]
                ) =>
                    this.createTemplate(
                        templateId,
                        packages
                    )
            )
            .sort(
                (
                    left,
                    right
                ) =>
                    left.templateId.localeCompare(
                        right.templateId
                    )
            );

    }

    private createTemplate(
        templateId:
            string,

        packages:
            readonly RegistryPublishEntry[]
    ): RegistryIndexTemplate {

        const versions =
            packages.map(
                (
                    entry
                ): RegistryIndexTemplateVersion => ({

                    version:
                        entry.version,

                    sha256:
                        entry.sha256,

                    downloadUrl:
                        entry.packagePath,

                    archiveFormat:
                        "zip"

                })
            );

        versions.sort(
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

        return {

            templateId,

            name:
                templateId,

            description:
                "Published package",

            source:
                "local",

            registryId:
                "local",

            latestVersion:
                versions[0]?.version,

            versions

        };

    }

}
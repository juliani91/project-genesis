import {
    PackageInstallationCommandResult,
    RegistryIndexTemplate,
    TemplateRegistryIndex
} from "../models";

import {
    TemplateRegistryManager
} from "../services";

export class PackageInstallCommand {

    public constructor(
        private readonly registryManager:
            TemplateRegistryManager =
            new TemplateRegistryManager()
    ) {}

    public async execute(
        index:
            TemplateRegistryIndex,

        templateId:
            string,

        version?:
            string,

        registryId?:
            string
    ): Promise<PackageInstallationCommandResult> {

        const normalizedTemplateId =
            this.requireValue(
                templateId,
                "Package template ID"
            );

        const normalizedVersion =
            version
                ?.trim() ||
            undefined;

        const normalizedRegistryId =
            registryId
                ?.trim() ||
            undefined;

        const template =
            this.selectTemplate(
                index,
                normalizedTemplateId,
                normalizedRegistryId
            );

        const installedPackage =
            await this.registryManager.install(
                template,
                normalizedVersion
            );

        return {
            success:
                true,

            message:
                [
                    `Package "${installedPackage.templateId}"`,
                    `version "${installedPackage.version}"`,
                    "installed successfully."
                ].join(" "),

            package:
                installedPackage
        };

    }

    private selectTemplate(
        index:
            TemplateRegistryIndex,

        templateId:
            string,

        registryId?:
            string
    ): RegistryIndexTemplate {

        const matches =
            index.templates.filter(
                (template) =>
                    template.templateId
                        .toLowerCase() ===
                    templateId
                        .toLowerCase() &&
                    (
                        !registryId ||
                        template.registryId
                            .toLowerCase() ===
                        registryId
                            .toLowerCase()
                    )
            );

        if (
            matches.length ===
            0
        ) {

            if (registryId) {

                throw new Error(
                    [
                        `Package "${templateId}"`,
                        `was not found in registry "${registryId}".`
                    ].join(" ")
                );

            }

            throw new Error(
                `Package "${templateId}" was not found.`
            );

        }

        if (
            matches.length >
            1
        ) {

            const registries =
                matches
                    .map(
                        (match) =>
                            match.registryId
                    )
                    .sort()
                    .join(
                        ", "
                    );

            throw new Error(
                [
                    `Package "${templateId}"`,
                    "exists in multiple registries.",
                    `Specify one of: ${registries}.`
                ].join(" ")
            );

        }

        const template =
            matches[0];

        if (!template) {

            throw new Error(
                "The selected package was unavailable."
            );

        }

        return template;

    }

    private requireValue(
        value:
            string,

        label:
            string
    ): string {

        if (
            typeof value !==
            "string"
        ) {

            throw new Error(
                `${label} is required.`
            );

        }

        const normalized =
            value.trim();

        if (!normalized) {

            throw new Error(
                `${label} is required.`
            );

        }

        return normalized;

    }

}
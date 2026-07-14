import {
    PackageInfoCommandResult,
    TemplateRegistryIndex
} from "../models";

import {
    TemplateRegistryManager
} from "../services";

export class PackageInfoCommand {

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

        registryId?:
            string
    ): Promise<PackageInfoCommandResult> {

        const normalizedTemplateId =
            this.requireValue(
                templateId,
                "Package template ID"
            );

        const normalizedRegistryId =
            registryId
                ?.trim();

        const matches =
            index.templates.filter(
                (template) =>
                    template.templateId
                        .toLowerCase() ===
                    normalizedTemplateId
                        .toLowerCase() &&
                    (
                        !normalizedRegistryId ||
                        template.registryId
                            .toLowerCase() ===
                        normalizedRegistryId
                            .toLowerCase()
                    )
            );

        if (
            matches.length ===
            0
        ) {

            return {
                success:
                    false,

                message:
                    normalizedRegistryId
                        ? [
                            `Package "${normalizedTemplateId}"`,
                            `was not found in registry "${normalizedRegistryId}".`
                        ].join(" ")
                        : `Package "${normalizedTemplateId}" was not found.`,

                installedVersions:
                    []
            };

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

            return {
                success:
                    false,

                message:
                    [
                        `Package "${normalizedTemplateId}"`,
                        "exists in multiple registries.",
                        `Specify one of: ${registries}.`
                    ].join(" "),

                installedVersions:
                    []
            };

        }

        const template =
            matches[0];

        if (!template) {

            throw new Error(
                "The matched package information was unavailable."
            );

        }

        const installedVersions =
            await this.registryManager
                .findInstalled(
                    template.templateId
                );

        return {
            success:
                true,

            message:
                `Package information for "${template.templateId}".`,

            template,

            installedVersions
        };

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
import {
    PackageRemovalCommandResult
} from "../models";

import {
    TemplateRegistryManager
} from "../services";

export class PackageUninstallCommand {

    public constructor(
        private readonly registryManager:
            TemplateRegistryManager =
            new TemplateRegistryManager()
    ) {}

    public async execute(
        templateId:
            string,

        version:
            string
    ): Promise<PackageRemovalCommandResult> {

        const normalizedTemplateId =
            this.requireValue(
                templateId,
                "Package template ID"
            );

        const normalizedVersion =
            this.requireValue(
                version,
                "Package version"
            );

        const removed =
            await this.registryManager.uninstall(
                normalizedTemplateId,
                normalizedVersion
            );

        if (!removed) {

            return {
                success:
                    false,

                message:
                    [
                        `Package "${normalizedTemplateId}"`,
                        `version "${normalizedVersion}"`,
                        "is not installed."
                    ].join(" ")
            };

        }

        return {
            success:
                true,

            message:
                [
                    `Package "${removed.templateId}"`,
                    `version "${removed.version}"`,
                    "was removed successfully."
                ].join(" "),

            removed
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
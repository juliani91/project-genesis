import {
    InstalledPackageCommandResult
} from "../models";

import {
    TemplateRegistryManager
} from "../services";

export class PackageListCommand {

    public constructor(
        private readonly registryManager:
            TemplateRegistryManager =
            new TemplateRegistryManager()
    ) {}

    public async execute(
        templateId?:
            string
    ): Promise<InstalledPackageCommandResult> {

        const normalizedTemplateId =
            templateId
                ?.trim();

        const packages =
            normalizedTemplateId
                ? await this.registryManager
                    .findInstalled(
                        normalizedTemplateId
                    )
                : await this.registryManager
                    .listInstalled();

        if (
            packages.length ===
            0
        ) {

            return {
                success:
                    true,

                message:
                    normalizedTemplateId
                        ? `No installed versions of "${normalizedTemplateId}" were found.`
                        : "No packages are installed.",

                packages
            };

        }

        return {
            success:
                true,

            message:
                this.createMessage(
                    packages.length,
                    normalizedTemplateId
                ),

            packages
        };

    }

    private createMessage(
        packageCount:
            number,

        templateId?:
            string
    ): string {

        if (templateId) {

            return packageCount ===
                1
                ? `Found 1 installed version of "${templateId}".`
                : `Found ${packageCount} installed versions of "${templateId}".`;

        }

        return packageCount ===
            1
            ? "Found 1 installed package."
            : `Found ${packageCount} installed packages.`;

    }

}
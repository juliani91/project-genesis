import {
    ResolvedTemplateRegistry
} from "../models";

export class TemplateRegistryPresenter {

    public format(
        registry:
            ResolvedTemplateRegistry
    ): string {

        const lines:
            string[] = [
                "Registry Preview",
                "----------------",
                `Name        : ${registry.name}`,
                `ID          : ${registry.id}`,
                `Type        : ${registry.type}`,
                `Location    : ${registry.resolvedLocation}`,
                `Description : ${
                    registry.description ??
                    "No description provided."
                }`,
                `Templates   : ${registry.templates.length}`
            ];

        if (
            registry.templates.length > 0
        ) {

            lines.push(
                "",
                "Available Templates",
                "-------------------"
            );

            for (
                const template
                of registry.templates
            ) {

                lines.push(
                    [
                        `- ${template.name}`,
                        `(${template.templateId}`,
                        `v${template.version})`
                    ].join(" ")
                );

            }

        }

        return lines.join("\n");

    }

}
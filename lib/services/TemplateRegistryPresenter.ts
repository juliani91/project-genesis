import {
    ResolvedTemplateRegistry
} from "../models";

export class TemplateRegistryPresenter {

    public format(
        registry:
            ResolvedTemplateRegistry,

        source?:
            "local" |
            "network" |
            "cache"
    ): string {

        const lines:
            string[] = [
                "Registry Preview",
                "----------------",
                `Name        : ${registry.name}`,
                `ID          : ${registry.id}`,
                `Type        : ${registry.type}`,
                `Location    : ${registry.resolvedLocation}`
        ];

        if (source) {

            lines.push(
                `Source      : ${this.formatSource(source)}`
            );

        }

        lines.push(
            `Description : ${
                registry.description ??
                "No description provided."
            }`
        );

        lines.push(
            `Templates   : ${registry.templates.length}`
        );

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

        private formatSource(
        source:
            "local" |
            "network" |
            "cache"
    ): string {

        switch (source) {

            case "local":
                return "Local";

            case "network":
                return "Network";

            case "cache":
                return "Cache";

        }

    }

}
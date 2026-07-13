import {
    ResolvedTemplateProfile,
    TemplatePackage,
    TemplateProfile
} from "../models";

export class TemplateProfileResolver {

    public resolve(
        profile: TemplateProfile,
        templates: readonly TemplatePackage[]
    ): ResolvedTemplateProfile {

        const baseTemplate =
            templates.find(
                (template) =>
                    template.manifest.id ===
                    profile.baseTemplate
            );

        if (!baseTemplate) {

            throw new Error(
                [
                    "The profile references an unknown base template:",
                    profile.baseTemplate
                ].join(" ")
            );

        }

        const featureTemplates:
            TemplatePackage[] = [];

        for (
            const featureTemplateId
            of profile.featureTemplates
        ) {

            const featureTemplate =
                templates.find(
                    (template) =>
                        template.manifest.id ===
                        featureTemplateId
                );

            if (!featureTemplate) {

                throw new Error(
                    [
                        "The profile references an unknown feature template:",
                        featureTemplateId
                    ].join(" ")
                );

            }

            featureTemplates.push(
                featureTemplate
            );

        }

        return {

            profileId:
                profile.id,

            baseTemplate,

            featureTemplates

        };

    }

}
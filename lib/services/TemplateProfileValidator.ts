import {
    ResolvedTemplateProfile,
    TemplateProfile,
    TemplateProfileValidationResult
} from "../models";

export class TemplateProfileValidator {

    public validateDefinition(
        profile:
            TemplateProfile
    ): TemplateProfileValidationResult {

        const errors:
            string[] = [];

        if (
            !profile.id.trim()
        ) {

            errors.push(
                "Profile ID is required."
            );

        }

        if (
            !profile.name.trim()
        ) {

            errors.push(
                "Profile name is required."
            );

        }

        if (
            !profile.category.trim()
        ) {

            errors.push(
                "Profile category is required."
            );

        }

        if (
            !profile.baseTemplate.trim()
        ) {

            errors.push(
                "Profile base template ID is required."
            );

        }

        const normalizedBaseId =
            this.normalize(
                profile.baseTemplate
            );

        const seenFeatures =
            new Set<string>();

        for (
            const featureId
            of profile.featureTemplates
        ) {

            const normalizedFeatureId =
                this.normalize(
                    featureId
                );

            if (
                !normalizedFeatureId
            ) {

                errors.push(
                    "Profile feature template IDs cannot be blank."
                );

                continue;

            }

            if (
                normalizedFeatureId ===
                normalizedBaseId
            ) {

                errors.push(
                    [
                        "The base template cannot also be",
                        `listed as a feature: ${featureId}.`
                    ].join(" ")
                );

            }

            if (
                seenFeatures.has(
                    normalizedFeatureId
                )
            ) {

                errors.push(
                    `Duplicate feature template ID: ${featureId}.`
                );

                continue;

            }

            seenFeatures.add(
                normalizedFeatureId
            );

        }

        return {
            valid:
                errors.length === 0,

            errors
        };

    }

    public validateResolved(
        profile:
            ResolvedTemplateProfile
    ): TemplateProfileValidationResult {

        const errors:
            string[] = [];

        const baseRole =
            profile
                .baseTemplate
                .manifest
                .role ??
            "base";

        if (
            baseRole !==
            "base"
        ) {

            errors.push(
                [
                    "The resolved profile base template",
                    `"${profile.baseTemplate.manifest.id}"`,
                    "does not have the base role."
                ].join(" ")
            );

        }

        for (
            const feature
            of profile.featureTemplates
        ) {

            const role =
                feature.manifest.role ??
                "base";

            if (
                role !==
                "feature"
            ) {

                errors.push(
                    [
                        "The resolved profile feature template",
                        `"${feature.manifest.id}"`,
                        "does not have the feature role."
                    ].join(" ")
                );

            }

        }

        return {
            valid:
                errors.length === 0,

            errors
        };

    }

    private normalize(
        value: string
    ): string {

        return value
            .trim()
            .toLowerCase();

    }

}
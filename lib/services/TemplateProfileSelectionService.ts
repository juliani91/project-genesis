import {
    TemplateProfile
} from "../models";

export class TemplateProfileSelectionService {

    public findById(
        profiles:
            readonly TemplateProfile[],

        profileId:
            string
    ): TemplateProfile {

        const normalizedId =
            this.normalize(
                profileId
            );

        const profile =
            profiles.find(
                (candidate) =>
                    this.normalize(
                        candidate.id
                    ) ===
                    normalizedId
            );

        if (!profile) {

            throw new Error(
                `Unknown template profile: ${profileId}`
            );

        }

        return profile;

    }

    public sort(
        profiles:
            readonly TemplateProfile[]
    ): readonly TemplateProfile[] {

        return [
            ...profiles
        ].sort(
            (
                first,
                second
            ) => {

                const categoryComparison =
                    first.category.localeCompare(
                        second.category,
                        undefined,
                        {
                            sensitivity:
                                "base"
                        }
                    );

                if (
                    categoryComparison !==
                    0
                ) {

                    return categoryComparison;

                }

                return first.name.localeCompare(
                    second.name,
                    undefined,
                    {
                        sensitivity:
                            "base"
                    }
                );

            }
        );

    }

    private normalize(
        value: string
    ): string {

        return value
            .trim()
            .toLowerCase();

    }

}
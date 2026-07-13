import {
    TemplateProfile
} from "../models";

export class TemplateProfilePresenter {

    public format(
        profile: TemplateProfile
    ): string {

        const features =
            profile.featureTemplates.length > 0
                ? profile.featureTemplates.join(", ")
                : "None";

        return [
            "Profile Preview",
            "---------------",
            `Name        : ${profile.name}`,
            `Description : ${profile.description || "No description provided."}`,
            `Category    : ${profile.category}`,
            `Base        : ${profile.baseTemplate}`,
            `Features    : ${features}`
        ].join("\n");

    }

}
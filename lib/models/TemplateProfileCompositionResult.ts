import {
    CompatibilityReport
} from "./CompatibilityReport";

import {
    ResolvedTemplateProfile
} from "./ResolvedTemplateProfile";

import {
    TemplateCompositionPlan
} from "./TemplateCompositionPlan";

export interface TemplateProfileCompositionResult {

    resolvedProfile:
        ResolvedTemplateProfile;

    plan:
        TemplateCompositionPlan;

    compatibility:
        CompatibilityReport;

}
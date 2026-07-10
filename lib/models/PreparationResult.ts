import { PreparedTemplate } from "./PreparedTemplate";

export interface PreparationResult {
    success: boolean;

    template?: PreparedTemplate;

    errors: string[];
}
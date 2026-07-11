import { WizardOption } from "../models";

export interface PromptProvider {

    /**
     * Displays a free-text prompt and returns the response.
     */
    ask(
        message: string
    ): Promise<string>;

    /**
     * Displays a yes/no prompt and returns:
     *
     * "true" for yes
     * "false" for no
     */
    confirm(
        message: string
    ): Promise<string>;

    /**
     * Displays a list of choices and returns
     * the selected option value.
     */
    select(
        message: string,
        options: readonly WizardOption[]
    ): Promise<string>;

}
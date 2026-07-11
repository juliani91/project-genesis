export interface PromptProvider {

    /**
     * Displays a message and returns the supplied response.
     */
    ask(
        message: string
    ): Promise<string>;

}
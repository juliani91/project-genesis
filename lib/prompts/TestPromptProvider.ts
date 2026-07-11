import { PromptProvider } from "./PromptProvider";

export class TestPromptProvider
    implements PromptProvider {

    private readonly responses:
        string[];

    private readonly messages:
        string[] = [];

    public constructor(
        responses: readonly string[]
    ) {

        this.responses = [
            ...responses
        ];

    }

    public async ask(
        message: string
    ): Promise<string> {

        this.messages.push(message);

        const response =
            this.responses.shift();

        if (response === undefined) {

            throw new Error(
                `No test response is available for prompt: ${message}`
            );

        }

        return response.trim();

    }

    public getMessages():
    readonly string[] {

        return [
            ...this.messages
        ];

    }

}
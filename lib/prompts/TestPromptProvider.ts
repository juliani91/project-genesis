import { PromptProvider } from "./PromptProvider";
import { WizardOption } from "../models";

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

    public async confirm(
    message: string
    ): Promise<string> {

        return this.ask(message);

    }

    public async select(
    message: string,
    options: readonly WizardOption[]
): Promise<string> {

    if (options.length === 0) {

        throw new Error(
            `No options are available for prompt: ${message}`
        );

    }

    const response =
        await this.ask(message);

    const matchingOption =
        options.find(
            (option) =>
                option.value === response
        );

    if (!matchingOption) {

        throw new Error(
            [
                `Invalid test selection for prompt "${message}":`,
                response
            ].join(" ")
        );

    }

    return matchingOption.value;

}

}
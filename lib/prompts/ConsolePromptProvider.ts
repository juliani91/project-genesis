import {
    createInterface,
    Interface
} from "node:readline/promises";

import {
    stdin as input,
    stdout as output
} from "node:process";

import { PromptProvider } from "./PromptProvider";

export class ConsolePromptProvider
    implements PromptProvider {

    private readonly readline:
        Interface;

    public constructor() {

        this.readline =
            createInterface({
                input,
                output
            });

    }

    public async ask(
        message: string
    ): Promise<string> {

        const response =
            await this.readline.question(
                `${message} `
            );

        return response.trim();

    }

    public close(): void {

        this.readline.close();

    }

}
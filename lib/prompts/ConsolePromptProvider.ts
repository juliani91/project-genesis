import {
    createInterface,
    Interface
} from "node:readline/promises";

import {
    stdin as input,
    stdout as output
} from "node:process";

import { PromptProvider } from "./PromptProvider";
import { WizardOption } from "../models";

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

    public async confirm(
    message: string
): Promise<string> {

    while (true) {

        console.log(message);
        console.log("1) Yes");
        console.log("2) No");

        const response =
            await this.readline.question(
                "> "
            );

        const normalized =
            response.trim().toLowerCase();

        if (
            normalized === "1" ||
            normalized === "yes" ||
            normalized === "y"
        ) {

            return "true";

        }

        if (
            normalized === "2" ||
            normalized === "no" ||
            normalized === "n"
        ) {

            return "false";

        }

        console.log(
            "Please choose 1 for Yes or 2 for No."
        );

    }

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

    while (true) {

        console.log(message);

        options.forEach(
            (option, index) => {

                console.log(
                    `${index + 1}) ${option.label}`
                );

            }
        );

        const response =
            await this.readline.question(
                "> "
            );

        const selectedIndex =
            Number.parseInt(
                response.trim(),
                10
            ) - 1;

        if (
            Number.isInteger(
                selectedIndex
            ) &&
            selectedIndex >= 0 &&
            selectedIndex < options.length
        ) {

            return options[
                selectedIndex
            ].value;

        }

        console.log(
            `Please choose a number from 1 to ${options.length}.`
        );

    }

}

    public close(): void {

        this.readline.close();

    }

}
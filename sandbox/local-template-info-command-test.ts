import {
    PackageCommandDispatcher
} from "../lib/commands";

async function main(): Promise<void> {

    const output:
        string[] = [];

    const dispatcher =
        new PackageCommandDispatcher(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            (value) =>
                output.push(
                    value
                )
        );

    const templateIds = [
        "nextjs-app",
        "react-spa",
        "fastapi-service",
        "node-cli",
        "react-native-app",
        "unity-game",
        "godot-game",
        "project-genesis",
        "feature-docker",
        "feature-github-actions",
        "feature-postgresql",
        "feature-sqlite",
        "feature-playwright",
        "feature-pytest",
        "feature-auth",
        "feature-tailwind",
        "feature-mobile-navigation",
        "feature-game-design-docs",
        "feature-ai-workspace"
    ];

    const profileIds = [
        "web-saas-starter",
        "marketing-web-app",
        "frontend-dashboard",
        "api-service",
        "developer-cli",
        "mobile-app",
        "unity-game-jam",
        "godot-indie-game"
    ];

    for (
        const id
        of [
            ...templateIds,
            ...profileIds
        ]
    ) {

        const handled =
            await dispatcher.execute([
                "info",
                id
            ]);

        if (!handled) {

            throw new Error(
                `The info command was not handled for ${id}.`
            );

        }

        const currentOutput =
            output.at(
                -1
            ) ?? "";

        if (
            currentOutput.includes(
                "was not found"
            )
        ) {

            throw new Error(
                `The info command did not find ${id}.`
            );

        }

    }

    for (
        const id
        of templateIds
    ) {

        const handled =
            await dispatcher.execute([
                "install",
                id
            ]);

        if (!handled) {

            throw new Error(
                `The install command was not handled for ${id}.`
            );

        }

        const installOutput =
            output.at(
                -1
            ) ?? "";

        if (
            installOutput.includes(
                "was not found"
            ) ||
            !installOutput.includes(
                `Template : ${id}`
            ) ||
            !installOutput.includes(
                "Installed Package"
            )
        ) {

            throw new Error(
                `The install command did not install ${id}.`
            );

        }

    }

    const nextJsHandled =
        await dispatcher.execute([
            "info",
            "nextjs-app"
        ]);

    if (!nextJsHandled) {

        throw new Error(
            "The local template info command was not handled."
        );

    }

    const infoOutput =
        output.at(
            -1
        ) ?? "";

    const expectedValues = [
        'Template information for "nextjs-app".',
        "Local Template Information",
        "Template    : nextjs-app",
        "Name        : Next.js App",
        "Registry    : local",
        "Capabilities Provided",
        "- web",
        "- node",
        "Tags",
        "- nextjs"
    ];

    for (
        const expected
        of expectedValues
    ) {

        if (
            !infoOutput.includes(
                expected
            )
        ) {

            throw new Error(
                `Local template info output was missing: ${expected}`
            );

        }

    }

    const profileHandled =
        await dispatcher.execute([
            "info",
            "web-saas-starter"
        ]);

    if (!profileHandled) {

        throw new Error(
            "The local profile info command was not handled."
        );

    }

    const profileOutput =
        output.at(
            -1
        ) ?? "";

    const expectedProfileValues = [
        'Profile information for "web-saas-starter".',
        "Local Profile Information",
        "Profile     : web-saas-starter",
        "Base        : nextjs-app",
        "- feature-tailwind",
        "- feature-ai-workspace"
    ];

    for (
        const expected
        of expectedProfileValues
    ) {

        if (
            !profileOutput.includes(
                expected
            )
        ) {

            throw new Error(
                `Local profile info output was missing: ${expected}`
            );

        }

    }

    console.log(
        "Local template info, profile info, and template install commands verified."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Local template info command test failed.",
            error
        );

        process.exitCode =
            1;

    }
);

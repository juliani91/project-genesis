import {
    createHash
} from "crypto";

import {
    promises as fs
} from "fs";

import path from "path";

import {
    TemplatePackageHashService
} from "../lib/services";

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-package-hash-service-test"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    await fs.mkdir(
        root,
        {
            recursive: true
        }
    );

    const archivePath =
        path.join(
            root,
            "package.zip"
        );

    const contents =
        Buffer.from(
            "Project Genesis SHA-256 package test.",
            "utf-8"
        );

    await fs.writeFile(
        archivePath,
        contents
    );

    const expected =
        createHash(
            "sha256"
        )
            .update(
                contents
            )
            .digest(
                "hex"
            );

    const service =
        new TemplatePackageHashService();

    const actual =
        await service.calculateSha256(
            archivePath
        );

    if (
        actual !==
        expected
    ) {

        throw new Error(
            [
                "The calculated SHA-256 checksum was incorrect.",
                `Expected: ${expected}`,
                `Actual: ${actual}`
            ].join(" ")
        );

    }

    let missingThrown =
        false;

    try {

        await service.calculateSha256(
            path.join(
                root,
                "missing.zip"
            )
        );

    } catch (error) {

        missingThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Unable to calculate template package SHA-256"
            )
        ) {

            throw new Error(
                `Unexpected missing-file error: ${message}`
            );

        }

    }

    if (!missingThrown) {

        throw new Error(
            "A missing archive was accepted."
        );

    }

    console.log(
        "Template package hash service test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template package hash service test failed.",
            error
        );

        process.exitCode = 1;

    }
);
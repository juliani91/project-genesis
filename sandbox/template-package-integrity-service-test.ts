import {
    createHash
} from "crypto";

import { promises as fs } from "fs";
import path from "path";

import {
    TemplatePackageDownloadResult
} from "../lib/models";

import {
    TemplatePackageIntegrityService
} from "../lib/services";

function createDownload(
    archivePath:
        string,

    expectedSha256?:
        string
): TemplatePackageDownloadResult {

    return {
        templateId:
            "nextjs",

        version:
            "3.2.0",

        sourceUrl:
            "https://registry.example.com/nextjs.zip",

        archivePath,

        archiveFormat:
            "zip",

        sizeBytes:
            0,

        downloadedAt:
            new Date(),

        expectedSha256
    };

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-package-integrity-service-test"
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
            "template package integrity test",
            "utf-8"
        );

    await fs.writeFile(
        archivePath,
        contents
    );

    const expectedHash =
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
        new TemplatePackageIntegrityService();

    /*
     * Matching checksum.
     */
    const matchingResult =
        await service.verify(
            createDownload(
                archivePath,
                ` ${expectedHash.toUpperCase()} `
            )
        );

    if (
        !matchingResult.verified ||
        !matchingResult.valid
    ) {

        throw new Error(
            "A matching checksum was rejected."
        );

    }

    if (
        matchingResult.actualSha256 !==
        expectedHash
    ) {

        throw new Error(
            "The calculated SHA-256 value was incorrect."
        );

    }

    if (
        matchingResult.expectedSha256 !==
        expectedHash
    ) {

        throw new Error(
            "The expected SHA-256 value was not normalized."
        );

    }

    /*
     * Missing checksum remains valid but unverified.
     */
    const unverifiedResult =
        await service.verify(
            createDownload(
                archivePath
            )
        );

    if (
        unverifiedResult.verified
    ) {

        throw new Error(
            "A package without a checksum was marked as verified."
        );

    }

    if (
        !unverifiedResult.valid
    ) {

        throw new Error(
            "A package without a checksum was marked invalid."
        );

    }

    if (
        unverifiedResult.expectedSha256 !==
        undefined
    ) {

        throw new Error(
            "An unverified package unexpectedly received an expected checksum."
        );

    }

    /*
     * Mismatched checksum returns an invalid result.
     */
    const incorrectHash =
        "0".repeat(
            64
        );

    const mismatchResult =
        await service.verify(
            createDownload(
                archivePath,
                incorrectHash
            )
        );

    if (
        !mismatchResult.verified
    ) {

        throw new Error(
            "A mismatched checksum was not marked as verified."
        );

    }

    if (
        mismatchResult.valid
    ) {

        throw new Error(
            "A mismatched checksum was marked as valid."
        );

    }

    /*
     * Mismatched checksum throws in strict mode.
     */
    let mismatchThrown =
        false;

    try {

        await service.verifyOrThrow(
            createDownload(
                archivePath,
                incorrectHash
            )
        );

    } catch (error) {

        mismatchThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "checksum mismatch"
            )
        ) {

            throw new Error(
                `Unexpected checksum mismatch error: ${message}`
            );

        }

        if (
            !message.includes(
                incorrectHash
            ) ||
            !message.includes(
                expectedHash
            )
        ) {

            throw new Error(
                "The checksum mismatch error did not include both hashes."
            );

        }

    }

    if (!mismatchThrown) {

        throw new Error(
            "A checksum mismatch was not rejected in strict mode."
        );

    }

    /*
     * Invalid advertised checksum format.
     */
    let invalidChecksumThrown =
        false;

    try {

        await service.verify(
            createDownload(
                archivePath,
                "not-a-sha256"
            )
        );

    } catch (error) {

        invalidChecksumThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Invalid SHA-256 checksum"
            )
        ) {

            throw new Error(
                `Unexpected invalid-checksum error: ${message}`
            );

        }

    }

    if (!invalidChecksumThrown) {

        throw new Error(
            "An invalid SHA-256 checksum was accepted."
        );

    }

    /*
     * Missing archive.
     */
    let missingArchiveThrown =
        false;

    try {

        await service.verify(
            createDownload(
                path.join(
                    root,
                    "missing.zip"
                )
            )
        );

    } catch (error) {

        missingArchiveThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Unable to read template archive"
            )
        ) {

            throw new Error(
                `Unexpected missing-archive error: ${message}`
            );

        }

    }

    if (!missingArchiveThrown) {

        throw new Error(
            "A missing archive was accepted for verification."
        );

    }

    console.log(
        "Template package integrity service test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template package integrity service test failed.",
            error
        );

        process.exitCode = 1;

    }
);
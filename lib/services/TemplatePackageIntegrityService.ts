import {
    createHash
} from "crypto";

import {
    createReadStream
} from "fs";

import {
    TemplatePackageDownloadResult,
    TemplatePackageIntegrityResult
} from "../models";

export class TemplatePackageIntegrityService {

    public async verify(
        download:
            TemplatePackageDownloadResult
    ): Promise<TemplatePackageIntegrityResult> {

        const actualSha256 =
            await this.calculateSha256(
                download.archivePath
            );

        const expectedSha256 =
            download.expectedSha256
                ? this.normalizeSha256(
                    download.expectedSha256
                )
                : undefined;

        if (!expectedSha256) {

            return {
                archivePath:
                    download.archivePath,

                actualSha256,

                valid:
                    true,

                verified:
                    false
            };

        }

        return {
            archivePath:
                download.archivePath,

            actualSha256,

            expectedSha256,

            valid:
                actualSha256 ===
                expectedSha256,

            verified:
                true
        };

    }

    public async verifyOrThrow(
        download:
            TemplatePackageDownloadResult
    ): Promise<TemplatePackageIntegrityResult> {

        const result =
            await this.verify(
                download
            );

        if (!result.valid) {

            throw new Error(
                [
                    `Template package checksum mismatch for`,
                    `"${download.templateId}" version "${download.version}".`,
                    `Expected: ${result.expectedSha256}.`,
                    `Actual: ${result.actualSha256}.`
                ].join(" ")
            );

        }

        return result;

    }

    private async calculateSha256(
        archivePath:
            string
    ): Promise<string> {

        return new Promise<string>(
            (
                resolve,
                reject
            ) => {

                const hash =
                    createHash(
                        "sha256"
                    );

                const stream =
                    createReadStream(
                        archivePath
                    );

                stream.on(
                    "error",
                    (error) => {

                        reject(
                            new Error(
                                [
                                    "Unable to read template archive for checksum verification:",
                                    archivePath,
                                    error.message
                                ].join(" ")
                            )
                        );

                    }
                );

                stream.on(
                    "data",
                    (chunk) => {

                        hash.update(
                            chunk
                        );

                    }
                );

                stream.on(
                    "end",
                    () => {

                        resolve(
                            hash.digest(
                                "hex"
                            )
                        );

                    }
                );

            }
        );

    }

    private normalizeSha256(
        value:
            string
    ): string {

        const normalized =
            value
                .trim()
                .toLowerCase();

        if (
            !/^[a-f0-9]{64}$/.test(
                normalized
            )
        ) {

            throw new Error(
                [
                    "Invalid SHA-256 checksum:",
                    value
                ].join(" ")
            );

        }

        return normalized;

    }

}
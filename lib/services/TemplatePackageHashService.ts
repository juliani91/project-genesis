import {
    createHash
} from "crypto";

import {
    createReadStream
} from "fs";

export class TemplatePackageHashService {

    public async calculateSha256(
        archivePath: string
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
                                    "Unable to calculate template package SHA-256:",
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

}
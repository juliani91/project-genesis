import { promises as fs } from "fs";
import path from "path";

import {
    TemplatePackageDownloadResult
} from "../lib/models";

import {
    TemplatePackageExtractionService
} from "../lib/services";

async function createZip(
    sourceDirectory:
        string,

    archivePath:
        string
): Promise<void> {

    const {
        execFile
    } =
        await import(
            "child_process"
        );

    await new Promise<void>(
        (
            resolve,
            reject
        ) => {

            execFile(
                "powershell.exe",
                [
                    "-NoProfile",
                    "-Command",
                    [
                        "Compress-Archive",
                        "-Path",
                        `"${sourceDirectory}\\*"`,
                        "-DestinationPath",
                        `"${archivePath}"`,
                        "-Force"
                    ].join(" ")
                ],
                (error) =>
                    error
                        ? reject(error)
                        : resolve()
            );

        }
    );

}

function createDownload(
    archivePath:
        string
): TemplatePackageDownloadResult {

    return {
        templateId:
            "test-template",

        version:
            "1.0.0",

        sourceUrl:
            "https://registry.example.com/test-template.zip",

        archivePath,

        archiveFormat:
            "zip",

        sizeBytes:
            0,

        downloadedAt:
            new Date()
    };

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-package-extraction-service-test"
        );

    await fs.rm(
        root,
        {
            recursive: true,
            force: true
        }
    );

    const sourceDirectory =
        path.join(
            root,
            "source"
        );

    const archivePath =
        path.join(
            root,
            "package.zip"
        );

    const destinationPath =
        path.join(
            root,
            "extracted"
        );

    await fs.mkdir(
        path.join(
            sourceDirectory,
            "files",
            "src"
        ),
        {
            recursive: true
        }
    );

    await fs.writeFile(
        path.join(
            sourceDirectory,
            "genesis.json"
        ),
        JSON.stringify(
            {
                id:
                    "test-template",

                name:
                    "Test Template",

                version:
                    "1.0.0",

                description:
                    "",

                author:
                    "Test"
            },
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            sourceDirectory,
            "files",
            "src",
            "index.ts"
        ),
        "console.log('test');",
        "utf-8"
    );

    await createZip(
        sourceDirectory,
        archivePath
    );

    const service =
        new TemplatePackageExtractionService();

    const result =
        await service.extract({
            download:
                createDownload(
                    archivePath
                ),

            destinationPath
        });

    if (
        result.templateId !==
        "test-template"
    ) {

        throw new Error(
            "The extracted template ID was incorrect."
        );

    }

    if (
        result.version !==
        "1.0.0"
    ) {

        throw new Error(
            "The extracted template version was incorrect."
        );

    }

    if (
        !(result.extractedAt instanceof Date)
    ) {

        throw new Error(
            "The extraction timestamp was not a Date."
        );

    }

    if (
        result.fileCount !==
        2
    ) {

        throw new Error(
            [
                "The extracted file count was incorrect.",
                `Actual: ${result.fileCount}`
            ].join(" ")
        );

    }

    if (
        result.directoryCount <
        2
    ) {

        throw new Error(
            [
                "The extracted directory count was too small.",
                `Actual: ${result.directoryCount}`
            ].join(" ")
        );

    }

    await fs.access(
        path.join(
            destinationPath,
            "genesis.json"
        )
    );

    await fs.access(
        path.join(
            destinationPath,
            "files",
            "src",
            "index.ts"
        )
    );

    const contents =
        await fs.readFile(
            path.join(
                destinationPath,
                "files",
                "src",
                "index.ts"
            ),
            "utf-8"
        );

    if (
        contents !==
        "console.log('test');"
    ) {

        throw new Error(
            "The extracted file contents were incorrect."
        );

    }

    const rootEntries =
        await fs.readdir(
            root
        );

    if (
        rootEntries.some(
            (entry) =>
                entry.startsWith(
                    "extracted.tmp-"
                )
        )
    ) {

        throw new Error(
            "A temporary extraction directory remained after success."
        );

    }

    /*
     * A second extraction replaces the existing cache.
     */
    await fs.writeFile(
        path.join(
            sourceDirectory,
            "files",
            "src",
            "index.ts"
        ),
        "console.log('updated');",
        "utf-8"
    );

    await createZip(
        sourceDirectory,
        archivePath
    );

    await service.extract({
        download:
            createDownload(
                archivePath
            ),

        destinationPath
    });

    const updatedContents =
        await fs.readFile(
            path.join(
                destinationPath,
                "files",
                "src",
                "index.ts"
            ),
            "utf-8"
        );

    if (
        updatedContents !==
        "console.log('updated');"
    ) {

        throw new Error(
            "The existing extraction cache was not replaced."
        );

    }

    /*
     * Invalid archive is rejected and temporary
     * extraction output is removed.
     */
    const invalidArchivePath =
        path.join(
            root,
            "invalid.zip"
        );

    await fs.writeFile(
        invalidArchivePath,
        "not a zip archive",
        "utf-8"
    );

    let invalidArchiveThrown =
        false;

    try {

        await service.extract({
            download:
                createDownload(
                    invalidArchivePath
                ),

            destinationPath:
                path.join(
                    root,
                    "invalid-output"
                )
        });

    } catch (error) {

        invalidArchiveThrown =
            true;

        const message =
            error instanceof Error
                ? error.message
                : String(error);

        if (
            !message.includes(
                "Unable to extract template package"
            )
        ) {

            throw new Error(
                `Unexpected invalid-archive error: ${message}`
            );

        }

    }

    if (!invalidArchiveThrown) {

        throw new Error(
            "An invalid ZIP archive was accepted."
        );

    }

    const finalEntries =
        await fs.readdir(
            root
        );

    if (
        finalEntries.some(
            (entry) =>
                entry.startsWith(
                    "invalid-output.tmp-"
                )
        )
    ) {

        throw new Error(
            "A temporary extraction directory remained after failure."
        );

    }

    console.log(
        "Template package extraction service test completed successfully."
    );

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template package extraction service test failed.",
            error
        );

        process.exitCode = 1;

    }
);
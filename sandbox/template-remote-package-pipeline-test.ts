import {
    createHash
} from "crypto";

import {
    execFile
} from "child_process";

import {
    promises as fs
} from "fs";

import http from "http";
import path from "path";

import {
    GenerationRequest,
    RegistryTemplate
} from "../lib/models";

import {
    TestPromptProvider
} from "../lib/prompts";

import {
    ProjectGenerationService,
    TemplateDiscoveryService,
    TemplatePackageCacheService,
    TemplatePackagePreparationService,
    WizardRunner
} from "../lib/services";

async function createZip(
    sourceDirectory: string,
    archivePath: string
): Promise<void> {

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
                (error) => {

                    if (error) {

                        reject(
                            error
                        );

                        return;

                    }

                    resolve();

                }
            );

        }
    );

}

async function closeServer(
    server: http.Server
): Promise<void> {

    await new Promise<void>(
        (
            resolve,
            reject
        ) => {

            server.close(
                (error) => {

                    if (error) {

                        reject(
                            error
                        );

                        return;

                    }

                    resolve();

                }
            );

        }
    );

}

async function pathExists(
    targetPath: string
): Promise<boolean> {

    try {

        await fs.access(
            targetPath
        );

        return true;

    } catch {

        return false;

    }

}

async function prepareTemplateAnswers(
    template:
        Awaited<
            ReturnType<
                TemplatePackagePreparationService["prepare"]
            >
        >
): Promise<
    Awaited<
        ReturnType<
            WizardRunner["run"]
        >
    >
> {

    /*
     * Load the wizard descriptor because the package
     * preparation service initially loads only genesis.json.
     */
    const wizardPath =
        path.join(
            template.path,
            "wizard.json"
        );

    const wizardContents =
        await fs.readFile(
            wizardPath,
            "utf-8"
        );

    const wizard =
        JSON.parse(
            wizardContents
        );

    const promptProvider =
        new TestPromptProvider([
            "Remote Pipeline Test"
        ]);

    const wizardRunner =
        new WizardRunner();

    return wizardRunner.run(
        wizard,
        promptProvider
    );

}

async function generateProject(
    template:
        Awaited<
            ReturnType<
                TemplatePackagePreparationService["prepare"]
            >
        >,

    outputPath: string
): Promise<void> {

    const answers =
        await prepareTemplateAnswers(
            template
        );

    const request:
        GenerationRequest = {

        template,

        answers,

        outputPath
    };

    const generationService =
        new ProjectGenerationService();

    await generationService.generate(
        request
    );

}

async function verifyGeneratedProject(
    outputPath: string
): Promise<string> {

    if (
        !await pathExists(
            outputPath
        )
    ) {

        throw new Error(
            "The remote package pipeline did not create the output directory."
        );

    }

    const readmePath =
        path.join(
            outputPath,
            "README.md"
        );

    if (
        !await pathExists(
            readmePath
        )
    ) {

        throw new Error(
            "The remote package pipeline did not generate README.md."
        );

    }

    const readme =
        await fs.readFile(
            readmePath,
            "utf-8"
        );

    if (
        !readme.includes(
            "Project: Remote Pipeline Test"
        )
    ) {

        throw new Error(
            "The generated README did not contain the rendered project name."
        );

    }

    if (
        !readme.includes(
            "Generated from a downloaded Project Genesis template package."
        )
    ) {

        throw new Error(
            "The generated README did not contain the expected remote-package text."
        );

    }

    if (
        readme.includes(
            "{{PROJECT_NAME}}"
        ) ||
        readme.includes(
            "{{"
        )
    ) {

        throw new Error(
            "The generated README contained unresolved template variables."
        );

    }

    return readme;

}

async function main(): Promise<void> {

    const root =
        path.join(
            process.cwd(),
            "sandbox-output",
            "template-remote-package-pipeline-test"
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

    /*
     * Build a complete Project Genesis template package.
     */
    const sourceTemplatePath =
        path.join(
            root,
            "source-template"
        );

    const servedArchivePath =
        path.join(
            root,
            "remote-pipeline-template.zip"
        );

    await fs.mkdir(
        path.join(
            sourceTemplatePath,
            "files"
        ),
        {
            recursive: true
        }
    );

    /*
     * Template manifest.
     *
     * Include the established manifest properties so the
     * real preparation and generation pipeline can validate it.
     */
    await fs.writeFile(
        path.join(
            sourceTemplatePath,
            "genesis.json"
        ),
        JSON.stringify(
            {
                id:
                    "remote-pipeline-template",

                name:
                    "Remote Pipeline Template",

                description:
                    "Template used by the remote package pipeline test.",

                version:
                    "1.0.0",

                author:
                    "Project Genesis",

                category:
                    "Test",

                genesisVersion:
                    "0.17.0",

                tags: [
                    "remote",
                    "pipeline",
                    "test"
                ],

                capabilities: [],

                role:
                    "base",

                provides: [
                    "typescript",
                    "template-generation"
                ],

                requiresCapabilities: [],

                conflictsWith: [],

                minGenesisVersion:
                    "0.14.0",

                deprecated:
                    false
            },
            null,
            2
        ),
        "utf-8"
    );

    /*
     * Minimal wizard.
     */
    await fs.writeFile(
        path.join(
            sourceTemplatePath,
            "wizard.json"
        ),
        JSON.stringify(
            {
                title:
                    "Remote Package Pipeline",

                description:
                    "Collect values for the remote pipeline project.",

                steps: [
                    {
                        id:
                            "project",

                        title:
                            "Project",

                        description:
                            "Enter the project information.",

                        fields: [
                            {
                                key:
                                    "PROJECT_NAME",

                                label:
                                    "Project Name",

                                type:
                                    "string",

                                required:
                                    true
                            }
                        ]
                    }
                ]
            },
            null,
            2
        ),
        "utf-8"
    );

    /*
     * No explicit directories are required for this test.
     */
    await fs.writeFile(
        path.join(
            sourceTemplatePath,
            "folders.json"
        ),
        JSON.stringify(
            [],
            null,
            2
        ),
        "utf-8"
    );

    /*
     * One rendered README file.
     */
    await fs.writeFile(
        path.join(
            sourceTemplatePath,
            "files.json"
        ),
        JSON.stringify(
            [
                {
                    source:
                        "README.md",

                    destination:
                        "README.md",

                    mode:
                        "render"
                }
            ],
            null,
            2
        ),
        "utf-8"
    );

    await fs.writeFile(
        path.join(
            sourceTemplatePath,
            "files",
            "README.md"
        ),
        [
            "# Remote Package Project",
            "",
            "Project: {{PROJECT_NAME}}",
            "",
            "Generated from a downloaded Project Genesis template package."
        ].join("\n"),
        "utf-8"
    );

    /*
     * Package the complete template.
     */
    await createZip(
        sourceTemplatePath,
        servedArchivePath
    );

    const archiveBytes =
        await fs.readFile(
            servedArchivePath
        );

    const archiveSha256 =
        createHash(
            "sha256"
        )
            .update(
                archiveBytes
            )
            .digest(
                "hex"
            );

    let requestCount =
        0;

    const server =
        http.createServer(
            (
                _request,
                response
            ) => {

                requestCount++;

                response.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/zip",

                        "Content-Length":
                            archiveBytes.byteLength
                    }
                );

                response.end(
                    archiveBytes
                );

            }
        );

    await new Promise<void>(
        (resolve) => {

            server.listen(
                0,
                "127.0.0.1",
                resolve
            );

        }
    );

    try {

        const address =
            server.address();

        if (
            !address ||
            typeof address ===
                "string"
        ) {

            throw new Error(
                "The temporary remote package server did not start."
            );

        }

        const packageUrl =
            `http://127.0.0.1:${address.port}/remote-pipeline-template.zip`;

        /*
         * Use isolated cache locations so previous test
         * runs or the main Project Genesis cache cannot
         * influence this test.
         */
        const packageCacheDirectory =
            path.join(
                root,
                "package-cache"
            );

        const templateCacheDirectory =
            path.join(
                root,
                "template-cache"
            );

        const packageCacheService =
            new TemplatePackageCacheService(
                packageCacheDirectory,
                templateCacheDirectory
            );

        const preparationService =
            new TemplatePackagePreparationService(
                packageCacheService,
                new TemplateDiscoveryService()
            );

        const registryTemplate:
            RegistryTemplate = {

            templateId:
                "remote-pipeline-template",

            version:
                "1.0.0",

            name:
                "Remote Pipeline Template",

            description:
                "End-to-end remote package pipeline template.",

            downloadUrl:
                packageUrl,

            archiveFormat:
                "zip",

            sha256:
                archiveSha256
        };

        /*
         * Scenario 1:
         * Download, verify, extract, discover, and generate.
         */
        const firstTemplate =
            await preparationService.prepare(
                registryTemplate
            );

        if (
            firstTemplate.manifest.id !==
            "remote-pipeline-template"
        ) {

            throw new Error(
                "The prepared remote template ID was incorrect."
            );

        }

        if (
            firstTemplate.manifest.version !==
            "1.0.0"
        ) {

            throw new Error(
                "The prepared remote template version was incorrect."
            );

        }

        if (
            Number(
                requestCount
            ) !==
            1
        ) {

            throw new Error(
                [
                    "The initial remote package preparation made an unexpected number of requests.",
                    `Expected: 1`,
                    `Actual: ${requestCount}`
                ].join(" ")
            );

        }

        const firstOutputPath =
            path.join(
                root,
                "generated-first"
            );

        await generateProject(
            firstTemplate,
            firstOutputPath
        );

        const firstReadme =
            await verifyGeneratedProject(
                firstOutputPath
            );

        /*
         * Scenario 2:
         * Prepare and generate again using the package cache.
         */
        const secondTemplate =
            await preparationService.prepare(
                registryTemplate
            );

        if (
            Number(
                requestCount
            ) !==
            1
        ) {

            throw new Error(
                [
                    "The cached remote template was downloaded again.",
                    `Request count: ${requestCount}`
                ].join(" ")
            );

        }

        const secondOutputPath =
            path.join(
                root,
                "generated-second"
            );

        await generateProject(
            secondTemplate,
            secondOutputPath
        );

        const secondReadme =
            await verifyGeneratedProject(
                secondOutputPath
            );

        if (
            secondReadme !==
            firstReadme
        ) {

            throw new Error(
                "The cached remote package generated different project output."
            );

        }

        /*
         * Scenario 3:
         * Corrupt the extraction cache by deleting its manifest.
         */
        const cachedTemplatePath =
            packageCacheService.getTemplatePath(
                "remote-pipeline-template",
                "1.0.0"
            );

        const cachedManifestPath =
            path.join(
                cachedTemplatePath,
                "genesis.json"
            );

        await fs.rm(
            cachedManifestPath,
            {
                force: true
            }
        );

        if (
            await pathExists(
                cachedManifestPath
            )
        ) {

            throw new Error(
                "The cached template manifest was not removed."
            );

        }

        const rebuiltTemplate =
            await preparationService.prepare(
                registryTemplate
            );

        if (
            Number(
                requestCount
            ) !==
            2
        ) {

            throw new Error(
                [
                    "The corrupted extraction cache did not trigger a new package download.",
                    `Expected: 2`,
                    `Actual: ${requestCount}`
                ].join(" ")
            );

        }

        if (
            rebuiltTemplate.manifest.id !==
            "remote-pipeline-template"
        ) {

            throw new Error(
                "The rebuilt remote template ID was incorrect."
            );

        }

        if (
            !await pathExists(
                cachedManifestPath
            )
        ) {

            throw new Error(
                "The corrupted extraction cache was not rebuilt."
            );

        }

        const rebuiltOutputPath =
            path.join(
                root,
                "generated-rebuilt"
            );

        await generateProject(
            rebuiltTemplate,
            rebuiltOutputPath
        );

        const rebuiltReadme =
            await verifyGeneratedProject(
                rebuiltOutputPath
            );

        if (
            rebuiltReadme !==
            firstReadme
        ) {

            throw new Error(
                "The rebuilt remote package generated different project output."
            );

        }

        console.log(
            "Remote package download verified."
        );

        console.log(
            "SHA-256 verification completed."
        );

        console.log(
            "ZIP extraction completed."
        );

        console.log(
            "Template discovery completed."
        );

        console.log(
            "Project generation completed."
        );

        console.log(
            "Package cache reuse verified."
        );

        console.log(
            "Corrupted cache recovery verified."
        );

        console.log(
            "Template remote package pipeline test completed successfully."
        );

    } finally {

        await closeServer(
            server
        );

    }

}

main().catch(
    (error: unknown) => {

        console.error(
            "Template remote package pipeline test failed.",
            error
        );

        process.exitCode = 1;

    }
);
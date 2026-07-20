import {
    promises as fs
} from "fs";

import path from "path";

import {
    RegistryPublishManifest,
    TemplatePublishRequest,
    TemplatePublishValidationResult
} from "../models";

interface PackageIdentity {

    templateId:
        string;

    version:
        string;

}

interface ValidatedTemplatePublishRequest {

    request:
        TemplatePublishRequest;

    packageSizeBytes:
        number;

}

export class TemplatePublishValidationService {

    public async validate(
        request:
            TemplatePublishRequest,

        manifest?:
            RegistryPublishManifest
    ): Promise<TemplatePublishValidationResult> {

        const errors:
            string[] = [];

        const templateId =
            this.tryNormalizeIdentifier(
                request?.templateId,
                "Template ID",
                errors
            );

        const version =
            this.tryNormalizeIdentifier(
                request?.version,
                "Template version",
                errors
            );

        const registryId =
            this.tryNormalizeIdentifier(
                request?.registryId,
                "Registry ID",
                errors
            );

        const packagePath =
            this.tryNormalizePackagePath(
                request?.packagePath,
                errors
            );

        let packageSizeBytes:
            number | undefined;

        if (packagePath) {

            packageSizeBytes =
                await this.validatePackageFile(
                    packagePath,
                    errors
                );

        }

        if (
            packagePath &&
            templateId &&
            version
        ) {

            const identity =
                this.tryParsePackageIdentity(
                    packagePath,
                    errors
                );

            if (
                identity &&
                identity.templateId !==
                    templateId
            ) {

                errors.push(
                    [
                        "Published package template ID does not match its filename.",
                        `Expected: ${templateId}`,
                        `Filename ID: ${identity.templateId}`
                    ].join(" ")
                );

            }

            if (
                identity &&
                identity.version !==
                    version
            ) {

                errors.push(
                    [
                        "Published package version does not match its filename.",
                        `Expected: ${version}`,
                        `Filename version: ${identity.version}`
                    ].join(" ")
                );

            }

        }

        if (
            manifest &&
            registryId
        ) {

            const manifestRegistryId =
                this.tryNormalizeIdentifier(
                    manifest.registryId,
                    "Manifest registry ID",
                    errors
                );

            if (
                manifestRegistryId &&
                manifestRegistryId !==
                    registryId
            ) {

                errors.push(
                    [
                        "Publish request registry does not match the manifest registry.",
                        `Request: ${registryId}`,
                        `Manifest: ${manifestRegistryId}`
                    ].join(" ")
                );

            }

        }

        if (
            errors.length >
            0 ||
            !templateId ||
            !version ||
            !registryId ||
            !packagePath ||
            packageSizeBytes ===
                undefined
        ) {

            return {
                valid:
                    false,

                errors
            };

        }

        return {
            valid:
                true,

            errors: [],

            normalizedRequest: {
                templateId,

                version,

                registryId,

                packagePath
            },

            packageSizeBytes
        };

    }

    public async validateOrThrow(
        request:
            TemplatePublishRequest,

        manifest?:
            RegistryPublishManifest
    ): Promise<ValidatedTemplatePublishRequest> {

        const result =
            await this.validate(
                request,
                manifest
            );

        if (
            !result.valid ||
            !result.normalizedRequest ||
            result.packageSizeBytes ===
                undefined
        ) {

            throw new Error(
                [
                    "Template publish validation failed.",
                    ...result.errors.map(
                        (error) =>
                            `- ${error}`
                    )
                ].join("\n")
            );

        }

        return {
            request:
                result.normalizedRequest,

            packageSizeBytes:
                result.packageSizeBytes
        };

    }

    private tryNormalizeIdentifier(
        value:
            unknown,

        label:
            string,

        errors:
            string[]
    ): string | undefined {

        if (
            typeof value !==
            "string" ||
            !value.trim()
        ) {

            errors.push(
                `${label} is required.`
            );

            return undefined;

        }

        const normalized =
            value
                .trim()
                .toLowerCase();

        if (
            !/^[a-z0-9._-]+$/.test(
                normalized
            )
        ) {

            errors.push(
                [
                    `${label} contains unsupported characters:`,
                    value
                ].join(" ")
            );

            return undefined;

        }

        return normalized;

    }

    private tryNormalizePackagePath(
        value:
            unknown,

        errors:
            string[]
    ): string | undefined {

        if (
            typeof value !==
            "string" ||
            !value.trim()
        ) {

            errors.push(
                "Package path is required."
            );

            return undefined;

        }

        const packagePath =
            path.resolve(
                value.trim()
            );

        if (
            path.extname(
                packagePath
            ).toLowerCase() !==
            ".zip"
        ) {

            errors.push(
                [
                    "Publish package must use the .zip extension:",
                    packagePath
                ].join(" ")
            );

        }

        return packagePath;

    }

    private async validatePackageFile(
        packagePath:
            string,

        errors:
            string[]
    ): Promise<number | undefined> {

        let stat:
            Awaited<
                ReturnType<
                    typeof fs.stat
                >
            >;

        try {

            stat =
                await fs.stat(
                    packagePath
                );

        } catch {

            errors.push(
                [
                    "Publish package does not exist:",
                    packagePath
                ].join(" ")
            );

            return undefined;

        }

        if (
            !stat.isFile()
        ) {

            errors.push(
                [
                    "Publish package path is not a file:",
                    packagePath
                ].join(" ")
            );

            return undefined;

        }

        if (
            stat.size ===
            0
        ) {

            errors.push(
                [
                    "Publish package is empty:",
                    packagePath
                ].join(" ")
            );

            return undefined;

        }

        return stat.size;

    }

    private tryParsePackageIdentity(
        packagePath:
            string,

        errors:
            string[]
    ): PackageIdentity | undefined {

        const archiveName =
            path.basename(
                packagePath,
                path.extname(
                    packagePath
                )
            )
                .trim()
                .toLowerCase();

        const match =
            archiveName.match(
                /^(.+)-([0-9]+\.[0-9]+\.[0-9]+(?:[-+][a-z0-9.-]+)?)$/
            );

        const templateId =
            match?.[1];

        const version =
            match?.[2];

        if (
            !templateId ||
            !version
        ) {

            errors.push(
                [
                    "Publish package filename must follow",
                    '"<template-id>-<version>.zip":',
                    path.basename(
                        packagePath
                    )
                ].join(" ")
            );

            return undefined;

        }

        return {
            templateId,

            version
        };

    }

}
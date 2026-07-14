import {
    InstalledPackageCommandResult,
    PackageInstallationCommandResult,
    PackageRemovalCommandResult,
    PackageSearchCommandResult
} from "../lib/models";

function main(): void {

    const search:
        PackageSearchCommandResult = {

        success:
            true,

        message:
            "Search complete.",

        results: []

    };

    const installed:
        InstalledPackageCommandResult = {

        success:
            true,

        message:
            "Installed packages.",

        packages: []

    };

    const installedPackage = {

        templateId:
            "nextjs",

        version:
            "4.0.0",

        installPath:
            "templates/nextjs",

        sha256:
            "a".repeat(
                64
            ),

        source:
            "official",

        installedAt:
            new Date()

    };

    const installation:
        PackageInstallationCommandResult = {

        success:
            true,

        message:
            "Installed.",

        package:
            installedPackage

    };

    const removal:
        PackageRemovalCommandResult = {

        success:
            true,

        message:
            "Removed.",

        removed:
            installedPackage

    };

    if (
        !search.success ||
        !installed.success ||
        !installation.success ||
        !removal.success
    ) {

        throw new Error(
            "Package command models were not created correctly."
        );

    }

    console.log(
        "Package command models verified."
    );

}

main();
import {
    PackageInstallCommand
} from "./PackageInstallCommand";

import {
    PackageInstallEnvironmentVariable
} from "./PackageInstallEnvironmentVariable";

import {
    PackageInstallStep
} from "./PackageInstallStep";

export interface PackageInstallDescriptor {

    title:
        string;

    description:
        string;

    packageManager?:
        string;

    prerequisites:
        readonly string[];

    installSteps:
        readonly PackageInstallStep[];

    runCommands:
        readonly PackageInstallCommand[];

    verifyCommands:
        readonly PackageInstallCommand[];

    environmentVariables:
        readonly PackageInstallEnvironmentVariable[];

    notes:
        readonly string[];

}

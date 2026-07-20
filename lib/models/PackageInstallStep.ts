import {
    PackageInstallCommand
} from "./PackageInstallCommand";

export interface PackageInstallStep {

    title:
        string;

    description:
        string;

    commands:
        readonly PackageInstallCommand[];

}

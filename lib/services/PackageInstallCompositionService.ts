import {
    PackageInstallDescriptor
} from "../models";

export class PackageInstallCompositionService {

    public compose(
        descriptors:
            readonly (PackageInstallDescriptor | undefined)[]
    ): PackageInstallDescriptor | undefined {

        const available =
            descriptors.filter(
                (
                    descriptor
                ): descriptor is PackageInstallDescriptor =>
                    Boolean(
                        descriptor
                    )
            );

        const base =
            available[0];

        if (!base) {
            return undefined;
        }

        const environmentVariables =
            new Map(
                base.environmentVariables.map(
                    (variable) => [
                        variable.key,
                        variable
                    ]
                )
            );

        for (
            const descriptor
            of available.slice(
                1
            )
        ) {

            for (
                const variable
                of descriptor.environmentVariables
            ) {

                if (
                    !environmentVariables.has(
                        variable.key
                    )
                ) {

                    environmentVariables.set(
                        variable.key,
                        variable
                    );

                }

            }

        }

        return {
            title:
                base.title,

            description:
                base.description,

            packageManager:
                base.packageManager,

            prerequisites:
                this.unique([
                    ...available.flatMap(
                        (descriptor) =>
                            descriptor.prerequisites
                    )
                ]),

            installSteps:
                available.flatMap(
                    (descriptor) =>
                        descriptor.installSteps
                ),

            runCommands:
                available.flatMap(
                    (descriptor) =>
                        descriptor.runCommands
                ),

            verifyCommands:
                available.flatMap(
                    (descriptor) =>
                        descriptor.verifyCommands
                ),

            environmentVariables: [
                ...environmentVariables.values()
            ],

            notes:
                this.unique(
                    available.flatMap(
                        (descriptor) =>
                            descriptor.notes
                    )
                )
        };

    }

    private unique(
        values:
            readonly string[]
    ): string[] {

        return [
            ...new Set(
                values.filter(
                    (value) =>
                        value.trim().length > 0
                )
            )
        ];

    }

}

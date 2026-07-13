export interface SemanticVersion {

    major: number;

    minor: number;

    patch: number;

}

export class SemanticVersionService {

    public parse(
        value: string
    ): SemanticVersion {

        const normalized =
            value.trim();

        const match =
            /^(\d+)\.(\d+)\.(\d+)$/.exec(
                normalized
            );

        if (!match) {

            throw new Error(
                `Invalid semantic version: ${value}`
            );

        }

        return {
            major:
                Number(
                    match[1]
                ),

            minor:
                Number(
                    match[2]
                ),

            patch:
                Number(
                    match[3]
                )
        };

    }

    public compare(
        first: string,
        second: string
    ): number {

        const firstVersion =
            this.parse(
                first
            );

        const secondVersion =
            this.parse(
                second
            );

        if (
            firstVersion.major !==
            secondVersion.major
        ) {

            return (
                firstVersion.major -
                secondVersion.major
            );

        }

        if (
            firstVersion.minor !==
            secondVersion.minor
        ) {

            return (
                firstVersion.minor -
                secondVersion.minor
            );

        }

        return (
            firstVersion.patch -
            secondVersion.patch
        );

    }

    public satisfies(
        version: string,
        constraint: string
    ): boolean {

        const normalizedConstraint =
            constraint.trim();

        if (!normalizedConstraint) {

            throw new Error(
                "Semantic version constraint cannot be blank."
            );

        }

        const operatorMatch =
            /^(>=|<=|>|<|\^|~)?\s*(\d+\.\d+\.\d+)$/.exec(
                normalizedConstraint
            );

        if (!operatorMatch) {

            throw new Error(
                `Invalid semantic version constraint: ${constraint}`
            );

        }

        const operator =
            operatorMatch[1] ??
            "=";

        const target =
            operatorMatch[2];

        const comparison =
            this.compare(
                version,
                target
            );

        switch (operator) {

            case "=":
                return comparison === 0;

            case ">=":
                return comparison >= 0;

            case "<=":
                return comparison <= 0;

            case ">":
                return comparison > 0;

            case "<":
                return comparison < 0;

            case "^":
                return this.satisfiesCaret(
                    version,
                    target
                );

            case "~":
                return this.satisfiesTilde(
                    version,
                    target
                );

            default:
                throw new Error(
                    `Unsupported semantic version operator: ${operator}`
                );

        }

    }

    private satisfiesCaret(
        version: string,
        target: string
    ): boolean {

        const current =
            this.parse(
                version
            );

        const required =
            this.parse(
                target
            );

        if (
            this.compare(
                version,
                target
            ) < 0
        ) {
            return false;
        }

        if (
            required.major > 0
        ) {

            return (
                current.major ===
                required.major
            );

        }

        if (
            required.minor > 0
        ) {

            return (
                current.major === 0 &&
                current.minor ===
                    required.minor
            );

        }

        return (
            current.major === 0 &&
            current.minor === 0 &&
            current.patch ===
                required.patch
        );

    }

    private satisfiesTilde(
        version: string,
        target: string
    ): boolean {

        const current =
            this.parse(
                version
            );

        const required =
            this.parse(
                target
            );

        if (
            this.compare(
                version,
                target
            ) < 0
        ) {
            return false;
        }

        return (
            current.major ===
                required.major &&
            current.minor ===
                required.minor
        );

    }

}
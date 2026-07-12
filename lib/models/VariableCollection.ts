export class VariableCollection {
    private readonly variables = new Map<string, string>();

    set(key: string, value: string): void {
        this.variables.set(key, value);
    }

    get(key: string): string | undefined {
        return this.variables.get(key);
    }

    has(key: string): boolean {
        return this.variables.has(key);
    }

    toObject(): Record<string, string> {
        return Object.fromEntries(this.variables);
    }

    public resolve(contents: string): string {

    return contents.replace(
        /\{\{([A-Z0-9_]+)\}\}/g,
        (
            originalPlaceholder,
            variableName: string
        ) => {

            const value =
                this.variables.get(variableName);

            return value ??
                originalPlaceholder;

        }
    );

}
public setIfMissing(
    key: string,
    value: string
): boolean {

    if (this.variables.has(key)) {
        return false;
    }

    this.variables.set(
        key,
        value
    );

    return true;

}
}
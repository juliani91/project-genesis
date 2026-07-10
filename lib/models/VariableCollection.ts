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
}
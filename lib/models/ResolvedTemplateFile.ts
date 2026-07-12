import { FileDescriptor } from "./FileDescriptor";

export interface ResolvedTemplateFile {

    /**
     * File descriptor participating in the resolved template.
     */
    descriptor: FileDescriptor;

    /**
     * Absolute path of the template package that owns
     * the descriptor's source file.
     */
    templatePath: string;

}
import { FileDescriptor } from "./FileDescriptor";
import { FolderDescriptor } from "./FolderDescriptor";
import { Wizard } from "./Wizard";

export interface TemplateDescriptors {
    wizard?: Wizard;

    folders?: FolderDescriptor[];

    files?: FileDescriptor[];
}
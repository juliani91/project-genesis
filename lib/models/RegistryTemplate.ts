import {
    TemplateArchiveFormat
} from "./TemplateArchiveFormat";

export interface RegistryTemplate {

    /**
     * Template identifier.
     */
    templateId: string;

    /**
     * Template version.
     */
    version: string;

    /**
     * Human-readable name.
     */
    name: string;

    /**
     * Optional description.
     */
    description?: string;

    /**
     * URL from which the template package may be downloaded.
     *
     * Local registry entries may omit this property.
     */
    downloadUrl?: string;

    /**
     * Archive format used by the downloadable package.
     */
    archiveFormat?: TemplateArchiveFormat;

    /**
     * Optional SHA-256 integrity value.
     *
     * The actual verification service will be added
     * in a future sprint.
     */
    sha256?: string;

}
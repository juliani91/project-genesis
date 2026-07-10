import { discoverTemplates } from "./TemplateDiscoveryService";

export async function getTemplates() {
    return await discoverTemplates();
}
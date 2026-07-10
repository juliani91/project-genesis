import { TemplatePackage } from "../models";
import { TemplateDiscoveryService } from "./TemplateDiscoveryService";

export class TemplateService {

    async getTemplates(): Promise<TemplatePackage[]> {

        const discoveryService = new TemplateDiscoveryService();

        return await discoveryService.discover();

    }

}
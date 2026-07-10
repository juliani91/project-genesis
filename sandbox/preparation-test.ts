import { discoverTemplates } from "../lib/services/TemplateDiscoveryService";
import { PreparationService } from "../lib/services/PreparationService";

async function main() {

    const templates = await discoverTemplates();

    console.log(`Discovered ${templates.length} template(s).`);

    if (templates.length === 0) {
        console.log("No templates found.");
        return;
    }

    const preparationService = new PreparationService();

    const result = await preparationService.prepare(templates[0]);

    console.log(result);

}

main().catch(console.error);
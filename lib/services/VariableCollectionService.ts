import { VariableCollection } from "../models/VariableCollection";
import { TemplatePackage } from "../models/TemplatePackage";

export class VariableCollectionService {

    collect(
        template: TemplatePackage
    ): VariableCollection {

        // Sprint 4:
        // No wizard execution yet.
        // Return an empty collection.

        return new VariableCollection();

    }

}
import {
    TemplatePackage,
    VariableCollection
} from "../models";

export class VariableCollectionService {

    public collect(
        template: TemplatePackage
    ): VariableCollection {

        // Temporary compatibility path for older callers that
        // do not yet provide WizardAnswer collections.
        void template;

        return new VariableCollection();

    }

}
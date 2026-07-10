import { TemplatePackage } from "./TemplatePackage";
import { VariableCollection } from "./VariableCollection";

export interface PreparedTemplate {
    template: TemplatePackage;

    variables: VariableCollection;

    preparedAt: Date;
}
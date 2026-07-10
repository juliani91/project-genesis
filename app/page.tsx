import { TemplateService } from "@/lib/services/TemplateService";

export default async function Home() {

    const templateService = new TemplateService();

    const templates =
        await templateService.getTemplates();


    return (
        <main className="p-10">
            <h1 className="text-4xl font-bold mb-8">
                Project Genesis
            </h1>

            <h2 className="text-xl mb-6">
                Installed Templates
            </h2>

            <div className="space-y-6">
                {templates.map((templatePackage) => (
                    <div
                        key={templatePackage.manifest.id}
                        className="border rounded-lg p-6"
                    >
                        <h3 className="text-2xl font-semibold">
                            {templatePackage.manifest.name}
                        </h3>

                        <p className="mt-2">
                            {templatePackage.manifest.description}
                        </p>

                        <div className="mt-4 text-sm text-gray-500">
                            Version {templatePackage.manifest.version}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
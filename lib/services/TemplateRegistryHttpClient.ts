import {
    RemoteRegistryResponse,
    TemplateRegistryManifest
} from "../models";

export class TemplateRegistryHttpClient {

    public async fetchManifest(
        url: string
    ): Promise<RemoteRegistryResponse> {

        let response: Response;

        try {

            response =
                await fetch(
                    url,
                    {
                        headers: {
                            Accept:
                                "application/json"
                        }
                    }
                );

        } catch (error) {

            throw new Error(
                [
                    "Unable to contact remote registry:",
                    url,
                    error instanceof Error
                        ? error.message
                        : String(error)
                ].join(" ")
            );

        }

        if (!response.ok) {

            throw new Error(
                [
                    "Remote registry returned HTTP",
                    String(response.status),
                    response.statusText
                ].join(" ")
            );

        }

        let manifest:
            TemplateRegistryManifest;

        try {

            manifest =
                await response.json() as TemplateRegistryManifest;

        } catch {

            throw new Error(
                [
                    "Remote registry returned invalid JSON:",
                    url
                ].join(" ")
            );

        }

        return {

            sourceUrl:
                response.url,

            statusCode:
                response.status,

            retrievedAt:
                new Date(),

            manifest

        };

    }

}
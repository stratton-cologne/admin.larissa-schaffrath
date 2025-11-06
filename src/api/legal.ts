import api from "@/lib/axios";

export type LegalPage = {
    slug: "impressum" | "datenschutz";
    title: string;
    content: string;
    is_published: boolean;
};

export async function getLegal(
    slug: "impressum" | "datenschutz",
): Promise<LegalPage> {
    const { data } = await api.get(`/api/legal/${slug}`);
    return data;
}
export async function updateLegal(
    slug: "impressum" | "datenschutz",
    payload: Partial<LegalPage>,
): Promise<LegalPage> {
    const { data } = await api.put(`/api/legal/${slug}`, payload);
    return data;
}

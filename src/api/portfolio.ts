import api from "@/lib/axios";

export type Socials = {
    instagram?: string | null;
    flickr?: string | null;
    facebook?: string | null;
    twitter?: string | null;
};

export type Portfolio = {
    id?: number;
    name: string;
    tagline?: string | null;
    location?: string | null;
    about?: string | null;
    avatar_media_id?: number | null;
    socials: Socials; // <-- Pflichtfeld
    is_published: boolean;
    avatar?: {
        id: number;
        current_version?: { mime_type?: string; original_name?: string };
    } | null;
};

export async function getPortfolio(): Promise<Portfolio | null> {
    const res = await api.get("/api/portfolio");
    return (
        res.data && Object.keys(res.data).length ? res.data : null
    ) as Portfolio | null;
}

export async function updatePortfolio(payload: Portfolio): Promise<Portfolio> {
    const res = await api.put("/api/portfolio", payload);
    return res.data;
}

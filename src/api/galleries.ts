import axios from "@/lib/axios";

// --- Types ---
export type Category = {
    id: number;
    name: string;
    slug: string;
    parent_id?: number | null;
};
export type GalleryImage = {
    id: number;
    media_id: number;
    caption?: string;
    position: number;
    media: {
        id: number;
        uuid: string;
        current_version?: { mime_type?: string; original_name: string };
    };
    categories: Category[];
};
export type Gallery = {
    id: number;
    title: string;
    slug: string;
    description?: string;
    is_published: boolean;
    images_count?: number;
    images?: GalleryImage[];
};

// --- Galleries ---
export async function listGalleries(params?: {
    page?: number;
    perPage?: number;
    search?: string;
}) {
    const { data } = await axios.get("/api/galleries", { params });
    return data;
}
export async function createGallery(payload: {
    title: string;
    description?: string;
    is_published?: boolean;
}) {
    const { data } = await axios.post("/api/galleries", payload, {
        meta: { successToast: "Galerie erstellt" },
    });
    return data as Gallery;
}
export async function getGallery(id: number) {
    const { data } = await axios.get(`/api/galleries/${id}`);
    return data as Gallery;
}
export async function updateGallery(
    id: number,
    payload: Partial<Pick<Gallery, "title" | "description" | "is_published">>,
) {
    const { data } = await axios.put(`/api/galleries/${id}`, payload, {
        meta: { successToast: "Gespeichert" },
    });
    return data as Gallery;
}
export async function deleteGallery(id: number) {
    await axios.delete(`/api/galleries/${id}`, {
        meta: { successToast: "Galerie gelöscht" },
    });
}

// --- Images in Gallery ---
export async function addGalleryImage(
    galleryId: number,
    payload: {
        media_id: number;
        caption?: string;
        position?: number;
        categories?: number[];
    },
) {
    const { data } = await axios.post(
        `/api/galleries/${galleryId}/images`,
        payload,
        { meta: { successToast: "Bild hinzugefügt" } },
    );
    return data as GalleryImage;
}
export async function updateGalleryImage(
    galleryId: number,
    imageId: number,
    payload: {
        caption?: string;
        position?: number;
        categories?: number[];
    },
) {
    const { data } = await axios.put(
        `/api/galleries/${galleryId}/images/${imageId}`,
        payload,
        { meta: { successToast: "Bild aktualisiert" } },
    );
    return data as GalleryImage;
}
export async function removeGalleryImage(galleryId: number, imageId: number) {
    await axios.delete(`/api/galleries/${galleryId}/images/${imageId}`, {
        meta: { successToast: "Bild entfernt" },
    });
}

// --- Categories ---
export async function listCategories() {
    const { data } = await axios.get<Category[]>("/api/categories");
    return data;
}
export async function createCategory(payload: {
    name: string;
    parent_id?: number | null;
}) {
    const { data } = await axios.post<Category>("/api/categories", payload, {
        meta: { successToast: "Kategorie erstellt" },
    });
    return data;
}
export async function updateCategory(
    id: number,
    payload: { name: string; parent_id?: number | null },
) {
    const { data } = await axios.put<Category>(
        `/api/categories/${id}`,
        payload,
        { meta: { successToast: "Kategorie gespeichert" } },
    );
    return data;
}
export async function deleteCategory(id: number) {
    await axios.delete(`/api/categories/${id}`, {
        meta: { successToast: "Kategorie gelöscht" },
    });
}

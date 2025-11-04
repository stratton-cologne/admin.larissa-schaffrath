import axios from "@/lib/axios";

export type MediaVersion = {
    id: number;
    version: number;
    original_name: string;
    mime_type?: string;
    size: number;
    width?: number;
    height?: number;
    created_at: string;
};
export type MediaItem = {
    id: number;
    uuid: string;
    title?: string | null;
    collection?: string;
    current_version_id?: number;
    current_version?: MediaVersion;
    versions?: MediaVersion[];
    deleted_at?: string;
};

export type FileLike = Blob | File;

export async function listMedia(params?: {
    collection?: string;
    page?: number;
    perPage?: number;
    withVersions?: boolean;
}) {
    const { data } = await axios.get("/api/media", { params });
    return data;
}

export async function uploadMedia(
    file: FileLike,
    payload?: { title?: string; collection?: string },
) {
    const fd = new FormData();
    const name = (file as File).name ?? "upload.bin";
    fd.append("file", file, name);
    if (payload?.title) fd.append("title", payload.title);
    if (payload?.collection) fd.append("collection", payload.collection);
    const { data } = await axios.post("/api/media", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        meta: { successToast: "Upload erfolgreich" },
    });
    return data as MediaItem;
}

export async function uploadVersion(id: number, file: FileLike) {
    const fd = new FormData();
    const name = (file as File).name ?? "upload.bin";
    fd.append("file", file, name);
    const { data } = await axios.post(`/api/media/${id}/versions`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        meta: { successToast: "Neue Version gespeichert" },
    });
    return data as MediaItem;
}

export async function setCurrentVersion(id: number, version: number) {
    const { data } = await axios.put(
        `/api/media/${id}/versions/${version}/current`,
        null,
        {
            meta: { successToast: "Version aktiviert" },
        },
    );
    return data as MediaItem;
}

export async function updateMedia(
    id: number,
    payload: { title?: string; collection?: string },
) {
    const { data } = await axios.put(`/api/media/${id}`, payload, {
        meta: { successToast: "Änderungen gespeichert" },
    });
    return data as MediaItem;
}

export async function trash(id: number) {
    await axios.delete(`/api/media/${id}`, {
        meta: { successToast: "In Papierkorb verschoben" },
    });
}

export async function listDeleted() {
    const { data } = await axios.get("/api/media/deleted");
    return data as MediaItem[];
}

export async function restore(id: number) {
    await axios.put(`/api/media/${id}/restore`, null, {
        meta: { successToast: "Wiederhergestellt" },
    });
}

export async function forceDelete(id: number) {
    await axios.delete(`/api/media/${id}/force`, {
        meta: { successToast: "Endgültig gelöscht" },
    });
}

export function downloadUrl(id: number, version?: number) {
    const qs = version ? `?version=${version}` : "";
    return `/api/media/${id}/download${qs}`;
}

export async function fetchMediaBlob(id: number, version?: number) {
    const url = downloadUrl(id, version);
    const resp = await axios.get(url, { responseType: "blob" });
    return resp.data as Blob;
}

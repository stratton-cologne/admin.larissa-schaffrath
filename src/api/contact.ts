import api from "@/lib/axios";

export type Contact = {
    email?: string | null;
    phone?: string | null;
    headline?: string | null;
    subline?: string | null;
    interest_label?: string | null;
    interests?: string[] | null;
    is_published: boolean;
};

export async function getContact(): Promise<Contact | null> {
    const res = await api.get("/api/contact");
    return res.data && Object.keys(res.data).length ? res.data : null;
}

export async function updateContact(payload: Contact): Promise<Contact> {
    const res = await api.put("/api/contact", payload);
    return res.data;
}

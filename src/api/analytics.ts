import axios from "@/lib/axios";

export type AnalyticsSummary = {
    todayViews: number;
    monthViews: number;
    avgDurationSec: number;
    uniqueSessionsMonth: number;
    deltaTodayVsYesterdayPct: number | null;
    // NEU:
    uniqueSessionsToday?: number; // optional für Deploy-Rennen
    uniqueIPsToday?: number; // NEU
    uniqueIPsMonth?: number; // NEU
};

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
    const { data } = await axios.get("/api/analytics/summary", {
        meta: { silent: true },
    });
    return data as AnalyticsSummary;
}

// export async function fetchAnalyticsSummary() {
//     const { data } = await axios.get<AnalyticsSummary>(
//         "/api/analytics/summary",
//         {
//             meta: { silent: true },
//         },
//     );
//     return data;
// }

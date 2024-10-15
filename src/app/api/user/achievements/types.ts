export type AchievementsResponse = {
    id: string;
    name: string;
    icon: string;
    desc: string;
    progress: number;
    max_progress: number;
    completed: boolean;
}[];

import { expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Achievements from "./page";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useAchievements } from "@/hooks/useAchievements";

// Mocking dependencies
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

vi.mock("@/hooks/useUser", () => ({
    useUser: vi.fn(),
}));

vi.mock("@/hooks/useAchievements", () => ({
    useAchievements: vi.fn(),
}));

vi.mock("@/hooks/useEffectAsync", () => ({
    useEffectAsync: vi.fn((callback) => callback()),
}));

vi.mock("recharts", () => ({
    ResponsiveContainer: vi.fn(({ children }) => children),
    PieChart: vi.fn(({ children }) => children),
    Pie: vi.fn(),
    Cell: vi.fn(),
}));

// Mock SVG for AchievementTree
vi.mock("next/image", () => ({
    default: vi.fn(() => null),
}));

test("Achievements page renders loading state", () => {
    vi.mocked(useUser).mockReturnValue({ loadingUser: true, user: null });
    vi.mocked(useAchievements).mockReturnValue({
        achievements: [],
        loading: true,
        error: null,
    });

    render(<Achievements />);

    expect(screen.getByText("Loading...")).toBeDefined();
});

test("Achievements page redirects to login if user is not logged in", async () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: null });
    vi.mocked(useAchievements).mockReturnValue({
        achievements: [],
        loading: false,
        error: null,
    });

    render(<Achievements />);

    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
    });
});

test("Achievements page renders achievements data", async () => {
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: { id: "1" } });
    vi.mocked(useAchievements).mockReturnValue({
        achievements: [
            {
                achievement_id: "1",
                achievement_name: "Test Achievement",
                achievement_desc: "Test Description",
                completed: true,
                progress: 100,
                max_progress: 100,
                icon: "🏆",
            },
            {
                achievement_id: "2",
                achievement_name: "In Progress Achievement",
                achievement_desc: "Another Test Description",
                completed: false,
                progress: 50,
                max_progress: 100,
                icon: "🌟",
            },
        ],
        loading: false,
        error: null,
    });

    render(<Achievements />);

    await waitFor(() => {
        expect(screen.getByText("Achievements")).toBeDefined();
        expect(screen.getByText("Test Achievement")).toBeDefined();
        expect(screen.getByText("In Progress Achievement")).toBeDefined();
        expect(screen.getByText("Test Description")).toBeDefined();
        expect(screen.getByText("Another Test Description")).toBeDefined();
        expect(screen.getByText("100%")).toBeDefined();
        expect(screen.getByText("50%")).toBeDefined();
    });
});

test("Achievements page renders PieChart with correct data", async () => {
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: { id: "1" } });
    vi.mocked(useAchievements).mockReturnValue({
        achievements: [
            { achievement_id: "1", completed: true, progress: 100, max_progress: 100 },
            { achievement_id: "2", completed: false, progress: 50, max_progress: 100 },
        ],
        loading: false,
        error: null,
    });

    render(<Achievements />);

    await waitFor(() => {
        const pieChartElement = document.querySelector("svg");
        expect(pieChartElement).toBeDefined();
    });
});

test("Achievements page renders AchievementTree", async () => {
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: { id: "1" } });
    vi.mocked(useAchievements).mockReturnValue({
        achievements: [
            { achievement_id: "1", completed: true, progress: 100, max_progress: 100 },
            { achievement_id: "2", completed: false, progress: 50, max_progress: 100 },
        ],
        loading: false,
        error: null,
    });

    render(<Achievements />);

    await waitFor(() => {
        const svgElement = document.querySelector("svg");
        expect(svgElement).toBeDefined();
        expect(svgElement?.getAttribute("width")).toBe("200");
        expect(svgElement?.getAttribute("height")).toBe("300");
    });
});

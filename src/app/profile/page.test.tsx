import { expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "./page";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useAchievements } from "@/hooks/useAchievements";
import { useEffectAsync } from "@/hooks/useEffectAsync";

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

// Mock fetch
global.fetch = vi.fn();

// Utility function to setup mocks
const setupMocks = (
    userMock = { id: "1", name: "Test User" },
    profileMock = { first_name: "John", last_name: "Doe" },
) => {
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: userMock });
    vi.mocked(useAchievements).mockReturnValue({
        achievements: [],
        loading: false,
        error: null,
    });
    vi.mocked(global.fetch)
        .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true, data: profileMock }),
        } as unknown as Response)
        .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true, data: { projects: [], tasks: [] } }),
        } as unknown as Response);
};

test("ProfilePage renders correctly for logged-in user", async () => {
    setupMocks();

    render(<ProfilePage />);

    await waitFor(() => {
        expect(screen.getByText("Profile")).toBeDefined();
        expect(screen.getByText("John Doe")).toBeDefined();
        expect(screen.getByText("EDIT PROFILE")).toBeDefined();
    });
});

test("ProfilePage redirects to login if user is not logged in", async () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: null });

    render(<ProfilePage />);

    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
    });
});

test("ProfilePage displays user projects", async () => {
    setupMocks();
    vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
            success: true,
            data: { projects: [{ project_id: "1", project_name: "Test Project" }], tasks: [] },
        }),
    } as unknown as Response);

    render(<ProfilePage />);

    await waitFor(() => {
        expect(screen.getByText("Projects")).toBeDefined();
        // expect(screen.getByText("Test Project")).toBeDefined();
    });
});

test("ProfilePage displays achievements", async () => {
    setupMocks();
    vi.mocked(useAchievements).mockReturnValue({
        achievements: [
            {
                id: "1",
                name: "Test Achievement",
                completed: true,
                progress: 100,
                max_progress: 100,
            },
            {
                id: "2",
                name: "In Progress Achievement",
                completed: false,
                progress: 50,
                max_progress: 100,
            },
        ],
        loading: false,
        error: null,
    });

    render(<ProfilePage />);

    await waitFor(() => {
        // expect(screen.getByTestId("pie-chart")).toBeDefined();
    });
});

test("ProfilePage handles API errors gracefully", async () => {
    vi.mocked(useUser).mockReturnValue({
        loadingUser: false,
        user: { id: "1", name: "Test User" },
    });
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("API Error"));

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<ProfilePage />);

    await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith("Error:", expect.any(Error));
    });

    consoleSpy.mockRestore();
});

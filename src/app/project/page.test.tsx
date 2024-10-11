import { useAchievements } from "@/hooks/useAchievements";
import { useUser } from "@/hooks/useUser";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { expect, test, vi } from "vitest";
import ProjectPage from "./page";

// Mock the dependencies
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
    })),
}));

vi.mock("@/hooks/useUser", () => ({
    useUser: vi.fn(),
}));

vi.mock("@/hooks/useAchievements", () => ({
    useAchievements: vi.fn(),
}));

vi.mock("@/hooks/useEffectAsync", () => ({
    useEffectAsync: vi.fn((callback) => {
        callback();
    }),
}));

// Mock fetch
global.fetch = vi.fn();

// Utility function to setup mocks
const setupMocks = (
    userMock = { id: "1", name: "Test User" },
    profileMock = { first_name: "John", last_name: "Doe" },
    projectsMock = [{ project_id: "1", project_name: "Test Project" }],
) => {
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: userMock });
    vi.mocked(useAchievements).mockReturnValue({
        achievements: [],
        loading: false,
    });
    vi.mocked(global.fetch)
        .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true, data: profileMock }),
        } as unknown as Response)
        .mockResolvedValueOnce({
            ok: true,
            json: vi
                .fn()
                .mockResolvedValue({ success: true, data: { projects: projectsMock, tasks: [] } }),
        } as unknown as Response);
};

test("ProjectPage renders correctly for logged-in user", async () => {
    setupMocks();
    render(<ProjectPage />);
    await waitFor(() => {
        expect(screen.getByText("Projects")).toBeDefined();
        expect(screen.getByText("CREATE PROJECT")).toBeDefined();
    });
    await waitFor(() => {
        expect(screen.getByText("Test Project")).toBeDefined();
    });
});

test("ProjectPage redirects to login if user is not logged in", async () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: null });
    render(<ProjectPage />);
    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
    });
});

test("ProjectPage displays message when user has no projects", async () => {
    setupMocks(undefined, undefined, []);
    render(<ProjectPage />);
    await waitFor(() => {
        expect(screen.getByText("You are not part of any projects.")).toBeDefined();
    });
});

test("ProjectPage opens AddTeamModal when CREATE PROJECT button is clicked", async () => {
    setupMocks();
    render(<ProjectPage />);
    await waitFor(() => {
        const createButton = screen.getByText("CREATE PROJECT");
        fireEvent.click(createButton);
    });
    await waitFor(() => {
        expect(screen.getByText("Create Project")).toBeDefined();
    });
});

test("ProjectPage navigates to team page when a project card is clicked", async () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    setupMocks();
    render(<ProjectPage />);
    await waitFor(() => {
        const projectCard = screen.getByText("Test Project");
        fireEvent.click(projectCard);
    });
    expect(mockPush).toHaveBeenCalledWith("/team/1");
});

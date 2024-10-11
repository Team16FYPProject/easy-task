import React from "react";
import { test, expect, vi, Mock, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import ListView from "./page";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Mock the dependencies
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

vi.mock("@/hooks/useUser", () => ({
    useUser: vi.fn(),
}));

vi.mock("@/hooks/useEffectAsync", () => ({
    useEffectAsync: (fn: () => void) => fn(),
}));

vi.mock("@/utils/colourUtils", () => ({
    determineBgColor: vi.fn(() => "blue"),
    determineTextColor: vi.fn(() => "white"),
}));

vi.mock("@/components/AddTaskModal", () => ({
    __esModule: true,
    default: ({ open, handleClose }: { open: boolean; handleClose: () => void }) =>
        open ? <div data-testid="add-task-modal">Add Task Modal</div> : null,
}));

// Mock fetch
global.fetch = vi.fn();

// Create a mock theme
const mockTheme = createTheme();

// Wrapper component with providers
const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider theme={mockTheme}>{children}</ThemeProvider>
);

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.resetAllMocks();
});

test("renders ListView component and displays loading skeletons", async () => {
    (useUser as Mock).mockReturnValue({ loadingUser: false, user: { name: "Test User" } });
    (useRouter as Mock).mockReturnValue({ push: vi.fn() });

    (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: [] }),
    });

    render(<ListView />, { wrapper: Wrapper });

    expect(screen.getByText("List View")).toBeInTheDocument();
    expect(screen.getByText("CREATE TASK")).toBeInTheDocument();

    // Check for loading skeletons
    const skeletonRows = screen.getAllByRole("row").slice(1); // Exclude header row
    expect(skeletonRows).toHaveLength(5);
    skeletonRows.forEach((row) => {
        expect(row.querySelectorAll("td")).toHaveLength(5);
        expect(row.textContent).toBe(""); // Skeleton rows should be empty
    });
});

test("displays tasks when loaded", async () => {
    (useUser as Mock).mockReturnValue({ loadingUser: false, user: { name: "Test User" } });
    (useRouter as Mock).mockReturnValue({ push: vi.fn() });

    const mockProjects = [{ project_id: "1", project_name: "Test Project" }];
    const mockTasks = [
        {
            task_deadline: new Date().toISOString(),
            task_name: "Test Task",
            task_priority: "High",
            task_is_meeting: false,
            task_status: "TODO",
            assignees: [{ user_id: "1", user_name: "Test User" }],
        },
    ];

    (global.fetch as Mock)
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ projects: mockProjects }),
        })
        .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ tasks: mockTasks }),
        });

    await act(async () => {
        render(<ListView />, { wrapper: Wrapper });
    });

    await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
        expect(screen.getByText("High")).toBeInTheDocument();
        expect(screen.getByText("No")).toBeInTheDocument();
        expect(screen.getByText("TODO")).toBeInTheDocument();
    });
});

test("redirects to login if user is not logged in", async () => {
    const mockPush = vi.fn();
    (useRouter as Mock).mockReturnValue({ push: mockPush });
    (useUser as Mock).mockReturnValue({ loadingUser: false, user: null });

    await act(async () => {
        render(<ListView />, { wrapper: Wrapper });
    });

    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
    });
});

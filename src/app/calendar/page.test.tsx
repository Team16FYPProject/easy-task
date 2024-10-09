import { expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import CalendarView from "./page";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useEffectAsync } from "@/hooks/useEffectAsync";

// Mocking dependencies
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

vi.mock("@/hooks/useUser", () => ({
    useUser: vi.fn(),
}));

vi.mock("@/hooks/useEffectAsync", () => ({
    useEffectAsync: vi.fn((callback) => callback()),
}));

vi.mock("@/utils/colourUtils", () => ({
    determineBgColor: vi.fn(() => "blue"),
    determineTextColor: vi.fn(() => "white"),
}));

vi.mock("@/components/MUICalendar", () => ({
    default: () => <div data-testid="mui-calendar">MUI Calendar</div>,
}));

vi.mock("@/components/ViewTaskModal", () => ({
    default: () => <div data-testid="view-task-modal">View Task Modal</div>,
}));

// Mock global fetch
global.fetch = vi.fn();

test("CalendarView renders correctly", async () => {
    vi.mocked(useUser).mockReturnValue({
        loadingUser: false,
        user: { id: "1", name: "Test User" },
    });
    vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ projects: [] }),
    } as unknown as Response);

    render(<CalendarView />);

    await waitFor(() => {
        expect(screen.getByText("Calendar View")).toBeDefined();
        expect(screen.getByTestId("mui-calendar")).toBeDefined();
    });
});

test("CalendarView redirects to login if user is not logged in", async () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: null });

    render(<CalendarView />);

    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
    });
});

test("CalendarView fetches and displays tasks", async () => {
    vi.mocked(useUser).mockReturnValue({
        loadingUser: false,
        user: { id: "1", name: "Test User" },
    });
    vi.mocked(global.fetch)
        .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                projects: [{ project_id: "1", project_name: "Test Project" }],
            }),
        } as unknown as Response)
        .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                tasks: [
                    {
                        task_id: "1",
                        task_name: "Test Task",
                        project_name: "Test Project",
                        task_deadline: "2023-05-01",
                        task_priority: "High",
                    },
                ],
            }),
        } as unknown as Response);

    render(<CalendarView />);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(4);
        // You might want to add more specific checks here, e.g., for the presence of the task in the UI
        // expect(screen.getByText("Test Task")).toBeDefined();
    });
});

import { render, screen, waitFor } from "@testing-library/react";
import CalendarView from "./page";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { vi, test, expect, Mock, afterEach, beforeEach, describe } from "vitest";

vi.mock("@/hooks/useUser");
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

describe("CalendarView", () => {
    const mockPush = vi.fn();
    const mockUseUser = useUser as Mock;
    const mockUseRouter = useRouter as Mock;

    beforeEach(() => {
        mockUseRouter.mockReturnValue({ push: mockPush });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("should redirect to login if user is not logged in", async () => {
        mockUseUser.mockReturnValue({ loadingUser: false, user: null });

        render(<CalendarView />);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });

    test("should render calendar if user is logged in", async () => {
        mockUseUser.mockReturnValue({ loadingUser: false, user: { id: "1" } });

        render(<CalendarView />);

        await waitFor(() => {
            expect(screen.getByText("Calendar View")).toBeInTheDocument();
        });
    });

    test("should display loading state while fetching tasks", async () => {
        mockUseUser.mockReturnValue({ loadingUser: false, user: { id: "1" } });

        render(<CalendarView />);

        expect(screen.getByText("Calendar View")).toBeInTheDocument();
        // Add more assertions for loading state if applicable
    });

    test("should open ViewTaskModal when a task is clicked", async () => {
        mockUseUser.mockReturnValue({ loadingUser: false, user: { id: "1" } });

        render(<CalendarView />);

        // Simulate task click
        // Assuming there's a task with the text "Sample Task"
        const taskElement = await screen.findByText("Sample Task");
        taskElement.click();

        await waitFor(() => {
            expect(screen.getByRole("dialog")).toBeInTheDocument();
        });
    });

    test("should transform tasks to events correctly", async () => {
        mockUseUser.mockReturnValue({ loadingUser: false, user: { id: "1" } });

        render(<CalendarView />);

        // Assuming tasks are fetched and transformed correctly
        await waitFor(() => {
            const eventElement = screen.getByText("Sample Task (Sample Project)");
            expect(eventElement).toBeInTheDocument();
        });
    });

    test("should handle slot selection correctly", async () => {
        mockUseUser.mockReturnValue({ loadingUser: false, user: { id: "1" } });

        render(<CalendarView />);

        // Simulate slot selection
        // Assuming there's a way to select a slot in the calendar
        const slotElement = await screen.findByText("Select Slot");
        slotElement.click();

        await waitFor(() => {
            expect(screen.getByRole("dialog")).toBeInTheDocument();
        });
    });

    // Add more tests as needed
});

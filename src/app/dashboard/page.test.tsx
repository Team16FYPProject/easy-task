// This file contains tests for the Dashboard page component
import Dashboard from "@/app/dashboard/page";
import { useUser } from "@/hooks/useUser";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { expect, test, vi } from "vitest";

// Mock the hooks and modules
vi.mock("@/hooks/useUser");
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));
vi.mock("@mui/x-data-grid", () => ({
    DataGrid: vi.fn(({ rows, columns }) => (
        <div data-testid="data-grid">
            {rows.map((row: any) => (
                <div key={row.id}>
                    {columns.map((column: any) => (
                        <div key={column.field}>
                            {column.renderCell({ value: row[column.field] })}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )),
}));
vi.mock("@/components/AddTeamModal", () => ({
    default: vi.fn(({ open }) =>
        open ? <div role="dialog">Create New Project Modal Content</div> : null,
    ),
}));
vi.mock("@/components/TeamCard", () => ({
    default: vi.fn(({ title }) => <div data-testid="team-card">{title}</div>),
}));

// Setup function to mock fetch and router
const setup = () => {
    const mockRouter = { push: vi.fn() };
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useUser).mockReturnValue({
        loadingUser: false,
        user: { id: "1", name: "Test User" },
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url === "/api/user/dashboard") {
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        success: true,
                        data: {
                            projects: [{ project_id: "1", project_name: "Test Project" }],
                            tasks: [
                                {
                                    task_id: "1",
                                    task_name: "Test Task",
                                    project_id: "1",
                                    task_priority: "MEDIUM",
                                    task_deadline: "2023-06-01",
                                    task_is_meeting: false,
                                    task_status: "In Progress",
                                },
                            ],
                        },
                    }),
            });
        }
        if (url.includes("/api/projects")) {
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        projects: [{ project_id: "1", project_name: "Test Project" }],
                        tasks: [
                            {
                                task_id: "1",
                                task_name: "Test Task",
                                project_id: "1",
                                task_priority: "MEDIUM",
                                task_deadline: "2023-06-01",
                                task_is_meeting: false,
                                task_status: "In Progress",
                            },
                        ],
                    }),
            });
        }
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: [] }),
        });
    }) as any;

    return { mockRouter };
};

test("Dashboard renders correctly when user is logged in", async () => {
    setup();
    render(<Dashboard />);

    await waitFor(() => {
        expect(screen.getByText("Projects")).toBeDefined();
        expect(screen.getByText("CREATE PROJECT")).toBeDefined();
        expect(screen.getByText("Available Views")).toBeDefined();
        expect(screen.getByText("Upcoming Tasks")).toBeDefined();
    });
});

test("Dashboard redirects to login when user is not logged in", async () => {
    const { mockRouter } = setup();
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: null });

    render(<Dashboard />);

    await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
});

test("AddTeamModal opens when CREATE PROJECT button is clicked", async () => {
    setup();
    render(<Dashboard />);

    const createButton = await screen.findByText("CREATE PROJECT");
    fireEvent.click(createButton);

    await waitFor(() => {
        expect(screen.getByText("Create New Project Modal Content")).toBeDefined();
    });
});

test("Dashboard renders project cards correctly", async () => {
    setup();
    render(<Dashboard />);

    await waitFor(() => {
        expect(screen.getByTestId("data-grid")).toBeDefined();
        expect(screen.getByTestId("team-card")).toBeDefined();
        expect(screen.getByText("Test Project")).toBeDefined();
    });
});

test("Dashboard renders upcoming tasks correctly", async () => {
    setup();
    render(<Dashboard />);

    await waitFor(() => {
        expect(screen.getByText("Test Project: Test Task")).toBeDefined();
        expect(screen.getByText("MEDIUM")).toBeDefined();
    });
});

test("Dashboard navigates to correct page when view buttons are clicked", async () => {
    const { mockRouter } = setup();
    render(<Dashboard />);

    const calendarButton = await screen.findByText("CALENDAR VIEW");
    fireEvent.click(calendarButton);
    expect(mockRouter.push).toHaveBeenCalledWith("/calendar");

    const listButton = screen.getByText("LIST VIEW");
    fireEvent.click(listButton);
    expect(mockRouter.push).toHaveBeenCalledWith("/listView");

    const kanbanButton = screen.getByText("KANBAN VIEW");
    fireEvent.click(kanbanButton);
    expect(mockRouter.push).toHaveBeenCalledWith("/kanban");
});

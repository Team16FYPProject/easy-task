import { expect, test, vi, Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Kanban from "@/app/kanban/page";
import { useRouter } from "next/router";
import { useUser } from "@/hooks/useUser";
import AddTaskModal from "@/app/kanban/AddTaskModal";

// Mock the hooks and modules
vi.mock("@/hooks/useUser");
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));
vi.mock("@/components/Kanban", () => ({
    KanbanBoard: vi.fn(({ projects }) => (
        <div data-testid="kanban-board">
            {projects.map((project: any) => (
                <div key={project.project_id} data-testid="project-card">
                    {project.project_name}
                </div>
            ))}
        </div>
    )),
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
        if (url === "/api/projects/1/tasks") {
            return Promise.resolve({
                ok: true,
                status: 201,
                json: () =>
                    Promise.resolve({
                        success: true,
                        data: { taskName: "New Task", taskDeadline: "11-11-2099 00:00 PM" },
                    }),
            });
        }
        return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ success: false }),
        });
    }) as Mock;

    return { mockRouter };
};

test("Add Task Works", async () => {
    // Arrange
    const { mockRouter } = setup();

    render(
        <AddTaskModal
            open={true}
            handleClose={vi.fn()}
            project_id="1"
            setUpdatedTask={vi.fn()}
            projectTasks={[{ task_id: "123", task_name: "Test Task" }]}
        />,
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Task Name/i), { target: { value: "New Task" } });
    fireEvent.change(screen.getByLabelText(/Task Deadline/i), {
        target: { value: "11-11-2099 00:00 PM" },
    });
    fireEvent.change(screen.getByLabelText(/Task Priority/i), { target: { value: "HIGH" } });
    fireEvent.change(screen.getByLabelText(/Task Status/i), { target: { value: "TODO" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Assert that the fetch call was made with the correct payload
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/projects/1/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                taskName: "New Task",
                taskDescription: null,
                taskDeadline: new Date("11-11-2099 00:00 PM").toISOString(),
                taskPriority: "HIGH",
                taskParent: null,
                taskStatus: "TODO",
                taskMeetingBool: false,
                taskLocation: null,
                taskDuration: null,
                taskAssignee: null,
            }),
        });
    });

    // Assert that the form submission resulted in a successful 201 response
    await waitFor(() => {
        expect(global.fetch).toHaveReturnedWith(expect.objectContaining({ status: 201 }));
    });
});

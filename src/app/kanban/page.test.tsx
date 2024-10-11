import { expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Kanban from "@/app/kanban/page";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

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
        if (url === "/api/projects") {
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        success: true,
                        projects: [{ project_id: "1", project_name: "Test Project" }],
                    }),
            });
        }
        return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ success: false }),
        });
    }) as any;

    return { mockRouter };
};

test("Kanban renders correctly when user is logged in", async () => {
    setup();
    render(<Kanban />);

    await waitFor(() => {
        expect(screen.getByTestId("kanban-board")).toBeDefined();
        expect(screen.getByTestId("project-card")).toBeDefined();
        expect(screen.getByText("Test Project")).toBeDefined();
    });
});

test("Kanban redirects to login when user is not logged in", async () => {
    const { mockRouter } = setup();
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: null });

    render(<Kanban />);

    await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
});

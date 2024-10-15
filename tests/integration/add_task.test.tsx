import { expect, test, vi, Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import AddTaskModal from "@/components/AddTaskModal";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

// Mock the hooks and modules
vi.mock("@/hooks/useUser");
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

// Setup function to mock fetch and router
const setup = () => {
    const mockRouter = { push: vi.fn() };
    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useUser).mockReturnValue({
        loadingUser: false,
        user: {
            id: "1",
            app_metadata: {},
            user_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
        },
    });

    global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url === "/api/projects/1/tasks") {
            return Promise.resolve({
                ok: true,
                status: 201,
                json: () =>
                    Promise.resolve({
                        success: true,
                        data: { taskName: "New Task", taskDeadline: "2099-11-11T00:00:00.000Z" },
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
    setup();

    render(
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AddTaskModal
                open={true}
                handleClose={vi.fn()}
                project_id="1"
                setUpdatedTask={vi.fn()}
                projectTasks={[
                    {
                        task_id: "123",
                        task_name: "Test Task",
                        project_id: "1",
                        task_creator_id: "1",
                        task_deadline: "2099-11-11T00:00:00.000Z",
                        task_desc: "Test Task Description",
                        task_priority: "HIGH",
                        task_status: "TODO",
                        task_is_meeting: false,
                        task_location: "",
                        task_parent_id: "",
                        task_time_spent: 0,
                        assignees: [],
                        reminders: [],
                        project: undefined,
                    },
                ]}
            />
        </LocalizationProvider>,
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Task Name/i), { target: { value: "New Task" } });

    // Fill out other fields
    fireEvent.change(screen.getByLabelText(/Task Description/i), {
        target: { value: "New Task Description" },
    });

    // For Task Parent, assuming it's a select input
    fireEvent.mouseDown(screen.getByLabelText(/Task Parent/i));
    fireEvent.click(screen.getByText(/Test Task/i));

    // For Location
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: "Office" } });

    // For Designate Meeting
    fireEvent.mouseDown(screen.getByLabelText(/Designate Meeting/i));
    fireEvent.click(screen.getByText(/False/i));

    // For select inputs, we need to use a different approach
    fireEvent.mouseDown(screen.getByLabelText(/Task Status/i));
    fireEvent.click(screen.getByText(/TODO/i));

    fireEvent.mouseDown(screen.getByLabelText(/Task Priority/i));
    fireEvent.click(screen.getByText(/HIGH/i));

    // For DateTimePicker, we need to use a different approach
    const dateInput = screen.getByLabelText(/Task Deadline/i);
    fireEvent.change(dateInput, { target: { value: "11/11/2099 12:00 AM" } });

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
                taskDescription: "New Task Description",
                taskDeadline: dayjs("2099-11-11T00:00:00.000Z").toISOString(),
                taskPriority: "HIGH",
                taskParent: "123",
                taskStatus: "TODO",
                taskMeetingBool: false,
                taskLocation: "Office",
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

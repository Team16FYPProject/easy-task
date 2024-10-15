import { useUser } from "@/hooks/useUser";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";
import TeamMembers from "./page";

// Mock the hooks and modules
vi.mock("@/hooks/useUser");
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));
vi.mock("@/components/TeamSettingsModal", () => ({
    default: () => <div data-testid="team-settings-modal" />,
}));
vi.mock("@/components/InviteMemberModal", () => ({
    default: () => <div data-testid="invite-member-modal" />,
}));

// Mock fetch
global.fetch = vi.fn();

describe("TeamMembers Component", () => {
    const mockUser = {
        id: "1",
        name: "Test User",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
    };
    const mockProject = { project_name: "Test Project", project_desc: "Test Description" };
    const mockMembers = [
        { user_id: "1", first_name: "John", last_name: "Doe", email: "john@example.com" },
        { user_id: "2", first_name: "Jane", last_name: "Doe", email: "jane@example.com" },
    ];

    beforeEach(() => {
        vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: mockUser });
        vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as any);
        vi.mocked(global.fetch).mockResolvedValue({
            json: vi.fn().mockResolvedValue({
                success: true,
                data: { project: mockProject, members: mockMembers },
            }),
        } as any);
    });

    test("renders TeamMembers component", async () => {
        render(<TeamMembers params={{ id: "1" }} />);

        await waitFor(() => {
            expect(screen.getByText(/Project Test Project Members/i)).toBeDefined();
            expect(screen.getByText("Test Description")).toBeDefined();
            expect(screen.getByText("John Doe")).toBeDefined();
            expect(screen.getByText("Jane Doe")).toBeDefined();
        });
    });

    test("search functionality works", async () => {
        render(<TeamMembers params={{ id: "1" }} />);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeDefined();
            expect(screen.getByText("Jane Doe")).toBeDefined();
        });

        const searchInput = screen.getByLabelText("Search");
        fireEvent.change(searchInput, { target: { value: "John" } });

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeDefined();
            expect(screen.queryByText("Jane Doe")).toBeNull();
        });
    });

    test("invites new member", async () => {
        render(<TeamMembers params={{ id: "1" }} />);

        const inviteButton = screen.getByText("INVITE MEMBER");
        fireEvent.click(inviteButton);

        await waitFor(() => {
            expect(screen.getByTestId("invite-member-modal")).toBeDefined();
        });
    });

    test("opens settings modal", async () => {
        render(<TeamMembers params={{ id: "1" }} />);

        const settingsButton = screen.getByRole("button", { name: "" }); // Settings button has no text, just an icon
        fireEvent.click(settingsButton);

        await waitFor(() => {
            expect(screen.getByTestId("team-settings-modal")).toBeDefined();
        });
    });

    test("leaves team", async () => {
        const mockRouter = { push: vi.fn() };
        vi.mocked(useRouter).mockReturnValue(mockRouter as any);

        // Mock user
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

        // Reset the fetch mock to clear previous calls
        vi.mocked(global.fetch).mockReset();

        // Use mockImplementation instead of mockResolvedValue to handle multiple calls
        vi.mocked(global.fetch).mockImplementation((url, options) => {
            if (url === "/api/projects/1" && options?.method === "GET") {
                return Promise.resolve({
                    json: () =>
                        Promise.resolve({
                            success: true,
                            data: { project: mockProject, members: mockMembers },
                        }),
                }) as Promise<Response>;
            } else if (url === "/api/projects/1/members/1" && options?.method === "DELETE") {
                return Promise.resolve({
                    json: () => Promise.resolve({ success: true }),
                }) as Promise<Response>;
            }
            return Promise.reject(new Error("Unhandled request"));
        });

        render(<TeamMembers params={{ id: "1" }} />);

        // Wait for the initial data to load
        await waitFor(() => {
            expect(screen.getByText("Project Test Project Members")).toBeDefined();
        });

        // Verify that the initial GET request was made
        expect(global.fetch).toHaveBeenCalledWith("/api/projects/1", {
            method: "GET",
        });

        // Mock the confirm dialog
        const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

        const leaveButton = screen.getByText("LEAVE PROJECT");
        fireEvent.click(leaveButton);

        await waitFor(() => {
            // Check for the DELETE request
            expect(global.fetch).toHaveBeenCalledWith("/api/projects/1/members/1", {
                method: "DELETE",
            });
        });

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
        });

        // Restore the original confirm dialog
        confirmSpy.mockRestore();
    });

    test("removes a member", async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue({
                success: true,
                data: {
                    project: mockProject,
                    members: mockMembers,
                },
            }),
        } as any);

        render(<TeamMembers params={{ id: "1" }} />);

        // Wait for the component to finish rendering and data to load
        await waitFor(() => {
            expect(screen.getByText("Project Test Project Members")).toBeDefined();
        });

        // Find the table body specifically
        const tableBody = screen.getByRole("table").querySelector("tbody");
        expect(tableBody).not.toBeNull();

        // Find Jane Doe's row
        const janeDoeRow = within(tableBody!).getByText("Jane Doe").closest("tr");

        expect(janeDoeRow).not.toBeNull();

        // Find the REMOVE button in Jane Doe's row
        const removeButton = within(janeDoeRow!).getByText("REMOVE");
        expect(removeButton).toBeDefined();

        // Mock the DELETE request for removing a member
        vi.mocked(global.fetch).mockResolvedValueOnce({
            json: vi.fn().mockResolvedValue({ success: true }),
        } as any);

        // Click the remove button for Jane Doe
        fireEvent.click(removeButton);

        // Mock the confirm dialog
        vi.spyOn(window, "confirm").mockReturnValue(true);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith("/api/projects/1/members/1", {
                method: "DELETE",
            });
        });
    });
});

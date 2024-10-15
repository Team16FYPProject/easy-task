import { useUser } from "@/hooks/useUser";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { expect, test, vi } from "vitest";
import UpdateProfile from "./page";

// Mocking dependencies
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
    })),
}));

vi.mock("@/hooks/useUser", () => ({
    useUser: vi.fn(),
}));

vi.mock("@/hooks/useEffectAsync", () => ({
    useEffectAsync: vi.fn((callback) => callback()),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Utility function to setup mocks
const setupMocks = (
    userMock = {
        id: "1",
        name: "Test User",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
    },
) => {
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: userMock });
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
            Promise.resolve({
                success: true,
                data: {
                    first_name: "John",
                    last_name: "Doe",
                    email: "john@example.com",
                    profile_bio: "Test bio",
                },
            }),
    });
};

test("UpdateProfile renders correctly for logged-in user", async () => {
    setupMocks();

    render(<UpdateProfile />);

    await waitFor(() => {
        expect(screen.getByText("Settings")).toBeDefined();
        expect(screen.getByText("Account")).toBeDefined();
        expect(screen.getByText("Security")).toBeDefined();
        expect(screen.getByLabelText("First Name")).toBeDefined();
        expect(screen.getByLabelText("Last Name")).toBeDefined();
        expect(screen.getByLabelText("Email Address *")).toBeDefined();
        expect(screen.getByLabelText("Bio")).toBeDefined();
        expect(screen.getByText("Update")).toBeDefined();
    });
});

test("UpdateProfile redirects to login if user is not logged in", async () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
    vi.mocked(useUser).mockReturnValue({ loadingUser: false, user: null });

    render(<UpdateProfile />);

    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
    });
});

test("UpdateProfile loads user data correctly", async () => {
    setupMocks();

    render(<UpdateProfile />);

    await waitFor(() => {
        expect(screen.getByLabelText("First Name")).toHaveValue("John");
        expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
        expect(screen.getByLabelText("Email Address *")).toHaveValue("john@example.com");
        expect(screen.getByLabelText("Bio")).toHaveValue("Test bio");
    });
});

test("UpdateProfile handles form submission correctly", async () => {
    setupMocks();
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);

    mockFetch
        .mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    success: true,
                    data: {
                        first_name: "John",
                        last_name: "Doe",
                        email: "john@example.com",
                        profile_bio: "Test bio",
                    },
                }),
        })
        .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ success: true, data: "Profile updated successfully" }),
        });

    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<UpdateProfile />);

    await waitFor(() => {
        expect(screen.getByLabelText("First Name")).toHaveValue("John");
        expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
        expect(screen.getByLabelText("Email Address *")).toHaveValue("john@example.com");
        expect(screen.getByLabelText("Bio")).toHaveValue("Test bio");
    });

    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Smith" } });
    fireEvent.change(screen.getByLabelText("Email Address *"), {
        target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Bio"), { target: { value: "Updated bio" } });

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/user/profile", {
            method: "PATCH",
            body: expect.any(FormData),
        });
    });

    alertMock.mockRestore();
});

test("UpdateProfile handles API errors", async () => {
    setupMocks();
    mockFetch
        .mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    success: true,
                    data: {
                        first_name: "John",
                        last_name: "Doe",
                        email: "john@example.com",
                        profile_bio: "Test bio",
                    },
                }),
        })
        .mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ success: false, data: "Update failed" }),
        });

    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<UpdateProfile />);

    await waitFor(() => {
        expect(screen.getByLabelText("First Name")).toHaveValue("John");
    });

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("Unable to update your profile details.");
    });

    alertMock.mockRestore();
});

test("UpdateProfile switches between tabs correctly", async () => {
    setupMocks();

    render(<UpdateProfile />);

    await waitFor(() => {
        expect(screen.getByText("Account")).toBeDefined();
        expect(screen.queryByText("Enter your current password")).toBeNull();
    });

    fireEvent.click(screen.getByText("Security"));

    await waitFor(() => {
        expect(screen.getByText("Enter your current password")).toBeDefined();
        expect(screen.queryByText("Account")).toBeNull();
    });
});

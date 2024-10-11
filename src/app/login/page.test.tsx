import { expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./page";

// Mock the useRouter hook
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Properly type and mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof global.fetch;

test("Login Component", async () => {
    render(<Login />);

    // Check if the main elements are rendered
    expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeDefined();
    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();

    // Check if the links are present
    expect(screen.getByText("Create an account")).toBeDefined();
    expect(screen.getByText("email")).toBeDefined();
    expect(screen.getByText("password")).toBeDefined();

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    // Test successful login
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
    } as Response);

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    // Test error handling
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, data: "Invalid credentials" }),
    } as Response);

    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeDefined();
    });
});

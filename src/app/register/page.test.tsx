import { expect, test, vi, Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SignUp from "./page";

// Mock the next/navigation module
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

// Mock the fetch function
global.fetch = vi.fn();

test("Sign Up Page", async () => {
    render(<SignUp />);

    // Check if the main heading is present
    expect(screen.getByRole("heading", { level: 1, name: "Sign Up" })).toBeDefined();

    // Check if all form fields are present
    expect(screen.getByLabelText(/First Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Last Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();

    // Check if the submit button is present
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();

    // Check if the login link is present
    expect(screen.getByText("Already have an account?")).toBeDefined();
    expect(screen.getByRole("link", { name: "Login" })).toBeDefined();

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });
    // Mock a successful API response
    (global.fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    // Check if the API was called with the correct data
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            password: "password123",
        }),
    });
});

test("Sign Up Page - Error Handling", async () => {
    render(<SignUp />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    // Mock an error response from the API
    (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, data: "Email already exists" }),
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    // Check if the error message is displayed
    await vi.waitFor(() => {
        expect(screen.getByText("Email already exists")).toBeDefined();
    });
});

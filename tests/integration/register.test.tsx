import { expect, test, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUp from "@/app/register/page";

// Mock the useRouter hook
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

// Mock the fetch function
global.fetch = vi.fn();

test("Sign Up Page", async () => {
    render(<SignUp />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password123" } });

    // Mock a successful API response
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Sign Up/i }));

    // Use waitFor to handle asynchronous operations
    await waitFor(() => {
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
});

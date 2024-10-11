import { expect, test, vi, Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SignUp from "@/app/register/page";

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

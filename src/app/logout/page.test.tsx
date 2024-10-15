import { render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import Logout from "./page";

// Mock the dependencies
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

const mockSignOut = vi.fn();
vi.mock("@/utils/supabase/client", () => ({
    getBrowserSupabase: () => ({
        auth: {
            signOut: mockSignOut,
        },
    }),
}));

vi.mock("@/hooks/useEffectAsync", () => ({
    useEffectAsync: (callback: () => Promise<void>) => {
        callback();
    },
}));

test("Logout Component", async () => {
    render(<Logout />);

    // Check if the loading message is displayed
    expect(screen.getByText("Logging you out...")).toBeDefined();

    // Wait for the async operations to complete
    await waitFor(() => {
        // Check if signOut was called
        expect(mockSignOut).toHaveBeenCalled();
        // Check if router.push was called with '/login'
        expect(mockPush).toHaveBeenCalledWith("/login");
    });
});

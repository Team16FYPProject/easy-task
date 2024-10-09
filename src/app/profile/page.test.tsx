// Tests using
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, Mock } from "vitest";
import ProfilePage from "./page";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useAchievements } from "@/hooks/useAchievements";

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

vi.mock("@/hooks/useUser", () => ({
    useUser: vi.fn(),
}));

vi.mock("@/hooks/useAchievements", () => ({
    useAchievements: vi.fn(),
}));

describe("ProfilePage", () => {
    it("renders profile information correctly", () => {
        const mockPush = vi.fn();
        (useRouter as Mock).mockReturnValue({ push: mockPush });
        (useUser as Mock).mockReturnValue({
            loadingUser: false,
            user: { id: "1", first_name: "John", last_name: "Doe" },
        });
        (useAchievements as Mock).mockReturnValue({
            achievements: [],
            loading: false,
        });

        render(<ProfilePage />);

        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("redirects to login if user is not authenticated", () => {
        const mockPush = vi.fn();
        (useRouter as Mock).mockReturnValue({ push: mockPush });
        (useUser as Mock).mockReturnValue({
            loadingUser: false,
            user: null,
        });

        render(<ProfilePage />);

        expect(mockPush).toHaveBeenCalledWith("/login");
    });

    it("renders loading skeleton when projects are loading", () => {
        (useUser as Mock).mockReturnValue({
            loadingUser: false,
            user: { id: "1", first_name: "John", last_name: "Doe" },
        });
        (useAchievements as Mock).mockReturnValue({
            achievements: [],
            loading: false,
        });

        render(<ProfilePage />);

        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders achievements pie chart and tree correctly", () => {
        (useUser as Mock).mockReturnValue({
            loadingUser: false,
            user: { id: "1", first_name: "John", last_name: "Doe" },
        });
        (useAchievements as Mock).mockReturnValue({
            achievements: [
                { completed: true, progress: 100, max_progress: 100 },
                { completed: false, progress: 50, max_progress: 100 },
            ],
            loading: false,
        });

        render(<ProfilePage />);

        expect(screen.getByText("Completed (1)")).toBeInTheDocument();
        expect(screen.getByText("In Progress (1)")).toBeInTheDocument();
    });
});

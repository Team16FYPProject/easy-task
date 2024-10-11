import { describe, expect, test, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/utils/supabase/server", () => ({
    getServerSupabase: vi.fn(),
}));

const mockRequest = (data?: any): any => {
    return {
        json: () => data ?? {},
    };
};

describe("POST /api/auth/login", async () => {
    test("should return error when no email is included", async () => {
        const response = await POST(mockRequest());
        const data = await response.json();
        expect(data).toEqual({ success: false, data: "Please provide an email address" });
    });

    test("should return error when no password is included", async () => {
        const response = await POST(mockRequest({ email: "test@test.com" }));
        const data = await response.json();
        expect(data).toEqual({ success: false, data: "Please provide a valid password" });
    });
});

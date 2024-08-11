import { vi, test, describe, expect } from "vitest";
import { POST } from "./login";

vi.mock("@/utils/supabase/server", () => ({
    getServerSupabase: vi.fn(),
}));

describe("POST /api/auth/login", async () => {
    test("should return error with no data email passed", async () => {
        const request: any = {
            body: {},
        };
        const mockedJsonFn = vi.fn();
        const response = {
            status: () => {
                return {
                    json: mockedJsonFn,
                };
            },
        };
        await POST(request, response as any);
        expect(mockedJsonFn).toBeCalledWith({
            success: false,
            data: "Please provide an email address",
        });
    });
});

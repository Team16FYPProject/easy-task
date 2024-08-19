"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            setError(data.data);
            return;
        }
        await router.push("/dashboard");
    }

    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-white">
            {error && <p className="text-red-400">{error}</p>}
            <form className="flex w-2/5 flex-col gap-2" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1">
                    <label className="text-3xl font-bold text-black">Sign in</label>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-black">
                        New User?{" "}
                        <Link href="/register" className="text-purple-500">
                            Create an account
                        </Link>
                    </label>
                </div>
                <div className="flex flex-col gap-1 text-black">
                    <label>Email</label>
                    <input
                        className="rounded-md border-2 border-solid border-gray-600 p-2"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1 text-black">
                    <label>Password</label>
                    <input
                        type="password"
                        className="rounded-md border-2 border-solid border-gray-600 p-2"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="text-black">
                    <label>
                        Forgot your{" "}
                        <Link href="/register" className="text-purple-500">
                            email
                        </Link>{" "}
                        or{" "}
                        <Link href="/register" className="text-purple-500">
                            password
                        </Link>
                        ?
                    </label>
                </div>
                <button type="submit" className="mx-14 my-3 rounded-md bg-purple-500 p-2">
                    Submit
                </button>
            </form>
        </div>
    );
}

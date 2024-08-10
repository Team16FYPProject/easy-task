import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
    const router = useRouter();

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstName,
                lastName,
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
        <div className="flex h-screen w-screen flex-col items-center justify-center">
            {error && <p className="text-red-400">{error}</p>}
            <form className="flex w-2/5 flex-col gap-2" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1">
                    <label>First Name</label>
                    <input
                        className="rounded-sm bg-gray-500 p-2 text-white focus:outline-none"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>Last Name</label>
                    <input
                        className="rounded-sm bg-gray-500 p-2 text-white focus:outline-none"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>Email</label>
                    <input
                        className="rounded-sm bg-gray-500 p-2 text-white focus:outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label>Password</label>
                    <input
                        className="rounded-sm bg-gray-500 p-2 text-white focus:outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="mt-1 bg-green-500 p-2">
                    Submit
                </button>
            </form>
        </div>
    );
}

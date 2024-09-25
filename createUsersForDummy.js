import { createClient } from "@supabase/supabase-js";

const supabase = createClient("YOUR_SUPABASE_URL", "YOUR_SUPABASE_SERVICE_ROLE_KEY");

async function createUsers() {
    const users = [
        { email: "cche0204@student.monash.edu", password: "password123" },
        { email: "oagu0001@student.monash.edu", password: "password123" },
        { email: "klee0081@student.monash.edu", password: "password123" },
        { email: "jcru0005@student.monash.edu", password: "password123" },
    ];

    for (const user of users) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
        });

        if (error) {
            console.error(`Failed to create user ${user.email}:`, error);
        } else {
            console.log(`Created user ${user.email} with ID ${data.user.id}`);
        }
    }
}

createUsers();

export function isValidEmail(email: string) {
    const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return !!(email !== "" && email.match(emailFormat));
}

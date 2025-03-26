export interface User {
    name: string,
    email: string,
    password: string,
    role: "client" | "chef" | "cashier",
}
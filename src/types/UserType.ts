export interface User {
    public_id: string,
    username: string,
    phone_number: string,
    first_name: string,
    last_name: string,
    email: string,
    avatar: string,
    created_at: string,
    edited_at: string
}

export function isUser(obj: any): obj is User {
    return "public_id" in obj 
             && "username" in obj 
             && "phone_number" in obj 
             && "first_name" in obj
             && "last_name" in obj
             && "email" in obj
             && "avatar" in obj
             && "created_at" in obj
             && "edited_at" in obj
}
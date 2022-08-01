import { DocumentData } from "firebase/firestore"
import { User } from "firebase/auth"

export type UserDoc = {
    name: string,

    netid: string,
    email: string,

    phone: string,

    class: {
        name: string,
        semester: string
    },
    inHouse: boolean,
    position: string
}

export interface UserData {
    googleUser: User | null | undefined,
    user: DocumentData | null | undefined,
    loading: boolean
}
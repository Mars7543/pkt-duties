import { User as GoogleUser } from "firebase/auth"
import { DocumentData, Timestamp } from "firebase/firestore"

// model exports
export interface User {
    name: string,

    netid: string,
    email: string,
    phone: number

    class: {
        name: string,
        semester: string
    }
    inHouse: boolean,
    position?: string,

    credits: {
        waiter: number,
        cleaning: number,
        social: number
    }
}

export interface Class {
    class: string,
    index: number,
    fallClass?: boolean
}

export interface DutyDate {
    day: string, // MM-dd-yyyy (i.e. 08-24-2022)
    time: Timestamp | Date
}

export interface Duty {
    _id: string,

    type: DutyType,
    name: string,
    date: DutyDate,

    assigned: string[],
    assigned_names: { [index: string]: string }
    credits: { [index: string]: number }
}

export enum DutyType {
    waiter = "waiter",
    cleaning = "cleaning",
    social = "social"
}

// model function exports
export interface UsersInClass {
    class: Class
    users: User[]
}

// react types
export interface UserData {
    googleUser: GoogleUser | null | undefined,
    user: User | null | undefined,
    loading: boolean,
    error: any
}

export interface DutyData {
    dutyType: DutyType,
    users: User[],
    usersByClass: UsersInClass[],
    refreshUsers: () => void
}
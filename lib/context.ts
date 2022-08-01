import { createContext } from 'react'
import { UserData } from '../types/user'

export const UserContext = createContext<UserData>({
    googleUser: undefined,
    user: undefined,
    loading: false,
    error: undefined
})
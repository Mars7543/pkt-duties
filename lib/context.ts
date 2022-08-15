import { createContext } from 'react'
import { UserData, DutyData, DutyType } from './types'

export const UserContext = createContext<UserData>({
    googleUser: undefined,
    user: undefined,
    loading: false,
    error: undefined
})

export const DutyContext = createContext<DutyData>({
    dutyType: DutyType.waiter,
    users: [],
    refreshUsers: () => { }
})
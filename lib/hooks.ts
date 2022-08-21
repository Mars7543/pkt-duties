import { auth, firestore, usersCollection } from './firebase'
import { doc, DocumentData, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore'

import { getDutiesByDays, getDutiesByType } from '@lib/queries'

import { useAuthState } from 'react-firebase-hooks/auth'

import { useState, useEffect } from 'react'
import { Duty, DutyType, User, UserData } from './types'

// ========= USER HOOKS ============ \\

export const useUserData = (): UserData => {
    const [googleUser, error] = useAuthState(auth)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<User | undefined>(undefined)

    useEffect(() => {
        let unsubscribe

        if (googleUser) {
            setLoading(true)
            const netid = googleUser?.email?.split('@')[0] || ''
            const ref = doc(usersCollection, netid)
            unsubscribe = onSnapshot(ref, doc => {
                setLoading(false)
                setUser(doc.data())
            })
        } else {
            setLoading(false)
            setUser(undefined)
        }

        return unsubscribe
    }, [googleUser])

    return { googleUser, user, loading, error }
}

export const useUsers = (order: string = 'name'): { loading: boolean, error: any, users: User[] } => {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>()

    useEffect(() => {
        setLoading(true)
        const fetchUser = async () => {
            try {
                const q = query(usersCollection, orderBy(order, 'asc'))
                const users = (await getDocs(q)).docs.map(d => d.data())

                setUsers(users)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    return { loading, error, users }
}

// ========= DUTY HOOKS ============ \\

export const useDutiesByDays = (dutyType: DutyType, days: Date[], refreshDate: Date, refreshToken: number) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>(undefined)
    const [duties, setDuties] = useState<Duty[][]>([])

    useEffect(() => {
        setLoading(true)
        const fetchDuties = async () => {
            try {
                const duties = await getDutiesByDays(dutyType, days)

                setDuties(duties)
            } catch (err) {
                console.log(err)

                setError('Error loading duties.')
            } finally {
                setLoading(false)
            }
        }

        fetchDuties()
    }, [refreshDate, refreshToken])

    return { loading, error, duties }
}

export const useDutiesByType = (dutyType: DutyType, filterChecked?: boolean) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<any>(undefined)
    const [duties, setDuties] = useState<Duty[]>([])

    useEffect(() => {
        setLoading(true)
        const fetchDuties = async () => {
            try {
                const duties = await getDutiesByType(dutyType, filterChecked)

                setDuties(duties)
            } catch (err) {
                console.log(err)

                setError('Error loading duties.')
            } finally {
                setLoading(false)
            }
        }

        fetchDuties()
    }, [filterChecked])

    return { loading, error, duties }
}
import { auth, firestore, googleAuthProvider } from './firebase'
import { signInWithPopup, signOut, User } from 'firebase/auth'
import { doc, DocumentData, onSnapshot } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useState, useEffect } from 'react'
import { UserData } from 'types/user'

import { toast } from 'react-hot-toast'

export const useUserData = (): UserData => {
    const [googleUser, error] = useAuthState(auth)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<DocumentData | undefined>(undefined)

    useEffect(() => {
        let unsubscribe

        if (googleUser) {
            setLoading(true)
            const netid = googleUser?.email?.split('@')[0] || ''
            const ref = doc(firestore, 'users', netid)
            unsubscribe = onSnapshot(ref, doc => {
                setLoading(false)
                setUser(doc.data())
            })
        } else {
            setLoading(false)
            setUser(undefined)
        }
    }, [googleUser])

    return { googleUser, user, loading, error }
}
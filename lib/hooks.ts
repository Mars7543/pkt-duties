import { auth, firestore } from './firebase'
import { doc, DocumentData, onSnapshot } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useState, useEffect } from 'react'
import { UserData } from 'types/user'

export const useUserData = (): UserData => {
    const [googleUser, loading] = useAuthState(auth)
    const [user, setUser] = useState<DocumentData | undefined>(undefined)

    useEffect(() => {
        let unsubscribe

        if (googleUser) {
            const netid = googleUser?.email?.split('@')[0] || ''
            const ref = doc(firestore, 'users', netid)
            unsubscribe = onSnapshot(ref, doc => {
                setUser(doc.data())
            })
        } else
            setUser(undefined)
    }, [googleUser])

    return { googleUser, user, loading }
}
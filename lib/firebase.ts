import { initializeApp, getApp, FirebaseOptions } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore, doc, getDoc, DocumentData, CollectionReference, collection } from 'firebase/firestore'
import { Class, Duty, User } from './types'

const firebaseConfig = {
    apiKey: 'AIzaSyAykX1yK5B1-gw_bv28Kjcvnma9R0PniHU',
    authDomain: 'pkt-apps-78edb.firebaseapp.com',
    projectId: 'pkt-apps-78edb',
    storageBucket: 'pkt-apps-78edb.appspot.com',
    messagingSenderId: '655588966804',
    appId: '1:655588966804:web:d9e517d5003faca5164f81',
    measurementId: 'G-FWPLPGYSX5'
}

const CORNELL_DOMAIN = 'cornell.edu'

// initialize firebase app
function createFirebaseApp(config: FirebaseOptions) {
    try {
        return getApp()
    } catch {
        return initializeApp(config)
    }
}

const firebaseApp = createFirebaseApp(firebaseConfig)

// firestore exports
export const firestore = getFirestore(firebaseApp)

// auth exports
export const auth = getAuth(firebaseApp)
export const googleAuthProvider = new GoogleAuthProvider().setCustomParameters({ hd: CORNELL_DOMAIN })

const ERR_POPUP_CLOSED = 'auth/popup-closed-by-user'
export async function signInWithGoogle() {
    try {
        const res = await signInWithPopup(auth, googleAuthProvider)

        const [netid, domain] = res.user.email?.split('@') || ['', '']
        if (!domain || domain != CORNELL_DOMAIN) {
            await signOut(auth)
            return { username: null, error: 'Please sign in with cornell email' }
        }

        // check if user exists with given email
        const userRef = doc(firestore, 'users', netid)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
            await signOut(auth)
            return { error: 'No user exists with given email' }
        }

        return { displayName: res.user.displayName?.split(' ')[0], error: null }
    } catch (err) {
        if (err.code === ERR_POPUP_CLOSED) return { error: null }
        return { error: 'Error signing in, try again later' }
    }
}

// typed collections export
const createCollection = <T = DocumentData>(name: string) =>
    collection(firestore, name) as CollectionReference<T>

export const usersCollection = createCollection<User>('users')
export const classCollection = createCollection<Class>('classes')
export const dutiesCollection = createCollection<Duty>('duties')
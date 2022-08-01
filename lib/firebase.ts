import { initializeApp, getApp, FirebaseOptions } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

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

function createFirebaseApp(config: FirebaseOptions) {
    try {
        return getApp()
    } catch {
        return initializeApp(config)
    }
}

const firebaseApp = createFirebaseApp(firebaseConfig)

// auth exports
export const auth = getAuth(firebaseApp)
export const googleAuthProvider = new GoogleAuthProvider()
googleAuthProvider.setCustomParameters({ hd: CORNELL_DOMAIN })

export async function signInWithGoogle() {
    try {
        const res = await signInWithPopup(auth, googleAuthProvider)
        console.log(res)

        const email = res?.user?.email
        const domain = email?.split('@')[1]
        if (!domain || domain != CORNELL_DOMAIN) {
            await signOut(auth)
            return { error: 'Must login with cornell email.' }
        }

        // check if user exists with given email
        // if (!userExists) {
        //     await signOut(auth)
        //     return { error : 'No user exists with the given email.' }
        // }
    } catch (err) {
        console.log(err)
        return { error: 'Error signing in. Try again later.' }
    }
}

// firestore exports
export const firestore = getFirestore(firebaseApp)

import { useContext, useState } from 'react'

import { UserContext } from '@lib/context'
import { signInWithGoogle } from '@lib/firebase'

import { toast } from 'react-hot-toast'

const AuthLogin = (props) => {
    const { user, loading } = useContext(UserContext)

    const [signInLoading, setSignInLoading] = useState(false)

    const signIn = async () => {
        setSignInLoading(true)
        const { displayName, error } = await signInWithGoogle()
        setSignInLoading(false)

        if (error) toast.error(error)
        else toast.success(`Welcome Back, ${displayName}`)
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user && !loading) {
        return (
            <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
                <p className='uppercase text-gray-600 text-shadow shadow-black text-2xl'>
                    Please Sign In to Continue
                </p>
                <button
                    disabled={signInLoading}
                    className={`w-48 h-10 rounded-full ${
                        signInLoading ? 'shadow-sm' : 'shadow-md'
                    } shadow-gray-400 bg-primary text-white hover:shadow-sm ease-in-out transition-shadow`}
                    onClick={signIn}
                >
                    {signInLoading ? 'Loading...' : 'Sign In With Google'}
                </button>
            </div>
        )
    }

    if (user && !loading) {
        return props.children
    }
}

export default AuthLogin

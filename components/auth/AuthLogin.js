import { useContext, useState } from 'react'

import { UserContext } from '@lib/context'
import { signInWithGoogle } from '@lib/firebase'

import { ThreeDots } from 'react-loader-spinner'
import { toast } from 'react-hot-toast'
import { getUserAssignType, isAssigner } from '@lib/helpers'
import Link from 'next/link'

const AuthLogin = (props) => {
    const { user, loading } = useContext(UserContext)

    const [signInLoading, setSignInLoading] = useState(false)

    const signIn = async () => {
        setSignInLoading(true)
        const { displayName, error } = await signInWithGoogle()
        setSignInLoading(false)

        if (error) toast.error(error)
        else if (displayName) toast.success(`Welcome Back, ${displayName}`)
    }

    if (loading) {
        return (
            <div className='w-full h-full flex items-center justify-center gap-3'>
                <span className='text-2xl'>Loading</span>
                <ThreeDots
                    wrapperStyle={{ marginTop: '4px' }}
                    color='#2c3e50'
                    height={25}
                    width={50}
                />
            </div>
        )
    }

    if (!user && !loading) {
        return (
            <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
                <p className='uppercase text-gray-600 text-shadow shadow-black text-2xl'>
                    Please Sign In to Continue
                </p>
                <button
                    disabled={signInLoading}
                    className={`flex items-center justify-center w-48 h-10 rounded-full ${
                        signInLoading ? 'shadow-sm' : 'shadow-md'
                    } shadow-gray-400 bg-primary text-white hover:shadow-sm ease-in-out transition-shadow`}
                    onClick={signIn}
                >
                    {signInLoading ? (
                        <div className='h-full flex items-center gap-2'>
                            <span>Loading</span>
                            <ThreeDots
                                wrapperStyle={{ marginTop: '3px' }}
                                color='#FFFFFF'
                                height={15}
                                width={25}
                            />
                        </div>
                    ) : (
                        'Sign In With Google'
                    )}
                </button>
            </div>
        )
    }

    if (user && !loading) {
        // for duty assign pages
        const assignType = props.assignType
        const assigners = props.assigners
        const netid = props.netid

        const invalidAssignType =
            assignType && getUserAssignType(user) !== assignType
        const notAssigner = assigners && !isAssigner(user)
        const invalidNetid = netid && user.netid !== netid

        if (
            invalidAssignType ||
            notAssigner ||
            (invalidNetid && notAssigner) ||
            (invalidNetid && !assigners)
        ) {
            toast.error('You do not have permission to access this page.')
            return (
                <div className='flex flex-col items-center gap-5'>
                    <h1 className='text-shadow-light text-4xl'>
                        Invalid Permissions
                    </h1>

                    <Link href='/' passHref={true}>
                        <a className='text-shadow-light text-xl font-medium'>
                            Back to Home
                        </a>
                    </Link>
                </div>
            )
        }

        return props.children
    }
}

export default AuthLogin

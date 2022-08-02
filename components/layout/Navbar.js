import Link from 'next/link'

import { ThreeDots } from 'react-loader-spinner'
import { MdLogin, MdLogout } from 'react-icons/md'

import { auth, signInWithGoogle } from '@lib/firebase'
import { signOut } from 'firebase/auth'

import { useContext, useState } from 'react'
import { UserContext } from '@lib/context'
import { useRouter } from 'next/router'

import toast from 'react-hot-toast'

const Navbar = () => {
    const { user, loading } = useContext(UserContext)

    return (
        <div className='flex justify-between items-center px-6 w-full h-20 bg-primary'>
            {/* Icon + Home */}
            <div className='flex items-center gap-5'>
                <Link href={'/'}>
                    <img
                        src='/PKT_COA.png'
                        alt='PKT Coat of Arms'
                        width={40}
                        height={50}
                    />
                </Link>

                <Link href={'/'} passHref={true}>
                    <a className='text-white text-[35px] text-shadow uppercase cursor-pointer'>
                        Phi Kappa Tau
                    </a>
                </Link>
            </div>

            {/* Auth Status */}
            <div className='flex items-center gap-2 text-white text-2xl'></div>

            {/* Loading Auth State */}
            {!user && loading && (
                <div className='flex items-center gap-2 text-white text-2xl cursor-pointer'>
                    <p className='flex items-center justify-center gap-3 text-shadow'>
                        <span>Loading</span>
                        <ThreeDots
                            wrapperStyle={{ marginTop: '4px' }}
                            color='#FFFFFF'
                            height={25}
                            width={45}
                        />
                    </p>
                </div>
            )}

            {/* User Not Signed In */}
            {!user && !loading && <SignInBtn />}

            {/* User Logged In */}
            {user && !loading && <SignOutBtn name={user.name} />}
        </div>
    )
}

const SignInBtn = () => {
    const [signInLoading, setSignInLoading] = useState(false)

    const signIn = async () => {
        if (signInLoading) return

        setSignInLoading(true)
        const { displayName, error } = await signInWithGoogle()
        setSignInLoading(false)

        if (error) toast.error(error)
        else if (displayName) toast.success(`Welcome Back, ${displayName}`)
    }

    return (
        <div
            className='flex items-center gap-2 text-white text-2xl cursor-pointer'
            onClick={signInLoading ? () => {} : signIn}
        >
            {signInLoading && (
                <p className='flex items-center justify-center gap-3 text-shadow'>
                    <span>Loading</span>
                    <ThreeDots
                        wrapperStyle={{ marginTop: '4px' }}
                        color='#FFFFFF'
                        height={25}
                        width={45}
                    />
                </p>
            )}

            {!signInLoading && (
                <>
                    <p className='text-shadow'>Sign In</p>
                    <MdLogin className='w-[30px] h-[30px] drop-shadow-xl shadow-black' />
                </>
            )}
        </div>
    )
}

const SignOutBtn = ({ name }) => {
    const router = useRouter()

    const signOutAndReload = () => {
        signOut(auth)
        toast.success('Logged Out')
        // router.reload()
    }

    return (
        <div
            className='flex items-center gap-2 text-white text-2xl cursor-pointer'
            onClick={signOutAndReload}
        >
            <p className='text-shadow'>{name}</p>
            <MdLogout className='w-[30px] h-[30px] drop-shadow-xl shadow-black' />
        </div>
    )
}

export default Navbar

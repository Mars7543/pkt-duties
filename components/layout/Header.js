import Link from 'next/link'
import { MdLogin, MdLogout } from 'react-icons/md'

import { auth, signInWithGoogle } from '@lib/firebase'
import { signOut } from 'firebase/auth'

import { useContext, useState } from 'react'
import { UserContext } from '@lib/context'
import { useRouter } from 'next/router'

import toast from 'react-hot-toast'

const Header = () => {
    const { user, loading } = useContext(UserContext)

    return (
        <div className='flex justify-between items-center px-6 w-full h-20 bg-primary'>
            {/* Icon + Home */}
            <div className='flex items-center gap-5'>
                <Link href={'/'}>
                    <img
                        src='./PKT_COA.png'
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
                    <p className='text-shadow'>Loading...</p>
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
        const { error } = await signInWithGoogle()
        setSignInLoading(false)

        if (error) toast.error(error)
    }

    return (
        <div
            className='flex items-center gap-2 text-white text-2xl cursor-pointer'
            onClick={signIn}
        >
            <p className='text-shadow'>Sign In</p>
            <MdLogin className='w-[30px] h-[30px] drop-shadow-xl shadow-black' />
        </div>
    )
}

const SignOutBtn = ({ name }) => {
    const router = useRouter()

    const signOutAndReload = () => {
        signOut(auth)
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

export default Header

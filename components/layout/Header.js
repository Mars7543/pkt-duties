import Link from 'next/link'
import { MdLogin, MdLogout } from 'react-icons/md'

import { auth, signInWithGoogle } from '@lib/firebase'
import { signOut } from 'firebase/auth'

import { useContext, useState } from 'react'
import { UserContext } from '@lib/context'
import { useRouter } from 'next/router'

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

            {/* User Not Signed In */}
            {!user && !loading && <SignInBtn />}

            {/* User Logged In */}
            {user && <SignOutBtn name={user.name} />}
        </div>
    )
}

const SignInBtn = () => {
    return (
        <div
            className='flex items-center gap-2 text-white text-2xl cursor-pointer'
            onClick={signInWithGoogle}
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

import type { NextPage } from 'next'

import Link from 'next/link'

import AuthLogin from '@components/auth/AuthLogin'
import { useContext } from 'react'
import { UserContext } from '@lib/context'

const Home: NextPage = () => {
    const { user } = useContext(UserContext)

    return (
        <main>
            <AuthLogin>
                <div className='flex flex-col'>
                    <Link href={`/duties/${user?.netid}`} passHref={true}>
                        <a className='cursor-pointer'>My Duties</a>
                    </Link>
                    <Link href='/duties/assign?type=waiter' passHref={true}>
                        <a className='cursor-pointer'>Assign Duties</a>
                    </Link>
                </div>
            </AuthLogin>
        </main>
    )
}

export default Home

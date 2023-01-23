import type { NextPage } from 'next'

import Link from 'next/link'

import AuthLogin from '@components/auth/AuthLogin'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '@lib/context'
import { getUserAssignType } from '@lib/helpers'
import { DutyType } from '@lib/types'
import Metatags from '@components/layout/Metatags'

const Home: NextPage = () => {
    const { user } = useContext(UserContext)
    const [assignType, setAssignType] = useState<DutyType>()

    useEffect(() => {
        if (user) setAssignType(getUserAssignType(user))
        else setAssignType(undefined)
    }, [user])

    return (
        <main>
            <Metatags />
            <AuthLogin>
                <div className='flex flex-col flex-grow justify-center items-center gap-8'>
                    {/* <Link href={`/profile/${user?.netid}`} passHref={true}>
                        <a className='cursor-pointer text-4xl text-shadow-light'>
                            View Profile
                        </a>
                    </Link> */}
                    <Link href={`/duties/${user?.netid}`} passHref={true}>
                        <a className='cursor-pointer text-4xl text-shadow-light'>
                            My Duties
                        </a>
                    </Link>
                    {assignType && (
                        <>
                            <Link
                                href={`/duties/assign?type=${assignType}`}
                                passHref={true}
                            >
                                <a className='cursor-pointer text-4xl text-shadow-light'>
                                    Assign Duties
                                </a>
                            </Link>

                            <Link
                                href={`/duties/check?type=${assignType}`}
                                passHref={true}
                            >
                                <a className='cursor-pointer text-4xl text-shadow-light'>
                                    Check Duties
                                </a>
                            </Link>
                        </>
                    )}
                </div>
            </AuthLogin>
        </main>
    )
}

export default Home

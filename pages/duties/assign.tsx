import type { GetServerSidePropsContext, NextPage } from 'next'
import { GetServerSideProps } from 'next'

import { getUsersByClass, getUsersByCredits } from '@lib/queries'

import AuthLogin from '@components/auth/AuthLogin'
import DutiesCalendar from '@components/duties/duty-calendar/DutiesCalendar'
import ViewUsers from '@components/users/ViewUsers'

import { useState } from 'react'

import { DutyType, User, UsersInClass } from '@lib/types'
import { DutyContext } from '@lib/context'
import toast from 'react-hot-toast'
import { capitalize } from 'lodash'

// duty types with corresponding positions
const dutyTypesPermissions: Record<DutyType, string> = {
    waiter: 'Steward',
    cleaning: 'Cleaning Manager',
    social: 'Social Chair'
}

export const getServerSideProps: GetServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    // get duty type from query string
    const { type } = context.query
    const dutyType = typeof type === 'string' ? type : ''

    // invalid query string
    if (!Object.keys(dutyTypesPermissions).includes(dutyType))
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }

    // get users by class and all users filtered by credits of duty type 'dutyType'
    try {
        const usersByClass = await getUsersByClass()
        const allUsers = await getUsersByCredits(dutyType as DutyType)

        return {
            props: { dutyType, usersByClass, allUsers }
        }
    } catch (err) {
        return {
            props: { dutyType, error: err }
        }
    }
}

interface AssignDutiesPageProps {
    dutyType: DutyType
    usersByClass?: UsersInClass[]
    allUsers?: User[]
}

const AssignDutiesPage: NextPage<AssignDutiesPageProps> = ({
    dutyType,
    usersByClass: groupedUsers,
    allUsers
}) => {
    const [view, setView] = useState('duty')

    const [users, setUsers] = useState<User[]>(allUsers || [])
    const [usersByClass, setUsersByClass] = useState<UsersInClass[]>(
        groupedUsers || []
    )

    const refreshUsers = async () => {
        try {
            const users = await getUsersByCredits(dutyType)
            const usersByClass = await getUsersByClass()

            setUsers(users)
            setUsersByClass(usersByClass)
        } catch (err) {
            console.log(err)
            toast.error('Error updating users.')
        }
    }

    return (
        <main>
            <AuthLogin>
                <DutyContext.Provider
                    value={{ dutyType, users, usersByClass, refreshUsers }}
                >
                    {/* Title Card */}
                    <div className='title-card-xl'>
                        <h1>Assign {capitalize(dutyType)} Duties</h1>
                    </div>

                    {/* View Buttons */}
                    <div className='mx-auto mt-8 space-x-5'>
                        <button
                            className={`box-shadow w-[210px] bg-green-400 hover:bg-green-500 active:bg-green-600 py-2 text-lg text-white uppercase tracking-wide transition-all ${
                                view === 'duty' ? 'box-shadow-light' : ''
                            }`}
                            onClick={() => setView('duty')}
                        >
                            Assign Duties
                        </button>
                        <button
                            disabled={view === 'brother'}
                            className={`box-shadow w-[210px] bg-blue-400 hover:bg-blue-500 active:bg-blue-600 py-2 text-lg text-white uppercase tracking-wide transition-all ${
                                view === 'brother' ? 'box-shadow-light' : ''
                            }`}
                            onClick={() => setView('brother')}
                        >
                            View Brothers
                        </button>
                    </div>

                    {/* Views */}
                    <div className='mt-10'>
                        {view === 'brother' ? (
                            <ViewUsers />
                        ) : (
                            <DutiesCalendar />
                        )}
                    </div>
                </DutyContext.Provider>
            </AuthLogin>
        </main>
    )
}

export default AssignDutiesPage

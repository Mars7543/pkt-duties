import type { GetServerSidePropsContext, NextPage } from 'next'
import { GetServerSideProps } from 'next'

import { getUsersByClass, getUsersByCredits } from '@lib/queries'

import AuthLogin from '@components/auth/AuthLogin'
import DutiesCalendar from '@components/duties/DutiesCalendar'

import { useContext, useState } from 'react'

import { capitalizeFirstLetter } from '@lib/helpers'
import { Class, DutyType, User, UsersInClass } from '@lib/types'
import { DutyContext } from '@lib/context'

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
    usersByClass?: UsersInClass[] | undefined
    allUsers?: User[]
}

const AssignDutiesPage: NextPage<AssignDutiesPageProps> = ({
    dutyType,
    usersByClass,
    allUsers
}) => {
    const [view, setView] = useState('duty')

    const [users, setUsers] = useState<User[]>(allUsers || [])
    const refreshUsers = () => {
        console.log('refreshing users...')
        setUsers(allUsers || [])
    }

    return (
        <main>
            <AuthLogin>
                <DutyContext.Provider value={{ dutyType, users, refreshUsers }}>
                    {/* Title Card */}
                    <div className='title-card-xl'>
                        <h1>Assign {capitalizeFirstLetter(dutyType)} Duties</h1>
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
                            <ViewUsers usersByClass={usersByClass} />
                        ) : (
                            <DutiesCalendar />
                        )}
                    </div>
                </DutyContext.Provider>
            </AuthLogin>
        </main>
    )
}

const ViewUsers: React.FC<{
    usersByClass: UsersInClass[] | undefined
}> = ({ usersByClass }) => {
    if (!usersByClass) return <div></div>

    if (usersByClass.length === 3) {
        return (
            <div className='mt-8 flex gap-8'>
                {usersByClass.map(({ users, class: c }) => (
                    <ClassCard key={`${c.index}`} class={c} users={users} />
                ))}
            </div>
        )
    } else if (usersByClass.length === 4) {
        return (
            <div className='mt-8 flex flex-wrap gap-12 justify-center'>
                <div className='flex gap-14'>
                    {usersByClass.slice(0, 2).map(({ users, class: c }) => (
                        <ClassCard key={c.index} class={c} users={users} />
                    ))}
                </div>
                <div className='flex gap-14'>
                    {usersByClass.slice(2).map(({ users, class: c }) => (
                        <ClassCard key={c.index} class={c} users={users} />
                    ))}
                </div>
            </div>
        )
    } else return <></>
}

const ClassCard: React.FC<{
    class: Class
    users: User[]
}> = ({ class: c, users }) => {
    const { dutyType } = useContext(DutyContext)
    const cName = c.fallClass ? `Fall ${c.class}` : c.class
    return (
        <div className=' md:w-[275px] xl:w-[450px] 2xl:w-[425px] bg-white flex flex-col items-center py-4 px-[55px] box-shadow-light'>
            <h1 className='text-3xl'>{cName}</h1>
            <div className='mt-4 w-full flex justify-between text-2xl font-bold pb-2 border-b border-gray-600 border-solid'>
                <p>Name</p>
                <p>Credits</p>
            </div>
            <div className='mt-4 flex flex-col w-full gap-2'>
                {users.map(({ name, credits }) => (
                    <div
                        key={name}
                        className='flex w-full justify-between text-xl cursor-pointer'
                    >
                        <p>{name}</p>
                        <p>{credits[dutyType]}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AssignDutiesPage

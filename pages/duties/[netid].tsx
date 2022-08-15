import type {
    GetServerSideProps,
    GetServerSidePropsContext,
    NextPage
} from 'next'

import AuthLogin from '@components/auth/AuthLogin'

import { getDutiesByUser } from '@lib/queries'
import { User, Duty, DutyType } from '@lib/types'
import { classNames } from '@lib/helpers'
import { capitalize } from 'lodash'
import { format } from 'date-fns'
import { Fragment } from 'react'

export const getServerSideProps: GetServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const { netid } = context.params as { netid: string }

    // check auth here
    // checkAuth()

    const { error, user, duties } = await getDutiesByUser(netid)

    if (error) {
        if (error === 404 || !user) return { notFound: true }
        else
            return {
                props: {
                    error: true,
                    user,
                    duties: { waiter: [], cleaning: [], social: [] }
                }
            }
    }

    return {
        props: { error: false, user, duties }
    }
}

// w-[200px] py-2 text-xl text-white uppercase tracking-normal;

const ViewDutiesPage: NextPage<{
    error: boolean
    user: User
    duties: Record<DutyType, string[]>
}> = ({ error, user, duties }) => {
    if (error) return <main className='text-gray-800'>Error.</main>

    const dutyTypes = Object.values(DutyType)

    return (
        <main className='text-gray-800'>
            <AuthLogin>
                <div className='text-4xl title-card-2xl'>
                    <h1>Duties Assigned to {user.name}</h1>
                </div>

                <div className='mt-[50px] w-full flex flex-grow justify-evenly'>
                    {dutyTypes.map((dutyType) => (
                        <div
                            key={dutyType}
                            className='box-shadow-light w-[400px] bg-white flex flex-col items-center pt-5 px-[20px]'
                        >
                            <h2 className='text-3xl'>{capitalize(dutyType)}</h2>

                            <div className='min-w-[80%] grid grid-cols-2 mt-5 pb-1 border-b border-solid border-gray-500'>
                                <p className='text-xl font-semibold'>
                                    Duty Name
                                </p>
                                <p className='text-xl font-semibold place-self-end'>
                                    Date
                                </p>
                            </div>

                            <div className='mt-3 min-w-[80%] grid grid-cols-2 overflow-scroll'>
                                {duties[dutyType].map((dutyStr, i) => {
                                    const duty = JSON.parse(dutyStr) as Duty

                                    console.log(duty)
                                    const date = new Date(
                                        duty.date.time as Date
                                    )

                                    return (
                                        <Fragment key={`${i}`}>
                                            <p className='place-self-start'>
                                                {duty.name}
                                            </p>
                                            <p className='place-self-end'>
                                                {format(date, 'M/d/yy')}
                                            </p>
                                        </Fragment>
                                    )
                                })}

                                {duties[dutyType].length === 0 && (
                                    <p className='col-span-2 place-self-center'>
                                        No Duties Assigned
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    {/* {Object.keys(dutyNames).map((dutyKey: string) => (
                        <div
                            key={dutyKey}
                            className={`${styles.duty_card} box-shadow`}
                        >
                            <h2 className='text-3xl'>{dutyNames[dutyKey]}</h2>

                            <div className='w-[80%] flex justify-between mt-5 pb-1 border-b border-solid border-gray-500'>
                                <p className='font-bold'>Duty Name</p>
                                <p className='font-bold'>Date</p>
                            </div>

                            <div className='w-[80%] mt-3 flex flex-col gap-2 overflow-scroll'>
                                {duties[dutyKey].map(({ name, date }, i) => (
                                    <div
                                        key={`${i}${date}`}
                                        className='flex justify-between mt-1'
                                    >
                                        <p>{name}</p>
                                        <p>{date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))} */}
                </div>
            </AuthLogin>
        </main>
    )
}

export default ViewDutiesPage

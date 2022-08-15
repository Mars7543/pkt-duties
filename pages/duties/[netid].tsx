import type { NextPage } from 'next'

import AuthLogin from '@components/auth/AuthLogin'

import styles from '@styles/ViewDuties.module.scss'

import { useRouter } from 'next/router'

const ViewDutiesPage: NextPage = () => {
    interface DutyNames {
        [index: string]: string
    }

    interface Duty {
        name: string
        date: string
    }

    interface Duties {
        [index: string]: Array<Duty>
    }

    const dutyNames: DutyNames = {
        waiter: 'Waiter Duties',
        cleaning: 'Cleaning Duties',
        social: 'Social Duties'
    }

    const duties: Duties = {
        waiter: [
            {
                name: 'Dinner Waiter',
                date: '7/2'
            },
            {
                name: 'Dinner Waiter',
                date: '7/7'
            },
            {
                name: 'Dinner Waiter',
                date: '8/12'
            },
            {
                name: 'Dinner Waiter',
                date: '9/14'
            }
        ],

        cleaning: [
            {
                name: 'Dining Room Cleanup',
                date: '7/12'
            },
            {
                name: 'Kitchen Cleanup',
                date: '8/3'
            },
            {
                name: 'Basement Cleanup',
                date: '8/20'
            }
        ],
        social: [
            {
                name: 'Sober',
                date: '7/23'
            },
            {
                name: 'Setup',
                date: '8/19'
            },
            {
                name: 'Setup',
                date: '9/1'
            }
        ]
    }

    return (
        <main className='text-gray-800'>
            <AuthLogin>
                <div className='title-card'>
                    <h1>View My Duties</h1>
                </div>

                <div className='mt-[50px] w-full flex flex-grow justify-evenly'>
                    {Object.keys(dutyNames).map((dutyKey: string) => (
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
                    ))}
                </div>
            </AuthLogin>
        </main>
    )
}

export default ViewDutiesPage

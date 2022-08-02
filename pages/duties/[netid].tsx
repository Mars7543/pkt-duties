import type { NextPage } from 'next'

import AuthLogin from '@components/auth/AuthLogin'

import styles from '@styles/ViewDuties.module.scss'

const ViewDutiesPage: NextPage = () => {
    interface DutyNames {
        [index: string]: string
    }

    const dutyNames: DutyNames = {
        waiter: 'Waiter Duties',
        cleaning: 'Cleaning Duties',
        social: 'Social Duties'
    }

    return (
        <main className='text-gray-800'>
            <AuthLogin>
                <div className='mx-auto w-[350px] text-center'>
                    <h1 className='text-shadow-light text-5xl'>
                        View My Duties
                    </h1>
                </div>

                <div className='mt-[50px] w-full flex flex-grow justify-evenly'>
                    {Object.keys(dutyNames).map((dutyKey: string) => (
                        <div key={dutyKey} className={styles.duty_card}>
                            <h2 className='text-3xl'>{dutyNames[dutyKey]}</h2>

                            <div className='flex justify-around mt-4 pb-1 border-b border-solid border-gray-500'>
                                <p className='font-bold'>Duty Name</p>
                                <p className='font-bold'>Date</p>
                            </div>

                            <div className='mt-3 flex flex-col gap-2 overflow-scroll'>
                                <div className='flex justify-around'>
                                    <p>Dinner Waiter</p>
                                    <p>7/3</p>
                                </div>

                                <div className='flex justify-around'>
                                    <p>Dinner Waiter</p>
                                    <p>7/3</p>
                                </div>

                                <div className='flex justify-around'>
                                    <p>Dinner Waiter</p>
                                    <p>7/3</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </AuthLogin>
        </main>
    )
}

export default ViewDutiesPage

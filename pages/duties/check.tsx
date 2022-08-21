import AuthLogin from '@components/auth/AuthLogin'
import { useDutiesByType } from '@lib/hooks'
import { getDutiesByType, updateUserDutyCredits } from '@lib/queries'
import { Duty, DutyType } from '@lib/types'
import { capitalize } from 'lodash'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { format } from 'date-fns'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { TailSpin, ThreeDots } from 'react-loader-spinner'
import { Switch } from '@headlessui/react'
import { HiOutlineCheck, HiOutlineX, HiPencil } from 'react-icons/hi'
import { classNames } from '@lib/helpers'
import Metatags from '@components/layout/Metatags'

export const getServerSideProps: GetServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    // get duty type from query string
    const { type } = context.query
    const dutyType = typeof type === 'string' ? type : ''

    // invalid query string
    if (!Object.values(DutyType).includes(dutyType as DutyType))
        return {
            notFound: true
        }

    return {
        props: { dutyType }
    }
}

interface CheckDutiesPageProps {
    dutyType: DutyType
    duties?: Duty[]
    error?: boolean | string
}

const CheckDutiesPage: React.FC<CheckDutiesPageProps> = ({ dutyType }) => {
    const [enabled, setEnabled] = useState(false)
    const [filter, setFilter] = useState(false)

    const { loading, error, duties } = useDutiesByType(dutyType, filter)

    return (
        <main>
            <Metatags title='Check Duties' />
            <AuthLogin assignType={dutyType}>
                {/* Title Card */}
                <div className='title-card-xl'>
                    <h1>Check {capitalize(dutyType)} Duties</h1>
                </div>

                {/* Loading Duties */}
                {loading && (
                    <div className='w-full h-full flex mt-12 justify-center gap-3'>
                        <span className='text-3xl'>Loading</span>
                        <ThreeDots
                            wrapperStyle={{ marginTop: '8px' }}
                            color='#2c3e50'
                            height={25}
                            width={50}
                        />
                    </div>
                )}

                {/* Error Handler */}
                {!loading &&
                    error &&
                    toast.error(
                        typeof error === 'string'
                            ? error
                            : 'Error loading duties.'
                    )}

                {/* ========= Render Duties =========== */}
                {/* No Duties */}
                {!loading && duties && duties.length === 0 && (
                    <div>No Duties Assigned</div>
                )}

                {/* Duties */}
                {!loading && duties && duties.length > 0 && (
                    <div className='w-full flex flex-col mt-12 items-center gap-10'>
                        {duties.map((duty, idx) => (
                            <div
                                key={idx}
                                className='w-[500px] px-5 py-4 bg-white box-shadow-light flex flex-col items-center divide-y-2'
                            >
                                {/* Duty Header */}
                                <div className='w-full flex pb-3 items-center justify-between'>
                                    <h2 className='text-2xl font-medium'>
                                        {duty.name}
                                    </h2>
                                    <h2 className='text-2xl font-medium'>
                                        {format(
                                            duty.date.time as Date,
                                            'MMM do'
                                        )}
                                    </h2>
                                </div>
                                {/* <div className='w-full flex pb-3 items-center justify-between'>
                                    <h2 className='text-2xl font-medium'>
                                        {format(
                                            duty.date.time as Date,
                                            'MMM do'
                                        )}
                                        &nbsp;&nbsp;
                                        {duty.name}
                                    </h2>

                                    <CheckDuty />
                                </div> */}

                                {/* Duty Assigned */}
                                <div className='w-full pt-3 flex flex-col items-center space-y-3'>
                                    {Object.keys(duty.assigned_names).map(
                                        (netid) => (
                                            <CheckPerson
                                                key={netid}
                                                dutyId={duty._id}
                                                netid={netid}
                                                name={
                                                    duty.assigned_names[netid]
                                                }
                                                credits={duty.credits[netid]}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </AuthLogin>
        </main>
    )
}

const CheckDuty: React.FC<{ checked?: boolean }> = ({ checked = true }) => {
    const [enabled, setEnabled] = useState(checked)

    return (
        <Switch
            checked={enabled}
            onChange={setEnabled}
            className={classNames(
                enabled ? 'bg-blue-600' : 'bg-gray-200',
                'relative inline-flex h-6 w-11 items-center rounded-full transition-all'
            )}
        >
            <span className='sr-only'>Enable notifications</span>
            <span
                className={`${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transition-all rounded-full bg-white`}
            />
        </Switch>
    )
}

const CheckPerson: React.FC<{
    dutyId: string
    netid: string
    name: string
    credits: number
}> = ({ dutyId, netid, name, credits: initCredits }) => {
    const firstName = name.split(' ')[0]
    let status = ''

    const [credits, setCredits] = useState(initCredits)
    const [loading, setLoading] = useState(false)

    if (credits === 1) status = 'complete'
    else if (credits === 0) status = 'missing'
    else status = 'custom'

    const updateCredits = async (credits: number) => {
        setLoading(true)

        try {
            await updateUserDutyCredits(dutyId, netid, credits)
            setCredits(credits)
        } catch (err) {
            alert(`Error updating ${firstName}'s credits.`)
        } finally {
            setLoading(false)
        }
    }

    const markComplete = () => {
        if (
            credits === 1 ||
            !confirm(
                `Check off ${firstName}'s duty? (${firstName} will receive 1 credit)`
            )
        )
            return

        updateCredits(1)
    }

    const markMissing = () => {
        if (
            credits === 0 ||
            !confirm(
                `Are you sure you would like to mark ${firstName} as missing?\n(${firstName} will receive 0 credits)`
            )
        )
            return

        updateCredits(0)
    }

    const markCustom = () => {
        let creditsStr = prompt(
            `How many credits would you like to give ${firstName}?`
        )?.trim()

        if (!creditsStr) return

        const creditsNum = Number(creditsStr)

        if (isNaN(creditsNum))
            alert(
                'Invalid credit amount. Enter a whole number or decimal (no fractions).'
            )

        updateCredits(creditsNum)
    }

    return (
        <div
            // className='w-full flex items-center justify-between'
            className='w-full grid grid-cols-3'
        >
            <p className='text-lg w-[170px] place-self-center self-center'>
                {name}
            </p>

            {!loading && (
                <p className='text-lg place-self-center self-center'>
                    {credits} Credit(s)
                </p>
            )}

            {loading && (
                <div className='place-self-center flex gap-2 items-center justify-center self-center'>
                    <TailSpin color='#3498db' width={20} height={20} />
                    <p className='text-lg place-self-center'>Credit(s)</p>
                </div>
            )}

            <div className='flex gap-[6px] place-self-end self-center'>
                <HiOutlineCheck
                    onClick={markComplete}
                    className={classNames(
                        'cursor-pointer w-7 h-7 hover:text-green-600',
                        status === 'complete'
                            ? 'text-green-600'
                            : 'text-green-300'
                    )}
                />
                <HiOutlineX
                    onClick={markMissing}
                    className={classNames(
                        'cursor-pointer w-7 h-7 hover:text-red-600 transition-all',
                        status === 'missing' ? 'text-red-600' : 'text-red-300'
                    )}
                />
                <HiPencil
                    onClick={markCustom}
                    className={classNames(
                        'cursor-pointer w-7 h-7 hover:text-blue-600',
                        status === 'custom' ? 'text-blue-600' : 'text-blue-300'
                    )}
                />
            </div>
        </div>
    )
}

export default CheckDutiesPage

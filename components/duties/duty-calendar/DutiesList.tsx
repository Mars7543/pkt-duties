import { MdAdd, MdEdit } from 'react-icons/md'

import { classNames } from '@lib/helpers'
import { add, eachDayOfInterval, format } from 'date-fns'
import { useContext, useState } from 'react'

import AddDutyModal from '../duty-modal/AddDutyModal'
import EditDutyModal from '../duty-modal/EditDutyModal'
import { useDutiesByDays } from '@lib/hooks'
import { DutyContext } from '@lib/context'
import { Duty } from '@lib/types'

interface DutiesListProps {
    date: Date
    className?: string
}

const DutiesList: React.FC<DutiesListProps> = ({ date, className }) => {
    const { dutyType, refreshUsers } = useContext(DutyContext)

    const startDate = date
    const endDate = add(startDate, { days: 6 })
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const [refreshToken, setRefreshToken] = useState(0)

    const {
        loading: loadingDuties,
        error: dutiesError,
        duties
    } = useDutiesByDays(dutyType, days, startDate, refreshToken)

    const [openAddModal, setOpenAddModal] = useState(false)
    const [openEditModal, setOpenEditModal] = useState(false)

    const [selectedDate, setSelectedDate] = useState<Date>(date)
    const [selectedDuties, setSelectedDuties] = useState<Duty[]>([])

    const createDuty = (day: Date) => {
        setSelectedDate(day)
        setOpenAddModal(true)
    }

    const editDuties = (dutiesIndex: number) => {
        if (duties[dutiesIndex].length === 0) return

        setSelectedDuties(duties[dutiesIndex])
        setOpenEditModal(true)
    }

    const refresh = () => {
        refreshUsers()
        setRefreshToken(refreshToken + 1)
    }

    if (loadingDuties)
        return (
            <div
                className={classNames(
                    className,
                    'flex flex-col items-center h-[376px] pb-4'
                )}
            >
                <h2 className='text-xl font-[500] text-shadow-light'>
                    Schedule for {format(startDate, 'MMMM do')} -{' '}
                    {format(endDate, 'MMMM do')}
                </h2>

                <p className='mt-5'>Loading...</p>
            </div>
        )

    if (!loadingDuties && dutiesError) {
        return (
            <div
                className={classNames(
                    className,
                    'flex flex-col items-center h-[376px] pb-4'
                )}
            >
                <h2 className='text-xl font-[500] text-shadow-light'>
                    Schedule for {format(startDate, 'MMMM do')} -{' '}
                    {format(endDate, 'MMMM do')}
                </h2>

                <p className='mt-5'>
                    Failed to load schedule. Please try again later.
                </p>
            </div>
        )
    }

    return (
        <div
            className={classNames(
                className,
                'flex flex-col items-center h-[400px] pb-4'
            )}
        >
            <h2 className='text-xl font-[500] text-shadow-light'>
                Schedule for {format(startDate, 'MMMM do')} -{' '}
                {format(endDate, 'MMMM do')}
            </h2>

            <AddDutyModal
                date={selectedDate}
                isOpen={openAddModal}
                setIsOpen={setOpenAddModal}
                refresh={refresh}
            />

            <EditDutyModal
                isOpen={openEditModal}
                setIsOpen={setOpenEditModal}
                duties={
                    selectedDuties.length === 0 ? duties[0] : selectedDuties
                }
                refresh={refresh}
            />

            <div className='w-full mt-4 overflow-y-auto h-[385px]'>
                {days.map((day, dayIdx) => {
                    const dutiesList = duties[dayIdx]

                    return (
                        <div
                            key={dayIdx}
                            className='py-3 border-b-[0.5px] border-slate-400 first:border-t-[0.5px]'
                        >
                            <div
                                // className='flex items-center justify-center gap-3'
                                className='grid grid-cols-2'
                            >
                                <h2 className='text-lg font-medium'>
                                    {format(day, 'EEEE MMM d')}
                                </h2>

                                <div className='place-self-end gap-1 flex flex-row-reverse'>
                                    <button onClick={() => createDuty(day)}>
                                        <MdAdd className='text-green-500 h-6 w-6' />
                                    </button>
                                    {dutiesList.length > 0 && (
                                        <button
                                            onClick={() => editDuties(dayIdx)}
                                        >
                                            <MdEdit className='text-blue-400 h-5 w-5' />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className='mt-3 space-y-1'>
                                {/* No Duty Assigned */}
                                {dutiesList.length === 0 && (
                                    <p className='text-sm text-center'>
                                        No Duties Assigned
                                    </p>
                                )}

                                {/* Duty Assigned */}
                                {dutiesList.map((duty, dutyIdx) => (
                                    <div
                                        key={dutyIdx}
                                        className={`grid grid-flow-col align-middle justify-items-center grid-cols-${
                                            duty.assigned.length + 1
                                        }`}
                                    >
                                        <p className='place-self-start w-[150px]'>
                                            {duty.name}
                                        </p>

                                        {Object.values(duty.assigned_names).map(
                                            (name, idx) => (
                                                <p
                                                    key={idx}
                                                    className='text-sm text-center w-[120px] place-self-end'
                                                >
                                                    {name}
                                                </p>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default DutiesList

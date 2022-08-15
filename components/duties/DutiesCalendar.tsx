import { classNames } from '@lib/helpers'
import { useState } from 'react'
import Calendar from './Calendar'
import DutiesList from './DutiesList'

interface DutiesCalendarProps {
    className?: string
}

const DutiesCalendar: React.FC<DutiesCalendarProps> = ({ className = '' }) => {
    const [date, setDate] = useState<Date>(new Date())

    return (
        <div
            className={classNames(
                'mx-auto w-[1150px] grid grid-cols-2 divide-x divide-gray-300',
                className
            )}
        >
            <Calendar setDate={setDate} className='pr-14' />
            <DutiesList date={date} className='pl-14' />
        </div>
    )
}

export default DutiesCalendar

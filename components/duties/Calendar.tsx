import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'

import { classNames } from '@lib/helpers'

import {
    add,
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isEqual,
    isToday,
    parse,
    startOfToday
} from 'date-fns'

import { useState } from 'react'
interface DutiesCalendarProps {
    setDate: (date: Date) => void
    className?: string
}

const DutiesCalendar: React.FC<DutiesCalendarProps> = ({
    setDate,
    className
}) => {
    const today = startOfToday()
    const [selectedDay, setSelectedDay] = useState<Date | number>(today)
    const [formattedMonth, setFormattedMonth] = useState(
        format(today, 'MMM-yyyy')
    )

    const month = parse(formattedMonth, 'MMM-yyyy', new Date())

    const days = eachDayOfInterval({
        start: month,
        end: endOfMonth(month)
    })

    const prevMonth = () => {
        const prevMonth = add(month, { months: -1 })
        setFormattedMonth(format(prevMonth, 'MMM-yyyy'))
    }

    const curMonth = () => {
        const curMonth = startOfToday()
        setFormattedMonth(format(curMonth, 'MMM-yyyy'))
        setSelectedDay(curMonth)
    }

    const nextMonth = () => {
        const nextMonth = add(month, { months: 1 })
        setFormattedMonth(format(nextMonth, 'MMM-yyyy'))
    }

    const selectDate = (day: Date) => {
        setSelectedDay(day)
        setDate && setDate(day)
    }

    return (
        <div className={className}>
            {/* Date Navigation */}
            <div className='flex justify-between'>
                <h2
                    className='text-xl font-[500] cursor-pointer text-shadow-light'
                    onClick={curMonth}
                >
                    {format(month, 'MMMM yyyy')}
                </h2>
                <div className='flex'>
                    <button onClick={prevMonth}>
                        <HiChevronLeft className='w-6 h-6 shadow-gray-800' />
                    </button>
                    <button onClick={nextMonth}>
                        <HiChevronRight className='w-6 h-6' />
                    </button>
                </div>
            </div>

            {/* Days Header Display */}
            <div className='grid grid-cols-7 mt-9 text-sm leading-6 text-center text-gray-500'>
                {dayLetters.map((letter, idx) => (
                    <div key={idx} className='text-shadow-light'>
                        {letter}
                    </div>
                ))}
            </div>

            {/* Month Days Display */}
            <div className='grid grid-cols-7 mt-2 text-sm text-center'>
                {days.map((day, dayIdx) => (
                    <div
                        key={dayIdx}
                        className={classNames(
                            dayIdx === 0 && colStartClasses[getDay(day)],
                            'py-2'
                        )}
                    >
                        <button
                            onClick={() => selectDate(day)}
                            className={classNames(
                                isEqual(day, selectedDay) && 'text-white',
                                isEqual(day, selectedDay) && 'box-shadow-light',
                                !isEqual(day, selectedDay) &&
                                    isToday(day) &&
                                    'text-red-500',
                                isEqual(day, selectedDay) &&
                                    isToday(day) &&
                                    'bg-red-500',
                                isEqual(day, selectedDay) &&
                                    !isToday(day) &&
                                    'bg-gray-900',
                                !isEqual(day, selectedDay) &&
                                    'hover:bg-gray-200',
                                (isEqual(day, selectedDay) || isToday(day)) &&
                                    'font-semibold',
                                'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-shadow-light'
                            )}
                        >
                            <time dateTime={format(day, 'yyyy-MM-dd')}>
                                {format(day, 'd')}
                            </time>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const colStartClasses = [
    '',
    'col-start-2',
    'col-start-3',
    'col-start-4',
    'col-start-5',
    'col-start-6',
    'col-start-7'
]

export default DutiesCalendar

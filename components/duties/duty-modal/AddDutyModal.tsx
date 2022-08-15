import React, { useState, Fragment, useContext } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { format } from 'date-fns'
import { TailSpin } from 'react-loader-spinner'
import { classNames } from '@lib/helpers'
import { User } from '@lib/types'
import toast from 'react-hot-toast'
import { createDuty } from '@lib/queries'
import AssignUsers from './AssignUsers'
import { DutyContext } from '@lib/context'

interface AddDutyModalProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    date: Date
    refresh: () => void
}

const AddDutyModal: React.FC<AddDutyModalProps> = ({
    isOpen,
    setIsOpen,
    date,
    refresh
}) => {
    const { dutyType } = useContext(DutyContext)

    const [dutyName, setDutyName] = useState('')
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])

    const [creatingDuty, setCreatingDuty] = useState(false)

    const [missingDuty, setMissingDuty] = useState(false)
    const [missingUsers, setMissingUsers] = useState(false)
    const [dutyError, setDutyError] = useState<any>()

    const closeModal = () => {
        // close modal
        setIsOpen(false)

        // reset modal props
        setDutyName('')
        setSelectedUsers([])
        setCreatingDuty(false)

        setMissingDuty(false)
        setMissingUsers(false)
        setDutyError(undefined)
    }

    const scheduleDuty = async () => {
        if (dutyName.length < 3) setMissingDuty(true)
        if (selectedUsers.length === 0) setMissingUsers(true)

        if (dutyName.length < 3 || selectedUsers.length === 0) return

        if (
            !confirm(
                `Schedule \"${dutyName}\" for ${format(
                    date,
                    'EEEE, MMM do, yyyy'
                )}?`
            )
        )
            return

        setCreatingDuty(true)

        try {
            await createDuty(dutyType, dutyName, date, selectedUsers)
            refresh()
            toast.success('Duty created succesfully!')
        } catch (err) {
            setDutyError(err)
            toast.error('Error creating duty. Try again later.')
        } finally {
            setCreatingDuty(false)
            setIsOpen(false)
        }
    }

    const onChangeDutyName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dutyName = e.target.value
        if (dutyName && missingDuty) setMissingDuty(false)
        setDutyName(dutyName)
    }

    const onDutyBlur = () =>
        setMissingDuty(dutyName.replaceAll(' ', '').length < 1)

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as='div' className='relative z-10' onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                >
                    <div className='fixed inset-0 bg-black bg-opacity-25' />
                </Transition.Child>

                <div className='fixed inset-0 overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-4'>
                        <Transition.Child
                            as={Fragment}
                            enter='ease-out duration-300'
                            enterFrom='opacity-0 scale-95'
                            enterTo='opacity-100 scale-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100 scale-100'
                            leaveTo='opacity-0 scale-95'
                        >
                            <Dialog.Panel className='w-[550px] min-h-[250px] transform rounded-md bg-white px-8 pt-7 pb-5 align-middle shadow-xl transition-all'>
                                <h2 className='text-4xl font-medium'>
                                    Schedule Duty
                                </h2>

                                {/* Date & Name */}
                                <div className='mt-5 grid grid-cols-2 gap-8'>
                                    <div className='flex flex-col gap-3'>
                                        <label
                                            htmlFor='Duty Name'
                                            className='text-xl font-medium'
                                        >
                                            Date
                                        </label>
                                        <input
                                            // className='text-md text-gray-900 border border-solid border-gray-500 rounded-md p-2 active:border-white focus:border-white'
                                            className='text-md text-gray-500 rounded-md p-2 active:border-white focus:border-white box-shadow-light'
                                            id='Duty Date'
                                            type='text'
                                            disabled={true}
                                            value={format(
                                                date,
                                                'EEEE MMM do, yyyy'
                                            )}
                                        />
                                    </div>

                                    <div className='flex flex-col gap-3'>
                                        <label
                                            htmlFor='Duty Name'
                                            className='text-xl font-medium'
                                        >
                                            Name{missingDuty && '*'}
                                        </label>
                                        <input
                                            className={classNames(
                                                'w-full text-md text-gray-900 rounded-md p-2 box-shadow-light border-none active:outline-none focus:outline-none active:ring active:ring-blue-400 focus:ring focus:ring-blue-400',
                                                missingDuty &&
                                                    'border-none outline outline-2 outline-red-500'
                                            )}
                                            id='Duty Name'
                                            type='text'
                                            placeholder='i.e. Dinner Waiter'
                                            value={dutyName}
                                            onChange={onChangeDutyName}
                                            onBlur={onDutyBlur}
                                        />
                                    </div>
                                </div>

                                {/* Assign Brothers */}
                                <div className='mt-6 grid grid-cols-2 gap-8'>
                                    <h2 className='text-xl font-medium'>
                                        Select Brothers{missingUsers && '*'}
                                    </h2>

                                    <h2 className='text-xl font-medium'>
                                        Assigned Brothers
                                    </h2>
                                </div>

                                <AssignUsers
                                    className='mt-3 grid grid-cols-2 gap-8'
                                    selectedUsers={selectedUsers}
                                    setSelectedUsers={setSelectedUsers}
                                    missingUsersError={missingUsers}
                                    setMissingUsersError={setMissingUsers}
                                />

                                {/* Schedule / Close Buttons */}
                                <div className='mt-6 w-full flex justify-end gap-2'>
                                    <button
                                        onClick={scheduleDuty}
                                        className={classNames(
                                            'px-3 py-2 w-[91px] flex justify-center rounded-md text-white transition-all',
                                            selectedUsers.length === 0 ||
                                                dutyName.length < 3
                                                ? 'bg-green-300 hover:bg-green-300 active:bg-green-300 cursor-default'
                                                : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                                        )}
                                    >
                                        {creatingDuty && (
                                            <TailSpin
                                                color='#FFFFFF'
                                                height={25}
                                                width={50}
                                            />
                                        )}
                                        {!creatingDuty && 'Schedule'}
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        className='bg-gray-400 px-3 py-2 rounded-md text-white hover:bg-gray-500 active:bg-gray-600 transition-all'
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default AddDutyModal

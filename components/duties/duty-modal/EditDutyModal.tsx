import React, { useState, Fragment, useContext, useEffect } from 'react'
import { Dialog, Transition, Listbox } from '@headlessui/react'
import { format } from 'date-fns'
import { TailSpin } from 'react-loader-spinner'
import { classNames } from '@lib/helpers'
import { Duty, User } from '@lib/types'
import toast from 'react-hot-toast'
import { deleteDuty as removeDuty, updateDuty as editDuty } from '@lib/queries'
import AssignUsers from './AssignUsers'
import { DutyContext } from '@lib/context'

import { HiSelector } from 'react-icons/hi'

interface EditDutyModalProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    duties: Duty[]
    refresh: () => void
}

const EditDutyModal: React.FC<EditDutyModalProps> = ({
    isOpen,
    setIsOpen,
    duties,
    refresh
}) => {
    const [duty, setDuty] = useState<Duty>(duties[0])
    const [date, setDate] = useState<Date>(new Date())
    const [dutyName, setDutyName] = useState<string>('')
    const [selectedUsers, setSelectedUsers] = useState<User[]>([])

    const [updatingDuty, setUpdatingDuty] = useState(false)
    const [deletingDuty, setDeletingDuty] = useState(false)

    const [missingDuty, setMissingDuty] = useState(false)
    const [missingUsers, setMissingUsers] = useState(false)
    const [dutyError, setDutyError] = useState<any>()

    useEffect(() => {
        if (!isOpen) return

        const duty = duties[0]
        setDuty(duty)
        setDate(duty.date.time.toDate())
        setDutyName(duty.name)
        setSelectedUsers(toUsers(duty.assigned_names))

        setUpdatingDuty(false)
        setDeletingDuty(false)

        setMissingDuty(false)
        setMissingUsers(false)
        setDutyError(undefined)
    }, [isOpen, duties])

    const closeModal = () => {
        setIsOpen(false)
    }

    const toUsers = (assigned: { [index: string]: string }): User[] => {
        let users: User[] = []
        Object.keys(assigned).forEach((netid) => {
            const user = { netid, name: assigned[netid] } as User
            users.push(user)
        })

        return users
    }

    const selectDuty = (duty: Duty) => {
        setDuty(duty)
        setDutyName(duty.name)
        setDate(duty.date.time.toDate())
        setSelectedUsers(toUsers(duty.assigned_names))
    }

    const onChangeDutyName = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dutyName = e.target.value
        if (dutyName && missingDuty) setMissingDuty(false)
        setDutyName(dutyName)
    }

    const onDutyBlur = () =>
        setMissingDuty(dutyName.replaceAll(' ', '').length < 1)

    const updateDuty = async () => {
        if (dutyName.length < 3) setMissingDuty(true)
        if (selectedUsers.length === 0) setMissingUsers(true)

        if (dutyName.length < 3 || selectedUsers.length === 0) return

        if (!confirm(`Confirm updates for \"${dutyName}\"?`)) return

        setUpdatingDuty(true)

        try {
            await editDuty(duty._id, duty.type, dutyName, date, selectedUsers)
            refresh()
            toast.success('Duty updated succesfully!')
        } catch (err) {
            setDutyError(err)
            toast.error('Error updating duty. Try again later.')
        } finally {
            setUpdatingDuty(false)
            setIsOpen(false)
        }
    }

    const deleteDuty = async () => {
        if (!confirm(`Are you sure you want to delete \"${dutyName}\"?`)) return

        setDeletingDuty(true)

        try {
            await removeDuty(duty._id)
            refresh()
            toast.success('Duty deleted succesfully!')
        } catch (err) {
            setDutyError(err)
            toast.error('Error deleting duty. Try again later.')
        } finally {
            setDeletingDuty(false)
            setIsOpen(false)
        }
    }

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
                            <Dialog.Panel className='relative w-[550px] min-h-[250px] transform rounded-md bg-white px-8 pt-7 pb-5 align-middle shadow-xl transition-all'>
                                <div className='w-[486px] absolute grid grid-cols-2 gap-8 z-10'>
                                    <h2 className='text-4xl font-medium text-shadow-light'>
                                        Update Duty
                                    </h2>

                                    <div>
                                        <Listbox
                                            value={duty}
                                            onChange={selectDuty}
                                        >
                                            {/* border-2 border-solid border-gray-600 */}
                                            <Listbox.Button className='w-full p-2 rounded-md box-shadow-light'>
                                                {duty ? (
                                                    <span className='text-xl flex items-center justify-between'>
                                                        {duty.name}
                                                        <HiSelector className='text-gray-500 w-[22px] h-[22px]' />
                                                    </span>
                                                ) : (
                                                    <span className='text-xl flex items-center justify-between'>
                                                        Loading...
                                                    </span>
                                                )}
                                            </Listbox.Button>
                                            <Listbox.Options className='mt-3 outline outline-gray-100 bg-white rounded-md divide-y divide-gray-300 max-h-[180px] overflow-scroll box-shadow-light'>
                                                {duties.map((duty, idx) => (
                                                    <Listbox.Option
                                                        className='text-lg h-[50px] p-2 pl-3 flex items-center justify-between cursor-pointer hover:bg-blue-400 hover:text-white transition-all first:rounded-t-md last:rounded-b-md'
                                                        key={idx}
                                                        value={duty}
                                                    >
                                                        {duty.name}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </Listbox>
                                    </div>
                                </div>

                                {/* Date & Name */}
                                <div className='mt-16 grid grid-cols-2 gap-8'>
                                    <div className='flex flex-col gap-3'>
                                        <label
                                            htmlFor='Duty Name'
                                            className='text-xl font-medium'
                                        >
                                            Date
                                        </label>
                                        <input
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

                                {/* Update / Delete / Close Buttons */}
                                <div className='mt-6 w-full flex justify-end gap-2'>
                                    <button
                                        onClick={updateDuty}
                                        className={classNames(
                                            'px-3 py-2 w-[91px] flex justify-center rounded-md text-white transition-all',
                                            selectedUsers.length === 0 ||
                                                dutyName.length < 3
                                                ? 'bg-blue-300 hover:bg-blue-300 active:bg-blue-300 cursor-default'
                                                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                                        )}
                                    >
                                        {updatingDuty && (
                                            <TailSpin
                                                color='#FFFFFF'
                                                height={25}
                                                width={50}
                                            />
                                        )}
                                        {!updatingDuty && 'Update'}
                                    </button>

                                    <button
                                        onClick={deleteDuty}
                                        className='bg-red-500 px-3 py-2 w-[91px] flex justify-center rounded-md text-white hover:bg-red-600 transition-all'
                                    >
                                        {deletingDuty && (
                                            <TailSpin
                                                color='#FFFFFF'
                                                height={25}
                                                width={50}
                                            />
                                        )}
                                        {!deletingDuty && 'Delete'}
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

export default EditDutyModal

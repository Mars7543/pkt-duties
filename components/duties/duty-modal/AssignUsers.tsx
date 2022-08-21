import { useContext, useEffect, useState } from 'react'
import { Dialog, Transition, Combobox } from '@headlessui/react'
import { User } from '@lib/types'
import { classNames } from '@lib/helpers'
import { DutyContext } from '@lib/context'
import { MdDelete } from 'react-icons/md'

interface AssignUsersProps {
    className?: string

    date: string

    selectedUsers: User[]
    setSelectedUsers: (users: User[]) => void

    missingUsersError: boolean
    setMissingUsersError: (isMissingUsers: boolean) => void
}

const AssignUsers: React.FC<AssignUsersProps> = ({
    className = '',
    date,
    selectedUsers,
    setSelectedUsers,
    missingUsersError,
    setMissingUsersError
}) => {
    const { users } = useContext(DutyContext)
    const [selectableUsers, setSelectableUsers] = useState<User[]>([])

    const filterSelectedUsers = () => {
        const unselectedUsers = users.filter((user) => {
            const isSelected =
                selectedUsers.findIndex((u) => u.netid === user.netid) >= 0
            return !isSelected
        })

        setSelectableUsers(unselectedUsers)
    }

    useEffect(filterSelectedUsers, [selectedUsers])

    const selectUser = (user: User) => {
        const dutyConflict = user.duties.find((duty) => duty.day === date)

        if (
            dutyConflict &&
            !confirm(
                `Duty conflict on ${dutyConflict.day}\n\n${user.name} has a ${dutyConflict.type} duty on this date.\nWould you still like to assign him?`
            )
        )
            return

        setSelectedUsers(selectedUsers.concat(user))
        setMissingUsersError(selectedUsers.length === 0)
    }

    const deselectUser = (user: User) => {
        setSelectedUsers(selectedUsers.filter((u) => u.netid !== user.netid))
        setMissingUsersError(selectedUsers.length === 0)
    }

    const onBlur = () => setMissingUsersError(selectedUsers.length === 0)

    return (
        <div className={className}>
            <UsersSelect
                users={selectableUsers}
                selectUser={selectUser}
                missingUsersError={missingUsersError}
                onBlur={onBlur}
            />
            <UsersDisplay users={selectedUsers} deselectUser={deselectUser} />
        </div>
    )
}

interface UserSelectProps {
    users: User[]
    selectUser: (user: User) => void
    missingUsersError: boolean
    onBlur: () => void
}

const UsersSelect: React.FC<UserSelectProps> = ({
    users,
    selectUser,
    missingUsersError,
    onBlur
}) => {
    const { dutyType } = useContext(DutyContext)

    const [selectedUser] = useState<User | undefined>(undefined)
    const [query, setQuery] = useState('')

    const filteredUsers =
        query === ''
            ? users
            : users.filter((user) =>
                  user.name.toLowerCase().includes(query.toLowerCase())
              )

    return (
        <div>
            <Combobox value={selectedUser} onChange={selectUser}>
                <Combobox.Input
                    className={classNames(
                        'w-full text-md text-gray-900 rounded-md p-2 box-shadow-light border-none active:outline-none focus:outline-none active:ring active:ring-blue-400 focus:ring focus:ring-blue-400',
                        missingUsersError &&
                            'border-none outline outline-2 outline-red-500'
                    )}
                    placeholder='Type name here...'
                    displayValue={(user: User | undefined) =>
                        user ? user.name : ''
                    }
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={onBlur}
                />
                <Transition
                    enter='transition duration-100 ease-out'
                    enterFrom='transform scale-95 opacity-0'
                    enterTo='transform scale-100 opacity-100'
                    leave='transition duration-75 ease-out'
                    leaveFrom='transform scale-100 opacity-100'
                    leaveTo='transform scale-95 opacity-0'
                >
                    <Combobox.Options className='box-shadow-light mt-3 ring-1 bg-white ring-gray-500 rounded-md divide-y divide-gray-300 max-h-[252px] w-full overflow-scroll animate-enter absolute'>
                        {filteredUsers.map((user, idx) => (
                            <Combobox.Option
                                className='h-[42px] p-3 flex items-center justify-between cursor-pointer hover:bg-blue-400 hover:text-white transition-all first:rounded-t-md last:rounded-b-md'
                                key={idx}
                                value={user}
                            >
                                <span>{user.name}</span>
                                <span>{user.credits[dutyType]}</span>
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </Transition>
            </Combobox>
        </div>
    )
}

interface UserDisplayProps {
    users: User[]
    deselectUser: (user: User) => void
}

const UsersDisplay: React.FC<UserDisplayProps> = ({ users, deselectUser }) => {
    return (
        <div
            className={`flex flex-col justify-center divide-y divide-gray-300`}
        >
            {users.length == 0 && (
                <div className='flex justify-between py-2 first:pt-0 last:pb-0'>
                    <p className='italic text-gray-500'>No Users Assigned</p>
                </div>
            )}

            {users.map((user, idx) => (
                <div
                    key={idx}
                    className='flex justify-between py-2 first:pt-0 last:pb-0'
                >
                    <p>{user.name}</p>
                    <MdDelete
                        onClick={() => deselectUser(user)}
                        className='w-[25px] h-[25px] text-red-500 hover:text-red-600 active:text-red-700 cursor-pointer'
                    />
                </div>
            ))}
        </div>
    )
}

export default AssignUsers

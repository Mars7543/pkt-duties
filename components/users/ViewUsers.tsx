import { DutyContext } from '@lib/context'
import { User, Class, UsersInClass } from '@lib/types'
import Link from 'next/link'
import { useContext } from 'react'
import { isDutyExempt } from '@lib/queries'
import { classNames } from '@lib/helpers'

const ViewUsers: React.FC = () => {
    const { usersByClass } = useContext(DutyContext)

    if (!usersByClass) return <div></div>

    if (usersByClass.length === 3) {
        return (
            <div className='mt-6 flex gap-8 justify-evenly'>
                {usersByClass.map(({ users, class: c }) => (
                    <ClassCard key={`${c.index}`} class={c} users={users} />
                ))}
            </div>
        )
    } else if (usersByClass.length === 4) {
        return (
            <div className='mt-8 flex flex-wrap gap-12 justify-evenly'>
                <div className='flex gap-14'>
                    {usersByClass.slice(0, 2).map(({ users, class: c }) => (
                        <ClassCard key={c.index} class={c} users={users} />
                    ))}
                </div>
                <div className='flex gap-14'>
                    {usersByClass.slice(2).map(({ users, class: c }) => (
                        <ClassCard key={c.index} class={c} users={users} />
                    ))}
                </div>
            </div>
        )
    } else return <></>
}

const ClassCard: React.FC<{
    class: Class
    users: User[]
}> = ({ class: c, users }) => {
    const { dutyType } = useContext(DutyContext)
    const cName = c.fallClass ? `Fall ${c.class}` : c.class
    return (
        <div className=' w-[400px] max-h-[500px] overflow-scroll bg-white flex flex-col items-center py-4 px-[55px] box-shadow-light'>
            <h1 className='text-3xl'>{cName}</h1>
            <div className='mt-4 w-full flex justify-between text-2xl font-bold pb-2 border-b border-gray-600 border-solid'>
                <p>Name</p>
                <p>Credits</p>
            </div>
            <div className='mt-4 flex flex-col w-full'>
                {users.map((user) => (
                    <Link
                        key={user.name}
                        href={`/duties/${user.netid}`}
                        passHref
                    >
                        <a
                            className={classNames(
                                'flex w-full justify-between text-xl cursor-pointer p-[10px] first:pt-0 last:pb-0',
                                isDutyExempt(user, dutyType) && 'bg-yellow-400'
                            )}
                        >
                            <p>{user.name}</p>
                            <p>{user.credits[dutyType]}</p>
                        </a>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default ViewUsers

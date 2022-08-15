import { DutyContext } from '@lib/context'
import { User, Class, UsersInClass } from '@lib/types'
import Link from 'next/link'
import { useContext } from 'react'

const ViewUsers: React.FC = () => {
    const { usersByClass } = useContext(DutyContext)

    if (!usersByClass) return <div></div>

    if (usersByClass.length === 3) {
        return (
            <div className='mt-6 flex gap-8 justify-center'>
                {usersByClass.map(({ users, class: c }) => (
                    <ClassCard key={`${c.index}`} class={c} users={users} />
                ))}
            </div>
        )
    } else if (usersByClass.length === 4) {
        return (
            <div className='mt-8 flex flex-wrap gap-12 justify-center'>
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
        <div className=' md:w-[275px] xl:w-[430px] bg-white flex flex-col items-center py-4 px-[55px] box-shadow-light'>
            <h1 className='text-3xl'>{cName}</h1>
            <div className='mt-4 w-full flex justify-between text-2xl font-bold pb-2 border-b border-gray-600 border-solid'>
                <p>Name</p>
                <p>Credits</p>
            </div>
            <div className='mt-4 flex flex-col w-full gap-2'>
                {users.map(({ netid, name, credits }) => (
                    <Link href={`/duties/${netid}`} passHref>
                        <a
                            key={name}
                            className='flex w-full justify-between text-xl cursor-pointer'
                        >
                            <p>{name}</p>
                            <p>{credits[dutyType]}</p>
                        </a>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default ViewUsers

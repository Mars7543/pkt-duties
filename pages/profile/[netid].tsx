import AuthLogin from '@components/auth/AuthLogin'
import { getAllNetids, getUserByNetid } from '@lib/queries'
import { User } from '@lib/types'
import { GetStaticPaths, GetStaticPropsContext } from 'next'
import toast from 'react-hot-toast'

export const getStaticPaths: GetStaticPaths = async () => {
    try {
        const netids = await getAllNetids()
        const paths = netids.map((netid) => ({ params: { netid } }))

        return {
            paths,
            fallback: true
        }
    } catch (err) {
        return {
            paths: [],
            fallback: 'blocking'
        }
    }
}

export const getStaticProps = async (context: GetStaticPropsContext) => {
    const { netid } = context.params as { netid: string }

    try {
        const user = await getUserByNetid(netid)
        if (!user) return { notFound: true }

        return {
            props: { user }
        }
    } catch (err) {
        return {
            props: { user: null, error: err }
        }
    }
}

const UserProfile: React.FC<{ user: User; error?: any }> = ({
    user,
    error
}) => {
    console.log(user)

    if (!user || error)
        return (
            <main>
                {toast.error(
                    'Error fetching profile info for user. Please try again later.'
                )}
                <h1>Server Error</h1>
            </main>
        )
    return (
        <AuthLogin netid={user.netid}>
            <main>
                <div className='text-4xl title-card-lg'>
                    <h1>User Info - {user.name}</h1>
                </div>
            </main>
        </AuthLogin>
    )
}

export default UserProfile

import type { NextPage } from 'next'

import AuthLogin from '@components/auth/AuthLogin'

const Home: NextPage = () => {
    return (
        <main>
            <AuthLogin>
                <h1>Home</h1>
            </AuthLogin>
        </main>
    )
}

export default Home

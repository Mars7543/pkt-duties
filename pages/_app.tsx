import '../styles/globals.scss'
import type { AppProps } from 'next/app'

import Header from '@components/layout/Header'
import Footer from '@components/layout/Footer'

import { UserContext } from '@lib/context'
import { useUserData } from '@lib/hooks'

function MyApp({ Component, pageProps }: AppProps) {
    const userData = useUserData()

    return (
        <UserContext.Provider value={userData}>
            <div className='page'>
                <Header />
                <Component {...pageProps} />
                <Footer />
            </div>
        </UserContext.Provider>
    )
}

export default MyApp

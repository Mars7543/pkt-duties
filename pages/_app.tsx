import '../styles/globals.scss'
import type { AppProps } from 'next/app'

import Navbar from '@components/layout/Navbar'
import Footer from '@components/layout/Footer'

import { Toaster } from 'react-hot-toast'

import { UserContext } from '@lib/context'
import { useUserData } from '@lib/hooks'

function MyApp({ Component, pageProps }: AppProps) {
    const userData = useUserData()

    return (
        <UserContext.Provider value={userData}>
            <div className='page'>
                <Navbar />
                <Component {...pageProps} />
                <Footer />
                <Toaster />
            </div>
        </UserContext.Provider>
    )
}

export default MyApp

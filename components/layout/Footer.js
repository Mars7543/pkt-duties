import Link from 'next/link'

const Footer = () => {
    return (
        <footer className='flex shrink-0 justify-between items-center px-4 w-full h-16 bg-primary'>
            {/* Left Side */}
            <div className='flex text-white'>
                <p>Phi Kappa Tau - Cornell University</p>
            </div>

            {/* Middle */}
            <div className='flex text-white'>
                <p>PKT Apps &copy; 2022</p>
            </div>

            {/* Right Side */}
            <div className='flex flex-col items-center text-gray-200'>
                <Link href='mailto:mar436@cornell.edu' passHref={true}>
                    <a
                        className='transition-all hover:text-gray-300'
                        target='_blank'
                    >
                        Miguel Roberts
                    </a>
                </Link>
                <Link href='mailto:vcs25@cornell.edu' passHref={true}>
                    <a
                        className='transition-all hover:text-gray-300'
                        target='_blank'
                    >
                        Victoria Stephens
                    </a>
                </Link>
            </div>
        </footer>
    )
}

export default Footer

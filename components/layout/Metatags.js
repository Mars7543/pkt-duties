import Head from 'next/head'

const Metatags = ({
    title = 'PKT Apps',
    description = 'Apps developed for Phi Kappa Tau',
    image = '/PKT_COA.png'
}) => {
    return (
        <Head>
            <title>{title}</title>
            <meta
                name='viewport'
                content='width=device-width, initial-scale=1.0'
            />
            <meta property='og:title' content={title} />
            <meta property='og:description' content={description} />
            <meta property='og:image' content={image} />
        </Head>
    )
}

export default Metatags

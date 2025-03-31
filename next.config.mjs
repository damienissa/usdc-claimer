/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        PRIVATE_KEY: process.env.PRIVATE_KEY,
        PUBLIC_KEY: process.env.PUBLIC_KEY,
        MINT: process.env.MINT,
        CLUSTER: process.env.CLUSTER,
    }
}

export default nextConfig

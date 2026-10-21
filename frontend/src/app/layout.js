import {Poppins, Inter} from "next/font/google"
import Script from "next/script"
const poppins = Poppins({ subsets: ["latin"],weight: ["400", "500", "600", "700"],preload: true })
const inter = Inter({ subsets: ["latin"] })

export default function Layout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>Study Mate - AI Study Assistant</title>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="description" content="Study Mate is an AI-powered study assistant that helps you generate prompts, summaries, and study plans for your learning needs." />
                <Script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" />
            </head>
            <body className={`${poppins.className} ${inter.className} h-antialiased`}>
                {children}
            </body>
        </html>
    )
}


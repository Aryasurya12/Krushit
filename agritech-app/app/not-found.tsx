'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
            >
                <div className="text-8xl sm:text-9xl font-bold text-gradient-agri mb-4">404</div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4">Page Not Found</h1>
                <p className="text-dark-400 mb-8 max-w-md mx-auto">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/dashboard-farmer">
                        <button className="btn-primary">
                            Go to Dashboard
                        </button>
                    </Link>
                    <Link href="/">
                        <button className="btn-outline">
                            Go to Home
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

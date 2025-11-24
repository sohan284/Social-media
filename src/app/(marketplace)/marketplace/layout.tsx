import React from 'react'
import MarketPlaceLayout from '../../../../components/Layouts/MarketPlaceLayout'

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <MarketPlaceLayout>
                {children}
            </MarketPlaceLayout>
        </div>
    )
}

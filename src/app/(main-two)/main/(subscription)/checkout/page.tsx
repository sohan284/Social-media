
import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import CheckoutForm from '../../../../../../components/Features/Subscription/CheckoutForm'

export default function CheckoutPage() {

    return (
        <div className = "lg:mt-56 px-4">
            <CheckoutForm />
        </div>
    )
}

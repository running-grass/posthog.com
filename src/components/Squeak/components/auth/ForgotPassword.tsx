import React, { useState } from 'react'
import { Field, Form, Formik } from 'formik'
import { post } from '../../lib/api'

type ForgotPasswordProps = {
    apiHost: string
    setMessage: (message: any) => void
    setParentView?: (view: string) => void
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ setMessage, setParentView, apiHost }) => {
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (values: any) => {
        setLoading(true)

        const body = {
            email: values.email,
        }

        const { error } = await fetch(`${process.env.GATSBY_SQUEAK_API_HOST}/api/auth/forgot-password`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json',
            },
        }).then((res) => res.json())

        if (error) {
            setMessage(error?.message)
        } else {
            setEmailSent(true)
        }

        setLoading(false)
    }

    return (
        <Formik
            validateOnMount
            initialValues={{
                email: '',
            }}
            validate={(values) => {
                const errors: any = {}
                if (!values.email) {
                    errors.email = 'Required'
                }
                return errors
            }}
            onSubmit={handleSubmit}
        >
            {({ isValid }) => {
                return (
                    <Form>
                        <label htmlFor="email">Email address</label>
                        <Field required id="email" name="email" type="email" placeholder="Email address..." />
                        {emailSent ? (
                            <div>
                                <p>Check your email for password reset instructions</p>
                            </div>
                        ) : (
                            <button style={loading || !isValid ? { opacity: '.5' } : {}} type="submit">
                                Send password reset instructions
                            </button>
                        )}
                    </Form>
                )
            }}
        </Formik>
    )
}

export default ForgotPassword

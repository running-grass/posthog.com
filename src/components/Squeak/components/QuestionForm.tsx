import React, { useState, useRef } from 'react'
import { Field, Form, Formik } from 'formik'
import root from 'react-shadow/styled-components'
import { post } from '../lib/api'
import { useUser } from 'hooks/useUser'
import { useQuestion } from '../hooks/useQuestion'

import { Approval } from './Approval'
import Authentication from './Authentication'
import Avatar from './Avatar'
import Logo from './Logo'
import RichText from './RichText'
import { Theme } from './Theme'
import ErrorBoundary from './ErrorBoundary'

type QuestionFormMainProps = {
    title?: string
    // TODO: Add type for onSubmit
    onSubmit: any
    subject: boolean
    loading: boolean
    initialValues: any
    formType?: string
}

function QuestionFormMain({
    title,
    onSubmit,
    subject = true,
    loading,
    initialValues,
    formType,
}: QuestionFormMainProps) {
    const { user, logout } = useUser()
    const handleSubmit = async (values: any) => {
        onSubmit &&
            (await onSubmit(
                {
                    ...values,
                    email: user?.email,
                    firstName: user?.profile?.first_name,
                    lastName: user?.profile?.last_name,
                },
                formType
            ))
    }
    return (
        <div className="squeak-form-frame">
            {title && <h2>{title}</h2>}
            <Formik
                initialValues={{
                    subject: '',
                    question: '',
                    ...initialValues,
                }}
                validate={(values) => {
                    const errors: any = {}
                    if (!values.question) {
                        errors.question = 'Required'
                    }
                    if (subject && !values.subject) {
                        errors.subject = 'Required'
                    }
                    return errors
                }}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue, isValid }) => {
                    return (
                        <Form className="squeak-form">
                            <Avatar url={user?.profile} image={user?.profile?.avatar} />

                            <div className="">
                                <div className="squeak-inputs-wrapper">
                                    {subject && (
                                        <>
                                            <Field
                                                required
                                                id="subject"
                                                name="subject"
                                                placeholder="Title"
                                                maxLength="140"
                                            />
                                            <hr />
                                        </>
                                    )}
                                    <div className="squeak-form-richtext">
                                        <RichText
                                            setFieldValue={setFieldValue}
                                            initialValue={initialValues?.question}
                                        />
                                    </div>
                                </div>
                                <span className="squeak-reply-buttons-row">
                                    <button
                                        className="squeak-post-button"
                                        style={loading || !isValid ? { opacity: '.5' } : {}}
                                        disabled={loading || !isValid}
                                        type="submit"
                                    >
                                        {user ? 'Post' : 'Login & post'}
                                    </button>
                                    <div className="squeak-by-line">
                                        by
                                        <a href="https://squeak.posthog.com?utm_source=post-form">
                                            <Logo />
                                        </a>
                                    </div>
                                </span>
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </div>
    )
}

type QuestionFormProps = {
    formType: string
    questionId?: number
    reply: (body: string) => Promise<void>
    onSubmit?: (values: any, formType: string) => void
    onSignUp?: () => void
    initialView?: string
}

export const QuestionForm = ({
    formType = 'question',
    questionId,
    initialView,
    reply,
    onSubmit,
    onSignUp,
}: QuestionFormProps) => {
    const { user, logout } = useUser()
    const [formValues, setFormValues] = useState(null)
    const [view, setView] = useState<string | null>(initialView || null)
    const [loading, setLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const buttonText =
        formType === 'question' ? (
            <span>Ask a question</span>
        ) : (
            <span className="squeak-reply-label">
                <strong>Reply</strong> to question
            </span>
        )

    const insertMessage = async ({ subject, body, userID }: any) => {
        // @ts-ignore
        const { data } = await post(apiHost, '/api/question', {
            subject,
            body,
            organizationId,
            slug: window.location.pathname.replace(/\/$/, ''),
        })
        return data
    }

    const handleMessageSubmit = async (values: any) => {
        setLoading(true)
        const userID = user?.id
        if (userID) {
            let view: any = null
            if (formType === 'question') {
                const { published: messagePublished } = await insertMessage({
                    subject: values.subject,
                    body: values.question,
                })
                if (!messagePublished) {
                    view = 'approval'
                }
            }

            if (formType === 'reply' && questionId) {
                reply(values.question)

                /*if (!data.published) {
                    view = 'approval'
                }*/
            }

            if (onSubmit) {
                onSubmit(values, formType)
            }
            setLoading(false)
            setView(view)
            setFormValues(null)
        } else {
            setFormValues(values)
            setView('auth')
            setLoading(false)
        }
    }

    return (
        <ErrorBoundary>
            {/* @ts-ignore */}
            <root.div ref={containerRef}>
                <Theme containerRef={containerRef} />
                <div className="squeak">
                    {view ? (
                        {
                            'question-form': (
                                <QuestionFormMain
                                    subject={formType === 'question'}
                                    initialValues={formValues}
                                    loading={loading}
                                    onSubmit={handleMessageSubmit}
                                />
                            ),
                            auth: (
                                <Authentication
                                    buttonText={{
                                        login: 'Login & post question',
                                        signUp: 'Sign up & post question',
                                    }}
                                    setParentView={setView}
                                    formValues={formValues}
                                    handleMessageSubmit={handleMessageSubmit}
                                    onSignUp={onSignUp}
                                />
                            ),
                            login: (
                                <Authentication
                                    setParentView={setView}
                                    formValues={formValues}
                                    handleMessageSubmit={() => setView(null)}
                                    onSignUp={onSignUp}
                                />
                            ),
                            approval: <Approval handleConfirm={() => setView(null)} />,
                        }[view]
                    ) : (
                        <div className="squeak-reply-buttons">
                            <Avatar url={user?.profile} image={user?.profile?.avatar} />
                            <button
                                className={formType === 'reply' ? 'squeak-reply-skeleton' : 'squeak-ask-button'}
                                onClick={() => setView('question-form')}
                            >
                                {buttonText}
                            </button>
                            {formType === 'question' && (
                                <button
                                    onClick={() => {
                                        if (user) {
                                            logout()
                                        } else {
                                            setView('login')
                                        }
                                    }}
                                    className="squeak-auth-button"
                                >
                                    {user ? 'Logout' : 'Login'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </root.div>
        </ErrorBoundary>
    )
}

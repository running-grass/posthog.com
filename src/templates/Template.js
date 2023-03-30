import { MDXProvider } from '@mdx-js/react'
import Breadcrumbs from 'components/Breadcrumbs'
import FooterCTA from 'components/FooterCTA'
import { RightArrow } from 'components/Icons/Icons'
import Layout from 'components/Layout'
import Link from 'components/Link'
import { Section } from 'components/Section'
import { SEO } from 'components/seo'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import { graphql } from 'gatsby'
import React from 'react'
import { shortcodes } from '../mdxGlobalComponents'
import SectionLinks from 'components/SectionLinks'

export default function Template({ data, pageContext: { next, previous } }) {
    const { pageData } = data
    const {
        body,
        excerpt,
        fields: { slug },
    } = pageData
    const { title, subtitle, featuredImage, description } = pageData?.frontmatter

    // we don't use the next, previous section links but we should?
    // depending on what we do with the sidebar

    return (
        <Layout>
            <SEO
                image={`/images/templates/${slug.split('/')[2]}.png`}
                title={`${title} - PostHog`}
                description={description || excerpt}
            />
            <Breadcrumbs
                crumbs={[{ title: 'Templates', url: '/templates' }, { title }]}
                darkModeToggle
                className="px-4 mt-4 sticky top-0 z-10 bg-tan dark:bg-primary"
            />
            <div
                style={{ gridAutoColumns: 'minmax(max-content, 1fr) minmax(auto, 880px) 1fr' }}
                className="mt-10 w-full relative lg:grid lg:grid-flow-col lg:gap-12 items-start"
            >
                <section>
                    <div className="lg:max-w-[880px] lg:pr-5 px-5 lg:px-0 mx-auto">
                        <h1 className="text-center mt-0 mb-12 hidden lg:block">{title}</h1>
                        <h2 className="text-center mt-0 mb-6">{subtitle}</h2>
                        <GatsbyImage image={getImage(featuredImage)} alt="" />
                        <article>
                            <MDXProvider components={{ ...shortcodes, Section }}>
                                <MDXRenderer>{body}</MDXRenderer>
                            </MDXProvider>
                        </article>
                        <div className="mt-12">
                            <SectionLinks next={next} previous={previous} />
                        </div>
                        <FooterCTA />
                    </div>
                </section>
            </div>
        </Layout>
    )
}

export const query = graphql`
    query Template($id: String!) {
        pageData: mdx(id: { eq: $id }) {
            body
            excerpt(pruneLength: 150)
            fields {
                slug
            }
            frontmatter {
                title
                subtitle
                description
                featuredImage {
                    childImageSharp {
                        gatsbyImageData
                    }
                }
            }
        }
    }
`
import React from 'react';
import { graphql } from 'gatsby';

import { withPage } from '../components/Page';
import Title from '../components/Title';
import Paragraph from '../components/Paragraph';
import Settings from '../components/Settings';
import Footer from '../components/Footer';
import Links from '../components/Links';

import { useI18N } from '../utils/i18N';
import { useTheme } from '../utils/theming';


function Post(props) {
  const data = props.data;

  return (
    <>
      <div style={{ position: 'relative', paddingRight: '40px' }}>
        <Title text={data[useI18N().currentLang].frontmatter.title} />
        <Paragraph>{data[useI18N().currentLang].frontmatter.subtitle}</Paragraph>
        <Settings />
      </div>
      <div className={useTheme().currentStyle.divider} />
      <div style={{ marginTop: '20px' }}>
        <article dangerouslySetInnerHTML={{ __html: data[useI18N().currentLang].html }} />
      </div>
      <Links links={props.links} />
      <Footer />
    </>
  );
}

function PostDataProvider(props) {
  // contents with different languages.
  const data = props.data.allMarkdownRemark.nodes.reduce((prev, cur) => {
    const lang = (() => { 
      const matches = /_(.+)\./.exec(cur.parent.relativePath);
      if (!matches) {
        return 'en';
      }
      return matches[1];
    })();

    return {
      ...prev,
      [lang]: cur
    }
  }, {});

  return <Post data={data} links={props.pageContext.links} />
}

export default withPage(React.memo(PostDataProvider));

export const pageQuery = graphql`
  query PostById($ids: [String]!) {
    allMarkdownRemark(
      filter: { id: { in: $ids } }
    ) {
      nodes {
        id
        html
        frontmatter {
          title
          subtitle
        }
        parent {
          ... on File {
            relativePath
          }
        }
      }
    }
  }
`;
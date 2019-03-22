module.exports.createPages = async ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions;

  const data = await graphql(`
    query {
      allMarkdownRemark(
        sort: { fields: [frontmatter___title], order:DESC }
      ) {
        nodes {
          id
          frontmatter {
            title
          }
          parent {
            ... on File {
              relativePath
            }        
          }
        }
      }
    }
  `);
  const posts = data.data.allMarkdownRemark.nodes.reduce((prev, cur) => {
    const filename = cur.parent.relativePath.replace(/\..*$/, '');
    const indexOfLodash = filename.indexOf('_');
    const slug = filename.substr(0, indexOfLodash === -1 ? undefined : indexOfLodash);
    const lang = indexOfLodash === -1 ? 'en' : filename.substr(indexOfLodash + 1);

    if (!prev[slug]) {
      prev[slug] = [];
    }

    prev[slug].push({
      post: cur,
      lang,
    });

    return prev;
  }, {});

  function makeContext(slug) {
    const post = posts[slug];
    const links = Object.keys(posts)
      .filter(key => key !== slug && key !== 'index')
      .map(key => ({
        slug: key,
        titles: posts[key].reduce((prev, cur) => ({
          ...prev,
          [cur.lang]: cur.post.frontmatter.title
        }), {})
      }));
    
    if (slug !== 'index') {
      links.unshift({
        slug: '/',
        titles: {
          en: 'About Me',
          zh: '关于我'
        }
      });
    }

    return {
      ids: post.map(p => p.post.id),
      slug,
      links
    };
  }

  for (const slug in posts) {
    createPage({
      path: slug === 'index' ? '/' : slug,
      component: require.resolve('./src/templates/Post.js'),
      context: makeContext(slug)
    });
  }

  createRedirect({
    fromPath: '/index',
    toPath: '/',
    redirectInBrowser: true,
  });
};

module.exports.onCreatePage = ({ page, actions }) => {
  console.log(page);
};

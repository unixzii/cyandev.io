module.exports = {
  siteMetadata: {
    title: 'Cyandev'
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/pages`,
        name: "markdown-pages",
      },
    },
    'gatsby-transformer-remark'
  ]
};
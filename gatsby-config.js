module.exports = {
  siteMetadata: {
    title: 'Cyandev'
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/pages`,
        name: 'markdown-pages',
      },
    },
    'gatsby-transformer-remark',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Cyandev',
        short_name: 'Cyandev',
        start_url: '/',
        display: 'standalone',
        crossOrigin: 'use-credentials'
      }
    },
    {
      resolve: 'gatsby-plugin-offline',
      options: {
        runtimeCaching: [
          {
            urlPattern: /(\.js$|\.css$)/,
            handler: 'cacheFirst'
          },
          {
            urlPattern: /^https?:.*\.(png|jpg|jpeg|webp|svg|gif|tiff|js|woff|woff2|json|css)$/,
            handler: 'staleWhileRevalidate',
          },
          {
            urlPattern: /fonts\.googleapis\.com\/css/,
            handler: 'staleWhileRevalidate'
          },
        ],
      }
    }
  ]
};
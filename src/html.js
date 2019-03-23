import React from 'react';
import PropTypes from 'prop-types';

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
        />
        <link href="https://unpkg.com/reset-css@4.0.1/reset.css" rel="stylesheet" />
        <link id="linkInsertAnchor" href="/common.css" rel="stylesheet" />
        {props.headComponents}
      </head>
      <body style={{ display: 'none' }} {...props.bodyAttributes}>
        {props.preBodyComponents}
        <noscript key="noscript" id="gatsby-noscript">
          This app works best with JavaScript enabled.
        </noscript>
        <div
          key={`body`}
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              function unhideContents() {
                document.body.style.display = '';
              }

              const linkAnchor = document.head.querySelector('link');

              function loadCSS(href) {
                const anchor = document.querySelector('#linkInsertAnchor');
                const el = document.createElement('link');
                el.rel = 'stylesheet';
                el.href = href;
                document.head.insertBefore(el, anchor);
              }

              loadCSS('https://fonts.googleapis.com/css?family=Martel:400,800|Ubuntu:500,700');
              loadCSS('https://use.fontawesome.com/releases/v5.8.0/css/all.css');

              const timerId = setTimeout(unhideContents, 1000);
              document.addEventListener('DOMContentLoaded', function () {
                clearTimeout(timerId);
                unhideContents();
              });
            })();
          `
        }} />
        {props.postBodyComponents}
      </body>
    </html>
  )
}

HTML.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array,
}

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
(module.exports = {
  title: 'System.conf',
  tagline: 'My Technology Blog - Enthusiast all thing to build a larger system',
  url: 'https://scila1996.github.io',
  baseUrl: '/system.conf/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  // favicon: 'https://github.com/kubernetes/community/raw/master/icons/png/control_plane_components/labeled/api-128.png',
  organizationName: 'scila1996', // Usually your GitHub org/user name.
  projectName: 'system.conf', // Usually your repo name.

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/facebook/docusaurus/edit/main/website/',
        },
        blog: {
          blogSidebarCount: 0,
          showReadingTime: true,
          // routeBasePath: '/',
          // Please change this to your repo.
          editUrl:
            'https://github.com/scila1996/system.conf/posts',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'System.conf',
        logo: {
          alt: 'My config',
          src: 'https://vmware.github.io/images/vmw_oss.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Tutorial',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/scila1996/system.conf',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [],
        copyright: `This page is powered by Docusaurus`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
});

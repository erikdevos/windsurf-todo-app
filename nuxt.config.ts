// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // Disable server-side rendering for GitHub Pages
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/windsurf-todo-app/' : '/',
    buildAssetsDir: 'assets',
    head: {
      title: 'Todo App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A simple and elegant todo application built with Nuxt.js' }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
          integrity: 'sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL',
          crossorigin: 'anonymous'
        }
      ]
    }
  },
  nitro: {
    compatibilityDate: '2025-09-19',
    prerender: {
      crawlLinks: true,
      routes: ['/']
    },
    static: true // Enable static site generation
  },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    'bootstrap-icons/font/bootstrap-icons.css',
    '~/assets/css/main.css'
  ]
})
